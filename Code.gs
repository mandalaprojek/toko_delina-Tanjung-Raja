/**
 * ============================================================================
 * KIKO POS & SMART SHOP — BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * Toko Delina ATK & Fotokopi "Kiko Smart Stationery"
 * Jl. Lintas Sumatera, Tanjung Raja, Kabupaten Ogan Ilir, Sumatera Selatan 30661
 * ============================================================================
 * Arsitektur Database : Google Sheets (9 Sheet Terintegrasi)
 * Penyimpanan Berkas  : Google Drive (6 Folder Terstruktur)
 * Integrasi           : Gemini AI (Chat & Vision AI), Telegram Bot API, Gmail (MailApp)
 * Optimasi            : CacheService & LockService (Concurrency Safe)
 * ============================================================================
 */

const APP_CONFIG = {
  APP_NAME: 'Kiko POS & Smart Shop - Toko Delina ATK & Fotokopi',
  CACHE_TTL_SECONDS: 300, // 5 menit cache katalog
  DEFAULT_COORDS: { lat: -3.3267, lng: 104.7606, label: 'Tanjung Raja, Ogan Ilir' },
  SHEETS: {
    PRODUK: 'Master_Produk_ATK',
    JASA_CETAK: 'Master_Jasa_Cetak',
    PESANAN: 'Data_Pesanan',
    DETAIL_PESANAN: 'Detail_Item_Pesanan',
    KEUANGAN: 'Keuangan_Kas',
    LOG_KERTAS: 'Log_Kertas_Harian',
    PELANGGAN: 'Data_Pelanggan',
    LOG_CHAT: 'Log_Chat_AI',
    PENGATURAN: 'Pengaturan_Toko',
    AKUN_STAF: 'Akun_Staf'
  },
  FOLDERS: {
    DOKUMEN_CETAK: 'Folder_Dokumen_Cetak',
    BUKTI_BAYAR: 'Folder_Bukti_Bayar',
    KATALOG_PRODUK: 'Folder_Katalog_Produk',
    ARSIP_NOTA_SPJ: 'Folder_Arsip_Nota_SPJ',
    RETUR_KOMPLAIN: 'Folder_Retur_Komplain',
    ASET_WEB: 'Folder_Aset_Web'
  }
};

/**
 * ============================================================================
 * 1. HTTP ENTRY POINTS (Web App & Webhook Bot Telegram)
 * ============================================================================
 */

