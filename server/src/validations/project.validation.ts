import { z } from "zod";
import { TicketStatus, TechnicianStatus } from "@prisma/client";

export const projectFeaturesSchema = z.object({
  createTicket: z.boolean(),
  trackStatus: z.boolean(),
  priceEstimate: z.boolean(),
  faqAutoReply: z.boolean(),
  collectCsat: z.boolean(),
  humanHandover: z.boolean(),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "กรุณากรอกชื่อร้าน").max(100),
  category: z.string().trim().min(2, "กรุณาเลือกหมวดหมู่").max(100),
  branchName: z.string().trim().min(1, "กรุณากรอกชื่อสาขา").max(100),
  chatbotConnected: z.boolean().optional().default(false),
  botnoiBotId: z.string().trim().max(200).optional().nullable(),
  voicebotConnected: z.boolean().optional().default(false),
  voiceAgentId: z.string().trim().max(200).optional().nullable(),
  greetingMessage: z.string().max(2000).optional().default(""),
  requiredFields: z.array(z.string().trim().min(1).max(100)).max(30).optional().default([]),
  features: projectFeaturesSchema.optional().default({
    createTicket: true,
    trackStatus: true,
    priceEstimate: false,
    faqAutoReply: true,
    collectCsat: true,
    humanHandover: false,
  }),
});

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
});

export const createTechnicianSchema = z.object({
  name: z.string().trim().min(2, "กรุณากรอกชื่อช่าง").max(100),
  phone: z.string().trim().min(8).max(20),
  area: z.string().trim().min(1, "กรุณาระบุพื้นที่รับผิดชอบ").max(100),
  specialty: z.string().trim().max(200).optional().nullable(),
});

export const updateTechnicianSchema = createTechnicianSchema
  .partial()
  .extend({ status: z.nativeEnum(TechnicianStatus).optional() });

export const updateProjectTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  technicianId: z.string().nullable().optional(),
  note: z.string().trim().max(500).optional(),
});

export const createReviewWebhookSchema = z.object({
  ticket: z.string().trim().min(1).max(100),
  customer_name: z.string().trim().min(2).max(100).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().default(""),
});

export const createConversationWebhookSchema = z.object({
  ticket: z.string().trim().min(1).max(100),
  messages: z
    .array(
      z.object({
        sender: z.enum(["CUSTOMER", "BOT"]),
        text: z.string().trim().min(1).max(2000),
        timestamp: z.string().datetime({ offset: true }).optional(),
      })
    )
    .min(1)
    .max(100),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
