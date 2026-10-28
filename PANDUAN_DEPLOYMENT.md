# Panduan Deployment & Penggunaan — Kiko POS & Smart Shop
**Toko Delina ATK & Fotokopi "Kiko Smart Stationery" (Tanjung Raja, Ogan Ilir)**

---

## 📁 Daftar Berkas Aplikasi Utuh

1. **[index.html](file:///c:/Users/Administrator/Documents/PJR%207%20aplikasi%20PRD%20Toko%20Delina%20Deri%20ATK%20dan%20fotolopi/index.html)** — Frontend HTML5 Single Page Application (SPA) dengan tema *Islamic Emerald* (`#059669`) & *Warm Amber* (`#F59E0B`), lengkap dengan 3 tampilan terintegrasi (Publik, Dashboard Staf 3 Tab, Dashboard Owner 5 Tab), Widget AI Kiko beranimasi *glowing rainbow border*, generator Struk Thermal & SPJ Instansi.
2. **[Code.gs](file:///c:/Users/Administrator/Documents/PJR%207%20aplikasi%20PRD%20Toko%20Delina%20Deri%20ATK%20dan%20fotolopi/Code.gs)** — Backend Google Apps Script utuh yang menangani:
   - Inisialisasi otomatis **10 Sheet Google Sheets** & **6 Folder Google Drive** (`setupDatabaseAndDrive()`).
   - Keamanan transaksi serentak dengan `LockService` (mencegah *overselling* antar POS, Web, dan Telegram) & optimasi kuota baca dengan `CacheService`.
   - Matriks Hak Akses (RBAC) berbasis PIN antara **Staf Kasir** (HPP & Laba Bersih disembunyikan, harga terkunci) dan **Owner** (Akses penuh HPP, Laba Bersih, Void Transaksi, Ubah Harga, Broadcast Telegram).
   - Integrasi **Gemini AI** (Chat Kiko & Vision AI pembaca bukti transfer/QRIS), **Telegram Bot Webhook**, dan pengiriman **Nota Resmi / SPJ PDF otomatis via Gmail (`MailApp`)**.
3. **[appsscript.json](file:///c:/Users/Administrator/Documents/PJR%207%20aplikasi%20PRD%20Toko%20Delina%20Deri%20ATK%20dan%20fotolopi/appsscript.json)** — Konfigurasi manifest zona waktu (`Asia/Jakarta`) dan izin OAuth Google Workspace.

---

## 🚀 Cara 1: Uji Coba Langsung di Browser Lokal (Tanpa Setup Server)

File **[index.html](file:///c:/Users/Administrator/Documents/PJR%207%20aplikasi%20PRD%20Toko%20Delina%20Deri%20ATK%20dan%20fotolopi/index.html)** telah dilengkapi **Hybrid State & GAS Bridge**, sehingga Anda dapat langsung mengklik dua kali file `index.html` untuk membukanya di Google Chrome / Edge dan menguji seluruh fitur secara interaktif:

- **Akun Demo Login RBAC (Klik tombol *"Login Staf / Owner"* di kanan atas):**
  - 👨‍💼 **Staf Kasir Pagi (Deri):** PIN `1122` *(Hanya melihat POS, Antrean Online, Log Kertas; HPP & Laba Bersih disembunyikan)*
  - 👩‍💻 **Staf Operator Cetak (Siti):** PIN `2233`
  - 👑 **Owner (Delina):** PIN `123456` atau Co-Owner `654321` *(Membuka 5 Tab Eksekutif Owner, Grafik Chart.js, HPP, Laba Bersih, Void Transaksi, Broadcast Telegram)*

---

## ☁️ Cara 2: Deployment ke Google Sheets & Google Apps Script (Production)

1. Buka [Google Sheets](https://sheets.new) dan buat Spreadsheet baru dengan nama **`DB_Kiko_Smart_Stationery_Toko_Delina`**.
2. Klik menu **Ekstensi (Extensions) > Apps Script**.
3. Pada file `Kode.gs` (atau `Code.gs`), hapus isinya lalu tempelkan seluruh isi dari file **[Code.gs](file:///c:/Users/Administrator/Documents/PJR%207%20aplikasi%20PRD%20Toko%20Delina%20Deri%20ATK%20dan%20fotolopi/Code.gs)**.
4. Klik tombol **`+` (Tambah File) > HTML**, beri nama persis **`index`** (sehingga menjadi `index.html`), lalu tempelkan seluruh isi dari file **[index.html](file:///c:/Users/Administrator/Documents/PJR%207%20aplikasi%20PRD%20Toko%20Delina%20Deri%20ATK%20dan%20fotolopi/index.html)**.
5. Pilih fungsi **`setupDatabaseAndDrive`** pada toolbar atas Apps Script, lalu klik **Jalankan (Run)** dan berikan izin akses (*Review Permissions*).
   - Skrip akan otomatis membuat **10 Sheet** lengkap dengan data awal dan **6 Folder Google Drive** di dalam folder `Kiko_Smart_Stationery_Storage`.
6. Klik **Terapkan (Deploy) > Deployment baru (New deployment)**:
   - Pilih jenis: **Aplikasi Web (Web app)**.
   - Jalankan sebagai (*Execute as*): **Saya (Me)**.
   - Siapa yang memiliki akses (*Who has access*): **Siapa saja (Anyone)**.
   - Klik **Terapkan (Deploy)** dan salin URL Web App Anda.
7. *(Opsional)* Untuk mengaktifkan **Bot Telegram Kiko**, isi `TELEGRAM_BOT_TOKEN`, `OWNER_TELEGRAM_CHAT_ID`, dan `GEMINI_API_KEY` pada sheet `Pengaturan_Toko`, lalu arahkan webhook Telegram ke URL Web App Anda:
   ```
   https://api.telegram.org/bot<TOKEN_BOT_ANDA>/setWebhook?url=<URL_WEB_APP_GAS_ANDA>
   ```