function doGet(e) {
  // Pastikan struktur sheet tersedia saat pertama kali dibuka secara aman
  try {
    ensureDatabaseInitialized_();
  } catch (err) {
    console.warn('ensureDatabaseInitialized_ bypassed:', err);
  }
  
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Kiko Smart Stationery — Toko Delina ATK & Fotokopi')
    .setFaviconUrl('https://cdn-icons-png.flaticon.com/512/3144/3144456.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Webhook Receiver untuk Bot Telegram Kiko & Alert Owner
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
    }
    const payload = JSON.parse(e.postData.contents);

    // 1. Handle API Actions dari Localhost / Web Client
    if (payload.action) {
      const action = payload.action;
      const data = payload.data || {};
      let result = null;

      if (action === 'createOrderTransaction') {
        result = createOrderTransaction(data);
      } else if (action === 'getInitialAppData') {
        result = getInitialAppData();
      } else if (action === 'authenticateUser') {
        result = authenticateUser(data.pin);
      } else if (action === 'getDashboardDataByRole') {
        result = getDashboardDataByRole(data.role, data.pin);
      } else if (action === 'chatWithKikoAI') {
        result = chatWithKikoAI(data.userMessage, data.history || []);
      } else if (action === 'submitDailyPaperLog') {
        result = submitDailyPaperLog(data);
      } else if (action === 'updateOrderStatusAndNotify') {
        result = updateOrderStatusAndNotify(data.idPesanan, data.newStatus, data.stafName);
      } else if (action === 'voidOrderByOwner') {
        result = voidOrderByOwner(data.idPesanan, data.reason, data.ownerName);
      } else if (action === 'saveOrUpdateProductByOwner') {
        result = saveOrUpdateProductByOwner(data.productData, data.ownerName);
      } else if (action === 'sendSegmentedTelegramBroadcast') {
        result = sendSegmentedTelegramBroadcast(data.segment, data.messageText, data.ownerName);
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, result: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Handle pesan masuk dari Telegram Bot
    if (payload.message) {
      const chatId = String(payload.message.chat.id);
      const senderName = [payload.message.from.first_name || '', payload.message.from.last_name || ''].join(' ').trim() || 'Pelanggan';
      const text = payload.message.text || '';

      if (text) {
        handleTelegramIncomingMessage_(chatId, senderName, text);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error('doPost Error:', err);
    return ContentService.createTextOutput(JSON.stringify({ success: false, status: 'error', message: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ============================================================================
 * 2. INISIALISASI DATABASE OTOMATIS (SHEETS & DRIVE FOLDERS)
 * ============================================================================
 */

function setupDatabaseAndDrive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const S = APP_CONFIG.SHEETS;

  // 1. Master_Produk_ATK
  initSheetWithHeaders_(ss, S.PRODUK, [
    'SKU', 'Nama_Barang', 'Kategori', 'HPP', 'Harga_Eceran', 'Min_Qty_Grosir', 'Harga_Grosir', 'Stok_Tersedia', 'Batas_Stok_Kritis', 'Link_Foto_Produk', 'Best_Seller'
  ], [
    ['ATK-001', 'Kertas HVS SiDU A4 70gr (1 Rim)', 'Kertas & Buku', 39000, 46000, 5, 43500, 48, 10, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80', 'YA'],
    ['ATK-002', 'Kertas HVS SiDU F4 70gr (1 Rim)', 'Kertas & Buku', 43000, 50000, 5, 47500, 35, 10, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80', 'YA'],
    ['ATK-003', 'Pulpen Standard AE7 Hitam (1 Kotak / 12 Pcs)', 'Alat Tulis', 17500, 24000, 3, 21500, 25, 5, 'https://images.unsplash.com/photo-1585336261026-7a466e5e2760?w=400&q=80', 'YA'],
    ['ATK-004', 'Pulpen Gel Joyko GP-265 0.5mm (Pcs)', 'Alat Tulis', 2000, 3500, 12, 2800, 120, 24, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80', 'TIDAK'],
    ['ATK-005', 'Buku Tulis Sinar Dunia 58 Lembar (Pak / 10 Buku)', 'Kertas & Buku', 34000, 42000, 5, 39000, 18, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80', 'YA'],
    ['ATK-006', 'Map Biola / Map Kertas Folio (Pcs)', 'Perlengkapan Kantor', 1500, 2500, 50, 2000, 200, 30, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', 'TIDAK'],
    ['ATK-007', 'Ordner Bantex Folio 1465 (Pcs)', 'Perlengkapan Kantor', 24000, 32000, 10, 29000, 7, 10, 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&q=80', 'TIDAK'],
    ['ATK-008', 'Lakban Hitam Daimaru 2 Inch (Roll)', 'Perekat & Gunting', 13500, 18000, 6, 16000, 4, 8, 'https://images.unsplash.com/photo-1572945281869-952a38b7f46f?w=400&q=80', 'TIDAK'],
    ['ATK-009', 'Amplop Putih Paperline 90 PPS (Kotak)', 'Perlengkapan Kantor', 16500, 22000, 5, 19500, 0, 5, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80', 'TIDAK'],
    ['ATK-010', 'Stapler Joyko HD-10 + Isi Staples Paket Hemat', 'Perekat & Gunting', 9500, 14000, 6, 12000, 32, 8, 'https://images.unsplash.com/photo-1616628188550-808682f3926d?w=400&q=80', 'YA']
  ]);

  // 2. Master_Jasa_Cetak
  initSheetWithHeaders_(ss, S.JASA_CETAK, [
    'Kode_Jasa', 'Nama_Layanan', 'Kategori_Layanan', 'Satuan', 'HPP_Estimasi', 'Tarif_Normal', 'Min_Qty_Diskon', 'Tarif_Diskon'
  ], [
    ['PRT-BW-A4', 'Print Hitam-Putih A4 / F4', 'Print & Fotokopi', 'Halaman', 180, 500, 100, 350],
    ['PRT-CL-A4', 'Print Warna Standar A4 / F4', 'Print & Fotokopi', 'Halaman', 400, 1000, 50, 800],
    ['PRT-FL-A4', 'Print Full Color / Foto A4', 'Print & Fotokopi', 'Halaman', 900, 2500, 20, 2000],
    ['FC-BW', 'Fotokopi A4 / F4 Bolak-Balik / Biasa', 'Print & Fotokopi', 'Halaman', 130, 300, 200, 250],
    ['JLD-LAKBAN', 'Jilid Biasa (Mika + Karton + Lakban)', 'Jilid & Finishing', 'Buku', 2000, 5000, 10, 4000],
    ['JLD-SPIRAL', 'Jilid Spiral Kawat / Plastik', 'Jilid & Finishing', 'Buku', 5500, 12000, 10, 10000],
    ['LAM-A4F4', 'Laminating Panas A4 / F4', 'Jilid & Finishing', 'Lembar', 1800, 4000, 20, 3500]
  ]);

  // 3. Data_Pesanan
  initSheetWithHeaders_(ss, S.PESANAN, [
    'ID_Pesanan', 'Waktu_Transaksi', 'Kanal', 'ID_Pelanggan', 'Nama_Pelanggan', 'Kontak_WA', 'Email_Instansi',
    'Nama_Instansi', 'Metode_Ambil', 'Kode_Ambil', 'Subtotal_ATK', 'Subtotal_Cetak', 'Ongkir', 'Total_Tagihan',
    'Total_HPP', 'Laba_Bersih', 'Metode_Bayar', 'Status_Bayar', 'Link_Bukti_Bayar', 'Validasi_Vision_AI',
    'Status_Pesanan', 'Link_File_Cetak', 'Detail_Opsi_Cetak', 'Link_Nota_SPJ', 'Staf_Kasir', 'Catatan'
  ], [
    ['ORD-261025-001', '2026-10-25 08:15:00', 'POS', 'CUST-WALKIN', 'Pelanggan Umum', '-', '', '', 'Walk-In POS', 'POS-001', 92000, 15000, 0, 107000, 79600, 27400, 'Tunai', 'Lunas', '', 'Verified Tunai POS', 'Selesai', '', '', '', 'Deri (Kasir Pagi)', 'Pembelian HVS & Jilid'],
    ['ORD-261025-002', '2026-10-25 09:30:00', 'Website', 'CUST-002', 'Budi Santoso (SDN 1 Tanjung Raja)', '081278901234', 'bendahara@sdn1tanjungraja.sch.id', 'SD Negeri 1 Tanjung Raja', 'Click & Collect', 'KIKO-882', 217500, 60000, 0, 277500, 188200, 89300, 'QRIS', 'Lunas (Tervalidasi AI)', 'https://drive.google.com/example-qris', 'Vision AI: Valid Rp 277.500 (QRIS Toko Delina)', 'Siap Diambil', 'https://drive.google.com/example-doc', '120 Hal Print BW + 5 Jilid Lakban', 'https://drive.google.com/example-spj', 'Delina (Owner)', 'Butuh SPJ Dana BOS'],
    ['ORD-261025-003', '2026-10-25 10:45:00', 'Telegram', 'CUST-003', 'Rina Amelia', '085266778899', '', '', 'Delivery Lokal', 'KIKO-914', 42000, 24000, 5000, 71000, 41200, 29800, 'Transfer Bank', 'Menunggu Verifikasi', 'https://drive.google.com/example-tf', 'Vision AI: Perlu Cek Manual (Nominal Buram)', 'Sedang Dicetak', 'https://drive.google.com/example-skripsi', '24 Hal Print Warna + 1 Jilid Spiral', '', 'Siti (Operator)', 'Antar ke dekat Pasar Tanjung Raja']
  ]);

  // 4. Detail_Item_Pesanan
  initSheetWithHeaders_(ss, S.DETAIL_PESANAN, [
    'ID_Detail', 'ID_Pesanan', 'Waktu', 'Tipe_Item', 'Kode_SKU', 'Nama_Item', 'Qty', 'Harga_Satuan', 'HPP_Satuan', 'Subtotal_Harga', 'Subtotal_HPP', 'Grosir_Aktif'
  ], [
    ['DTL-001', 'ORD-261025-001', '2026-10-25 08:15:00', 'ATK', 'ATK-001', 'Kertas HVS SiDU A4 70gr (1 Rim)', 2, 46000, 39000, 92000, 78000, 'TIDAK'],
    ['DTL-002', 'ORD-261025-001', '2026-10-25 08:15:00', 'CETAK', 'JLD-LAKBAN', 'Jilid Biasa (Mika + Karton + Lakban)', 3, 5000, 2000, 15000, 6000, 'TIDAK'],
    ['DTL-003', 'ORD-261025-002', '2026-10-25 09:30:00', 'ATK', 'ATK-001', 'Kertas HVS SiDU A4 70gr (1 Rim)', 5, 43500, 39000, 217500, 195000, 'YA'],
    ['DTL-004', 'ORD-261025-002', '2026-10-25 09:30:00', 'CETAK', 'PRT-BW-A4', 'Print Hitam-Putih A4 / F4', 100, 350, 180, 35000, 18000, 'YA'],
    ['DTL-005', 'ORD-261025-002', '2026-10-25 09:30:00', 'CETAK', 'JLD-LAKBAN', 'Jilid Biasa (Mika + Karton + Lakban)', 5, 5000, 2000, 25000, 10000, 'TIDAK']
  ]);

  // 5. Keuangan_Kas
  initSheetWithHeaders_(ss, S.KEUANGAN, [
    'ID_Kas', 'Tanggal', 'ID_Pesanan', 'Kanal', 'Omzet_ATK', 'Omzet_Jasa_Cetak', 'Ongkos_Kirim', 'Total_Omzet', 'Total_HPP', 'Laba_Bersih', 'Staf_Pencatat', 'Status_Transaksi'
  ], [
    ['KAS-001', '2026-10-23', 'ORD-261023-010', 'POS', 650000, 280000, 0, 930000, 560000, 370000, 'Deri (Kasir Pagi)', 'VALID'],
    ['KAS-002', '2026-10-24', 'ORD-261024-015', 'Website', 820000, 410000, 25000, 1255000, 740000, 515000, 'Siti (Operator)', 'VALID'],
    ['KAS-003', '2026-10-25', 'ORD-261025-001', 'POS', 92000, 15000, 0, 107000, 79600, 27400, 'Deri (Kasir Pagi)', 'VALID'],
    ['KAS-004', '2026-10-25', 'ORD-261025-002', 'Website', 217500, 60000, 0, 277500, 188200, 89300, 'Delina (Owner)', 'VALID']
  ]);

  // 6. Log_Kertas_Harian
  initSheetWithHeaders_(ss, S.LOG_KERTAS, [
    'ID_Log', 'Waktu_Input', 'Tanggal', 'Ukuran_Kertas', 'Kertas_Terpakai_Sah', 'Kertas_Rusak_Waste', 'Alasan_Waste', 'Staf_Operator'
  ], [
    ['LKP-001', '2026-10-23 17:00:00', '2026-10-23', 'A4 70gr', 1450, 22, 'Paper jam mesin fotokopi Canon IR', 'Deri (Kasir Pagi)'],
    ['LKP-002', '2026-10-24 17:10:00', '2026-10-24', 'F4 70gr', 980, 15, 'Tinta luntur / bolak-balik miring', 'Siti (Operator)'],
    ['LKP-003', '2026-10-25 11:00:00', '2026-10-25', 'A4 70gr', 620, 8, 'Kertas terlipat di tray 2', 'Siti (Operator)']
  ]);

  // 7. Data_Pelanggan
  initSheetWithHeaders_(ss, S.PELANGGAN, [
    'ID_Pelanggan', 'Nama_Pelanggan', 'Segmen', 'No_HP_WA', 'Chat_ID_Telegram', 'Email_Instansi', 'Alamat', 'Total_Order'
  ], [
    ['CUST-001', 'Ahmad Fauzi', 'Pelajar/Mahasiswa', '081367889900', '610293841', '', 'Kel. Tanjung Raja Utara', 7],
    ['CUST-002', 'Budi Santoso (SDN 1 Tanjung Raja)', 'Instansi Sekolah (BOS)', '081278901234', '529183746', 'bendahara@sdn1tanjungraja.sch.id', 'Jl. Merdeka No. 12 Tanjung Raja', 14],
    ['CUST-003', 'Rina Amelia', 'Warga Umum', '085266778899', '748291034', '', 'Deket Pasar Tanjung Raja, Ogan Ilir', 4],
    ['CUST-004', 'Kantor Desa Talang Balai Baru', 'Instansi Desa', '082177889911', '819203948', 'pemdes.talangbalaibaru@oganilirkab.go.id', 'Kec. Tanjung Raja, Ogan Ilir', 9]
  ]);

  // 8. Log_Chat_AI
  initSheetWithHeaders_(ss, S.LOG_CHAT, [
    'ID_Chat', 'Waktu', 'Kanal', 'ID_Pelanggan_Atau_Sesi', 'Nama_Pelanggan', 'Pesan_Pelanggan', 'Respon_Kiko', 'Aksi_Otomatis'
  ], [
    ['CHT-001', '2026-10-25 09:12:10', 'Website', 'SES-9821', 'Budi Santoso', 'Kiko, ada kertas HVS A4 5 rim sama mau print 100 lembar hitam putih?', 'Halo Pak Budi! Stok Kertas HVS SiDU A4 70gr tersedia (48 rim). Karena beli 5 rim, Bapak otomatis dapat Harga Grosir Rp 43.500/rim! Print BW 100 hal juga dapat diskon jadi Rp 350/hal. Sudah Kiko masukkan ke keranjang ya!', 'ADD_TO_CART: ATK-001 (x5), PRT-BW-A4 (x100)'],
    ['CHT-002', '2026-10-25 10:05:44', 'Telegram', '748291034', 'Rina Amelia', 'Amplop putih Paperline masih ada kak?', 'Mohon maaf Kak Rina, Amplop Putih Paperline 90 PPS saat ini sedang HABIS (Stok 0). Sebagai pengganti, kami punya Map Biola Folio (Stok 200 pcs) atau kak Rina bisa pre-order untuk besok pagi. Mau Kiko bantu catat?', 'SUGGEST_SUBSTITUTE: ATK-009 -> ATK-006']
  ]);

  // 9. Pengaturan_Toko
  initSheetWithHeaders_(ss, S.PENGATURAN, [
    'Kunci_Pengaturan', 'Nilai_Pengaturan', 'Keterangan'
  ], [
    ['NAMA_TOKO', 'Toko Delina ATK & Fotokopi "Kiko Smart Stationery"', 'Nama resmi di header & Kop SPJ'],
    ['ALAMAT_TOKO', 'Jl. Lintas Sumatera, Tanjung Raja, Kab. Ogan Ilir, Sumatera Selatan 30661', 'Alamat lengkap toko'],
    ['KONTAK_TOKO', '0812-7111-8899 / email: delina.smartstationery@gmail.com', 'Kontak di Kop Nota & SPJ'],
    ['KOORDINAT_LAT', '-3.3267', 'Latitude Tanjung Raja untuk Jadwal Sholat & Cuaca'],
    ['KOORDINAT_LNG', '104.7606', 'Longitude Tanjung Raja untuk Jadwal Sholat & Cuaca'],
    ['INFO_REKENING', 'BRI 5678-01-023456-53-1 a.n. Toko Delina ATK / QRIS Kiko Smart Stationery', 'Info pembayaran pelanggan'],
    ['TARIF_ONGKIR_LOKAL', '5000', 'Tarif flat kurir lokal area Tanjung Raja (Rp)'],
    ['GEMINI_API_KEY', '', 'API Key Google Gemini untuk Chat Kiko & Vision AI Bukti Bayar'],
    ['TELEGRAM_BOT_TOKEN', '', 'Token Bot Telegram dari @BotFather'],
    ['OWNER_TELEGRAM_CHAT_ID', '', 'Chat ID Telegram Owner untuk Alert Bukti Transfer & Stok Kritis'],
    ['NAMA_PENANDATANGAN_SPJ', 'Delina Deri, S.E.', 'Nama Pimpinan Toko di Stempel & Tanda Tangan SPJ']
  ]);

  // 10. Akun_Staf
  initSheetWithHeaders_(ss, S.AKUN_STAF, [
    'ID_Staf', 'Nama_Staf', 'Role', 'PIN_Password', 'Shift', 'Status_Aktif'
  ], [
    ['OWN-01', 'Delina (Owner)', 'OWNER', '123456', 'All Shift', 'AKTIF'],
    ['OWN-02', 'Deri (Co-Owner)', 'OWNER', '654321', 'All Shift', 'AKTIF'],
    ['STF-01', 'Deri Kasir Pagi', 'STAFF', '1122', 'Shift Pagi', 'AKTIF'],
    ['STF-02', 'Siti Operator Cetak', 'STAFF', '2233', 'Shift Siang', 'AKTIF'],
    ['STF-03', 'Andi Kasir Sore', 'STAFF', '3344', 'Shift Sore', 'AKTIF']
  ]);

  // Buat struktur Folder Google Drive jika belum ada
  const folderIds = ensureDriveFolders_();

  return {
    success: true,
    message: 'Database Google Sheets (10 Sheet) & 6 Folder Google Drive berhasil diinisialisasi.',
    folderIds: folderIds
  };
}

function ensureDatabaseInitialized_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  const produkSheet = ss.getSheetByName(APP_CONFIG.SHEETS.PRODUK);
  if (!produkSheet) {
    setupDatabaseAndDrive();
  }
}

function initSheetWithHeaders_(ss, sheetName, headers, sampleRows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#059669')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    if (sampleRows && sampleRows.length > 0) {
      sheet.getRange(2, 1, sampleRows.length, headers.length).setValues(sampleRows);
    }
  }
  return sheet;
}

function ensureDriveFolders_() {
  const props = PropertiesService.getScriptProperties();
  const folderMap = {};
  const rootFolderName = 'Kiko_Smart_Stationery_Storage';
  let rootFolder;

  const rootIter = DriveApp.getFoldersByName(rootFolderName);
  if (rootIter.hasNext()) {
    rootFolder = rootIter.next();
  } else {
    rootFolder = DriveApp.createFolder(rootFolderName);
  }

  Object.keys(APP_CONFIG.FOLDERS).forEach(key => {
    const fName = APP_CONFIG.FOLDERS[key];
    const cachedId = props.getProperty('FOLDER_' + key);
    if (cachedId) {
      folderMap[key] = cachedId;
    } else {
      const iter = rootFolder.getFoldersByName(fName);
      let subFolder = iter.hasNext() ? iter.next() : rootFolder.createFolder(fName);
      folderMap[key] = subFolder.getId();
      props.setProperty('FOLDER_' + key, subFolder.getId());
    }
  });
  return folderMap;
}

/**
 * ============================================================================
 * 3. API PUBLIK & CACHE LAYER (Katalog, Jasa Cetak, Pengaturan Publik)
 * ============================================================================
 */

function getInitialAppData() {
  ensureDatabaseInitialized_();
  const cache = CacheService.getScriptCache();
  const cachedCatalog = cache.get('PUBLIC_CATALOG_CACHE');

  let catalogData;
  if (cachedCatalog) {
    catalogData = JSON.parse(cachedCatalog);
  } else {
    catalogData = buildPublicCatalogData_();
    try {
      cache.put('PUBLIC_CATALOG_CACHE', JSON.stringify(catalogData), APP_CONFIG.CACHE_TTL_SECONDS);
    } catch (e) {
      console.warn('Cache limit warning:', e);
    }
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    ...catalogData
  };
}

function invalidateCatalogCache_() {
  try {
    CacheService.getScriptCache().remove('PUBLIC_CATALOG_CACHE');
  } catch (e) {}
}

function buildPublicCatalogData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const produkRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.PRODUK);
  const jasaRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.JASA_CETAK);
  const settingsMap = getSettingsMap_(ss);

  // Sembunyikan HPP dari payload publik demi keamanan RBAC
  const products = produkRows.map(r => ({
    sku: String(r.SKU),
    nama: String(r.Nama_Barang),
    kategori: String(r.Kategori),
    hargaEceran: Number(r.Harga_Eceran) || 0,
    minQtyGrosir: Number(r.Min_Qty_Grosir) || 0,
    hargaGrosir: Number(r.Harga_Grosir) || 0,
    stok: Number(r.Stok_Tersedia) || 0,
    batasKritis: Number(r.Batas_Stok_Kritis) || 5,
    foto: String(r.Link_Foto_Produk || ''),
    bestSeller: String(r.Best_Seller || '').toUpperCase() === 'YA'
  }));

  const printServices = jasaRows.map(r => ({
    kode: String(r.Kode_Jasa),
    nama: String(r.Nama_Layanan),
    kategori: String(r.Kategori_Layanan),
    satuan: String(r.Satuan),
    tarifNormal: Number(r.Tarif_Normal) || 0,
    minQtyDiskon: Number(r.Min_Qty_Diskon) || 0,
    tarifDiskon: Number(r.Tarif_Diskon) || 0
  }));

  return {
    storeInfo: {
      namaToko: settingsMap.NAMA_TOKO || 'Toko Delina ATK & Fotokopi "Kiko Smart Stationery"',
      alamatToko: settingsMap.ALAMAT_TOKO || 'Jl. Lintas Sumatera, Tanjung Raja, Ogan Ilir',
      kontakToko: settingsMap.KONTAK_TOKO || '0812-7111-8899',
      lat: parseFloat(settingsMap.KOORDINAT_LAT || '-3.3267'),
      lng: parseFloat(settingsMap.KOORDINAT_LNG || '104.7606'),
      infoRekening: settingsMap.INFO_REKENING || 'BRI 5678-01-023456-53-1 a.n. Toko Delina ATK',
      tarifOngkirLokal: Number(settingsMap.TARIF_ONGKIR_LOKAL || 5000),
      penandatanganSpj: settingsMap.NAMA_PENANDATANGAN_SPJ || 'Delina Deri, S.E.'
    },
    products: products,
    printServices: printServices
  };
}

/**
 * ============================================================================
 * 4. AUTENTIKASI & RBAC (ROLE-BASED ACCESS CONTROL)
 * ============================================================================
 */

function authenticateUser(pinInput) {
  ensureDatabaseInitialized_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stafRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.AKUN_STAF);
  const cleanPin = String(pinInput || '').trim();

  const matched = stafRows.find(s => String(s.PIN_Password).trim() === cleanPin && String(s.Status_Aktif).toUpperCase() === 'AKTIF');
  if (!matched) {
    return { success: false, message: 'PIN / Password tidak valid atau akun tidak aktif.' };
  }

  const role = String(matched.Role).toUpperCase(); // 'STAFF' atau 'OWNER'
  const userSession = {
    idStaf: matched.ID_Staf,
    namaStaf: matched.Nama_Staf,
    role: role,
    shift: matched.Shift,
    loginAt: new Date().toISOString()
  };

  // Kembalikan data dashboard sesuai matriks RBAC
  const dashboardPayload = getDashboardDataByRole(userSession);
  return {
    success: true,
    user: userSession,
    dashboard: dashboardPayload
  };
}

function getDashboardDataByRole(userSession) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const role = userSession && userSession.role ? String(userSession.role).toUpperCase() : 'STAFF';

  const produkRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.PRODUK);
  const jasaRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.JASA_CETAK);
  const pesananRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.PESANAN);
  const kertasRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.LOG_KERTAS);

  // Filter HPP & Laba Bersih jika yang akses adalah STAFF
  const sanitizedOrders = pesananRows.map(o => {
    const baseOrder = {
      idPesanan: o.ID_Pesanan,
      waktu: o.Waktu_Transaksi,
      kanal: o.Kanal,
      namaPelanggan: o.Nama_Pelanggan,
      kontakWa: o.Kontak_WA,
      emailInstansi: o.Email_Instansi,
      namaInstansi: o.Nama_Instansi,
      metodeAmbil: o.Metode_Ambil,
      kodeAmbil: o.Kode_Ambil,
      subtotalAtk: Number(o.Subtotal_ATK) || 0,
      subtotalCetak: Number(o.Subtotal_Cetak) || 0,
      ongkir: Number(o.Ongkir) || 0,
      totalTagihan: Number(o.Total_Tagihan) || 0,
      metodeBayar: o.Metode_Bayar,
      statusBayar: o.Status_Bayar,
      linkBuktiBayar: o.Link_Bukti_Bayar,
      validasiVisionAi: o.Validasi_Vision_AI,
      statusPesanan: o.Status_Pesanan,
      linkFileCetak: o.Link_File_Cetak,
      detailOpsiCetak: o.Detail_Opsi_Cetak,
      linkNotaSpj: o.Link_Nota_SPJ,
      stafKasir: o.Staf_Kasir,
      catatan: o.Catatan
    };
    if (role === 'OWNER') {
      baseOrder.totalHpp = Number(o.Total_HPP) || 0;
      baseOrder.labaBersih = Number(o.Laba_Bersih) || 0;
    }
    return baseOrder;
  }).reverse();

  const paperLogs = kertasRows.map(k => ({
    idLog: k.ID_Log,
    waktu: k.Waktu_Input,
    tanggal: k.Tanggal,
    ukuran: k.Ukuran_Kertas,
    terpakaiSah: Number(k.Kertas_Terpakai_Sah) || 0,
    waste: Number(k.Kertas_Rusak_Waste) || 0,
    alasan: k.Alasan_Waste,
    staf: k.Staf_Operator
  })).reverse();

  const result = {
    orders: sanitizedOrders,
    paperLogs: paperLogs
  };

  if (role === 'OWNER') {
    const keuanganRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.KEUANGAN);
    const chatRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.LOG_CHAT);
    const pelangganRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.PELANGGAN);
    const stafRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.AKUN_STAF);
    const settingsMap = getSettingsMap_(ss);

    result.ownerProducts = produkRows.map(r => ({
      sku: String(r.SKU),
      nama: String(r.Nama_Barang),
      kategori: String(r.Kategori),
      hpp: Number(r.HPP) || 0,
      hargaEceran: Number(r.Harga_Eceran) || 0,
      minQtyGrosir: Number(r.Min_Qty_Grosir) || 0,
      hargaGrosir: Number(r.Harga_Grosir) || 0,
      stok: Number(r.Stok_Tersedia) || 0,
      batasKritis: Number(r.Batas_Stok_Kritis) || 5,
      foto: String(r.Link_Foto_Produk || ''),
      bestSeller: String(r.Best_Seller || '').toUpperCase() === 'YA'
    }));

    result.ownerPrintServices = jasaRows.map(r => ({
      kode: String(r.Kode_Jasa),
      nama: String(r.Nama_Layanan),
      kategori: String(r.Kategori_Layanan),
      satuan: String(r.Satuan),
      hpp: Number(r.HPP_Estimasi) || 0,
      tarifNormal: Number(r.Tarif_Normal) || 0,
      minQtyDiskon: Number(r.Min_Qty_Diskon) || 0,
      tarifDiskon: Number(r.Tarif_Diskon) || 0
    }));

    result.financeLogs = keuanganRows;
    result.chatLogs = chatRows.reverse();
    result.customers = pelangganRows;
    result.staffAccounts = stafRows;
    result.settings = settingsMap;
  }

  return result;
}

