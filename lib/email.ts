import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from './ses';

const FROM = process.env.SES_FROM_EMAIL as string;
const SUPPORT = process.env.SUPPORT_EMAIL || process.env.SES_FROM_EMAIL!;

export async function sendEmailToSupport(subject: string, html: string) {
  await sesClient.send(new SendEmailCommand({
    Source: SUPPORT,
    Destination: { ToAddresses: ['admin@ecosourceco.com'] },
    Message: { Subject: { Data: subject }, Body: { Html: { Data: html } } },
  }));
}

export async function sendEmailToVisitor(to: string, subject: string, html: string) {
  await sesClient.send(new SendEmailCommand({
    Source: SUPPORT,
    Destination: { ToAddresses: [to] },
    Message: { Subject: { Data: subject }, Body: { Html: { Data: html } } },
    ReplyToAddresses: ['support@ecosourceco.com'],
  }));
}

export async function sendPasswordResetEmail(to: string, url: string) {
  const cmd = new SendEmailCommand({
    Source: FROM,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: 'Reset your Eco-Source password' },
      Body: {
        Html: {
          Data: `<p>We received a password-reset request for your Eco-Source account.</p>
                 <p><a href="${url}">Click here to set a new password</a>. 
                 This link is valid for 5&nbsp;minutes.</p>`,
        },
      },
    },
  });

  

  

  await sesClient.send(cmd);
}
