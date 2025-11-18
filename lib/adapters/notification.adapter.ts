/**
 * Notification adapter interface
 * Allows plugging in different notification providers (email, SMS, push, etc.)
 */

export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  message: string;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, unknown>;
}

export interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<void>;
  sendBulk(payloads: NotificationPayload[]): Promise<void>;
}

/**
 * Console logger implementation (for development/testing)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    console.log("[NOTIFICATION]", JSON.stringify(payload, null, 2));
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    console.log(`[NOTIFICATION BULK] Sending ${payloads.length} notifications`);
    for (const payload of payloads) {
      await this.send(payload);
    }
  }
}

/**
 * Email adapter implementation (stub - would integrate with SendGrid, AWS SES, etc.)
 */
export class EmailNotificationAdapter implements INotificationAdapter {
  constructor(private config: { apiKey: string; from: string }) {}

  async send(payload: NotificationPayload): Promise<void> {
    // In production, this would call an email service API
    console.log("[EMAIL]", {
      from: this.config.from,
      to: payload.to,
      subject: payload.subject,
      message: payload.message,
    });
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    await Promise.all(payloads.map((p) => this.send(p)));
  }
}

/**
 * SMS adapter implementation (stub - would integrate with Twilio, AWS SNS, etc.)
 */
export class SmsNotificationAdapter implements INotificationAdapter {
  constructor(private config: { apiKey: string; from: string }) {}

  async send(payload: NotificationPayload): Promise<void> {
    // In production, this would call an SMS service API
    console.log("[SMS]", {
      from: this.config.from,
      to: payload.to,
      message: payload.message,
    });
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    await Promise.all(payloads.map((p) => this.send(p)));
  }
}

// Default adapter factory
export function createNotificationAdapter(): INotificationAdapter {
  const provider = process.env.NOTIFICATION_PROVIDER || "console";

  switch (provider) {
    case "email":
      return new EmailNotificationAdapter({
        apiKey: process.env.EMAIL_API_KEY || "",
        from: process.env.EMAIL_FROM || "noreply@example.com",
      });
    case "sms":
      return new SmsNotificationAdapter({
        apiKey: process.env.SMS_API_KEY || "",
        from: process.env.SMS_FROM || "",
      });
    default:
      return new ConsoleNotificationAdapter();
  }
}
