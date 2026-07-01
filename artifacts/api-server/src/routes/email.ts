import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    res.status(400).json({
      success: false,
      message: "Missing required fields (to, subject, body).",
    });
    return;
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"WOW Burger SSPR" <${smtpUser}>`;

  if (!smtpUser || !smtpPass) {
    req.log.warn("SMTP credentials not configured");
    res.json({
      success: false,
      message:
        "SMTP settings not configured! Please configure SMTP_USER and SMTP_PASS environment variables to send real emails.",
    });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: smtpFrom,
      to,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    req.log.info({ to }, "Email sent successfully");
    res.json({
      success: true,
      message: "Email successfully sent.",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ error }, "Nodemailer error");
    res.status(200).json({
      success: false,
      message: `Failed to dispatch email: ${msg}`,
    });
  }
});

export default router;
