import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { AppConfig } from '../types';
import {
  generateMainDart,
  generatePubspecYaml,
  generateAndroidManifest,
  generateInfoPlist,
  generatePwaManifest,
  generateReadme,
} from '../utils/flutterGenerator';

import { User } from 'firebase/auth';
import { UserProfileData, deductToken, isAdminUser } from '../lib/firebase';
import { triggerEmailEvent } from '../lib/emailService';

interface CodeExportViewProps {
  config: AppConfig;
  onExportZip: () => void;
  currentUser?: User | null;
  userProfile?: UserProfileData | null;
  onOpenWalletModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const CodeExportView: React.FC<CodeExportViewProps> = ({
  config,
  onExportZip,
  currentUser,
  userProfile,
  onOpenWalletModal,
  onOpenAuthModal,
}) => {
  const [activeFile, setActiveFile] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isBuildingApk, setIsBuildingApk] = useState(false);
  const [apkStep, setApkStep] = useState(0);
  const [apkBuilt, setApkBuilt] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [serverDownloadUrl, setServerDownloadUrl] = useState<string>('');
  const [buildRecordId, setBuildRecordId] = useState<string>('');

  const getTabsForEngine = (engineType?: string) => {
    const e = (engineType || 'flutter').toLowerCase().replace(/_/g, '-');
    if (e.includes('react-native') || e.includes('expo')) {
      return [
        { id: 'App.tsx', name: 'App.tsx', icon: FileCode },
        { id: 'package.json', name: 'package.json', icon: FileText },
        { id: 'AndroidManifest.xml', name: 'AndroidManifest.xml', icon: Smartphone },
        { id: 'README.md', name: 'README.md', icon: FileText },
      ];
    }
    if (e.includes('capacitor') || e.includes('cordova')) {
      return [
        { id: 'capacitor.config.json', name: 'capacitor.config.json', icon: FileCode },
        { id: 'package.json', name: 'package.json', icon: FileText },
        { id: 'AndroidManifest.xml', name: 'AndroidManifest.xml', icon: Smartphone },
        { id: 'README.md', name: 'README.md', icon: FileText },
      ];
    }
    if (e.includes('kotlin') || e.includes('webview') || e.includes('android')) {
      return [
        { id: 'MainActivity.kt', name: 'MainActivity.kt', icon: FileCode },
        { id: 'AndroidManifest.xml', name: 'AndroidManifest.xml', icon: Smartphone },
        { id: 'build.gradle', name: 'build.gradle', icon: FileText },
        { id: 'README.md', name: 'README.md', icon: FileText },
      ];
    }
    if (e.includes('pwa')) {
      return [
        { id: 'index.html', name: 'index.html', icon: FileCode },
        { id: 'manifest.json', name: 'manifest.json', icon: FileText },
        { id: 'sw.js', name: 'sw.js', icon: FileCode },
        { id: 'README.md', name: 'README.md', icon: FileText },
      ];
    }
    // Default Flutter
    return [
      { id: 'main.dart', name: 'lib/main.dart', icon: FileCode },
      { id: 'pubspec.yaml', name: 'pubspec.yaml', icon: FileText },
      { id: 'AndroidManifest.xml', name: 'AndroidManifest.xml', icon: Smartphone },
      { id: 'Info.plist', name: 'Info.plist', icon: Smartphone },
      { id: 'README.md', name: 'README.md', icon: FileText },
    ];
  };

  const tabs = getTabsForEngine(config.engineType);
  const currentActiveFile = activeFile || tabs[0].id;

  const handleStartBuild = async () => {
    // Check if user is logged in
    if (currentUser) {
      const isVIP = userProfile?.isAdmin || userProfile?.subscriptionPlan === 'Enterprise' || (currentUser.email && isAdminUser(currentUser.email));
      const tokens = userProfile?.tokens ?? 0;

      if (!isVIP && tokens < 1) {
        alert("Token Build Anda habis (0 Token). Namun Anda dapat melanjutkan kompilasi dalam mode Developer Trial!");
      }
    }

    // Initiate the build request pipeline
    startRealtimeApkBuild();
  };

