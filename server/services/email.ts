import nodemailer from "nodemailer";
import { log } from "../vite";
import { sendGridEmail, isSendGridEnabled } from "./sendgrid";

// Default sender
const defaultSender =
  process.env.EMAIL_FROM || "TradeXCapital <noreply@tradexcapital.com>";

// Create reusable transporter as fallback for when SendGrid is not available
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "noreply@tradexcapital.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

// Verify connection configuration
transporter.verify(function (error: any) {
  if (error) {
    log(`Nodemailer email service error: ${error.message}`, "email");
    log(
      "Email service will run in development mode (emails will be logged but not sent)",
      "email",
    );
  } else {
    log("Nodemailer email service is ready as fallback", "email");
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using the best available method (SendGrid or fallback)
 * In development mode, emails are logged but not sent
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Try to use SendGrid if it's available
    if (isSendGridEnabled()) {
      return await sendGridEmail({
        to: options.to,
        from: defaultSender,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    }

    // In development, log the email instead of sending it
    if (process.env.NODE_ENV !== "development") {
      log(`Email would be sent to: ${options.to}`, "email");
      log(`Subject: ${options.subject}`, "email");
      log(`Content: ${options.text || options.html}`, "email");
      return true;
    }

    // Send the actual email using nodemailer as fallback
    const info = await transporter.sendMail({
      from: defaultSender,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    log(`Email sent: ${info.messageId}`, "email");
    return true;
  } catch (error: any) {
    log(`Error sending email: ${error.message}`, "email");
    return false;
  }
}

/**
 * Send a verification email
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<boolean> {
  // Get the host URL from environment, or default to the Replit URL
  const hostUrl = process.env.APP_URL || "http://localhost:5000";
  const verificationUrl = `${hostUrl}/verify-email?token=${token}`;

  console.log('Generated verification URL:', verificationUrl);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Verify Your TradeXCapital Account</h2>
      <p>Thank you for registering with TradeXCapital. Please verify your email address by clicking the link below:</p>
      <p style="margin: 20px 0;">
        <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify My Email</a>
      </p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #6b7280;">TradeXCapital, Inc.<br>Do not reply to this email.</p>
    </div>
  `;

  const text = `
    Verify Your TradeXCapital Account

    Thank you for registering with TradeXCapital. Please verify your email address by visiting the link below:

    ${verificationUrl}

    This link will expire in 24 hours.

    If you did not create an account, please ignore this email.

    TradeXCapital, Inc.
    Do not reply to this email.
  `;

  return sendEmail({
    to,
    subject: "Verify Your TradeXCapital Account",
    html,
    text,
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<boolean> {
  const resetUrl = `${process.env.APP_URL || "http://localhost:5000"}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Reset Your TradeXCapital Password</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password</a>
      </p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #6b7280;">TradeXCapital, Inc.<br>Do not reply to this email.</p>
    </div>
  `;

  const text = `
    Reset Your TradeXCapital Password

    We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

    Click the link below to reset your password:

    ${resetUrl}

    This link will expire in 1 hour.

    TradeXCapital, Inc.
    Do not reply to this email.
  `;

  return sendEmail({
    to,
    subject: "Reset Your TradeXCapital Password",
    html,
    text,
  });
}
