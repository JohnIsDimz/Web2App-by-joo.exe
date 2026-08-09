import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  Zap, 
  Crown, 
  PlusCircle, 
  Check, 
  History, 
  CreditCard, 
  QrCode, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  UserProfileData, 
  UserTransaction, 
  topUpBalance, 
  buyTokenPackage, 
  buyMonthlySubscription, 
  getUserTransactions,
  isAdminUser
} from '../lib/firebase';
import { triggerEmailEvent } from '../lib/emailService';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile: UserProfileData | null;
  onOpenAuth: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'tokens' | 'subscription' | 'history'>('subscription');
  
  // Topup State
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState<number>(10000);
  const [customTopUp, setCustomTopUp] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'jago'>('qris');
  
  // Transaction History State
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);

  // Status Message
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Checkout Modal State for Real-Time Gateway Flow (app.buatqris.site Integration)
  const [checkoutData, setCheckoutData] = useState<{
    amount: number;
    method: 'qris' | 'jago';
    trxId: string;
    qrisContent?: string;
    qrImageUrl?: string;
    createdAt: Date;
  } | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(900); // 15 Menit
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [copiedTrx, setCopiedTrx] = useState<boolean>(false);

  // Auto Polling Status Verification for BuatQRIS API
  useEffect(() => {
    if (!checkoutData || checkoutData.method !== 'qris' || !currentUser) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/qris/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: checkoutData.trxId,
            userId: currentUser.uid
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'SUCCESS') {
            clearInterval(pollInterval);
            await topUpBalance(currentUser.uid, checkoutData.amount, 'BuatQRIS API Dynamic QRIS');
            setSuccessMsg(`Pembayaran Real-Time Berhasil! Saldo +Rp ${checkoutData.amount.toLocaleString('id-ID')} telah otomatis ditambahkan ke dompet Anda.`);
            setCustomTopUp('');
            setCheckoutData(null);
            setTimeout(() => setSuccessMsg(null), 6000);
          }
        }
      } catch (err) {
        console.warn("QRIS status check polling warning:", err);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [checkoutData, currentUser]);

  // Countdown timer for active checkout
  useEffect(() => {
    if (!checkoutData) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCheckoutData(null);
          setErrorMsg('Waktu pembayaran QRIS telah kadaluwarsa (15 menit). Silakan ulangi transaksi.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [checkoutData]);

  // Refresh Transaction History
  useEffect(() => {
    if (isOpen && currentUser && activeTab === 'history') {
      loadHistory();
    }
  }, [isOpen, currentUser, activeTab]);

  if (!isOpen) return null;

  const loadHistory = async () => {
    if (!currentUser) return;
    setLoadingTx(true);
    const txList = await getUserTransactions(currentUser.uid);
    setTransactions(txList);
    setLoadingTx(false);
  };

  const handleStartCheckout = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const amount = customTopUp ? parseInt(customTopUp, 10) : selectedTopUpAmount;
    if (!amount || amount < 10000) {
      setErrorMsg('Nominal Deposit minimal Rp 10.000');
      return;
    }

    setIsVerifyingPayment(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (paymentMethod === 'qris') {
        const res = await fetch('/api/qris/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            userEmail: currentUser.email,
            amount: amount,
            note: `Deposit Saldo Web2App Studio Rp ${amount.toLocaleString('id-ID')}`
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal membuat Dynamic QRIS invoice via BuatQRIS API.');
        }

        setCheckoutData({
          amount: data.amount,
          method: 'qris',
          trxId: data.invoiceId,
          qrisContent: data.qrisContent,
          qrImageUrl: data.qrImageUrl,
          createdAt: new Date()
        });
        setCountdownSeconds(900);
      } else {
        const randomTrx = `JAGO-${Math.floor(100000 + Math.random() * 900000)}`;
        setCheckoutData({
          amount,
          method: 'jago',
          trxId: randomTrx,
          createdAt: new Date()
        });
        setCountdownSeconds(900);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses checkout.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleConfirmPaymentRealtime = async () => {
    if (!currentUser || !checkoutData) return;

    setIsVerifyingPayment(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/qris/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: checkoutData.trxId,
          userId: currentUser.uid
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memverifikasi status pembayaran.');
      }

      if (data.status === 'SUCCESS') {
        await topUpBalance(currentUser.uid, checkoutData.amount, checkoutData.method === 'qris' ? 'BuatQRIS Dynamic QRIS' : 'Bank Jago Direct');

        // Dispatch official thank you email with complete transaction details
        if (currentUser.email) {
          triggerEmailEvent({
            to: currentUser.email,
            recipientName: currentUser.displayName || currentUser.email.split('@')[0],
            templateType: 'topup_success',
            subject: `[Resi Pembayaran] Terima Kasih Top-Up Saldo Rp ${checkoutData.amount.toLocaleString('id-ID')} - Web2App Studio`,
            amount: checkoutData.amount,
            tokensGranted: checkoutData.tokensGranted || Math.floor(checkoutData.amount / 1000),
            invoiceId: checkoutData.trxId,
            customMessage: `Top-Up saldo deposit sebesar Rp ${checkoutData.amount.toLocaleString('id-ID')} via ${checkoutData.method === 'qris' ? 'BuatQRIS Dynamic QRIS' : 'Bank Jago'} telah berhasil diproses.`
          });
        }

        setSuccessMsg(`Pembayaran Berhasil Terverifikasi! Saldo Deposit +Rp ${checkoutData.amount.toLocaleString('id-ID')} telah otomatis masuk ke akun Anda.`);
        setCustomTopUp('');
        setCheckoutData(null);
        setTimeout(() => setSuccessMsg(null), 6000);
      } else {
        setErrorMsg('Pembayaran belum terdeteksi oleh sistem payment gateway. Silakan selesaikan pembayaran terlebih dahulu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memverifikasi pembayaran real-time.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleBuyToken = async (tokensCount: number, priceIdr: number) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await buyTokenPackage(currentUser.uid, tokensCount, priceIdr);
      setSuccessMsg(`Berhasil membeli ${tokensCount} Token! Sisa Saldo: Rp ${(userProfile?.balance ? userProfile.balance - priceIdr : 0).toLocaleString('id-ID')}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membeli token.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuySubscription = async (plan: 'Starter' | 'Pro' | 'Enterprise', priceIdr: number, bonusTokens: number) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await buyMonthlySubscription(currentUser.uid, plan, priceIdr, bonusTokens);
      setSuccessMsg(`Selamat! Langganan Paket ${plan} Bulanan aktif selama 30 Hari. +${bonusTokens} Bonus Token telah ditambahkan!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses langganan.');
    } finally {
      setLoading(false);
    }
  };

  const formattedBalance = userProfile?.balance ? `Rp ${userProfile.balance.toLocaleString('id-ID')}` : 'Rp 0';
  const tokensCount = userProfile?.tokens ?? 0;
  const currentPlan = userProfile?.subscriptionPlan || 'Free';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Dompet & Langganan Bulanan
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  TERHUBUNG
                </span>
              </h3>
              <p className="text-xs text-slate-400">Deposit Saldo, Paket Token Build, & Langganan Bulanan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance Overview Banner - Pas 4 Blok */}
        <div className="p-3.5 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Blok 1: Saldo Balance */}
          <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-center min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">Saldo Balance</span>
            <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono truncate mt-0.5">
              <span>{formattedBalance}</span>
            </div>
          </div>

          {/* Blok 2: Saldo Token */}
          <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-center min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">Saldo Token</span>
            <div className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1 font-mono truncate mt-0.5">
              <Zap className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
              <span className="truncate">{tokensCount} Token</span>
            </div>
          </div>

          {/* Blok 3: Status Langganan */}
          <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-center min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">Status Langganan</span>
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1 truncate mt-0.5">
              <Crown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">
                {isAdminUser(userProfile?.email) ? 'Developer VIP' : `Paket ${currentPlan}`}
              </span>
            </div>
          </div>

          {/* Blok 4: Aksi Quick Top Up / Login */}
          <div className="p-1 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-center min-w-0">
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="w-full h-full py-1.5 px-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1 truncate"
              >
                <span className="truncate">Login Akun</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('topup')}
                className="w-full h-full py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 truncate"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Isi Saldo</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 pt-4 pb-0.5 border-b border-slate-800/80 bg-slate-900 overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 ${
              activeTab === 'subscription'
                ? 'border-sky-400 text-sky-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            <span>Langganan Bulanan</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 ${
              activeTab === 'tokens'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Beli Token</span>
          </button>

          <button
            onClick={() => setActiveTab('topup')}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 ${
              activeTab === 'topup'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 ${
              activeTab === 'history'
                ? 'border-purple-400 text-purple-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span>Riwayat</span>
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Tab Body */}
        <div className="p-4 sm:p-6 pt-5 sm:pt-7 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: Monthly Subscriptions starting from 10k */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="text-center max-w-lg mx-auto space-y-1">
                <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Paket Langganan Bulanan Web2App Studio</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Pilih paket sesuai kebutuhan aplikasi Anda. Buka akses engine premium, custom code, & bonus token bulanan!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                
                {/* PLAN 0: FREE (Rp 0 / Gratis) */}
                <div className={`p-4 sm:p-5 rounded-2xl bg-slate-950 border transition-all flex flex-col justify-between relative ${
                  !currentPlan || currentPlan === 'Free' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gratis / Free</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Rp 0</span>
                    </div>

                    <div className="my-3">
                      <span className="text-2xl font-black text-white">Rp 0</span>
                      <span className="text-xs text-slate-400"> / selamanya</span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-400 mb-2 border-b border-slate-800 pb-1">
                      Akses Fitur & Batasan Paket:
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>Engine PWA Standalone</strong> Gratis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Analisa URL & Live App Preview</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>SSL Proxy Auto HTTPS</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>0 Token Awal (Perlu Top Up / Beli Token)</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>Engine Native (Android/iOS) Terkunci</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>Download Source Code ZIP Terkunci</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    disabled={true}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-slate-400 border border-slate-800 cursor-default"
                  >
                    {!currentPlan || currentPlan === 'Free' ? 'Paket Aktif Saat Ini' : 'Paket Standar'}
                  </button>
                </div>

                {/* PLAN 1: STARTER (Rp 15.000 / Bulan) */}
                <div className={`p-4 sm:p-5 rounded-2xl bg-slate-950 border transition-all flex flex-col justify-between relative ${
                  currentPlan === 'Starter' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Pemula / Starter</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">Starter</span>
                    </div>

                    <div className="my-3">
                      <span className="text-2xl font-black text-white">Rp 15.000</span>
                      <span className="text-xs text-slate-400"> / bulan</span>
                    </div>

                    <div className="text-[11px] font-semibold text-sky-400/90 mb-2 border-b border-slate-800 pb-1">
                      Akses Fitur & Batasan Paket:
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>20 Token Build</strong> / bulan</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>Engine Starter</strong> (Android, iOS, Cordova, PWA)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Push Notification & SSL Proxy</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>Engine Flutter, Jetpack, Swift, Tauri (Perlu 30k)</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>Custom CSS & JS Injections Terkunci</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>Download Source Code (.zip) Terkunci</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuySubscription('Starter', 15000, 20)}
                    disabled={loading || currentPlan === 'Starter'}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow ${
                      currentPlan === 'Starter'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-white active:scale-95'
                    }`}
                  >
                    {currentPlan === 'Starter' ? 'Paket Aktif Saat Ini' : 'Berlangganan Rp 15.000'}
                  </button>
                </div>

                {/* PLAN 2: PRO BUILDER (Rp 30.000 / Bulan - MOST POPULAR) */}
                <div className={`p-4 sm:p-5 rounded-2xl bg-slate-950 border transition-all flex flex-col justify-between relative ${
                  currentPlan === 'Pro' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-500/50 hover:border-amber-400'
                }`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow">
                    Rekomendasi Terbaik
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pro Builder</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Pro</span>
                    </div>

                    <div className="my-3">
                      <span className="text-2xl font-black text-white">Rp 30.000</span>
                      <span className="text-xs text-slate-400"> / bulan</span>
                    </div>

                    <div className="text-[11px] font-semibold text-amber-400/90 mb-2 border-b border-slate-800 pb-1">
                      Akses Fitur & Batasan Paket:
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>60 Token Build</strong> / bulan</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>Flutter 3.x, Kotlin, Swift, React Native, Tauri</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Custom CSS & JavaScript Injections</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>Download Source Code (.zip)</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Push Notifications (OneSignal API)</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>KMP, HarmonyOS, & Native Plugins (Perlu 60k)</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuySubscription('Pro', 30000, 60)}
                    disabled={loading || currentPlan === 'Pro'}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow ${
                      currentPlan === 'Pro'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 active:scale-95'
                    }`}
                  >
                    {currentPlan === 'Pro' ? 'Paket Aktif Saat Ini' : 'Berlangganan Rp 30.000'}
                  </button>
                </div>

                {/* PLAN 3: ENTERPRISE (Rp 60.000 / Bulan - UNLIMITED VIP) */}
                <div className={`p-4 sm:p-5 rounded-2xl bg-slate-950 border transition-all flex flex-col justify-between relative ${
                  currentPlan === 'Enterprise' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Enterprise VIP</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">Enterprise</span>
                    </div>

                    <div className="my-3">
                      <span className="text-2xl font-black text-white">Rp 60.000</span>
                      <span className="text-xs text-slate-400"> / bulan</span>
                    </div>

                    <div className="text-[11px] font-semibold text-purple-400/90 mb-2 border-b border-slate-800 pb-1">
                      Akses Fitur & Batasan Paket:
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>150 Token Build</strong> / bln + VIP Priority Queue</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>Akses SEMUA Multi-Engine</strong> (KMP, HarmonyOS, Electron, Flutter)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Custom C++/Rust Native Plugins</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Unlimited Release Builds & ZIP Export</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Pterodactyl Dedicated VPS Compiler</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>White-label Custom App Branding</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuySubscription('Enterprise', 60000, 150)}
                    disabled={loading || currentPlan === 'Enterprise'}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow ${
                      currentPlan === 'Enterprise'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                    }`}
                  >
                    {currentPlan === 'Enterprise' ? 'Paket Aktif Saat Ini' : 'Berlangganan Rp 60.000'}
                  </button>
                </div>

              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pembayaran otomatis dipotong dari Saldo Utama. Jika saldo kurang, silakan lakukan Deposit terlebih dahulu.</span>
              </div>
            </div>
          )}

          {/* TAB 2: Buy Token Packages */}
          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Beli Token Build</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Gunakan token untuk melakukan analisa URL, generasi konfigurasi otomatis, dan konversi Web2App.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                
                {/* Package 1 */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-amber-500/50 transition-all text-center space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Paket Trial</span>
                  <div className="text-2xl font-black text-amber-400">10 Token</div>
                  <div className="text-xs font-bold text-white">Rp 5.000</div>
                  <button
                    onClick={() => handleBuyToken(10, 5000)}
                    disabled={loading}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-transform active:scale-95 shadow"
                  >
                    Beli Rp 5.000
                  </button>
                </div>

                {/* Package 2 */}
                <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-2xl hover:border-amber-400 transition-all text-center space-y-2 relative">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Hemat 20%</span>
                  <div className="text-2xl font-black text-amber-400">30 Token</div>
                  <div className="text-xs font-bold text-white">Rp 12.000</div>
                  <button
                    onClick={() => handleBuyToken(30, 12000)}
                    disabled={loading}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-transform active:scale-95 shadow"
                  >
                    Beli Rp 12.000
                  </button>
                </div>

                {/* Package 3 */}
                <div className="p-4 bg-slate-950 border border-amber-500/60 rounded-2xl hover:border-amber-400 transition-all text-center space-y-2 relative ring-2 ring-amber-500/20">
                  <span className="text-[10px] font-bold text-sky-400 uppercase">Paling Laris</span>
                  <div className="text-2xl font-black text-amber-400">100 Token</div>
                  <div className="text-xs font-bold text-white">Rp 35.000</div>
                  <button
                    onClick={() => handleBuyToken(100, 35000)}
                    disabled={loading}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl transition-transform active:scale-95 shadow"
                  >
                    Beli Rp 35.000
                  </button>
                </div>

                {/* Package 4 */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition-all text-center space-y-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">Pro Builder</span>
                  <div className="text-2xl font-black text-purple-400">300 Token</div>
                  <div className="text-xs font-bold text-white">Rp 90.000</div>
                  <button
                    onClick={() => handleBuyToken(300, 90000)}
                    disabled={loading}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-transform active:scale-95 shadow"
                  >
                    Beli Rp 90.000
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Top Up Balance */}
          {activeTab === 'topup' && (
            <div className="space-y-4">
              {checkoutData ? (
                /* REAL-TIME CHECKOUT GATEWAY INTERFACE */
                <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 animate-in zoom-in-95 duration-200">
                  {/* Gateway Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0 mt-0.5 sm:mt-0">
                        {checkoutData.method === 'qris' ? (
                          <QrCode className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Building2 className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                          <span>Gateway Pembayaran Real-Time</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border whitespace-nowrap ${
                            checkoutData.method === 'qris'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {checkoutData.method === 'qris' ? 'QRIS INSTANT' : 'BANK JAGO'}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {checkoutData.method === 'qris' 
                            ? 'Scan QRIS menggunakan DANA, GoPay, OVO, ShopeePay, atau M-Banking apapun' 
                            : 'Transfer ke rekening Bank Jago tanpa biaya admin'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <div className="text-[10px] uppercase font-bold text-slate-400 sm:text-right">Sisa Waktu</div>
                      <div className="text-sm font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                        {formatTimer(countdownSeconds)}
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                    {checkoutData.method === 'qris' ? (
                      /* DYNAMIC QRIS INSTANT CARD */
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-2xl relative overflow-hidden group border border-slate-200">
                        {/* Top Header Banner */}
                        <div className="w-full pb-2 border-b border-slate-200 mb-2 flex items-center justify-between px-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-rose-600 tracking-tighter">QRIS</span>
                            <span className="text-[9px] text-slate-500 leading-tight">QR Code Standar<br/>Pembayaran Nasional</span>
                          </div>
                          <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">GPN</span>
                        </div>

                        {/* Merchant Details Header */}
                        <div className="text-center my-1">
                          <h3 className="text-base font-black text-slate-900 tracking-wide">QRIS INSTANT</h3>
                          <div className="text-[10px] font-bold text-emerald-600 font-mono uppercase tracking-wider">Metode Otomatis / Fast Dynamic</div>
                        </div>

                        {/* QR Code Matrix Display */}
                        <div className="relative p-2 bg-white rounded-xl border-2 border-slate-900/10 flex flex-col items-center justify-center my-1 shadow-inner">
                          <img
                            src={checkoutData.qrImageUrl || (checkoutData.qrisContent ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkoutData.qrisContent)}` : '')}
                            alt="Dynamic BuatQRIS QR Code"
                            className="w-52 h-52 object-contain rounded-lg p-1 bg-white"
                          />
                        </div>

                        {/* Footer Info */}
                        <div className="text-center mt-2 w-full pt-2 border-t border-slate-100">
                          <div className="text-[10px] font-black text-slate-800 tracking-wider">SATU QRIS UNTUK SEMUA</div>
                          <div className="text-[9px] text-slate-500 font-mono">DANA • GoPay • OVO • ShopeePay • M-Banking</div>
                        </div>
                      </div>
                    ) : (
                      /* BANK JAGO TRANSFER CARD */
                      <div className="flex flex-col justify-center p-4 sm:p-5 bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/30 text-white space-y-3.5 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black border border-amber-500/30 shrink-0 text-xs sm:text-sm">
                              JAGO
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">BANK JAGO</div>
                              <div className="text-[10px] text-slate-400 truncate">Transfer Antar Bank / Sesama Jago</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0 whitespace-nowrap">
                            0% Admin Fee
                          </span>
                        </div>

                        <div className="space-y-3 bg-slate-950/80 p-3 sm:p-3.5 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor Rekening / Kantong:</span>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1.5 p-2 bg-slate-900/90 rounded-lg border border-slate-800/80">
                              <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider break-all px-1">
                                104289414427
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText('104289414427');
                                  setCopiedTrx(true);
                                  setTimeout(() => setCopiedTrx(false), 2000);
                                }}
                                className="w-full sm:w-auto px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg transition-all active:scale-95 border border-amber-500/30 flex items-center justify-center gap-1.5 shrink-0"
                              >
                                {copiedTrx ? 'Tersalin!' : 'Salin Rekening'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-slate-800 space-y-1">
                          <p className="font-semibold text-amber-300 text-xs">💡 Instruksi Transfer:</p>
                          <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[10px] leading-relaxed">
                            <li>Buka aplikasi Bank Jago, M-Banking, atau E-Wallet Anda.</li>
                            <li>Pilih Transfer Bank &gt; Cari <strong>Bank Jago</strong>.</li>
                            <li>Masukkan nomor rekening: <strong className="text-white font-mono">104289414427</strong></li>
                            <li>Kirim nominal tepat: <strong className="text-emerald-400 font-mono font-bold">Rp {checkoutData.amount.toLocaleString('id-ID')}</strong></li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {/* Order Details & Realtime Status */}
                    <div className="space-y-3">
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Kode Referensi ID:</span>
                          <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                            <span>{checkoutData.trxId}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(checkoutData.trxId);
                                setCopiedTrx(true);
                                setTimeout(() => setCopiedTrx(false), 2000);
                              }}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                            >
                              {copiedTrx ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-slate-400">
                          <span>Metode Pembayaran:</span>
                          <span className="font-bold text-white uppercase">
                            {checkoutData.method === 'qris' ? 'QRIS Instant' : 'Bank Jago'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-slate-400">
                          <span>Biaya Layanan/Admin:</span>
                          <span className="font-bold text-emerald-400">Rp 0 (GRATIS)</span>
                        </div>

                        <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-200">Total Tagihan:</span>
                          <span className="text-emerald-400 font-mono text-base font-black">
                            Rp {checkoutData.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Sinkronisasi Real-Time:</strong> Saat pembayaran terverifikasi, saldo Anda akan <strong>otomatis bertambah langsung</strong> di dompet melalui listener real-time Firestore tanpa perlu refresh!
                        </span>
                      </div>

                      {/* Production Automatic Listener Status & Action Buttons */}
                      <div className="space-y-2 pt-1">
                        <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl text-center space-y-1">
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span>Menunggu Pembayaran (Auto-Polling Aktif)...</span>
                          </div>
                        </div>

                        <button
                          onClick={handleConfirmPaymentRealtime}
                          disabled={isVerifyingPayment}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-transform active:scale-95 shadow flex items-center justify-center gap-2"
                        >
                          {isVerifyingPayment ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Memverifikasi Pembayaran via BuatQRIS...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Cek Status Verifikasi Pembayaran Sekarang</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setCheckoutData(null)}
                          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2"
                        >
                          <span>Tutup / Ubah Metode Pembayaran</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* REGULAR DEPOSIT SELECTOR FORM */
                <>
                  <div className="text-center max-w-md mx-auto space-y-1">
                    <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>Isi Saldo / Deposit Balance</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Pilih nominal saldo yang ingin ditambahkan ke dompet akun Anda.
                    </p>
                  </div>

                  {/* Nominal Quick Picks */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">Pilih Nominal Deposit (IDR):</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[10000, 25000, 50000, 100000, 250000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => { setSelectedTopUpAmount(amt); setCustomTopUp(''); }}
                          className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                            selectedTopUpAmount === amt && !customTopUp
                              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/20'
                              : 'border-slate-800 text-slate-300 bg-slate-950 hover:bg-slate-800'
                          }`}
                        >
                          Rp {amt.toLocaleString('id-ID')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Atau Masukkan Nominal Lain (Minimal Rp 10.000):</label>
                    <input
                      type="number"
                      value={customTopUp}
                      onChange={(e) => setCustomTopUp(e.target.value)}
                      placeholder="Contoh: 150000"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      min={10000}
                    />
                  </div>

                  {/* Payment Method Picker (QRIS and Bank Jago Only) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">Pilih Metode Pembayaran Resmi:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qris')}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                          paymentMethod === 'qris'
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/20'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>QRIS Instant</span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">Instant</span>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('jago')}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                          paymentMethod === 'jago'
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300 ring-2 ring-amber-500/20'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>Bank Jago</span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">No Admin</span>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Merchant Direct Info Banner */}
                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                      {paymentMethod === 'qris' && (
                        <div className="flex items-start gap-2">
                          <QrCode className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-emerald-300">QRIS Instant:</strong> Transfer cepat & instan dari aplikasi DANA, GoPay, OVO, ShopeePay, Maupun M-Banking apapun.
                          </span>
                        </div>
                      )}
                      {paymentMethod === 'jago' && (
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-amber-300">Bank Jago:</strong> Transfer langsung ke rekening Bank Jago tanpa biaya admin.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleStartCheckout}
                    disabled={loading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 text-xs flex items-center justify-center gap-2 mt-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>
                      Lanjut ke Gateway Bayar Rp {(customTopUp ? parseInt(customTopUp, 10) || 0 : selectedTopUpAmount).toLocaleString('id-ID')}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* TAB 4: Transaction History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Riwayat Terbaru</span>
                </h4>
                <button
                  onClick={loadHistory}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTx ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingTx ? (
                <div className="py-8 text-center text-xs text-slate-400">Memuat riwayat transaksi...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-950 border border-slate-800 rounded-2xl">
                  Belum ada riwayat transaksi. Lakukan Deposit atau Beli Token/Langganan.
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx, idx) => (
                    <div 
                      key={tx.id || idx}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-200">{tx.description}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {new Date(tx.timestamp).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="text-right">
                        {tx.amount !== 0 && (
                          <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.amount > 0 ? '+' : ''}Rp {tx.amount.toLocaleString('id-ID')}
                          </div>
                        )}
                        {tx.tokensDelta && (
                          <div className="text-[11px] font-bold text-amber-400 font-mono">
                            {tx.tokensDelta > 0 ? '+' : ''}{tx.tokensDelta} Token
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Firebase Security Rules & Firestore Protected</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