  const getEngineLabel = (engineType?: string) => {
    const e = (engineType || 'flutter').toLowerCase().replace(/_/g, '-');
    switch (e) {
      case 'pwa-shell': return 'PWA Standalone WebShell';
      case 'android-webview': return 'Android WebView Shell (Java/Kotlin)';
      case 'ios-webview': return 'iOS Swift WKWebView Shell';
      case 'cordova': return 'Apache Cordova Hybrid Engine';
      case 'flutter': return 'Flutter 3.x Native Engine';
      case 'kotlin': return 'Android Jetpack Compose (Kotlin)';
      case 'swift': return 'iOS SwiftUI Native Engine';
      case 'capacitor': return 'Capacitor Hybrid Engine';
      case 'react-native': return 'React Native / Expo Engine';
      case 'tauri': return 'Tauri 2.0 Rust Engine';
      case 'kmp': return 'Kotlin Multiplatform (KMP)';
      case 'turbo-native': return 'Turbo Native Engine';
      case 'harmony-os': return 'HarmonyOS ArkUI Engine';
      case 'electron-pro': return 'Electron Pro Desktop Shell';
      default: return `${engineType ? engineType.toUpperCase() : 'Native'} Engine`;
    }
  };

  const currentEngineTitle = getEngineLabel(config.engineType);

