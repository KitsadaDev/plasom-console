-- CreateEnum
CREATE TYPE "TechnicianStatus" AS ENUM ('AVAILABLE', 'BUSY');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "chatbotConnected" BOOLEAN NOT NULL DEFAULT false,
    "botnoiBotId" TEXT,
    "voicebotConnected" BOOLEAN NOT NULL DEFAULT false,
    "voiceAgentId" TEXT,
    "greetingMessage" TEXT NOT NULL DEFAULT '',
    "requiredFields" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "features" JSONB NOT NULL DEFAULT '{}',
    "webhookSecretHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Technician"
ADD COLUMN "specialty" TEXT,
ADD COLUMN "status" "TechnicianStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN "projectId" TEXT;

-- AlterTable
ALTER TABLE "Ticket"
ADD COLUMN "projectId" TEXT;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ticketId" TEXT,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");
CREATE INDEX "Technician_projectId_idx" ON "Technician"("projectId");
CREATE INDEX "Ticket_projectId_createdAt_idx" ON "Ticket"("projectId", "createdAt");
CREATE UNIQUE INDEX "Review_ticketId_key" ON "Review"("ticketId");
CREATE INDEX "Review_projectId_createdAt_idx" ON "Review"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
