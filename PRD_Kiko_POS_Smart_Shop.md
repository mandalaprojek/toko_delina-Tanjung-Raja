# PRD — Kiko POS & Smart Shop
## Toko Delina ATK & Fotokopi "Kiko Smart Stationery"

---

## 1. Judul & Ringkasan Eksekutif

**Nama Produk:** Kiko POS & Smart Shop
**Nama Toko (Brand Fisik & Online):** Toko Delina ATK & Fotokopi "Kiko Smart Stationery"
**Lokasi:** Jl. Lintas Sumatera, Tanjung Raja, Kabupaten Ogan Ilir, Sumatera Selatan 30661
**Platform:** Aplikasi web hybrid berbasis Google Apps Script (GAS), dengan Google Sheets sebagai database dan Google Drive sebagai penyimpanan berkas.

Kiko POS & Smart Shop adalah ekosistem aplikasi hybrid yang mengintegrasikan **Sistem Kasir (POS)**, **Website Katalog Toko Online berbasis PWA**, dan **Asisten AI Multi-Channel bernama "Kiko"** (hadir di widget web dan Bot Telegram), untuk mendigitalisasi operasional usaha ATK & Fotokopi secara menyeluruh — mulai dari penjualan barang, pemesanan cetak dokumen, validasi pembayaran otomatis, hingga pelaporan keuangan dan stok secara real-time di tiga kanal sekaligus (Kasir Fisik, Website, Telegram).

