import React, { useState } from 'react';
import {
  Settings,
  Palette,
  ShieldAlert,
  Smartphone,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Lock,
  Globe,
  Bell,
  Camera,
  MapPin,
  Folder,
  Mic,
  Cpu,
  Code,
  Zap,
  MessageSquare,
  Fingerprint,
  ShieldCheck,
  RefreshCw,
  Monitor,
  PanelTop,
  PanelBottom,
  Terminal,
  Laptop,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { AppConfig } from '../types';
import { UserProfileData } from '../lib/firebase';
import { sanitizePackageName } from '../utils/packageName';

interface ConfiguratorProps {
  config: AppConfig;
  onChangeConfig: (updated: Partial<AppConfig>) => void;
  onResetDefaults: () => void;
  userProfile?: UserProfileData | null;
  onOpenWalletModal?: () => void;
}

export const Configurator: React.FC<ConfiguratorProps> = ({
  config,
  onChangeConfig,
  onResetDefaults,
  userProfile,
  onOpenWalletModal,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'engine' | 'visuals' | 'nav' | 'custom_code' | 'advanced' | 'permissions' | 'platforms'>('general');

  const userPlan = userProfile?.subscriptionPlan || 'Free';
  const isVIP = userProfile?.isAdmin || userPlan === 'Enterprise';
  const isProOrVIP = isVIP || userPlan === 'Pro';
  const isStarterOrHigher = isProOrVIP || userPlan === 'Starter';

  const handleSelectEngine = (engine: AppConfig['engineType']) => {
    const isEnterpriseOnly = ['kmp', 'turbo-native', 'harmony-os', 'electron-pro'].includes(engine);
    const isProOrHigher = ['flutter', 'kotlin', 'swift', 'capacitor', 'react-native', 'tauri'].includes(engine);
    const isStarterEngine = ['android-webview', 'ios-webview', 'cordova'].includes(engine);

    if (isEnterpriseOnly && !isVIP) {
      alert(`Engine ${engine.toUpperCase()} adalah fitur eksklusif Paket Enterprise VIP (Rp 60.000 / bulan). Silakan tingkatkan paket di Dompet.`);
      onOpenWalletModal();
      return;
    }

    if (isProOrHigher && !isProOrVIP) {
      alert(`Engine ${engine.toUpperCase()} memerlukan Paket Pro Builder (Rp 30.000 / bulan) atau Enterprise VIP.`);
      onOpenWalletModal();
      return;
    }

    if (isStarterEngine && !isStarterOrHigher) {
      alert(`Engine ${engine.toUpperCase()} memerlukan Paket Starter (Rp 15.000 / bulan) atau lebih tinggi. Engine PWA Standalone dapat digunakan secara Gratis!`);
      onOpenWalletModal();
      return;
    }

    onChangeConfig({ engineType: engine });
  };

  const handlePermissionToggle = (key: keyof AppConfig['permissions']) => {
    onChangeConfig({
      permissions: {
        ...config.permissions,
        [key]: !config.permissions[key],
      },
    });
  };

  const handlePlatformToggle = (key: keyof AppConfig['supportedPlatforms']) => {
    onChangeConfig({
      supportedPlatforms: {
        ...config.supportedPlatforms,
        [key]: !config.supportedPlatforms[key],
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'general'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Identitas App</span>
        </button>

        <button
          onClick={() => setActiveTab('engine')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'engine'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Multi-Engine Choice</span>
        </button>

        <button
          onClick={() => setActiveTab('visuals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'visuals'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Visual & Splash</span>
        </button>

        <button
          onClick={() => setActiveTab('nav')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'nav'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Navigation & Offline</span>
        </button>

        <button
          onClick={() => setActiveTab('custom_code')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'custom_code'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Inject CSS & JS</span>
        </button>

        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'advanced'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Fitur Lanjutan</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'permissions'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Izin Native</span>
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'platforms'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Platforms</span>
        </button>
      </div>

      {/* TAB 1: GENERAL IDENTITY */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Aplikasi
              </label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => onChangeConfig({ appName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Contoh: Shopee Mobile"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Package ID (Android APK / Bundle)</span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                  ✓ Valid Format
                </span>
              </label>
              <input
                type="text"
                value={config.packageName}
                onChange={(e) => {
                  const raw = e.target.value;
                  // Replace spaces and invalid hyphens immediately for smooth user typing
                  const cleaned = raw.toLowerCase().replace(/[^a-z0-9._]/g, '_');
                  onChangeConfig({ packageName: cleaned });
                }}
                onBlur={() => {
                  const finalSanitized = sanitizePackageName(config.packageName);
                  onChangeConfig({ packageName: finalSanitized });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="com.jooexe.appname"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Format paket Android resmi. Hanya huruf kecil, angka, titik, dan garis bawah (_).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Versi Aplikasi
              </label>
              <input
                type="text"
                value={config.version}
                onChange={(e) => onChangeConfig({ version: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Developer / Author
              </label>
              <input
                type="text"
                value={config.author}
                onChange={(e) => onChangeConfig({ author: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="joo.exe"
              />
            </div>
          </div>

          {/* Sistem Upload/Terapkan Icon App (Di bawah Developer / Author) */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>Icon App Custom</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Unggah file gambar logo dari perangkat Anda atau masukkan link URL gambar PNG untuk diterapkan sebagai icon aplikasi native.
                </p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                PNG Support Ready
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              {/* Box Preview Icon Ukuran Kecil */}
              <div className="flex items-center gap-3 shrink-0 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shadow-md relative shrink-0">
                  {config.iconUrl ? (
                    <img
                      src={config.iconUrl}
                      alt="App Icon Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📱</span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold text-white block">Preview Icon</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {config.iconUrl ? 'PNG Custom Aktif' : 'Icon Default PNG'}
                  </span>
                </div>
              </div>

              {/* Control Upload File & Input URL */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="cursor-pointer px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm hover:shadow-sky-500/20">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Gambar PNG / JPG</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Ukuran file gambar maksimal 5MB!');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              // Compress to 256x256 PNG canvas for optimal performance
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 256;
                                canvas.height = 256;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, 256, 256);
                                  const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
                                  onChangeConfig({ iconUrl: compressedDataUrl });
                                } else {
                                  onChangeConfig({ iconUrl: result });
                                }
                              };
                              img.onerror = () => {
                                onChangeConfig({ iconUrl: result });
                              };
                              img.src = result;
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {config.iconUrl && (
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ iconUrl: '' })}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hapus Gambar PNG</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={config.iconUrl || ''}
                  onChange={(e) => onChangeConfig({ iconUrl: e.target.value })}
                  placeholder="Atau masukkan URL gambar PNG (https://domain.com/logo.png)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MULTI-ENGINE SELECTION */}
      {activeTab === 'engine' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Pilih Native Compilation Engine</h3>
            <p className="text-xs text-slate-400 mb-4">
              Pilih mesin pendorong utama yang akan mengeksekusi aplikasi web Anda secara native di perangkat mobile & desktop.
            </p>

            {!isVIP && ['kmp', 'turbo-native', 'harmony-os', 'electron-pro'].includes(config.engineType) && (
              <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-200 text-xs flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Engine <strong>{config.engineType.toUpperCase()}</strong> adalah fitur eksklusif paket <strong>Enterprise VIP (Rp 60.000)</strong>.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow shrink-0 transition-all cursor-pointer"
                >
                  Upgrade Rp 60.000
                </button>
              </div>
            )}

            {!isProOrVIP && ['flutter', 'kotlin', 'swift', 'capacitor', 'react-native', 'tauri'].includes(config.engineType) && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Engine <strong>{config.engineType.toUpperCase()}</strong> adalah fitur eksklusif paket <strong>Pro Builder (Rp 30.000)</strong> & <strong>Enterprise VIP</strong>.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-lg shadow shrink-0 transition-all cursor-pointer"
                >
                  Upgrade Rp 30.000
                </button>
              </div>
            )}

            {!isStarterOrHigher && ['android-webview', 'ios-webview', 'cordova'].includes(config.engineType) && (
              <div className="p-3.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-200 text-xs flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Engine <strong>{config.engineType.toUpperCase()}</strong> memerlukan paket <strong>Starter (Rp 15.000)</strong>, <strong>Pro Builder</strong>, atau <strong>Enterprise VIP</strong>.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg shadow shrink-0 transition-all cursor-pointer"
                >
                  Upgrade Rp 15.000
                </button>
              </div>
            )}

            <div className="space-y-6">

              {/* TIER 0: FREE ENGINES (Rp 0) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>1. Gratis / Free Engine (Rp 0)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Tanpa Langganan
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectEngine('pwa-shell')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'pwa-shell'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>PWA Standalone WebShell</span>
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Gratis / Free</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Manifest V3 Progressive Web App dengan Workbox Service Worker offline caching. Tanpa butuh SDK Android/iOS.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Installable App</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Offline Cache</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Zero-SDK Needed</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* TIER 1: STARTER ENGINES (Rp 15.000 / Bulan) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <span>2. Paket Starter (Rp 15.000 / Bulan)</span>
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Starter Tier
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectEngine('android-webview')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'android-webview'
                        ? 'bg-sky-500/20 border-sky-500 text-white ring-1 ring-sky-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-sky-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-sky-400" />
                        <span>Basic Android WebView Shell</span>
                      </span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">Starter 15k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Wadah aplikasi native Android dengan WebView AndroidX, splash screen, & integrasi URL utama.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> Native APK Wrapper</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> Splash Screen</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> Ringan & Cepat</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('ios-webview')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'ios-webview'
                        ? 'bg-sky-500/20 border-sky-500 text-white ring-1 ring-sky-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-sky-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-sky-400" />
                        <span>Basic iOS WKWebView Wrapper</span>
                      </span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">Starter 15k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Kontainer Swift WKWebView ringan khusus iOS dengan penanganan navigasi & penjelajahan aman.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> iOS Swift Shell</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> WKWebView 60FPS</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> Minimal Memory</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('cordova')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'cordova'
                        ? 'bg-sky-500/20 border-sky-500 text-white ring-1 ring-sky-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-sky-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-sky-400" />
                        <span>Apache Cordova Hybrid</span>
                      </span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">Starter 15k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Kerangka kerja hybrid klasik Apache Cordova untuk bundel web multi-platform (Android & iOS).
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> Cross-Platform</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> Cordova Plugins</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-sky-400" /> Stable Classic</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* TIER 2: PRO BUILDER ENGINES (Rp 30.000 / Bulan) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>3. Paket Pro Builder (Rp 30.000 / Bulan)</span>
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Paling Populer
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectEngine('flutter')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'flutter'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Flutter 3.x Engine</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Pro 30k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Menggunakan `webview_flutter` versi terbaru, hardware acceleration GPU, smart cache, & multi-platform compilation.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Pull-to-refresh</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Hardware Back Button</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> JS Bridge</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('kotlin')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'kotlin'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>Android Jetpack Compose</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Pro 30k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Kotlin + AndroidX WebKit + Material3 Design. Ukuran APK sangat kecil dan dioptimalkan khusus untuk ekosistem Android.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> AndroidX WebKit</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Splash API</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Native Intent</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('swift')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'swift'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>iOS Swift / SwiftUI</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Pro 30k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      SwiftUI + WKWebView + Apple Push Notification Service (APNS). Performa 60FPS murni untuk iPhone & iPad.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> WKWebView</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> iOS Swipe Back</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Safari Engine</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('capacitor')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'capacitor'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>Capacitor / PWA Hybrid</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Pro 30k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Capacitor 6.x runtime dengan Service Worker caching dan akses penuh ke Native Plugins web JS.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Offline SW</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Web Plugins</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Cross-Platform</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('react-native')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'react-native'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-amber-400" />
                        <span>React Native / Expo Engine</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Pro 30k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      React Native 0.74 + Expo Webview shell. Dioptimalkan untuk kompatibilitas JavaScript modern dan Fast Refresh.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Expo Webview</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> React Hooks Bridge</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Universal JS</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('tauri')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'tauri'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        <span>Tauri 2.0 Rust Engine</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Pro 30k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Engine Tauri versi 2 (Rust + WebView2/WKWebView). Ukuran executable sangat kecil (&lt; 5MB) dan keamanan tingkat tinggi.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Hardened Memory</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Minimal Memory RAM</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-amber-400" /> Cross-Desktop/Mobile</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* TIER 3: ENTERPRISE VIP ENGINES (Rp 60.000 / Bulan) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>4. Paket Enterprise VIP (Rp 60.000 / Bulan)</span>
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Full Unlocked VIP
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectEngine('kmp')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'kmp'
                        ? 'bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span>Kotlin Multiplatform (KMP)</span>
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">Enterprise 60k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      KMP shared business logic + Compose Multiplatform UI. Performa kompilasi murni LLVM/JVM untuk Android & iOS.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Shared Logic</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Compose UI</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Native Performance</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('turbo-native')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'turbo-native'
                        ? 'bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-purple-400" />
                        <span>Hotwire Turbo Native Engine</span>
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">Enterprise 60k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Engine navigasi Hotwire/Turbo untuk menyatukan halaman web real-time server dengan transisi layar native super mulus.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Turbo Navigation</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Zero Reload Lag</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Server-Driven</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('harmony-os')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'harmony-os'
                        ? 'bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span>OpenHarmony (ArkUI Engine)</span>
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">Enterprise 60k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Mesin ArkUI & WebKit Huawei HarmonyOS NEXT untuk ekosistem perangkat pintar global terbaru.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> ArkUI Runtime</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Harmony WebKit</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> HarmonyOS NEXT</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectEngine('electron-pro')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      config.engineType === 'electron-pro'
                        ? 'bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-purple-400" />
                        <span>Electron Pro Desktop Engine</span>
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">Enterprise 60k</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">
                      Chromium 126 + Node.js 20 wrapper produksi dengan fitur tray bar, installer `.exe`, `.dmg`, `.AppImage`, & auto-updater.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Full Desktop Shell</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> System Tray</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> Auto-Updater</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUALS & SPLASH */}
      {activeTab === 'visuals' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Warna Utama (Theme Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.themeColor}
                  onChange={(e) => onChangeConfig({ themeColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.themeColor}
                  onChange={(e) => onChangeConfig({ themeColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Warna Aksen (Accent Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => onChangeConfig({ accentColor: e.target.value })}
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.accentColor}
                  onChange={(e) => onChangeConfig({ accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Judul Splash Screen
              </label>
              <input
                type="text"
                value={config.splashTitle}
                onChange={(e) => onChangeConfig({ splashTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slogan / Sub-judul Splash Screen
              </label>
              <input
                type="text"
                value={config.splashTagline}
                onChange={(e) => onChangeConfig({ splashTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Durasi Splash Screen: {config.splashDurationSec} detik
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={config.splashDurationSec}
                onChange={(e) => onChangeConfig({ splashDurationSec: parseInt(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NAVIGATION & WEBVIEW */}
      {activeTab === 'nav' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Mode Layout Tampilan (Nav Mode)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onChangeConfig({ navMode: 'fullscreen' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.navMode === 'fullscreen'
                    ? 'bg-sky-500/20 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Fullscreen Mobile</span>
                </div>
                <div className="text-[11px] text-slate-400">Tampilan layar penuh mirip PWA native.</div>
              </button>

              <button
                type="button"
                onClick={() => onChangeConfig({ navMode: 'header' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.navMode === 'header'
                    ? 'bg-sky-500/20 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs mb-1 flex items-center gap-1.5">
                  <PanelTop className="w-3.5 h-3.5 text-sky-400" />
                  <span>Native Header Bar</span>
                </div>
                <div className="text-[11px] text-slate-400">Termasuk tombol Refresh, Back, dan Forward.</div>
              </button>

              <button
                type="button"
                onClick={() => onChangeConfig({ navMode: 'bottom_nav' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.navMode === 'bottom_nav'
                    ? 'bg-sky-500/20 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs mb-1 flex items-center gap-1.5">
                  <PanelBottom className="w-3.5 h-3.5 text-sky-400" />
                  <span>Bottom Navigation Bar</span>
                </div>
                <div className="text-[11px] text-slate-400">Navigasi bawah khusus untuk berpindah tab.</div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Enable Pull-To-Refresh</div>
                <div className="text-[11px] text-slate-400">Pengguna dapat menggeser layar ke bawah untuk muat ulang.</div>
              </div>
              <input
                type="checkbox"
                checked={config.enablePullToRefresh}
                onChange={(e) => onChangeConfig({ enablePullToRefresh: e.target.checked })}
                className="w-4 h-4 accent-sky-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Smart Offline Guard & Retry Screen</div>
                <div className="text-[11px] text-slate-400">Tampilkan halaman khusus saat internet terputus.</div>
              </div>
              <input
                type="checkbox"
                checked={config.enableOfflineFallback}
                onChange={(e) => onChangeConfig({ enableOfflineFallback: e.target.checked })}
                className="w-4 h-4 accent-sky-500"
              />
            </label>

            {config.enableOfflineFallback && (
              <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <label className="block text-xs font-bold text-slate-300 mb-1">Custom HTML Halaman Offline</label>
                <textarea
                  value={config.customOfflineHtml}
                  onChange={(e) => onChangeConfig({ customOfflineHtml: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="<h2>Koneksi Terputus</h2>"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CUSTOM CODE INJECTION */}
      {activeTab === 'custom_code' && (
        <div className="space-y-4">
          {!isProOrVIP && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Fitur Injeksi Custom CSS & JS memerlukan Paket <strong>Pro Builder (Rp 30.000)</strong> atau <strong>Enterprise VIP</strong>.</span>
              </div>
              <button
                type="button"
                onClick={onOpenWalletModal}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-lg shadow shrink-0 transition-all cursor-pointer"
              >
                Upgrade Rp 30.000
              </button>
            </div>
          )}

          <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <div>
              <div className="text-xs font-bold text-white">Aktifkan Custom CSS & JS Injector</div>
              <div className="text-[11px] text-slate-400">Injeksi CSS untuk merubah tampilan web (misal: sembunyikan header) dan JS otomatis saat dimuat.</div>
            </div>
            <input
              type="checkbox"
              checked={config.enableCustomCssJs}
              onChange={(e) => onChangeConfig({ enableCustomCssJs: e.target.checked })}
              className="w-4 h-4 accent-sky-500"
            />
          </label>

          {config.enableCustomCssJs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Injeksi Custom CSS</span>
                  <span className="text-[10px] text-sky-400 font-normal">Sembunyikan elemen web</span>
                </label>
                <textarea
                  value={config.customCss}
                  onChange={(e) => onChangeConfig({ customCss: e.target.value })}
                  rows={6}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="/* .site-header, .footer { display: none !important; } */"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Injeksi Custom JavaScript</span>
                  <span className="text-[10px] text-amber-400 font-normal">Skenario Otomatis</span>
                </label>
                <textarea
                  value={config.customJs}
                  onChange={(e) => onChangeConfig({ customJs: e.target.value })}
                  rows={6}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="console.log('Injected JS from Web2App');"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-white mb-2">Deep Linking Custom Scheme</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={config.deepLinkScheme}
                onChange={(e) => onChangeConfig({ deepLinkScheme: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                placeholder="myapp"
              />
              <span className="text-xs text-slate-400 font-mono">://</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Pengguna dapat membuka aplikasi Anda dari browser dengan mengetik <span className="text-slate-300 font-mono">{config.deepLinkScheme || 'myapp'}://open</span>
            </p>
          </div>
        </div>
      )}

      {/* TAB: ADVANCED FEATURES (100% COMPLETE) */}
      {activeTab === 'advanced' && (
        <div className="space-y-5">
          {/* 1. Floating Action Button (FAB) */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 inline" />
                  <span>Native Floating Action Button (FAB)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">Populer</span>
                </div>
                <div className="text-[11px] text-slate-400">Tampilkan tombol melayang di pojok layar (contoh: Chat WhatsApp CS atau Telepon).</div>
              </div>
              <input
                type="checkbox"
                checked={config.enableFloatingButton}
                onChange={(e) => onChangeConfig({ enableFloatingButton: e.target.checked })}
                className="w-4 h-4 accent-sky-500"
              />
            </label>

            {config.enableFloatingButton && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipe Tombol FAB</label>
                  <select
                    value={config.fabType}
                    onChange={(e) => onChangeConfig({ fabType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="whatsapp">WhatsApp Direct Chat</option>
                    <option value="call">Telepon Langsung (Call)</option>
                    <option value="url">Buka Link Khusus</option>
                    <option value="custom_js">Eksekusi Script JS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {config.fabType === 'whatsapp' || config.fabType === 'call' ? 'Nomor HP (dengan 62)' : 'Target URL / Script'}
                  </label>
                  <input
                    type="text"
                    value={config.fabTarget}
                    onChange={(e) => onChangeConfig({ fabTarget: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    placeholder="6281234567890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Posisi Layar</label>
                  <select
                    value={config.fabPosition}
                    onChange={(e) => onChangeConfig({ fabPosition: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="bottom_right">Pojok Kanan Bawah</option>
                    <option value="bottom_left">Pojok Kiri Bawah</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. Security & Anti-Screenshot Guard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>Keamanan Layar (Anti-Screenshot)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Aktifkan FLAG_SECURE untuk cegah screenshot & rekaman layar (cocok untuk app finansial).</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableScreenSecurity}
                  onChange={(e) => onChangeConfig({ enableScreenSecurity: e.target.checked })}
                  className="w-4 h-4 accent-sky-500"
                />
              </label>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-sky-400" />
                    <span>Biometric / Fingerprint App Lock</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Wajibkan verifikasi Sidik Jari / FaceID sebelum pengguna dapat membuka app.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableBiometrics}
                  onChange={(e) => onChangeConfig({ enableBiometrics: e.target.checked })}
                  className="w-4 h-4 accent-sky-500"
                />
              </label>
            </div>
          </div>

          {/* 3. SSL Pinning & Domain Whitelist */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-sky-400" />
                  <span>SSL Pinning & Domain Whitelist Filter</span>
                </div>
                <div className="text-[11px] text-slate-400">Kunci WebView hanya untuk domain resmi dan cegah serangan Phishing/Man-in-the-middle.</div>
              </div>
              <input
                type="checkbox"
                checked={config.enableSslPinning}
                onChange={(e) => onChangeConfig({ enableSslPinning: e.target.checked })}
                className="w-4 h-4 accent-sky-500"
              />
            </label>

            {config.enableSslPinning && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daftar Domain Diizinkan (pisahkan koma)</label>
                <input
                  type="text"
                  value={config.allowedDomains}
                  onChange={(e) => onChangeConfig({ allowedDomains: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  placeholder="*.shopee.co.id, *.shopeepay.co.id"
                />
              </div>
            )}
          </div>

          {/* 4. Auto-Update Checker & Loader Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-sky-400" />
                    <span>Auto-Update & Version Enforcement</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Cek update otomatis dari URL JSON server Anda.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableAutoUpdate}
                  onChange={(e) => onChangeConfig({ enableAutoUpdate: e.target.checked })}
                  className="w-4 h-4 accent-sky-500"
                />
              </label>
              {config.enableAutoUpdate && (
                <input
                  type="text"
                  value={config.updateCheckUrl}
                  onChange={(e) => onChangeConfig({ updateCheckUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono mt-2"
                  placeholder="https://api.domain.com/version.json"
                />
              )}
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Style Loading Indicator (Page Spinner)</span>
              </label>
              <select
                value={config.loadingSpinnerType}
                onChange={(e) => onChangeConfig({ loadingSpinnerType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="pulse">Pulse Glowing Logo</option>
                <option value="ring">Dual Ring Spinner</option>
                <option value="dots">Chasing Dots</option>
                <option value="bar">Linear Progress Line (Top)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-2">
            Aktifkan izin native yang dibutuhkan oleh website Anda. Web2App akan otomatis memasukkan rincian izin di AndroidManifest.xml dan Info.plist.
          </p>

          <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-xs font-bold text-white">Kamera (Camera)</div>
                <div className="text-[11px] text-slate-400">Upload foto profil, scan QR code, atau video call.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.permissions.camera}
              onChange={() => handlePermissionToggle('camera')}
              className="w-4 h-4 accent-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">Lokasi (Location GPS)</div>
                <div className="text-[11px] text-slate-400">Fitur peta, alamat pengiriman, atau deteksi wilayah.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.permissions.location}
              onChange={() => handlePermissionToggle('location')}
              className="w-4 h-4 accent-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">Notifikasi Push (Notifications)</div>
                <div className="text-[11px] text-slate-400">Kirim pemberitahuan promo, update, dan pesan baru.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.permissions.notifications}
              onChange={() => handlePermissionToggle('notifications')}
              className="w-4 h-4 accent-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <Folder className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Penyimpanan / Unduhan (Storage)</div>
                <div className="text-[11px] text-slate-400">Unduh file, dokumen PDF, dan gambar dari WebView.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.permissions.storage}
              onChange={() => handlePermissionToggle('storage')}
              className="w-4 h-4 accent-sky-500"
            />
          </label>
        </div>
      )}

      {/* TAB 5: MULTI PLATFORM TARGETS */}
      {activeTab === 'platforms' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-2">
            Dengan Flutter, satu kode basis `main.dart` yang kami hasilkan dapat langsung dikompilasi ke 6 platform berikut:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'android', name: 'Android APK / Bundle', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
              { id: 'ios', name: 'iOS App Store', icon: <Smartphone className="w-4 h-4 text-purple-400" /> },
              { id: 'web', name: 'Flutter Web / PWA', icon: <Globe className="w-4 h-4 text-indigo-400" /> },
              { id: 'windows', name: 'Windows Desktop', icon: <Monitor className="w-4 h-4 text-sky-400" /> },
              { id: 'macos', name: 'macOS Desktop', icon: <Laptop className="w-4 h-4 text-slate-300" /> },
              { id: 'linux', name: 'Linux Desktop', icon: <Terminal className="w-4 h-4 text-amber-400" /> },
            ].map((p) => (
              <label
                key={p.id}
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {p.icon}
                  <span className="text-xs font-bold text-white">{p.name}</span>
                </div>
                <input
                  type="checkbox"
                  checked={
                    config.supportedPlatforms[p.id as keyof AppConfig['supportedPlatforms']]
                  }
                  onChange={() =>
                    handlePlatformToggle(p.id as keyof AppConfig['supportedPlatforms'])
                  }
                  className="w-4 h-4 accent-sky-500"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
