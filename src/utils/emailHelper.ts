import nodemailer from 'nodemailer';

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
