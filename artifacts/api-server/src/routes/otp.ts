import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";
import { createOtp, verifyOtp } from "../lib/otpStore";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function makeTransporter() {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) return null;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

router.post("/otp/send", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string") {
    res.status(400).json({ success: false, message: "Email is required." });
    return;
  }

  const transporter = makeTransporter();

  if (!transporter) {
    req.log.warn("SMTP not configured — OTP send skipped");
    res.status(503).json({
      success: false,
      message:
        "Email delivery is not configured. Please set SMTP_USER and SMTP_PASS environment variables.",
    });
    return;
  }

  const code = createOtp(email);
  const from =
    process.env.SMTP_FROM ||
    `"WOW Burger Security" <${process.env.SMTP_USER}>`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "🔑 WOW Burger — Verification Code",
      text: `You have requested a verification code for the WOW Burger Admin Portal.

Your verification code is: ${code}

This code expires in 10 minutes. If you did not request this, please ignore this message and ensure your account is secure.

— WOW Burger Security`,
    });

    req.log.info({ email }, "OTP sent");
    res.json({ success: true, message: `Verification code sent to ${email}.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "Failed to send OTP email");
    res.status(502).json({
      success: false,
      message: `Failed to send verification email: ${msg}`,
    });
  }
});

router.post("/otp/verify", (req, res) => {
  const { email, code } = req.body as { email?: string; code?: string };

  if (!email || !code) {
    res.status(400).json({ success: false, message: "Email and code are required." });
    return;
  }

  const result = verifyOtp(email, code);

  if (result.ok) {
    req.log.info({ email }, "OTP verified successfully");
    res.json({ success: true, message: "Code verified successfully." });
    return;
  }

  const statusCodes: Record<typeof result.reason, number> = {
    not_found: 404,
    expired: 410,
    invalid: 422,
    too_many_attempts: 429,
  };

  const messages: Record<typeof result.reason, string> = {
    not_found: "No pending reset request found for this email. Please request a new code.",
    expired: "This code has expired. Please request a new one.",
    invalid: "Incorrect verification code. Please check and try again.",
    too_many_attempts: "Too many incorrect attempts. Please request a new code.",
  };

  req.log.warn({ email, reason: result.reason }, "OTP verification failed");
  res.status(statusCodes[result.reason]).json({
    success: false,
    message: messages[result.reason],
  });
});

export default router;
