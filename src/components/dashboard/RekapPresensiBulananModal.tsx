import React, { useState, useMemo } from 'react';
import { PresensiRecord, UserAccount } from '../../types/erp';
import {
  MONTH_NAMES,
  filterPresensiByMonth,
  calculatePengurusMonthlySummary,
  exportPresensiMonthlyToExcel,
} from '../../utils/excelPresensiExport';
import {
  FileSpreadsheet,
  X,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Award,
  UserCheck,
  CheckCheck,
  Download,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Search,
  FileText
} from 'lucide-react';

interface RekapPresensiBulananModalProps {
  currentUser: UserAccount;
  presensiList: PresensiRecord[];
  isOpen: boolean;
  onClose: () => void;
  onBatchValidate?: (
    ids: string[],
    status: 'Disetujui Sah' | 'Diberi Teguran' | 'Ditolak / Anulir',
    catatan?: string
  ) => void;
}

export const RekapPresensiBulananModal: React.FC<RekapPresensiBulananModalProps> = ({
  currentUser,
  presensiList,
  isOpen,
  onClose,
  onBatchValidate,
}) => {
  // Current date initialization
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  const [selectedBulan, setSelectedBulan] = useState<number>(currentMonth);
  const [selectedTahun, setSelectedTahun] = useState<number>(currentYear);
  const [kategoriFilter, setKategoriFilter] = useState<'semua' | 'bph' | 'sekbid'>('semua');
  const [activeSubTab, setActiveSubTab] = useState<'per_pengurus' | 'log_harian'>('per_pengurus');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [catatanEvaluasi, setCatatanEvaluasi] = useState<string>(
    'Secara umum kedisiplinan kehadiran sekolah pengurus OSIS berjalan baik. Pengurus yang terlambat melewati pukul 07.15 WITA diberikan pembinaan untuk perbaikan manajemen waktu dan kesiapan piket pagi gerbang sekolah.'
  );
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Filtered records based on Month & Year
  const monthlyRecords = useMemo(() => {
    return filterPresensiByMonth(presensiList, selectedBulan, selectedTahun);
  }, [presensiList, selectedBulan, selectedTahun]);

  // Filtered further by Kategori
  const categoryRecords = useMemo(() => {
    let result = monthlyRecords;
    if (kategoriFilter === 'bph') {
      result = result.filter(
        (r) =>
          r.kategoriPengurus === 'bph' ||
          ['ketua', 'wakil', 'sekretaris', 'bendahara'].some((k) =>
            r.jabatan.toLowerCase().includes(k)
          )
      );
    } else if (kategoriFilter === 'sekbid') {
      result = result.filter(
        (r) =>
          r.kategoriPengurus === 'sekbid' ||
          !['ketua', 'wakil', 'sekretaris', 'bendahara'].some((k) =>
            r.jabatan.toLowerCase().includes(k)
          )
      );
    }
    return result;
  }, [monthlyRecords, kategoriFilter]);

  // Aggregate per pengurus
  const summaries = useMemo(() => {
    return calculatePengurusMonthlySummary(categoryRecords);
  }, [categoryRecords]);

  // Filtered summaries for search query
  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return summaries;
    const q = searchQuery.toLowerCase();
    return summaries.filter(
      (s) =>
        s.namaPengurus.toLowerCase().includes(q) ||
        s.jabatan.toLowerCase().includes(q) ||
        s.predikat.toLowerCase().includes(q)
    );
  }, [summaries, searchQuery]);

  // Filtered log harian for search query
  const filteredLogHarian = useMemo(() => {
    if (!searchQuery.trim()) return categoryRecords;
    const q = searchQuery.toLowerCase();
    return categoryRecords.filter(
      (r) =>
        r.namaPengurus.toLowerCase().includes(q) ||
        r.jabatan.toLowerCase().includes(q) ||
        r.tanggal.includes(q) ||
        (r.alasanKeterlambatan && r.alasanKeterlambatan.toLowerCase().includes(q)) ||
        (r.keterangan && r.keterangan.toLowerCase().includes(q))
    );
  }, [categoryRecords, searchQuery]);

  // Metrics
  const totalPresensi = categoryRecords.length;
  const totalTepatWaktu = categoryRecords.filter(
    (r) => !r.isTerlambat && r.status.includes('Valid')
  ).length;
  const totalTerlambat = categoryRecords.filter(
    (r) => r.isTerlambat || r.status.includes('Terlambat')
  ).length;
  const totalLuarRadius = categoryRecords.filter((r) => r.status === 'Di Luar Radius').length;
  const totalDisetujui = categoryRecords.filter(
    (r) => r.isValidatedByPembina || r.statusValidasiPembina === 'Disetujui Sah'
  ).length;
  const totalPending = categoryRecords.filter(
    (r) => !r.isValidatedByPembina && r.statusValidasiPembina !== 'Diberi Teguran'
  ).length;
  const persentaseDisiplin =
    totalPresensi > 0 ? Math.round((totalTepatWaktu / totalPresensi) * 100) : 0;

  // Teladan vs Butuh Pembinaan
  const topDisiplin = summaries.filter((s) => s.persentaseDisiplin === 100);
  const needCounseling = summaries.filter((s) => s.predikat === 'Perlu Pembinaan' || s.terlambat >= 2);

  const handleExportExcel = () => {
    try {
      const fileName = exportPresensiMonthlyToExcel({
        bulanAngka: selectedBulan,
        tahun: selectedTahun,
        presensiList,
        currentUser,
        catatanEvaluasiPembina: catatanEvaluasi,
        filterKategori: kategoriFilter,
      });

      setDownloadSuccessToast(
        `File Excel "${fileName}" berhasil diunduh! Berkas berisi 3 sheet lengkap siap untuk rapat evaluasi bulanan.`
      );
      setTimeout(() => setDownloadSuccessToast(null), 6000);
    } catch (err: any) {
      alert('Gagal mengekspor file Excel: ' + (err?.message || err));
    }
  };

  const handleQuickApproveMonthOnTime = () => {
    if (!onBatchValidate) return;
    const pendingOnTimeIds = categoryRecords
      .filter((r) => !r.isTerlambat && r.status.includes('Valid') && !r.isValidatedByPembina)
      .map((r) => r.id);

    if (pendingOnTimeIds.length === 0) {
      alert('Tidak ada presensi tepat waktu yang menunggu validasi di bulan ini.');
      return;
    }

    onBatchValidate(
      pendingOnTimeIds,
      'Disetujui Sah',
      `Divalidasi sah oleh Pembina pada evaluasi bulanan ${MONTH_NAMES[selectedBulan - 1]} ${selectedTahun}.`
    );
    setDownloadSuccessToast(
      `Berhasil mengesahkan ${pendingOnTimeIds.length} absensi tepat waktu untuk bulan ${MONTH_NAMES[selectedBulan - 1]} ${selectedTahun}!`
    );
    setTimeout(() => setDownloadSuccessToast(null), 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-scaleUp overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-5 md:p-6 bg-slate-950 text-white border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-amber-300 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded-md">
                  OTORITAS EVALUASI PEMBINA OSIS
                </span>
                <span className="text-xs text-slate-400">SMK Tridharma Gorontalo</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white mt-0.5">
                Rekapitulasi Absensi & Evaluasi Kedisiplinan Bulanan
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Alat bantu Pembina untuk analisis kedisiplinan perbulan (&lt; 07.15 WITA) dan ekspor laporan resmi dalam format Microsoft Excel (.xlsx).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* EXCEL EXPORT BUTTON */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Rekap Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* TOAST SUCCESS */}
        {downloadSuccessToast && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessToast}</span>
          </div>
        )}

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 md:p-6 space-y-6 overflow-y-auto flex-1">
          {/* FILTER TOOLBAR: BULAN, TAHUN & KATEGORI */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Bulan Dropdown */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Pilih Bulan:</span>
                <select
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">Tahun:</span>
                <select
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              {/* Kategori Filter */}
              <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                {[
                  { id: 'semua', label: 'Semua Pengurus' },
                  { id: 'bph', label: 'Khusus BPH' },
                  { id: 'sekbid', label: 'Khusus Sekbid' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setKategoriFilter(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      kategoriFilter === item.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action for Batch Validation in Selected Month */}
            {onBatchValidate && totalPending > 0 && (
              <button
                type="button"
                onClick={handleQuickApproveMonthOnTime}
                className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                <CheckCheck className="w-4 h-4 text-indigo-600" />
                <span>Sahkan Semua Tepat Waktu ({MONTH_NAMES[selectedBulan - 1]})</span>
              </button>
            )}
          </div>

          {/* 4 KPI CARDS: RINGKASAN EVALUASI BULAN INI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                Total Presensi Terdata
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black">{totalPresensi}</span>
                <span className="text-xs text-indigo-300 font-mono">
                  {MONTH_NAMES[selectedBulan - 1]} {selectedTahun}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">
                Meliputi BPH & seluruh Sekbid
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-mono text-emerald-800 font-bold uppercase tracking-wider block">
                Tingkat Disiplin (&lt; 07.15)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-950">{persentaseDisiplin}%</span>
                <span className="text-xs text-emerald-700 font-bold font-mono">
                  {totalTepatWaktu} / {totalPresensi} Sesi
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 block pt-1">
                Hadir tepat waktu sebelum bel masuk
              </span>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-mono text-rose-800 font-bold uppercase tracking-wider block">
                Keterlambatan (&gt; 07.15)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-950">{totalTerlambat}</span>
                <span className="text-xs text-rose-700 font-mono font-bold">
                  {totalPresensi > 0 ? Math.round((totalTerlambat / totalPresensi) * 100) : 0}% Total
                </span>
              </div>
              <span className="text-[11px] text-rose-800 block pt-1">
                Wajib pembinaan & catatan evaluasi
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-mono text-amber-900 font-bold uppercase tracking-wider block">
                Status Validasi Pembina
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-950">{totalDisetujui} Sah</span>
                <span className="text-xs text-amber-800 font-mono font-bold">
                  {totalPending} Menunggu
                </span>
              </div>
              <span className="text-[11px] text-amber-800 block pt-1">
                {totalLuarRadius > 0 ? `${totalLuarRadius} presensi luar radius` : 'Radius aman terverifikasi'}
              </span>
            </div>
          </div>

          {/* TWO HIGHLIGHT BOXES: TELADAN DISIPLIN VS PERLU PEMBINAAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">
                    Pengurus Teladan Paling Disiplin (100% Tepat Waktu)
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  {topDisiplin.length} Orang
                </span>
              </div>

              {topDisiplin.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Belum ada pengurus dengan 100% tepat waktu pada bulan ini.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topDisiplin.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-emerald-200 text-emerald-900 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{s.namaPengurus}</span>
                      <span className="text-[10px] text-emerald-600 font-mono font-normal">({s.jabatan})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-950">
                    Catatan Perhatian Pembina (Sering Terlambat / Butuh Konseling)
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                  {needCounseling.length} Pengurus
                </span>
              </div>

              {needCounseling.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Semua pengurus berada dalam ambang batas kedisiplinan yang memuaskan.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {needCounseling.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-amber-300 text-amber-900 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <span>⚠️ {s.namaPengurus}</span>
                      <span className="text-[10px] text-rose-700 font-bold font-mono">
                        ({s.terlambat}x Terlambat, +{s.totalMenitTerlambat}m)
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INPUT CATATAN EVALUASI RESMI PEMBINA OSIS (TERMASUK DI EXCEL) */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Catatan & Rekomendasi Evaluasi Bulanan Pembina OSIS (Dicantumkan pada Laporan Excel):</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Penilai: {currentUser.fullName}
              </span>
            </div>
            <textarea
              rows={2}
              value={catatanEvaluasi}
              onChange={(e) => setCatatanEvaluasi(e.target.value)}
              placeholder="Tuliskan evaluasi bulanan, arahan kedisiplinan, atau catatan pembinaan untuk OSIS Tridharma..."
              className="w-full text-xs bg-white border border-indigo-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            ></textarea>
          </div>

          {/* SUB-TABS & SEARCH BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('per_pengurus')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'per_pengurus'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                1. Rekapitulasi Per Anggota Pengurus ({filteredSummaries.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('log_harian')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === 'log_harian'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                2. Log Rinci Harian Absensi ({filteredLogHarian.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pengurus / jabatan..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* TAB 1: REKAP PER PENGURUS TABLE */}
          {activeSubTab === 'per_pengurus' && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Nama Pengurus OSIS</th>
                      <th className="p-3">Jabatan</th>
                      <th className="p-3 text-center">Kategori</th>
                      <th className="p-3 text-center">Total Hadir</th>
                      <th className="p-3 text-center text-emerald-800">Tepat Waktu</th>
                      <th className="p-3 text-center text-rose-800">Terlambat</th>
                      <th className="p-3 text-center">Luar Radius</th>
                      <th className="p-3 text-center">% Disiplin</th>
                      <th className="p-3 text-center">Predikat</th>
                      <th className="p-3">Rekomendasi Pembinaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400 italic">
                          Tidak ada data presensi pada bulan {MONTH_NAMES[selectedBulan - 1]} {selectedTahun}.
                        </td>
                      </tr>
                    ) : (
                      filteredSummaries.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{s.namaPengurus}</td>
                          <td className="p-3 text-slate-600">{s.jabatan}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                s.kategori === 'BPH'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-sky-100 text-sky-900 border border-sky-300'
                              }`}
                            >
                              {s.kategori}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">
                            {s.totalHadir}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-700">
                            {s.tepatWaktu}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-rose-600">
                            {s.terlambat > 0 ? `${s.terlambat} (+${s.totalMenitTerlambat}m)` : '0'}
                          </td>
                          <td className="p-3 text-center font-mono text-slate-600">
                            {s.luarRadius > 0 ? (
                              <span className="text-rose-600 font-bold">{s.luarRadius}x</span>
                            ) : (
                              '0'
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-extrabold">
                            <span
                              className={`${
                                s.persentaseDisiplin >= 90
                                  ? 'text-emerald-700'
                                  : s.persentaseDisiplin >= 75
                                  ? 'text-amber-700'
                                  : 'text-rose-600'
                              }`}
                            >
                              {s.persentaseDisiplin}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                s.predikat === 'Sangat Baik'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : s.predikat === 'Baik'
                                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                  : s.predikat === 'Cukup'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                              }`}
                            >
                              {s.predikat}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-600">
                            {s.predikat === 'Sangat Baik'
                              ? 'Apresiasi & pertahankan kedisiplinan'
                              : s.predikat === 'Baik'
                              ? 'Tingkatkan presensi sebelum 07.10 WITA'
                              : s.predikat === 'Cukup'
                              ? 'Peringatan ringan terkait jadwal piket'
                              : 'Wajib konseling kedisiplinan bersama Pembina'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LOG RINCI HARIAN TABLE */}
          {activeSubTab === 'log_harian' && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Tanggal & Waktu</th>
                      <th className="p-3">Nama Pengurus</th>
                      <th className="p-3">Jabatan</th>
                      <th className="p-3">Jenis Presensi</th>
                      <th className="p-3 text-center">Jarak</th>
                      <th className="p-3 text-center">Ketepatan</th>
                      <th className="p-3">Alasan Siswa</th>
                      <th className="p-3 text-center">Validasi Pembina</th>
                      <th className="p-3">Catatan Pembina</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogHarian.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                          Tidak ada rekaman harian pada bulan {MONTH_NAMES[selectedBulan - 1]} {selectedTahun}.
                        </td>
                      </tr>
                    ) : (
                      filteredLogHarian.map((r, idx) => (
                        <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-mono">
                            <span className="font-bold text-slate-900 block">{r.tanggal}</span>
                            <span className="text-[11px] text-slate-500">{r.waktu}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{r.namaPengurus}</td>
                          <td className="p-3 text-slate-600">{r.jabatan}</td>
                          <td className="p-3 text-[11px] text-slate-700">{r.jenis}</td>
                          <td className="p-3 text-center font-mono">
                            <span
                              className={`font-semibold ${
                                (r.jarakMeter ?? 0) > 80 ? 'text-rose-600 font-bold' : 'text-slate-700'
                              }`}
                            >
                              {r.jarakMeter ?? 0}m
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {r.isTerlambat ? (
                              <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                +{r.menitKeterlambatan}m Terlambat
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                Tepat Waktu
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 max-w-xs">
                            {r.alasanKeterlambatan || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                r.isValidatedByPembina || r.statusValidasiPembina === 'Disetujui Sah'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : r.statusValidasiPembina === 'Diberi Teguran'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {r.statusValidasiPembina || (r.isValidatedByPembina ? 'Disetujui Sah' : 'Menunggu')}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 max-w-xs">
                            {r.catatanPembina || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 md:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-mono text-center sm:text-left">
            Periode: <strong>{MONTH_NAMES[selectedBulan - 1]} {selectedTahun}</strong> · Format Dokumen: Microsoft Excel OpenXML (.xlsx) · SMK Tridharma Gorontalo
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-900/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Rekap Excel ({MONTH_NAMES[selectedBulan - 1]} {selectedTahun})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
