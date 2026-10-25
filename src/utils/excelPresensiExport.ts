import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PresensiRecord, UserAccount } from '../types/erp';

export interface EvaluasiBulananStats {
  bulanNama: string;
  bulanAngka: number; // 1 - 12
  tahun: number;
  totalPresensi: number;
  totalTepatWaktu: number;
  totalTerlambat: number;
  totalLuarRadius: number;
  totalTervalidasi: number;
  totalTeguran: number;
  totalMenunggu: number;
  persentaseDisiplin: number;
  catatanPembina?: string;
  namaPembina: string;
}

export interface PengurusMonthlySummary {
  userId?: string;
  namaPengurus: string;
  jabatan: string;
  kategori: 'BPH' | 'Sekbid';
  totalHadir: number;
  tepatWaktu: number;
  terlambat: number;
  totalMenitTerlambat: number;
  luarRadius: number;
  persentaseDisiplin: number;
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan';
}

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Filter data presensi berdasarkan bulan (1-12) dan tahun (YYYY)
 */
export function filterPresensiByMonth(
  records: PresensiRecord[],
  bulanAngka: number,
  tahun: number
): PresensiRecord[] {
  return records.filter((r) => {
    if (!r.tanggal) return false;
    const parts = r.tanggal.split('-');
    if (parts.length < 3) return false;
    const recYear = parseInt(parts[0], 10);
    const recMonth = parseInt(parts[1], 10);
    return recYear === tahun && recMonth === bulanAngka;
  });
}

/**
 * Hitung agregat per pengurus untuk bulan tertentu
 */
export function calculatePengurusMonthlySummary(
  monthRecords: PresensiRecord[]
): PengurusMonthlySummary[] {
  const map = new Map<string, PengurusMonthlySummary>();

  for (const r of monthRecords) {
    const key = r.namaPengurus.trim();
    const isBph =
      r.kategoriPengurus === 'bph' ||
      ['ketua', 'wakil', 'sekretaris', 'bendahara'].some((k) =>
        r.jabatan.toLowerCase().includes(k)
      );

    if (!map.has(key)) {
      map.set(key, {
        userId: r.userId,
        namaPengurus: r.namaPengurus,
        jabatan: r.jabatan,
        kategori: isBph ? 'BPH' : 'Sekbid',
        totalHadir: 0,
        tepatWaktu: 0,
        terlambat: 0,
        totalMenitTerlambat: 0,
        luarRadius: 0,
        persentaseDisiplin: 100,
        predikat: 'Sangat Baik',
      });
    }

    const item = map.get(key)!;
    item.totalHadir += 1;

    if (r.status === 'Di Luar Radius') {
      item.luarRadius += 1;
    }

    if (r.isTerlambat || r.status.includes('Terlambat')) {
      item.terlambat += 1;
      item.totalMenitTerlambat += r.menitKeterlambatan || 0;
    } else if (r.status.includes('Valid') || r.status.includes('Tepat Waktu')) {
      item.tepatWaktu += 1;
    }
  }

  // Hitung persentase & predikat
  const result: PengurusMonthlySummary[] = Array.from(map.values()).map((item) => {
    const pct = item.totalHadir > 0 ? Math.round((item.tepatWaktu / item.totalHadir) * 100) : 0;
    let predikat: PengurusMonthlySummary['predikat'] = 'Sangat Baik';
    if (pct < 60 || item.terlambat >= 3 || item.luarRadius >= 2) {
      predikat = 'Perlu Pembinaan';
    } else if (pct < 80) {
      predikat = 'Cukup';
    } else if (pct < 95) {
      predikat = 'Baik';
    }

    return {
      ...item,
      persentaseDisiplin: pct,
      predikat,
    };
  });

  // Urutkan dari BPH lalu persentase tertinggi
  result.sort((a, b) => {
    if (a.kategori !== b.kategori) {
      return a.kategori === 'BPH' ? -1 : 1;
    }
    return b.persentaseDisiplin - a.persentaseDisiplin;
  });

  return result;
}

/**
 * Generate dan download file Excel (.xlsx) Rekapitulasi Presensi Bulanan
 */
