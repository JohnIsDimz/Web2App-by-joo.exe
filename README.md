<div align="center">

# 🚀 Web2App Generator Studio

### *Convert Any Website into High-Performance Native Mobile & Desktop Apps*

![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Android](https://img.shields.io/badge/Android-Jetpack%20Compose-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-SwiftUI-000000?style=for-the-badge&logo=apple&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tauri](https://img.shields.io/badge/Tauri-Rust-FFC131?style=for-the-badge&logo=tauri&logoColor=black)
![Codespaces](https://img.shields.io/badge/GitHub-Codespaces%20Ready-181717?style=for-the-badge&logo=github&logoColor=white)

---

</div>

## 📌 Tentang Aplikasi

**Web2App Generator Studio** adalah platform pembuat aplikasi web-ke-native serba bisa. Dengannya, Anda dapat mengubah URL website apa pun (seperti toko online Shopee, Tokopedia, YouTube, Wikipedia, atau portal berita) menjadi aplikasi **Android APK / AAB**, **iOS App Store**, **Desktop Windows/macOS/Linux**, atau **PWA Standalone** hanya dalam hitungan detik!

Aplikasi ini dilengkapi dengan **Live Device Simulator**, **Real-Time Compilation Terminal**, **Pemeriksa SSL/URL Otomatis**, dan **Exportir Proyek ZIP**.

---

## ✨ Fitur-Fitur Unggulan

| Fitur | Deskripsi |
| :--- | :--- |
| **⚡ 7 Pilihan Engine Native** | Pilih antara **Flutter 3.x**, **Android Jetpack Compose**, **iOS Swift**, **Capacitor Hybrid**, **React Native / Expo**, **Tauri Rust**, atau **PWA Standalone**. |
| **💬 Native Floating Action Button (FAB)** | Tambahkan tombol melayang di pojok layar untuk WhatsApp Chat CS (`wa.me`), Telepon langsung (`tel:`), atau eksekusi JavaScript kustom. |
| **🔒 Keamanan Anti-Screenshot** | Proteksi konten sensitif dengan `FLAG_SECURE` yang mencegah pengambilan screenshot & perekaman layar di Android/iOS. |
| **👆 Biometric / Fingerprint Lock** | Amankan aplikasi dengan otentikasi Sidik Jari / Face ID sebelum halaman web terbuka. |
| **🛡️ SSL Pinning & Whitelist** | Batasi navigasi WebView hanya pada domain resmi untuk mencegah serangan Phishing / Man-In-The-Middle. |
| **🔄 Auto-Update Enforcement** | Sinkronisasi versi aplikasi secara otomatis melalui server JSON eksternal. |
| **📱 Live Device Simulator** | Uji coba langsung tampilan web pada bingkai iPhone 15 Pro, Samsung Galaxy S24, iPad Pro, atau Desktop. |
| **📦 Export Kode ZIP Lengkap** | Unduh seluruh source code proyek lengkap siap *build* di Android Studio, Xcode, atau VS Code. |

---

## 💻 Panduan Menjalankan di GitHub Codespaces

Jika Anda membuka repository ini di **GitHub Codespaces** dan bingung bagaimana cara melihat dan menjalankan aplikasinya, ikuti langkah-langkah mudah di bawah ini!

```
 ┌─────────────────────────────────────────────────────────┐
 │ 1. Open Repository  ➜  2. Run `npm run dev`  ➜  3. Preview │
 └─────────────────────────────────────────────────────────┘
```

### 1️⃣ Buka Terminal di Codespaces
* Di halaman GitHub Codespaces, tekan kombinasi tombol keyboard:
  * **Windows/Linux**: `Ctrl` + `~` (tombol tilde di atas Tab)
  * **Mac**: `Cmd` + `~`
* Atau klik menu garis tiga **☰** di pojok kiri atas ➜ **Terminal** ➜ **New Terminal**.

### 2️⃣ Install Dependencies (Jika belum)
Ketik perintah berikut di terminal lalu tekan **Enter**:
```bash
npm install
```

### 3️⃣ Jalankan Dev Server
Ketik perintah ini untuk menyalakan aplikasi:
```bash
npm run dev
```

Anda akan melihat log seperti ini di terminal:
```text
Server running on http://localhost:3000
```

---

### 🌐 Cara Melihat Tampilan Aplikasi (Preview)

Setiap kali aplikasi berjalan di Port `3000`, GitHub Codespaces akan mendeteksi server tersebut secara otomatis. Ada 2 cara mudah untuk melihat tampilannya:

#### Cara A: Lewat Pop-Up Notification (Paling Mudah)
1. Setelah menjalankan `npm run dev`, perhatikan pojok kanan bawah layar Codespaces Anda.
2. Akan muncul pop-up pemberitahuan:  
   *`"Your application running on port 3000 is available."`*
3. Klik tombol **Open in Browser** pada pop-up tersebut. Aplikasi akan terbuka di tab baru!

#### Cara B: Lewat Tab "Ports" di VS Code / Codespaces
1. Di panel bawah (tempat Terminal berada), cari dan klik tab bernama **Ports**.
2. Anda akan melihat daftar port yang aktif, salah satunya **3000 (HTTP)**.
3. Arahkan kursor ke port `3000`, lalu klik ikon **Globe / World (Open in Browser)** 🌐.
4. Jika halaman masih kosong / putih, klik kanan pada port `3000` ➜ **Port Visibility** ➜ Ubah dari *Private* menjadi **Public**.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │  TERMINAL   OUTPUT   DEBUG CONSOLE   PORTS 👈 (Klik di sini)           │
 ├──────────┬─────────────┬─────────────────┬─────────────────────────────┤
 │ Port     │ Local Address│ Forwarded Address│ Visibility                │
 │ 3000     │ localhost   │ https://...     │ Public 🌐  [Open Browser]   │
 └──────────┴─────────────┴─────────────────┴─────────────────────────────┘
```

---

## 🛠️ Perintah Utama (NPM Scripts)

* `npm run dev` : Menjalankan server pengembang lokal di Port 3000.
* `npm run build` : Mengompilasi proyek React & Express menjadi bundle produksi di folder `dist/`.
* `npm start` : Menjalankan aplikasi produksi dari folder `dist/server.cjs`.
* `npm run lint` : Memeriksa kesalahan tipe dan sintaks TypeScript.

---

## 📂 Struktur Proyek

```text
├── src/
│   ├── components/       # Komponen UI utama (Configurator, Simulator, ExportView, dll.)
│   ├── data/             # Preset template website (Shopee, YouTube, Wikipedia, dll.)
│   ├── utils/            # Generator kode Flutter, Android Compose, Swift, & ZIP exporter
│   ├── types.ts          # Definisi TypeScript interface & tipe data
│   ├── App.tsx           # Entrypoint UI React utama
│   └── main.tsx          # Render React DOM
├── server.ts             # Express.js backend & Vite Dev Server Middleware
├── package.json          # Dependencies & npm scripts
└── README.md             # Dokumentasi panduan lengkap
```

---

## ❓ FAQ & Troubleshooting

<details>
<summary><b>1. Mengapa halaman preview di Codespaces berwarna putih / Blank Page?</b></summary>
<br>
Pastikan server dev sudah berjalan (`npm run dev`). Jika sudah, buka tab <b>Ports</b> di Codespaces, klik kanan pada Port <code>3000</code>, lalu pilih <b>Port Visibility ➜ Public</b>. Setelah itu refresh tab preview Anda.
</details>

<details>
<summary><b>2. Apakah hasil export ZIP bisa langsung di-build di HP / Komputer sendiri?</b></summary>
<br>
Ya! Proyek yang diunduh berupa source code murni (Flutter / Android Compose / Swift / React Native / Tauri). Anda dapat mengekstrak file ZIP tersebut dan menjalankannya dengan perintah <code>flutter run</code> atau membukanya di Android Studio / Xcode.
</details>

<details>
<summary><b>3. Mengapa fitur Anti-Screenshot atau Biometric tidak berefek di browser biasa?</b></summary>
<br>
Fitur keamanan seperti <code>FLAG_SECURE</code> (Anti-Screenshot) dan Fingerprint Lock memanfaatkan API hardware native Android/iOS. Fitur tersebut terkompilasi secara otomatis dalam kode native Flutter/Android/iOS dan akan berfungsi saat aplikasi diinstall sebagai APK/App di perangkat nyata.
</details>

---

<div align="center">

Dibuat dengan ❤️ menggunakan React, Vite, Express, & Tailwind CSS.

</div>
