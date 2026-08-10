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

# 1. Update System Packages
echo "🔄 [1/7] Mengupdate sistem dan paket OS..."
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y curl wget git unzip zip software-properties-common build-essential ufw nginx

# 2. Install Node.js 20 LTS & PM2
echo "📦 [2/7] Menginstall Node.js 20 LTS & PM2 Process Manager..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. Install Java JDK 17 (Wajib untuk Flutter & Android APK Build)
echo "☕ [3/7] Menginstall OpenJDK 17 (Android SDK Requirement)..."
sudo apt install -y openjdk-17-jdk openjdk-17-jre
echo "Java Version:"
java -version

# 4. Install Docker Engine (Opsional untuk Docker Flutter Container)
echo "🐳 [4/7] Menginstall Docker Engine..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm -f get-docker.sh
fi

# 5. Install Flutter SDK (Untuk Native APK Kompilasi Cepat)
echo "💙 [5/7] Menginstall Flutter SDK di VPS..."
FLUTTER_DIR="/opt/flutter"
if [ ! -d "$FLUTTER_DIR" ]; then
    sudo git clone https://github.com/flutter/flutter.git -b stable $FLUTTER_DIR
    sudo chown -R $USER:$USER $FLUTTER_DIR
fi

# Add Flutter to PATH
export PATH="$PATH:$FLUTTER_DIR/bin"
if ! grep -q "/opt/flutter/bin" ~/.bashrc; then
    echo 'export PATH="$PATH:/opt/flutter/bin"' >> ~/.bashrc
fi

flutter --version || true

# 6. Setup Firewall (UFW)
echo "🛡️ [6/7] Mengatur Firewall (Buka Port 80, 443, 22, 3000)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
echo "y" | sudo ufw enable || true

# 7. Install Certbot SSL (HTTPS Gratis)
echo "🔒 [7/7] Menginstall Certbot SSL Let's Encrypt..."
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
echo "  - Flutter SDK: /opt/flutter/bin"
echo ""
echo " Langkah Selanjutnya:"
echo " 1. Masuk ke direktori project Anda: cd /var/www/web2app"
echo " 2. Install dependensi: npm install"
echo " 3. Build frontend & backend: npm run build"
echo " 4. Jalankan aplikasi 24/7 dengan PM2: pm2 start dist/server.cjs --name web2app"
echo " 5. Simpan status PM2: pm2 save && pm2 startup"
echo "========================================================"
