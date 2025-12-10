import crypto from "crypto";
import Redis from "ioredis";
import logger from "../utils/logger";
import prisma from "../config/prisma";
import { notificationRepo } from "../repositories/notification.repository";
import { MailProvider } from "../utils/providers/mail.provider";
import { SlackProvider } from "../utils/providers/slack.provider";
import { PushProvider } from "../utils/providers/push.provider";

const redis = new Redis(process.env.REDIS_URL!);

export interface MatchContext {
  score: number;
  matchedKeywords: string[];
  matchedCompany?: string;
  matchedGroupId?: number;
}

export class NotificationService {
  constructor(
    private mail = new MailProvider(),
    private slack = new SlackProvider(),
    private push = new PushProvider(),
  ) {}

  private hashPayload(payload: any) {
    return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    }

  private dedupKey(userId: number, jobId: number, channel: string) {
    return `notif:${userId}:${jobId}:${channel}`;
  }

  private async shouldSend(userId: number, jobId: number, channel: string, ttlSec = 60 * 60) {
    const key = this.dedupKey(userId, jobId, channel);
    const ok = await redis.set(key, "1", "EX", ttlSec, "NX");
    return ok === "OK";
  }

  computeMatchScore(job: any, rule: any, userKeywords: string[]): MatchContext {
    const text = `${job.title} ${job.company} ${job.description}`.toLowerCase();
    const allKw = new Set<string>([
      ...userKeywords.map(k => k.toLowerCase()),
      ...(rule.keywords || []).map((k: string) => k.toLowerCase())
    ]);

    const matchedKeywords: string[] = [];
    allKw.forEach(kw => { if (text.includes(kw)) matchedKeywords.push(kw); });

    let score = matchedKeywords.length * 10;
    let matchedCompany: string | undefined;
    if (rule.companiesFilter?.length) {
      if (rule.companiesFilter.some((c: string) => job.company?.toLowerCase() === c.toLowerCase())) {
        score += 20; matchedCompany = job.company;
      }
    }
    let matchedGroupId: number | undefined;
    if (rule.groupsFilter?.length) {
      if (rule.groupsFilter.includes(job.groupId)) {
        score += 10; matchedGroupId = job.groupId;
      }
    }
    return { score, matchedKeywords, matchedCompany, matchedGroupId };
  }

  async notifyOnJob(jobId: number) {
    const { job, users } = await notificationRepo.getCandidateUsersForJob(jobId);
    if (!job || users.length === 0) return;

    for (const user of users) {
      try {
        const rules = await notificationRepo.getActiveRulesForUser(user.id);
        if (!rules.length) continue;

        const userKeywords = (await prisma.keyword.findMany({ where: { userId: user.id } }))
          .map(k => k.word);

        const integrations = await notificationRepo.getUserIntegrations(user.id);

        for (const rule of rules) {
          if (!(rule.trigger === "NEW_JOB_MATCH" || rule.trigger === "SAVED_SEARCH_MATCH")) continue;

          // חישוב התאמה
          const match = this.computeMatchScore(job, rule, userKeywords);
          if (rule.minScore && match.score < rule.minScore) continue;

          // שליחה בערוצים
          for (const ch of rule.channels) {
            const payload = { type: rule.trigger, userId: user.id, jobId: job.id, match };
            const payloadHash = this.hashPayload(payload);

            // דה-דופ
            if (!(await this.shouldSend(user.id, job.id, ch))) continue;

            let status = "SENT", error: string | undefined;

            try {
              if (ch === "EMAIL") {
                await this.mail.send({
                  to: user.email,
                  subject: `🔔 משרה חדשה תואמת: ${job.title} @ ${job.company}`,
                  html: this.mail.renderJobTemplate({ user, job, match })
                });
              } else if (ch === "SLACK") {
                const webhook = integrations?.slackWebhookUrl;
                if (webhook) await this.slack.send(webhook, this.slack.formatJobMessage(job, match));
              } else if (ch === "PUSH") {
                const tokens = integrations?.fcmTokens || [];
                if (tokens.length) await this.push.send(tokens, this.push.formatJobNotification(job, match));
              }
            } catch (e: any) {
              status = "FAILED";
              error = e?.message || "unknown error";
              logger.error(`Notify failed: user=${user.id} ch=${ch} job=${job.id} err=${error}`);
            }

            await notificationRepo.logNotification({
              userId: user.id,
              ruleId: rule.id,
              channel: ch,
              trigger: rule.trigger,
              jobId: job.id,
              payloadHash,
              status,
              error,
              meta: { score: match.score, matchedKeywords: match.matchedKeywords }
            });
          }
        }
      } catch (err) {
        logger.error(`notifyOnJob error user=${user.id} job=${jobId}`, err);
      }
    }
  }
}
