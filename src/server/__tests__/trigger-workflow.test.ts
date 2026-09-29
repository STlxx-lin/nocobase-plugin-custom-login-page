import { describe, expect, it, vi } from 'vitest';
import { triggerWorkflowAction } from '../actions/trigger-workflow';

let ip = 0;
function setup() {
  const workflow = { id: 1, key: 'public-form', enabled: true };
  const plugin = { trigger: vi.fn().mockResolvedValue(undefined) };
  const workflows = { findOne: vi.fn().mockResolvedValue(workflow) };
  const ctx: any = {
    ip: `test-${++ip}`,
    action: { params: { values: { workflowKey: 'public-form', params: { name: 'Visitor', _requestId: 'forged' } } } },
    db: { getRepository: (name) => name === 'workflows' ? workflows : {
      findOne: async () => ({ allowedWorkflowKeys: ['public-form'], rateLimitPerMinute: 15 }),
    } },
    app: { getPlugin: vi.fn().mockReturnValue(plugin), logger: { warn: vi.fn() } },
    throw(status: number, message: string) { throw Object.assign(new Error(message), { status }); },
  };
  return { ctx, plugin, workflows };
}

describe('public workflow acceptance', () => {
  it.each(['missing-plugin', 'missing-workflow', 'exception', 'rejected'])('does not report success for %s', async (failure) => {
    const { ctx, plugin, workflows } = setup();
    if (failure === 'missing-plugin') ctx.app.getPlugin.mockReturnValue(null);
    if (failure === 'missing-workflow') workflows.findOne.mockResolvedValue(null);
    if (failure === 'exception') plugin.trigger.mockRejectedValue(new Error('offline'));
    if (failure === 'rejected') plugin.trigger.mockImplementation(async (workflow, context, options) => {
      await options.onTriggerFail(workflow, context, options, new Error('not ready'));
    });
    await expect(triggerWorkflowAction(ctx, vi.fn())).rejects.toMatchObject({ status: failure === 'missing-workflow' ? 409 : 503 });
    expect(ctx.body).toBeUndefined();
  });

  it('reports acceptance without claiming execution completion and passes a correlation id', async () => {
    const { ctx, plugin } = setup();
    await triggerWorkflowAction(ctx, vi.fn());
    expect(ctx.status).toBe(202);
    expect(ctx.body).toMatchObject({ success: true, accepted: true, executed: false, status: 'accepted' });
    expect(ctx.body.requestId).not.toBe('forged');
    expect(plugin.trigger.mock.calls[0][1].data._requestId).toBe(ctx.body.requestId);
    expect(plugin.trigger.mock.calls[0][2].eventKey).toBe(ctx.body.requestId);
  });

  it('still enforces the workflow allowlist', async () => {
    const { ctx, plugin } = setup();
    ctx.action.params.values.workflowKey = 'private-workflow';
    await expect(triggerWorkflowAction(ctx, vi.fn())).rejects.toMatchObject({ status: 403 });
    expect(plugin.trigger).not.toHaveBeenCalled();
  });

  it('rejects a non-object workflow payload', async () => {
    const { ctx } = setup();
    ctx.action.params.values.params = ['unexpected'];
    await expect(triggerWorkflowAction(ctx, vi.fn())).rejects.toMatchObject({ status: 400 });
  });

  it('filters out prototype pollution properties safely', async () => {
    const { ctx, plugin } = setup();
    ctx.action.params.values.params = {
      name: 'SafeUser',
      __proto__: { admin: true },
      constructor: { name: 'Exploit' },
      nested: {
        normal: 123,
        prototype: 'polluted',
      },
    };
    await triggerWorkflowAction(ctx, vi.fn());
    const triggeredData = plugin.trigger.mock.calls[0][1].data;
    expect(triggeredData.name).toBe('SafeUser');
    expect(triggeredData.nested.normal).toBe(123);
    expect(triggeredData.nested.prototype).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(triggeredData, '__proto__')).toBe(false);
  });
});

describe('captcha generator and verifier', () => {
  it('generates valid captcha and verifies correct answer', async () => {
    const { generateCaptcha, verifyCaptcha } = await import('../actions/captcha');
    const captcha = generateCaptcha();
    expect(captcha.captchaId).toBeTruthy();
    expect(captcha.question).toMatch(/^\d+\s\+\s\d+\s=\s\?$/);

    const [a, b] = captcha.question.replace(' = ?', '').split(' + ').map(Number);
    const rightAnswer = String(a + b);

    const result = verifyCaptcha(captcha.captchaId, rightAnswer, captcha.token);
    expect(result.valid).toBe(true);

    // 防重放攻击：再次验证同个 captchaId 应该被拒绝
    const replayResult = verifyCaptcha(captcha.captchaId, rightAnswer, captcha.token);
    expect(replayResult.valid).toBe(false);
    expect(replayResult.message).toContain('已被使用');
  });

  it('rejects incorrect captcha answer', async () => {
    const { generateCaptcha, verifyCaptcha } = await import('../actions/captcha');
    const captcha = generateCaptcha();
    const wrongResult = verifyCaptcha(captcha.captchaId, '999999', captcha.token);
    expect(wrongResult.valid).toBe(false);
    expect(wrongResult.message).toContain('计算错误');
  });
});

