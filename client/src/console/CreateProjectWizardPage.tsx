import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Copy, Loader2, ShieldCheck } from 'lucide-react';
import { BotFeatures, saveNewProject } from './mockConsoleData';
import { useAuth } from '../context/AuthContext';
import { createProjectApi } from './consoleApi';

const CATEGORY_PRESETS: Record<string, string[]> = {
  'งานแอร์และเครื่องทำความเย็น': ['ยี่ห้อแอร์', 'ขนาด BTU', 'อาการเสีย', 'ที่อยู่หน้างาน', 'วันนัดหมาย'],
  'อู่ซ่อมรถยนต์และเช็กระยะ': ['รุ่นรถยนต์', 'เลขทะเบียน', 'เลขไมล์', 'อาการผิดปกติ', 'วันนัดเข้าอู่'],
  'ซ่อมมือถือและอุปกรณ์ไอที': ['รุ่นอุปกรณ์', 'อาการเสีย', 'สถานะประกัน', 'เบอร์ติดต่อกลับ', 'วันนัดรับเครื่อง'],
  'ซ่อมโซฟาและเฟอร์นิเจอร์': ['ชนิดเฟอร์นิเจอร์', 'วัสดุหุ้ม', 'จุดที่ชำรุด', 'ที่อยู่รับส่งงาน', 'วันนัดประเมิน'],
};

