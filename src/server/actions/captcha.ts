import { createHmac, randomBytes, randomUUID } from 'crypto';
import type { Context } from '@nocobase/actions';

const CAPTCHA_SECRET = process.env.APP_KEY || 'nocobase-custom-login-captcha-secret';
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5分钟有效期

// 防止重放攻击的已消费记录器（带自动清理）
class ConsumedCaptchaStore {
  private consumed = new Set<string>();
  private lastCleanup = Date.now();

  checkAndConsume(captchaId: string): boolean {
    const now = Date.now();
    if (now - this.lastCleanup > 60000) {
      this.lastCleanup = now;
      if (this.consumed.size > 20000) {
        this.consumed.clear();
      }
    }
    if (this.consumed.has(captchaId)) {
      return false; // 已被使用过，重放攻击
    }
    this.consumed.add(captchaId);
    return true;
  }
}

const consumedStore = new ConsumedCaptchaStore();

export interface CaptchaData {
  captchaId: string;
  question: string;
  token: string;
  expiresAt: number;
}

export function generateCaptcha(): CaptchaData {
  const num1 = Math.floor(Math.random() * 15) + 1;
  const num2 = Math.floor(Math.random() * 15) + 1;
  const isAddition = Math.random() > 0.4;

  const answer = isAddition ? num1 + num2 : num1 + num2; // 简化为加法计算题
  const question = `${num1} + ${num2} = ?`;

  const captchaId = randomUUID();
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;

  const payload = `${captchaId}:${answer}:${expiresAt}`;
  const hmac = createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');
  const token = `${expiresAt}.${hmac}`;

  return {
    captchaId,
    question,
    token,
    expiresAt,
  };
}

export function verifyCaptcha(captchaId: string, answer: string | number, token: string): { valid: boolean; message?: string } {
  if (!captchaId || answer === undefined || answer === null || !token) {
    return { valid: false, message: '请完成验证码验证' };
  }

  const [expiresAtStr, signature] = token.split('.');
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || !signature) {
    return { valid: false, message: '验证码参数无效' };
  }

  const now = Date.now();
  if (now > expiresAt) {
    return { valid: false, message: '验证码已过期，请重新获取' };
  }

  const normalizedAnswer = String(answer).trim();
  const payload = `${captchaId}:${normalizedAnswer}:${expiresAt}`;
  const expectedSig = createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');

  if (signature !== expectedSig) {
    return { valid: false, message: '验证码计算错误，请重新输入' };
  }

  // 检查并消耗，防止重放攻击
  if (!consumedStore.checkAndConsume(captchaId)) {
    return { valid: false, message: '验证码已被使用，请重新获取' };
  }

  return { valid: true };
}

export async function getCaptchaAction(ctx: Context, next: () => Promise<any>) {
  const captcha = generateCaptcha();
  ctx.body = {
    captchaId: captcha.captchaId,
    question: captcha.question,
    token: captcha.token,
    expiresAt: captcha.expiresAt,
  };
  await next();
}
