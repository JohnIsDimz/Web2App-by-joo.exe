=================================================================
WEB2APP NATIVE ENGINE & SINGLE VPS DEPLOYMENT KIT BY joo.exe
=================================================================

Direktori ini berisi modul server dan script otomatisasi untuk
menjalankan Web2App Studio & Flutter APK Build Engine secara terpusat
di 1 Server VPS (Ubuntu / Debian / Linux).

ISI FILE & FUNGSI:
------------------
1. setup_vps.sh
   - Script instalasi otomatis 1-Click untuk VPS Ubuntu/Debian.
   - Menginstall Node.js 20, PM2, Nginx, Java JDK 17, Flutter SDK,
     Docker, dan Certbot SSL secara instan.

2. docker_builder.js
   - Modul kompilasi otomatis Flutter & Android APK Native.
   - Secara otomatis mendeteksi ketersediaan Flutter SDK / Docker di VPS.
   - Jika Flutter SDK terinstall di VPS, proses build APK berjalan 100%
     native di server tanpa membutuhkan API eksternal.

3. pterodactyl.js / vps_runner.js
   - Server backend Express standalone yang dapat dijalankan di VPS
     maupun Pterodactyl Container Wings.

CARA RUNNING DI VPS SINGAPURA/INDONESIA (SINGLE VPS SETUP):
----------------------------------------------------------
1. Upload folder project ke VPS (misal di /var/www/web2app).
2. Jalankan setup VPS:
   chmod +x "/node joo.exe/setup_vps.sh"
   ./"node joo.exe/setup_vps.sh"

3. Build & Jalankan Aplikasi:
   npm install
   npm run build
   pm2 start dist/server.cjs --name web2app
   pm2 save

4. Hubungkan Domain & SSL Gratis:
   Gunakan Panduan di `PANDUAN_VPS.md` di root folder.

Salam Cerdas,
joo.exe - Web2App Developer
