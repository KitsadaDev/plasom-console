import { test } from "node:test";
import assert from "node:assert/strict";
import { createTicketSchema } from "../src/validations/ticket.validation";

const base = {
  service: "REPAIR",
  brand: "Carrier",
  symptom: "ไม่เย็น",
  address: "123 ถ.ลาดพร้าว กรุงเทพฯ",
  preferredDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
  customerName: "สมชาย",
  customerPhone: "0812345678",
};

test("createTicketSchema: ข้อมูลปกติผ่าน", () => {
  assert.equal(createTicketSchema.safeParse(base).success, true);
});

test("createTicketSchema: เบอร์ 9 หลักไม่ผ่าน", () => {
  assert.equal(createTicketSchema.safeParse({ ...base, customerPhone: "081234567" }).success, false);
});

test("createTicketSchema: lat/lng ต้องอยู่ในช่วงที่ถูกต้อง", () => {
  assert.equal(createTicketSchema.safeParse({ ...base, lat: 91, lng: 100 }).success, false);
  assert.equal(createTicketSchema.safeParse({ ...base, lat: 13.7, lng: 181 }).success, false);
  assert.equal(createTicketSchema.safeParse({ ...base, lat: -91, lng: 0 }).success, false);
  assert.equal(createTicketSchema.safeParse({ ...base, lat: 13.7563, lng: 100.5018 }).success, true);
  assert.equal(createTicketSchema.safeParse({ ...base, lat: 0, lng: 0 }).success, true);
});

test("createTicketSchema: เก็บฟิลด์แจ้งซ่อม JSON แบบซ้อนและใส่ค่าเริ่มต้นเมื่อไม่ส่ง", () => {
  const parsed = createTicketSchema.parse({
    ...base,
    extraFields: { รุ่นโซฟา: "M-2", รายละเอียด: { วัสดุ: "ผ้า", ตำแหน่ง: ["เบาะ", "พนักพิง"] } },
  });
  assert.deepEqual(parsed.extraFields, {
    รุ่นโซฟา: "M-2",
    รายละเอียด: { วัสดุ: "ผ้า", ตำแหน่ง: ["เบาะ", "พนักพิง"] },
  });
  assert.deepEqual(createTicketSchema.parse(base).extraFields, {});
});

test("createTicketSchema: จำกัดจำนวนและขนาดฟิลด์ JSON", () => {
  const tooManyFields = Object.fromEntries(
    Array.from({ length: 31 }, (_, index) => [`field_${index}`, "value"])
  );
  assert.equal(createTicketSchema.safeParse({ ...base, extraFields: tooManyFields }).success, false);
  assert.equal(
    createTicketSchema.safeParse({ ...base, extraFields: { details: "x".repeat(10_001) } }).success,
    false
  );
});

