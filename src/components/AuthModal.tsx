import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  Copy,
  Check,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser, saveUserProfile, UserProfileData } from '../lib/firebase';
import { triggerEmailEvent } from '../lib/emailService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile?: UserProfileData | null;
  onSelectDemoUser?: () => void;
  onLoginSuccess?: (isNewUser: boolean) => void;
  onOpenWelcomeModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  currentUser,
  userProfile,
  onLoginSuccess,
  onOpenWelcomeModal
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const copyCurrentHost = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.hostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { user, isNewUser } = await signInWithGoogle();
      setSuccessMsg(`Berhasil login sebagai ${user.displayName || user.email}!`);
      
      // Asynchronous background email event trigger
      if (user.email) {
        triggerEmailEvent({
          to: user.email,
          recipientName: user.displayName || undefined,
          templateType: 'welcome',
          subject: '🎉 Selamat Datang di Web2App Studio - Akun Anda Telah Aktif!'
        });
      }

      onLoginSuccess?.(isNewUser);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal login dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Masukkan email Anda untuk instruksi riset kata sandi');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Fire Firebase reset password email
      await sendPasswordResetEmail(auth, email).catch((err) => console.warn('Firebase reset email note:', err));
      
      // Dispatch background cloud email trigger silently
      triggerEmailEvent({
        to: email,
        templateType: 'reset_password',
        subject: '🔑 Permintaan Riset Kata Sandi Akun Web2App Studio'
      });

      setSuccessMsg(`Instruksi riset kata sandi telah otomatis dikirimkan ke email ${email}! Silakan periksa inbox/spam Anda.`);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setErrorMsg(err.message || 'Gagal mengirim email instruksi riset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetMode) {
      return handleResetPassword(e);
    }

    if (!email || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let isNew = false;
      let targetUser: User | null = null;

      if (isRegisterMode) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        targetUser = userCred.user;
        const res = await saveUserProfile(userCred.user);
        isNew = (res as any)?.isNewUser ?? true;
        setSuccessMsg('Akun berhasil dibuat!');
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        targetUser = userCred.user;
        const res = await saveUserProfile(userCred.user);
        isNew = (res as any)?.isNewUser ?? false;
        setSuccessMsg('Berhasil masuk ke akun Anda!');
      }

      // Dispatch background email automatically
      if (targetUser?.email) {
        triggerEmailEvent({
          to: targetUser.email,
          recipientName: targetUser.displayName || email.split('@')[0],
          templateType: isNew ? 'welcome' : 'welcome',
          subject: isNew 
            ? '🎉 Selamat Datang di Web2App Studio - Akun Baru Aktif!'
            : '🔐 Notifikasi Masuk Akun - Web2App Studio'
        });
      }

      onLoginSuccess?.(isNew);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak sesuai.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email sudah terdaftar. Silakan pilih opsi Masuk.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Kata sandi terlalu pendek (minimal 6 karakter).');
      } else {
        setErrorMsg(err.message || 'Gagal autentikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (currentUser?.uid) {
      sessionStorage.removeItem(`welcome_shown_${currentUser.uid}`);
      sessionStorage.removeItem(`welcome_popup_session_${currentUser.uid}`);
    }
    await signOutUser();
    setSuccessMsg('Berhasil keluar.');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Masuk / Daftar Akun</h3>
              <p className="text-xs text-slate-400">Database Firestore Real-Time Login</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Active Account Card if logged in */}
        {currentUser ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  className="w-12 h-12 rounded-full border-2 border-sky-400 object-cover shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/50 flex items-center justify-center font-bold text-lg">
                  {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                  <span className="truncate">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                  <span className="shrink-0 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                    TERHUBUNG
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{currentUser.email}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Provider: {currentUser.providerData[0]?.providerId || 'Email/Password'}
                </div>
              </div>
            </div>

            {/* Realtime Balance Info in Modal */}
            {userProfile && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Saldo Real-Time</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    Rp {userProfile.balance?.toLocaleString('id-ID') || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Saldo Token</span>
                  <span className="text-sky-400 font-bold font-mono text-sm">
                    {userProfile.tokens || 0} Token
                  </span>
                </div>
              </div>
            )}

            {/* Database Sync Info */}
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 flex items-center gap-2.5">
              <Database className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Data login, saldo, & token tersimpan otomatis secara real-time di Database Firestore.</span>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Notification Messages */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed flex-1">{errorMsg}</span>
                </div>
                {(errorMsg.includes('Domain') || errorMsg.includes('Authorized Domains')) && (
                  <div className="pt-1 flex items-center justify-between bg-slate-950/80 p-2 px-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-[11px] text-slate-300 truncate mr-2">
                      {typeof window !== 'undefined' ? window.location.hostname : ''}
                    </span>
                    <button
                      type="button"
                      onClick={copyCurrentHost}
                      className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Tersalin!' : 'Salin Domain'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Main Form: Email Login / Register / Reset Password */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              {!isResetMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 pr-10"
                      required={!isResetMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                {isResetMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman Masuk</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-sky-400 hover:underline font-semibold cursor-pointer"
                    >
                      {isRegisterMode ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Buat Akun Baru'}
                    </button>

                    {!isRegisterMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-slate-400 hover:text-sky-300 hover:underline font-medium cursor-pointer"
                      >
                        Lupa Kata Sandi?
                      </button>
                    )}
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResetMode ? (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>{loading ? 'Sending Request...' : 'Kirim Email Riset Kata Sandi'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Memproses...' : isRegisterMode ? 'Daftar Akun Baru' : 'Masuk Sekarang'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-bold shrink-0">atau masuk dengan</span>
            </div>

            {/* Google Login Option directly below */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 text-white font-bold rounded-xl border border-slate-700/60 shadow-md flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 text-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Menghubungkan...' : 'Lanjutkan Dengan Google'}</span>
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Firestore Real-Time Sync</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
