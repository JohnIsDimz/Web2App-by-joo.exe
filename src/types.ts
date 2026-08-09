export interface BottomNavItem {
  id: string;
  label: string;
  url: string;
  icon: string;
}

export interface AppPermissions {
  camera: boolean;
  location: boolean;
  notifications: boolean;
  storage: boolean;
  microphone: boolean;
}

export interface SupportedPlatforms {
  android: boolean;
  ios: boolean;
  web: boolean;
  windows: boolean;
  macos: boolean;
  linux: boolean;
}

export type EngineType = 'flutter' | 'kotlin' | 'swift' | 'capacitor' | 'react-native' | 'tauri' | 'pwa-shell' | 'android-webview' | 'ios-webview' | 'cordova' | 'kmp' | 'turbo-native' | 'harmony-os' | 'electron-pro';

export interface AppConfig {
  id: string;
  url: string;
  appName: string;
  packageName: string;
  version: string;
  author: string;
  engineType: EngineType;
  themeColor: string;
  accentColor: string;
  backgroundColor: string;
  iconEmoji: string;
  iconUrl?: string;
  splashTitle: string;
  splashTagline: string;
  splashDurationSec: number;
  navMode: 'header' | 'bottom_nav' | 'drawer' | 'fullscreen';
  bottomNavItems: BottomNavItem[];
  enablePullToRefresh: boolean;
  enableOfflineFallback: boolean;
  customOfflineHtml: string;
  enableCustomCssJs: boolean;
  customCss: string;
  customJs: string;
  enableCustomUserAgent: boolean;
  customUserAgent: string;
  permissions: AppPermissions;
  supportedPlatforms: SupportedPlatforms;
  enableJsBridge: boolean;
  enableBackButtonHandling: boolean;
  keepScreenOn: boolean;
  enableInAppDownloads: boolean;
  enableDeepLinking: boolean;
  deepLinkScheme: string;
  enablePushNotifications: boolean;
  pushProvider: 'onesignal' | 'firebase' | 'none';
  oneSignalAppId: string;
  enableAdMob: boolean;
  adMobBannerId: string;
  // Advanced Features (100% Feature Complete)
  enableFloatingButton: boolean;
  fabType: 'whatsapp' | 'call' | 'custom_js' | 'url';
  fabTarget: string;
  fabPosition: 'bottom_right' | 'bottom_left';
  enableBiometrics: boolean;
  enableScreenSecurity: boolean;
  enableAutoUpdate: boolean;
  updateCheckUrl: string;
  enableSslPinning: boolean;
  allowedDomains: string;
  loadingSpinnerType: 'pulse' | 'ring' | 'dots' | 'bar';
  createdAt: string;
  updatedAt: string;
}

export interface WebSiteAnalysis {
  url: string;
  domain: string;
  title: string;
  description: string;
  themeColor: string;
  favicon: string;
  isHttps: boolean;
  hasPwaManifest: boolean;
  hasViewport: boolean;
  statusCode: number;
  suggestedPackageName: string;
}