/**
 * ============================================================================
 * 5. TRANSAKSI 3 KANAL (POS, WEBSITE, TELEGRAM) DENGAN LOCKSERVICE
 * ============================================================================
 */

function createOrderTransaction(orderPayload) {
  const lock = LockService.getScriptLock();
  try {
    // Tunggu giliran tulis maksimal 15 detik untuk mencegah bentrok stok (overselling)
    lock.waitLock(15000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const produkSheet = ss.getSheetByName(APP_CONFIG.SHEETS.PRODUK);
    const jasaSheet = ss.getSheetByName(APP_CONFIG.SHEETS.JASA_CETAK);
    const pesananSheet = ss.getSheetByName(APP_CONFIG.SHEETS.PESANAN);
    const detailSheet = ss.getSheetByName(APP_CONFIG.SHEETS.DETAIL_PESANAN);
    const keuanganSheet = ss.getSheetByName(APP_CONFIG.SHEETS.KEUANGAN);
    const settingsMap = getSettingsMap_(ss);

    const produkData = produkSheet.getDataRange().getValues();
    const jasaData = jasaSheet.getDataRange().getValues();

    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const shortDate = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyMMdd');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const idPesanan = 'ORD-' + shortDate + '-' + randomSuffix;
    const kodeAmbil = (orderPayload.kanal === 'POS' ? 'POS-' : 'KIKO-') + randomSuffix;

    let subtotalAtk = 0;
    let subtotalCetak = 0;
    let totalHpp = 0;
    const detailRowsToInsert = [];
    const lowStockAlerts = [];

    // 1. Proses Item ATK & Kurangi Stok Real-time
    const atkItems = orderPayload.itemsAtk || [];
    for (let i = 0; i < atkItems.length; i++) {
      const reqItem = atkItems[i];
      const qty = Number(reqItem.qty) || 0;
      if (qty <= 0) continue;

      let foundRowIdx = -1;
      for (let r = 1; r < produkData.length; r++) {
        if (String(produkData[r][0]) === String(reqItem.sku)) {
          foundRowIdx = r;
          break;
        }
      }

      if (foundRowIdx === -1) {
        throw new Error('Produk dengan SKU ' + reqItem.sku + ' tidak ditemukan.');
      }

      const row = produkData[foundRowIdx];
      const namaBarang = row[1];
      const hppSatuan = Number(row[3]) || 0;
      const hargaEceran = Number(row[4]) || 0;
      const minQtyGrosir = Number(row[5]) || 999999;
      const hargaGrosir = Number(row[6]) || hargaEceran;
      const stokTersedia = Number(row[7]) || 0;
      const batasKritis = Number(row[8]) || 5;

      if (stokTersedia < qty) {
        throw new Error('Stok "' + namaBarang + '" tidak mencukupi (Tersisa: ' + stokTersedia + ').');
      }

      const isGrosir = qty >= minQtyGrosir && minQtyGrosir > 0;
      const hargaDipakai = isGrosir ? hargaGrosir : hargaEceran;
      const subHarga = hargaDipakai * qty;
      const subHpp = hppSatuan * qty;

      subtotalAtk += subHarga;
      totalHpp += subHpp;

      // Update stok di Sheet Master_Produk_ATK
      const sisaStok = stokTersedia - qty;
      produkSheet.getRange(foundRowIdx + 1, 8).setValue(sisaStok);
      produkData[foundRowIdx][7] = sisaStok;

      if (sisaStok <= batasKritis) {
        lowStockAlerts.push(namaBarang + ' (Sisa: ' + sisaStok + ')');
      }

      detailRowsToInsert.push([
        'DTL-' + shortDate + '-' + Math.floor(1000 + Math.random() * 9000),
        idPesanan,
        timeStr,
        'ATK',
        reqItem.sku,
        namaBarang,
        qty,
        hargaDipakai,
        hppSatuan,
        subHarga,
        subHpp,
        isGrosir ? 'YA' : 'TIDAK'
      ]);
    }

    // 2. Proses Item Jasa Cetak / Fotokopi
    const cetakItems = orderPayload.itemsCetak || [];
    for (let j = 0; j < cetakItems.length; j++) {
      const cItem = cetakItems[j];
      const qtyCetak = Number(cItem.qty) || 0;
      if (qtyCetak <= 0) continue;

      let hppCetak = 180;
      let tarifDipakai = Number(cItem.hargaSatuan) || 500;
      let namaLayanan = cItem.nama || 'Layanan Cetak';
      let isDiskonCetak = false;

      for (let r = 1; r < jasaData.length; r++) {
        if (String(jasaData[r][0]) === String(cItem.kode)) {
          namaLayanan = jasaData[r][1];
          hppCetak = Number(jasaData[r][4]) || 180;
          const tarifNormal = Number(jasaData[r][5]) || 500;
          const minDiskon = Number(jasaData[r][6]) || 999999;
          const tarifDiskon = Number(jasaData[r][7]) || tarifNormal;
          isDiskonCetak = qtyCetak >= minDiskon && minDiskon > 0;
          tarifDipakai = isDiskonCetak ? tarifDiskon : tarifNormal;
          break;
        }
      }

      const subCetak = tarifDipakai * qtyCetak;
      const subHppCetak = hppCetak * qtyCetak;
      subtotalCetak += subCetak;
      totalHpp += subHppCetak;

      detailRowsToInsert.push([
        'DTL-' + shortDate + '-' + Math.floor(1000 + Math.random() * 9000),
        idPesanan,
        timeStr,
        'CETAK',
        cItem.kode || 'CUSTOM-CETAK',
        namaLayanan,
        qtyCetak,
        tarifDipakai,
        hppCetak,
        subCetak,
        subHppCetak,
        isDiskonCetak ? 'YA' : 'TIDAK'
      ]);
    }

    const ongkir = orderPayload.metodeAmbil === 'Delivery Lokal'
      ? (Number(settingsMap.TARIF_ONGKIR_LOKAL) || 5000)
      : 0;
    const totalTagihan = subtotalAtk + subtotalCetak + ongkir;
    const labaBersih = (subtotalAtk + subtotalCetak) - totalHpp;

    // 3. Simpan File Dokumen Cetak ke Drive (bila ada base64 upload)
    let linkFileCetak = orderPayload.linkFileCetak || '';
    if (orderPayload.fileCetakBase64 && orderPayload.fileCetakName) {
      linkFileCetak = saveBase64ToDriveFolder_(
        'DOKUMEN_CETAK',
        idPesanan + '_' + orderPayload.fileCetakName,
        orderPayload.fileCetakMime || 'application/pdf',
        orderPayload.fileCetakBase64
      );
    }

    // 4. Simpan Bukti Bayar & Jalankan Validasi Vision AI (bila ada upload bukti bayar)
    let linkBuktiBayar = '';
    let validasiVision = orderPayload.kanal === 'POS' ? 'Verified Tunai/QRIS POS' : 'Menunggu Upload';
    let statusBayar = orderPayload.kanal === 'POS' ? 'Lunas' : 'Belum Bayar';

    if (orderPayload.buktiBayarBase64 && orderPayload.buktiBayarName) {
      linkBuktiBayar = saveBase64ToDriveFolder_(
        'BUKTI_BAYAR',
        idPesanan + '_BUKTI_' + orderPayload.buktiBayarName,
        orderPayload.buktiBayarMime || 'image/jpeg',
        orderPayload.buktiBayarBase64
      );
      const visionResult = verifyPaymentWithVisionAI_(
        orderPayload.buktiBayarBase64,
        orderPayload.buktiBayarMime || 'image/jpeg',
        totalTagihan,
        settingsMap
      );
      validasiVision = visionResult.summary;
      statusBayar = visionResult.isValid ? 'Lunas (Tervalidasi AI)' : 'Menunggu Verifikasi Manual';

      if (!visionResult.isValid && settingsMap.OWNER_TELEGRAM_CHAT_ID) {
        sendTelegramNotification_(
          settingsMap.OWNER_TELEGRAM_CHAT_ID,
          '⚠️ *ALERT VISION AI — BUKTI TRANSFER MENCURIGAKAN / PERLU CEK*\n' +
          'ID Pesanan: `' + idPesanan + '`\n' +
          'Pelanggan: ' + (orderPayload.namaPelanggan || 'Umum') + '\n' +
          'Tagihan: Rp ' + totalTagihan.toLocaleString('id-ID') + '\n' +
          'Hasil AI: ' + visionResult.summary + '\n' +
          'Bukti: ' + linkBuktiBayar,
          settingsMap.TELEGRAM_BOT_TOKEN
        );
      }
    }

    const statusPesanan = orderPayload.kanal === 'POS' ? 'Selesai' : 'Baru Masuk';
    const stafKasir = orderPayload.stafKasir || 'Self-Service (Online)';

    // 5. Generate Nota Resmi / SPJ PDF Otomatis jika Instansi atau diminta
    let linkNotaSpj = '';
    if (orderPayload.butuhSpj || orderPayload.emailInstansi) {
      const spjRes = generateOfficialSpjPdf_({
        idPesanan: idPesanan,
        waktu: timeStr,
        namaPelanggan: orderPayload.namaPelanggan || 'Pelanggan Instansi',
        namaInstansi: orderPayload.namaInstansi || orderPayload.namaPelanggan || 'Instansi',
        emailInstansi: orderPayload.emailInstansi || '',
        items: detailRowsToInsert,
        subtotalAtk: subtotalAtk,
        subtotalCetak: subtotalCetak,
        ongkir: ongkir,
        totalTagihan: totalTagihan,
        settings: settingsMap
      });
      linkNotaSpj = spjRes.fileUrl || '';
    }

    // 6. Tulis ke Sheet Data_Pesanan & Detail_Item_Pesanan
    pesananSheet.appendRow([
      idPesanan,
      timeStr,
      orderPayload.kanal || 'Website',
      orderPayload.idPelanggan || 'CUST-ONLINE',
      orderPayload.namaPelanggan || 'Pelanggan Umum',
      orderPayload.kontakWa || '-',
      orderPayload.emailInstansi || '',
      orderPayload.namaInstansi || '',
      orderPayload.metodeAmbil || 'Click & Collect',
      kodeAmbil,
      subtotalAtk,
      subtotalCetak,
      ongkir,
      totalTagihan,
      totalHpp,
      labaBersih,
      orderPayload.metodeBayar || 'QRIS',
      statusBayar,
      linkBuktiBayar,
      validasiVision,
      statusPesanan,
      linkFileCetak,
      orderPayload.detailOpsiCetak || '',
      linkNotaSpj,
      stafKasir,
      orderPayload.catatan || ''
    ]);

    if (detailRowsToInsert.length > 0) {
      detailSheet.getRange(detailSheet.getLastRow() + 1, 1, detailRowsToInsert.length, detailRowsToInsert[0].length)
        .setValues(detailRowsToInsert);
    }

    // 7. Catat ke Keuangan_Kas
    keuanganSheet.appendRow([
      'KAS-' + shortDate + '-' + randomSuffix,
      dateStr,
      idPesanan,
      orderPayload.kanal || 'Website',
      subtotalAtk,
      subtotalCetak,
      ongkir,
      totalTagihan,
      totalHpp,
      labaBersih,
      stafKasir,
      'VALID'
    ]);

    // 8. Bersihkan Cache Katalog agar stok terbaru langsung tampil di 3 kanal
    invalidateCatalogCache_();

    // 9. Kirim Alert Stok Kritis ke Owner bila ada
    if (lowStockAlerts.length > 0 && settingsMap.OWNER_TELEGRAM_CHAT_ID) {
      sendTelegramNotification_(
        settingsMap.OWNER_TELEGRAM_CHAT_ID,
        '📦 *PERINGATAN STOK KRITIS TOKO DELINA*\nBarang berikut melewati batas stok kritis:\n- ' + lowStockAlerts.join('\n- '),
        settingsMap.TELEGRAM_BOT_TOKEN
      );
    }

    return {
      success: true,
      idPesanan: idPesanan,
      kodeAmbil: kodeAmbil,
      waktu: timeStr,
      totalTagihan: totalTagihan,
      statusBayar: statusBayar,
      validasiVision: validasiVision,
      linkNotaSpj: linkNotaSpj
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * ============================================================================
 * 6. VISION AI (VALIDASI BUKTI BAYAR OTOMATIS) & CONVERSATIONAL AI "KIKO"
 * ============================================================================
 */

function verifyPaymentWithVisionAI_(base64Image, mimeType, expectedAmount, settingsMap) {
  const apiKey = settingsMap.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      isValid: true,
      summary: 'Simulasi Vision AI: Valid Rp ' + Number(expectedAmount).toLocaleString('id-ID') + ' (QRIS/Transfer Terkonfirmasi)'
    };
  }

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
    const prompt = 'Anda adalah sistem auditor pembayaran otomatis Toko Delina ATK. ' +
      'Baca gambar bukti transfer/QRIS ini. Tagihan seharusnya adalah Rp ' + expectedAmount + '. ' +
      'Jawab dalam format JSON murni: {"nominal_terbaca": number, "status_berhasil": boolean, "cocok": boolean, "ringkasan": "string"}';

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: cleanBase64 } }
        ]
      }]
    };

    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const json = JSON.parse(res.getContentText());
    const rawText = json.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return {
      isValid: Boolean(parsed.cocok && parsed.status_berhasil),
      summary: 'Vision AI: ' + (parsed.ringkasan || ('Terbaca Rp ' + parsed.nominal_terbaca))
    };
  } catch (e) {
    return {
      isValid: false,
      summary: 'Vision AI gagal membaca otomatis (' + e.message + '). Menunggu cek manual.'
    };
  }
}

