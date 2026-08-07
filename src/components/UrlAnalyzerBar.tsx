import React, { useState } from 'react';
import { Globe, ArrowRight, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AppConfig, WebSiteAnalysis } from '../types';

interface UrlAnalyzerBarProps {
  config: AppConfig;
  onChangeConfig: (updated: Partial<AppConfig>) => void;
  onAnalyzeUrl: (inputUrl: string) => Promise<WebSiteAnalysis | null>;
  isAnalyzing: boolean;
  lastAnalysis: WebSiteAnalysis | null;
}

export const UrlAnalyzerBar: React.FC<UrlAnalyzerBarProps> = ({
  config,
  onChangeConfig,
  onAnalyzeUrl,
  isAnalyzing,
  lastAnalysis,
}) => {
  const [inputUrl, setInputUrl] = useState(config.url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;

    let formatted = inputUrl.trim();
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = 'https://' + formatted;
    }

    setInputUrl(formatted);
    onChangeConfig({ url: formatted });

    const analysis = await onAnalyzeUrl(formatted);
    if (analysis) {
      onChangeConfig({
        appName: analysis.title || config.appName,
        packageName: analysis.suggestedPackageName || config.packageName,
        themeColor: analysis.themeColor || config.themeColor,
        splashTitle: analysis.title || config.splashTitle,
      });
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-6 max-w-full overflow-hidden">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-sky-400 shrink-0" />
          <span>Masukkan URL Website Untuk Dikonversi</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Engine Flutter Web2App akan memuat, mengoptimalkan viewport mobile, dan mengkonfigurasi WebView Native secara otomatis.
        </p>
      </div>

      {/* Main Converter Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Contoh: https://shopee.co.id atau detik.com"
            className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Memeriksa Site...</span>
            </>
          ) : (
            <>
              <span>Konversi Ke App</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Inspection Results Banner */}
      {lastAnalysis && (
        <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 min-w-0">
            {lastAnalysis.favicon && (
              <img
                src={lastAnalysis.favicon}
                alt="favicon"
                className="w-4 h-4 rounded shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span className="font-semibold text-white truncate">{lastAnalysis.title}</span>
            <span className="text-slate-500 truncate">({lastAnalysis.domain})</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] flex-wrap">
            <span className={`flex items-center gap-1 ${lastAnalysis.isHttps ? 'text-emerald-400' : 'text-amber-400'}`}>
              {lastAnalysis.isHttps ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HTTPS Secure</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>HTTP</span>
                </>
              )}
            </span>
            <span className="text-sky-400">
              Package: {lastAnalysis.suggestedPackageName}
            </span>
            <div
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ backgroundColor: lastAnalysis.themeColor }}
              title={`Detected theme color: ${lastAnalysis.themeColor}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
