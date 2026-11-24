import { Router } from "express";
import { createProjectTicketFromBotnoi } from "../controllers/ticket.controller";
import { createProjectReviewFromBotnoi } from "../controllers/webhook.controller";

const router = Router();

router.post("/:projectId", createProjectTicketFromBotnoi);
router.post("/:projectId/reviews", createProjectReviewFromBotnoi);

export default router;
