=========================================================
      WEB2APP STUDIO - PTERODACTYL SERVER SETUP
              Engine oleh joo.exe
=========================================================

Petunjuk Menjalankan Web2App Studio di Panel Pterodactyl:

1. Upload seluruh file proyek ini ke dalam File Manager di Pterodactyl.
2. Di bagian "Startup" atau "Startup Command" di Panel Pterodactyl, gunakan salah satu perintah berikut:

   Pilihan A (Rekomendasi - Menggunakan script otomatis):
   npm run start:pterodactyl

   Pilihan B (Langsung menjalankan entrypoint joo.exe):
   node "node joo.exe/pterodactyl.js"

3. Port server akan otomatis terdeteksi dari variabel {{SERVER_PORT}} yang diberikan oleh Panel Pterodactyl.
4. Jika server Pterodactyl Anda mendukung Docker atau memiliki Flutter SDK, sistem akan otomatis mengompilasi APK real-time ketika ada permintaan build dari pengguna.

=========================================================
