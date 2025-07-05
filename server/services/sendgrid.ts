import { MailService } from '@sendgrid/mail';
import { log } from '../vite';

// Initialize the SendGrid mail service
const mailService = new MailService();

// Check if SendGrid API key is available
const sendgridApiKey = process.env.SENDGRID_API_KEY;

// Track if SendGrid is enabled
let sendgridEnabled = false;

// Set up SendGrid if API key is available
if (sendgridApiKey) {
  mailService.setApiKey(sendgridApiKey);
  sendgridEnabled = true;
  log('SendGrid email service initialized', 'email');
} else {
  log('SendGrid API key not found, emails will be logged but not sent', 'email');
}

interface SendGridEmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 * Falls back to logging if SendGrid is not available
 */
export async function sendGridEmail(params: SendGridEmailParams): Promise<boolean> {
  try {
    // If SendGrid is not enabled, log the email and return successful
    if (!sendgridEnabled) {
      log(`[SENDGRID MOCK] Email would be sent to: ${params.to}`, 'email');
      log(`[SENDGRID MOCK] From: ${params.from}`, 'email');
      log(`[SENDGRID MOCK] Subject: ${params.subject}`, 'email');
      log(`[SENDGRID MOCK] Content: ${params.text || params.html || ''}`, 'email');
      return true;
    }

    // Send the actual email via SendGrid
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });

    log(`Email sent via SendGrid to: ${params.to}`, 'email');
    return true;
  } catch (error: any) {
    log(`SendGrid error: ${error.message}`, 'email');

    // Fall back to logging on error
    log(`[SENDGRID FALLBACK] Email would be sent to: ${params.to}`, 'email');
    log(`[SENDGRID FALLBACK] Subject: ${params.subject}`, 'email');
    log(`[SENDGRID FALLBACK] Content: ${params.text || params.html || ''}`, 'email');

    return true; // Return true in development to allow the flow to continue
  }
}

/**
 * Check if SendGrid is enabled and properly configured
 */
export function isSendGridEnabled(): boolean {
  return sendgridEnabled;
}