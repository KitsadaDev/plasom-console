import { useState } from 'react';
import { MOCK_THREADS, ProjectItem } from '../mockConsoleData';

interface Props {
  project: ProjectItem;
}

export function ConversationsTab({ project }: Props) {
  const threads = MOCK_THREADS.filter((t) => t.projectId === project.id);
  const [selectedId, setSelectedId] = useState<string>(threads[0]?.id || '');

  const activeThread = threads.find((t) => t.id === selectedId) || threads[0];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
        <span className="font-bold text-purple-200">ขอบเขตงานทีม (ไฟล์ ConversationsTab.tsx): </span>
        <span>เชื่อมต่อ API ประวัติการสนทนาจาก Botnoi เพื่อแสดงข้อความที่ลูกค้าคุยกับบอทใน LINE / Messenger / Voicebot</span>
      </div>

      {threads.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center text-sm text-slate-400">
          ยังไม่มีประวัติบทสนทนาในโปรเจกต์นี้ (ลองสลับไปดูโปรเจกต์ตัวอย่างด้านซ้ายมือเพื่อดูหน้าตาห้องแชท)
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden min-h-[420px]">
          <div className="border-r border-slate-800 divide-y divide-slate-800">
            {threads.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setSelectedId(th.id)}
                className={`w-full text-left p-4 hover:bg-slate-800/60 transition-colors cursor-pointer ${
                  activeThread?.id === th.id ? 'bg-slate-800/90' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{th.customerName}</span>
                  <span className="text-xs text-slate-400">{th.updatedAt}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400 truncate">{th.lastMessage}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {th.channel}
                  </span>
                  {th.openedTicketCode && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-orange-500 text-white font-mono">
                      เปิดเคส: {th.openedTicketCode}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 p-6 flex flex-col justify-between bg-[#0b0f19]/60">
            {activeThread && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="font-bold text-white">
                    บทสนทนากับ {activeThread.customerName} ({activeThread.channel})
                  </div>
                  {activeThread.openedTicketCode && (
                    <span className="text-xs font-semibold text-orange-400">
                      เชื่อมกับใบงาน #{activeThread.openedTicketCode}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {activeThread.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.sender === 'BOT' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          m.sender === 'BOT'
                            ? 'bg-orange-500 text-white'
                            : 'bg-[#111827] border border-slate-700 text-slate-100'
                        }`}
                      >
                        <div>{m.text}</div>
                        <div className="text-[10px] opacity-70 mt-1 text-right">{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
