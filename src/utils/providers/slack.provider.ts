import fetch from "node-fetch";

export class SlackProvider {
  async send(webhookUrl: string, message: any) {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
  }

  formatJobMessage(job: any, match: any) {
    return {
      text: `🔔 *${job.title}* @ *${job.company}*`,
      attachments: [{
        fields: [
          { title: "Score", value: `${match.score}`, short: true },
          { title: "Group", value: `${job.groupId}`, short: true },
        ],
        actions: [{ type: "button", text: "Open", url: job.link }]
      }]
    };
  }
}
