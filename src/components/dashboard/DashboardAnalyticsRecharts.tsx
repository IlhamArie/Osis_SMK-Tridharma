import React, { useState, useMemo } from 'react';
import { 
  PresensiRecord, 
  TransaksiKas, 
  UserAccount, 
  OrgMember, 
  SchoolIdentityConfig 
} from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { DAFTAR_KELAS } from '../../data/classList';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Wallet,
  Clock,
  ShieldCheck,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Users,
  Award,
  FileDown,
  Download,
  Check
} from 'lucide-react';
import { generateExecutivePdfReport } from '../../utils/executiveReportPdfGenerator';

interface DashboardAnalyticsRechartsProps {
  presensiList: PresensiRecord[];
  transaksiList: TransaksiKas[];
  accounts?: UserAccount[];
  orgMembers?: OrgMember[];
  schoolIdentity?: SchoolIdentityConfig;
}

export const DashboardAnalyticsRecharts: React.FC<DashboardAnalyticsRechartsProps> = ({
  presensiList,
  transaksiList,
  accounts = [],
  orgMembers = [],
  schoolIdentity,
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;

  // Filter States
  const [filterRentang, setFilterRentang] = useState<'7hari' | '30hari' | 'semua'>('semua');
  const [filterJurusan, setFilterJurusan] = useState<'semua' | 'askep' | 'farmasi'>('semua');
  const [chartActiveTab, setChartActiveTab] = useState<'semua' | 'presensi' | 'keuangan'>('semua');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState<string | null>(null);

  // Format IDR Helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // =========================================================================
  // 1. DATA PREPARATION FOR PRESENSI TREND (RECHARTS)
  // =========================================================================
  const presensiAnalytics = useMemo(() => {
    const total = presensiList.length;
    let tepatWaktu = 0;
    let terlambat = 0;
    let izin = 0;
    let alpa = 0;

    presensiList.forEach((p) => {
      const statusLower = (p.status || '').toLowerCase();
      if (p.isTerlambat || statusLower.includes('terlambat')) {
        terlambat++;
      } else if (statusLower.includes('izin') || statusLower.includes('sakit')) {
        izin++;
      } else if (statusLower.includes('alpa') || statusLower.includes('tidak')) {
        alpa++;
      } else {
        tepatWaktu++;
      }
    });

    const tingkatKehadiran = total > 0 ? Math.round(((tepatWaktu + terlambat) / total) * 100) : 100;
    const tingkatKedisiplinan = total > 0 ? Math.round((tepatWaktu / total) * 100) : 100;

    // Daily Timeline Trend Grouping
    const groupedByDate: Record<string, { tanggal: string; tepatWaktu: number; terlambat: number; izin: number; total: number }> = {};

    // Sort by date ascending
    const sorted = [...presensiList].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    sorted.forEach((p) => {
      const tgl = p.tanggal;
      if (!groupedByDate[tgl]) {
        groupedByDate[tgl] = {
          tanggal: tgl.split('-').slice(1).join('/'), // e.g. "10/01"
          tepatWaktu: 0,
          terlambat: 0,
          izin: 0,
          total: 0,
        };
      }

      const statusLower = (p.status || '').toLowerCase();
      groupedByDate[tgl].total++;
      if (p.isTerlambat || statusLower.includes('terlambat')) {
        groupedByDate[tgl].terlambat++;
      } else if (statusLower.includes('izin') || statusLower.includes('sakit')) {
        groupedByDate[tgl].izin++;
      } else {
        groupedByDate[tgl].tepatWaktu++;
      }
    });

    const dailyTrendData = Object.values(groupedByDate);

    // Distribution Pie Data
    const pieData = [
      { name: 'Tepat Waktu', value: tepatWaktu, color: '#10b981' }, // Emerald
      { name: 'Terlambat', value: terlambat, color: '#f59e0b' },   // Amber
      { name: 'Izin / Sakit', value: izin, color: '#0ea5e9' },    // Sky
      { name: 'Belum Hadir / Alpa', value: alpa, color: '#f43f5e' }, // Rose
    ].filter((d) => d.value > 0);

    // Class Attendance Breakdown (Official 7 Classes)
    const classData = DAFTAR_KELAS.map((k) => {
      // Cari presensi siswa di kelas ini via accounts
      const memberNamesInClass = accounts
        .filter((a) => a.kelas === k)
        .map((a) => a.fullName.toLowerCase());

      const presensiInClass = presensiList.filter((p) =>
        memberNamesInClass.includes(p.namaPengurus.toLowerCase())
      );

      const hadisOnTime = presensiInClass.filter((p) => !p.isTerlambat && !p.status.includes('Izin') && !p.status.includes('Sakit')).length;
      const hadirLate = presensiInClass.filter((p) => p.isTerlambat).length;
      const hadirIzin = presensiInClass.filter((p) => p.status.includes('Izin') || p.status.includes('Sakit')).length;

      return {
        kelas: k,
        tepatWaktu: hadisOnTime,
        terlambat: hadirLate,
        izin: hadirIzin,
        total: presensiInClass.length,
      };
    });

    return {
      total,
      tepatWaktu,
      terlambat,
      izin,
      alpa,
      tingkatKehadiran,
      tingkatKedisiplinan,
      dailyTrendData,
      pieData,
      classData,
    };
  }, [presensiList, accounts]);

  // =========================================================================
  // 2. DATA PREPARATION FOR KAS KEUANGAN TREND (RECHARTS)
  // =========================================================================
  const kasAnalytics = useMemo(() => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    const categoryMap: Record<string, number> = {};
    const monthlyMap: Record<string, { bulan: string; pemasukan: number; pengeluaran: number; saldoNet: number }> = {};

    // Sort by date ascending
    const sorted = [...transaksiList].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    let runningBalance = 0;

    sorted.forEach((t) => {
      const isMasuk = t.jenis === 'Pemasukan';
      const nominal = Number(t.nominal) || 0;

      if (isMasuk) {
        totalPemasukan += nominal;
        runningBalance += nominal;
      } else {
        totalPengeluaran += nominal;
        runningBalance -= nominal;

        // Group expense category
        const cat = t.kategori || 'Lain-lain';
        categoryMap[cat] = (categoryMap[cat] || 0) + nominal;
      }

      // Group by Month (e.g. "2026-09" -> "Sep 2026")
      const monthKey = t.tanggal.slice(0, 7);
      if (!monthlyMap[monthKey]) {
        const [year, month] = monthKey.split('-');
        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const label = `${monthNames[parseInt(month, 10)]} ${year}`;
        monthlyMap[monthKey] = {
          bulan: label,
          pemasukan: 0,
          pengeluaran: 0,
          saldoNet: 0,
        };
      }

      if (isMasuk) {
        monthlyMap[monthKey].pemasukan += nominal;
      } else {
        monthlyMap[monthKey].pengeluaran += nominal;
      }
      monthlyMap[monthKey].saldoNet = monthlyMap[monthKey].pemasukan - monthlyMap[monthKey].pengeluaran;
    });

    const saldoAkhir = totalPemasukan - totalPengeluaran;
    const monthlyCashFlowData = Object.values(monthlyMap);

    // Expense Categories for Donut Chart
    const pieCategoryData = Object.entries(categoryMap).map(([name, value], i) => {
      const palette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#f43f5e'];
      return {
        name,
        value,
        color: palette[i % palette.length],
      };
    });

    // Cumulative Balance Timeline
    let accum = 0;
    const balanceTimelineData = sorted.map((t) => {
      const isMasuk = t.jenis === 'Pemasukan';
      accum += isMasuk ? Number(t.nominal) : -Number(t.nominal);
      return {
        tanggal: t.tanggal.split('-').slice(1).join('/'),
        saldo: accum,
        nominal: Number(t.nominal),
        jenis: t.jenis,
      };
    });

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoAkhir,
      monthlyCashFlowData,
      pieCategoryData,
      balanceTimelineData,
    };
  }, [transaksiList]);

  // Handler: Generate & Download Executive PDF Report based on active Recharts data
  const handleDownloadPdfReport = () => {
    setIsGeneratingPdf(true);
    try {
      generateExecutivePdfReport({
        presensiList,
        transaksiList,
        accounts,
        orgMembers,
        schoolIdentity: identity,
        filterRentang,
        filterJurusan,
        presensiAnalytics: {
          total: presensiAnalytics.total,
          tepatWaktu: presensiAnalytics.tepatWaktu,
          terlambat: presensiAnalytics.terlambat,
          izin: presensiAnalytics.izin,
          alpa: presensiAnalytics.alpa,
          tingkatKehadiran: presensiAnalytics.tingkatKehadiran,
          tingkatKedisiplinan: presensiAnalytics.tingkatKedisiplinan,
          kelasData: presensiAnalytics.classData,
        },
        kasAnalytics: {
          totalPemasukan: kasAnalytics.totalPemasukan,
          totalPengeluaran: kasAnalytics.totalPengeluaran,
          saldoAkhir: kasAnalytics.saldoAkhir,
          categoryData: kasAnalytics.pieCategoryData,
        },
      });
      setPdfSuccessToast('Laporan Ringkasan Eksekutif PDF berhasil digenerate & diunduh!');
      setTimeout(() => setPdfSuccessToast(null), 4000);
    } catch (err) {
      console.error('Gagal men-generate laporan PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Unduh PDF */}
      {pdfSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{pdfSuccessToast}</span>
        </div>
      )}

      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono font-semibold">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>DASHBOARD ANALITIK UTAMA · POWERED BY RECHARTS</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                DATA REALTIME
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Visualisasi Tren Presensi Siswa & Arus Kas Organisasi
            </h2>
            <p className="text-xs text-indigo-200/90 max-w-2xl leading-relaxed">
              Pantau dinamika kedisiplinan pengurus di 7 kelas resmi serta akuntabilitas keluar-masuk kas OSIS {identity.namaSekolah} secara transparan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Tombol Unduh Laporan PDF Eksekutif */}
            <button
              type="button"
              onClick={handleDownloadPdfReport}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-600/30 border border-emerald-400/40 active:scale-95 cursor-pointer whitespace-nowrap"
              title="Unduh Laporan Ringkasan PDF Otomatis Berdasarkan Data Recharts yang Sedang Ditampilkan"
            >
              <FileDown className="w-4 h-4 text-emerald-100" />
              <span>{isGeneratingPdf ? 'Memproses PDF...' : 'Unduh Laporan PDF'}</span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                AUTO
              </span>
            </button>

            {/* Tab Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-indigo-500/30 p-1 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setChartActiveTab('semua')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartActiveTab === 'semua'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Semua Grafik
              </button>
              <button
                type="button"
                onClick={() => setChartActiveTab('presensi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartActiveTab === 'presensi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Tren Presensi
              </button>
              <button
                type="button"
                onClick={() => setChartActiveTab('keuangan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartActiveTab === 'keuangan'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Arus Kas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tingkat Kehadiran */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Tingkat Kehadiran
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{presensiAnalytics.tingkatKehadiran}%</span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                {presensiAnalytics.tepatWaktu} Tepat Waktu
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dari total {presensiAnalytics.total} rekaman presensi GPS terverifikasi.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${presensiAnalytics.tingkatKehadiran}%` }}
            />
          </div>
        </div>

        {/* Card 2: Saldo Kas Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Saldo Kas Organisasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
              {formatIDR(kasAnalytics.saldoAkhir)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
              <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {formatIDR(kasAnalytics.totalPemasukan)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Total Kas Keluar: <strong>{formatIDR(kasAnalytics.totalPengeluaran)}</strong>
          </p>
        </div>

        {/* Card 3: Kedisiplinan Waktu */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Indeks Tepat Waktu
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{presensiAnalytics.tingkatKedisiplinan}%</span>
              <span className="text-xs font-semibold text-amber-600 font-mono">
                {presensiAnalytics.terlambat} Terlambat
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Batas toleransi apel & piket: <strong>07:15 WITA</strong>.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${presensiAnalytics.tingkatKedisiplinan}%` }}
            />
          </div>
        </div>

        {/* Card 4: Alokasi & Efisiensi Anggaran */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Total Pengurus & Sekbid
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{orgMembers.length} Personel</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md font-mono">
                8 Sekbid
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Seluruh data terintegrasi ke buku kas dan daftar hadir.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Kampus SMK Tridharma Gorontalo
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: TREN PRESENSI SISWA (RECHARTS)
          ========================================================================= */}
      {(chartActiveTab === 'semua' || chartActiveTab === 'presensi') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-emerald-600 rounded-full" />
              <h3 className="text-base font-bold text-slate-900">
                1. Visualisasi Tren Presensi Siswa & Kedisiplinan Waktu
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Sumber: Rekaman Geofencing GPS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 1.1: Tren Harian (Area Chart) */}
            <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Grafik Tren Kehadiran Harian Siswa
                  </h4>
                  <p className="text-xs text-slate-500">
                    Perbandingan kehadiran Tepat Waktu vs Terlambat dari waktu ke waktu.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-600 font-semibold">Tepat Waktu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="text-slate-600 font-semibold">Terlambat</span>
                  </div>
                </div>
              </div>

              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={presensiAnalytics.dailyTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTepatWaktu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="tanggal"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tepatWaktu"
                      name="Tepat Waktu"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorTepatWaktu)"
                    />
                    <Area
                      type="monotone"
                      dataKey="terlambat"
                      name="Terlambat"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTerlambat)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 1.2: Proporsi Status Kehadiran (Donut Chart) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Komposisi Status Presensi
                </h4>
                <p className="text-xs text-slate-500">
                  Rasio kualifikasi presensi seluruh sesi.
                </p>
              </div>

              <div className="h-[210px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={presensiAnalytics.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {presensiAnalytics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    {presensiAnalytics.tingkatKedisiplinan}%
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase mt-1">
                    Disiplin
                  </span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {presensiAnalytics.pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-slate-600 text-[11px] truncate">{d.name}:</span>
                    <strong className="text-slate-900 text-[11px] font-mono">{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 1.3: Kehadiran Berdasarkan 7 Kelas Resmi (BarChart) */}
            <div className="lg:col-span-12 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kedisiplinan Presensi Antar 7 Kelas Resmi
                  </h4>
                  <p className="text-xs text-slate-500">
                    Distribusi data presensi di jurusan Asisten Keperawatan & Farmasi SMK Tridharma.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                  7 KELAS RESMI
                </span>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={presensiAnalytics.classData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="kelas"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="tepatWaktu"
                      name="Tepat Waktu"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="terlambat"
                      name="Terlambat"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: GRAFIK PENGGUNAAN DANA KAS ORGANISASI (RECHARTS)
          ========================================================================= */}
      {(chartActiveTab === 'semua' || chartActiveTab === 'keuangan') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-indigo-600 rounded-full" />
              <h3 className="text-base font-bold text-slate-900">
                2. Visualisasi Penggunaan Dana Kas Organisasi (Arus Kas Masuk & Keluar)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Sumber: Buku Kas Bendahara OSIS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 2.1: Arus Kas Masuk vs Keluar per Bulan (Bar Chart) */}
            <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Grafik Arus Kas Masuk vs Kas Keluar Bulanan
                  </h4>
                  <p className="text-xs text-slate-500">
                    Membandingkan pemasukan iuran/dana sekolah vs pengeluaran operasional.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                    <span className="text-slate-600 font-semibold">Pemasukan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="text-slate-600 font-semibold">Pengeluaran</span>
                  </div>
                </div>
              </div>

              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kasAnalytics.monthlyCashFlowData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString()}k`}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatIDR(Number(value)), '']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="pemasukan"
                      name="Pemasukan"
                      fill="#059669"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="pengeluaran"
                      name="Pengeluaran"
                      fill="#e11d48"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2.2: Alokasi Pengeluaran per Kategori (Donut Chart) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Alokasi Pengeluaran per Kategori
                </h4>
                <p className="text-xs text-slate-500">
                  Pos pengeluaran terbesar yang didanai kas.
                </p>
              </div>

              <div className="h-[210px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kasAnalytics.pieCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {kasAnalytics.pieCategoryData.map((entry, index) => (
                        <Cell key={`cat-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatIDR(Number(val)), '']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Total Biaya
                  </span>
                  <span className="text-sm font-black text-rose-600 font-mono">
                    {formatIDR(kasAnalytics.totalPengeluaran)}
                  </span>
                </div>
              </div>

              {/* Categories list */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-[120px] overflow-y-auto pr-1">
                {kasAnalytics.pieCategoryData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-700 truncate">{c.name}</span>
                    </div>
                    <span className="font-bold font-mono text-slate-900 shrink-0">
                      {formatIDR(c.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2.3: Pertumbuhan Akumulasi Saldo Kas Sepanjang Waktu (Area Chart) */}
            <div className="lg:col-span-12 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kurva Pertumbuhan Akumulasi Saldo Kas Bersih
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pergerakan saldo kas riil organisasi setelah setiap transaksi dicatat.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Saldo Terkini:</span>
                  <span className="text-base font-black text-indigo-700 font-mono">
                    {formatIDR(kasAnalytics.saldoAkhir)}
                  </span>
                </div>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={kasAnalytics.balanceTimelineData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="tanggal"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString()}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatIDR(Number(val)), 'Saldo Akumulatif']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="saldo"
                      name="Saldo Kas"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSaldo)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pembina Strategic Insights Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-emerald-950">
              Evaluasi Pembina: Kedisiplinan & Arus Kas dalam Kondisi Sehat
            </div>
            <div className="text-slate-600 mt-0.5">
              Tingkat kehadiran presensi mencapai <strong>{presensiAnalytics.tingkatKehadiran}%</strong> dan saldo kas surplus <strong>{formatIDR(kasAnalytics.saldoAkhir)}</strong>.
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-emerald-800 font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-300 shrink-0">
          Status: Akuntabel & Tertib
        </div>
      </div>
    </div>
  );
};
