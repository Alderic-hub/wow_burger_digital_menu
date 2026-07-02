import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";

const OTP_TTL_SECS    = 600;  // 10 minutes
const COOLDOWN_SECS   = 60;   // 1 minute between resends
const MAX_ATTEMPTS    = 5;

interface OtpRecord {
  code:     string;
  attempts: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const { email } = (req.body ?? {}) as { email?: unknown };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }

  const key         = email.toLowerCase().trim();
  const cooldownKey = `otp:cooldown:${key}`;
  const codeKey     = `otp:code:${key}`;

  // ── Rate-limit: enforce cooldown ─────────────────────────────────────────
  let cooldownTtl: number;
  try {
    const onCooldown = await kv.get(cooldownKey);
    if (onCooldown !== null) {
      cooldownTtl = await kv.ttl(cooldownKey);
      const waitSec = cooldownTtl > 0 ? cooldownTtl : COOLDOWN_SECS;
      return res
        .status(429)
        .setHeader("Retry-After", String(waitSec))
        .json({ success: false, message: `Please wait ${waitSec} seconds before requesting a new code.` });
    }
  } catch (err) {
    console.error("[otp/send] KV cooldown check failed:", err);
    return res.status(503).json({ success: false, message: "Temporary storage error. Please try again shortly." });
  }

  // ── Generate & store OTP ─────────────────────────────────────────────────
  const code: string = String(randomInt(100000, 1000000));

  try {
    const record: OtpRecord = { code, attempts: 0 };
    await kv.set(codeKey,     record, { ex: OTP_TTL_SECS });
    await kv.set(cooldownKey, 1,      { ex: COOLDOWN_SECS });
  } catch (err) {
    console.error("[otp/send] KV write failed:", err);
    return res.status(503).json({ success: false, message: "Temporary storage error. Please try again shortly." });
  }

  // ── Send email ───────────────────────────────────────────────────────────
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn("[otp/send] SMTP credentials not configured.");
    return res.status(503).json({ success: false, message: "Email delivery is not configured on this server. Please contact the administrator." });
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth:   { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from:    process.env.SMTP_FROM ?? `"WOW Burger Security" <${smtpUser}>`,
      to:      email,
      subject: "🔑 WOW Burger — Admin Verification Code",
      text: [
        "You (or someone acting on your behalf) requested a verification code for the WOW Burger Admin Portal.",
        "",
        `Your verification code is:  ${code}`,
        "",
        "This code expires in 10 minutes.  Do not share it with anyone.",
        "If you did not request this, your account may be at risk — contact your system administrator.",
        "",
        "— WOW Burger Security",
      ].join("\n"),
    });

    return res.status(200).json({ success: true, message: `Verification code sent to ${email}.` });
  } catch (err: unknown) {
    console.error("[otp/send] Email delivery failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(502).json({ success: false, message: `Failed to deliver the verification email: ${msg}` });
  }
}
