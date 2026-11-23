import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadProjects, ProjectItem } from './mockConsoleData';
import { TicketsTab } from './tabs/TicketsTab';
import { ConversationsTab } from './tabs/ConversationsTab';
import { SatisfactionTab } from './tabs/SatisfactionTab';
import { TechniciansTab } from './tabs/TechniciansTab';

type TabKey = 'tickets' | 'conversations' | 'satisfaction' | 'technicians';

export function ConsoleLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('tickets');

  useEffect(() => {
    setProjects(loadProjects());
  }, [projectId]);

  const currentProject = projects.find((p) => p.id === projectId) || projects[0];

  if (!currentProject) {
    return null;
  }

  const menuItems: { key: TabKey; label: string }[] = [
    { key: 'tickets', label: 'ภาพรวมและใบงาน (Tickets)' },
    { key: 'conversations', label: 'ประวัติแชทบอท (Conversations)' },
    { key: 'satisfaction', label: 'ความพึงพอใจลูกค้า (CSAT)' },
    { key: 'technicians', label: 'ทีมช่างและตั้งค่าบอท' },
  ];

  return (
    <div className="min-h-screen flex bg-[#0b0f19] text-slate-100 font-sans">
      <aside className="w-68 bg-[#111827] border-r border-slate-800 text-slate-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/projects" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center">
              P
            </div>
            <span className="font-bold tracking-tight text-white">Plasom Console</span>
          </Link>
        </div>

        <div className="p-4 border-b border-slate-800">
          <label className="block text-xs text-slate-400 mb-1.5">สลับโปรเจกต์ร้านค้า</label>
          <select
            value={currentProject.id}
            onChange={(e) => navigate(`/projects/${e.target.value}`)}
            className="w-full px-3 py-2 rounded-lg bg-[#0b0f19] border border-slate-700 text-sm text-white focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.branchName})
              </option>
            ))}
          </select>
          <Link
            to="/projects"
            className="inline-block mt-2.5 text-xs text-slate-400 hover:text-white"
          >
            ดูโปรเจกต์ทั้งหมด / + สร้างเพิ่ม
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === item.key
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="truncate">{user?.name}</span>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-slate-400 hover:text-rose-400 cursor-pointer"
          >
            ออกระบบ
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#111827] border-b border-slate-800 px-8 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">
            {currentProject.name} — {currentProject.branchName}
          </h1>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
            Webhook พร้อมรับใบงาน
          </span>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'tickets' && <TicketsTab project={currentProject} />}
          {activeTab === 'conversations' && <ConversationsTab project={currentProject} />}
          {activeTab === 'satisfaction' && <SatisfactionTab project={currentProject} />}
          {activeTab === 'technicians' && <TechniciansTab project={currentProject} />}
        </main>
      </div>
    </div>
  );
}
