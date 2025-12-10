import prisma from "../config/prisma";

export const notificationRepo = {
  getUserIntegrations: (userId: number) => {
    return prisma.integration.findFirst({ where: { userId } });
  },

  getActiveRulesForUser: (userId: number) => {
    return prisma.notificationRule.findMany({
      where: { userId, active: true },
    });
  },

  getCandidateUsersForJob: async (jobId: number) => {
    // אסטרטגיה בסיסית: כל המשתמשים שהצטרפו לקבוצה של המשרה או שיש להם SavedSearch/Keywords רלוונטיים
    // גרסה ראשונית – מייעלים בהמשך עם Elastic.
    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) return { job: null, users: [] };

    // users joined to group
    const groupUsers = await prisma.userGroup.findMany({
      where: { groupId: job.groupId },
      select: { userId: true }
    });

    // users with keywords (פשוט – בלי fuzzy פה; הניקוד נעשה בשירות)
    const keywordUsers = await prisma.keyword.findMany({
      where: {
        word: { in: job.description.split(/\s+/).slice(0, 200) } // naive; השירות יעשה scoring מתקדם
      },
      select: { userId: true }
    });

    // saved searches (נאיבי – השירות יכפיל פילטרים)
    const savedSearchUsers = await prisma.savedSearch.findMany({
      where: { keywords: { hasSome: job.title ? job.title.split(/\s+/) : [] } },
      select: { userId: true }
    });

    const userIds = new Set<number>([
      ...groupUsers.map(u => u.userId),
      ...keywordUsers.map(u => u.userId),
      ...savedSearchUsers.map(u => u.userId),
    ]);

    const users = await prisma.user.findMany({ where: { id: { in: [...userIds] } } });
    return { job, users };
  },

  logNotification: (data: {
    userId: number; ruleId?: number; channel: string; trigger: string;
    jobId?: number; payloadHash: string; status: string; error?: string; meta?: any;
  }) => {
    return prisma.notificationLog.create({ data: {
      userId: data.userId,
      ruleId: data.ruleId,
      channel: data.channel as any,
      trigger: data.trigger as any,
      jobId: data.jobId,
      payloadHash: data.payloadHash,
      status: data.status,
      error: data.error,
      meta: data.meta
    }});
  },

  upsertIntegration: (userId: number, payload: { slackWebhookUrl?: string; fcmTokens?: string[] }) => {
  return prisma.integration.upsert({
    where: { id: userId }, 
    update: { ...payload },
    create: { userId, ...payload }
  });
},


  createRule: (userId: number, data: any) => prisma.notificationRule.create({ data: { ...data, userId } }),
  listRules: (userId: number) => prisma.notificationRule.findMany({ where: { userId } }),
  updateRule: (userId: number, id: number, data: any) =>
    prisma.notificationRule.update({ where: { id }, data: { ...data, userId } }),
  deleteRule: (userId: number, id: number) => prisma.notificationRule.delete({ where: { id } }),
};
