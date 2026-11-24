import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { verifyProjectWebhookSecret } from "../lib/projectWebhook";
import { createReviewWebhookSchema } from "../validations/project.validation";

export async function createProjectReviewFromBotnoi(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const projectId = req.params.projectId;
    const verified = await verifyProjectWebhookSecret(
      projectId,
      req.header("x-webhook-secret")
    );
    if (verified === null) {
      res.status(404).json({ success: false, error: "ไม่พบร้านค้าที่ระบุ" });
      return;
    }
    if (!verified) {
      res.status(401).json({ success: false, error: "Webhook secret ไม่ถูกต้อง" });
      return;
    }

    const data = createReviewWebhookSchema.parse(req.body);
    const ticket = await prisma.ticket.findFirst({
      where: { trackingCode: data.ticket, projectId },
      select: { id: true, status: true, customerName: true, trackingCode: true },
    });
    if (!ticket) {
      res.status(404).json({ success: false, error: "ไม่พบใบงานของร้านนี้" });
      return;
    }
    if (ticket.status !== "COMPLETED") {
      res.status(409).json({
        success: false,
        error: "รับรีวิวได้หลังจากใบงานเสร็จสิ้นแล้วเท่านั้น",
      });
      return;
    }

    const existing = await prisma.review.findUnique({
      where: { ticketId: ticket.id },
    });
    if (existing) {
      res.status(200).json({ success: true, data: existing, duplicate: true });
      return;
    }

    const review = await prisma.review.create({
      data: {
        projectId,
        ticketId: ticket.id,
        customerName: data.customer_name || ticket.customerName,
        rating: data.rating,
        comment: data.comment,
      },
    });

    res.status(201).json({
      success: true,
      data: { ...review, ticketCode: ticket.trackingCode },
    });
  } catch (err) {
    next(err);
  }
}
