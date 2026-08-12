import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, Eye, FileText, Shield, Wrench, Key, Gift, RefreshCw, Smartphone, ExternalLink } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfileData } from '../lib/firebase';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile: UserProfileData | null;
}

type TemplateType = 'welcome' | 'topup_thanks' | 'build_success' | 'update' | 'maintenance' | 'reset_password' | 'promo' | 'custom';

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
}) => {
  const [template, setTemplate] = useState<TemplateType>('welcome');
  const [recipient, setRecipient] = useState<string>(currentUser?.email || 'user@example.com');
  const [subject, setSubject] = useState<string>('Selamat Datang di Web2App Studio!');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>(
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Developer'
  );
  
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('preview');

  if (!isOpen) return null;

  // Handle template switch presets
  const handleSelectTemplate = (type: TemplateType) => {
    setTemplate(type);
    setSendResult(null);
    if (type === 'welcome') {
      setSubject('🎉 Selamat Datang di Web2App Studio - Terima Kasih Atas Kepercayaan Anda!');
    } else if (type === 'topup_thanks') {
      setSubject('💳 [Resi Transaksi] Terima Kasih Top-Up Saldo Deposit - Web2App Studio');
    } else if (type === 'build_success') {
      setSubject('📦 [Kompilasi Selesai] Aplikasi Native Anda Berhasil Dikompilasi!');
    } else if (type === 'update') {
      setSubject('🚀 Pembaruan Besar Web2App Studio v3.5 - Mesin Build Native Baru!');
    } else if (type === 'maintenance') {
      setSubject('🛠️ Pemberitahuan Pemeliharaan Server (System Maintenance)');
    } else if (type === 'reset_password') {
      setSubject('🔑 Permintaan Riset Kata Sandi & Keamanan Akun');
    } else if (type === 'promo') {
      setSubject('🎁 Bonus 25 Token Build & Penawaran Spesial Pro Builder!');
    } else {
      setSubject('✉️ Pengumuman Penting dari Tim Web2App Studio');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      alert("Masukkan email penerima terlebih dahulu!");
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          recipientName: recipientName || 'Pengguna Web2App',
          templateType: template,
          subject: subject,
          customMessage: customMessage,
          senderEmail: 'noreply@web2app.joo.exe',
          appName: 'Web2App Studio by joo.exe'
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSendResult({
          success: true,
          message: data.message || `Email "${subject}" berhasil dikirim ke ${recipient}!`,
          details: data
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || data.message || 'Gagal mengirim email.',
          details: data
        });
      }
    } catch (err: any) {
      console.error('Error sending email:', err);
      setSendResult({
        success: false,
        message: err.message || 'Gagal terhubung ke backend server API (/api/send-email).'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Transactional Email & Notification Center
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono">
                  Corporate Mailer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Kirim email konfirmasi, reset kata sandi, pembaruan server & promosi berstandar perusahaan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* Preset Selector Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Pilih Jenis Template Email Perusahaan:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTemplate('welcome')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  template === 'welcome'
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-[11px] text-center">Selamat Datang</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('update')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  template === 'update'
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-[11px] text-center">Pembaruan Besar</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('maintenance')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  template === 'maintenance'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-[11px] text-center">Maintenance</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('reset_password')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  template === 'reset_password'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Key className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-[11px] text-center">Reset Kata Sandi</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('promo')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  template === 'promo'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Gift className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-[11px] text-center">Bonus & Promo</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTemplate('custom')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  template === 'custom'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-[11px] text-center">Kustom Broadcast</span>
              </button>
            </div>
          </div>

          {/* Edit Form & Live Preview Section Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Left: Form Configuration */}
            <div className="space-y-4 bg-slate-950/80 p-4 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  Pengaturan Parameter Email
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  API Backend Active
                </span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Email Penerima (To):
                </label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="user@domain.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Nama Penerima:
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama Pengguna"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Subjek Email (Subject Line):
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subjek email..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {template === 'custom' && (
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Isi Pesan Tambahan / Kustom Body (HTML / Text):
                  </label>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Tuliskan isi email mengumumkan pengumuman khusus Anda di sini..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 custom-scrollbar"
                  />
                </div>
              )}

              {/* Status Notice */}
              {sendResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    sendResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{sendResult.message}</p>
                    {sendResult.details?.mode === 'simulated' && (
                      <p className="text-[10px] text-slate-300">
                        *Catatan: Dikirim via Mode Simulasi Backend Real-Time. Tambahkan API Key SMTP / Resend di .env untuk pengiriman nyata ke inbox target.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSending}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Pengiriman Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Email Ini Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Interactive Live Email Body Preview */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  Pratinjau Tampilan Email (Inbox Preview)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Format HTML Responsive
                </span>
              </div>

              {/* Email Client Container Mockup */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-[300px]">
                
                {/* Email Header Bar */}
                <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 space-y-1 font-sans">
                  <div className="flex justify-between">
                    <span><strong>Dari:</strong> Web2App Studio &lt;noreply@web2app.joo.exe&gt;</span>
                    <span className="text-[10px] text-slate-500">Baru Saja</span>
                  </div>
                  <div><strong>Kepada:</strong> {recipientName} &lt;{recipient}&gt;</div>
                  <div className="text-white font-bold truncate"><strong>Subjek:</strong> {subject}</div>
                </div>

                {/* Email Body Content */}
                <div className="p-4 bg-slate-900/60 text-slate-200 text-xs space-y-4 overflow-y-auto flex-1 font-sans">
                  {/* Company Logo Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-white tracking-tight">Web2App Studio</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">by joo.exe</span>
                  </div>

                  {/* Dynamic Template Content */}
                  {template === 'welcome' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-sky-300">Selamat Datang, {recipientName}! 🎉</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Terima kasih telah bergabung di <strong>Web2App Studio</strong>. Akun Anda telah berhasil diaktifkan dengan aman di Database Cloud.
                      </p>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                        <p className="text-emerald-400 font-bold">🎁 Bonus Awal Anda:</p>
                        <p className="text-slate-300">• <strong>10 Token Build Free</strong> untuk mengompilasi APK Android pertama Anda.</p>
                        <p className="text-slate-300">• Akses Penuh Simulator Native Mobile & Configuration Engine.</p>
                      </div>
                      <div className="pt-2 text-center">
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-slate-950 font-bold text-xs rounded-lg shadow"
                        >
                          Buka Studio & Mulai Build APK
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {template === 'update' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-indigo-300">🚀 Rilis Besar: Web2App Engine v3.5!</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Halo {recipientName}, kami dengan bangga mengumumkan peluncuran pembaruan besar platform Web2App Studio.
                      </p>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                        <p className="text-indigo-400 font-bold">Fitur Baru yang Tersedia:</p>
                        <p className="text-slate-300">✅ Tambahan Dukungan Engine: <strong>Kotlin Multiplatform (KMP)</strong> & <strong>HarmonyOS Native</strong>.</p>
                        <p className="text-slate-300">✅ Kecepatan Kompilasi APK Flutter 2x Lebih Cepat via VPS Pterodactyl CI.</p>
                        <p className="text-slate-300">✅ Fitur Cloud Auto-Sync & Real-Time Encryption Vault.</p>
                      </div>
                    </div>
                  )}

                  {template === 'maintenance' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-amber-300">🛠️ Pemberitahuan Maintenance Server VPS</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Yth. {recipientName}, kami akan melakukan peningkatan performa infrastruktur server Pterodactyl & Cloud Firestore.
                      </p>
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-amber-200 text-[11px]">
                        <p className="font-bold">Jadwal Pemeliharaan:</p>
                        <p>Minggu, 10 Agustus 2026 • Pukul 01:00 - 03:00 WIB (2 Jam)</p>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Selama jadwal ini, layanan pembuatan APK dapat mengalami jeda sebentar. WebApp simulator tetap dapat digunakan secara normal.
                      </p>
                    </div>
                  )}

                  {template === 'reset_password' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-emerald-300">🔑 Permintaan Riset Kata Sandi Akun</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Halo {recipientName}, kami menerima permintaan untuk mengatur ulang kata sandi akun Web2App Anda.
                      </p>
                      <div className="py-2 text-center">
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow"
                        >
                          Riset Kata Sandi Saya
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Akun Anda tetap aman.
                      </p>
                    </div>
                  )}

                  {template === 'promo' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-purple-300">🎁 Penawaran Spesial: Paket Pro Builder & Bonus Token!</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Kabar gembira {recipientName}! Tingkatkan paket ke <strong>Pro Builder (Rp 30.000 / bulan)</strong> dan dapatkan bonus bulanan <strong>25 Token Build</strong> + Akses KMP & Custom Code Ingestion.
                      </p>
                      <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg text-purple-200 text-[11px]">
                        <p className="font-bold">Gunakan Kode Voucher:</p>
                        <p className="text-amber-300 font-mono text-sm font-bold">PRO30K-JOO</p>
                      </div>
                    </div>
                  )}

                  {template === 'custom' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-cyan-300">Pesan dari Tim Web2App Studio</h3>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {customMessage || "Halo " + recipientName + ",\n\nIni adalah pesan khusus dari tim pengembang Web2App Studio."}
                      </p>
                    </div>
                  )}

                  {/* Email Footer */}
                  <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 space-y-1 text-center">
                    <p>© 2026 Web2App Studio by joo.exe. All rights reserved.</p>
                    <p>Email ini dikirimkan secara otomatis dari sistem server transaksi Web2App.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Integrated with Express API Backend (/api/send-email)
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup Email Center
          </button>
        </div>

      </div>
    </div>
  );
};
