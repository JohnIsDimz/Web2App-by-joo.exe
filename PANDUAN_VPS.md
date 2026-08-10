# 🚀 PANDUAN LENGKAP DEPLOY WEB2APP STUDIO DI 1 SERVER VPS
**Dikembangkan Khusus untuk Pemula oleh joo.exe**

Panduan ini disusun langkah-demi-langkah dari nol untuk membantu Anda membeli VPS, mengelola dengan Termius, meng-clone source code Git, menginstall seluruh kebutuhan server (Web Backend + Build Engine APK Flutter), hingga aplikasi Web2App dapat diakses 24/7 di domain Anda.

---

## 📋 DAFTAR ISI
1. [Langkah 1: Membeli VPS (Rekomendasi Spesifikasi)](#1-langkah-1-membeli-vps-rekomendasi-spesifikasi)
2. [Langkah 2: Menghubungkan Termius ke VPS](#2-langkah-2-menghubungkan-termius-ke-vps)
3. [Langkah 3: Clone Repository Source Code (Git Clone di VPS)](#3-langkah-3-clone-repository-source-code-git-clone-di-vps)
4. [Langkah 4: Instalasi Otomatis Server VPS (1-Click Installer)](#4-langkah-4-instalasi-otomatis-server-vps-1-click-installer)
5. [Langkah 5: Install Dependensi & Jalankan Web2App dengan PM2](#5-langkah-5-install-dependensi--jalankan-web2app-dengan-pm2)
6. [Langkah 6: Hubungkan Domain & Aktifkan SSL HTTPS Gratis (Nginx)](#6-langkah-6-hubungkan-domain--aktifkan-ssl-https-gratis-nginx)
7. [Perintah Penting Pemeliharaan VPS (Cheat Sheet)](#perintah-penting-pemeliharaan-vps-cheat-sheet)

---

## 1. Langkah 1: Membeli VPS (Rekomendasi Spesifikasi)

Untuk menjalankan **Web Frontend, Database SQL, Proxy Server, dan Build Engine APK Flutter** sekaligus di 1 VPS:

* **Penyedia VPS Populer:** Hostinger, Biznet Gio, IDCloudHost, Hetzner, DigitalOcean, Linode.
* **Sistem Operasi (OS):** `Ubuntu 22.04 LTS` atau `Ubuntu 24.04 LTS` (64-bit).
* **Lokasi Server:** Singapura (SG) atau Indonesia (ID) untuk akses super cepat.
* **Spesifikasi Minimal:**
  * **RAM:** 2 GB (Rekomendasi 4 GB agar kompilasi Flutter APK lancar)
  * **CPU:** 2 vCPU Core
  * **Storage:** 20 GB – 40 GB NVMe SSD

---

## 2. Langkah 2: Menghubungkan Termius ke VPS

Setelah membeli VPS, Anda akan menerima **IP Public VPS**, **Username (`root`)**, dan **Password VPS** via email.

1. Buka aplikasi **Termius** di HP/Laptop Anda.
2. Klik tombol **`+ New Host`**.
3. Isi kolom berikut:
   * **Label:** `Web2App VPS`
   * **Address / IP:** Masukkan IP VPS Anda (contoh: `103.150.190.25`)
   * **Username:** `root`
   * **Password:** Masukkan password VPS Anda
4. Klik **Save** lalu klik 2x pada Host untuk terhubung.
5. Jika muncul konfirmasi fingerprint SSH, klik **Continue/Accept**.

---

## 3. Langkah 3: Clone Repository Source Code (Git Clone di VPS)

### A. Export / Push Code ke GitHub (Jika Belum Ada Repo Git)
1. Di AI Studio / VSCode, klik menu **Settings / Export** -> Pilih **Export to GitHub** atau push repository lokal Anda ke GitHub.
2. Dapatkan URL Repository GitHub Anda (contoh: `https://github.com/username Anda/web2app-studio.git`).

### B. Jalankan `git clone` di Termius VPS:
Buka Termius yang sudah terhubung ke VPS, lalu jalankan perintah ini secara berurutan:

```bash
# Update package manager & install Git
sudo apt update -y && sudo apt install -y git curl

# Buat folder direktori web
mkdir -p /var/www

# Masuk ke direktori /var/www
cd /var/www

# Clone repository dari GitHub ke folder web2app
git clone https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git web2app

# Masuk ke folder project
cd /var/www/web2app
```

> 💡 **Tips Tambahan (Repo Private):** Jika repository GitHub Anda disetting **Private**, GitHub akan meminta Username & Personal Access Token (PAT) sebagai password saat menjalankan `git clone`.

---

## 4. Langkah 4: Instalasi Otomatis Server VPS (1-Click Installer)

Kami telah menyediakan script otomatis `setup_vps.sh` langsung di root folder project yang akan menginstall semua dependensi sistem:
- **Node.js 20 LTS** & **PM2** (Process Manager)
- **Java OpenJDK 17** (Syarat Build APK Android)
- **Flutter SDK** (Build Engine Native)
- **Docker Engine** & **Nginx Web Server**
- **Firewall UFW** & **Certbot SSL**

### Jalankan Script Installer di Termius:

```bash
# 1. Pastikan posisi ada di folder project
cd /var/www/web2app

# 2. Beri izin & jalankan installer otomatis (1 Perintah Langsung Jalan)
chmod +x setup_vps.sh && ./setup_vps.sh
```

> 💡 **Opsi Alternatif:** Jika Anda ingin menjalankan dari folder `node joo.exe`, gunakan perintah `bash` dengan tanda kutip ganda agar spasinya terbaca oleh Linux:
> ```bash
> bash "node joo.exe/setup_vps.sh"
> ```

---

## 5. Langkah 5: Install Dependensi & Jalankan Web2App dengan PM2

Setelah installer selesai, install paket npm dan jalankan server secara permanen 24/7:

```bash
cd /var/www/web2app

# Install dependensi npm project
npm install

# Build frontend React & backend bundler
npm run build

# Jalankan server secara permanen 24/7 menggunakan PM2 dalam Mode Production
NODE_ENV=production pm2 start dist/server.cjs --name web2app

# Simpan konfigurasi PM2 agar otomatis hidup kembali saat VPS direstart
pm2 save
pm2 startup
```

---

## 6. Langkah 6: Hubungkan Domain & Aktifkan SSL HTTPS Gratis (Nginx)

Agar website Web2App Anda memiliki domain profesional (contoh: `https://web2app.id`):

### A. Atur A Record di DNS Domain (Cloudflare / Provider Domain)
* **Type:** `A`
* **Name:** `@` (atau `app`)
* **IPv4 Address:** `Isikan IP VPS Anda`
* **Proxy status:** DNS only / Disabled saat pertama kali install SSL

### B. Konfigurasi Nginx Web Server di Termius:

```bash
sudo nano /etc/nginx/sites-available/web2app
```

Tempelkan teks konfigurasi berikut (ganti `domainanda.com` dengan domain Anda):

```nginx
server {
    listen 80;
    server_name domainanda.com www.domainanda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Simpan dengan menekan `CTRL + O`, lalu `ENTER`, dan keluar dengan `CTRL + X`.

Aktifkan konfigurasi Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/web2app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### C. Aktifkan SSL Gratis (HTTPS):

```bash
sudo certbot --nginx -d domainanda.com -d www.domainanda.com
```

---

## 💡 PERINTAH PENTING PEMELIHARAAN VPS (CHEAT SHEET)

* **Melihat Status Server Web2App:**
  ```bash
  pm2 status
  ```
* **Melihat Log Real-time Server (Cek error/pembayaran):**
  ```bash
  pm2 logs web2app
  ```
* **Update Code Terbaru dari GitHub ke VPS:**
  ```bash
  cd /var/www/web2app
  git pull
  npm run build
  pm2 restart web2app
  ```
* **Melihat Penggunaan RAM & CPU VPS:**
  ```bash
  htop
  ```
* **Solusi Tampilan Website Putih Polos (Blank White Screen):**
  ```bash
  # 1. Masuk ke folder project
  cd /var/www/web2app

  # 2. Re-build ulang assets frontend & backend server
  npm run build

  # 3. Restart PM2 dengan mode production & update env
  pm2 delete all
  NODE_ENV=production pm2 start dist/server.cjs --name web2app
  pm2 save

  # 4. Tes koneksi lokal di VPS (Harus merespon HTML):
  curl http://localhost:3000
  ```
* **Solusi Error APT Lock (`Could not get lock /var/lib/dpkg/lock`):**
  ```bash
  sudo killall apt apt-get
  sudo dpkg --configure -a
  ```

---
*Dibuat oleh **joo.exe** — Web2App Studio Native Engine*
