import { Router } from "express";
import { createProjectTicketFromBotnoi } from "../controllers/ticket.controller";
import {
  createProjectConversationFromBotnoi,
  createProjectReviewFromBotnoi,
} from "../controllers/webhook.controller";

const router = Router();

router.post("/:projectId", createProjectTicketFromBotnoi);
router.post("/:projectId/messages", createProjectConversationFromBotnoi);
router.post("/:projectId/reviews", createProjectReviewFromBotnoi);

export default router;
