interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000;

const store = new Map<string, OtpEntry>();

export function createOtp(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  store.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return code;
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
