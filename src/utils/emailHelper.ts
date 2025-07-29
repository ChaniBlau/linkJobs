import nodemailer from 'nodemailer';
import { getRabbitMQChannel } from '../config/rabbitmq';
import logger from './logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
   tls: {
    rejectUnauthorized: false,
  },
});

export const sendInviteEmail = async (email: string, orgId: number) => {
  const inviteLink = `https://linkjobs.com/join?org=${orgId}&email=${encodeURIComponent(email)}`;

  const info = await transporter.sendMail({
    from: `"LinkJobs" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'You have been invited to join an organization on LinkJobs!',
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Hello,</h2>
        <p>You have been invited to join an organization on <strong>LinkJobs</strong>.</p>
        <p>Click the link below to join:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <br />
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
        <hr />
        <small>Organization ID: ${orgId}</small>
      </div>
    `,
    
  });

  console.log(`✅ Invite email sent to ${email} | messageId: ${info.messageId}`);
};

export const sendJoinRequestNotification = async (adminEmail: string, requestData: {
  userEmail: string;
  userName: string;
  organizationName: string;
  requestMessage?: string;
  organizationId: number;
  requestId: number;
}) => {
  const { userEmail, userName, organizationName, requestMessage, organizationId, requestId } = requestData;
  
  const approveLink = `${process.env.FRONTEND_URL}/admin/organizations/${organizationId}/join-requests?requestId=${requestId}&action=approve`;
  const rejectLink = `${process.env.FRONTEND_URL}/admin/organizations/${organizationId}/join-requests?requestId=${requestId}&action=reject`;

  const info = await transporter.sendMail({
    from: `"LinkJobs" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `בקשת הצטרפות חדשה לארגון ${organizationName}`,
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>שלום!</h2>
        <p>קיבלת בקשת הצטרפות חדשה לארגון <strong>${organizationName}</strong></p>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3>פרטי המבקש:</h3>
          <p><strong>שם:</strong> ${userName}</p>
          <p><strong>אימייל:</strong> ${userEmail}</p>
          ${requestMessage ? `<p><strong>הודעה:</strong> ${requestMessage}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${approveLink}" 
             style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px;">
            ✅ אשר בקשה
          </a>
          <a href="${rejectLink}" 
             style="background: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px;">
            ❌ דחה בקשה
          </a>
        </div>

        <p><small>או היכנס לפלטפורמה כדי לנהל את הבקשה ידנית</small></p>
        <hr />
        <small>מזהה בקשה: ${requestId}</small>
      </div>
    `,
  });

  logger.info(`📧 Join request notification sent to admin ${adminEmail} | messageId: ${info.messageId}`);
};

export const sendJoinRequestStatusUpdate = async (userEmail: string, statusData: {
  userName: string;
  organizationName: string;
  status: 'APPROVED' | 'REJECTED';
  adminResponse?: string;
}) => {
  const { userName, organizationName, status, adminResponse } = statusData;
  
  const isApproved = status === 'APPROVED';
  const statusText = isApproved ? 'אושרה' : 'נדחתה';
  const emoji = isApproved ? '🎉' : '😔';
  
  const info = await transporter.sendMail({
    from: `"LinkJobs" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `בקשת ההצטרפות שלך לארגון ${organizationName} ${statusText}`,
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>${emoji} שלום ${userName}!</h2>
        <p>בקשת ההצטרפות שלך לארגון <strong>${organizationName}</strong> ${statusText}.</p>
        
        ${isApproved ? `
          <div style="background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 8px; border-right: 4px solid #4CAF50;">
            <h3>🎊 ברוך הבא לצוות!</h3>
            <p>כעת תוכל לגשת לכל התכונות הזמינות לארגון.</p>
            <p><a href="${process.env.FRONTEND_URL}/dashboard">היכנס לפלטפורמה</a></p>
          </div>
        ` : `
          <div style="background: #fff5f5; padding: 15px; margin: 20px 0; border-radius: 8px; border-right: 4px solid #f44336;">
            <h3>הבקשה נדחתה</h3>
            <p>למרות שהבקשה לא אושרה הפעם, אתה יכול לנסות שוב או ליצור קשר עם מנהל הארגון.</p>
          </div>
        `}
        
        ${adminResponse ? `
          <div style="background: #f0f8ff; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h4>הודעה ממנהל הארגון:</h4>
            <p style="font-style: italic;">"${adminResponse}"</p>
          </div>
        ` : ''}
        
        <hr />
        <p><small>תודה על השימוש ב-LinkJobs!</small></p>
      </div>
    `,
  });

  console.log(`📧 Status update sent to user ${userEmail} | Status: ${status} | messageId: ${info.messageId}`);
};

export const publishJoinRequestNotification = async (adminEmail: string, requestData: any) => {
  const channel = await getRabbitMQChannel();
  const QUEUE_NAME = 'join-request-notification';
  
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  const message = JSON.stringify({ adminEmail, requestData });
  
  channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });
  console.log(`📤 Join request notification published to queue for admin: ${adminEmail}`);
};

export const publishJoinRequestStatusUpdate = async (userEmail: string, statusData: any) => {
  const channel = await getRabbitMQChannel();
  const QUEUE_NAME = 'join-request-status-update';
  
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  const message = JSON.stringify({ userEmail, statusData });
  
  channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });
  logger.info(`📤 Join request status update published to queue for user: ${userEmail}`);
};