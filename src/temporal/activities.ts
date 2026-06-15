import { Resend } from "resend";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  scheduledAt: number;
}

export function createActivities() {
  return {
    async sendScheduledEmail(params: SendEmailParams): Promise<string> {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) throw new Error("RESEND_API_KEY is not set");
      const resend = new Resend(apiKey);
      const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
      const result = await resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data?.id ?? "";
    },
  };
}
