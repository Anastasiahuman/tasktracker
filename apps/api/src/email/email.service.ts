import { Injectable, Logger } from '@nestjs/common';

interface InvitationEmailData {
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
  expiresIn: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendApiKey = process.env.RESEND_API_KEY;

  async sendInvitation(email: string, data: InvitationEmailData) {
    if (!this.resendApiKey) {
      this.logger.warn('RESEND_API_KEY not set, skipping email send');
      this.logger.log(`Would send invitation to ${email} for workspace ${data.workspaceName}`);
      return;
    }

    try {
      // Используем Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Task Tracker <noreply@yourdomain.com>', // Замените на ваш домен
          to: [email],
          subject: `Приглашение в ${data.workspaceName}`,
          html: this.getInvitationEmailHtml(data),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send email: ${error}`);
        throw new Error(`Failed to send email: ${error}`);
      }

      this.logger.log(`Invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${email}:`, error);
      throw error;
    }
  }

  private getInvitationEmailHtml(data: InvitationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Приглашение в Task Tracker</h1>
          </div>
          <div class="content">
            <p>Привет!</p>
            <p><strong>${data.inviterName}</strong> пригласил(а) вас присоединиться к рабочему пространству <strong>${data.workspaceName}</strong> в Task Tracker.</p>
            <p>Нажмите на кнопку ниже, чтобы принять приглашение и начать работу:</p>
            <p style="text-align: center;">
              <a href="${data.inviteUrl}" class="button">Принять приглашение</a>
            </p>
            <p><small>Ссылка действительна ${data.expiresIn}. Если вы не запрашивали это приглашение, просто проигнорируйте это письмо.</small></p>
          </div>
          <div class="footer">
            <p>Task Tracker - Дружелюбный трекер задач в стиле Смешариков</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}


