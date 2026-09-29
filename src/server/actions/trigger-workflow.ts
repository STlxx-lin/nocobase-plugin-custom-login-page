import type { Context } from '@nocobase/actions';
import { randomUUID } from 'crypto';
import { verifyCaptcha } from './captcha';

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeWorkflowParams(val: any, depth = 0, maxDepth = 5): any {
  if (depth > maxDepth || val == null) return null;
  if (typeof val === 'string') {
    return val.length > 10000 ? val.slice(0, 10000) : val;
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.slice(0, 200).map((item) => sanitizeWorkflowParams(item, depth + 1, maxDepth));
  }
  if (typeof val === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (DANGEROUS_KEYS.has(k)) continue;
      clean[k] = sanitizeWorkflowParams(v, depth + 1, maxDepth);
    }
    return clean;
  }
  return null;
}

// 带有自动过期清理（TTL GC）与容量保护的安全内存限流器
class RateLimiter {
  private cache = new Map<string, number[]>();
  private lastCleanup = Date.now();
  private readonly windowMs = 60000;
  private readonly maxCapacity = 10000;

  private cleanup(now: number) {
    // 超过 1 分钟或容量过大时主动触发清理
    if (now - this.lastCleanup < this.windowMs && this.cache.size < this.maxCapacity) {
      return;
    }
    this.lastCleanup = now;
    for (const [ip, list] of this.cache.entries()) {
      const active = list.filter((t) => now - t < this.windowMs);
      if (active.length === 0) {
        this.cache.delete(ip);
      } else {
        this.cache.set(ip, active);
      }
    }
    // 极端攻击兜底：若依然超量，清空最老记录
    if (this.cache.size > this.maxCapacity) {
      this.cache.clear();
    }
  }

  public isAllowed(clientIp: string, limit: number, now: number): boolean {
    this.cleanup(now);
    const existing = this.cache.get(clientIp) || [];
    const active = existing.filter((t) => now - t < this.windowMs);
    if (active.length >= limit) {
      return false;
    }
    active.push(now);
    this.cache.set(clientIp, active);
    return true;
  }
}

const rateLimiter = new RateLimiter();

export async function triggerWorkflowAction(ctx: Context, next: () => Promise<any>) {
  // 安全解析客户端真实 IP：优先信赖框架上下文提供的受信任客户端 IP，杜绝盲目信赖伪造头
  const clientIp = String(ctx.ip || (ctx.req && ctx.req.socket && ctx.req.socket.remoteAddress) || 'unknown');
  const now = Date.now();

  const db = ctx.db;
  const configRepo = db.getRepository('custom_login_configs');
  const config = (await configRepo.findOne({
    filter: { key: 'default' },
  })) || { allowedWorkflowKeys: [], rateLimitPerMinute: 15 };

  const limit = Number(config.rateLimitPerMinute) || 15;

  if (!rateLimiter.isAllowed(clientIp, limit, now)) {
    ctx.status = 429;
    ctx.body = {
      message: '请求过于频繁，请稍后再试（Rate limit exceeded）',
    };
    return;
  }

  const bodyData = ctx.action?.params?.values || ctx.request?.body || {};
  const { workflowKey, params, moduleTitle, captcha } = bodyData;
  if (!workflowKey) {
    ctx.throw(400, '缺少工作流标识 (workflowKey)');
  }

  // 验证码防刷检查（若客户端传入了 captcha 对象则执行严格校验）
  if (captcha && typeof captcha === 'object') {
    const { captchaId, answer, token } = captcha;
    const verifyResult = verifyCaptcha(captchaId, answer, token);
    if (!verifyResult.valid) {
      ctx.status = 400;
      ctx.body = {
        message: verifyResult.message || '验证码校验失败',
      };
      return;
    }
  }

  const allowedKeys: string[] = Array.isArray(config.allowedWorkflowKeys)
    ? config.allowedWorkflowKeys
    : [];
  if (!allowedKeys.includes(String(workflowKey))) {
    ctx.throw(403, '该工作流未在公开允许列表中，禁止调用');
  }

  if (params != null && (typeof params !== 'object' || Array.isArray(params))) {
    ctx.throw(400, 'params must be an object');
  }

  // 严格过滤原型链污染与深度超限参数
  const safeParams = sanitizeWorkflowParams(params) || {};

  const workflowPlugin: any = ctx.app.getPlugin('@nocobase/plugin-workflow');
  if (!workflowPlugin || typeof workflowPlugin.trigger !== 'function') {
    ctx.throw(503, 'Workflow service is unavailable');
  }
  const workflowRepo = db.getRepository('workflows');
  const targetWorkflow = await workflowRepo.findOne({
    filter: {
      $or: [{ key: workflowKey }, { id: workflowKey }],
      enabled: true,
    },
  });
  if (!targetWorkflow) ctx.throw(409, 'The public workflow is unavailable or disabled');

  const requestId = randomUUID();
  let triggerError: unknown;
  try {
    await workflowPlugin.trigger(targetWorkflow, {
      data: {
        ...safeParams,
        _clientIp: clientIp,
        _triggerSource: 'custom-login-page',
        _moduleTitle: moduleTitle,
        _triggeredAt: new Date().toISOString(),
        _requestId: requestId,
      },
    }, {
      eventKey: requestId,
      onTriggerFail: (_workflow, _context, _options, error) => {
        triggerError = error || new Error('Workflow trigger was rejected');
        ctx.app.logger?.warn?.(`[CustomLoginPage] Workflow request ${requestId} was rejected`);
      },
    });
    if (triggerError) throw triggerError;
  } catch (err: any) {
    ctx.app.logger?.warn?.(`[CustomLoginPage] Failed workflow request ${requestId}: ${err?.message || 'Unknown error'}`);
    ctx.throw(503, 'Workflow request could not be accepted. Please retry.');
  }

  ctx.status = 202;
  ctx.body = {
    success: true,
    accepted: true,
    status: 'accepted',
    message: '请求已提交至工作流引擎，执行结果请以后续处理为准',
    // Retained for clients of the previous API: acceptance is not execution success.
    executed: false,
    requestId,
    timestamp: new Date().toISOString(),
  };

  await next();
}