Selain fungsi komersial, website juga berperan sebagai **portal harian warga** Tanjung Raja dan sekitarnya melalui fitur utilitas (jadwal sholat & azan, cuaca/AQI, bacaan Al-Ma'tsurat), menjadikan Kiko Smart Stationery bukan sekadar toko online, tapi juga titik interaksi harian masyarakat setempat.

---

## 2. Latar Belakang & Tujuan Produk

### 2.1 Masalah yang Diselesaikan
- Pencatatan stok manual antara kasir fisik dan pemesanan online rawan tidak sinkron (overselling).
- Pelanggan (khususnya pelajar & staf instansi) harus antre lama untuk mencetak dokumen dan membayar.
- Validasi bukti transfer/QRIS masih dicek manual oleh kasir, rawan human error dan memakan waktu.
- Pencatatan keuangan tidak memisahkan omzet barang, jasa cetak, dan ongkos kirim secara otomatis.
- Instansi (sekolah dengan dana BOS, kantor desa) membutuhkan nota/SPJ resmi yang sering dibuat manual.
- Tidak ada kontrol akses yang membedakan staf kasir biasa dengan pemilik toko, berisiko kecurangan (fraud) pada perubahan harga atau pembatalan transaksi.

### 2.2 Tujuan Produk
1. Menyatukan 3 kanal penjualan (POS fisik, Website, Telegram) dalam satu sistem stok & keuangan real-time.
2. Memungkinkan pelanggan memesan barang ATK dan jasa cetak secara mandiri (self-service) via katalog visual maupun percakapan AI, tanpa perlu antre di tempat.
3. Mengotomasi kalkulasi biaya cetak, validasi pembayaran (Vision AI), dan penerbitan nota/SPJ resmi untuk instansi.
4. Memberi Owner visibilitas penuh atas kinerja bisnis (omzet, laba bersih, performa kanal, waste kertas) secara real-time dan dapat difilter.
5. Menjaga sistem tetap ringan dan efisien dalam batas kuota gratis Google Apps Script, sembari tetap menyediakan fitur utilitas harian (jadwal sholat, cuaca, Al-Ma'tsurat) sebagai daya tarik kunjungan harian warga.

### 2.3 Skala & Jangkauan Layanan
- **Skala saat ini:** Toko tunggal (single store), namun struktur Google Sheets dirancang siap untuk ekspansi multi-cabang di masa depan.
- **Area layanan:** Tanjung Raja dan sekitarnya, Kabupaten Ogan Ilir — mencakup warga, pelajar/mahasiswa, serta instansi (sekolah, kantor desa/kelurahan/kecamatan).
- **Metode pemenuhan pesanan:** Click & Collect (ambil di toko tanpa antre) dan Delivery Lokal (kurir toko/ekspedisi).
- **Titik koordinat acuan:** Tanjung Raja, Ogan Ilir — dipakai sebagai default untuk API Jadwal Sholat, Cuaca/AQI, dan perhitungan ongkos kirim lokal.

---

## 3. Target Pengguna & Matriks Hak Akses (RBAC)

### 3.1 Kelompok Pengguna

| Kelompok | Kanal Akses | Login |
|---|---|---|
| **Pelanggan/Pembeli** (warga, pelajar, staf instansi) | Website PWA, Bot Telegram | Tanpa login |
| **Staf Kasir & Operator** | Dashboard Internal Web | Wajib PIN/Password — 2 sampai 4 akun |
| **Owner/Manajer** | Dashboard Internal Web, Bot Alert Telegram pribadi | Wajib PIN/Password — 2 akun (mendukung multi-owner dengan hak akses setara) |

### 3.2 Matriks Hak Akses (Role-Based Access Control)

| Fitur / Akses Data | Staf Kasir | Owner |
|---|---|---|
| Input transaksi POS & proses order online | ✅ Boleh | ✅ Boleh |
| Input pemakaian kertas, waste & stock opname (tercatat nama staf) | ✅ Boleh | ✅ Boleh |
| Melihat Harga Modal (HPP) & Laba Bersih | ❌ Dilarang (hanya lihat omzet kas harian) | ✅ Akses penuh |
| Mengubah harga produk, harga grosir & tarif cetak | ❌ Dilarang (harga terkunci otomatis) | ✅ Akses penuh |
| Menghapus/membatalkan (void) transaksi | ❌ Dilarang (butuh otorisasi Owner) | ✅ Akses penuh |
| Mengelola akun staf & pengaturan API/Toko | ❌ Dilarang | ✅ Akses penuh |

**Catatan keamanan:** Setiap transaksi dan input waste otomatis mencatat ID/nama staf yang bertugas untuk keperluan audit per shift.

---

## 4. Arsitektur Data (Google Sheets & Google Drive) serta Integrasi Workspace

### 4.1 Struktur Google Sheets (Database)

| Sheet | Isi Data |
|---|---|
| `Master_Produk_ATK` | SKU/Barcode, Nama Barang, Kategori, HPP, Harga Eceran, Aturan Harga Grosir Bertingkat, Stok Tersedia, Batas Stok Kritis, Link Foto Produk |
| `Master_Jasa_Cetak` | Tarif Print/Fotokopi (A4/F4, Hitam-Putih/Warna), Jilid Lakban/Spiral, Laminating |
| `Data_Pesanan` & `Detail_Item_Pesanan` | Transaksi dari 3 kanal, status pembayaran, metode ambil (Click & Collect/Delivery), status pengerjaan cetak |
| `Keuangan_Kas` | Arus kas: Omzet Barang ATK, Omzet Jasa Cetak, Ongkos Kirim, HPP, Laba Bersih harian |
| `Log_Kertas_Harian` | Pemakaian kertas HVS, kertas rusak/macet (waste) harian |
| `Data_Pelanggan` | ID, Nama, No. HP/WA, Chat ID Telegram, Email Instansi, Alamat |
| `Log_Chat_AI` | Riwayat percakapan pelanggan dengan Kiko (Web & Telegram), sebagai memori AI dan bahan rangkuman analitik harian |
| `Pengaturan_Toko` & `Akun_Staf` | Konfigurasi API Key AI, Token Bot Telegram, rekening/QRIS toko, koordinat lokasi, PIN/Password login staf & owner |

### 4.2 Struktur Google Drive (Penyimpanan Berkas)

| Folder | Isi |
|---|---|
| `Folder_Dokumen_Cetak` | File PDF/Word/Excel/gambar dari pelanggan untuk dicetak/fotokopi |
| `Folder_Bukti_Bayar` | Foto struk transfer/QRIS untuk validasi Vision AI |
| `Folder_Katalog_Produk` | Foto produk ATK untuk etalase website |
| `Folder_Arsip_Nota_SPJ` | Nota PDF resmi & SPJ ter-generate otomatis (termasuk kop, stempel digital, tanda tangan) |
| `Folder_Retur_Komplain` | Foto bukti barang cacat/salah cetak untuk komplain |
| `Folder_Aset_Web` | Audio azan (.mp3), gambar QRIS statis toko |

### 4.3 Integrasi Workspace
- **Gmail (`MailApp`):** Wajib untuk mengirim Nota Resmi/SPJ PDF otomatis ke email bendahara sekolah/kantor desa (±5–15 email/hari). Untuk pelanggan umum, cukup via Website & Telegram.
- **Telegram Bot API:** Notifikasi real-time ke pelanggan (status pesanan, konfirmasi order, nota) dan ke Owner (stok kritis, bukti transfer mencurigakan, eskalasi komplain, rangkuman analitik harian).
- **Vision AI:** Membaca nominal/tanggal/status dari foto bukti transfer/QRIS untuk validasi otomatis.
- **API Eksternal (Jadwal Sholat & Cuaca/AQI):** Dipanggil langsung dari sisi browser (client-side fetch) agar tidak memakan kuota `UrlFetchApp` server.

### 4.4 Strategi Optimasi Kuota GAS
1. **`CacheService`** untuk menyimpan data katalog sementara (beberapa menit) agar tidak membaca Sheets berulang-ulang; data stok diperbarui real-time saat ada perubahan.
2. **Client-side fetch** untuk API Jadwal Sholat & Cuaca agar hemat kuota server.

---

## 5. Persyaratan Fungsional (User Stories & Acceptance Criteria)

### 5.1 Halaman Publik (Pelanggan, Tanpa Login)

**US-01 — Header Utilitas Harian**
> Sebagai pengunjung, saya ingin melihat jam digital, jadwal sholat + countdown + audio azan otomatis, info cuaca/AQI, dan bacaan Al-Ma'tsurat, agar saya rutin membuka website.
- AC: Data jadwal sholat & cuaca mengacu koordinat Tanjung Raja, Ogan Ilir; audio azan otomatis berbunyi saat waktu sholat tiba; data diambil via client-side fetch.

**US-02 — Etalase & Belanja Visual**
> Sebagai pelanggan, saya ingin menjelajah katalog produk ATK, memfilter kategori, dan menambahkan ke keranjang secara manual.
- AC: Produk dengan stok habis berlabel "Habis" secara real-time; harga otomatis menyesuaikan jika kuantitas mencapai ambang grosir.

**US-03 — Belanja via Chat Kiko (Conversational Commerce)**
> Sebagai pelanggan, saya ingin mengetik permintaan barang ke widget Kiko, dan sistem otomatis menambahkannya ke keranjang/checkout.
- AC: Kiko mengenali nama barang & kuantitas dari teks bebas, mengecek stok real-time, menawarkan produk substitusi dengan foto jika stok 0.

**US-04 — Order Cetak Dokumen Otomatis**
> Sebagai pelanggan, saya ingin mengunggah dokumen (PDF/Word) dan mendapat estimasi biaya cetak otomatis.
- AC: Sistem membaca jumlah halaman, menghitung biaya berdasarkan `Master_Jasa_Cetak` (warna/BW, jilid, laminating), menyimpan file ke `Folder_Dokumen_Cetak`.

**US-05 — Validasi Pembayaran via Vision AI**
> Sebagai pelanggan, saya ingin mengunggah foto bukti transfer/QRIS dan mendapat konfirmasi otomatis tanpa menunggu kasir memeriksa manual.
- AC: Vision AI membaca nominal & status, mencocokkan dengan tagihan; jika gagal/mencurigakan, sistem mengirim alert ke Owner via Telegram.

**US-06 — Notifikasi Status Pesanan**
> Sebagai pelanggan, saya ingin menerima update status pesanan (Diterima, Sedang Dicetak, Siap Diambil, Sedang Dikirim) via Telegram.
- AC: Status pesanan di `Data_Pesanan` berubah otomatis memicu pesan Telegram ke `Chat ID` pelanggan terkait.

**US-07 — Nota PDF Resmi & SPJ Instansi**
> Sebagai staf sekolah/kantor desa, saya ingin menerima Nota/SPJ resmi berkop & stempel digital, dikirim ke email instansi saya.
- AC: PDF otomatis tergenerate dengan kop Toko Delina, tersimpan di `Folder_Arsip_Nota_SPJ`, dan dikirim via Gmail (`MailApp`) ke email yang terdaftar di `Data_Pelanggan`.

**US-08 — Ambil Pesanan Tanpa Antre (Click & Collect)**
> Sebagai pelanggan yang sudah bayar via QRIS, saya ingin langsung menunjukkan kode pesanan di toko tanpa antre bersama walk-in.
- AC: Sistem men-generate kode/nomor unik per pesanan online yang bisa diverifikasi staf di Menu Antrean Pesanan Online.

### 5.2 Dashboard Staf Kasir & Operator

**US-09 — Layar Kasir Fisik (POS)**
> Sebagai staf kasir, saya ingin memindai barcode atau mencari barang secara manual, lalu mencetak struk thermal.
- AC: Mendukung scan barcode (USB/Bluetooth/kamera), menerapkan harga grosir otomatis saat ambang kuantitas tercapai, cetak struk thermal dan nota PDF.

**US-10 — Antrean Pesanan Online (Terpisah dari POS)**
> Sebagai staf operator, saya ingin melihat daftar pesanan masuk dari Web & Telegram secara terpisah dari layar kasir, agar tidak mengganggu pelayanan walk-in.
- AC: Daftar pesanan dengan indikator status (Baru Masuk, Bukti Bayar Tervalidasi, Sedang Dicetak, Siap Diambil/Dikirim); tombol unduh file dari Drive dan kirim notifikasi sekali klik.

**US-11 — Input Kertas Harian & Stock Opname**
> Sebagai operator fotokopi, saya ingin mencatat pemakaian kertas harian dan kertas rusak/macet (waste).
- AC: Form input tercatat di `Log_Kertas_Harian` dengan nama staf penginput dan timestamp.

### 5.3 Dashboard Owner/Manajer

**US-12 — Ringkasan Eksekutif & Keuangan**
> Sebagai Owner, saya ingin melihat grafik omzet & laba bersih real-time dari 3 kanal, serta peringatan stok kritis, begitu membuka dashboard.
- AC: Data teragregasi dari `Keuangan_Kas` dan `Master_Produk_ATK`, grafik terpisah antara omzet ATK, jasa cetak, dan ongkir.

**US-13 — Manajemen Katalog & Tarif**
> Sebagai Owner, saya ingin menambah/mengubah/menghapus produk, harga (HPP, eceran, grosir bertingkat), dan tarif jasa cetak.
- AC: Perubahan harga langsung berlaku di ketiga kanal (POS, Web, Kiko) secara real-time.

**US-14 — Riwayat Transaksi, Arsip SPJ & Log Kertas**
> Sebagai Owner, saya ingin melihat/mencari seluruh transaksi untuk audit, membatalkan (void) transaksi jika perlu, dan memantau tren waste kertas.
- AC: Tabel dengan filter tanggal, staf, kanal, kategori; tombol ekspor PDF/buka sheet asli.

**US-15 — Log Chat AI & Broadcast Promo**
> Sebagai Owner, saya ingin meninjau riwayat chat pelanggan dengan Kiko, melihat rangkuman analitik harian AI, dan mengirim broadcast promo ke pelanggan Telegram.
- AC: Data bersumber dari `Log_Chat_AI`; broadcast tersegmentasi berdasarkan data di `Data_Pelanggan`.

**US-16 — Pengaturan Sistem & Kelola Staf**
> Sebagai Owner, saya ingin mengatur akun/PIN staf, API Key AI/Telegram, dan kop/stempel digital nota.
- AC: Hanya role Owner yang bisa mengakses dan mengubah `Pengaturan_Toko` & `Akun_Staf`.

**US-17 — Laporan & Analitik Lanjutan**
> Sebagai Owner, saya ingin melihat grafik perbandingan kategori, tren waste mingguan, dan performa kanal penjualan.
- AC: 
  - Bar/Donut Chart: Omzet ATK vs Jasa Cetak + Top 10 Produk Terlaris.
  - Line/Bar Chart: Pemakaian kertas sah vs waste mingguan.
  - Ringkasan persentase performa kanal (POS vs Web vs Telegram).
  - Tabel interaktif dengan filter: rentang tanggal (custom), staf, kanal, kategori — dengan tombol ekspor PDF/buka Sheets.

---

## 6. Persyaratan Non-Fungsional & Keterbatasan Spesifik GAS

### 6.1 Estimasi Beban Sistem

| Metrik | Hari Biasa | Peak Season |
|---|---|---|
| Total transaksi (3 kanal) | 50–150/hari | 200–300/hari |
| Pengunjung website | 30–100/hari | — |
| Sesi chat ke Kiko | 20–50 sesi (~100–300 pesan)/hari | — |
| Email SPJ/Nota otomatis | 5–15/hari | — |

### 6.2 Keterbatasan Spesifik GAS yang Harus Diantisipasi
- Kuota harian `UrlFetchApp`, `MailApp` (pengiriman email), dan waktu eksekusi skrip (6 menit/eksekusi) — mitigasi lewat caching dan client-side fetch seperti dijelaskan di Bagian 4.4.
- Google Sheets bukan database relasional sejati — perlu disiplin struktur ID antar-sheet (mis. ID Pesanan menghubungkan `Data_Pesanan` dan `Detail_Item_Pesanan`) agar tetap konsisten saat data bertambah besar.
- Akses simultan (concurrent write) ke Sheets saat jam ramai perlu penanganan lock/antrian sederhana agar data stok tidak bentrok antar-kanal.

### 6.3 Kebutuhan Non-Fungsional Lain
- **Mobile-first & PWA:** Dapat di-install ke layar HP; tata letak otomatis menyesuaikan layar HP maupun komputer kasir.
- **Keamanan:** PIN/Password untuk dashboard internal; HPP tersembunyi dari role Staf; void transaksi butuh otorisasi Owner.
- **Audit trail:** Setiap transaksi dan input waste tercatat dengan nama staf & timestamp.
- **Reliabilitas notifikasi:** Status pesanan dan validasi pembayaran dikirim mendekati real-time ke Telegram.

---

## 7. Spesifikasi Antarmuka (Frontend) & Alur Kerja Client-Server

### 7.1 Gaya Visual & Branding

| Elemen | Spesifikasi |
|---|---|
| Latar belakang | Putih bersih (`#FFFFFF`), abu-abu sangat muda (`#F8FAFC`) |
| Warna utama (Primary) | Hijau Zamrud / Islamic Emerald (`#059669` / `#10B981`) — header, tombol utama, aksen identitas |
| Warna sekunder (Aksen) | Kuning keemasan / Warm Amber (`#D97706` / `#F59E0B`) — countdown azan, label "Harga Grosir", badge Best Seller |
| Widget Kiko | Outline box beranimasi gradasi warna-warni (glowing rainbow/cyber border), kontras namun elegan di atas tema hijau-putih |
| Tipografi | Sans-serif modern (Inter / Plus Jakarta Sans) |
| Layout | Mobile-first, responsif ke layar kasir/komputer |

**Konsep desain keseluruhan:** Clean, modern-minimalis, ramah mata, dengan nuansa hijau islami yang selaras dengan fitur ibadah harian (jadwal sholat, Al-Ma'tsurat).

### 7.2 Struktur Halaman

**Publik:**
- Header Utilitas (Jam, Jadwal Sholat/Azan, Cuaca/AQI, Al-Ma'tsurat)
- Halaman Utama: Tab Etalase Produk + Tab Order Cetak/Fotokopi
- Floating Chat Widget "Kiko On-Web"

**Dashboard Staf (1 dashboard, 3 tab tanpa reload):**
1. Layar Kasir Fisik (POS)
2. Antrean Pesanan Online & Cetak Dokumen
3. Input Kertas Harian & Stock Opname

**Dashboard Owner (berurutan sesuai prioritas harian):**
1. Ringkasan Eksekutif & Keuangan
2. Manajemen Katalog ATK & Tarif Jasa Cetak
3. Riwayat Transaksi, Arsip SPJ & Log Kertas
4. Monitor Log Chat AI & Broadcast Promo
5. Pengaturan Sistem & Kelola Staf

### 7.3 Alur Kerja Client-Server (Ringkas)
1. **Katalog & Header:** Data katalog diambil dari cache (`CacheService`) di sisi server; data jadwal sholat/cuaca diambil langsung oleh browser (client-side fetch) dari API publik.
2. **Chat Kiko → Transaksi:** Pesan pelanggan diproses AI → dicocokkan ke `Master_Produk_ATK`/`Master_Jasa_Cetak` → item masuk keranjang/checkout → data ditulis ke `Data_Pesanan` & `Detail_Item_Pesanan`.
3. **Upload Bukti Bayar:** File diunggah ke `Folder_Bukti_Bayar` → diproses Vision AI → status pembayaran diperbarui di `Data_Pesanan` → notifikasi Telegram terkirim.
4. **Order Cetak:** File diunggah ke `Folder_Dokumen_Cetak` → sistem baca jumlah halaman → hitung biaya dari `Master_Jasa_Cetak` → tampil estimasi ke pelanggan.
5. **Nota/SPJ:** Saat transaksi lunas & instansi, sistem generate PDF dari template kop/stempel → simpan ke `Folder_Arsip_Nota_SPJ` → kirim ke Telegram dan/atau email via `MailApp`.
6. **POS Fisik:** Staf input/scan barang → harga grosir otomatis diterapkan → stok di `Master_Produk_ATK` berkurang real-time → tersinkron otomatis ke tampilan Website.

---

## 8. Rencana Deployment & Pengujian

### 8.1 Rencana Deployment
1. **Tahap 1 — Setup Infrastruktur Dasar:** Buat struktur Google Sheets (seluruh sheet di Bagian 4.1) dan folder Google Drive (Bagian 4.2); konfigurasi awal `Pengaturan_Toko` (rekening/QRIS, koordinat lokasi).
2. **Tahap 2 — Modul Inti POS & Katalog:** Bangun Layar Kasir (POS), Etalase Produk, dan sinkronisasi stok real-time 3 arah.
3. **Tahap 3 — Integrasi AI Kiko:** Widget chat web + Bot Telegram, fitur auto-add to cart, Vision AI validasi pembayaran, kalkulator cetak otomatis.
4. **Tahap 4 — Modul Keuangan & Pelaporan:** `Keuangan_Kas`, dashboard grafik Owner, generator Nota/SPJ PDF, pengiriman email.
5. **Tahap 5 — Fitur Utilitas Header & Polish UI/UX:** Jadwal sholat/azan, cuaca/AQI, Al-Ma'tsurat, penyesuaian tema visual final.
6. **Tahap 6 — Uji Coba Terbatas (Soft Launch):** Jalankan paralel dengan pencatatan manual selama periode transisi untuk memastikan akurasi stok & keuangan sebelum sepenuhnya menggantikan sistem lama.

### 8.2 Rencana Pengujian
- **Uji fungsional per modul:** POS, order online, validasi Vision AI, generator PDF, notifikasi Telegram/Email — diuji satu per satu sebelum integrasi penuh.
- **Uji sinkronisasi stok 3 arah:** Simulasikan transaksi bersamaan dari POS, Web, dan Telegram untuk memastikan tidak ada overselling.
- **Uji beban (load test ringan):** Simulasikan estimasi transaksi peak season (200–300/hari) untuk memastikan sistem tetap responsif dalam batas kuota GAS.
- **Uji hak akses (RBAC):** Pastikan Staf Kasir benar-benar tidak bisa melihat HPP/laba bersih, mengubah harga, atau menghapus transaksi tanpa otorisasi Owner.
- **Uji penerimaan pengguna (UAT):** Libatkan staf kasir dan minimal 1 instansi (sekolah/kantor desa) untuk menguji alur order cetak dan penerbitan SPJ sebelum go-live penuh.

---
### 🎨 Tahapan Khusus: Penentuan Visual UI/UX

1. **Unggah Referensi:** Silakan unggah referensi gambaran aplikasi, skema warna, dan karakteristik UI/UX yang diinginkan untuk website ini.
2. **Jika Belum Ada Gambaran:**
   - **COPY** seluruh teks dokumen PRD FINAL di atas.
   - Buka **Google Stitch**, lalu **PASTE** hasil PRD tadi ke dalamnya.
   - Cek dan unduh hasil visualisasi UI/UX yang dibuat Google Stitch.
   - Unggah kembali file gambar hasil UI/UX tersebut ke percakapan ini untuk dibedah dan diterapkan model desainnya.
