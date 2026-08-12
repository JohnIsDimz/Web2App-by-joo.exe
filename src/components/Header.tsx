import React from 'react';
import { Smartphone, Code, Cpu, Download, FolderSync, ShieldCheck, Wallet, Cloud, RefreshCw, AlertCircle, Coins } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfileData } from '../lib/firebase';

interface HeaderProps {
  activeTab: 'simulator' | 'config' | 'export';
  setActiveTab: (tab: 'simulator' | 'config' | 'export') => void;
  onExportZip: () => void;
  savedAppsCount: number;
  onOpenSavedModal: () => void;
  currentUser: User | null;
  userProfile: UserProfileData | null;
  onOpenAuthModal: () => void;
  onOpenWalletModal: () => void;
  onOpenSecurityModal?: () => void;
  saveStatus?: 'saved' | 'saving' | 'error';
  lastSavedTime?: string;
  isPulsing?: boolean;
  onForceSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportZip,
  savedAppsCount,
  onOpenSavedModal,
  currentUser,
  userProfile,
  onOpenAuthModal,
  onOpenWalletModal,
  onOpenSecurityModal,
  saveStatus = 'saved',
  lastSavedTime,
  isPulsing = false,
  onForceSync,
}) => {
  const formattedBalance = userProfile?.balance 
    ? `Rp ${userProfile.balance.toLocaleString('id-ID')}` 
    : 'Rp 0';
  const tokensCount = userProfile?.tokens ?? 0;
  const currentPlan = userProfile?.subscriptionPlan || 'Free';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-2 md:py-0 md:h-16 gap-2 md:gap-4">
          {/* Top Bar: Brand & Quick Actions */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="min-w-0">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-300 bg-clip-text text-transparent block leading-tight">
                  Web2App Studio
                </span>

                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    by joo.exe
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Mobile Right) */}
            <div className="flex items-center gap-2 shrink-0 md:hidden">
              <button
                onClick={onOpenSecurityModal}
                title="Pusat Keamanan & Privasi"
                className="p-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenWalletModal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>{formattedBalance}</span>
              </button>

              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              >
                {currentUser && (
                  currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-4 h-4 rounded-full" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )
                )}
                <span>{currentUser ? 'Akun' : 'Login'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center justify-center gap-1 sm:gap-2 w-full md:w-auto overflow-x-auto py-1 no-scrollbar">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'simulator'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'config'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Configurator</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'export'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code & Export</span>
            </button>
          </nav>

          {/* Desktop Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Security & Privacy Center Button */}
            <button
              onClick={onOpenSecurityModal}
              title="Pusat Keamanan & Kebijakan Privasi"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline">Keamanan & Privasi</span>
            </button>

            {/* Wallet & Balance Button */}
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 hover:from-amber-500/20 hover:to-emerald-500/20 text-amber-300 border border-amber-500/30 transition-all shadow-sm"
              title="Kelola Saldo, Token & Langganan Bulanan"
            >
              <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex items-center gap-1.5 font-mono">
                <span>{formattedBalance}</span>
                <span>•</span>
                <span className="text-amber-400 flex items-center gap-0.5">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {tokensCount}
                </span>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-normal">
                {currentPlan}
              </span>
            </button>

            {/* Auth Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm"
            >
              {currentUser ? (
                <>
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full border border-emerald-400 object-cover" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="max-w-[110px] truncate">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>

            <button
              onClick={onOpenSavedModal}
              title="Saved Configurations"
              className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
            >
              <FolderSync className="w-4 h-4" />
              {savedAppsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-[10px] font-bold flex items-center justify-center text-slate-950">
                  {savedAppsCount}
                </span>
              )}
            </button>

            <button
              onClick={onExportZip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Proyek ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

