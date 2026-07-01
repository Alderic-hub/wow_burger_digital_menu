import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser
  app.use(express.json());

  // API endpoint for sending email
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields (to, subject, body)." 
      });
    }

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"WOW Burger SSPR" <${smtpUser}>`;

    // Guard to check if SMTP settings are configured
    if (!smtpUser || !smtpPass) {
      console.warn("SMTP credentials are not configured in environment variables.");
      return res.status(503).json({
        success: false,
        message: "SMTP settings not configured! Please configure SMTP_USER and SMTP_PASS in the AI Studio Settings menu to send real emails directly."
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
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
      console.log(`Successfully sent email to ${to}`);
      return res.json({ 
        success: true, 
        message: "Email successfully sent directly to the destination address." 
      });
    } catch (error: any) {
      console.error("Nodemailer error:", error);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to dispatch email: ${error.message || error}` 
      });
    }
  });

  // Serve Vite or static files depending on mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
