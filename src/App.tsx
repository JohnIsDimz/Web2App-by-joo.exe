import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlAnalyzerBar } from './components/UrlAnalyzerBar';
import { DeviceSimulator } from './components/DeviceSimulator';
import { Configurator } from './components/Configurator';
import { CodeExportView } from './components/CodeExportView';
import { SavedAppsModal } from './components/SavedAppsModal';
import { AppConfig, WebSiteAnalysis } from './types';
import { downloadFlutterProjectZip } from './utils/zipExporter';

const DEFAULT_CONFIG: AppConfig = {
  id: 'default-app',
  url: 'https://shopee.co.id',
  appName: 'ShopMax Mobile',
  packageName: 'com.jooexe.shopmax',
  version: '1.0.0',
  author: 'joo.exe',
  engineType: 'flutter',
  themeColor: '#EE4D2D',
  accentColor: '#FF6B00',
  backgroundColor: '#FAFAFA',
  iconEmoji: 'App',
  splashTitle: 'ShopMax Mobile',
  splashTagline: 'Konversi Web Ke App Cepat & Stabil',
  splashDurationSec: 2,
  navMode: 'fullscreen',
  enablePullToRefresh: true,
  enableOfflineFallback: true,
  customOfflineHtml: '<div style="text-align:center;padding:40px;font-family:sans-serif;color:#333;"><h2>Tidak Ada Koneksi</h2><p>Silakan periksa jaringan internet Anda dan coba lagi.</p></div>',
  enableCustomCssJs: false,
  customCss: '/* Custom CSS untuk sembunyikan header web jika diperlukan */\n/* .site-header { display: none !important; } */',
  customJs: '// Custom JS yang dieksekusi saat halaman web selesai dimuat\nconsole.log("Web2App Native Engine Activated!");',
  enableCustomUserAgent: false,
  customUserAgent: '',
  permissions: {
    camera: true,
    location: true,
    notifications: true,
    storage: true,
    microphone: false,
  },
  supportedPlatforms: {
    android: true,
    ios: true,
    web: true,
    windows: true,
    macos: true,
    linux: true,
  },
  enableJsBridge: true,
  enableBackButtonHandling: true,
  keepScreenOn: false,
  enableInAppDownloads: true,
  enableDeepLinking: true,
  deepLinkScheme: 'shopmax',
  enablePushNotifications: false,
  pushProvider: 'onesignal',
  oneSignalAppId: '',
  enableAdMob: false,
  adMobBannerId: '',
  bottomNavItems: [
    { id: '1', label: 'Home', url: '/', icon: 'Home' },
    { id: '2', label: 'Promo', url: '/promo', icon: 'Tag' },
    { id: '3', label: 'Bantuan', url: '/help', icon: 'HelpCircle' },
  ],
  enableFloatingButton: false,
  fabType: 'whatsapp',
  fabTarget: '6281234567890',
  fabPosition: 'bottom_right',
  enableBiometrics: false,
  enableScreenSecurity: false,
  enableAutoUpdate: false,
  updateCheckUrl: '',
  enableSslPinning: false,
  allowedDomains: '',
  loadingSpinnerType: 'pulse',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'config' | 'export'>('simulator');
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('web2app_current_config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (err) {
        console.error('Failed to parse saved config', err);
      }
    }
    return DEFAULT_CONFIG;
  });

  const [savedApps, setSavedApps] = useState<AppConfig[]>(() => {
    const saved = localStorage.getItem('web2app_saved_apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved apps', err);
      }
    }
    return [DEFAULT_CONFIG];
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<WebSiteAnalysis | null>(null);

  // Auto-persist current config
  useEffect(() => {
    localStorage.setItem('web2app_current_config', JSON.stringify(config));
  }, [config]);

  // Auto-persist saved apps
  useEffect(() => {
    localStorage.setItem('web2app_saved_apps', JSON.stringify(savedApps));
  }, [savedApps]);

  const handleUpdateConfig = (updated: Partial<AppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      // Sync into savedApps list if present
      setSavedApps((apps) => apps.map((a) => (a.id === next.id ? next : a)));
      return next;
    });
  };

  const handleAnalyzeUrl = async (inputUrl: string): Promise<WebSiteAnalysis | null> => {
    setIsAnalyzingUrl(true);
    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setLastAnalysis(data);
      return data;
    } catch (error) {
      console.error('Failed to analyze URL', error);
      return null;
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  const handleExportZip = () => {
    downloadFlutterProjectZip(config);
  };

  const handleDeleteSavedApp = (id: string) => {
    setSavedApps((apps) => apps.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportZip={handleExportZip}
        savedAppsCount={savedApps.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
        {/* Converter URL Bar */}
        <UrlAnalyzerBar
          config={config}
          onChangeConfig={handleUpdateConfig}
          onAnalyzeUrl={handleAnalyzeUrl}
          isAnalyzing={isAnalyzingUrl}
          lastAnalysis={lastAnalysis}
        />

        {/* Tab 1: Live Simulator */}
        {activeTab === 'simulator' && (
          <DeviceSimulator
            config={config}
            onChangeConfig={handleUpdateConfig}
            onOpenExportTab={() => setActiveTab('export')}
          />
        )}

        {/* Tab 2: Configurator */}
        {activeTab === 'config' && (
          <Configurator
            config={config}
            onChangeConfig={handleUpdateConfig}
            onResetDefaults={() => setConfig(DEFAULT_CONFIG)}
          />
        )}

        {/* Tab 3: Code & Export */}
        {activeTab === 'export' && (
          <CodeExportView config={config} onExportZip={handleExportZip} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-bold text-slate-300">Web2App by joo.exe</span>
            <span>•</span>
            <span>Powered by Flutter 3.x & Dart Multi-Platform Engine</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-slate-400 flex-wrap justify-center">
            <span>Android APK</span>
            <span>iOS App Store</span>
            <span>Flutter Web</span>
            <span>Windows & macOS</span>
          </div>
        </div>
      </footer>

      {/* Saved Apps History Drawer/Modal */}
      <SavedAppsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedApps={savedApps}
        onLoadApp={(app) => {
          setConfig(app);
          setActiveTab('simulator');
        }}
        onDeleteApp={handleDeleteSavedApp}
      />
    </div>
  );
}
