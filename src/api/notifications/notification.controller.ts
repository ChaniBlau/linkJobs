import { Response } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { notificationRepo } from "../../repositories/notification.repository";
import prisma from "../../config/prisma";

export const upsertIntegration = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { slackWebhookUrl, fcmTokens } = req.body;
  const integration = await notificationRepo.upsertIntegration(userId, { slackWebhookUrl, fcmTokens });
  res.json({ success: true, data: integration });
};

export const createRule = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = req.body;
  const rule = await notificationRepo.createRule(userId, data);
  res.json({ success: true, data: rule });
};

export const listRules = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const rules = await notificationRepo.listRules(userId);
  res.json({ success: true, data: rules });
};

export const updateRule = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const data = req.body;
  const rule = await notificationRepo.updateRule(userId, id, data);
  res.json({ success: true, data: rule });
};

export const deleteRule = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  await notificationRepo.deleteRule(userId, id);
  res.json({ success: true });
};

// שליחת טסט לפי ערוץ
import { NotificationService } from "../../services/notification.service";
const svc = new NotificationService();

export const testSend = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { channel } = req.body; // "EMAIL" | "SLACK" | "PUSH"
  const integrations = await notificationRepo.getUserIntegrations(userId);

  try {
    if (channel === "EMAIL") {
      // שליחת מייל טסט
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await svc["mail"].send({ to: user!.email, subject: "🔔 טסט התראות", html: "<b>זהו מייל טסט</b>" });
    } else if (channel === "SLACK") {
      if (!integrations?.slackWebhookUrl) throw new Error("Missing Slack webhook");
      await svc["slack"].send(integrations.slackWebhookUrl, { text: "🔔 טסט Slack" });
    } else if (channel === "PUSH") {
      const tokens = integrations?.fcmTokens || [];
      if (!tokens.length) throw new Error("Missing FCM tokens");
      await svc["push"].send(tokens, { title: "🔔 טסט פוש", body: "זהו פוש טסט" });
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
};
