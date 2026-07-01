import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";
import { issueOtp, checkOtp } from "../lib/otpStore";

const router: IRouter = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth:   { user, pass },
  });
}

function senderAddress() {
  return process.env.SMTP_FROM ?? `"WOW Burger Security" <${process.env.SMTP_USER}>`;
}

// ─── POST /api/otp/send ──────────────────────────────────────────────────────
// Generate a new OTP server-side, store it, and email it to the recipient.

router.post("/otp/send", async (req, res) => {
  const { email } = req.body as { email?: unknown };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ success: false, message: "A valid email address is required." });
    return;
  }

  const transporter = buildTransporter();
  if (!transporter) {
    req.log.warn("SMTP credentials missing — cannot send OTP");
    res.status(503).json({
      success: false,
      message: "Email delivery is not configured on this server. Please contact the administrator.",
    });
    return;
  }

  const result = issueOtp(email);

  if (!result.ok) {
    const waitSec = Math.ceil(result.waitMs / 1000);
    res.status(429)
      .setHeader("Retry-After", String(waitSec))
      .json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new code.`,
      });
    return;
  }

  try {
    await transporter.sendMail({
      from:    senderAddress(),
      to:      email,
      subject: "🔑 WOW Burger — Admin Verification Code",
      text:    [
        "You (or someone acting on your behalf) requested a verification code for the WOW Burger Admin Portal.",
        "",
        `Your verification code is:  ${result.code}`,
        "",
        "This code expires in 10 minutes.  Do not share it with anyone.",
        "If you did not request this, your account may be at risk — contact your system administrator.",
        "",
        "— WOW Burger Security",
      ].join("\n"),
    });

    req.log.info({ email }, "OTP sent");
    res.json({ success: true, message: `Verification code sent to ${email}.` });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to send OTP email");
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ success: false, message: `Failed to send email: ${msg}` });
  }
});

// ─── POST /api/otp/verify ────────────────────────────────────────────────────
// Check a submitted OTP code.  The code is never exposed to the client.

router.post("/otp/verify", (req, res) => {
  const { email, code } = req.body as { email?: unknown; code?: unknown };

  if (!email || typeof email !== "string" || !code || typeof code !== "string") {
    res.status(400).json({ success: false, message: "email and code are required." });
    return;
  }

  const result = checkOtp(email, code);

  if (result.ok) {
    req.log.info({ email }, "OTP verified");
    res.json({ success: true, message: "Code verified successfully." });
    return;
  }

  const status: Record<typeof result.reason, number> = {
    not_found:  404,
    expired:    410,
    wrong_code: 422,
    locked_out: 429,
  };

  const message: Record<typeof result.reason, string> = {
    not_found:  "No pending code found for this email. Please request a new one.",
    expired:    "This code has expired. Please request a new one.",
    wrong_code: "Incorrect code. Please check your inbox and try again.",
    locked_out: "Too many failed attempts. Please request a new code.",
  };

  req.log.warn({ email, reason: result.reason }, "OTP check failed");
  res.status(status[result.reason]).json({ success: false, message: message[result.reason] });
});

export default router;
