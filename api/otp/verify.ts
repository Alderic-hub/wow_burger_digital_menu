import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";

const MAX_ATTEMPTS = 5;

interface OtpRecord {
  code:     string;
  attempts: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const { email, code } = (req.body ?? {}) as { email?: unknown; code?: unknown };

  if (!email || typeof email !== "string" || !code || typeof code !== "string") {
    return res.status(400).json({ success: false, message: "email and code are required." });
  }

  const key     = email.toLowerCase().trim();
  const codeKey = `otp:code:${key}`;

  // ── Fetch OTP record ─────────────────────────────────────────────────────
  let record: OtpRecord | null;
  try {
    record = await kv.get<OtpRecord>(codeKey);
  } catch (err) {
    console.error("[otp/verify] KV read failed:", err);
    return res.status(503).json({ success: false, message: "Temporary storage error. Please try again shortly." });
  }

  if (record === null) {
    return res.status(404).json({ success: false, message: "No pending code found for this email. Please request a new one." });
  }

  // ── Lockout check ────────────────────────────────────────────────────────
  if (record.attempts >= MAX_ATTEMPTS) {
    try { await kv.del(codeKey); } catch (_) { /* best-effort cleanup */ }
    return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new code." });
  }

  // ── Code check ───────────────────────────────────────────────────────────
  if (record.code !== code.trim()) {
    const updated: OtpRecord = { code: record.code, attempts: record.attempts + 1 };
    try {
      const remaining = await kv.ttl(codeKey);
      await kv.set(codeKey, updated, { ex: remaining > 0 ? remaining : 60 });
    } catch (err) {
      console.error("[otp/verify] KV update failed:", err);
    }
    return res.status(422).json({ success: false, message: "Incorrect code. Please check your inbox and try again." });
  }

  // ── Success ──────────────────────────────────────────────────────────────
  try { await kv.del(codeKey); } catch (_) { /* best-effort cleanup */ }

  return res.status(200).json({ success: true, message: "Code verified successfully." });
}
