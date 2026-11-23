import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LandingConsolePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center text-lg">
              P
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Plasom Console</span>
              <span className="ml-2 text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                B2B Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs sm:text-sm text-emerald-400 font-medium">
                  สวัสดี, {user.name}
                </span>
                <Link
                  to="/projects"
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  ไปที่โปรเจกต์ของฉัน
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/projects"
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  เริ่มต้นใช้งาน Console
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="inline-block px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/20 mb-6">
          แพลตฟอร์มกลางจัดการงานซ่อมและบริการหลังการขายด้วย AI
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          รวมแชทลูกค้า ใบงานแจ้งซ่อม และทีมช่างของทุกร้านไว้ใน Console เดียว
        </h1>
        <p className="mt-5 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          รองรับทุกธุรกิจงานซ่อม ไม่ว่าจะเป็นร้านแอร์ อู่รถยนต์ ร้านซ่อมมือถือ หรือเฟอร์นิเจอร์
          เพียงผูก Chatbot และ Voicebot ประจำร้าน ระบบพร้อมเปิดใบงานเข้า Dashboard อัตโนมัติ
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={user ? '/projects' : '/login'}
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
          >
            {user ? 'เข้าสู่หน้าจัดการโปรเจกต์' : 'เข้าสู่ระบบเพื่อจัดการร้านค้า'}
          </Link>
          <Link
            to={user ? '/projects/new' : '/login'}
            className="px-6 py-3 rounded-xl bg-[#111827] text-slate-200 font-semibold border border-slate-700 hover:border-slate-500 transition-colors"
          >
            + สร้างโปรเจกต์บอทใหม่
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="font-bold text-white text-lg">รองรับหลายสาขาและทุกอาชีพซ่อม</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              หนึ่งบัญชีสร้างแยกได้หลายโปรเจกต์ กำหนดหัวข้อข้อมูลที่ต้องการให้ AI ถามลูกค้าได้อย่างอิสระตามประเภทธุรกิจ
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="font-bold text-white text-lg">ดูประวัติแชทคู่กับใบงานทันที</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              ตรวจสอบบทสนทนาจาก LINE OA, Messenger และสายโทร Voicebot ย้อนหลังได้ครบถ้วน ไม่ตกหล่นรายละเอียดหน้างาน
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="font-bold text-white text-lg">จ่ายงานช่างและวัดผลความพึงพอใจ</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              เพิ่มรายชื่อทีมช่างประจำร้านเพื่อกดมอบหมายงานซ่อม พร้อมแดชบอร์ดสรุปคะแนนรีวิวหลังจบงาน
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
