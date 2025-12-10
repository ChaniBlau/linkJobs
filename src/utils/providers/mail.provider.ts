import nodemailer from "nodemailer";

export class MailProvider {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  async send(opts: { to: string; subject: string; html: string }) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"LinkJobs" <no-reply@linkjobs.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }

  renderJobTemplate({ user, job, match }: any) {
    return `
      <div>
        <p>היי ${user.name || ""},</p>
        <p>מצאנו משרה שעשויה להתאים לך:</p>
        <h3>${job.title} @ ${job.company}</h3>
        <p>${(job.description || "").slice(0, 300)}...</p>
        <p><a href="${job.link}" target="_blank">לצפייה במשרה</a></p>
        <hr />
        <small>ציון התאמה: ${match.score} | מילות מפתח: ${match.matchedKeywords.join(", ")}</small>
      </div>
    `;
  }
}