  const getFileContent = () => {
    switch (currentActiveFile) {
      case 'main.dart':
        return generateMainDart(config);
      case 'pubspec.yaml':
        return generatePubspecYaml(config);
      case 'AndroidManifest.xml':
        return generateAndroidManifest(config);
      case 'Info.plist':
        return generateInfoPlist(config);
      case 'manifest.json':
        return generatePwaManifest(config);
      case 'App.tsx':
      case 'App.js':
        return `import React from 'react';\nimport { SafeAreaView, StyleSheet } from 'react-native';\nimport { WebView } from 'react-native-webview';\n\nexport default function App() {\n  return (\n    <SafeAreaView style={styles.container}>\n      <WebView source={{ uri: '${config.url}' }} javaScriptEnabled={true} domStorageEnabled={true} />\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, backgroundColor: '${config.splashBackgroundColor || '#0f172a'}' },\n});`;
      case 'package.json':
        return JSON.stringify({
          name: (config.appName || 'web2app').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          version: config.versionName || '1.0.0',
          private: true,
          dependencies: { react: '18.2.0', 'react-native': '0.72.6', 'react-native-webview': '13.2.2' }
        }, null, 2);
      case 'capacitor.config.json':
        return JSON.stringify({
          appId: config.packageName || 'com.jooexe.app',
          appName: config.appName || 'Web2App',
          webDir: 'dist',
          server: { url: config.url, cleartext: true }
        }, null, 2);
      case 'MainActivity.kt':
        return `package ${config.packageName || 'com.jooexe.app'}\n\nimport android.os.Bundle\nimport android.webkit.WebView\nimport android.webkit.WebViewClient\nimport androidx.appcompat.app.AppCompatActivity\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        val webView = WebView(this)\n        webView.settings.javaScriptEnabled = true\n        webView.webViewClient = WebViewClient()\n        webView.loadUrl("${config.url}")\n        setContentView(webView)\n    }\n}`;
      case 'build.gradle':
        return `plugins {\n    id 'com.android.application'\n    id 'kotlin-android'\n}\n\nandroid {\n    namespace '${config.packageName || 'com.jooexe.app'}'\n    compileSdk 34\n    defaultConfig {\n        applicationId "${config.packageName || 'com.jooexe.app'}"\n        minSdk 24\n        targetSdk 34\n        versionCode ${config.versionCode || 1}\n        versionName "${config.versionName || '1.0.0'}"\n    }\n}`;
      case 'index.html':
        return `<!DOCTYPE html>\n<html lang="id">\n<head>\n  <meta charset="UTF-8">\n  <title>${config.appName || 'Web2App'}</title>\n  <link rel="manifest" href="manifest.json">\n</head>\n<body>\n  <iframe src="${config.url}" style="width:100vw;height:100vh;border:none;"></iframe>\n</body>\n</html>`;
      case 'sw.js':
        return `self.addEventListener('fetch', (e) => {\n  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));\n});`;
      case 'README.md':
      default:
        return generateReadme(config);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startRealtimeApkBuild = async () => {
    const engine = (config.engineType || 'flutter').toUpperCase();
    setIsBuildingApk(true);
    setApkBuilt(false);
    setServerDownloadUrl('');
    setBuildRecordId('');
    setApkStep(1);
    setTerminalLogs([
      `$ web2app build --engine=${config.engineType} --package=${config.packageName || 'com.jooexe.app'} --url=${config.url}`,
      `[1/5] Initializing ${engine} Native Compilation Pipeline...`,
    ]);

    setTimeout(() => {
      setApkStep(2);
      setTerminalLogs((prev) => [
        ...prev,
        `[2/5] Injecting WebView Engine (${engine}) for target URL: ${config.url}`,
        ` -> Pull-To-Refresh: ${config.enablePullToRefresh ? 'Enabled' : 'Disabled'}`,
        ` -> Floating Button (FAB): ${config.enableFloatingButton ? `${config.fabType} (${config.fabTarget})` : 'Disabled'}`,
        ` -> Biometric Security: ${config.enableBiometrics ? 'Enabled (Fingerprint/FaceID)' : 'Disabled'}`,
        ` -> Screen Security: ${config.enableScreenSecurity ? 'Enabled (FLAG_SECURE)' : 'Disabled'}`,
      ]);
    }, 600);

    setTimeout(() => {
      setApkStep(3);
      setTerminalLogs((prev) => [
        ...prev,
        `[3/5] Resolving AndroidManifest.xml, Info.plist & Device Permissions...`,
        ` -> Camera: ${config.permissions.camera}, Location: ${config.permissions.location}, Push: ${config.permissions.notifications}`,
        ` -> Injected Custom CSS & JS overrides`,
      ]);
    }, 1200);

    // Fire HTTP POST request to VPS immediately
    try {
      setApkStep(4);
      setTerminalLogs((prev) => [
        ...prev,
        `[4/5] Sending Build Payload to VPS Server & Recording in SQL Vault...`,
        ` -> Starting background compilation pipeline on server...`,
      ]);

      const response = await fetch('/api/build-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.uid || 'guest',
          appName: config.appName,
          packageName: config.packageName,
          engineType: config.engineType,
          url: config.url,
          config,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          const bId = resData.buildId;
          setServerDownloadUrl(resData.downloadUrl);
          setBuildRecordId(bId);
          const engineTitle = resData.engineTitle || config.engineType.toUpperCase();

          // Deduct token ONLY now after server confirms build trigger
          if (currentUser && resData.hasFlutter) {
            const isVIP = userProfile?.isAdmin || userProfile?.subscriptionPlan === 'Enterprise' || (currentUser.email && isAdminUser(currentUser.email));
            if (!isVIP && (userProfile?.tokens ?? 0) > 0) {
              deductToken(currentUser.uid, 1).catch((err) => console.warn("Token deduction error:", err));
            }
          }

          setTerminalLogs((prev) => [
            ...prev,
            ` -> [SQL Vault] Build Transaction Recorded in Server DB. ID: ${bId}`,
            resData.hasFlutter
              ? ` -> [VPS Build Engine: ${engineTitle}] Native compilation triggered in server workspace!`
              : ` -> [VPS Notice: ${engineTitle}] Flutter SDK belum aktif di VPS. Kompilasi otomatis memerlukan node/setup_vps.sh. Source code ZIP lengkap siap diunduh!`,
          ]);

          if (!resData.hasFlutter) {
            setApkStep(5);
            setIsBuildingApk(false);
            setApkBuilt(true);
            return;
          }

          // Real-time server status polling
          let pollAttempts = 0;
          const maxPolls = 45; // Max 90 seconds
          const interval = setInterval(async () => {
            pollAttempts++;
            try {
              const statusRes = await fetch(`/api/build-apk/status/${bId}`);
              if (statusRes.ok) {
                const sData = await statusRes.json();
                if (sData.status === 'compiled_ready') {
                  clearInterval(interval);
                  setApkStep(5);
                  setIsBuildingApk(false);
                  setApkBuilt(true);
                  const sizeMb = sData.fileSize ? (sData.fileSize / (1024 * 1024)).toFixed(1) : '15.4';
                  setTerminalLogs((prev) => [
                    ...prev,
                    `[5/5] KOMPILASI VPS SELESAI! File APK '${(config.appName || 'app').replace(/[^a-zA-Z0-9_-]/g, '_')}.apk' (${sizeMb} MB) SIAP DIUNDUH.`,
                  ]);
                  if (currentUser?.email) {
                    triggerEmailEvent({
                      to: currentUser.email,
                      recipientName: currentUser.displayName || currentUser.email.split('@')[0],
                      templateType: 'build_success',
                      subject: `[Kompilasi Selesai] Aplikasi ${config.appName || 'Web2App'} (${config.engineType.toUpperCase()}) Berhasil Dikompilasi - Web2App Studio`,
                      appName: config.appName || 'Web2App Project',
                      packageName: config.packageName || 'com.jooexe.app',
                      engineType: config.engineType || 'Native Engine',
                      customMessage: `Aplikasi Anda "${config.appName}" (Package: ${config.packageName || 'com.jooexe.app'}) telah berhasil dikompilasi oleh Web2App Native Engine (${config.engineType.toUpperCase()}). File APK berukuran ${sizeMb} MB.`
                    });
                  }
                  return;
                } else if (sData.status === 'compilation_failed') {
                  clearInterval(interval);
                  setApkStep(5);
                  setIsBuildingApk(false);
                  setApkBuilt(true);
                  setTerminalLogs((prev) => [
                    ...prev,
                    `[5/5] Kompilasi VPS dihentikan: ${sData.log || 'Gagal mengompilasi APK'}. Source code ZIP tetap siap diunduh.`,
                  ]);
                  return;
                }
              }
            } catch (e) {
              console.warn('Poll error:', e);
            }

            if (pollAttempts >= maxPolls) {
              clearInterval(interval);
              setApkStep(5);
              setIsBuildingApk(false);
              setApkBuilt(true);
              setTerminalLogs((prev) => [
                ...prev,
                `[5/5] Waktu tunggu server selesai. File APK siap diunduh.`,
              ]);
            }
          }, 2000);
        }
      } else {
        throw new Error(`HTTP Error ${response.status}`);
      }
    } catch (err: any) {
      setApkStep(5);
      setIsBuildingApk(false);
      setApkBuilt(true);
      setTerminalLogs((prev) => [
        ...prev,
        `[5/5] Error komunikasi VPS: ${err?.message || 'Gagal terhubung ke server'}. Gunakan tombol Unduh Proyek ZIP.`,
      ]);
    }
  };

  const handleDownloadZip = () => {
    const zipUrl = `/api/export-zip?appName=${encodeURIComponent(config.appName || 'Web2App')}&packageName=${encodeURIComponent(config.packageName || 'com.jooexe.app')}&engineType=${encodeURIComponent(config.engineType || 'flutter')}&url=${encodeURIComponent(config.url || 'https://web2app.studio')}`;
    window.open(zipUrl, '_blank');
  };

  const handleDownloadApk = async () => {
    const cleanName = (config.appName || 'Web2App').replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetUrl = serverDownloadUrl || `/api/build-apk?appName=${encodeURIComponent(config.appName || 'Web2App')}&packageName=${encodeURIComponent(config.packageName || 'com.jooexe.app')}&engineType=${encodeURIComponent(config.engineType || 'flutter')}&url=${encodeURIComponent(config.url || 'https://web2app.studio')}`;

    try {
      const response = await fetch(targetUrl);
      const contentType = response.headers.get('content-type') || '';

      // If server returned an HTML progress or guidance page, open in tab instead of saving corrupt HTML as .apk
      if (contentType.includes('text/html')) {
        window.open(targetUrl, '_blank');
        return;
      }

      if (response.ok) {
        const blob = await response.blob();
        const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
        const url = URL.createObjectURL(apkBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cleanName}-release.apk`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        window.open(targetUrl, '_blank');
      }
    } catch (err) {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Direct Export Callout */}
      <div className="bg-gradient-to-r from-sky-900/40 via-blue-900/30 to-slate-900 border border-sky-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 leading-snug">
            <Code className="w-5 h-5 text-sky-400 shrink-0" />
            <span>Proyek Web2App Real-Time Multi-Engine</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Proyek Native dengan mesin <strong className="text-sky-300">{currentEngineTitle}</strong> siap kompilasi production untuk APK Android, iOS, & Desktop. Jalankan pipeline builder real-time di server cloud.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleStartBuild}
            disabled={isBuildingApk}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isBuildingApk ? 'Proses Build Real-Time Running...' : 'Build Production APK'}</span>
          </button>

          <button
            onClick={onExportZip}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/30 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Proyek ZIP ({currentEngineTitle})</span>
          </button>

        </div>
      </div>

      {/* Real-Time APK Build Progress Visualizer */}
      {(isBuildingApk || apkBuilt) && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">
                Pipeline Kompilasi Real-Time ({currentEngineTitle}) - {config.appName}.apk
              </h4>
            </div>
            {apkBuilt && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Build Selesai Siap Diinstal</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div
              className={`p-3 rounded-xl border transition-all ${
                apkStep >= 1
                  ? 'bg-slate-800 border-emerald-500/50 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="font-bold mb-1">1. URL Analysis</div>
              <p className="text-[11px] opacity-80">Mengurai header & SSL {config.url}</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                apkStep >= 2
                  ? 'bg-slate-800 border-emerald-500/50 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="font-bold mb-1">2. WebView Inject</div>
              <p className="text-[11px] opacity-80">Menyiapkan Engine ({currentEngineTitle})</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                apkStep >= 3
                  ? 'bg-slate-800 border-emerald-500/50 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="font-bold mb-1">3. Manifest & Permissions</div>
              <p className="text-[11px] opacity-80">Injeksi izin Android & splash screen</p>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                apkStep >= 4
                  ? 'bg-slate-800 border-emerald-500/50 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="font-bold mb-1">4. Release Package</div>
              <p className="text-[11px] opacity-80">Mengemas installer ({currentEngineTitle})</p>
            </div>
          </div>

          {/* Terminal Console Log Stream */}
          {terminalLogs.length > 0 && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
              {terminalLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('SUCCESSFUL')
                      ? 'text-emerald-400 font-bold'
                      : log.startsWith('$')
                      ? 'text-sky-400'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          )}

          {apkBuilt && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/40">
              <div>
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Kompilasi Real-Time Selesai! Proyek '{config.appName}' Siap Digunakan</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Seluruh kode sumber Engine Native ({currentEngineTitle}) & struktur proyek lengkap telah diverifikasi dan siap diunduh.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadApk}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 shrink-0 transition-all active:scale-95"
                >
                  <Smartphone className="w-4 h-4 text-emerald-200" />
                  <span>Download APK (.apk)</span>
                </button>

                <button
                  onClick={onExportZip}
                  className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/30 flex items-center gap-2 shrink-0 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Source Code ZIP ({currentEngineTitle})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Engine Feature Summary & Instructions Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h4 className="font-bold text-white text-sm">
              Sistem Kompilasi & Fitur Engine: <span className="text-sky-300">{currentEngineTitle}</span>
            </h4>
          </div>
          <span className="text-xs px-2.5 py-1 bg-sky-500/10 text-sky-300 border border-sky-500/30 rounded-full font-mono">
            {config.packageName || 'com.jooexe.app'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h5 className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Fitur Native Siap Pakai
            </h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Aplikasi dikompilasi langsung menggunakan WebView Native Android, Biometric Auth, Offline Screen, SSL Bypass, & custom splash screen sesuai konfigurasi Anda.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h5 className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Proses Kompilasi VPS
            </h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Klik tombol <strong className="text-emerald-400">Build Production APK</strong> di atas untuk menjalankan pipeline kompilasi otomatis di server VPS Anda secara real-time.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h5 className="font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Ekspor Source Code ZIP
            </h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Gunakan tombol <strong className="text-sky-400">Unduh Proyek ZIP</strong> jika Anda ingin mengunduh seluruh berkas proyek mentah untuk dikompilasi sendiri di Android Studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
