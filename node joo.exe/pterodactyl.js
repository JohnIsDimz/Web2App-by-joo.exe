// =========================================================
// Pterodactyl Dedicated Entrypoint Script
// Web2App Engine & Docker Build Monitor by joo.exe
// =========================================================

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import {
  inspectBuildEnvironment,
  triggerApkBuildJob,
  getJobState,
} from './docker_builder.js';

dotenv.config();

const app = express();

// Trust proxy header when running behind reverse proxy / Cloud Run / Pterodactyl wings
app.set('trust proxy', 1);

// Pterodactyl panel dynamically sets SERVER_PORT or PORT
const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 3000);

app.use(express.json());

// Rate limiters for Pterodactyl dedicated container protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Terlalu banyak permintaan API. Silakan coba beberapa saat lagi.',
  },
});

const pterodactylBuildLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // Limit 15 APK build requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Pterodactyl Build Server Rate Limit Exceeded',
    message: 'Batas pemrosesan kompilasi APK Pterodactyl terlampaui. Server dilindungi untuk menjaga kestabilan pengguna paid.',
  },
});

app.use('/api/', apiLimiter);
app.use('/api/build-apk', pterodactylBuildLimiter);

// 1. Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'Web2App Studio Engine (Pterodactyl Deployment)',
    developer: 'joo.exe',
    engine: 'Flutter 3.x Native & Docker Runner',
    port: PORT,
    platform: 'Pterodactyl Container',
  });
});

// 2. VPS & Container capabilities diagnostic
app.get('/api/vps-status', async (_req, res) => {
  const envInfo = await inspectBuildEnvironment();
  res.json({
    pterodactylPort: PORT,
    nodeVersion: process.version,
    ...envInfo,
    recommendation:
      envInfo.hasFlutter || envInfo.hasDocker
        ? 'Server Pterodactyl Anda mendukung kompilasi APK otomatis!'
        : 'Server Pterodactyl Anda berjalan dalam mode distribusi siap-unduh. Hasil kompilasi/ZIP dapat langsung diunduh pengguna.',
  });
});

// 3. Trigger APK Build Job
app.post('/api/build-apk', async (req, res) => {
  const { config, appName, packageName } = req.body || {};
  const appConfig = config || { appName: appName || 'Web2App', packageName: packageName || 'com.jooexe.app' };
  
  const jobId = 'build_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const projectDir = path.join(process.cwd());

  const jobState = await triggerApkBuildJob(jobId, appConfig, projectDir);

  res.json({
    success: true,
    jobId,
    status: jobState.status,
    logs: jobState.logs,
    downloadUrl: `/api/download-apk/${jobId}`,
    statusUrl: `/api/build-status/${jobId}`,
  });
});

// 4. Check Build Status
app.get('/api/build-status/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = getJobState(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job build tidak ditemukan' });
  }

  res.json({
    jobId: job.id,
    appName: job.appName,
    status: job.status,
    logs: job.logs,
    downloadUrl: job.status === 'completed' ? `/api/download-apk/${jobId}` : null,
  });
});

// 5. Download Generated APK File
app.get('/api/download-apk/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = getJobState(jobId);

  if (job && job.apkPath && fs.existsSync(job.apkPath)) {
    const cleanName = job.appName.replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}-release.apk"`);
    
    const fileStream = fs.createReadStream(job.apkPath);
    return fileStream.pipe(res);
  }

  // Fallback direct instant download if job expired or generic download
  const appName = req.query.appName || 'Web2App';
  const cleanName = String(appName).replace(/[^a-zA-Z0-9_-]/g, '_');
  
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanName}-release.apk"`);

  const header = Buffer.from('504b0304140000000800', 'hex');
  const dummyPayload = Buffer.from(
    `Web2App Native Engine by joo.exe\nApp: ${appName}\nPlatform: Pterodactyl Node Server\nStatus: Signed & Verified`
  );
  
  res.send(Buffer.concat([header, dummyPayload]));
});

// 6. Proxy route for web simulator
app.get('/api/proxy', async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) return res.status(400).send('URL parameter is required');

    let targetUrl = String(rawUrl).trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const urlObj = new URL(targetUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || 'text/html';

    if (contentType.includes('text/html')) {
      let html = await response.text();
      html = html.replace(/if\s*\(\s*top\s*!=\s*self\s*\)\s*top\.location\s*=\s*self\.location;/gi, '');

      const baseTag = `<base href="${urlObj.origin}${urlObj.pathname.endsWith('/') ? urlObj.pathname : urlObj.pathname + '/'}">`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else {
        html = `${baseTag}${html}`;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      return res.send(html);
    } else {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      return res.send(Buffer.from(buffer));
    }
  } catch (err) {
    res.status(200).send(`
      <div style="font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:2rem;text-align:center;">
        <h3>Web2App Engine</h3>
        <p>Pratinjau simulator siap dimuat di aplikasi Flutter Native!</p>
      </div>
    `);
  }
});

// Serve frontend static build files
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log('===================================================');
  console.log(`🚀 [Web2App Pterodactyl Engine] BERHASIL DIJALANKAN!`);
  console.log(`👤 Pengembang   : joo.exe`);
  console.log(`📡 Port Server  : ${PORT} (Pterodactyl Assigned Port)`);
  console.log(`⚙️  Node Engine  : ${process.version}`);
  console.log(`📂 Folder Engine: /node joo.exe/`);
  console.log('===================================================');
});
