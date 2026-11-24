import crypto from "crypto";
import { prisma } from "./prisma";

export async function verifyProjectWebhookSecret(
  projectId: string,
  suppliedSecret: string | undefined
): Promise<boolean | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { webhookSecretHash: true },
  });
  if (!project) return null;

  const expectedHash = Buffer.from(project.webhookSecretHash, "hex");
  const suppliedHash = suppliedSecret
    ? crypto.createHash("sha256").update(suppliedSecret).digest()
    : Buffer.alloc(0);
  return (
    expectedHash.length === suppliedHash.length &&
    crypto.timingSafeEqual(expectedHash, suppliedHash)
  );
}
