#!/bin/bash
# =================================================================
#  Web2App Native Engine - 1-Click VPS Installer Script
#  Developed by joo.exe
#  Compatible: Ubuntu 20.04 / 22.04 / 24.04 LTS (x86_64 / arm64)
# =================================================================

set -e

echo "========================================================"
echo "   🚀 WEB2APP STUDIO - SETUP OTOMATIS SERVER VPS"
echo "   Engine & Build System oleh joo.exe"
echo "========================================================"
echo ""

# 1. Update System Packages & Install Essential Utilities
echo "🔄 [1/5] Mengupdate sistem dan paket esensial..."
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y curl wget git unzip zip software-properties-common build-essential ufw nginx

# 2. Install Node.js 20 LTS & PM2
echo "📦 [2/5] Menginstall Node.js 20 LTS & PM2 Process Manager..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. Install Java OpenJDK 17 (Wajib untuk Kompilasi Android APK)
echo "☕ [3/5] Menginstall OpenJDK 17..."
sudo apt install -y openjdk-17-jdk openjdk-17-jre
echo "Java Version:"
java -version

# 4. Setup Firewall (UFW)
echo "🛡️ [4/5] Mengatur Firewall (Buka Port 80, 443, 22, 3000)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
echo "y" | sudo ufw enable || true

# 5. Install Certbot SSL (HTTPS Gratis)
echo "🔒 [5/5] Menginstall Certbot SSL Let's Encrypt..."
sudo apt install -y certbot python3-certbot-nginx

echo ""
echo "========================================================"
echo " ✅ SETUP VPS BERHASIL SELESAI!"
echo "========================================================"
echo " Environment Siap Digunakan:"
echo "  - Node.js: $(node -v)"
echo "  - NPM: $(npm -v)"
echo "  - PM2: $(pm2 -v)"
echo "  - Java OpenJDK: 17"
echo ""
echo " Langkah Selanjutnya:"
echo " 1. Masuk ke direktori project Anda: cd /var/www/web2app"
echo " 2. Install dependensi: npm install"
echo " 3. Build frontend & backend: npm run build"
echo " 4. Jalankan aplikasi 24/7 dengan PM2: pm2 start dist/server.cjs --name web2app"
echo " 5. Simpan status PM2: pm2 save && pm2 startup"
echo "========================================================"

