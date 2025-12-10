-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL', 'SLACK', 'PUSH');

-- CreateEnum
CREATE TYPE "public"."NotificationTrigger" AS ENUM ('NEW_JOB_MATCH', 'SAVED_SEARCH_MATCH', 'GROUP_DIGEST', 'LICENSE_ALERT');

-- CreateEnum
CREATE TYPE "public"."NotificationFrequency" AS ENUM ('INSTANT', 'HOURLY', 'DAILY', 'WEEKLY');

-- CreateTable
CREATE TABLE "public"."Integration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "organizationId" INTEGER,
    "slackWebhookUrl" TEXT,
    "fcmTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationRule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "trigger" "public"."NotificationTrigger" NOT NULL,
    "channels" "public"."NotificationChannel"[],
    "frequency" "public"."NotificationFrequency" NOT NULL DEFAULT 'INSTANT',
    "minScore" INTEGER,
    "groupsFilter" INTEGER[],
    "companiesFilter" TEXT[],
    "keywords" TEXT[],
    "savedSearchId" INTEGER,
    "timezone" TEXT,
    "scheduleHour" INTEGER,
    "avedSearchId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ruleId" INTEGER,
    "channel" "public"."NotificationChannel" NOT NULL,
    "trigger" "public"."NotificationTrigger" NOT NULL,
    "jobId" INTEGER,
    "payloadHash" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "meta" JSONB,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventOutbox" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventOutbox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Integration" ADD CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Integration" ADD CONSTRAINT "Integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationRule" ADD CONSTRAINT "NotificationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationRule" ADD CONSTRAINT "NotificationRule_savedSearchId_fkey" FOREIGN KEY ("savedSearchId") REFERENCES "public"."SavedSearch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationLog" ADD CONSTRAINT "NotificationLog_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."NotificationRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
