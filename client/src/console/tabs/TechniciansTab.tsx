import { useState } from 'react';
import { MOCK_TECHS, ProjectItem, TechnicianItem } from '../mockConsoleData';

interface Props {
  project: ProjectItem;
}

export function TechniciansTab({ project }: Props) {
  const [techs, setTechs] = useState<TechnicianItem[]>(MOCK_TECHS);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  const projectTechs = techs.filter((t) => t.projectId === project.id);

  const handleAddTech = () => {
    if (!newName.trim()) return;
    const added: TechnicianItem = {
      id: `tech-${Date.now()}`,
      projectId: project.id,
      name: newName.trim(),
      specialty: newSpecialty.trim() || 'ช่างประจำร้าน',
      activeJobs: 0,
      status: 'AVAILABLE',
    };
    setTechs((prev) => [...prev, added]);
    setNewName('');
    setNewSpecialty('');
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
        <span className="font-bold text-emerald-200">ขอบเขตงานทีม (ไฟล์ TechniciansTab.tsx): </span>
        <span>ทำระบบเพิ่ม/แก้ไข/ลบรายชื่อช่างประจำโปรเจกต์ลงฐานข้อมูล และหน้าแก้ไขค่าเชื่อมต่อ Chatbot / Voicebot</span>
      </div>

      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-white">เพิ่มรายชื่อช่างประจำร้าน ({project.name})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ชื่อช่าง เช่น ช่างนนท์"
            className="px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500"
          />
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="ความถนัด เช่น ช่างซ่อมบอร์ด / ช่างสี"
            className="px-3.5 py-2 rounded-xl bg-[#0b0f19] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleAddTech}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 cursor-pointer"
          >
            + เพิ่มช่างเข้าโปรเจกต์
          </button>
        </div>

        <div className="divide-y divide-slate-800 pt-2">
          {projectTechs.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-400">
              ยังไม่มีรายชื่อช่างในโปรเจกต์นี้ ลองพิมพ์เพิ่มช่างด้านบนได้เลย
            </div>
          ) : (
            projectTechs.map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">{t.name}</div>
                  <div className="text-xs text-slate-400">ความถนัด: {t.specialty}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  ถือเคสอยู่ {t.activeJobs} งาน
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 space-y-2 text-sm">
        <h3 className="font-bold text-white">ข้อมูลการผูกบอทของโปรเจกต์นี้</h3>
        <div className="text-slate-400">รหัส Chatbot ID: <span className="text-slate-200">{project.botnoiBotId || '-'}</span></div>
        <div className="text-slate-400">รหัส Voicebot Agent ID: <span className="text-slate-200">{project.voiceAgentId || '-'}</span></div>
        <div className="text-slate-400">
          ฟิลด์ข้อมูลที่บอทถามลูกค้า: <span className="text-slate-200">{project.requiredFields.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}
