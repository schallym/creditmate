import nodemailer from 'nodemailer';
import hbs from 'handlebars';

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

  async sendLocalizedTemplatedMail(to: string, subject: string, locale: string, template: string, context: Record<string, string>, from: string = 'noreply@resend.dev'): Promise<void> {
    const config = useRuntimeConfig();

    const enrichedContext = {
      ...context,
      logoUrl: `${config.public.appUrl}/img/logo.png`
    };

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

      const templateSrc = await useStorage('assets:templates').getItem(`emails/${locale}/${template}.hbs`);
      console.log('Loaded template source:', templateSrc);
      const compiledTemplate = hbs.compile(templateSrc, { });

      console.log(compiledTemplate(enrichedContext));

      await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: compiledTemplate(enrichedContext)
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export const mailer = new MailerService();
