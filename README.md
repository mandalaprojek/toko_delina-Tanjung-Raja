# Toko Delina ATK & Fotokopi — "Kiko POS & Smart Shop"

Aplikasi Web Terintegrasi Kasir Point of Sale (POS), Toko Online Cerdas, Percetakan Dokumen & Format SPJ Instansi berbasis **Google Apps Script**, **Google Sheets**, dan **Google Drive** dengan nuansa kearifan lokal Tanjung Raja, Ogan Ilir, Sumatera Selatan.

---

## 🌟 Fitur Unggulan

### 1. Dual Sticky Header & Portal Warga Tanjung Raja
- **Header 1 - Baris 1**: Jam digital real-time, Jadwal Sholat 5 waktu & countdown adzan otomatis dengan audio asli, prakiraan cuaca & indeks kualitas udara (AQI) Tanjung Raja, serta doa dzikir Al-Ma'tsurat Sugro 33 doa lengkap Arab-Latin-Terjemahan.
- **Header 1 - Baris 2**: Identitas toko terintegrasi CMS Branding, tombol ekspansi Kiko AI, keranjang belanja dinamis, dan sakelar Dark/Light mode.
- **Header 2**: Asisten Belanja Kiko AI collapsible dengan input responsif auto-expand, tombol Voice Note (Speech Recognition bahasa Indonesia), chips pencarian cepat, serta 4 momen nasihat Islami kontekstual (Pendidikan, Perniagaan Jujur, Amanah SPJ, dan Ukhuwah Hadiah).

### 2. Maskot Robot Kiko Berpeci
- Widget melayang (*floating widget*) dengan animasi border menyala pelangi dan emas (*kiko-robot-fab-glow*), mengenakan peci hitam dengan lis emas dan mata bersinar cyan, serta balon pesan interaktif.

### 3. Galeri Ulasan Pelanggan Beranimasi (Running Card Marquee)
- Kartu testimoni pembeli dan bukti cetak bergerak dinamis dari kiri ke kanan dengan jeda mulus saat disentuh atau diarahkan mouse (*pause on hover/touch*).

### 4. Program Loyalty Member 15x Transaksi Bintang 5
- Progress bar transaksi ulasan bintang 5 dengan katalog reward: 1 Rim Kertas HVS SiDU, 1 Lusin Pulpen Pilot G2, atau Voucher Jilid gratis, disertai selebrasi balon pecah & audio selebrasi saat klaim.

### 5. Mitra Instansi Sekolah (Dana BOS) & Kantor Desa
- Layanan pengadaan ber-akad transparan (*QS. Al-Isra: 34*), pencatatan saldo komisi pembeli, dan generator dokumen Nota SPJ resmi ber-kop Toko Delina lengkap dengan tanda tangan & stempel digital siap audit dinas.

### 6. Layanan Cetak Dokumen & Kalkulator Percetakan
- Unggah file PDF/DOCX/JPG, pilihan cetak warna/BW, kertas A4/F4/Foto, jilid lakban/spiral kawat/hardcover, dan laminating.

### 7. Kasir POS Fisik & Operasional Toko
- Mode kasir fisik untuk transaksi langsung di toko dengan cetak struk thermal 58mm/80mm, antrean cetak online terpisah, serta input log pemakaian kertas harian & stok opname.

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas)

### Menjalankan Server
1. Jalankan server lokal melalui terminal:
   ```bash
   node server.js
   ```
   *Atau klik ganda file `jalankan-localhost.bat` pada Windows.*

2. Buka peramban dan akses:
   ```
   http://localhost:3000
   ```

---

## 📁 Struktur Berkas

```
├── assets/
│   └── audio/
│       └── azan.mp3            # Berkas audio adzan asli
├── Code.gs                     # Backend Google Apps Script (Sheets & Drive Database)
├── appsscript.json             # Manifest Google Apps Script
├── index.html                  # Aplikasi Frontend Single Page (Tailwind CSS & Lucide Icons)
├── server.js                   # Node.js Localhost Server & Proxy Google Apps Script
├── package.json                # Konfigurasi dependensi Node.js
├── jalankan-localhost.bat      # Script peluncur instan localhost Windows
├── PANDUAN_DEPLOYMENT.md       # Panduan deployment ke Google Apps Script Web App
├── PRD_baru.md                 # Product Requirement Document (PRD v2.1 Final)
├── PRD_Kiko_POS_Smart_Shop.md  # Dokumen PRD awal
└── README.md                   # Dokumentasi resmi repositori
```

---

## 🔒 Keamanan & Perlindungan Data

- Berkas sensitif seperti kredensial Clasp (`.clasp.json`), berkas backup, dan konfigurasi lokal dikecualikan melalui `.gitignore` untuk mencegah kebocoran data.
- API Key (Google Gemini & Bot Telegram) diinput secara dinamis melalui dashboard Owner dan disimpan di Script Properties / LocalStorage.

---

## 📍 Kontak & Lokasi

**Toko Delina ATK & Fotokopi "Kiko Smart Stationery"**  
Jl. Lintas Sumatera, Tanjung Raja, Kab. Ogan Ilir, Sumatera Selatan 30661  
WhatsApp: 0812-7111-8899  
Email: delina.smartstationery@gmail.com