export function CreateProjectWizardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('สำนักงานใหญ่');
  const [category, setCategory] = useState('งานแอร์และเครื่องทำความเย็น');
  const [fieldsText, setFieldsText] = useState(
    CATEGORY_PRESETS['งานแอร์และเครื่องทำความเย็น'].join(', ')
  );

  const [botMode, setBotMode] = useState<'AUTO' | 'EXISTING'>('AUTO');
  const [botnoiBotId, setBotnoiBotId] = useState('');
  const [voiceAgentId, setVoiceAgentId] = useState('');
  const [greetingMessage, setGreetingMessage] = useState(
    'สวัสดีค่ะ ยินดีให้บริการ แจ้งรายละเอียดอาการเสียและวันนัดหมายได้เลยนะคะ'
  );
  const [features, setFeatures] = useState<BotFeatures>({
    createTicket: true,
    trackStatus: true,
    priceEstimate: true,
    faqAutoReply: true,
    collectCsat: true,
    humanHandover: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    projectId: string;
    webhookUrl: string;
    webhookSecret: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<'url' | 'secret' | null>(null);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (CATEGORY_PRESETS[newCategory]) {
      setFieldsText(CATEGORY_PRESETS[newCategory].join(', '));
    }
  };

  const toggleFeature = (key: keyof BotFeatures) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = async (text: string, key: 'url' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback ignored
    }
  };

  const handleCreateFinish = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const parsedFields = fieldsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalName = name.trim().length >= 2 ? name.trim() : 'ร้านบริการซ่อมสาขาใหม่';
    const finalBranch = branchName.trim().length >= 1 ? branchName.trim() : 'สาขาหลัก';
    const finalBotId =
      botMode === 'AUTO' ? `auto-bot-${Date.now()}` : botnoiBotId.trim() || null;
    const finalVoiceId =
      botMode === 'AUTO' ? `auto-voice-${Date.now()}` : voiceAgentId.trim() || null;

    try {
      const { project, webhookUrl, webhookSecret } = await createProjectApi({
        name: finalName,
        branchName: finalBranch,
        category,
        chatbotConnected: Boolean(finalBotId),
        botnoiBotId: finalBotId,
        voicebotConnected: Boolean(finalVoiceId),
        voiceAgentId: finalVoiceId,
        greetingMessage,
        requiredFields: parsedFields.length > 0 ? parsedFields : ['อาการเสีย', 'วันนัดหมาย'],
        features,
      });

      // ซิงก์เข้า local cache ด้วยเพื่อให้ ConsoleLayout เปิดต่อได้ไร้รอยต่อ
      saveNewProject(project, user?.id);

      const fullWebhookUrl = webhookUrl.startsWith('http')
        ? webhookUrl
        : `${window.location.origin}${webhookUrl}`;

      setCreatedResult({
        projectId: project.id,
        webhookUrl: fullWebhookUrl,
        webhookSecret,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'ไม่สามารถบันทึกโปรเจกต์ลงฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      <header className="bg-[#111827] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-white">สร้างโปรเจกต์ใหม่ (Onboarding Wizard)</div>
          <Link to="/projects" className="text-sm text-slate-400 hover:text-white">
            ยกเลิกและกลับหน้ารวม
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { num: 1, label: '1. ข้อมูลธุรกิจและฟิลด์ข้อมูล' },
            { num: 2, label: '2. ตั้งค่าบอท AI และบริการ' },
            { num: 3, label: '3. พร้อมเริ่มใช้งาน' },
          ].map((item) => (
            <div
              key={item.num}
              className={`p-3 rounded-xl border text-center text-xs sm:text-sm font-semibold ${
                step === item.num
                  ? 'bg-orange-500 text-white border-orange-500'
                  : step > item.num
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-[#111827] text-slate-500 border-slate-800'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-[#111827] p-8 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white">ข้อมูลร้านค้าและสิ่งที่ให้บอทเก็บข้อมูล</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  ชื่อร้าน / ชื่อโปรเจกต์
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ร้านซ่อมมือถือ ไอฟิกซ์"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  ชื่อสาขา
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                หมวดหมู่ธุรกิจงานซ่อม
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                {Object.keys(CATEGORY_PRESETS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                หัวข้อข้อมูลเฉพาะทางที่ต้องการให้ AI ถามลูกค้า (คั่นด้วยเครื่องหมายจุลภาค)
              </label>
              <textarea
                rows={3}
                value={fieldsText}
                onChange={(e) => setFieldsText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                ข้อมูลส่วนนี้จะถูกเก็บแบบยืดหยุ่น (JSON / Free Text) ทำให้รองรับงานซ่อมได้ทุกประเภทโดยไม่ต้องแก้ฐานข้อมูล
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 cursor-pointer"
              >
                ถัดไป: ตั้งค่าบอท AI
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#111827] p-8 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white">เชื่อมต่อ Chatbot / Voicebot และเปิดฟีเจอร์</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBotMode('AUTO')}
                className={`p-4 rounded-xl border text-left cursor-pointer ${
                  botMode === 'AUTO'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-700 bg-[#0b0f19]'
                }`}
              >
                <div className="font-semibold text-sm text-white">สร้างบอทอัตโนมัติจากเทมเพลต</div>
                <div className="text-xs text-slate-400 mt-1">
                  ระบบสร้าง Prompt งานซ่อมตามหมวดธุรกิจให้ทันที
                </div>
              </button>
              <button
                type="button"
                onClick={() => setBotMode('EXISTING')}
                className={`p-4 rounded-xl border text-left cursor-pointer ${
                  botMode === 'EXISTING'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-700 bg-[#0b0f19]'
                }`}
              >
                <div className="font-semibold text-sm text-white">เชื่อมบอทที่มีอยู่แล้ว (Bot ID)</div>
                <div className="text-xs text-slate-400 mt-1">
                  นำรหัสจากแพลตฟอร์ม Botnoi มาผูกเข้ากับโปรเจกต์นี้
                </div>
              </button>
            </div>

            {botMode === 'EXISTING' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0b0f19] border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    รหัส Chatbot ID
                  </label>
                  <input
                    type="text"
                    value={botnoiBotId}
                    onChange={(e) => setBotnoiBotId(e.target.value)}
                    placeholder="[ใส่รหัส Chatbot ID]"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    รหัส Voicebot Agent ID
                  </label>
                  <input
                    type="text"
                    value={voiceAgentId}
                    onChange={(e) => setVoiceAgentId(e.target.value)}
                    placeholder="[ใส่รหัส Voice Agent ID]"
                    className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-slate-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                ข้อความทักทายเริ่มต้นของบอท
              </label>
              <input
                type="text"
                value={greetingMessage}
                onChange={(e) => setGreetingMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0f19] border border-slate-700 text-sm text-slate-100"
              />
            </div>

            <div>
              <div className="text-sm font-medium text-slate-300 mb-3">
                สวิตช์เปิด-ปิดความสามารถของ AI ประจำร้าน
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'createTicket', label: 'รับแจ้งซ่อมและเปิด Ticket อัตโนมัติ' },
                  { key: 'trackStatus', label: 'ตอบสถานะงานซ่อมตามรหัสใบงาน' },
                  { key: 'priceEstimate', label: 'แจ้งราคาประเมินเบื้องต้น' },
                  { key: 'faqAutoReply', label: 'ตอบคำถามพบบ่อยของร้าน (FAQ)' },
                  { key: 'collectCsat', label: 'เก็บคะแนนความพึงพอใจหลังจบงาน' },
                  { key: 'humanHandover', label: 'ส่งต่อให้แอดมินร้านเมื่อเคสซับซ้อน' },
                ].map((item) => {
                  const k = item.key as keyof BotFeatures;
                  const enabled = features[k];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleFeature(k)}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-slate-600 text-left cursor-pointer"
                    >
                      <span className="text-sm text-slate-200 font-medium">{item.label}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {enabled ? 'เปิด' : 'ปิด'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 cursor-pointer"
              >
                ถัดไป: ตรวจสอบและเริ่มใช้งาน
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#111827] p-8 rounded-2xl border border-slate-800 space-y-6">
            {!createdResult ? (
              <>
                <h2 className="text-xl font-bold text-white">พร้อมเปิดใช้งานโปรเจกต์ของคุณแล้ว!</h2>
                <p className="text-sm text-slate-400">
                  เมื่อกดยืนยัน ระบบจะบันทึกโปรเจกต์ลงฐานข้อมูลจริงและสร้าง Webhook URL พร้อม Secret ประจำร้านสำหรับเชื่อมต่อกับ Botnoi ทันที
                </p>

                <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-slate-300">ชื่อโปรเจกต์: </span>
                    <span className="text-white">
                      {name || 'ร้านบริการซ่อมสาขาใหม่'} ({branchName || 'สาขาหลัก'})
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">หมวดหมู่: </span>
                    <span className="text-white">{category}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">รูปแบบ Webhook ประจำร้าน: </span>
                    <span className="text-orange-400 font-mono text-xs">
                      {window.location.origin}/api/webhooks/[projectId]
                    </span>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    {submitError}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer disabled:opacity-50"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCreateFinish}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSubmitting ? 'กำลังสร้างโปรเจกต์...' : 'ยืนยันสร้างโปรเจกต์จริง'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-400">
                  <ShieldCheck className="w-7 h-7 shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold text-white">สร้างโปรเจกต์ลงฐานข้อมูลสำเร็จ!</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      คัดลอกข้อมูล Webhook ด้านล่างไว้สำหรับผูก API Object บน Botnoi Platform
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-4 text-xs">
                  <div>
                    <div className="text-slate-400 mb-1 font-medium">Webhook URL (รับใบงานแจ้งซ่อม):</div>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#111827] border border-slate-800 font-mono text-orange-300 break-all">
                      <span>{createdResult.webhookUrl}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(createdResult.webhookUrl, 'url')}
                        className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'url' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>

                  {createdResult.webhookSecret && (
                    <div>
                      <div className="text-slate-400 mb-1 font-medium">
                        Header <code className="text-amber-300">x-webhook-secret</code> (บันทึกเก็บไว้ก่อนปิดหน้านี้):
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#111827] border border-slate-800 font-mono text-emerald-300 break-all">
                        <span>{createdResult.webhookSecret}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(createdResult.webhookSecret, 'secret')}
                          className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 shrink-0 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'secret' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${createdResult.projectId}`)}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 cursor-pointer"
                  >
                    เข้าสู่ Dashboard ของร้านนี้ →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
