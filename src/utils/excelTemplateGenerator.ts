import * as XLSX from 'xlsx';
import { DAFTAR_KELAS, KelasSMK } from '../data/classList';
import { ParsedMemberRow, normalizeClass, detectJabatanDetails, generateBulkCredentials } from './bulkMemberParser';

/**
 * Utilitas untuk mengenerate Template Excel (.xlsx) Resmi
 * Digunakan oleh Pembina OSIS (Bapak Ilham Arief, S.Pd.) untuk input massal siswa pengurus OSIS
 */
export const downloadExcelTemplate = (namaSekolah: string = 'SMK TRIDHARMA GORONTALO') => {
  // 1. Data Sheet Utama (DATA_PENGURUS_OSIS)
  const headerRow1 = [`FORMULIR INPUT DATA MASSAL PENGURUS OSIS - ${namaSekolah.toUpperCase()}`];
  const headerRow2 = [
    'Petunjuk: Isi nama lengkap, NISN, pilih salah satu dari 7 kelas resmi, dan masukkan jabatan OSIS. Akun (Username & Password) akan dibuat otomatis oleh sistem.',
  ];
  const emptyRow: string[] = [];

  const tableHeaders = [
    'No',
    'Nama Lengkap',
    'NISN / NIS',
    'Kelas Resmi',
    'Jabatan OSIS',
    'Jenis Kelamin (L/P)',
    'Nomor WhatsApp / HP',
    'Catatan / Keterangan',
  ];

  // 7 Contoh Baris yang mewakili 7 kelas resmi SMK Tridharma
  const sampleData = [
    [1, 'Rahmat Hidayatullah', '0071234501', 'XI Askep', 'Koordinator Sekbid 1 (Ketaqwaan)', 'L', '081234567890', 'Aktif'],
    [2, 'Nurul Fadhilah', '0071234502', 'XI Farmasi', 'Anggota Sekbid 1 (Ketaqwaan)', 'P', '081234567891', 'Aktif'],
    [3, 'Bayu Pratama S.', '0071234503', 'X Askep 1', 'Koordinator Sekbid 3 (Bela Negara)', 'L', '081234567892', 'Aktif'],
    [4, 'Siti Azzahra Monoarfa', '0071234504', 'X Askep 2', 'Anggota Sekbid 4 (Seni & Olahraga)', 'P', '081234567893', 'Aktif'],
    [5, 'Fadlan Djafar', '0071234505', 'X Farmasi', 'Anggota Sekbid 8 (TIK & Multimedia)', 'L', '081234567894', 'Aktif'],
    [6, 'Nadia Syaputri', '0071234506', 'XII Askep', 'Koordinator Sekbid 7 (Kesehatan & UKS)', 'P', '081234567895', 'Aktif'],
    [7, 'Reza Aditya', '0071234507', 'XII Farmasi', 'Anggota Sekbid 6 (Kewirausahaan)', 'L', '081234567896', 'Aktif'],
    [8, 'Alifia Maharani', '0071234508', 'XI Askep', 'Sekretaris OSIS', 'P', '081234567897', 'BPH'],
    [9, 'Muh. Fahri Danial', '0071234509', 'XI Farmasi', 'Bendahara OSIS', 'L', '081234567898', 'BPH'],
    [10, '', '', '', '', '', '', ''],
    [11, '', '', '', '', '', '', ''],
    [12, '', '', '', '', '', '', ''],
    [13, '', '', '', '', '', '', ''],
    [14, '', '', '', '', '', '', ''],
    [15, '', '', '', '', '', '', ''],
  ];

  const mainSheetAoa = [
    headerRow1,
    headerRow2,
    emptyRow,
    tableHeaders,
    ...sampleData,
  ];

  const wsMain = XLSX.utils.aoa_to_sheet(mainSheetAoa);

  // Atur lebar kolom agar proporsional dan mudah dibaca
  wsMain['!cols'] = [
    { wch: 6 },  // No
    { wch: 28 }, // Nama Lengkap
    { wch: 16 }, // NISN
    { wch: 16 }, // Kelas Resmi
    { wch: 38 }, // Jabatan OSIS
    { wch: 18 }, // Jenis Kelamin
    { wch: 22 }, // No WhatsApp
    { wch: 20 }, // Catatan
  ];

  // 2. Data Sheet Referensi (REFERENSI_KELAS_DAN_JABATAN)
  const refHeaders = ['DAFTAR 7 KELAS RESMI SMK TRIDHARMA', 'KODE JURUSAN', 'KETERANGAN'];
  const refKelasData = [
    ['X Askep 1', 'ASKEP', 'Kelas 10 Asisten Keperawatan 1'],
    ['X Askep 2', 'ASKEP', 'Kelas 10 Asisten Keperawatan 2'],
    ['X Farmasi', 'FARMASI', 'Kelas 10 Farmasi Klinis'],
    ['XI Askep', 'ASKEP', 'Kelas 11 Asisten Keperawatan'],
    ['XI Farmasi', 'FARMASI', 'Kelas 11 Farmasi Klinis'],
    ['XII Askep', 'ASKEP', 'Kelas 12 Asisten Keperawatan'],
    ['XII Farmasi', 'FARMASI', 'Kelas 12 Farmasi Klinis'],
  ];

  const sekbidHeaders = ['', '', ''];
  const sekbidTitle = ['DAFTAR SEKSI BIDANG RESMI (SEKBID 1 - 8)', 'STATUS', 'PERAN TERSEDIA'];
  const sekbidData = [
    ['Sekbid 1: Pembinaan Ketaqwaan Terhadap Tuhan Yang Maha Esa', 'Aktif', 'Koordinator / Anggota'],
    ['Sekbid 2: Pembinaan Budi Pekerti Luhur & Karakter', 'Aktif', 'Koordinator / Anggota'],
    ['Sekbid 3: Pembinaan Kepribadian Unggul & Wawasan Kebangsaan', 'Aktif', 'Koordinator / Anggota'],
    ['Sekbid 4: Pembinaan Prestasi Akademik, Seni & Olahraga', 'Aktif', 'Koordinator / Anggota'],
    ['Sekbid 5: Pembinaan Demokrasi, HAM & Pendidikan Politik', 'Aktif', 'Koordinator / Anggota'],
    ['Sekbid 6: Pembinaan Kreativitas, Keterampilan & Kewirausahaan', 'Aktif', 'Koordinator / Anggota'],
    ['Sekbid 7: Pembinaan Kualitas Jasmani, Kesehatan & Lingkungan Hidup', 'Aktif', 'Koordinator / Anggota'],
    ['Sekbid 8: Pembinaan Persepsi, Apresiasi Seni & Teknologi Informasi', 'Aktif', 'Koordinator / Anggota'],
  ];

  const wsRef = XLSX.utils.aoa_to_sheet([
    ['PANDUAN REFERENSI DATA MASTER - OSIS SMK TRIDHARMA GORONTALO'],
    ['Gunakan daftar di bawah ini untuk mengisi kolom Kelas dan Jabatan secara akurat:'],
    [],
    refHeaders,
    ...refKelasData,
    [],
    sekbidTitle,
    ...sekbidData,
    [],
    ['CATATAN PEMBINA OSIS:'],
    ['1. Format file ini adalah Microsoft Excel standard (.xlsx).'],
    ['2. Anda cukup mengisi Nama, NISN (jika ada), Kelas, dan Jabatan.'],
    ['3. Sistem secara cerdas akan membuat Username dan Password akun pengurus baru secara otomatis.'],
    ['4. Kartu Tanda Anggota (KTA) langsung dapat dicetak dalam orientasi Landscape maupun Portrait.'],
  ]);

  wsRef['!cols'] = [
    { wch: 45 },
    { wch: 20 },
    { wch: 35 },
  ];

  // 3. Gabungkan ke Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsMain, 'DATA_PENGURUS_OSIS');
  XLSX.utils.book_append_sheet(workbook, wsRef, 'REFERENSI_KELAS_SEKBID');

  // 4. Unduh File .xlsx ke perangkat pengguna
  const fileName = `TEMPLATE_EXCEL_PENGURUS_OSIS_${namaSekolah.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Utilitas untuk membaca dan mem-parse file Excel (.xlsx, .xls, .csv)
 * yang diunggah oleh Pembina
 */
export const parseExcelFile = async (
  file: File,
  existingUsernames: string[] = []
): Promise<ParsedMemberRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Cari sheet data atau gunakan sheet pertama
        const targetSheetName =
          workbook.SheetNames.find((s) => s.toUpperCase().includes('DATA')) ||
          workbook.SheetNames[0];

        const worksheet = workbook.Sheets[targetSheetName];
        if (!worksheet) {
          resolve([]);
          return;
        }

        // Konversi sheet ke 2D array baris
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (!rawRows || rawRows.length === 0) {
          resolve([]);
          return;
        }

        // Cari baris header tabel
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
          const rowText = (rawRows[i] || []).join(' ').toLowerCase();
          if (rowText.includes('nama') && (rowText.includes('kelas') || rowText.includes('jabatan') || rowText.includes('nis'))) {
            headerRowIndex = i;
            break;
          }
        }

        const dataRows = headerRowIndex >= 0 ? rawRows.slice(headerRowIndex + 1) : rawRows;
        const parsedResults: ParsedMemberRow[] = [];
        const usedUsernames = [...existingUsernames];

        dataRows.forEach((row, idx) => {
          if (!row || row.length === 0) return;

          // Ambil nilai kolom (mengantisipasi kolom No di index 0 atau langsung nama)
          let colIndexNama = 1;
          let colIndexNisn = 2;
          let colIndexKelas = 3;
          let colIndexJabatan = 4;
          let colIndexGender = 5;
          let colIndexKontak = 6;

          // Jika kolom 0 berisi nama (tanpa kolom nomor)
          const firstCol = String(row[0] || '').trim();
          if (isNaN(Number(firstCol)) && firstCol.length > 2 && isNaN(Date.parse(firstCol))) {
            colIndexNama = 0;
            colIndexNisn = 1;
            colIndexKelas = 2;
            colIndexJabatan = 3;
            colIndexGender = 4;
            colIndexKontak = 5;
          }

          const nama = String(row[colIndexNama] || '').trim();
          if (!nama || nama.toLowerCase().includes('nama lengkap') || nama.startsWith('---')) {
            return;
          }

          const nisnRaw = String(row[colIndexNisn] || '').replace(/[^0-9]/g, '').trim();
          const nisn = nisnRaw || `007${String(1234500 + idx + 1).padStart(7, '0')}`;
          const kelasRaw = String(row[colIndexKelas] || '').trim();
          const kelas = normalizeClass(kelasRaw);
          const jabatanRaw = String(row[colIndexJabatan] || 'Anggota Sekbid').trim();
          const genderRaw = String(row[colIndexGender] || 'L').toUpperCase().trim();
          const jenisKelamin: 'L' | 'P' = genderRaw.startsWith('P') || genderRaw.includes('PEREMPUAN') ? 'P' : 'L';
          const telepon = String(row[colIndexKontak] || '081234567890').trim();

          const { role, kategori, peranSekbid, sekbidNomor } = detectJabatanDetails(jabatanRaw);
          const { username, password } = generateBulkCredentials(nama, usedUsernames);
          usedUsernames.push(username.toLowerCase());

          const errors: string[] = [];
          if (nama.length < 3) errors.push('Nama terlalu pendek (minimal 3 karakter)');

          parsedResults.push({
            id: `excel-imp-${Date.now()}-${idx}`,
            nama,
            nisn,
            kelas,
            jabatan: jabatanRaw,
            telepon,
            jenisKelamin,
            kategori,
            peranSekbid,
            sekbidNomor,
            role,
            suggestedUsername: username,
            suggestedPassword: password,
            isValid: errors.length === 0,
            errors,
          });
        });

        resolve(parsedResults);
      } catch (err) {
        console.error('Error parsing excel file:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
