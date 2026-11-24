import type { ChatThread, SatisfactionItem } from '../mockConsoleData';

/**
 * ร้านตัวอย่างจะถูกเติมรหัสผู้ใช้ต่อท้าย id (เช่น proj-air-rama2-abc123)
 * จึงต้องนับว่าข้อมูลที่ผูกกับ proj-air-rama2 เป็นของร้านนั้นด้วย
 */
export function belongsToProject(itemProjectId: string, projectId: string): boolean {
  if (projectId === itemProjectId) return true;
  if (!projectId.startsWith(`${itemProjectId}-`)) return false;
  // ส่วนท้ายต้องเป็นรหัสผู้ใช้ชิ้นเดียว (ไม่มี -) กันไม่ให้ proj-air ไปจับ proj-air-rama2-xxx
  return !projectId.slice(itemProjectId.length + 1).includes('-');
}

/** ค้นหาห้องแชทจากชื่อลูกค้า (ไม่สนตัวพิมพ์เล็ก/ใหญ่ และช่องว่างหัวท้าย) */
export function filterThreadsByCustomer(threads: ChatThread[], query: string): ChatThread[] {
  const q = query.trim().toLowerCase();
  if (!q) return threads;
  return threads.filter((t) => t.customerName.toLowerCase().includes(q));
}

export interface RatingBucket {
  star: number;
  count: number;
  percent: number;
}

/** นับจำนวนรีวิวแต่ละระดับดาว เรียงจาก 5 ลงไป 1 */
export function ratingDistribution(reviews: SatisfactionItem[]): RatingBucket[] {
  const total = reviews.length;
  return [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count, percent: total === 0 ? 0 : Math.round((count / total) * 100) };
  });
}

/** คะแนนเฉลี่ยทศนิยม 1 ตำแหน่ง เช่น "4.5" (ไม่มีรีวิว = "0.0") */
export function averageRating(reviews: SatisfactionItem[]): string {
  if (reviews.length === 0) return '0.0';
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
}

/** กรองรีวิวตามจำนวนดาว (null = ทั้งหมด) เรียงใหม่สุดก่อน */
export function filterReviewsByRating(
  reviews: SatisfactionItem[],
  star: number | null,
): SatisfactionItem[] {
  const list = star === null ? reviews : reviews.filter((r) => Math.round(r.rating) === star);
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
