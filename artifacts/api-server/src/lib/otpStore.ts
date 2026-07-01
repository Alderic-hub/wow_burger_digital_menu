import { randomInt } from "crypto";

const OTP_TTL_MS        = 10 * 60 * 1000;  // 10 minutes
const RESEND_COOLDOWN   = 60 * 1000;        // 1 minute between resends
const MAX_ATTEMPTS      = 5;

interface OtpEntry {
  code:       string;
  expiresAt:  number;
  sentAt:     number;
  attempts:   number;
}

const store = new Map<string, OtpEntry>();

// ─── Types ─────────────────────────────────────────────────────────────────

export type SendResult =
  | { ok: true; code: string }
  | { ok: false; reason: "cooldown"; waitMs: number };

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "wrong_code" | "locked_out" };

// ─── Public API ─────────────────────────────────────────────────────────────

/** Generate a new OTP for the given email address.
 *  Returns the plaintext code so the caller can send it via email. */
export function issueOtp(email: string): SendResult {
  const key = email.toLowerCase();
  const existing = store.get(key);

  if (existing) {
    const elapsed = Date.now() - existing.sentAt;
    if (elapsed < RESEND_COOLDOWN) {
      return { ok: false, reason: "cooldown", waitMs: RESEND_COOLDOWN - elapsed };
    }
  }

  const code = String(randomInt(100000, 1000000));   // cryptographically secure
  store.set(key, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    sentAt:    Date.now(),
    attempts:  0,
  });

  return { ok: true, code };
}

/** Verify a submitted OTP code.  Deletes the entry on success or lockout. */
export function checkOtp(email: string, code: string): VerifyResult {
  const key   = email.toLowerCase();
  const entry = store.get(key);

  if (!entry)                          return { ok: false, reason: "not_found"  };
  if (Date.now() > entry.expiresAt)  { store.delete(key); return { ok: false, reason: "expired"    }; }
  if (entry.attempts >= MAX_ATTEMPTS){ store.delete(key); return { ok: false, reason: "locked_out" }; }

  entry.attempts += 1;

  if (entry.code !== code.trim()) return { ok: false, reason: "wrong_code" };

  store.delete(key);   // consume on success
  return { ok: true };
}

/** Manually invalidate any pending OTP for an email (e.g. after a reset). */
export function revokeOtp(email: string): void {
  store.delete(email.toLowerCase());
}
