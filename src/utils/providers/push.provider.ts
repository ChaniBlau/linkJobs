import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let initialized = false;
export class PushProvider {
  constructor() {
    if (!initialized) {
      initializeApp({ credential: cert(JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON!)) });
      initialized = true;
    }
  }

  async send(tokens: string[], payload: { title: string; body: string; link?: string }) {
    await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: payload.link ? { link: payload.link } : undefined
    });
  }

  formatJobNotification(job: any, match: any) {
    return {
      title: `משרה חדשה: ${job.title}`,
      body: `${job.company} • Score ${match.score}`,
      link: job.link
    };
  }
}
