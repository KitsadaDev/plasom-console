import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadProjects, ProjectItem } from './mockConsoleData';

export function ProjectsListPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      <header className="bg-[#111827] border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center">
              P
            </div>
            <span className="font-bold text-white">Plasom Console</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium">
              ผู้ใช้งาน: {user?.name} ({user?.role})
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-rose-400 cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">โปรเจกต์และร้านค้าของคุณ</h1>
            <p className="text-sm text-slate-400 mt-1">
              เลือกโปรเจกต์เพื่อเข้าดูใบงานแจ้งซ่อม ประวัติการสนทนากับบอท และจัดการทีมช่าง
            </p>
          </div>
          <Link
            to="/projects/new"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            + สร้างโปรเจกต์ใหม่
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="block p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                  {proj.category}
                </span>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                  ออนไลน์
                </span>
              </div>

              <h2 className="mt-4 text-lg font-bold text-white">{proj.name}</h2>
              <p className="text-sm text-slate-400">{proj.branchName}</p>

              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                    proj.chatbotConnected
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  Chatbot: {proj.chatbotConnected ? 'เชื่อมต่อแล้ว' : 'ยังไม่ผูก'}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                    proj.voicebotConnected
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  Voicebot: {proj.voicebotConnected ? 'เชื่อมต่อแล้ว' : 'ยังไม่ผูก'}
                </span>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                ข้อมูลที่บอทเก็บ: {proj.requiredFields.slice(0, 3).join(', ')}
                {proj.requiredFields.length > 3 ? ' ...' : ''}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
