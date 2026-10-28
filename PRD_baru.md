# PRD FINAL — Kiko POS & Smart Shop (Versi Sempurna & Lengkap)
### Sistem Hybrid Kasir, Toko Online Mobile-First, & Asisten AI untuk Toko Delina ATK & Fotokopi "Kiko Smart Stationery"

**Lokasi Usaha:** Jl. Lintas Sumatera, Tanjung Raja, Kabupaten Ogan Ilir  
**Platform:** Google Apps Script (GAS) + Google Sheets + Google Drive + AI (LLM & Vision AI) + Telegram Bot API  
**Versi Dokumen:** 2.1 (Revisi Sempurna — Seluruh Fitur & Audit 5 Detail Utama Terkunci)

---

## 1. Judul & Ringkasan Eksekutif

**Kiko POS & Smart Shop** adalah ekosistem aplikasi *hybrid* berbasis Google Apps Script yang mengintegrasikan tiga kanal operasional **Toko Delina ATK & Fotokopi "Kiko Smart Stationery"** secara *real-time*:

1. **Sistem Kasir Fisik (Point of Sale / POS)** untuk transaksi tatap muka, pemindaian *barcode*, pencetakan struk *thermal*, pengiriman Struk Digital 1-klik, dan pengelolaan antrean fotokopi/cetak dokumen.
2. **Website Katalog Toko Online berbasis PWA Mobile-First** bergaya **Marketplace Modern Islami/Syariah (terinspirasi aplikasi Tokopedia versi Mobile)** dengan perpaduan warna **Hijau Zamrud, Emas Royal, dan Hitam Elegan**, yang sekaligus berfungsi sebagai **Portal Harian Komunitas Warga Ogan Ilir** melalui struktur **Dual Sticky Header** (Jadwal Sholat Tanjung Raja + Countdown + Auto-Audio Azan, Cuaca/AQI, Dzikir Al-Ma'tsurat dari `almatsurat.com`, serta Smart AI Chatbot Kiko yang *collapsible*).
3. **Asisten AI Multi-Channel "Kiko"** (LLM untuk percakapan NLP teks/suara + Vision AI untuk OCR bukti transfer) berkarakter santun Islami khas Ogan Ilir & Sumatera Selatan, hadir di **Bot Telegram**, **Header ke-2 Website**, dan fitur ikonik wajib **Floating Chat Widget "Kiko On-Web"** (Tombol **Robot Kiko yang Berpeci** dengan *outline box* beranimasi warna-warni di pojok layar untuk belanja via percakapan / *Auto-Add to Cart*, cek stok, dan unggah bukti transfer).

Sistem ini beroperasi untuk Toko Tunggal (Pusat) di Tanjung Raja dengan struktur database Google Sheets yang dirancang secara modular (`ID_Cabang`) agar siap dikembangkan menjadi sistem multi-cabang di masa depan tanpa biaya hosting/database eksternal.

---

## 2. Latar Belakang, Pemenuhan Pesanan, & Tujuan Produk

### 2.1 Masalah yang Diselesaikan
| # | Masalah Operasional UMKM ATK & Percetakan | Solusi dalam Ekosistem Kiko POS & Smart Shop |
|---|---|---|
| 1 | Antrean fisik & keterbatasan akses order cetak/belanja | Pelanggan memesan ATK atau mengirim berkas cetak dari rumah/kantor via PWA atau Bot Telegram Kiko dengan metode **Ambil di Toko (*Click & Collect*)** tanpa mengantre atau **Pesan Antar (*Delivery Lokal*)** dengan kalkulasi ongkir otomatis dari titik pusat toko di Tanjung Raja |
| 2 | Pencatatan stok & transaksi terpisah/manual | Integrasi stok 3 arah (Kasir Fisik, Website PWA, Bot Telegram) secara *real-time* di Google Sheets; jika stok diubah menjadi 0, AI Kiko otomatis menginformasikan barang habis (*sold out*), mengirim alert ke Owner, dan **proaktif menawarkan rekomendasi produk alternatif** yang tersedia di toko |
| 3 | Validasi pembayaran non-tunai lambat | **Vision AI (OCR)** otomatis membaca teks dan nominal pada foto bukti transfer atau struk QRIS yang dikirim pelanggan, lalu mencocokkannya dengan tagihan di Google Sheets |
| 4 | Keterbatasan layanan pelanggan (CS) di luar jam kerja | AI Kiko melayani FAQ 24/7 (jam operasional, patokan lokasi Jl. Lintas Sumatera Tanjung Raja, tarif fotokopi/jilid, syarat SPJ), memandu order (*Guided Ordering*), melakukan *broadcast* promosi terpersonalisasi, serta melakukan **eskalasi pintar ke Telegram Admin Manusia** jika ada komplain atau detail cetakan yang sangat spesifik |
| 5 | Retensi pelanggan rendah & minim *social proof* | Menyediakan **Login Member via Nomor WA / ID Telegram**, riwayat pesanan & foto hasil cetakan, **Galeri Review Beranimasi (*Running Card Marquee* bergerak dari kiri ke kanan)** di halaman depan, serta **Program Loyalty Member Otomatis 15x Transaksi** (gratis 1x hadiah pilihan dengan syarat konsisten memberi rating Bintang 5 dan ulasan di setiap transaksinya) |
| 6 | Kerumitan administrasi SPJ instansi & komisi perwakilan | Mencetak struk *thermal* harian, mengirim **Struk Digital 1-Klik (ke WA/Telegram)**, men-generate **Nota PDF / SPJ resmi ber-kop Toko Delina ATK & Fotokopi** lengkap dengan alamat Tanjung Raja (bisa dikirim ke WA/Telegram/Email bendahara sekolah/desa), serta menghitung **Komisi Pembeli secara otomatis & transparan** untuk perwakilan kelas/sekolah/kantor desa/kecamatan |
| 7 | Rekap keuangan lambat & perubahan branding sulit tanpa *coding* | Otomatisasi pengiriman **Email Rekap Keuangan & PDF Backup Harian setiap malam pukul 21.00 WIB ke Owner**, rangkuman analitik chat harian/mingguan oleh AI, serta fitur **CMS Pengaturan Identitas & Branding Dinamis** di Dashboard Owner untuk mengganti Nama Aplikasi dan Logo Toko secara manual kapan saja tanpa menyentuh kode program |

### 2.2 Metode Pemenuhan Pesanan (Fulfillment)
1. **Ambil di Toko (*Click & Collect*):** Pelanggan memesan ATK atau mengirim dokumen cetak dari rumah/kantor, lalu mengambil pesanan yang sudah siap di toko Tanjung Raja tanpa perlu mengantre.
2. **Pesan Antar (*Delivery Lokal*):** Pengiriman pesanan ke lokasi pelanggan di area Tanjung Raja dan sekitarnya di Kabupaten Ogan Ilir menggunakan kurir internal toko atau layanan ekspedisi dengan perhitungan ongkos kirim instan.

---

## 3. Target Pengguna & Matriks Hak Akses (RBAC)

### 3.1 Target Pengguna Harian
1. **Pelanggan Umum, Pelajar/Mahasiswa, & Mitra Instansi (Frontend PWA Mobile, Floating Widget Kiko, & Bot Telegram):**
   - *Warga Umum, Pelajar, & Mahasiswa:* Mengakses portal harian warga (sholat/azan, cuaca, dzikir), berbelanja ATK, mengunggah dokumen cetak/skripsi, melacak status pesanan, memberi rating bintang 5 & ulasan, serta mengklaim hadiah *Loyalty 15x Transaksi*.
   - *Perwakilan Instansi (Guru, Bendahara Sekolah, Staf Kantor Desa/Kelurahan/Kecamatan):* Memesan borongan ATK/cetak, mendapatkan Nota PDF/SPJ resmi ber-kop toko, serta memantau saldo dan pencairan komisi belanja instansi.
2. **Kasir & Operator Fotokopi (Modul POS Kasir & Dashboard Operasional):**
   - Memproses transaksi tatap muka dengan cepat, memindai *barcode*, mengelola antrean cetak, **mengunggah foto hasil cetakan/pesanan & struk secara manual ke sistem**, mencetak struk *thermal*, dan mengirim Struk Digital sekali klik via WA/Telegram.
3. **Pemilik Toko / Super Admin / Owner (Dashboard Manajemen Utama, Bot Telegram Notifikasi, & Email):**
   - Memantau rekap penjualan & laba bersih secara *real-time* (Tabel + 3 Grafik Chart.js), mengatur stok master produk & daftar hadiah *loyalty*, memonitor komisi instansi, menerima laporan harian pukul 21.00 WIB, menangani eskalasi AI, serta mengubah Logo & Nama Aplikasi melalui menu CMS Admin Utama.

### 3.2 Mekanisme Autentikasi 4 Tingkat
| Tingkat | Peran Pengguna | Mekanisme Akses & Login |
|---|---|---|
| **Tingkat 1** | Publik Umum (Etalase Mobile, Portal Harian, Chat Kiko) | **Tanpa Login** (Web App di-deploy sebagai *Anyone*). Checkout tamu cukup mengisi Nama/Instansi, Nomor HP/WA, Alamat, dan Metode Pemenuhan |
| **Tingkat 2** | Member Reguler & Perwakilan Instansi | **Login via Nomor WhatsApp atau ID Telegram** (yang terdaftar melalui WA Admin / Bot Telegram) dilengkapi PIN sederhana atau kode OTP |
| **Tingkat 3** | Kasir & Operator Fotokopi | **Login Internal Cepat** menggunakan Username/ID Staf + **PIN 6 Digit** (diatur Owner di `Pengaturan_Toko`), opsional *whitelist* email staf |
| **Tingkat 4** | Owner / Super Admin | **Keamanan Ganda:** Verifikasi akun Google aktif (`Session.getActiveUser()`) **dan/atau** Password/PIN Master khusus Owner + **notifikasi keamanan otomatis ke Telegram pribadi Owner** setiap kali Dashboard Super Admin dibuka |

### 3.3 Matriks Hak Akses (Role-Based Access Control)
| Fitur / Aksi di Dalam Sistem | Pelanggan / Member | Perwakilan Instansi | Kasir / Operator | Owner / Super Admin |
|---|:---:|:---:|:---:|:---:|
| Akses Portal Harian, Katalog Tokopedia Mobile, Klik Gambar Deskripsi, & Chat Kiko | ✅ | ✅ | ✅ | ✅ |
| Lihat riwayat pesanan, foto hasil cetakan, & unduh struk digital milik sendiri | ✅ | ✅ | - | ✅ (Semua) |
| Beri rating Bintang 5 + ulasan & pilih hadiah *Loyalty 15x Transaksi* | ✅ | ✅ | - | - |
| Buka Dashboard Transparansi Saldo Komisi & Arsip Download/Kirim Email Nota PDF/SPJ Instansi | - | ✅ (Milik Instansinya) | - | ✅ (Semua Instansi) |
| Buat transaksi POS kasir, pilih kategori harga terdefinisi (Eceran/Instansi), cetak struk/SPJ | - | - | ✅ | ✅ |
| Kelola antrean cetak, **unggah foto hasil cetakan/struk manual**, kirim Struk Digital 1-klik | - | - | ✅ | ✅ |
| Lihat Laporan Tutup Kasir Harian (*Shift Closing*: Tunai vs Non-Tunai) | - | - | ✅ | ✅ |
| **Mengubah harga master produk, mengubah HPP, atau memberi diskon bebas** | ❌ | ❌ | ❌ *(Dilarang)* | ✅ |
| **Menghapus / membatalkan (void/delete) transaksi yang sudah tercatat/lunas** | ❌ | ❌ | ❌ *(Hanya Ajukan Koreksi)* | ✅ |
| **Melihat Laporan Laba Bersih, HPP, & 3 Grafik Analitik Chart.js** | ❌ | ❌ | ❌ *(Dilarang)* | ✅ |
| Mengatur persentase komisi instansi, *approve* pencairan komisi, & atur hadiah `Loyalty_Gifts` | ❌ | ❌ | ❌ | ✅ |
| **Mengakses CMS Pengaturan Branding (Ganti Logo, Nama Aplikasi, Alamat, Catatan Struk)** | ❌ | ❌ | ❌ | ✅ |
| Menjalankan *Broadcast* Promosi Telegram Terpersonalisasi & membalas eskalasi AI | ❌ | ❌ | ❌ | ✅ |

---

## 4. Spesifikasi Persona Islami & Kemampuan Asisten AI "Kiko"

### 4.1 Karakteristik, Adab Percakapan, & System Prompt AI Kiko
- **Identitas:** "Kiko", asisten AI resmi Toko Delina ATK & Fotokopi "Kiko Smart Stationery", Tanjung Raja, Ogan Ilir.
- **Karakter:** Seorang muslim yang ramah, santun, amanah, profesional, dan cekatan khas masyarakat Ogan Ilir dan Sumatera Selatan.
- **Adab Pembuka (Salam & Kehangatan):** Selalu mengawali interaksi awal dengan salam lengkap:
  > *"Assalamu’alaikum Warahmatullahi Wabarakatuh, Ahlan wa Sahlan di Kiko Smart Stationery (Toko Delina)!"*
- **Kosakata Santun Islami:** Menggunakan sapaan bernilai ibadah secara wajar dan proporsional seperti: *Bismillah, Alhamdulillah, Insya Allah, Barakallahu fiik, Jazakallahu khairan / Jazakumullahu khair,* dan *Tafaddhol*.
- **Adab Menutup Sesi:** Menutup pesan bantuan atau transaksi dengan doa keberkahan:
  > *"Semoga urusan cetak dan belanja Kakak hari ini dimudahkan dan membawa berkah. Wassalamu’alaikum Warahmatullahi Wabarakatuh."*

### 4.2 Penempatan Pengingat Al-Qur'an & Hadits yang Kontekstual (Wajib di 4 Momen Penting)
Agar nasihat terasa menyentuh dan menyejukkan hati tanpa membebani proses belanja, AI Kiko menyematkan kutipan ayat Al-Qur'an atau Hadits sahih secara tematik pada 4 momen berikut:

1. **Saat Pelanggan Mencetak Dokumen Sekolah / Skripsi / Pekerjaan (Motivasi Menuntut Ilmu & Amanah):**
   > *"Menuntut ilmu adalah jalan menuju kebaikan. Rasulullah ﷺ bersabda: 'Barangsiapa menempuh jalan untuk menuntut ilmu, maka Allah mudahkan baginya jalan menuju surga.' (HR. Muslim). Berkas tugas Kakak segera kami proses dengan rapi, Bismillah."*
2. **Saat Konfirmasi Pembayaran Berhasil / Cek Transaksi (Keberkahan Perniagaan Jujur & Halal):**
   > *"Alhamdulillah, pembayaran telah kami terima dengan sah. Rasulullah ﷺ bersabda bahwa pedagang dan pembeli yang jujur lagi amanah akan bersama para nabi dan orang-orang shiddiqin. Terima kasih atas kepercayaannya berbelanja di Toko Delina."*
3. **Saat Mitra Instansi Memeriksa Saldo Komisi (Menjaga Akad, Transparansi, & Amanah):**
   > *"Bismillah, berikut rincian komisi belanja instansi. Allah ﷻ berfirman: 'Dan penuhilah janji, sesungguhnya janji itu pasti diminta pertanggungjawabannya.' (QS. Al-Isra: 34). Semoga menjadi rezeki yang halal dan barokah."*
4. **Saat Member Mengklaim Hadiah Reward 15x Transaksi (Sunnah Saling Memberi Hadiah):**
   > *"Maa Syaa Allah! Kakak berhak memilih hadiah loyalitas. Rasulullah ﷺ bersabda: 'Saling memberi hadiahlah kalian, niscaya kalian akan saling mencintai.' (HR. Bukhari dalam Al-Adab Al-Mufrad). Silakan dipilih hadiah terbaiknya, Kak."*

### 4.3 Skema Eksekusi Teknis AI Kiko (Function Calling Schema)
| Perintah Alami Pelanggan (Teks / Voice Note) | Aksi Teknis yang Dijalankan AI Kiko di Backend GAS |
|---|---|
| *"Beli HVS A4 5 rim dan Pulpen Pilot satu kotak"* | Mengecek stok di `Master_Produk` dan otomatis memasukkan barang ke keranjang belanja (**NLP Auto-Add to Cart**). |
| *"Cek stok kertas folio bergaris"* / *"Kertas Sinar Dunia A4 70gr masih ada?"* | Membaca `Master_Produk` secara *real-time*. Jika stok = 0, Kiko menginfokan habis dan **menawarkan produk alternatif** yang *ready* di toko beserta tawaran kirim foto produknya. |
| *"Ini berkas ujian, print 40 lembar rangkap"* / *"Kalau cetak skripsi 60 halaman warna jilid spiral kawat habis berapa?"* | Menghitung estimasi tarif cetak dari `Master_Layanan_Cetak`, mengunggah berkas ke Google Drive, dan mencatat ke `Antrean_Cetak`. |
| *[Mengirim Gambar Struk Bukti Transfer / QRIS]* | **Vision AI (OCR)** mengekstrak teks & nominal pembayaran, lalu mencocokkan otomatis dengan tagihan di `Transaksi_Header`. |
| *"Status cetakan atas nama Bu Siti"* / *"Status order #INV-088 atas nama Pak Rahmat sudah selesai?"* | Menemukan ID transaksi terkait di `Transaksi_Header` & `Antrean_Cetak`, lalu melaporkan status pengerjaan saat ini secara instan. |
| *"Mau tukar hadiah reward 15x"* | Memverifikasi kualifikasi **15x transaksi dengan konsisten rating Bintang 5 & ulasan** di `Data_Member`, lalu menampilkan pilihan hadiah dari `Loyalty_Gifts`. |
| *[Komplain pelanggan / Permintaan cetak sangat rumit di luar kemampuan AI]* | Mengirim notifikasi eskalasi *real-time* ke Telegram pribadi Owner: *"Halo Bos, ada pelanggan di chat ini yang butuh bantuan admin manusia."* |

---

## 5. Arsitektur Data (Google Sheets & Drive) serta Saluran Notifikasi

### 5.1 Prinsip Modular Multi-Cabang
Seluruh tabel di Google Sheets menyertakan kolom `ID_Cabang` (default awal: `PUSAT-TANJUNG-RAJA`) agar sistem siap dikembangkan menjadi multi-cabang di masa depan tanpa merombak struktur database.

### 5.2 Struktur 11 Tab Google Sheets
| No | Nama Tab Sheet | Rincian Kolom & Fungsi Utama |
|---|---|---|
| 1 | `Master_Produk` | `ID_Cabang`, Kode/Barcode, Nama Produk, Kategori ATK, Merk, Satuan (Pcs/Kotak/Rim), HPP (Modal), Harga Eceran, Harga Grosir/Instansi, Stok Fisik, Batas Alert Stok, **Link Gambar Utama & Galeri Foto**, **Deskripsi Lengkap Produk**, **Spesifikasi Detail Barang** (untuk *Bottom-Sheet* saat gambar diklik), Jumlah Terjual, Rating Rata-rata, dan **Kode Produk Alternatif** (untuk rekomendasi saat stok 0). |
| 2 | `Master_Layanan_Cetak` | ID Layanan, Jenis Layanan (Fotokopi, Print BW/Warna, Jilid Spiral Kawat/Plastik/Softcover/Hardcover, Laminating), Ukuran Kertas (A4/F4/A3), Harga per Lembar/Buku, Ketentuan, & Estimasi Waktu. |
| 3 | `Transaksi_Header` & `Transaksi_Detail` | Nomor Invoice (`#INV-xxx`), Tanggal & Jam, Kanal (POS Kasir / Web PWA / Bot Telegram), ID Member, Nama Pelanggan, Kategori (Umum vs Instansi SPJ), Nama Instansi, Metode Pemenuhan (Ambil di Toko / Pesan Antar), Alamat & Ongkir dari Tanjung Raja, Total ATK, Total Cetak, Nominal Komisi Pembeli, Metode Bayar, Status Validasi OCR Vision AI, Link Bukti Transfer, Link Struk Digital / Nota PDF SPJ, Status Pesanan, serta rincian item per invoice. |
| 4 | `Antrean_Cetak` | ID Antrean, Nomor Invoice, Nama Pelanggan/Instansi, Link File Dokumen di Google Drive, Spesifikasi Cetak (Kertas, Warna/BW, Halaman, Rangkap, Jilid, Catatan), Status Pengerjaan (Antre / Dicetak / Selesai), Nama Operator, dan **Link Foto Hasil Cetakan** (diunggah kasir/operator). |
| 5 | `Data_Member` | ID Member, Nama Lengkap, **Nomor WhatsApp & ID Telegram** (untuk Login Member & Broadcast), Alamat Default, Total Transaksi, **Counter Loyalty Bintang 5** (menghitung jumlah transaksi yang konsisten diberi rating Bintang 5 + ulasan menuju 15x), Status Hak Klaim Hadiah (`Eligible` / `Belum`), & Riwayat Klaim. |
| 6 | `Data_Instansi_Komisi` | ID Mitra/Perwakilan, Nama Perwakilan (Guru/Bendahara/Staf Desa), Nama Instansi Resmi (Sekolah/Kantor Desa/Kecamatan), Nomor WA/Telegram, **Email Resmi Bendahara/Instansi**, Persentase/Nominal Komisi, Total Saldo Komisi, Riwayat Pencairan, & Arsip Link SPJ. |
| 7 | `Ulasan_Pelanggan` | ID Review, Nomor Invoice, Kode Produk, Nama Member, Rating Bintang (1–5), Teks Ulasan, **Link Foto Hasil Cetakan/Struk/Produk**, Tanggal, dan Status Tampil di **Galeri Review Beranimasi (*Running Card Marquee* kiri ke kanan)** serta di detail produk. |
| 8 | `Loyalty_Gifts` | ID Hadiah, Nama Hadiah Pilihan, Deskripsi, Foto Hadiah, Stok Hadiah, dan Status Aktif (diatur penuh oleh Owner di Sheets untuk dipilih langsung oleh member yang mencapai 15x transaksi bintang 5). |
| 9 | `PesanMasuk` & `Log_Eskalasi_AI` | Timestamp, Kanal (Widget Web / Telegram), ID/Nama Pelanggan, Isi Pesan (Teks / Transkripsi Voice Note), Produk/Topik Ditanyakan, Status Auto-Checkout, Respon AI, & Status Eskalasi Admin Manusia (dibaca AI untuk membuat **Rangkuman Analitik Harian/Mingguan**). |
| 10 | `Rekap_Keuangan` | Tanggal, Total Omzet ATK, Total Omzet Jasa Fotokopi/Cetak, Total HPP, Total Pengeluaran Komisi Pembeli Instansi, Biaya Operasional, dan Laba Bersih (sumber data 3 Grafik Chart.js & email rekap pukul 21.00 WIB). |
| 11 | `Pengaturan_Toko` | **CMS Identitas & Branding Dinamis:** Nama Aplikasi / Nama Toko & Tagline (default: *Toko Delina ATK & Fotokopi "Kiko Smart Stationery"*), **Link Logo Toko di Drive**, Alamat & Koordinat Tanjung Raja, Nomor WA/Telegram CS, Email Owner, Catatan Kaki Struk Thermal & Kop SPJ, Info QRIS/Rekening, PIN Staf/Owner (ter-hash), serta System Prompt Persona Islami AI Kiko. |

### 5.3 Struktur Penyimpanan Berkas di Google Drive
- **Diunggah Pelanggan/Instansi:** Berkas cetak (PDF/Word/Excel/PPT/Gambar), foto bukti transfer/QRIS (untuk OCR Vision AI), rekaman *Voice Note* pemesanan, dan foto ulasan pelanggan.
- **Diunggah Kasir/Operator:** **Foto hasil cetakan / pesanan siap ambil dan foto struk** (diunggah manual oleh kasir/operator agar tampil di riwayat akun member dan di *Running Card Marquee* halaman depan).
- **Diunggah Owner (via Menu CMS):** **File Gambar Logo Toko** (otomatis memperbarui link di `Pengaturan_Toko`), foto katalog etalase produk ATK resolusi jelas, dan foto hadiah `Loyalty_Gifts`.
- **Di-generate Otomatis oleh Sistem:** File **Struk Digital**, **Nota PDF / SPJ Resmi ber-kop Toko Delina ATK & Fotokopi**, dan **Lampiran PDF Rekapitulasi Keuangan Harian** untuk backup malam Owner.

### 5.4 Arsitektur Notifikasi Multi-Saluran (Telegram + WhatsApp 1-Klik + Email Otomatis)
1. **Via Telegram Real-Time & WhatsApp 1-Klik ke Pelanggan / Member / Instansi:**
   - Pengiriman **Struk Digital** langsung ke WA atau Telegram pelanggan dalam satu klik dari dashboard kasir atau otomatis setelah validasi Vision AI.
   - Info status pesanan cetak sudah siap diambil di toko Tanjung Raja (*Click & Collect*) lengkap dengan foto hasil cetakan, atau sedang dikirim kurir lokal.
   - Info perolehan progres/klaim hadiah **Loyalty Member 15x Transaksi** & update transparan **Saldo Komisi Pembeli Instansi**.
   - **Broadcast Promosi Terpersonalisasi:** Pengiriman pesan promo otomatis dari Bot Telegram ke ratusan ID pelanggan di Google Sheets dengan sapaan yang menyebut nama masing-masing pelanggan.
2. **Via Telegram Real-Time ke Owner:**
   - Notifikasi eskalasi pelanggan dari AI (*"Halo Bos, ada pelanggan di chat ini yang butuh bantuan admin manusia"*), peringatan stok produk menyentuh angka 0, notifikasi bukti transfer masuk yang sudah diverifikasi Vision AI, notifikasi keamanan saat Dashboard Owner dibuka, dan rangkuman analitik chat harian.
3. **Via Email Otomatis (Scheduled Backup & Dokumen Resmi SPJ):**
   - **Ke Email Owner (Setiap Malam Pukul 21.00 WIB):** Sistem GAS otomatis mengirimkan email berisi **Rekap Keuangan Harian** (total omzet ATK, jasa fotokopi, total pengeluaran komisi pembeli, dan laba bersih) beserta **lampiran PDF ringkasan transaksi hari itu** sebagai cadangan (*backup*) jika tidak sempat membuka dashboard/Sheets.
   - **Ke Email Instansi (Opsional / Sesuai Permintaan):** Fitur kirim langsung file **Nota PDF / SPJ resmi ber-kop Toko Delina** ke alamat email bendahara sekolah atau kantor desa/kelurahan/kecamatan.

---

## 6. Spesifikasi Antarmuka Visual (UI/UX Mobile-First) & Komponen Wajib

### 6.1 Identitas Visual, Warna, Tipografi, & Ornamen Syariah
- **Gaya Desain:** Marketplace Modern Islami/Syariah dengan fokus tampilan **Mobile-First ala Aplikasi Tokopedia versi Mobile**.
- **Palet Warna Harmonis (Hijau, Emas, & Hitam):**
  - *Hijau Islami / Emerald Green (`#0A5C36` s.d. `#10B981`):* Warna utama pada *Dual Sticky Header*, tombol aksi utama (*+ Keranjang / Checkout*), dan *badge* stok tersedia.
  - *Emas / Royal Gold (`#D4AF37` s.d. `#F59E0B`):* Aksen kemewahan syariah pada *border* kartu, ikon rating bintang 5, *badge* Mitra Instansi SPJ, dan *progress bar* Loyalty 15x Transaksi.
  - *Hitam & Abu Gelap (`#111827` & `#1F2937`) di atas Latar Putih Bersih (`#F9FAFB`):* Memberikan kontras tajam dan elegan untuk teks harga, deskripsi barang, serta bilah navigasi.
- **Tipografi:** Kombinasi font modern tegas **`Plus Jakarta Sans` / `Inter`** untuk katalog produk, harga, dan tabel kasir; dipadukan font kaligrafis/serif elegan **`Amiri` / `Playfair Display`** untuk salam pembuka, judul banner, dan kutipan ayat Al-Qur'an / Hadits.
- **Ornamen Islami:** Pola geometris Islami (*Arabesque*) samar di latar header, ikon kubah masjid & bulan-bintang emas pada jadwal sholat, serta ikon tasbih/kitab pada menu dzikir.

### 6.2 Komponen UI Wajib pada Frontend PWA Mobile (Tidak Boleh Terlewat)

1. **Struktur Header Pertama — Portal Harian Warga Ogan Ilir (Sticky / Tetap Tampil Walaupun Di-scroll):**
   - Menampilkan Logo & Identitas **Toko Delina ATK & Fotokopi "Kiko Smart Stationery"** (dinamis mengikuti CMS) serta **Jam Digital Modern Real-Time** di bagian utama header.
   - **Dropdown 1 — Jadwal Sholat & Audio Azan Ogan Ilir:** Memuat jadwal waktu sholat lengkap (termasuk **Imsak dan Terbit**) khusus zona waktu **Tanjung Raja, Kabupaten Ogan Ilir**, dilengkapi **penghitung waktu mundur (*countdown timer*)** menuju waktu sholat berikutnya, serta **memutar audio suara azan sungguhan secara otomatis** saat waktu sholat wilayah Ogan Ilir tiba.
   - **Dropdown 2 — Informasi Cuaca & Kualitas Udara Tanjung Raja:** Menampilkan pantauan cuaca terkini, suhu harian, dan indeks kualitas udara (**AQI**) berdasarkan titik koordinat Tanjung Raja, Ogan Ilir.
   - **Dropdown 3 — Dzikir Al-Ma'tsurat Online:** Menyediakan bacaan dzikir pagi dan petang di dalam menu dropdown agar mudah dibaca langsung dari dashboard, dengan pesan ajakan wajib: **"Biasakan membaca Al-Matsurat setiap pagi dan petang"**, mengambil referensi konten gratis dari situs **`https://almatsurat.com/`**.

2. **Struktur Header Kedua — Otak Aplikasi: Smart AI Chatbot Kiko (Sticky / Tetap Tampil Walaupun Di-scroll & Collapsible):**
   - Selalu tampil menempel di bawah Header Pertama walaupun layar di-scroll, dan bersifat **collapsible** (bisa dibuka-tutup seperti menu dropdown).
   - **Pencatatan Berbasis NLP (Teks & Suara / Voice Note):** Pelanggan cukup mengetik pesan biasa atau mengirim pesan suara (*voice note*) tanpa format kaku (contoh: *"Beli HVS A4 5 rim dan Pulpen Pilot satu kotak"*), dan Kiko otomatis mengecek stok lalu memasukkannya ke keranjang belanja (*Auto-Add to Cart*).
   - **Kolom Input Chat Fleksibel (Auto-Expand):** Kolom teks chat **wajib dibuat mengikuti panjang teks secara otomatis (*auto-resize/auto-expand*) dalam mode apa pun** agar nyaman digunakan di layar HP maupun desktop.

3. **Etalase Produk Bergaya Tokopedia Mobile & Fitur Klik Gambar Deskripsi Barang:**
   - Menampilkan *Search Bar*, filter kategori cepat, dan **Grid Produk 2 Kolom** khas aplikasi Tokopedia Mobile (memuat foto barang, nama produk, harga eceran vs grosir instansi, *badge* stok, rating bintang, dan jumlah terjual).
   - **Interaksi Klik Gambar Etalase Produk:** Saat pelanggan **mengklik gambar atau kartu produk ATK**, layar langsung memunculkan **Pop-up / Slide-Up Bottom-Sheet Detail Produk** ala Tokopedia Mobile yang menampilkan: **Zoom Galeri Foto Produk, Sisa Stok Real-Time, Deskripsi Lengkap & Spesifikasi Detail Barang, Ulasan Pembeli**, serta tombol langsung **"+ Keranjang"** dan **"Tanya Kiko tentang Barang Ini"**.

4. **Galeri Review Beranimasi (*Running Card Marquee* Kiri ke Kanan):**
   - Ulasan bintang 5 pelanggan beserta foto hasil cetakan/struk (baik yang diunggah member maupun yang diunggah manual oleh Kasir/Operator) otomatis tampil di halaman depan website dalam bentuk **Card Info yang bergerak dinamis secara otomatis dari kiri ke kanan (*running animation marquee left-to-right*)**.

5. **Ikon Maskot Wajib — Floating Chat Widget "Kiko On-Web":**
   - Tombol chat melayang di pojok kanan bawah layar berbentuk **Ikon Maskot Robot Kiko yang Berpeci** dengan **outline box beranimasi warna-warni (*animated multi-color/rainbow & gold glowing border*)** untuk belanja via percakapan (*Auto-Add to Cart*), cek stok *real-time*, konsultasi tarif cetak, lacak pesanan, dan unggah bukti transfer.

6. **Bottom Navigation Bar (Navigasi Bawah Aplikasi Mobile):**
   - Terdiri dari 5 menu utama: **Beranda**, **Order Cetak**, **Keranjang**, **Lacak Pesanan**, dan **Akun Member / Instansi**.

### 6.3 Spesifikasi Visualisasi Data & Laporan pada Dashboard Kasir vs Owner

1. **Dashboard Kasir & Operator Fotokopi (Fokus Kecepatan Kerja — Tanpa Grafik Berat):**
   - **Kartu Ringkasan Angka (KPI Cards)** di bagian atas (Antrean Cetak Aktif, Pesanan Siap Ambil/Kirim, Bukti Transfer Baru Vision AI, Total Transaksi Hari Ini).
   - **Tabel Interaktif Cepat** dengan fitur *Search*, *Filter Status Pesanan*, dan *Filter Instansi* (untuk mencari arsip SPJ Sekolah/Desa dengan cepat) serta tombol unggah foto hasil cetakan & kirim Struk Digital 1-klik.
   - **Laporan Tutup Kasir Harian (*Shift Closing Report*):** Rekap setoran uang tunai vs pembayaran non-tunai terverifikasi OCR dan daftar cetakan selesai, tanpa menampilkan HPP atau Laba Bersih.

2. **Dashboard Super Admin / Owner (Kombinasi Tabel Filter Ekspor + 3 Grafik Chart.js + Panel AI + CMS):**
   - **Tabel Rekap Keuangan Harian/Bulanan** yang bisa difilter dan diekspor ke Excel/PDF.
   - **3 Grafik Visual Simpel (Chart.js):**
     1. *Grafik 1 — Tren Omzet & Laba Bersih (Mingguan/Bulanan):* Membandingkan pendapatan ATK vs Fotokopi/Cetak dikurangi Komisi Pembeli Instansi dan HPP.
     2. *Grafik 2 — Top 5 Produk & Layanan Terlaris:* Memudahkan pantauan stok barang yang cepat habis.
     3. *Grafik 3 — Porsi Pelanggan & Loyalty:* Membandingkan transaksi Pelanggan Umum vs Instansi (SPJ Sekolah/Desa) serta daftar member yang mendekati syarat **15x transaksi Bintang 5**.
   - **Panel Laporan Performa AI Kiko & Vision AI:** Menampilkan rasio keberhasilan *Auto-Checkout* chat AI vs jumlah chat yang dieskalasi ke Admin Manusia, akurasi pembacaan OCR bukti transfer, serta rangkuman analitik harian dari tab `PesanMasuk` (produk yang paling sering ditanyakan & permintaan saat stok 0).
   - **Menu Pengaturan Utama — CMS Kustomisasi Branding Dinamis (Tanpa Coding):** Form bagi Owner untuk mengganti **Nama Aplikasi / Nama Toko & Tagline**, **Upload/Ganti Gambar Logo Toko** (otomatis tersimpan di Google Drive dan diperbarui link-nya di `Pengaturan_Toko`), **Alamat**, **Nomor WA/Telegram CS**, dan **Catatan Kaki Struk**. Setiap perubahan otomatis memperbarui Header/Footer Website, Ikon/Nama PWA, Kop Nota PDF/SPJ Instansi, hingga Struk Kasir Thermal secara *real-time*.

---

## 7. Persyaratan Non-Fungsional & Optimasi Google Apps Script (GAS)

- **Kapasitas & Beban Harian:**
  - Kunjungan Portal Komunitas & Etalase Mobile: **200–350 kunjungan/hari**.
  - Volume Transaksi Penjualan & Antrean Cetak: **100–200 transaksi/hari**.
  - Interaksi Chat/Voice AI Kiko: **150–300 pesan/hari** (dibatasi *rate-limit* wajar agar kuota API aman) & **40–80 scan bukti transfer Vision AI/hari**.
  - Jam Puncak Operasional: Pagi (**07.30–11.30 WIB**), Sore (**14.00–17.30 WIB**), dan Malam (**19.00–21.00 WIB** ditutup email rekap otomatis pukul **21.00 WIB**).
- **Optimasi Teknis GAS:**
  - Menggunakan **`CacheService` & `localStorage`** untuk menyimpan data katalog produk, identitas CMS branding (logo/nama toko), jadwal sholat, dan cuaca agar waktu muat di layar HP secepat aplikasi *native* dan hemat kuota panggilan Google Sheets.
  - Menggunakan **`LockService`** saat pencatatan transaksi kasir dan pengurangan stok barang agar tidak terjadi bentrok data (*race condition*) ketika kasir fisik dan pembeli online bertransaksi di detik yang sama.
  - Menggunakan **`Time-driven Triggers`** untuk pengiriman otomatis Email Rekap Keuangan & PDF Backup pukul 21.00 WIB serta rangkuman analitik chat harian.

---

## 8. Rencana Deployment & Skenario Pengujian (QA Checklist)

| Area Pengujian | Skenario Uji Wajib Sebelum Go-Live |
|---|---|
| **UI Mobile & Dual Sticky Header** | Pastikan Header 1 (Jam, Dropdown Sholat + Countdown + **Auto-Audio Azan**, Dropdown Cuaca/AQI, Dropdown Al-Ma'tsurat) dan Header 2 (Chatbot Kiko *collapsible* dengan **kolom chat fleksibel mengikuti teks**) tetap *sticky* saat di-scroll di layar HP. |
| **Etalase Tokopedia Mobile & Klik Gambar** | Klik gambar produk ATK di etalase mobile dan pastikan muncul *Slide-Up Bottom-Sheet* berisi zoom foto, stok, **deskripsi & spesifikasi lengkap barang**, ulasan, dan tombol `+ Keranjang`. |
| **Floating Robot Kiko Berpeci** | Pastikan tombol melayang **Robot Kiko Berpeci dengan outline box beranimasi warna-warni** tampil di pojok layar, mendukung input teks & suara (*Auto-Add to Cart*), serta menyertakan salam lengkap dan **4 kutipan Al-Qur'an/Hadits kontekstual**. |
| **Vision AI OCR & Stok 0** | Unggah foto bukti transfer untuk menguji validasi otomatis Vision AI; ubah stok barang menjadi 0 di Sheets dan uji apakah Kiko otomatis menawarkan **produk alternatif** serta mengirim alert ke Telegram Owner. |
| **Running Card & Loyalty 15x** | Uji unggah foto hasil cetakan dari Dashboard Kasir dan pastikan tampil di **Running Card Marquee (bergerak dari kiri ke kanan)** di beranda; uji penghitungan otomatis **15x transaksi dengan syarat konsisten Bintang 5 + ulasan** hingga member bisa memilih hadiah dari `Loyalty_Gifts`. |
| **SPJ Instansi, Komisi, & RBAC Kasir** | Uji cetak struk thermal, kirim Struk Digital 1-klik ke WA/Telegram, *generate* & kirim email **Nota PDF/SPJ resmi ber-kop Toko Delina**, perhitungan **Komisi Pembeli Instansi**, serta pastikan Kasir tidak bisa mengubah harga/HPP atau menghapus transaksi. |
| **CMS Branding & Email 21.00 WIB** | Uji ganti Nama Aplikasi & Upload Logo baru di menu Admin Utama (pastikan langsung mengubah Web, PWA, Kop SPJ PDF, dan Struk Thermal tanpa *coding*), serta uji *trigger* pengiriman Email Rekap Keuangan + PDF Backup pukul 21.00 WIB ke Owner. |

---

## 9. Prompt Siap Pakai untuk Google Stitch (Generasi Desain Visual UI/UX)

*(Salin teks di bawah ini ke Google Stitch jika ingin menghasilkan prototipe gambar UI/UX otomatis yang 100% sesuai dengan spesifikasi PRD di atas)*:

```text
Design a Mobile-First PWA E-Commerce & POS App UI inspired by "Tokopedia Mobile App" with a Modern Islamic / Syariah theme for "Kiko POS & Smart Shop - Toko Delina ATK & Fotokopi (Kiko Smart Stationery)" in Tanjung Raja, Ogan Ilir.

COLOR PALETTE & TYPOGRAPHY:
- Primary: Emerald Islamic Green (#0A5C36 to #10B981)
- Accent: Royal Gold (#D4AF37 to #F59E0B) for borders, stars, SPJ badges, and loyalty progress
- Background & Contrast: Deep Charcoal/Black (#111827) and Clean White (#F9FAFB) with subtle Arabesque geometric patterns in headers.
- Fonts: Plus Jakarta Sans for clean UI/product prices, Amiri serif for Islamic greetings & Quran/Hadith quotes.

KEY MOBILE SCREENS & MANDATORY COMPONENTS:
1. DUAL STICKY HEADER (Always visible on scroll):
   - Top Header 1 (Community Portal): Dynamic Store Logo & Name ("Toko Delina ATK & Fotokopi"), Real-time Digital Clock, and 3 Compact Dropdown Pills: (a) Prayer Times Ogan Ilir (with Imsak/Sunrise, countdown timer to next prayer, and Auto-Azan audio speaker icon), (b) Weather & AQI Tanjung Raja, (c) Al-Ma'tsurat Morning/Evening Dzikir ("Biasakan membaca Al-Matsurat setiap pagi dan petang").
   - Second Header 2 (Brain of the App - Smart AI Chatbot Kiko): Collapsible AI bar right below Header 1, featuring an auto-expanding flexible text input field that grows with text in any mode, and a Voice Note microphone button with placeholder: "Ketik atau ucapkan pesanan: Beli HVS A4 5 rim dan Pulpen Pilot 1 kotak..."

2. MOBILE HOME & TOKOPEDIA-STYLE PRODUCT SHOWCASE:
   - Running Card Marquee (Left-to-Right Animation): Animated customer review cards moving from left to right showing 5-star ratings, customer testimonials, and photos of printed documents/receipts uploaded by cashier/customers.
   - 2-Column Product Grid (Tokopedia Mobile style): Showing ATK product image, title, retail vs institutional wholesale price, stock badge, 5-star rating, and sold count.
   - Product Image Click -> Slide-Up Bottom-Sheet Modal: When a product image is tapped, show a bottom-sheet overlay with zoomable photo gallery, real-time stock, complete product description & specifications, buyer reviews, "+ Keranjang" button, and "Tanya Kiko" button.

3. MANDATORY FLOATING MASCOT WIDGET ("Kiko On-Web"):
   - Floating action button at the bottom-right corner featuring a cute "Robot Kiko wearing an Islamic Peci (cap)" inside a glowing, animated multi-color/rainbow & gold outline box for conversational shopping, stock checking, and transfer receipt upload.

4. LOYALTY 15x, INSTITUTIONAL SPJ / COMMISSION VIEW & DASHBOARDS:
   - Loyalty tracker banner showing progress toward "15x Consistent 5-Star + Review Transactions = 1 Free Gift" with Islamic Hadith quote.
   - Institutional (School/Village Office) card showing transparent Buyer Commission balance and 1-click "Download / Email Official SPJ PDF Invoice" button.
   - Bottom Navigation Bar: Beranda, Order Cetak, Keranjang, Lacak Pesanan, Akun Member.
```
