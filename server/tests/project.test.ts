import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "crypto";
import {
  createProject,
  createProjectTechnician,
  getProjectTickets,
  rotateProjectWebhookSecret,
  updateProjectTicket,
} from "../src/controllers/project.controller";
import { createProjectTicketFromBotnoi } from "../src/controllers/ticket.controller";
import { createProjectReviewFromBotnoi } from "../src/controllers/webhook.controller";
import { mockRes, stubPrisma } from "./helpers";

function nextSpy() {
  const calls: unknown[] = [];
  const fn = (err?: unknown) => calls.push(err);
  return Object.assign(fn, { calls });
}

test("createProject: บันทึกร้านของผู้ใช้และคืน secret สำหรับตั้ง webhook", async () => {
  let createdData: any;
  const restore = stubPrisma({
    project: {
      create: async ({ data }: any) => {
        createdData = data;
        const { webhookSecretHash: _secretHash, ...safeData } = data;
        return { id: "p1", ...safeData };
      },
    },
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await createProject(
      {
        user: { id: "u1" },
        body: {
          name: "ร้านทดสอบ",
          category: "ซ่อมแอร์",
          branchName: "สำนักงานใหญ่",
        },
      } as any,
      res,
      next as any
    );

    assert.deepEqual(next.calls, []);
    assert.equal(res.statusCode, 201);
    assert.equal(createdData.ownerId, "u1");
    assert.equal(createdData.name, "ร้านทดสอบ");
    assert.match(createdData.webhookSecretHash, /^[a-f0-9]{64}$/);
    assert.equal(res.body.data.webhookUrl, "/api/webhooks/p1");
    assert.equal(res.body.data.webhookSecret.length, 64);
    assert.equal(res.body.data.webhookSecretHash, undefined);
  } finally {
    restore();
  }
});

test("getProjectTickets: ตรวจเจ้าของร้านและจำกัดใบงานด้วย projectId", async () => {
  let where: any;
  const restore = stubPrisma({
    project: { findFirst: async () => ({ id: "p1" }) },
    ticket: {
      findMany: async (args: any) => {
        where = args.where;
        return [];
      },
      count: async () => 0,
    },
  });
  try {
    const res = mockRes();
    await getProjectTickets(
      { user: { id: "u1" }, params: { projectId: "p1" }, query: {} } as any,
      res,
      nextSpy() as any
    );
    assert.deepEqual(where, { projectId: "p1" });
    assert.equal(res.body.total, 0);
  } finally {
    restore();
  }
});

test("createProjectTechnician: ผูกช่างกับร้านที่เจ้าของร้องขอ", async () => {
  let createdData: any;
  const restore = stubPrisma({
    project: { findFirst: async () => ({ id: "p1" }) },
    technician: {
      create: async ({ data }: any) => {
        createdData = data;
        return { id: "tech1", ...data };
      },
    },
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await createProjectTechnician(
      {
        user: { id: "u1" },
        params: { projectId: "p1" },
        body: { name: "ช่างทดสอบ", phone: "0812345678", area: "กรุงเทพฯ", specialty: "" },
      } as any,
      res,
      next as any
    );

    assert.deepEqual(next.calls, []);
    assert.equal(res.statusCode, 201);
    assert.equal(createdData.projectId, "p1");
    assert.equal(createdData.specialty, null);
  } finally {
    restore();
  }
});

test("updateProjectTicket: ปฏิเสธช่างที่ไม่ได้อยู่ในร้านเดียวกับใบงาน", async () => {
  let transactionCalled = false;
  const restore = stubPrisma({
    project: { findFirst: async () => ({ id: "p1" }) },
    ticket: { findFirst: async () => ({ id: "t1", status: "SUBMITTED" }) },
    technician: { findFirst: async () => null },
    $transaction: async () => {
      transactionCalled = true;
    },
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await updateProjectTicket(
      {
        user: { id: "u1" },
        params: { projectId: "p1", ticketId: "t1" },
        body: { technicianId: "foreign-tech" },
      } as any,
      res,
      next as any
    );

    assert.deepEqual(next.calls, []);
    assert.equal(res.statusCode, 404);
    assert.equal(transactionCalled, false);
  } finally {
    restore();
  }
});

test("rotateProjectWebhookSecret: บันทึกเฉพาะ hash และคืน secret ใหม่ครั้งเดียว", async () => {
  let updatedData: any;
  const restore = stubPrisma({
    project: {
      findFirst: async () => ({ id: "p1" }),
      update: async ({ data }: any) => {
        updatedData = data;
        return { id: "p1" };
      },
    },
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await rotateProjectWebhookSecret(
      { user: { id: "u1" }, params: { projectId: "p1" } } as any,
      res,
      next as any
    );

    assert.deepEqual(next.calls, []);
    assert.equal(res.body.data.webhookSecret.length, 64);
    assert.equal(updatedData.webhookSecretHash, createHash("sha256").update(res.body.data.webhookSecret).digest("hex"));
    assert.equal(res.body.data.webhookUrl, "/api/webhooks/p1");
  } finally {
    restore();
  }
});

test("project webhook: ตรวจ secret ก่อนสร้างใบงานและบันทึก projectId", async () => {
  const secret = "test-webhook-secret";
  let createdTicket: any;
  const restore = stubPrisma({
    project: {
      findUnique: async () => ({
        id: "p1",
        webhookSecretHash: createHash("sha256").update(secret).digest("hex"),
      }),
    },
    ticket: {
      findUnique: async () => null,
      findFirst: async () => null,
    },
    $transaction: async (callback: any) =>
      callback({
        ticket: {
          create: async ({ data }: any) => {
            createdTicket = data;
            return { id: "t1", ...data };
          },
        },
        statusLog: { create: async () => ({}) },
      }),
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await createProjectTicketFromBotnoi(
      {
        params: { projectId: "p1" },
        headers: { "x-webhook-secret": secret },
        header: (name: string) => (name.toLowerCase() === "x-webhook-secret" ? secret : undefined),
        body: {
          customer_name: "ลูกค้าทดสอบ",
          phone: "0812345678",
          info: "Carrier | แอร์ไม่เย็น | 123 ถ.ทดสอบ กรุงเทพฯ",
          extra_fields: {
            appliance_model: "AC-9000",
            installation: { serial_number: "SN-123", room: "ห้องนอน" },
          },
          date: new Date(Date.now() + 86400000).toISOString(),
        },
      } as any,
      res,
      next as any
    );

    assert.deepEqual(next.calls, []);
    assert.equal(res.statusCode, 201);
    assert.equal(createdTicket.projectId, "p1");
    assert.equal(createdTicket.customerPhone, "0812345678");
    assert.deepEqual(createdTicket.extraFields, {
      appliance_model: "AC-9000",
      installation: { serial_number: "SN-123", room: "ห้องนอน" },
    });
  } finally {
    restore();
  }
});

test("project webhook: ปฏิเสธ secret ที่ไม่ถูกต้อง", async () => {
  let ticketLookupCalled = false;
  const restore = stubPrisma({
    project: {
      findUnique: async () => ({ id: "p1", webhookSecretHash: "a".repeat(64) }),
    },
    ticket: {
      findUnique: async () => {
        ticketLookupCalled = true;
        return null;
      },
    },
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await createProjectTicketFromBotnoi(
      {
        params: { projectId: "p1" },
        headers: {},
        header: () => undefined,
        body: {},
      } as any,
      res,
      next as any
    );
    assert.equal(res.statusCode, 401);
    assert.equal(ticketLookupCalled, false);
    assert.deepEqual(next.calls, []);
  } finally {
    restore();
  }
});

test("review webhook: รับคะแนนได้เมื่อใบงานของร้านเสร็จแล้ว", async () => {
  const secret = "review-webhook-secret";
  let reviewData: any;
  const restore = stubPrisma({
    project: {
      findUnique: async () => ({
        webhookSecretHash: createHash("sha256").update(secret).digest("hex"),
      }),
    },
    ticket: {
      findFirst: async () => ({
        id: "ticket1",
        status: "COMPLETED",
        customerName: "ลูกค้าทดสอบ",
        trackingCode: "CC-20261124-ABCD",
      }),
    },
    review: {
      findUnique: async () => null,
      create: async ({ data }: any) => {
        reviewData = data;
        return { id: "review1", ...data };
      },
    },
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await createProjectReviewFromBotnoi(
      {
        params: { projectId: "p1" },
        header: (name: string) => (name.toLowerCase() === "x-webhook-secret" ? secret : undefined),
        body: { ticket: "CC-20261124-ABCD", rating: "5", comment: "เยี่ยมมาก" },
      } as any,
      res,
      next as any
    );

    assert.deepEqual(next.calls, []);
    assert.equal(res.statusCode, 201);
    assert.equal(reviewData.ticketId, "ticket1");
    assert.equal(reviewData.rating, 5);
    assert.equal(res.body.data.ticketCode, "CC-20261124-ABCD");
  } finally {
    restore();
  }
});

test("review webhook: ปฏิเสธรีวิวก่อนใบงานเสร็จสิ้น", async () => {
  const secret = "review-webhook-secret";
  let reviewLookupCalled = false;
  const restore = stubPrisma({
    project: {
      findUnique: async () => ({
        webhookSecretHash: createHash("sha256").update(secret).digest("hex"),
      }),
    },
    ticket: {
      findFirst: async () => ({
        id: "ticket1",
        status: "IN_PROGRESS",
        customerName: "ลูกค้าทดสอบ",
        trackingCode: "CC-20261124-ABCD",
      }),
    },
    review: {
      findUnique: async () => {
        reviewLookupCalled = true;
        return null;
      },
    },
  });
  try {
    const res = mockRes();
    const next = nextSpy();
    await createProjectReviewFromBotnoi(
      {
        params: { projectId: "p1" },
        header: (name: string) => (name.toLowerCase() === "x-webhook-secret" ? secret : undefined),
        body: { ticket: "CC-20261124-ABCD", rating: 5 },
      } as any,
      res,
      next as any
    );

    assert.deepEqual(next.calls, []);
    assert.equal(res.statusCode, 409);
    assert.equal(reviewLookupCalled, false);
  } finally {
    restore();
  }
});
