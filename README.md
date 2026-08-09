<div align="center">

# 🚀 Web2App Generator Studio

### *Convert Any Website into High-Performance Native Mobile & Desktop Apps*

![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Android](https://img.shields.io/badge/Android-Jetpack%20Compose-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-SwiftUI-000000?style=for-the-badge&logo=apple&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20Realtime-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tauri](https://img.shields.io/badge/Tauri-Rust-FFC131?style=for-the-badge&logo=tauri&logoColor=black)

---

</div>

## 📌 Tentang Aplikasi

**Web2App Generator Studio** adalah platform pembuat aplikasi web-ke-native modern serba bisa. Dengan platform ini, Anda dapat mengubah URL website apa pun (seperti toko online Shopee, Tokopedia, YouTube, Wikipedia, atau portal berita) menjadi aplikasi **Android APK / AAB**, **iOS App Store**, **Desktop Windows/macOS/Linux**, atau **PWA Standalone** hanya dalam hitungan detik!

Aplikasi terintegrasi dengan **Database Firestore Real-Time**, sistem **Saldo Balance & Token Build**, akun **Developer VIP Anti-Kadaluwarsa**, **Live Device Simulator**, **Proxy Viewer (Bypasses Frame Blocking)**, **Pemeriksa SSL/URL Otomatis**, dan **Exporter Proyek ZIP**.

---

## ✨ Fitur-Fitur Unggulan

| Fitur | Deskripsi |
| :--- | :--- |
| **⚡ 7 Pilihan Engine Native** | Pilih antara **Flutter 3.x**, **Android Jetpack Compose**, **iOS Swift**, **Capacitor Hybrid**, **React Native / Expo**, **Tauri Rust**, atau **PWA Standalone**. |
| **💳 Saldo Balance & Token Real-Time** | Manajemen transaksi, top-up saldo balance, pembelian paket token build, dan langganan bulanan tersimpan otomatis secara real-time di Database Firestore. |
| **👑 Developer VIP (Anti-Kadaluwarsa)** | Akun khusus Developer/Admin (`johnisdimz@gmail.com`) dengan status lisensi aktif permanen (2099+), saldo balance & token tanpa batas. |
| **🔑 Autentikasi Email & Google** | Form login simpel & modern dengan opsi Email & Kata Sandi serta tombol langsung Google Sign-In. |
| **💬 Native Floating Action Button (FAB)** | Tambahkan tombol melayang di pojok layar untuk WhatsApp Chat CS (`wa.me`), Telepon langsung (`tel:`), atau eksekusi JavaScript kustom. |
| **🔒 Keamanan Anti-Screenshot** | Proteksi konten sensitif dengan `FLAG_SECURE` yang mencegah pengambilan screenshot & perekaman layar di Android/iOS. |
| **👆 Biometric / Fingerprint Lock** | Amankan aplikasi dengan otentikasi Sidik Jari / Face ID sebelum halaman web terbuka. |
| **🛡️ SSL Pinning & Whitelist** | Batasi navigasi WebView hanya pada domain resmi untuk mencegah serangan Phishing / Man-In-The-Middle. |
| **🌐 Live Proxy Viewer & Device Simulator** | Uji coba langsung tampilan web pada bingkai iPhone, Pixel, iPad, atau Desktop dengan dukungan Live Proxy bypass frame-blocking dan indikator status Online/Offline. |
| **📦 Export Kode ZIP Lengkap** | Unduh seluruh source code proyek lengkap siap *build* di Android Studio, Xcode, atau VS Code. |

---

## 👑 Penjelasan Akun Developer VIP (Anti-Kadaluwarsa)

Aplikasi dilengkapi dengan sistem otomatis identifikasi **Akun Developer VIP / Admin Khusus** (`johnisdimz@gmail.com` atau domain admin/developer).

### 🌟 Hak Istimewa Akun Developer VIP:
1. **Status Langganan Anti-Kadaluwarsa**: Lisensi otomatis terdaftar sebagai `Enterprise Plan` dengan tanggal kadaluwarsa permanen (`2099-12-31`).
2. **Saldo Balance Unlimted**: Otomatis mendapatkan saldo balance `Rp 999.999.999` untuk pengujian seluruh fitur transaksi.
3. **Saldo Token Build Unlimted**: Otomatis mendapatkan `999.999 Token` untuk kebutuhan *convert/build* aplikasi tanpa batasan.
4. **Sinkronisasi Real-Time Firestore**: Profil dan hak akses terverifikasi langsung dengan Firebase Firestore setiap kali login.

---

## 💻 Panduan Lengkap Pengoperasian di GitHub Codespaces

GitHub Codespaces memungkinkan Anda menjalankan Web2App Generator Studio langsung di Cloud Container browser tanpa perlu instalasi rumit di komputer lokal.

### ─────────────── STEPS ───────────────

```
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ 1. Create Codespace ➜ 2. Check Node ➜ 3. npm install ➜ 4. npm run dev ➜ 5. View │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

#### 1️⃣ Membuat & Membuka GitHub Codespace
1. Buka repositori proyek ini di GitHub.
2. Klik tombol hijau **`<> Code`** di pojok kanan atas.
3. Pilih tab **`Codespaces`**, lalu klik **`Create codespace on main`**.
4. Tunggu beberapa detik hingga VS Code Browser selesai mempersiapkan container.

#### 2️⃣ Memeriksa Lingkungan Node.js
Buka Terminal internal di Codespaces (Tekan `Ctrl` + `~` atau `Cmd` + `~`), lalu pastikan Node.js v18+ sudah siap:
```bash
node -v
npm -v
```

#### 3️⃣ Menginstall Dependencies
Jalankan perintah berikut untuk menginstall seluruh dependensi package React, Express, Vite, dan Firebase SDK:
```bash
npm install
```

#### 4️⃣ Menjalankan Development Server
Jalankan dev server dengan perintah:
```bash
npm run dev
```
Server Express & Vite akan aktif pada host `0.0.0.0` dan port `3000`:
```text
Server running on http://localhost:3000
```

#### 5️⃣ Mengakses Preview Aplikasi
1. Buka tab **`Ports`** di bagian bawah panel VS Code.
2. Cari baris **Port 3000**.
3. Klik icon **Globe / Open in Browser** 🌐 atau salin URL forwarded port yang disediakan oleh GitHub Codespaces.
4. Jika diperlukan, ubah visibilitas port menjadi **`Public`** dengan cara *right-click* pada Port 3000 ➔ **`Port Visibility`** ➔ **`Public`**.

---

## 🛠️ Perintah Utama (NPM Scripts)

| Perintah | Fungsi / Kegunaan |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembang lokal & Vite middleware di Port 3000. |
| `npm run build` | Mengompilasi proyek React & bundling backend `server.ts` menggunakan `esbuild` ke `dist/server.cjs`. |
| `npm start` | Menjalankan aplikasi versi produksi dari `dist/server.cjs`. |
| `npm run lint` | Memeriksa tipe TypeScript (`tsc --noEmit`) untuk memastikan tidak ada sintaks error. |

---

## 📂 Struktur Proyek

```text
├── src/
│   ├── components/       # Komponen UI utama (Configurator, DeviceSimulator, WalletModal, AuthModal, dll.)
│   ├── data/             # Preset template website (Shopee, Tokopedia, YouTube, Wikipedia, dll.)
│   ├── lib/              # Integrasi Firebase Firestore, Auth, dan helper transaksi real-time
│   ├── utils/            # Generator kode Flutter, Android Compose, Swift, & ZIP exporter
│   ├── types.ts          # Definisi TypeScript interface & tipe data
│   ├── App.tsx           # Entrypoint UI React utama
│   └── main.tsx          # Render React DOM
├── server.ts             # Express.js backend & Vite Dev Server Middleware
├── package.json          # Dependencies & npm scripts
└── README.md             # Dokumentasi panduan lengkap
```

---

<div align="center">

Dibuat dengan ❤️ menggunakan React, Vite, Express, Firebase Firestore, & Tailwind CSS.

</div>
