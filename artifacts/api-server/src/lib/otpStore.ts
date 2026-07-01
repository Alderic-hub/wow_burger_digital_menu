import { randomInt } from "crypto";

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const store = new Map<string, OtpEntry>();

export type CreateResult =
  | { ok: true; code: string }
  | { ok: false; reason: "cooldown"; retryAfterMs: number };

export function createOtp(email: string): CreateResult {
  const key = email.toLowerCase();
  const existing = store.get(key);

  if (existing) {
    const msSinceLast = Date.now() - existing.lastSentAt;
    if (msSinceLast < RESEND_COOLDOWN_MS) {
      return { ok: false, reason: "cooldown", retryAfterMs: RESEND_COOLDOWN_MS - msSinceLast };
    }
  }

  const code = randomInt(100000, 1000000).toString();
  store.set(key, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: Date.now(),
  });
  return { ok: true, code };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "invalid" | "too_many_attempts" };

export function verifyOtp(email: string, code: string): VerifyResult {
  const key = email.toLowerCase();
  const entry = store.get(key);

  if (!entry) return { ok: false, reason: "not_found" };
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return { ok: false, reason: "expired" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return { ok: false, reason: "too_many_attempts" };
  }

  entry.attempts += 1;

  if (entry.code !== code) {
    return { ok: false, reason: "invalid" };
  }

  store.delete(key);
  return { ok: true };
}

export function clearOtp(email: string): void {
  store.delete(email.toLowerCase());
}