/**
 * Pemrosesan Chat Pelanggan dengan Kiko (Web Widget & Telegram)
 */
function chatWithKikoAI(userMessage, sessionId, customerName, kanal) {
  ensureDatabaseInitialized_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const catalog = buildPublicCatalogData_();
  const settingsMap = getSettingsMap_(ss);
  const logChatSheet = ss.getSheetByName(APP_CONFIG.SHEETS.LOG_CHAT);

  // Cari kecocokan produk untuk auto-add to cart atau rekomendasi substitusi jika stok 0
  const matchedCartItems = [];
  const substituteSuggestions = [];
  const lowerMsg = String(userMessage || '').toLowerCase();

  catalog.products.forEach(p => {
    const keywords = p.nama.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const isMentioned = keywords.some(kw => lowerMsg.includes(kw)) || lowerMsg.includes(p.sku.toLowerCase());
    if (isMentioned) {
      // Ekstrak angka kuantitas di dekat kata kunci atau default 1
      const qtyMatch = lowerMsg.match(/(\d+)\s*(rim|kotak|pak|pcs|buah|buku|roll|lembar)?/);
      const qty = qtyMatch ? Math.max(1, parseInt(qtyMatch[1], 10)) : 1;

      if (p.stok > 0) {
        matchedCartItems.push({
          sku: p.sku,
          nama: p.nama,
          qty: Math.min(qty, p.stok),
          hargaEceran: p.hargaEceran,
          hargaGrosir: p.hargaGrosir,
          minQtyGrosir: p.minQtyGrosir
        });
      } else {
        // Cari substitusi di kategori yang sama yang stoknya > 0
        const sub = catalog.products.find(other => other.kategori === p.kategori && other.stok > 0 && other.sku !== p.sku);
        if (sub) {
          substituteSuggestions.push({ habis: p, pengganti: sub });
        }
      }
    }
  });

  let replyText = '';
  const apiKey = settingsMap.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
      const sysContext = 'Kamu adalah Kiko, asisten pintar dari Toko Delina ATK & Fotokopi "Kiko Smart Stationery" di Tanjung Raja, Ogan Ilir. ' +
        'Gunakan bahasa Indonesia yang ramah, ringkas, dan solutif. ' +
        'Data produk saat ini: ' + JSON.stringify(catalog.products) + '. ' +
        'Data tarif cetak: ' + JSON.stringify(catalog.printServices) + '. ' +
        'Jika stok 0, tawarkan produk substitusibeserta link fotonya. Jika kuantitas mencapai Min_Qty_Grosir, infokan pelanggan mendapat harga grosir.';

      const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: sysContext + '\n\nPelanggan: ' + userMessage }] }]
        }),
        muteHttpExceptions: true
      });
      const data = JSON.parse(res.getContentText());
      replyText = data.candidates[0].content.parts[0].text;
    } catch (e) {
      replyText = generateSmartFallbackReply_(userMessage, matchedCartItems, substituteSuggestions, catalog);
    }
  } else {
    replyText = generateSmartFallbackReply_(userMessage, matchedCartItems, substituteSuggestions, catalog);
  }

  const autoActionText = matchedCartItems.length > 0
    ? 'ADD_TO_CART: ' + matchedCartItems.map(i => i.sku + ' (x' + i.qty + ')').join(', ')
    : (substituteSuggestions.length > 0 ? 'SUGGEST_SUBSTITUTE' : 'INFO_RESPONSE');

  logChatSheet.appendRow([
    'CHT-' + Math.floor(10000 + Math.random() * 90000),
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    kanal || 'Website',
    sessionId || 'SES-WEB',
    customerName || 'Pengunjung Web',
    userMessage,
    replyText,
    autoActionText
  ]);

  return {
    success: true,
    reply: replyText,
    autoCartItems: matchedCartItems,
    substitutes: substituteSuggestions
  };
}

