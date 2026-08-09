import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Play,
  Share2,
  Lock,
  Volume2,
  BatteryCharging,
  MessageSquare,
  Globe,
} from 'lucide-react';
import { AppConfig } from '../types';

interface DeviceSimulatorProps {
  config: AppConfig;
  onChangeConfig: (updated: Partial<AppConfig>) => void;
  onOpenExportTab: () => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  config,
  onChangeConfig,
  onOpenExportTab,
}) => {
  const [deviceModel, setDeviceModel] = useState<'pixel' | 'iphone' | 'ipad' | 'desktop'>('pixel');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showSplash, setShowSplash] = useState(false);
  const [isOfflineTest, setIsOfflineTest] = useState(false);
  const [useProxyViewer, setUseProxyViewer] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const triggerSplashScreen = () => {
    setShowSplash(true);
    setTimeout(() => {
      setShowSplash(false);
    }, config.splashDurationSec * 1000);
  };

  const handleRefreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const isStaticEdgeHost = typeof window !== 'undefined' && (
    window.location.hostname.includes('workers.dev') ||
    window.location.hostname.includes('pages.dev') ||
    window.location.hostname.includes('github.io')
  );

  const targetSiteUrl = config.url || 'https://shopee.co.id';

  const previewUrl = (useProxyViewer && !isStaticEdgeHost)
    ? `/api/proxy?url=${encodeURIComponent(targetSiteUrl)}`
    : targetSiteUrl;

  // Device Dimensions Mapping
  const getDeviceDimensions = () => {
    if (orientation === 'landscape') {
      switch (deviceModel) {
        case 'pixel':
          return 'w-full max-w-[720px] h-[360px]';
        case 'iphone':
          return 'w-full max-w-[750px] h-[380px]';
        case 'ipad':
          return 'w-full max-w-[840px] h-[520px] sm:h-[600px]';
        case 'desktop':
          return 'w-full max-w-[900px] h-[500px] sm:h-[550px]';
      }
    }
    switch (deviceModel) {
      case 'pixel':
        return 'w-full max-w-[360px] h-[640px] sm:h-[720px]';
      case 'iphone':
        return 'w-full max-w-[375px] h-[660px] sm:h-[750px]';
      case 'ipad':
        return 'w-full max-w-[600px] h-[720px] sm:h-[840px]';
      case 'desktop':
        return 'w-full max-w-[850px] h-[500px] sm:h-[550px]';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-hidden">
      {/* Real-Time Viewer Control Bar */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Device Selectors */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-full overflow-x-auto">
          <button
            onClick={() => setDeviceModel('pixel')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              deviceModel === 'pixel'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pixel</span>
          </button>

          <button
            onClick={() => setDeviceModel('iphone')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              deviceModel === 'iphone'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone</span>
          </button>

          <button
            onClick={() => setDeviceModel('ipad')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              deviceModel === 'ipad'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => setDeviceModel('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              deviceModel === 'desktop'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Simulator Button */}
          <button
            onClick={handleRefreshIframe}
            title="Muat Ulang Halaman Simulator"
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all flex items-center gap-1 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Refresh</span>
          </button>

          {/* Proxy Mode Toggle to bypass frame blocking */}
          <button
            onClick={() => setUseProxyViewer(!useProxyViewer)}
            title="Toggle Live Web Proxy (Bypasses Frame-Blocking)"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
              useProxyViewer
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{useProxyViewer ? 'Proxy' : 'Direct'}</span>
          </button>

          {/* Test Offline Network Guard */}
          <button
            onClick={() => setIsOfflineTest(!isOfflineTest)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
              isOfflineTest
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isOfflineTest ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isOfflineTest ? 'Offline' : 'Online'}</span>
          </button>

          {/* Test Splash Screen */}
          <button
            onClick={triggerSplashScreen}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md transition-all flex items-center gap-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Splash</span>
          </button>
        </div>
      </div>

      {/* DEVICE FRAME CONTAINER */}
      <div className="w-full max-w-full flex justify-center overflow-x-auto p-1 sm:p-2">
        <div
          className={`relative bg-slate-950 rounded-[32px] sm:rounded-[40px] p-2.5 sm:p-4 border-2 sm:border-4 border-slate-800 shadow-2xl shadow-sky-950/40 transition-all duration-300 ${getDeviceDimensions()}`}
          style={{
            boxShadow: `0 20px 40px -10px rgba(1, 117, 194, 0.25), 0 0 0 8px #0f172a`,
          }}
        >
          {/* Hardware Camera Notch / Dynamic Island */}
          {deviceModel === 'iphone' && orientation === 'portrait' && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-2 h-2 rounded-full bg-blue-900/60" />
            </div>
          )}

          {deviceModel === 'pixel' && orientation === 'portrait' && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-50 border border-slate-800" />
          )}

          {/* Mobile Screen Container */}
          <div className="w-full h-full bg-slate-900 rounded-[28px] overflow-hidden flex flex-col relative border border-slate-800/80">
            {/* Flutter Status Bar */}
            <div
              className="px-3.5 py-1.5 flex items-center justify-between text-[11px] font-semibold tracking-tight text-white select-none z-40 transition-colors border-b border-slate-800/40"
              style={{ backgroundColor: config.themeColor }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-emerald-500/30 border border-emerald-400/50 px-2 py-0.5 rounded-full text-[10px] font-black text-emerald-300 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </div>
                <span className="text-[10px] opacity-90">{currentTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="w-3 h-3" />
                <span className="text-[10px]">5G</span>
                <BatteryCharging className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Optional App Header */}
            {config.navMode === 'header' && (
              <div
                className="px-3 py-2 flex items-center justify-between text-white shadow-md z-30"
                style={{ backgroundColor: config.themeColor }}
              >
                <div className="flex items-center space-x-2">
                  {config.iconUrl ? (
                    <img src={config.iconUrl} alt="App Icon" className="w-5 h-5 object-cover rounded-md shrink-0" />
                  ) : (
                    <span className="text-base">📱</span>
                  )}
                  <span className="font-bold text-sm truncate max-w-[150px]">
                    {config.appName}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleRefreshIframe}
                    className="p-1 rounded hover:bg-white/10 text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Splash Screen Overlay */}
            {showSplash ? (
              <div
                className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-white text-center animate-fadeIn"
                style={{ backgroundColor: config.themeColor }}
              >
                <div className="w-20 h-20 rounded-2xl bg-white text-slate-950 flex items-center justify-center text-4xl shadow-2xl mb-4 transform scale-105 transition-transform overflow-hidden p-1">
                  {config.iconUrl ? (
                    <img src={config.iconUrl} alt="App Icon" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-4xl">📱</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">{config.splashTitle}</h2>
                <p className="text-xs opacity-90 mb-8">{config.splashTagline}</p>
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-[10px] opacity-70 font-mono tracking-wider">
                  Powered by Web2App joo.exe
                </span>
              </div>
            ) : isOfflineTest ? (
              /* Offline Guard View */
              <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center text-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <WifiOff className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  Koneksi Internet Terputus
                </h3>
                <p className="text-xs text-slate-500 max-w-[220px] mb-6">
                  Fitur Offline Fallback Flutter akan aktif saat pengguna kehilangan sinyal.
                </p>
                <button
                  onClick={() => setIsOfflineTest(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95"
                  style={{ backgroundColor: config.themeColor }}
                >
                  Muat Ulang Koneksi
                </button>
              </div>
            ) : (
              /* Live Web View Canvas */
              <div className="flex-1 relative bg-white overflow-hidden">
                <iframe
                  key={iframeKey}
                  src={previewUrl}
                  title="Flutter Live Mobile Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />

                {/* Floating Action Button Simulator Overlay */}
                {config.enableFloatingButton && (
                  <button
                    onClick={() => {
                      if (config.fabType === 'whatsapp' || config.fabType === 'call') {
                        window.open(`https://wa.me/${config.fabTarget || '6281234567890'}`, '_blank');
                      } else {
                        alert(`FAB Triggered: ${config.fabTarget || 'Native Event'}`);
                      }
                    }}
                    className={`absolute bottom-4 ${
                      config.fabPosition === 'bottom_left' ? 'left-4' : 'right-4'
                    } z-30 px-3.5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center gap-1.5 text-xs font-bold transition-transform hover:scale-105 active:scale-95 border border-emerald-400/50`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    <span>Chat CS</span>
                  </button>
                )}
              </div>
            )}

            {/* Optional Bottom Navigation Bar */}
            {config.navMode === 'bottom_nav' && !showSplash && !isOfflineTest && (
              <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-around text-slate-400 text-[10px]">
                <button
                  onClick={handleRefreshIframe}
                  className="flex flex-col items-center gap-1 text-sky-400 font-semibold"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload</span>
                </button>
                <button
                  onClick={() => setIsOfflineTest(true)}
                  className="flex flex-col items-center gap-1 hover:text-white"
                >
                  <WifiOff className="w-4 h-4" />
                  <span>Test Offline</span>
                </button>
                <button
                  onClick={onOpenExportTab}
                  className="flex flex-col items-center gap-1 hover:text-white"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Export APK</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Tampilan Real-Time di atas ditenagai oleh Live Web Proxy Web2App, menampilkan isi website secara utuh dan responsif.</span>
      </div>
    </div>
  );
};
