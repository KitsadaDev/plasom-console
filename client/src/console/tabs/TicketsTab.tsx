import { useState } from 'react';
import { ConsoleTicket, MOCK_TECHS, MOCK_TICKETS, ProjectItem } from '../mockConsoleData';

interface Props {
  project: ProjectItem;
}

export function TicketsTab({ project }: Props) {
  const [tickets, setTickets] = useState<ConsoleTicket[]>(MOCK_TICKETS);
  const projectTickets = tickets.filter((t) => t.projectId === project.id);
  const projectTechs = MOCK_TECHS.filter((t) => t.projectId === project.id);

  const handleAssignTech = (ticketId: string, techName: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              assignedTechName: techName || undefined,
              status: techName ? 'ASSIGNED' : 'PENDING',
            }
          : t
      )
    );
  };

  const handleSimulateWebhook = () => {
    const dynamicExtra: Record<string, string> = {};
    project.requiredFields.forEach((field) => {
      dynamicExtra[field] = `ตัวอย่างข้อมูล${field}`;
    });

    const mockNew: ConsoleTicket = {
      id: `t-${Date.now()}`,
      trackingCode: `PS-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: project.id,
      customerName: 'คุณลูกค้าทดสอบ (จากบอท)',
      customerPhone: '[เบอร์ติดต่อลูกค้า]',
      channel: 'LINE OA',
      subject: `แจ้งงานหมวด ${project.category}`,
      symptom: 'ลูกค้าแจ้งอาการผ่านแชทบอทของร้านเข้ามาใหม่',
      preferredDate: '2026-11-27',
      status: 'PENDING',
      extraDetails: dynamicExtra,
    };
    setTickets((prev) => [mockNew, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-bold text-blue-200">ขอบเขตงานทีม (ไฟล์ TicketsTab.tsx): </span>
          <span>เชื่อมต่อ API ดึงรายการใบงานตามโปรเจกต์, ช่องค้นหา/กรองสถานะ, กดจ่ายงานช่าง และปุ่ม Export PDF/Excel</span>
        </div>
        <button
          type="button"
          onClick={handleSimulateWebhook}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 cursor-pointer"
        >
          + จำลองเคสเด้งจากบอทเข้าร้านนี้
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ใบงานทั้งหมด', value: projectTickets.length },
          {
            label: 'รอจ่ายงานช่าง',
            value: projectTickets.filter((t) => t.status === 'PENDING').length,
          },
          {
            label: 'มอบหมายช่างแล้ว',
            value: projectTickets.filter((t) => t.status === 'ASSIGNED').length,
          },
          { label: 'หัวข้อข้อมูลเฉพาะร้าน', value: project.requiredFields.length },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="text-xs text-slate-400">{stat.label}</div>
            <div className="mt-1 text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {projectTickets.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-2">
          <div className="font-bold text-slate-200">ยังไม่มีใบงานแจ้งซ่อมในโปรเจกต์นี้</div>
          <p className="text-sm text-slate-400">
            กดปุ่ม &quot;+ จำลองเคสเด้งจากบอทเข้าร้านนี้&quot; ด้านบนเพื่อทดสอบการแสดงผลข้อมูลยืดหยุ่นตามอาชีพ
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projectTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-orange-500 text-white">
                      {ticket.trackingCode}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                      ช่องทาง: {ticket.channel}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                        ticket.status === 'ASSIGNED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {ticket.status === 'ASSIGNED' ? 'จ่ายงานช่างแล้ว' : 'รอจัดสรรช่าง'}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-white">
                    {ticket.subject} — {ticket.symptom}
                  </h3>
                  <div className="mt-1 text-xs text-slate-400">
                    ลูกค้า: {ticket.customerName} ({ticket.customerPhone}) | วันนัดหมาย: {ticket.preferredDate}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-medium">มอบหมายช่าง:</label>
                  <select
                    value={ticket.assignedTechName || ''}
                    onChange={(e) => handleAssignTech(ticket.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#0b0f19] border border-slate-700 text-xs text-slate-100"
                  >
                    <option value="">-- เลือกช่างในสังกัด --</option>
                    {projectTechs.map((tech) => (
                      <option key={tech.id} value={tech.name}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  ข้อมูลเฉพาะทางที่บอทเก็บมา (Dynamic JSON Fields):
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ticket.extraDetails).map(([key, val]) => (
                    <span
                      key={key}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#0b0f19] border border-slate-800 text-slate-300"
                    >
                      <strong className="text-white">{key}:</strong> {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
