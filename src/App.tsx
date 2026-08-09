import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { UrlAnalyzerBar } from './components/UrlAnalyzerBar';
import { DeviceSimulator } from './components/DeviceSimulator';
import { Configurator } from './components/Configurator';
import { CodeExportView } from './components/CodeExportView';
import { SavedAppsModal } from './components/SavedAppsModal';
import { AuthModal } from './components/AuthModal';
import { WalletModal } from './components/WalletModal';
import { WelcomeModal } from './components/WelcomeModal';
import { ServerStatus } from './components/ServerStatus';
import { AppConfig, WebSiteAnalysis } from './types';
import { downloadFlutterProjectZip } from './utils/zipExporter';
import { onAuthChange, subscribeUserProfile, saveUserProfile, isAdminUser, UserProfileData, DEMO_USER_PROFILE, deductToken } from './lib/firebase';
import { syncConfigToSqlDatabase } from './lib/sqlDatabase';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('web2app_config_guest');
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
    const saved = localStorage.getItem('web2app_saved_apps_guest');
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

  // Auto-Save Cloud Indicator States
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  });
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  // Welcome Popup Modal State for New & Returning Users
  const [welcomeModalState, setWelcomeModalState] = useState<{
    isOpen: boolean;
    isNewUser: boolean;
  } | null>(null);

  // Subscribe to Firebase Auth changes & User Profile hydration with instant welcome popup & user config isolation
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthChange(async (user) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setCurrentUser(user);

      if (user) {
        // 1. INSTANT WELCOME POPUP (0ms delay - no network wait!)
        const sessionKey = `welcome_popup_session_${user.uid}`;
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, 'true');
          setWelcomeModalState({ isOpen: true, isNewUser: false });
        }

        // 2. ISOLATE CONFIG PER USER ACCOUNT (Prevents Admin settings from leaking to Account 2)
        const userConfigKey = `web2app_config_${user.uid}`;
        const userSavedAppsKey = `web2app_saved_apps_${user.uid}`;
        const userSavedConfig = localStorage.getItem(userConfigKey);
        if (userSavedConfig) {
          try {
            setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(userSavedConfig) });
          } catch (e) {
            setConfig(DEFAULT_CONFIG);
          }
        } else {
          // New account or account with no config reset to clean default
          setConfig(DEFAULT_CONFIG);
        }

        const userSavedAppsList = localStorage.getItem(userSavedAppsKey);
        if (userSavedAppsList) {
          try {
            setSavedApps(JSON.parse(userSavedAppsList));
          } catch (e) {
            setSavedApps([DEFAULT_CONFIG]);
          }
        } else {
          setSavedApps([DEFAULT_CONFIG]);
        }

        // 3. Hydrate User Profile from Firestore asynchronously
        try {
          const profileRes = await saveUserProfile(user);
          setUserProfile(profileRes);

          unsubProfile = subscribeUserProfile(user.uid, (realtimeProfile) => {
            if (realtimeProfile) {
              setUserProfile(realtimeProfile);
            }
          });
        } catch (err) {
          console.error("Auth profile hydration error:", err);
          const isAdmin = isAdminUser(user.email);
          const fallbackProfile: UserProfileData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (isAdmin ? 'Developer VIP Admin' : 'User'),
            photoURL: user.photoURL || null,
            providerId: 'password',
            balance: isAdmin ? 999999999 : 0,
            tokens: isAdmin ? 999999 : 10,
            subscriptionPlan: isAdmin ? 'Enterprise' : 'Free',
            subscriptionExpiry: isAdmin ? '2099-12-31T23:59:59.000Z' : null,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            isAdmin: isAdmin
          };
          setUserProfile(fallbackProfile);
        }
      } else {
        // User logged out - switch to clean guest profile
        setUserProfile(null);
        setWelcomeModalState(null);

        const guestSaved = localStorage.getItem('web2app_config_guest');
        if (guestSaved) {
          try {
            setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(guestSaved) });
          } catch (e) {
            setConfig(DEFAULT_CONFIG);
          }
        } else {
          setConfig(DEFAULT_CONFIG);
        }
        setSavedApps([DEFAULT_CONFIG]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Auto-persist user-scoped config and sync to encrypted Full SQL database vault with real-time pulsing indicator
  useEffect(() => {
    const userKey = currentUser ? currentUser.uid : 'guest';
    localStorage.setItem(`web2app_config_${userKey}`, JSON.stringify(config));
    localStorage.setItem(`web2app_saved_apps_${userKey}`, JSON.stringify(savedApps));
    
    setSaveStatus('saving');
    let isMounted = true;

    const syncTimer = setTimeout(async () => {
      try {
        const res = await syncConfigToSqlDatabase(userKey, config.appName, config);
        if (isMounted) {
          if (res.success) {
            setSaveStatus('saved');
            const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setLastSavedTime(now);
            setIsPulsing(true);
            setTimeout(() => {
              if (isMounted) setIsPulsing(false);
            }, 2500);
          } else {
            setSaveStatus('error');
          }
        }
      } catch (err) {
        if (isMounted) setSaveStatus('error');
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(syncTimer);
    };
  }, [config, savedApps, currentUser]);

  const handleForceSync = async () => {
    setSaveStatus('saving');
    const userId = currentUser ? currentUser.uid : 'guest-user';
    const res = await syncConfigToSqlDatabase(userId, config.appName, config);
    if (res.success) {
      setSaveStatus('saved');
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(now);
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2500);
    } else {
      setSaveStatus('error');
    }
  };

  // Auto-persist saved apps
  useEffect(() => {
    localStorage.setItem('web2app_saved_apps', JSON.stringify(savedApps));
  }, [savedApps]);

  const handleUpdateConfig = (updated: Partial<AppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated, updatedAt: new Date().toISOString() };
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

  const handleExportZip = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const plan = userProfile?.subscriptionPlan || 'Free';
    const isVIP = userProfile?.isAdmin || plan === 'Enterprise' || (currentUser.email && isAdminUser(currentUser.email));
    const isPro = plan === 'Pro';
    const isProOrVIP = isVIP || isPro;

    if (!isProOrVIP) {
      alert("Unduh Source Code Proyek (.zip) merupakan fitur Paket Pro Builder (Rp 25.000) atau Enterprise VIP. Silakan tingkatkan paket berlangganan di Dompet.");
      setIsWalletModalOpen(true);
      return;
    }

    const tokens = userProfile?.tokens || 0;
    if (!isVIP && tokens < 1) {
      alert("Token Build Anda telah habis (0 Token). Silakan Beli Token atau Perbarui Paket Langganan untuk mengunduh source code ZIP.");
      setIsWalletModalOpen(true);
      return;
    }

    try {
      if (!isVIP) {
        await deductToken(currentUser.uid, 1);
      }
      downloadFlutterProjectZip(config);
    } catch (err: any) {
      alert(err?.message || "Gagal melakukan pemotongan token.");
      setIsWalletModalOpen(true);
    }
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
        currentUser={currentUser}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        isPulsing={isPulsing}
        onForceSync={handleForceSync}
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
            userProfile={userProfile}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
          />
        )}

        {/* Tab 3: Code & Export */}
        {activeTab === 'export' && (
          <CodeExportView
            config={config}
            onExportZip={handleExportZip}
            currentUser={currentUser}
            userProfile={userProfile}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-bold text-slate-300">Web2App Studio oleh joo.exe</span>
            <span>•</span>
            <span>Dilindungi oleh Firebase Cloud Auth & Database Engine</span>
          </div>

          <div className="flex items-center justify-center">
            <ServerStatus />
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

      {/* Google & Email Login Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onLoginSuccess={(isNew) => {
          if (currentUser?.uid) {
            sessionStorage.removeItem(`welcome_popup_session_${currentUser.uid}`);
          }
          setWelcomeModalState({ isOpen: true, isNewUser: isNew });
        }}
        onOpenWelcomeModal={() => {
          setWelcomeModalState({
            isOpen: true,
            isNewUser: false
          });
        }}
      />

      {/* Wallet, Tokens & Subscription Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onOpenAuth={() => {
          setIsWalletModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Welcome Popup Modal for New & Existing Users */}
      <WelcomeModal
        isOpen={welcomeModalState?.isOpen ?? false}
        onClose={() => setWelcomeModalState(null)}
        isNewUser={welcomeModalState?.isNewUser ?? false}
        userName={currentUser?.displayName || userProfile?.displayName || currentUser?.email?.split('@')[0] || 'Developer'}
        userEmail={currentUser?.email || userProfile?.email}
        tokens={isAdminUser(currentUser?.email || '') ? 999999 : (userProfile?.tokens ?? 10)}
        subscriptionPlan={userProfile?.subscriptionPlan || (isAdminUser(currentUser?.email || '') ? 'Enterprise' : 'Free')}
        activeAppName={config.appName}
        engineType={config.engineType}
        isAdmin={userProfile?.isAdmin || (currentUser?.email ? isAdminUser(currentUser.email) : false)}
      />
    </div>
  );
}
