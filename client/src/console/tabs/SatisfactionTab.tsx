import { MOCK_REVIEWS, ProjectItem } from '../mockConsoleData';

interface Props {
  project: ProjectItem;
}

export function SatisfactionTab({ project }: Props) {
  const reviews = MOCK_REVIEWS.filter((r) => r.projectId === project.id);
  const avgScore =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
        <span className="font-bold text-amber-200">ขอบเขตงานทีม (ไฟล์ SatisfactionTab.tsx): </span>
        <span>ทำแดชบอร์ดกราฟสรุปคะแนนความพึงพอใจ (CSAT 1-5 ดาว) และรายการคำติชมหลังช่างปิดงานซ่อม</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="text-xs text-slate-400">คะแนนความพึงพอใจเฉลี่ย</div>
          <div className="mt-2 text-3xl font-bold text-amber-400">{avgScore} / 5.0</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="text-xs text-slate-400">จำนวนรีวิวทั้งหมด</div>
          <div className="mt-2 text-3xl font-bold text-white">{reviews.length} รายการ</div>
        </div>
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
          <div className="text-xs text-slate-400">สถานะระบบส่งแบบประเมิน</div>
          <div className="mt-2 text-lg font-bold text-emerald-400">
            {project.features.collectCsat ? 'เปิดส่งอัตโนมัติหลังจบงาน' : 'ปิดอยู่'}
          </div>
        </div>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-slate-800 divide-y divide-slate-800">
        {reviews.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            ยังไม่มีข้อมูลรีวิวในโปรเจกต์นี้
          </div>
        ) : (
          reviews.map((rv) => (
            <div key={rv.id} className="p-5 flex items-start justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-white">
                  {rv.customerName}{' '}
                  <span className="font-normal text-xs text-slate-400">
                    (ใบงาน {rv.ticketCode})
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{rv.comment}</p>
              </div>
              <div className="shrink-0 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm">
                {'★'.repeat(rv.rating)} ({rv.rating}/5)
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