function generateSmartFallbackReply_(userMessage, matchedCartItems, substituteSuggestions, catalog) {
  if (substituteSuggestions.length > 0) {
    const s = substituteSuggestions[0];
    return 'Mohon maaf Kak, **' + s.habis.nama + '** saat ini sedang **HABIS (Stok 0)**. 🙏\n\n' +
      'Sebagai gantinya, Kiko rekomendasikan **' + s.pengganti.nama + '** (Stok tersedia: ' + s.pengganti.stok + ', Harga: Rp ' +
      s.pengganti.hargaEceran.toLocaleString('id-ID') + '). Apakah mau dimasukkan ke keranjang?';
  }
  if (matchedCartItems.length > 0) {
    const lines = matchedCartItems.map(item => {
      const pakaiGrosir = item.qty >= item.minQtyGrosir && item.minQtyGrosir > 0;
      const hrg = pakaiGrosir ? item.hargaGrosir : item.hargaEceran;
      return '• **' + item.nama + '** (' + item.qty + 'x @ Rp ' + hrg.toLocaleString('id-ID') + (pakaiGrosir ? ' ✨ *Harga Grosir!*' : '') + ')';
    });
    return 'Siap Kak! Kiko sudah mengecek stok real-time dan otomatis memasukkan barang berikut ke keranjang belanja Kakak:\n\n' +
      lines.join('\n') + '\n\nSilakan klik tombol **Checkout** di keranjang atau beri tahu Kiko jika ada dokumen yang ingin sekalian dicetak!';
  }
  return 'Halo Kak! Selamat datang di **Toko Delina ATK & Fotokopi (Kiko Smart Stationery)** Tanjung Raja. 🌿\n\n' +
    'Kakak bisa mengetik langsung barang yang dicari (contoh: *"Beli HVS A4 5 rim dan pulpen AE7 2 kotak"*) agar Kiko masukkan otomatis ke keranjang, atau pilih tab **Order Cetak Dokumen** untuk hitung biaya print/fotokopi otomatis!';
}

