import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Phone, User as UserIcon, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { ApiResponse, User } from '../lib/types';
import { sanitizePhoneInput } from '../lib/format';

export function ConsoleLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
          setIsLoading(false);
          return;
        }
        const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', {
          name,
          phone,
          password,
        });
        if (res.data.success) {
          login(res.data.data.token, res.data.data.user);
          navigate('/projects');
        } else {
          setError(res.data.error || 'สมัครสมาชิกไม่สำเร็จ');
        }
      } else {
        const res = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
          phone,
          password,
        });
        if (res.data.success) {
          login(res.data.data.token, res.data.data.user);
          navigate('/projects');
        } else {
          setError(res.data.error || 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          (mode === 'register' ? 'ไม่สามารถสมัครสมาชิกได้ กรุณาตรวจสอบข้อมูล' : 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center">
            P
          </div>
          <span className="font-bold text-slate-100">Plasom Console</span>
        </Link>
        <Link to="/" className="text-xs text-slate-400 hover:text-slate-200">
          กลับหน้าแรก
        </Link>
      </div>

      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'เข้าสู่ระบบผู้ประกอบการ' : 'สมัครเปิดบัญชีร้านค้าใหม่'}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            จัดการใบงานแจ้งซ่อม ประวัติแชท AI และทีมช่างในที่เดียว
          </p>
        </div>

        <div className="grid grid-cols-2 p-1 bg-[#0b0f19] border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'register' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            สมัครสมาชิกใหม่
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/70 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>ชื่อผู้ประกอบการ / ชื่อผู้ดูแล</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อของคุณ"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0b0f19] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>เบอร์มือถือที่ลงทะเบียน</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              placeholder="กรอกตัวเลข 10 หลัก"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#0b0f19] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>รหัสผ่าน</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              className="w-full px-3.5 py-2.5 text-sm bg-[#0b0f19] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>ยืนยันรหัสผ่านอีกครั้ง</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                className="w-full px-3.5 py-2.5 text-sm bg-[#0b0f19] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังตรวจสอบข้อมูล...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่หน้า Console</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>ยืนยันสมัครและเข้าใช้งาน</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
