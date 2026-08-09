import React from 'react';
import { X, FolderSync, Trash2, ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import { AppConfig } from '../types';

interface SavedAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedApps: AppConfig[];
  onLoadApp: (app: AppConfig) => void;
  onDeleteApp: (id: string) => void;
}

export const SavedAppsModal: React.FC<SavedAppsModalProps> = ({
  isOpen,
  onClose,
  savedApps,
  onLoadApp,
  onDeleteApp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <FolderSync className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-lg text-white">Riwayat Aplikasi Tersimpan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {savedApps.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">Belum ada riwayat aplikasi yang tersimpan.</p>
              <p className="text-xs text-slate-500 mt-1">
                Aplikasi yang Anda konversi akan otomatis tersimpan di sini.
              </p>
            </div>
          ) : (
            savedApps.map((app) => (
              <div
                key={app.id}
                className="p-4 bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 rounded-xl transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow overflow-hidden p-0.5"
                    style={{ backgroundColor: app.themeColor }}
                  >
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={app.appName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span>{app.iconEmoji}</span>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-white truncate">{app.appName}</h4>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1 truncate"
                    >
                      <span>{app.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      Package: {app.packageName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onLoadApp(app);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-bold text-xs rounded-lg border border-sky-500/30 transition-all flex items-center gap-1"
                  >
                    <span>Muat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteApp(app.id)}
                    title="Hapus Dari Riwayat"
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