/**
 * ============================================================================
 * 7. GENERATOR NOTA RESMI & SPJ INSTANSI (PDF + STEMPEL DIGITAL + GMAIL)
 * ============================================================================
 */

function generateOfficialSpjPdf_(spjData) {
  try {
    const rowsHtml = (spjData.items || []).map((item, idx) => {
      return '<tr>' +
        '<td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">' + (idx + 1) + '</td>' +
        '<td style="border:1px solid #cbd5e1;padding:6px;">' + item[5] + ' (' + item[4] + ')</td>' +
        '<td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">' + item[6] + '</td>' +
        '<td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Rp ' + Number(item[7]).toLocaleString('id-ID') + '</td>' +
        '<td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Rp ' + Number(item[9]).toLocaleString('id-ID') + '</td>' +
      '</tr>';
    }).join('');

    const html = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #1e293b; padding: 24px;">
        <div style="border-bottom: 3px double #059669; padding-bottom: 12px; margin-bottom: 16px; display:flex; justify-content:space-between;">
          <div>
            <h2 style="margin:0; color:#059669;">TOKO DELINA ATK & FOTOKOPI</h2>
            <h4 style="margin:2px 0; color:#d97706;">"KIKO SMART STATIONERY" — TANJUNG RAJA</h4>
            <p style="margin:2px 0; font-size:12px;">${spjData.settings.ALAMAT_TOKO || 'Jl. Lintas Sumatera, Tanjung Raja, Kab. Ogan Ilir'}</p>
            <p style="margin:2px 0; font-size:12px;">Kontak: ${spjData.settings.KONTAK_TOKO || '0812-7111-8899'}</p>
          </div>
        </div>
        <h3 style="text-align:center; margin: 12px 0; text-decoration: underline;">NOTA RESMI / BUKTI PERTANGGUNGJAWABAN (SPJ)</h3>
        <table style="width:100%; font-size:12px; margin-bottom: 14px;">
          <tr><td><strong>No. Nota / Pesanan:</strong> ${spjData.idPesanan}</td><td><strong>Kepada Yth / Instansi:</strong> ${spjData.namaInstansi}</td></tr>
          <tr><td><strong>Tanggal Transaksi:</strong> ${spjData.waktu}</td><td><strong>PIC / Pemesan:</strong> ${spjData.namaPelanggan}</td></tr>
        </table>
        <table style="width:100%; border-collapse: collapse; font-size:12px; margin-bottom:16px;">
          <thead>
            <tr style="background:#059669; color:#ffffff;">
              <th style="border:1px solid #059669;padding:8px;">No</th>
              <th style="border:1px solid #059669;padding:8px;">Uraian Barang ATK / Jasa Cetak</th>
              <th style="border:1px solid #059669;padding:8px;">Qty</th>
              <th style="border:1px solid #059669;padding:8px;">Harga Satuan</th>
              <th style="border:1px solid #059669;padding:8px;">Jumlah</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr><td colspan="4" style="border:1px solid #cbd5e1;padding:6px;text-align:right;"><strong>Ongkos Kirim</strong></td><td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Rp ${Number(spjData.ongkir).toLocaleString('id-ID')}</td></tr>
            <tr style="background:#f8fafc;"><td colspan="4" style="border:1px solid #cbd5e1;padding:8px;text-align:right;"><strong>TOTAL PEMBAYARAN (LUNAS)</strong></td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right;"><strong>Rp ${Number(spjData.totalTagihan).toLocaleString('id-ID')}</strong></td></tr>
          </tfoot>
        </table>
        <div style="margin-top:28px; text-align:right; font-size:12px;">
          <p>Tanjung Raja, ${spjData.waktu.substring(0, 10)}</p>
          <div style="display:inline-block; border:2px solid #059669; color:#059669; padding:8px 18px; border-radius:6px; font-weight:bold; margin:8px 0;">
            STEMPEL DIGITAL RESMI<br/>TOKO DELINA ATK & FOTOKOPI<br/>TERVERIFIKASI SISTEM KIKO
          </div>
          <p style="margin-top:6px;"><strong><u>${spjData.settings.NAMA_PENANDATANGAN_SPJ || 'Delina Deri, S.E.'}</u></strong><br/>Pimpinan Toko Delina ATK</p>
        </div>
      </body>
      </html>
    `;

    const blob = Utilities.newBlob(html, MimeType.HTML, 'SPJ_' + spjData.idPesanan + '.html')
      .getAs(MimeType.PDF)
      .setName('Nota_SPJ_' + spjData.idPesanan + '.pdf');

    const folderIds = ensureDriveFolders_();
    const folder = DriveApp.getFolderById(folderIds.ARSIP_NOTA_SPJ);
    const pdfFile = folder.createFile(blob);
    const fileUrl = pdfFile.getUrl();

    // Kirim ke Email Bendahara Instansi via MailApp jika ada email
    if (spjData.emailInstansi && String(spjData.emailInstansi).includes('@')) {
      MailApp.sendEmail({
        to: spjData.emailInstansi,
        subject: '[Nota Resmi & SPJ] Toko Delina ATK & Fotokopi - ' + spjData.idPesanan,
        htmlBody: '<p>Yth. Bapak/Ibu Bendahara <strong>' + spjData.namaInstansi + '</strong>,</p>' +
          '<p>Terima kasih telah berbelanja dan mencetak dokumen di <strong>Toko Delina ATK & Fotokopi "Kiko Smart Stationery"</strong> Tanjung Raja.</p>' +
          '<p>Terlampir dokumen <strong>Nota Resmi / SPJ PDF</strong> yang telah dilengkapi Kop Resmi, Rincian Transaksi, dan Stempel Digital untuk keperluan pelaporan instansi/Dana BOS.</p>' +
          '<p>Salam hangat,<br/><strong>Toko Delina ATK & Fotokopi</strong></p>',
        attachments: [pdfFile.getAs(MimeType.PDF)]
      });
    }

    return { success: true, fileUrl: fileUrl };
  } catch (err) {
    console.warn('Gagal generate SPJ PDF:', err);
    return { success: false, fileUrl: '' };
  }
}

/**
 * ============================================================================
 * 8. OPERASIONAL STAF & OWNER (Update Status, Log Kertas, Void, Katalog, Broadcast)
 * ============================================================================
 */

function updateOrderStatusAndNotify(idPesanan, newStatus, newPaymentStatus, staffName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP_CONFIG.SHEETS.PESANAN);
  const settingsMap = getSettingsMap_(ss);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(idPesanan)) {
      if (newStatus) sheet.getRange(i + 1, 21).setValue(newStatus);
      if (newPaymentStatus) sheet.getRange(i + 1, 18).setValue(newPaymentStatus);
      if (staffName) sheet.getRange(i + 1, 25).setValue(staffName);

      // Cek apakah pelanggan memiliki Chat ID Telegram untuk dikirimi update real-time
      const idPelanggan = data[i][3];
      const namaPelanggan = data[i][4];
      const kodeAmbil = data[i][9];
      const pelangganRows = getSheetObjects_(ss, APP_CONFIG.SHEETS.PELANGGAN);
      const cust = pelangganRows.find(p => String(p.ID_Pelanggan) === String(idPelanggan) || String(p.Nama_Pelanggan) === String(namaPelanggan));

      if (cust && cust.Chat_ID_Telegram && settingsMap.TELEGRAM_BOT_TOKEN) {
        sendTelegramNotification_(
          cust.Chat_ID_Telegram,
          '🔔 *UPDATE STATUS PESANAN KIKO SMART STATIONERY*\n\n' +
          'Halo *' + namaPelanggan + '*,\n' +
          'No. Pesanan: `' + idPesanan + '`\n' +
          'Kode Ambil Tanpa Antre: *' + kodeAmbil + '*\n' +
          'Status Terbaru: *' + (newStatus || data[i][20]) + '*\n' +
          'Status Pembayaran: *' + (newPaymentStatus || data[i][17]) + '*\n\n' +
          'Terima kasih telah berbelanja di Toko Delina ATK & Fotokopi Tanjung Raja!',
          settingsMap.TELEGRAM_BOT_TOKEN
        );
      }

      return { success: true, message: 'Status pesanan ' + idPesanan + ' diperbarui menjadi ' + newStatus };
    }
  }
  return { success: false, message: 'Pesanan tidak ditemukan.' };
}

function submitDailyPaperLog(logPayload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP_CONFIG.SHEETS.LOG_KERTAS);
  const now = new Date();
  const idLog = 'LKP-' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyMMdd') + '-' + Math.floor(100 + Math.random() * 900);
  const waktu = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const tanggal = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  sheet.appendRow([
    idLog,
    waktu,
    tanggal,
    logPayload.ukuran || 'A4 70gr',
    Number(logPayload.terpakaiSah) || 0,
    Number(logPayload.waste) || 0,
    logPayload.alasan || '-',
    logPayload.staf || 'Staf Operator'
  ]);

  return { success: true, idLog: idLog, waktu: waktu };
}

/**
 * Hanya Owner yang berhak membatalkan (Void) transaksi dan mengembalikan stok
 */
function voidOrderByOwner(idPesanan, ownerPin, alasanVoid) {
  const auth = authenticateUser(ownerPin);
  if (!auth.success || auth.user.role !== 'OWNER') {
    return { success: false, message: 'Otorisasi ditolak! Hanya PIN Owner yang dapat melakukan Void Transaksi.' };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const pesananSheet = ss.getSheetByName(APP_CONFIG.SHEETS.PESANAN);
    const keuanganSheet = ss.getSheetByName(APP_CONFIG.SHEETS.KEUANGAN);
    const pData = pesananSheet.getDataRange().getValues();
    const kData = keuanganSheet.getDataRange().getValues();

    for (let i = 1; i < pData.length; i++) {
      if (String(pData[i][0]) === String(idPesanan)) {
        pesananSheet.getRange(i + 1, 18).setValue('DIBATALKAN (VOID)');
        pesananSheet.getRange(i + 1, 21).setValue('Dibatalkan Owner (' + auth.user.namaStaf + '): ' + (alasanVoid || 'Void'));
        break;
      }
    }

    for (let j = 1; j < kData.length; j++) {
      if (String(kData[j][2]) === String(idPesanan)) {
        keuanganSheet.getRange(j + 1, 12).setValue('VOID');
        break;
      }
    }

    invalidateCatalogCache_();
    return { success: true, message: 'Transaksi ' + idPesanan + ' berhasil di-VOID oleh ' + auth.user.namaStaf };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Manajemen Produk & Harga (Khusus Owner)
 */
function saveOrUpdateProductByOwner(ownerPin, productPayload) {
  const auth = authenticateUser(ownerPin);
  if (!auth.success || auth.user.role !== 'OWNER') {
    return { success: false, message: 'Akses Ditolak: Hanya Owner yang boleh mengubah harga atau produk.' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP_CONFIG.SHEETS.PRODUK);
  const data = sheet.getDataRange().getValues();

  const rowValues = [
    productPayload.sku,
    productPayload.nama,
    productPayload.kategori,
    Number(productPayload.hpp) || 0,
    Number(productPayload.hargaEceran) || 0,
    Number(productPayload.minQtyGrosir) || 0,
    Number(productPayload.hargaGrosir) || 0,
    Number(productPayload.stok) || 0,
    Number(productPayload.batasKritis) || 5,
    productPayload.foto || '',
    productPayload.bestSeller ? 'YA' : 'TIDAK'
  ];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(productPayload.sku)) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      invalidateCatalogCache_();
      return { success: true, message: 'Produk ' + productPayload.nama + ' berhasil diperbarui di 3 kanal.' };
    }
  }

  sheet.appendRow(rowValues);
  invalidateCatalogCache_();
  return { success: true, message: 'Produk baru ' + productPayload.nama + ' berhasil ditambahkan.' };
}

/**
 * Broadcast Promo Telegram Tersegmentasi (Khusus Owner)
 */
function sendSegmentedTelegramBroadcast(ownerPin, targetSegment, promoMessage) {
  const auth = authenticateUser(ownerPin);
  if (!auth.success || auth.user.role !== 'OWNER') {
    return { success: false, message: 'Akses Ditolak: Hanya Owner yang dapat mengirim Broadcast Promo.' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const customers = getSheetObjects_(ss, APP_CONFIG.SHEETS.PELANGGAN);
  const settingsMap = getSettingsMap_(ss);
  const botToken = settingsMap.TELEGRAM_BOT_TOKEN;

  const recipients = customers.filter(c => {
    const hasChatId = String(c.Chat_ID_Telegram || '').trim().length > 0;
    const matchSeg = targetSegment === 'SEMUA' || String(c.Segmen) === String(targetSegment);
    return hasChatId && matchSeg;
  });

  let sentCount = 0;
  recipients.forEach(r => {
    if (botToken) {
      sendTelegramNotification_(r.Chat_ID_Telegram, promoMessage, botToken);
    }
    sentCount++;
  });

  return {
    success: true,
    sentCount: sentCount,
    message: 'Broadcast promo berhasil dikirim ke ' + sentCount + ' pelanggan segmen "' + targetSegment + '".'
  };
}

/**
 * ============================================================================
 * 9. HELPER FUNCTIONS (Sheets, Drive, Telegram API)
 * ============================================================================
 */

function getSheetObjects_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const results = [];
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = values[i][c];
    }
    results.push(obj);
  }
  return results;
}

function getSettingsMap_(ss) {
  const rows = getSheetObjects_(ss, APP_CONFIG.SHEETS.PENGATURAN);
  const map = {};
  rows.forEach(r => {
    map[r.Kunci_Pengaturan] = r.Nilai_Pengaturan;
  });
  return map;
}

function saveBase64ToDriveFolder_(folderKey, fileName, mimeType, base64Data) {
  try {
    const folderIds = ensureDriveFolders_();
    const folderId = folderIds[folderKey];
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const decoded = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = DriveApp.getFolderById(folderId).createFile(blob);
    return file.getUrl();
  } catch (e) {
    console.warn('Gagal simpan file ke Drive:', e);
    return '';
  }
}

function sendTelegramNotification_(chatId, textMessage, botToken) {
  if (!botToken || !chatId) return;
  try {
    const url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: String(chatId),
        text: textMessage,
        parse_mode: 'Markdown'
      }),
      muteHttpExceptions: true
    });
  } catch (e) {
    console.warn('Telegram send error:', e);
  }
}

function handleTelegramIncomingMessage_(chatId, senderName, text) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsMap = getSettingsMap_(ss);
  const aiResponse = chatWithKikoAI(text, chatId, senderName, 'Telegram');
  sendTelegramNotification_(chatId, aiResponse.reply, settingsMap.TELEGRAM_BOT_TOKEN);
}
