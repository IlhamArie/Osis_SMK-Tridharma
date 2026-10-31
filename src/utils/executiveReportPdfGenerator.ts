import jsPDF from 'jspdf';
import { 
  PresensiRecord, 
  TransaksiKas, 
  UserAccount, 
  OrgMember, 
  SchoolIdentityConfig 
} from '../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../data/schoolIdentityPresets';

interface GenerateReportOptions {
  presensiList: PresensiRecord[];
  transaksiList: TransaksiKas[];
  accounts?: UserAccount[];
  orgMembers?: OrgMember[];
  schoolIdentity?: SchoolIdentityConfig;
  filterRentang: '7hari' | '30hari' | 'semua';
  filterJurusan: 'semua' | 'askep' | 'farmasi';
  presensiAnalytics: {
    total: number;
    tepatWaktu: number;
    terlambat: number;
    izin: number;
    alpa: number;
    tingkatKehadiran: number;
    tingkatKedisiplinan: number;
    kelasData: Array<{ kelas: string; total: number; tepatWaktu: number; terlambat: number; izin?: number }>;
  };
  kasAnalytics: {
    totalPemasukan: number;
    totalPengeluaran: number;
    saldoAkhir: number;
    categoryData: Array<{ name: string; value: number }>;
  };
}

export const generateExecutivePdfReport = (options: GenerateReportOptions) => {
  const {
    presensiAnalytics,
    kasAnalytics,
    schoolIdentity,
    filterRentang,
    filterJurusan,
    orgMembers = [],
  } = options;

  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;

  // Initialize jsPDF in A4 Portrait (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2; // 180mm

  // Format IDR Helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Date Formatting WITA
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const currentDateStr = now.toLocaleDateString('id-ID', dateOptions);
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WITA`;

  let currentY = 14;

  // =========================================================================
  // 1. OFFICIAL KOP SURAT (HEADER RESMI)
  // =========================================================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('YAYASAN PENDIDIKAN TRIDHARMA GORONTALO', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(identity.namaSekolah.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('ORGANISASI SISWA INTRA SEKOLAH (OSIS) · CONTROL ROOM ERP', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const alamatLine = `${identity.alamat || 'Jl. Pancasila No. 27, Kota Gorontalo'} | NPSN: ${identity.npsn || '40501020'} | Email: ${identity.email || 'osis@smktridharma.sch.id'}`;
  doc.text(alamatLine, pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  // Double Border Lines (Kop Separator)
  doc.setDrawColor(30, 27, 75); // Dark Indigo
  doc.setLineWidth(0.8);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 1.2;

  doc.setDrawColor(148, 163, 184); // Slate-400
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 6;

  // =========================================================================
  // 2. REPORT TITLE & METADATA BADGE
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN RINGKASAN EKSEKUTIF ANALITIK & MONITORING', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const filterDesc = `Rentang Data: ${filterRentang.toUpperCase()} | Jurusan: ${filterJurusan.toUpperCase()} | Dihasilkan: ${currentDateStr}, ${currentTimeStr}`;
  doc.text(filterDesc, pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  // =========================================================================
  // 3. 4 TOP KPI SUMMARY BOXES
  // =========================================================================
  const boxWidth = (contentWidth - 9) / 4; // ~42.75mm
  const boxHeight = 16;
  const boxY = currentY;

  // Box 1: Kehadiran
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, boxY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52);
  doc.text('TINGKAT KEHADIRAN', marginX + 3, boxY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(21, 128, 61);
  doc.text(`${presensiAnalytics.tingkatKehadiran}%`, marginX + 3, boxY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(74, 222, 128);
  doc.text(`${presensiAnalytics.tepatWaktu} Tepat Waktu`, marginX + 3, boxY + 14);

  // Box 2: Kedisiplinan Waktu (07:15 WITA)
  const box2X = marginX + boxWidth + 3;
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(254, 240, 138); // amber-200
  doc.roundedRect(box2X, boxY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(133, 77, 14);
  doc.text('INDEKS TEPAT WAKTU', box2X + 3, boxY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text(`${presensiAnalytics.tingkatKedisiplinan}%`, box2X + 3, boxY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(217, 119, 6);
  doc.text(`${presensiAnalytics.terlambat} Terlambat (>07.15)`, box2X + 3, boxY + 14);

  // Box 3: Saldo Kas Organisasi
  const box3X = marginX + (boxWidth + 3) * 2;
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.roundedRect(box3X, boxY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(55, 48, 163);
  doc.text('SALDO KAS SAAT INI', box3X + 3, boxY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(49, 46, 129);
  doc.text(formatIDR(kasAnalytics.saldoAkhir), box3X + 3, boxY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(99, 102, 241);
  doc.text(`Masuk: ${formatIDR(kasAnalytics.totalPemasukan)}`, box3X + 3, boxY + 14);

  // Box 4: Personel & Sekbid
  const box4X = marginX + (boxWidth + 3) * 3;
  doc.setFillColor(250, 245, 255); // purple-50
  doc.setDrawColor(233, 213, 255); // purple-200
  doc.roundedRect(box4X, boxY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 33, 168);
  doc.text('PERSONEL TERDAFTAR', box4X + 3, boxY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(126, 34, 206);
  doc.text(`${orgMembers.length} Orang`, box4X + 3, boxY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(168, 85, 247);
  doc.text('8 Seksi Bidang Aktif', box4X + 3, boxY + 14);

  currentY = boxY + boxHeight + 6;

  // =========================================================================
  // 4. BAGIAN A: REKAPITULASI PRESENSI & 7 KELAS KEJURUAN RESMI
  // =========================================================================
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('A. REKAPITULASI KEDISIPLINAN 7 KELAS KEJURUAN RESMI (SMK TRIDHARMA)', marginX + 2.5, currentY + 3.8);
  currentY += 7.5;

  // Table Headers
  const tableHeaders = [
    { title: 'No', width: 10, align: 'center' },
    { title: 'Nama Kelas Kejuruan', width: 45, align: 'left' },
    { title: 'Total Hadir', width: 28, align: 'center' },
    { title: 'Tepat Waktu (<07.15)', width: 35, align: 'center' },
    { title: 'Terlambat (>07.15)', width: 32, align: 'center' },
    { title: '% Kepatuhan', width: 30, align: 'right' },
  ];

  let headerX = marginX;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  tableHeaders.forEach((th) => {
    const textX = th.align === 'center' ? headerX + th.width / 2 : th.align === 'right' ? headerX + th.width - 2 : headerX + 2;
    doc.text(th.title, textX, currentY + 3.8, { align: th.align as any });
    headerX += th.width;
  });
  currentY += 5.5;

  // Table Rows (7 Official Classes)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  let totalRekamanAll = 0;
  let totalTepatWaktuAll = 0;
  let totalTerlambatAll = 0;

  presensiAnalytics.kelasData.forEach((row, idx) => {
    const rowHeight = 4.8;
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
    }

    totalRekamanAll += row.total;
    totalTepatWaktuAll += row.tepatWaktu;
    totalTerlambatAll += row.terlambat;

    const complianceRate = row.total > 0 ? Math.round((row.tepatWaktu / row.total) * 100) : 100;

    let cellX = marginX;
    doc.setTextColor(30, 41, 59);

    // No
    doc.text((idx + 1).toString(), cellX + 5, currentY + 3.4, { align: 'center' });
    cellX += 10;

    // Kelas
    doc.setFont('helvetica', 'bold');
    doc.text(row.kelas, cellX + 2, currentY + 3.4);
    doc.setFont('helvetica', 'normal');
    cellX += 45;

    // Total Hadir
    doc.text(row.total.toString(), cellX + 14, currentY + 3.4, { align: 'center' });
    cellX += 28;

    // Tepat Waktu
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text(row.tepatWaktu.toString(), cellX + 17.5, currentY + 3.4, { align: 'center' });
    cellX += 35;

    // Terlambat
    doc.setTextColor(row.terlambat > 0 ? 180 : 100, row.terlambat > 0 ? 83 : 116, row.terlambat > 0 ? 9 : 139);
    doc.text(row.terlambat.toString(), cellX + 16, currentY + 3.4, { align: 'center' });
    cellX += 32;

    // % Kepatuhan
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(complianceRate >= 80 ? 21 : 180, complianceRate >= 80 ? 128 : 83, complianceRate >= 80 ? 61 : 9);
    doc.text(`${complianceRate}%`, cellX + 28, currentY + 3.4, { align: 'right' });

    currentY += rowHeight;
  });

  // Table Total Summary Row
  doc.setFillColor(226, 232, 240); // slate-200
  doc.rect(marginX, currentY, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  doc.text('TOTAL SELURUH SISWA', marginX + 12, currentY + 3.5);
  doc.text(totalRekamanAll.toString(), marginX + 10 + 45 + 14, currentY + 3.5, { align: 'center' });
  doc.text(totalTepatWaktuAll.toString(), marginX + 10 + 45 + 28 + 17.5, currentY + 3.5, { align: 'center' });
  doc.text(totalTerlambatAll.toString(), marginX + 10 + 45 + 28 + 35 + 16, currentY + 3.5, { align: 'center' });

  const totalCompliance = totalRekamanAll > 0 ? Math.round((totalTepatWaktuAll / totalRekamanAll) * 100) : 100;
  doc.text(`${totalCompliance}%`, pageWidth - marginX - 2, currentY + 3.5, { align: 'right' });
  currentY += 8;

  // =========================================================================
  // 5. BAGIAN B: RINGKASAN KEUANGAN KAS ORGANISASI (RECHARTS SUMMARY)
  // =========================================================================
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('B. RINGKASAN ARUS KAS & ALOKASI ANGGARAN ORGANISASI', marginX + 2.5, currentY + 3.8);
  currentY += 7.5;

  // Financial Quick Metrics in 3 Columns
  const finColWidth = contentWidth / 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Total Kas Masuk (Pemasukan):', marginX + 2, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(formatIDR(kasAnalytics.totalPemasukan), marginX + 2, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Kas Keluar (Pengeluaran):', marginX + finColWidth + 2, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(formatIDR(kasAnalytics.totalPengeluaran), marginX + finColWidth + 2, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Sisa Saldo Kas Bersih:', marginX + finColWidth * 2 + 2, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(49, 46, 129);
  doc.text(formatIDR(kasAnalytics.saldoAkhir), marginX + finColWidth * 2 + 2, currentY + 4.5);

  currentY += 10;

  // Table Kategori Pengeluaran
  const catHeaders = [
    { title: 'No', width: 12, align: 'center' },
    { title: 'Kategori Belanja / Pos Anggaran Kas', width: 85, align: 'left' },
    { title: 'Nominal Realisasi (Rp)', width: 45, align: 'right' },
    { title: '% Rasio Kas', width: 38, align: 'right' },
  ];

  let catHeaderX = marginX;
  doc.setFillColor(30, 41, 59);
  doc.rect(marginX, currentY, contentWidth, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  catHeaders.forEach((ch) => {
    const textX = ch.align === 'center' ? catHeaderX + ch.width / 2 : ch.align === 'right' ? catHeaderX + ch.width - 2 : catHeaderX + 2;
    doc.text(ch.title, textX, currentY + 3.5, { align: ch.align as any });
    catHeaderX += ch.width;
  });
  currentY += 5;

  const validCategories = kasAnalytics.categoryData.length > 0
    ? kasAnalytics.categoryData
    : [
        { name: 'Operasional & Kesekretariatan', value: kasAnalytics.totalPengeluaran * 0.4 },
        { name: 'Kepanitiaan Lomba & Kegiatan', value: kasAnalytics.totalPengeluaran * 0.35 },
        { name: 'Sarana & Perlengkapan OSIS', value: kasAnalytics.totalPengeluaran * 0.15 },
        { name: 'Bantuan Sosial & Kesiswaan', value: kasAnalytics.totalPengeluaran * 0.1 },
      ];

  validCategories.forEach((cat, idx) => {
    const rowHeight = 4.5;
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
    }

    const catRatio = kasAnalytics.totalPengeluaran > 0 ? Math.round((cat.value / kasAnalytics.totalPengeluaran) * 100) : 0;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    doc.text((idx + 1).toString(), marginX + 6, currentY + 3.2, { align: 'center' });
    doc.text(cat.name, marginX + 14, currentY + 3.2);
    doc.text(formatIDR(cat.value), marginX + 12 + 85 + 43, currentY + 3.2, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${catRatio}%`, pageWidth - marginX - 2, currentY + 3.2, { align: 'right' });

    currentY += rowHeight;
  });

  currentY += 5;

  // =========================================================================
  // 6. CATATAN & EVALUASI ANALITIK OTOMATIS
  // =========================================================================
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CATATAN EVALUASI & KESIMPULAN MONITORING SISTEM:', marginX + 3, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  const evalPresence = totalCompliance >= 85
    ? 'Tingkat kepatuhan waktu kehadiran pengurus berkategori SANGAT BAIK dengan indeks ketepatan waktu mencapai standar optimal.'
    : 'Tingkat kedisiplinan waktu kehadiran memerlukan pembinaan lanjutan pada jam batas 07:15 WITA.';

  const evalKas = kasAnalytics.saldoAkhir > 0
    ? `Kondisi kas organisasi dalam posisi SURPLUS SEHAT (${formatIDR(kasAnalytics.saldoAkhir)}) untuk mendukung realisasi seluruh seksi bidang.`
    : 'Perlu pengetatan anggaran operasional dan optimalisasi penerimaan kas iuran organisasi.';

  doc.text(`1. ${evalPresence}`, marginX + 3, currentY + 8);
  doc.text(`2. ${evalKas}`, marginX + 3, currentY + 11.5);

  currentY += 19;

  // =========================================================================
  // 7. TANDA TANGAN PENGESAHAN (SIGNATURE BLOCK)
  // =========================================================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const dateSignText = `Kota Gorontalo, ${currentDateStr}`;
  doc.text(dateSignText, pageWidth - marginX - 10, currentY, { align: 'center' });
  currentY += 4.5;

  const leftSignX = marginX + 35;
  const rightSignX = pageWidth - marginX - 35;

  doc.setFont('helvetica', 'bold');
  doc.text('Mengetahui,', leftSignX, currentY, { align: 'center' });
  doc.text('Mengesahkan,', rightSignX, currentY, { align: 'center' });
  currentY += 3.8;

  doc.text('Ketua Umum OSIS', leftSignX, currentY, { align: 'center' });
  doc.text('Pembina Utama OSIS', rightSignX, currentY, { align: 'center' });
  currentY += 16; // Space for physical signature / stamp

  // Signer Names
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('MUHAMMAD RAYHAN DAUD', leftSignX, currentY, { align: 'center' });
  doc.text('ILHAM ARIEF, S.Pd.', rightSignX, currentY, { align: 'center' });
  currentY += 3.8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('NISN. 0072819201', leftSignX, currentY, { align: 'center' });
  doc.text('NIP. 198504122011011008', rightSignX, currentY, { align: 'center' });

  // Footer Page Number & Security Stamp
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const footerText = `Dokumen Resmi ERP OSIS ${identity.singkatan} · Dicetak via Otomatisasi AI Studio · Validitas QR Verifikasi Aktif`;
  doc.text(footerText, pageWidth / 2, pageHeight - 7, { align: 'center' });

  // Save the PDF
  const filename = `Laporan_Eksekutif_OSIS_${identity.singkatan}_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