export function exportPresensiMonthlyToExcel(params: {
  bulanAngka: number;
  tahun: number;
  presensiList: PresensiRecord[];
  currentUser: UserAccount;
  catatanEvaluasiPembina?: string;
  filterKategori?: 'semua' | 'bph' | 'sekbid';
}) {
  const {
    bulanAngka,
    tahun,
    presensiList,
    currentUser,
    catatanEvaluasiPembina,
    filterKategori = 'semua',
  } = params;

  const bulanNama = MONTH_NAMES[bulanAngka - 1] || 'Bulan';
  let filteredRecords = filterPresensiByMonth(presensiList, bulanAngka, tahun);

  if (filterKategori === 'bph') {
    filteredRecords = filteredRecords.filter(
      (r) =>
        r.kategoriPengurus === 'bph' ||
        ['ketua', 'wakil', 'sekretaris', 'bendahara'].some((k) =>
          r.jabatan.toLowerCase().includes(k)
        )
    );
  } else if (filterKategori === 'sekbid') {
    filteredRecords = filteredRecords.filter(
      (r) =>
        r.kategoriPengurus === 'sekbid' ||
        !['ketua', 'wakil', 'sekretaris', 'bendahara'].some((k) =>
          r.jabatan.toLowerCase().includes(k)
        )
    );
  }

  const summaries = calculatePengurusMonthlySummary(filteredRecords);

  const totalPresensi = filteredRecords.length;
  const totalTepatWaktu = filteredRecords.filter(
    (r) => !r.isTerlambat && r.status.includes('Valid')
  ).length;
  const totalTerlambat = filteredRecords.filter(
    (r) => r.isTerlambat || r.status.includes('Terlambat')
  ).length;
  const totalLuarRadius = filteredRecords.filter((r) => r.status === 'Di Luar Radius').length;
  const totalDisetujui = filteredRecords.filter(
    (r) => r.isValidatedByPembina || r.statusValidasiPembina === 'Disetujui Sah'
  ).length;
  const totalTeguran = filteredRecords.filter(
    (r) => r.statusValidasiPembina === 'Diberi Teguran'
  ).length;
  const totalMenunggu = filteredRecords.filter(
    (r) => !r.isValidatedByPembina && r.statusValidasiPembina !== 'Diberi Teguran'
  ).length;
  const persentaseDisiplin =
    totalPresensi > 0 ? Math.round((totalTepatWaktu / totalPresensi) * 100) : 0;

  const namaPembina = currentUser.fullName || 'Ilham Arief, S.Pd. (Pembina OSIS)';
  const now = new Date();
  const tglCetak = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} WITA`;

  // ==========================================
  // SHEET 1: RINGKASAN & EVALUASI BULANAN
  // ==========================================
  const sheet1Data: any[][] = [
    ['REKAPITULASI & EVALUASI KEDISIPLINAN PRESENSI PENGURUS OSIS'],
    ['SMK TRIDHARMA GORONTALO - TAHUN AJARAN 2025/2026'],
    ['KAMPUS PUSAT KEJURUAN: JL. RADEN SALEH NO. 12 KOTA GORONTALO (ZONA WITA)'],
    [],
    ['PARAMETER LAPORAN', 'NILAI KETERANGAN'],
    ['Periode Evaluasi', `${bulanNama} ${tahun}`],
    ['Target Jam Masuk / Kedisiplinan', '07:15:00 WITA (Batas Toleransi Bel Sekolah)'],
    ['Radius Geofencing Sekolah', '80 Meter dari Titik Koordinat Kampus'],
    ['Pejabat Pembina Penilai', namaPembina],
    ['Jabatan Otoritas', 'Pembina OSIS / Super Admin Evaluasi'],
    ['Filter Kategori', filterKategori.toUpperCase()],
    ['Waktu Ekspor Dokumen', tglCetak],
    [],
    ['INDIKATOR KINERJA KEDISIPLINAN (KPI)', 'JUMLAH', 'PERSENTASE'],
    ['Total Rekaman Presensi Masuk', totalPresensi, '100%'],
    ['Presensi Tepat Waktu (< 07.15 WITA)', totalTepatWaktu, `${persentaseDisiplin}%`],
    ['Presensi Terlambat (> 07.15 WITA)', totalTerlambat, `${totalPresensi > 0 ? Math.round((totalTerlambat / totalPresensi) * 100) : 0}%`],
    ['Presensi di Luar Radius Radius Sekolah', totalLuarRadius, `${totalPresensi > 0 ? Math.round((totalLuarRadius / totalPresensi) * 100) : 0}%`],
    ['Status: Disetujui Sah oleh Pembina', totalDisetujui, `${totalPresensi > 0 ? Math.round((totalDisetujui / totalPresensi) * 100) : 0}%`],
    ['Status: Diberikan Teguran Pembina', totalTeguran, `${totalPresensi > 0 ? Math.round((totalTeguran / totalPresensi) * 100) : 0}%`],
    ['Status: Menunggu Validasi Pembina', totalMenunggu, `${totalPresensi > 0 ? Math.round((totalMenunggu / totalPresensi) * 100) : 0}%`],
    [],
    ['CATATAN & REKOMENDASI EVALUASI PEMBINA OSIS:'],
    [
      catatanEvaluasiPembina ||
        `Tingkat kedisiplinan pengurus OSIS pada periode ${bulanNama} ${tahun} mencapai ${persentaseDisiplin}%. Pengurus yang terlambat melewati 07.15 WITA telah diberikan catatan evaluasi pembinaan agar meningkatkan kedisiplinan hadir di sekolah dan pelaksanaan piket gerbang.`,
    ],
    [],
    ['Lembar pengesahan sah ditandatangani secara digital oleh Pembina OSIS SMK Tridharma Gorontalo.'],
  ];

  // ==========================================
  // SHEET 2: REKAP PER PENGURUS (AGREGAT)
  // ==========================================
  const sheet2Headers = [
    'No',
    'Nama Pengurus OSIS',
    'Jabatan Organisasi',
    'Kategori',
    'Total Hadir',
    'Tepat Waktu (<07.15)',
    'Terlambat (>07.15)',
    'Total Menit Keterlambatan',
    'Di Luar Radius',
    '% Kedisiplinan',
    'Predikat Kedisiplinan',
    'Rekomendasi Pembinaan',
  ];

  const sheet2Rows = summaries.map((s, idx) => [
    idx + 1,
    s.namaPengurus,
    s.jabatan,
    s.kategori,
    s.totalHadir,
    s.tepatWaktu,
    s.terlambat,
    `${s.totalMenitTerlambat} menit`,
    s.luarRadius,
    `${s.persentaseDisiplin}%`,
    s.predikat,
    s.predikat === 'Sangat Baik'
      ? 'Apresiasi kedisiplinan dan pertahankan keaktifan'
      : s.predikat === 'Baik'
      ? 'Tingkatkan konsistensi hadir sebelum 07.10 WITA'
      : s.predikat === 'Cukup'
      ? 'Peringatan ringan dan evaluasi kesiapan piket'
      : 'Wajib konseling kedisiplinan bersama Pembina OSIS',
  ]);

  const sheet2Data = [
    [`REKAPITULASI KEHADIRAN PENGURUS OSIS PER ANGGOTA - ${bulanNama.toUpperCase()} ${tahun}`],
    ['SMK TRIDHARMA GORONTALO'],
    [],
    sheet2Headers,
    ...sheet2Rows,
  ];

  // ==========================================
  // SHEET 3: LOG DETAIL ABSENSI HARIAN
  // ==========================================
  const sheet3Headers = [
    'No',
    'ID Presensi',
    'Tanggal',
    'Waktu (WITA)',
    'Nama Pengurus',
    'Jabatan',
    'Kategori',
    'Jenis Presensi',
    'Jarak ke Kampus (m)',
    'Status Validasi Lokasi & Waktu',
    'Terlambat?',
    'Menit Terlambat',
    'Batas Waktu',
    'Alasan Keterlambatan Siswa',
    'Status Validasi Pembina',
    'Divalidasi Oleh',
    'Waktu Validasi',
    'Catatan / Arahan Pembina OSIS',
  ];

  const sheet3Rows = filteredRecords.map((r, idx) => {
    const isBph =
      r.kategoriPengurus === 'bph' ||
      ['ketua', 'wakil', 'sekretaris', 'bendahara'].some((k) =>
        r.jabatan.toLowerCase().includes(k)
      );

    return [
      idx + 1,
      r.id,
      r.tanggal,
      r.waktu,
      r.namaPengurus,
      r.jabatan,
      isBph ? 'BPH OSIS' : 'Pengurus Sekbid',
      r.jenis,
      r.jarakMeter ?? 0,
      r.status,
      r.isTerlambat ? 'YA (TERLAMBAT)' : 'TIDAK',
      r.menitKeterlambatan ? `${r.menitKeterlambatan} menit` : '0 menit',
      r.waktuBatas || '07:15 WITA',
      r.alasanKeterlambatan || '-',
      r.statusValidasiPembina || (r.isValidatedByPembina ? 'Disetujui Sah' : 'Menunggu Validasi'),
      r.validatedBy || (r.isValidatedByPembina ? namaPembina : '-'),
      r.validatedAt || '-',
      r.catatanPembina || '-',
    ];
  });

  const sheet3Data = [
    [`LOG DETAIL HARIAN ABSENSI KEHADIRAN SEKOLAH & PIKET - ${bulanNama.toUpperCase()} ${tahun}`],
    ['SMK TRIDHARMA GORONTALO'],
    [],
    sheet3Headers,
    ...sheet3Rows,
  ];

  // ==========================================
  // WORKBOOK CREATION & FORMATTING
  // ==========================================
  const wb = XLSX.utils.book_new();

  // Create Worksheets
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);

  // Set Column Widths for readability
  ws1['!cols'] = [
    { wch: 38 },
    { wch: 30 },
    { wch: 20 },
  ];

  ws2['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 32 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 20 },
    { wch: 24 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 45 },
  ];

  ws3['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 13 },
    { wch: 16 },
    { wch: 26 },
    { wch: 28 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 26 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 32 },
    { wch: 22 },
    { wch: 28 },
    { wch: 20 },
    { wch: 40 },
  ];

  // Append Sheets to Workbook
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan Evaluasi');
  XLSX.utils.book_append_sheet(wb, ws2, 'Rekap Per Pengurus');
  XLSX.utils.book_append_sheet(wb, ws3, 'Log Detail Harian');

  // Generate binary Excel array
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const sanitizedBulan = bulanNama.toUpperCase();
  const fileName = `REKAP_ABSENSI_OSIS_TRIDHARMA_${sanitizedBulan}_${tahun}.xlsx`;

  saveAs(blob, fileName);
  return fileName;
}
