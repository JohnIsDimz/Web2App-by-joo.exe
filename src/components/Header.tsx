import React from 'react';
import { Smartphone, Code, Cpu, Download, FolderSync } from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulator' | 'config' | 'export';
  setActiveTab: (tab: 'simulator' | 'config' | 'export') => void;
  onExportZip: () => void;
  savedAppsCount: number;
  onOpenSavedModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportZip,
  savedAppsCount,
  onOpenSavedModal,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl max-w-full overflow-hidden">
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-300 bg-clip-text text-transparent">
                    Web2App
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    by joo.exe
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden lg:block">
                  Multi-Platform Flutter 3.x Engine & Code Generator
                </p>
              </div>
            </div>

            {/* Quick Actions (Mobile Right) */}
            <div className="flex items-center gap-2 shrink-0 md:hidden">
              <button
                onClick={onOpenSavedModal}
                title="Saved Configurations"
                className="relative p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
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
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ZIP</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center justify-center gap-1 sm:gap-2 w-full md:w-auto overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
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
