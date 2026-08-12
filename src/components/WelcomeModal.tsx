import React from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  Globe, 
  Cpu, 
  Smartphone, 
  Cloud, 
  Download, 
  ShieldCheck, 
  Wallet,
  ArrowRight,
  Layers,
  Award,
  Coins
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNewUser: boolean;
  userName: string;
  userEmail?: string | null;
  tokens?: number;
  subscriptionPlan?: string;
  activeAppName?: string;
  engineType?: string;
  isAdmin?: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  isNewUser,
  userName,
  userEmail,
  tokens = 0,
  subscriptionPlan = 'Free',
  activeAppName = 'Web2App Project',
  engineType = 'flutter',
  isAdmin = false,
}) => {
  if (!isOpen) return null;

  const isVIPAdmin = isAdmin || tokens > 50000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Decorative Gradient Bar */}
        <div className={`h-1.5 w-full ${isVIPAdmin ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400' : isNewUser ? 'bg-gradient-to-r from-sky-500 via-emerald-400 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 via-sky-400 to-purple-500'}`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isVIPAdmin
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : isNewUser 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {isVIPAdmin ? <Award className="w-6 h-6 text-amber-400 animate-bounce" /> : isNewUser ? <FileText className="w-6 h-6 animate-pulse" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono ${
                  isVIPAdmin
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : isNewUser 
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isVIPAdmin ? '👑 VIP Developer Admin' : isNewUser ? '🎉 Pengguna Baru' : '👋 Pengguna Kembali'}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                {isVIPAdmin ? `Selamat Datang, ${userName} (Developer Admin)` : isNewUser ? `Selamat Datang, ${userName}!` : `Selamat Datang Kembali, ${userName}!`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 custom-scrollbar">

          {isNewUser ? (
            /* ===================================================
               NEW USER WELCOME BODY
               =================================================== */
            <>
              {/* Bonus Highlight Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 shadow-lg relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-sky-500/20 text-sky-300 rounded-lg shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Bonus Pendaftaran Berhasil!</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                        {tokens} Token
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Akun Anda telah diaktifkan dengan paket <span className="font-semibold text-sky-300">{subscriptionPlan}</span> dan bonus awal <span className="font-bold text-emerald-300">{tokens} Token Build Gratis</span> untuk mengompilasi APK pertama Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* App Explanation Header */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Panduan & Fitur Utama Web2App Studio</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Feature 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">1. Direct Web-to-App</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Masukkan URL website Anda. Engine akan otomatis mengonversi WebView, viewport mobile, dan fungsi native.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">2. 11 Multi-Engine Native</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Bebas pilih Flutter, Kotlin Multiplatform (KMP), Hotwire Turbo Native, HarmonyOS, Electron, & Swift.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">3. Real-Time Simulator</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Prinjau interaktif langsung di perangkat Pixel, iPhone, Tablet, & Desktop secara instan di layar Anda.
                    </p>
                  </div>

                  {/* Feature 4 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Download className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">4. Build APK & Source Code</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Hasilkan file APK/AAB siap rilis ke Play Store atau unduh paket lengkap ZIP source code Flutter/Kotlin project.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Seluruh desain & konfigurasi Anda tersimpan otomatis secara real-time di Cloud Database.</span>
              </div>
            </>
          ) : (
            /* ===================================================
               EXISTING / RETURNING USER WELCOME BODY
               =================================================== */
            <>
              {/* Active Project & Account Status Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-md space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Status Sesi Cloud Aktif</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Terhubung
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <div className="text-[10px] text-slate-400 mb-0.5">Sisa Token Build</div>
                    <div className={`font-bold text-sm flex items-center gap-1 ${tokens > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <Coins className={`w-3.5 h-3.5 ${tokens > 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <span>{tokens} Token</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <div className="text-[10px] text-slate-400 mb-0.5">Paket Langganan</div>
                    <div className="font-bold text-sky-400 text-sm">{subscriptionPlan}</div>
                  </div>
                </div>

                {tokens === 0 && !isVIPAdmin && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-200 flex items-center justify-between gap-2">
                    <span>Token build Anda 0. Lakukan Deposit, Beli Token, atau Berlangganan di Dompet.</span>
                  </div>
                )}
              </div>

              {/* Quick Resume Info */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Ringkasan Project Terakhir Anda</span>
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Nama Aplikasi:</span>
                    <span className="text-xs font-bold text-white">{activeAppName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Penyimpanan:</span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Auto-Synced Cloud
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Tip */}
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200/90 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-white">Tips:</strong> Butuh kompilasi APK/AAB atau ingin mencoba engine baru seperti Kotlin Multiplatform (KMP) atau HarmonyOS? Anda dapat menggantinya kapan saja di tab <span className="underline">Configurator</span>.
                </p>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              isNewUser 
                ? 'bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 shadow-sky-500/20' 
                : 'bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 shadow-emerald-500/20'
            }`}
          >
            <span>{isNewUser ? 'Mulai Buat Aplikasi Sekarang' : 'Lanjutkan Project Saya'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
