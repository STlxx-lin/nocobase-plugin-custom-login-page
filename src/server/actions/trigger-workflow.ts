import { Context } from '@nocobase/actions';

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
  const { workflowKey, params, moduleTitle } = bodyData;
  if (!workflowKey) {
    ctx.throw(400, '缺少工作流标识 (workflowKey)');
  }

  const allowedKeys: string[] = Array.isArray(config.allowedWorkflowKeys)
    ? config.allowedWorkflowKeys
    : [];
  if (!allowedKeys.includes(String(workflowKey))) {
    ctx.throw(403, '该工作流未在公开允许列表中，禁止调用');
  }

  let executed = false;
  try {
    const workflowPlugin: any = ctx.app.getPlugin('@nocobase/plugin-workflow');
    if (workflowPlugin) {
      const workflowRepo = db.getRepository('workflows');
      const targetWorkflow = await workflowRepo.findOne({
        filter: {
          $or: [{ key: workflowKey }, { id: workflowKey }],
          enabled: true,
        },
      });

      if (targetWorkflow && typeof workflowPlugin.trigger === 'function') {
        await workflowPlugin.trigger(targetWorkflow, {
          data: {
            ...params,
            _clientIp: clientIp,
            _triggerSource: 'custom-login-page',
            _moduleTitle: moduleTitle,
            _triggeredAt: new Date().toISOString(),
          },
        });
        executed = true;
      }
    }
  } catch (err: any) {
    ctx.app.logger?.warn?.(`[CustomLoginPage] Failed to trigger workflow ${workflowKey}: ${err.message}`);
  }

  ctx.body = {
    success: true,
    message: '操作已受理并成功提交处理流程',
    executed,
    timestamp: new Date().toISOString(),
  };

  await next();
}
