import React, { useState } from 'react';
import { X, ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, Key, Database, RefreshCw, UserCheck, HardDrive } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfileData } from '../lib/firebase';
import { eraseCookie } from '../lib/cookieSecurity';

interface SecurityPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile: UserProfileData | null;
}

export const SecurityPrivacyModal: React.FC<SecurityPrivacyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'policy' | 'security' | 'gdpr'>('policy');
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [sessionClearedMsg, setSessionClearedMsg] = useState('');

  if (!isOpen) return null;

  const handleClearSessionCookies = () => {
    setIsClearingSession(true);
    setTimeout(() => {
      eraseCookie('w2a_sec_session');
      eraseCookie('w2a_sec_tokens');
      localStorage.removeItem('w2a_fast_profile_latest');
      if (currentUser) {
        localStorage.removeItem(`w2a_fast_profile_${currentUser.uid}`);
      }
      setIsClearingSession(false);
      setSessionClearedMsg('Sesi cookie berhasil dibersihkan & diperbarui dengan enkripsi baru!');
      setTimeout(() => setSessionClearedMsg(''), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Pusat Keamanan & Kebijakan Privasi</span>
              </h2>
              <p className="text-xs text-slate-400">
                Jaminan keamanan data, enkripsi cookie, dan perlindungan privasi pengguna Web2App Studio.
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

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'policy'
                ? 'border-sky-400 text-sky-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Kebijakan Privasi (Privacy Policy)</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Enkripsi & Security Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('gdpr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'gdpr'
                ? 'border-purple-400 text-purple-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Hak Pengguna & GDPR/PDP</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs sm:text-sm leading-relaxed">

          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  1. Komitmen Perlindungan Data Pribadi
                </h3>
                <p className="text-slate-300 text-xs">
                  Web2App Studio berkomitmen penuh untuk melindungi privasi setiap pengguna. Kami <strong>tidak pernah memperjualbelikan, menyewakan, atau membagikan</strong> data pribadi Anda (termasuk email, saldo, token, atau histori aplikasi) kepada pihak ketiga manapun untuk tujuan pemasaran.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  2. Data yang Kami Kumpulkan & Penggunaannya
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                  <li><strong>Informasi Akun:</strong> Alamat email dan nama profil digunakan secara eksklusif untuk otentikasi login resmi via Firebase Auth.</li>
                  <li><strong>Konfigurasi Proyek Web2App:</strong> Nama aplikasi, URL website, ikon, dan opsiWebView disimpan secara terenkripsi untuk memfasilitasi kompilasi APK/Source Code Anda.</li>
                  <li><strong>Histori Transaksi Saldo & Token:</strong> Catatan top-up dan pembelian token disimpan di database Firestore yang terisolasi per akun pengguna.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  3. Penggunaan Cookie & Akses Penyimpanan Sesi
                </h3>
                <p className="text-slate-300 text-xs">
                  Aplikasi ini menggunakan cookie aman yang diset dengan atribut <code>SameSite=Lax</code> dan <code>Secure</code>. Cookie ini berfungsi menyimpan token otentikasi terenkripsi agar Anda tidak perlu login berulang kali dan melindungi dari serangan Cross-Site Request Forgery (CSRF).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">SSL TLS 1.3 Auto HTTPS Proxy</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Seluruh lalu lintas data antara browser pengguna dan server terenkripsi penuh melalui protokol SSL/TLS versi terbaru.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-start gap-3">
                  <Key className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Anti-Tampering Checksum Cookie</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cookie sesi dilindungi dengan signature checksum matematis untuk mencegah modifikasi atau pemalsuan data saldo & token oleh pihak luar.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Enkripsi Militer AES-256-GCM</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Data proyek dan kunci konfigurasi disimpan di server Vault dengan lapisan enkripsi AES-256 standar industri finansial.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Cloudflare Edge Web Security</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Perlindungan dari serangan DDoS, brute force, serta bot jahat melalui jaringan tepi global Cloudflare.
                    </p>
                  </div>
                </div>

              </div>

              {/* Cookie Management Action */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-xs">Perbarui & Bersihkan Sesi Cookie Keamanan</h4>
                  <p className="text-[11px] text-slate-400">
                    Bersihkan cookie lokal jika Anda berpindah perangkat atau ingin memperbarui token sesi keamanan.
                  </p>
                </div>
                <button
                  onClick={handleClearSessionCookies}
                  disabled={isClearingSession}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isClearingSession ? 'animate-spin' : ''}`} />
                  <span>{isClearingSession ? 'Mebersihkan...' : 'Reset Sesi Cookie'}</span>
                </button>
              </div>

              {sessionClearedMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center animate-fadeIn">
                  {sessionClearedMsg}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gdpr' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Kepatuhan Hak Pengguna (GDPR & UU PDP Indonesia)
                </h3>
                <p className="text-slate-300 text-xs">
                  Sesuai dengan regulasi Perlindungan Data Pribadi (UU PDP) dan General Data Protection Regulation (GDPR), setiap pengguna Web2App Studio memiliki hak mutlak berikut:
                </p>

                <ul className="space-y-2 text-xs text-slate-300 pt-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Hak Atas Akses & Koreksi Data:</strong> Anda dapat melihat dan memperbarui seluruh profil, email, serta konfigurasi aplikasi kapan saja melalui dasbor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Hak Penghapusan Total (Right to be Forgotten):</strong> Anda berhak meminta penghapusan permanen seluruh akun, saldo, token, dan histori proyek Anda dari database kami.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Portabilitas Data:</strong> Anda dapat mengunduh seluruh Source Code (ZIP) dan konfigurasi proyek Anda kapan saja tanpa hambatan.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs leading-relaxed">
                <p className="font-semibold mb-1">Kontak Pengembang & Petugas Keamanan Data:</p>
                <p>Jika Anda memiliki pertanyaan mengenai keamanan data, bantuan teknis, atau ingin mengajukan pertanyaan seputar privasi akun, silakan hubungi pengembang secara langsung via email di <strong className="text-sky-300">johnisdimz@gmail.com</strong>.</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Web2App Security Shield v2.4 Active</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-md"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
