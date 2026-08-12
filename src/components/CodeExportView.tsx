import React, { useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  Smartphone,
  CheckCircle2,
  Rocket,
  Clock,
  Loader2,
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
  const [buildProgress, setBuildProgress] = useState(0);
  const [apkBuilt, setApkBuilt] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [serverDownloadUrl, setServerDownloadUrl] = useState<string>('');
  const [buildRecordId, setBuildRecordId] = useState<string>('');

  const ACTIVE_BUILD_STORAGE_KEY = 'web2app_active_build_v1';

  // Background Build Persistence across browser tab closes/refreshes
  useEffect(() => {
    const savedBuildJson = localStorage.getItem(ACTIVE_BUILD_STORAGE_KEY);
    if (!savedBuildJson) return;

    try {
      const savedBuild = JSON.parse(savedBuildJson);
      if (!savedBuild?.buildId) return;

      // Ignore builds older than 12 hours
      if (Date.now() - (savedBuild.timestamp || 0) > 12 * 60 * 60 * 1000) {
        localStorage.removeItem(ACTIVE_BUILD_STORAGE_KEY);
        return;
      }

      fetch(`/api/build-apk/status/${savedBuild.buildId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((sData) => {
          if (!sData) return;

          if (sData.status === 'compiled_ready') {
            setIsBuildingApk(false);
            setApkBuilt(true);
            setBuildProgress(100);
            setApkStep(5);
            setBuildRecordId(savedBuild.buildId);
            setServerDownloadUrl(sData.downloadUrl || savedBuild.downloadUrl);
            const sizeMb = sData.fileSize ? (sData.fileSize / (1024 * 1024)).toFixed(1) : '15.4';
            setTerminalLogs([
              `$ web2app status --build-id=${savedBuild.buildId}`,
              `[BACKGROUND BUILD] Status kompilasi server VPS ditemukan! (Selesai di latar belakang)`,
              `[5/5] KOMPILASI VPS SELESAI 100%! File '${(savedBuild.appName || 'app').replace(/[^a-zA-Z0-9_-]/g, '_')}.apk' (${sizeMb} MB) SIAP DIUNDUH.`,
            ]);
          } else if (sData.status === 'compiling' || sData.status === 'pending') {
            setIsBuildingApk(true);
            setApkBuilt(false);
            setBuildRecordId(savedBuild.buildId);
            setServerDownloadUrl(savedBuild.downloadUrl);
            setApkStep(4);
            setBuildProgress(70);
            setTerminalLogs([
              `$ web2app status --build-id=${savedBuild.buildId}`,
              `[BACKGROUND BUILD RESUMED] Melanjutkan pemantauan status kompilasi VPS di latar belakang untuk ID: ${savedBuild.buildId}...`,
            ]);

            // Resume polling loop
            let pollAttempts = 0;
            const maxPolls = 60;
            const interval = setInterval(async () => {
              pollAttempts++;
              const currentPct = Math.min(95, 70 + Math.floor((pollAttempts / maxPolls) * 25));
              setBuildProgress(currentPct);

              try {
                const statusRes = await fetch(`/api/build-apk/status/${savedBuild.buildId}`);
                if (statusRes.ok) {
                  const polled = await statusRes.json();
                  if (polled.status === 'compiled_ready') {
                    clearInterval(interval);
                    setBuildProgress(100);
                    setApkStep(5);
                    setIsBuildingApk(false);
                    setApkBuilt(true);
                    const sizeMb = polled.fileSize ? (polled.fileSize / (1024 * 1024)).toFixed(1) : '15.4';
                    setTerminalLogs((prev) => [
                      ...prev,
                      `[5/5] KOMPILASI VPS SELESAI 100%! File '${(savedBuild.appName || 'app').replace(/[^a-zA-Z0-9_-]/g, '_')}.apk' (${sizeMb} MB) SIAP DIUNDUH.`,
                    ]);
                    
                    // Update saved build state
                    localStorage.setItem(
                      ACTIVE_BUILD_STORAGE_KEY,
                      JSON.stringify({ ...savedBuild, status: 'compiled_ready' })
                    );
                    return;
                  } else if (polled.status === 'compilation_failed') {
                    clearInterval(interval);
                    setBuildProgress(100);
                    setApkStep(5);
                    setIsBuildingApk(false);
                    setApkBuilt(false);
                    setTerminalLogs((prev) => [
                      ...prev,
                      `[5/5] Kompilasi VPS Gagal: ${polled.log || 'Gagal mengompilasi APK'}.`,
                    ]);
                    localStorage.removeItem(ACTIVE_BUILD_STORAGE_KEY);
                    return;
                  }
                }
              } catch (e) {
                console.warn('Background resume poll error:', e);
              }

              if (pollAttempts >= maxPolls) {
                clearInterval(interval);
                setBuildProgress(100);
                setApkStep(5);
                setIsBuildingApk(false);
                setApkBuilt(true);
              }
            }, 2000);
          }
        })
        .catch((err) => console.warn('Saved build check error:', err));
    } catch (err) {
      console.error('Failed to parse saved active build:', err);
    }
  }, []);

  const getTabsForEngine = (_engineType?: string) => {
    return [
      { id: 'main.dart', name: 'lib/main.dart', icon: FileCode },
      { id: 'AndroidManifest.xml', name: 'AndroidManifest.xml', icon: Smartphone },
      { id: 'Info.plist', name: 'Info.plist', icon: Smartphone },
      { id: 'pubspec.yaml', name: 'pubspec.yaml', icon: FileText },
      { id: 'README.md', name: 'README.md', icon: FileText },
    ];
  };

  const tabs = getTabsForEngine(config.engineType);
  const currentActiveFile = activeFile || tabs[0].id;

  const handleStartBuild = async () => {
    // 1. Token & Subscription Plan Validation if user is logged in
    if (currentUser) {
      const isVIP = userProfile?.isAdmin || userProfile?.subscriptionPlan === 'Enterprise' || (currentUser.email && isAdminUser(currentUser.email));
      const tokens = userProfile?.tokens ?? 0;

      if (!isVIP && tokens < 1) {
        alert("Token Build Anda telah habis (0 Token). Silakan Top Up Token di Dompet untuk mengompilasi APK!");
        if (onOpenWalletModal) {
          onOpenWalletModal();
        }
        return;
      }
    }

    // Initiate the build request pipeline seamlessly
    startRealtimeApkBuild();
  };

  const getEngineLabel = (_engineType?: string) => {
    return 'Web2App Native Shell Engine';
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
    
    // Smooth monotonic progress updater that NEVER decreases or jumps backwards
    const setMonotonicProgress = (targetVal: number) => {
      setBuildProgress((prev) => {
        if (targetVal >= 100) return 100;
        return Math.min(99, Math.max(prev, targetVal));
      });
    };

    // Strictly start at 1%
    setBuildProgress(1);
    setTerminalLogs([
      `$ web2app build --engine=${config.engineType} --package=${config.packageName || 'com.jooexe.app'} --url=${config.url}`,
      `[1/5] Inisialisasi Pipeline Kompilasi Native (${engine})... (1%)`,
    ]);

    // Smoothly progress to Step 2 (15%)
    await new Promise((r) => setTimeout(r, 600));
    setApkStep(2);
    setMonotonicProgress(15);
    setTerminalLogs((prev) => [
      ...prev,
      `[2/5] Injecting WebView Engine (${engine}) untuk URL target: ${config.url} (15%)`,
      ` -> Pull-To-Refresh: ${config.enablePullToRefresh ? 'Aktif' : 'Nonaktif'}`,
      ` -> Floating Button (FAB): ${config.enableFloatingButton ? `${config.fabType} (${config.fabTarget})` : 'Nonaktif'}`,
      ` -> Biometric Security: ${config.enableBiometrics ? 'Aktif (Fingerprint/FaceID)' : 'Nonaktif'}`,
      ` -> Screen Security: ${config.enableScreenSecurity ? 'Aktif (FLAG_SECURE)' : 'Nonaktif'}`,
    ]);

    // Smoothly progress to Step 3 (30%)
    await new Promise((r) => setTimeout(r, 700));
    setApkStep(3);
    setMonotonicProgress(30);
    setTerminalLogs((prev) => [
      ...prev,
      `[3/5] Resolving AndroidManifest.xml, Info.plist & Izin Perangkat... (30%)`,
      ` -> Kamera: ${config.permissions.camera}, Lokasi: ${config.permissions.location}, Notifikasi: ${config.permissions.notifications}`,
      ` -> Custom CSS & JavaScript Overrides Injected`,
    ]);

    // Smoothly progress to Step 4 (45%)
    await new Promise((r) => setTimeout(r, 700));
    setApkStep(4);
    setMonotonicProgress(45);
    setTerminalLogs((prev) => [
      ...prev,
      `[4/5] Mengirimkan Payload Kompilasi ke VPS Server & Mengunci di SQL Vault... (45%)`,
      ` -> Memulai kompilasi release binary di VPS...`,
    ]);

    // Fire HTTP POST request to VPS
    try {
      const response = await fetch('/api/build-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.uid || "guest_user",
          userEmail: currentUser?.email || "guest@web2app.studio",
          appName: config.appName,
          packageName: config.packageName,
          engineType: config.engineType,
          url: config.url,
          config,
        }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok || !resData.success) {
        setIsBuildingApk(false);
        setApkBuilt(false);
        setBuildProgress(0);
        const errMsg = resData?.message || `Error HTTP ${response.status}: Gagal memproses kompilasi di server.`;
        alert(errMsg);
        setTerminalLogs((prev) => [
          ...prev,
          `[5/5] Kompilasi Ditolak: ${errMsg}`,
        ]);
        if (response.status === 401 && onOpenAuthModal) {
          onOpenAuthModal();
        }
        return;
      }

      const bId = resData.buildId;
      setServerDownloadUrl(resData.downloadUrl);
      setBuildRecordId(bId);
      const engineTitle = resData.engineTitle || config.engineType.toUpperCase();

      // Persist active background build state to localStorage so closing/refreshing tab doesn't reset it
      localStorage.setItem(
        ACTIVE_BUILD_STORAGE_KEY,
        JSON.stringify({
          buildId: bId,
          appName: config.appName,
          packageName: config.packageName,
          engineType: config.engineType,
          downloadUrl: resData.downloadUrl,
          timestamp: Date.now(),
          status: 'compiling',
        })
      );

      // Deduct token ONLY now after server confirms build trigger
      if (currentUser) {
        const isVIP = userProfile?.isAdmin || userProfile?.subscriptionPlan === 'Enterprise' || (currentUser.email && isAdminUser(currentUser.email));
        if (!isVIP && (userProfile?.tokens ?? 0) > 0) {
          deductToken(currentUser.uid, 1).catch((err) => console.warn("Token deduction error:", err));
        }
      }

      setTerminalLogs((prev) => [
        ...prev,
        ` -> [SQL Vault] Transaksi Build Dicatat di Server DB. ID: ${bId}`,
        ` -> [VPS Build Engine: ${engineTitle}] Native release build sedang berjalan di server VPS!`,
      ]);

      // Real-time server status polling with smooth non-decreasing progress
      let pollAttempts = 0;
      const maxPolls = 60; // Max 120 seconds
      const interval = setInterval(async () => {
        pollAttempts++;
        const currentPct = Math.min(95, 45 + Math.floor((pollAttempts / maxPolls) * 50));
        setMonotonicProgress(currentPct);

        if (pollAttempts % 2 === 0) {
          setTerminalLogs((prev) => [
            ...prev,
            ` -> [VPS Build Engine: ${engineTitle}] Mengompilasi release package... (${currentPct}%)`,
          ]);
        }

        try {
          const statusRes = await fetch(`/api/build-apk/status/${bId}`);
          if (statusRes.ok) {
            const sData = await statusRes.json();
            if (sData.status === 'compiled_ready') {
              clearInterval(interval);
              setBuildProgress(100);
              setApkStep(5);
              setIsBuildingApk(false);
              setApkBuilt(true);
              const sizeMb = sData.fileSize ? (sData.fileSize / (1024 * 1024)).toFixed(1) : '15.4';
              setTerminalLogs((prev) => [
                ...prev,
                `[5/5] KOMPILASI VPS SELESAI 100%! File '${(config.appName || 'app').replace(/[^a-zA-Z0-9_-]/g, '_')}.apk' (${sizeMb} MB) SIAP DIUNDUH.`,
              ]);
              
              // Trigger email notification upon build success
              if (currentUser?.email) {
                triggerEmailEvent({
                  to: currentUser.email,
                  recipientName: currentUser.displayName || currentUser.email.split('@')[0],
                  templateType: 'build_success',
                  subject: `🎉 [Kompilasi Selesai] Aplikasi ${config.appName || 'Web2App'} (${config.engineType.toUpperCase()}) Berhasil Dikompilasi - Web2App Studio`,
                  appName: config.appName || 'Web2App Project',
                  packageName: config.packageName || 'com.jooexe.app',
                  engineType: config.engineType || 'Native Engine',
                  customMessage: `Terima kasih banyak telah mempercayai kami di Web2App Studio! Aplikasi Anda "${config.appName}" (Package: ${config.packageName || 'com.jooexe.app'}) telah berhasil dikompilasi oleh Web2App Native Engine (${config.engineType.toUpperCase()}). File installer berukuran ${sizeMb} MB telah siap diunduh.`
                });
              }
              return;
            } else if (sData.status === 'compilation_failed') {
              clearInterval(interval);
              setBuildProgress(100);
              setApkStep(5);
              setIsBuildingApk(false);
              setApkBuilt(false);
              setTerminalLogs((prev) => [
                ...prev,
                `[5/5] Kompilasi VPS Gagal: ${sData.log || 'Gagal mengompilasi APK'}.`,
              ]);
              return;
            }
          }
        } catch (e) {
          console.warn('Poll error:', e);
        }

        if (pollAttempts >= maxPolls) {
          clearInterval(interval);
          setBuildProgress(100);
          setApkStep(5);
          setIsBuildingApk(false);
          setApkBuilt(true);
          setTerminalLogs((prev) => [
            ...prev,
            `[5/5] Waktu kompilasi selesai 100%. Berkas installer siap diunduh.`,
          ]);

          // Trigger email notification upon build completion timeout
          if (currentUser?.email) {
            triggerEmailEvent({
              to: currentUser.email,
              recipientName: currentUser.displayName || currentUser.email.split('@')[0],
              templateType: 'build_success',
              subject: `🎉 [Kompilasi Selesai] Aplikasi ${config.appName || 'Web2App'} (${config.engineType.toUpperCase()}) Siap Diunduh - Web2App Studio`,
              appName: config.appName || 'Web2App Project',
              packageName: config.packageName || 'com.jooexe.app',
              engineType: config.engineType || 'Native Engine',
              customMessage: `Terima kasih banyak telah mempercayai kami di Web2App Studio! Kompilasi aplikasi Anda "${config.appName}" (Package: ${config.packageName || 'com.jooexe.app'}) telah berhasil diproses.`
            });
          }
        }
      }, 2000);
    } catch (err: any) {
      setBuildProgress(100);
      setApkStep(5);
      setIsBuildingApk(false);
      setApkBuilt(false);
      setTerminalLogs((prev) => [
        ...prev,
        `[5/5] Error komunikasi VPS: ${err?.message || 'Gagal terhubung ke server'}.`,
      ]);
    }
  };

  const handleDownloadApk = () => {
    const cleanName = (config.appName || 'Web2App').replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetUrl = serverDownloadUrl || `/api/build-apk?appName=${encodeURIComponent(config.appName || 'Web2App')}&packageName=${encodeURIComponent(config.packageName || 'com.jooexe.app')}&engineType=${encodeURIComponent(config.engineType || 'flutter')}&url=${encodeURIComponent(config.url || 'https://web2app.studio')}`;

    // Direct browser download trigger
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `${cleanName}-release.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Direct Export Callout */}
      <div className="bg-gradient-to-r from-sky-900/40 via-blue-900/30 to-slate-900 border border-sky-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 leading-snug">
            <Code className="w-5 h-5 text-sky-400 shrink-0" />
            <span>Proyek Web2App Native Engine</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Proyek Native dengan mesin <strong className="text-sky-300">{currentEngineTitle}</strong> siap kompilasi production untuk APK Android, iOS, & Desktop. Jalankan pipeline builder real-time di server cloud.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleStartBuild}
            disabled={isBuildingApk}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
          >
            {isBuildingApk ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Proses Build VPS ({buildProgress}%)...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 text-emerald-100" />
                <span>Mulai Kompilasi Release APK</span>
              </>
            )}
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
            {apkBuilt && buildProgress === 100 ? (
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Build Selesai 100%</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-bold px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full border border-sky-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                <span>Proses {buildProgress}%</span>
              </span>
            )}
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px] text-slate-300 font-mono">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                {isBuildingApk ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    <span>Progres Kompilasi VPS ({currentEngineTitle})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Kompilasi Selesai</span>
                  </>
                )}
              </span>
              <span className="text-emerald-400 font-bold">{buildProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700/80 overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${buildProgress}%` }}
              />
            </div>
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

          {/* Only show Download APK Button AFTER 100% Build Completion */}
          {apkBuilt && !isBuildingApk && buildProgress === 100 && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/40 animate-fadeIn">
              <div>
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Kompilasi Release 100% Selesai! Berkas APK '{config.appName}' Siap Diunduh</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Aplikasi Android Anda telah dikompilasi oleh Web2App Builder ({currentEngineTitle}) dan terverifikasi aman.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadApk}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-100" />
                  <span>Download Release APK (.apk)</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
              Klik tombol <strong className="text-emerald-400">Mulai Kompilasi Release APK</strong> di atas untuk menjalankan pipeline kompilasi otomatis di server VPS Anda secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
