import nodemailer from 'nodemailer';

class MailerService {
  async sendMail(to: string, subject: string, body: string, from: string = 'noreply@resend.dev'): Promise<void> {
    const config = useRuntimeConfig();
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: true,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass
        }
      });

      await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: body
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export const mailer = new MailerService();
