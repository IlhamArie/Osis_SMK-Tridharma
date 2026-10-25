import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  Globe, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Upload, 
  Terminal, 
  Key, 
  Layers, 
  HelpCircle,
  AlertTriangle,
  Server
} from 'lucide-react';
import { 
  getCloudDbConfig, 
  saveCloudDbConfig, 
  testCloudConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../../services/cloudDatabase';

interface VercelDatabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAllData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VercelDatabaseGuideModal: React.FC<VercelDatabaseGuideModalProps> = ({
  isOpen,
  onClose,
  onExportAllData,
  onImportData,
}) => {
  const [config, setConfig] = useState(getCloudDbConfig());
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabaseAnonKey);
  const [activeTab, setActiveTab] = useState<'panduan' | 'koneksi' | 'sql' | 'backup'>('panduan');

  const [testingStatus, setTestingStatus] = useState<{
    loading: boolean;
    tested: boolean;
    success?: boolean;
    message?: string;
  }>({
    loading: false,
    tested: false,
  });

  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getCloudDbConfig();
      setConfig(cfg);
      setSupabaseUrl(cfg.supabaseUrl);
      setSupabaseAnonKey(cfg.supabaseAnonKey);
      if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
        handleTestConnection(false);
      }
    }
  }, [isOpen]);

  const handleSaveAndTest = async () => {
    saveCloudDbConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    });
    setConfig(getCloudDbConfig());
    await handleTestConnection(true);
  };

  const handleTestConnection = async (showNotification = true) => {
    setTestingStatus({ loading: true, tested: false });
    const res = await testCloudConnection();
    setTestingStatus({
      loading: false,
      tested: true,
      success: res.success,
      message: res.message,
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyEnvSample = () => {
    const envText = `VITE_SUPABASE_URL="${supabaseUrl || 'https://xyzcompany.supabase.co'}"\nVITE_SUPABASE_ANON_KEY="${supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}"`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  SIAP PRODUKSI (BUKAN DEMO)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Gratis 100%</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Panduan Hosting Vercel & Database Cloud (Supabase/Firebase)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('panduan')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'panduan'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Langkah Mudah Hosting & Database</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('koneksi')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'koneksi'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. Status Koneksi Otomatis</span>
            {testingStatus.tested && testingStatus.success && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'sql'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Skrip SQL 1-Klik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>4. Cadangan & Pulihkan Data</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-700 space-y-6">
          {/* TAB 1: PANDUAN LENGKAP UNTUK PEMULA */}
          {activeTab === 'panduan' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-indigo-950 text-sm">
                    Konsep Sangat Sederhana (Untuk yang Belum Mengerti Koding)
                  </h4>
                  <p className="text-indigo-900 leading-relaxed">
                    Aplikasi ini dirancang dengan <strong>Auto-Cloud Adapter</strong>. Anda <strong>tidak perlu mengedit kode program sama sekali</strong>! Anda hanya perlu mendaftar di 2 layanan gratis (Supabase untuk gudang data & Vercel untuk alamat web), lalu menempelkan kuncinya. Sistem akan otomatis terhubung!
                  </p>
                </div>
              </div>

              {/* Roadmap 3 Langkah */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-mono">
                    1
                  </span>
                  <span>Langkah 1: Siapkan Database Cloud Gratis di Supabase (3 Menit)</span>
                </h3>

                <div className="ml-8 space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="leading-relaxed">
                    1. Buka situs <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> lalu klik tombol hijau <strong>"Start your project"</strong>.
                  </p>
                  <p className="leading-relaxed">
                    2. Masuk menggunakan akun GitHub atau Email Anda (gratis tanpa kartu kredit).
                  </p>
                  <p className="leading-relaxed">
                    3. Klik <strong>"New Project"</strong>. Beri nama misalnya: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-indigo-800 font-mono">erp-osis-tridharma</code>, buat kata sandi database, lalu pilih lokasi region terdekat (misal: <em>Singapore</em>).
                  </p>
                  <p className="leading-relaxed">
                    4. Buka tab <strong>"SQL Editor"</strong> di Supabase, lalu salin skrip dari tab <strong>"3. Skrip SQL 1-Klik"</strong> di atas, tempel di editor tersebut, lalu klik <strong>RUN</strong>. (Tabel otomatis selesai dibuat!).
                  </p>
                  <p className="leading-relaxed">
                    5. Masuk ke menu <strong>Project Settings (Ikon Gerigi) &rarr; API</strong>. Salin dua data penting:
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                    <div className="text-slate-500 font-sans font-bold">Dua Kunci yang Perlu Disalin:</div>
                    <div className="text-indigo-700">1. Project URL (misal: https://abcdefghijklm.supabase.co)</div>
                    <div className="text-emerald-700">2. anon public key (kode panjang acak)</div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pt-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-mono">
                    2
                  </span>
                  <span>Langkah 2: Hubungkan & Deploy di Vercel (2 Menit)</span>
                </h3>

                <div className="ml-8 space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="leading-relaxed">
                    1. Pastikan kode aplikasi Anda sudah ada di akun <a href="https://github.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-1">GitHub <ExternalLink className="w-3 h-3" /></a> Anda.
                  </p>
                  <p className="leading-relaxed">
                    2. Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline inline-flex items-center gap-1">vercel.com <ExternalLink className="w-3 h-3" /></a> &rarr; Login dengan akun GitHub.
                  </p>
                  <p className="leading-relaxed">
                    3. Klik <strong>"Add New..." &rarr; "Project"</strong>, lalu pilih repositori OSIS Anda dan klik <strong>"Import"</strong>.
                  </p>
                  <p className="leading-relaxed">
                    4. <strong>Bagian Paling Penting (Integrasi Otomatis):</strong> Buka bagian <strong>Environment Variables</strong> di halaman Vercel tersebut, lalu tambahkan 2 kunci:
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Variabel 1:</span>
                      <button
                        type="button"
                        onClick={handleCopyEnvSample}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-sans font-bold flex items-center gap-1"
                      >
                        {copiedEnv ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedEnv ? 'Tersalin!' : 'Salin Format'}</span>
                      </button>
                    </div>
                    <div>Key: <span className="text-indigo-700 font-bold">VITE_SUPABASE_URL</span></div>
                    <div>Value: <span className="text-slate-600">[Tempel Project URL Anda]</span></div>

                    <div className="pt-1 border-t border-slate-100">
                      <div>Key: <span className="text-indigo-700 font-bold">VITE_SUPABASE_ANON_KEY</span></div>
                      <div>Value: <span className="text-slate-600">[Tempel anon public key Anda]</span></div>
                    </div>
                  </div>

                  <p className="leading-relaxed">
                    5. Klik tombol biru <strong>"Deploy"</strong>! Tunggu sekitar 60 detik. Web resmi OSIS Anda langsung live di alamat: <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">https://nama-osis-anda.vercel.app</code>
                  </p>
                </div>

                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pt-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-mono">
                    ✓
                  </span>
                  <span>Bagaimana Cara Kerja Integrasi Otomatisnya?</span>
                </h3>

                <div className="ml-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Otomatis Tanpa Perlu Setup Server:</span>
                  </div>
                  <p className="leading-relaxed">
                    Ketika web dibuka di Vercel, sistem otomatis mendeteksi kedua variabel tersebut. Begitu ada pengurus yang melakukan presensi GPS, menambah anggota seksi bidang, atau memperbarui proker, data tersebut <strong>langsung tersimpan otomatis di Supabase</strong> dan seketika terbaca oleh semua perangkat pengguna lain!
                  </p>
                  <p className="leading-relaxed text-[11px] text-emerald-800">
                    Jika internet mati atau database sedang tidak aktif, aplikasi secara cerdas tetap berjalan menggunakan penyimpanan lokal (offline-first) tanpa error!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UJI KONEKSI OTOMATIS */}
          {activeTab === 'koneksi' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Uji & Simpan Koneksi Supabase</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anda juga dapat memasukkan kunci database langsung di sini untuk mengaktifkan sinkronisasi database cloud pada peramban ini.
                </p>
              </div>

              {/* Status Box */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                testingStatus.tested
                  ? testingStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {testingStatus.loading ? (
                  <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
                ) : testingStatus.tested ? (
                  testingStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )
                ) : (
                  <Server className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="font-bold">
                    {testingStatus.loading
                      ? 'Sedang Memeriksa Koneksi ke Supabase...'
                      : testingStatus.tested
                      ? testingStatus.success
                        ? '🟢 Database Cloud Terhubung Sempurna!'
                        : '🔴 Koneksi Belum Berhasil'
                      : '🟡 Belum Diuji'}
                  </div>
                  <p className="text-xs leading-relaxed">
                    {testingStatus.message ||
                      'Masukkan URL dan Anon Key di bawah ini lalu klik tombol "Simpan & Uji Koneksi".'}
                  </p>
                  {config.lastSyncedAt && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Terakhir sinkronisasi: {config.lastSyncedAt}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Input */}
              <div className="space-y-3.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Didapat dari Supabase &rarr; Project Settings &rarr; API &rarr; Project URL
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Didapat dari Supabase &rarr; Project Settings &rarr; API &rarr; Project API keys (anon public)
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500">
                    Kunci ini aman disimpan di peramban Anda.
                  </div>

                  <button
                    type="button"
                    disabled={testingStatus.loading}
                    onClick={handleSaveAndTest}
                    className="min-h-[42px] px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {testingStatus.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    <span>Simpan & Uji Koneksi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SQL SCHEMA 1-KLIK */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Skrip SQL Otomatis untuk Supabase
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jalankan skrip ini satu kali saja di menu <strong>SQL Editor</strong> pada dashboard Supabase Anda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95 shrink-0"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Semua SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 text-emerald-400 font-mono text-[11px] leading-relaxed max-h-[350px] overflow-y-auto">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Cara Menjalankannya di Supabase:</span>
                </div>
                <p className="leading-relaxed text-blue-800">
                  Buka project Anda di <strong>supabase.com</strong> &rarr; Klik menu <strong>SQL Editor</strong> (ikon terminal di bilah samping kiri) &rarr; Klik <strong>"New query"</strong> &rarr; Tempel (Paste) skrip di atas &rarr; Klik tombol hijau <strong>"Run"</strong>. Selesai!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pencadangan & Pemulihan Mandiri (Siap Digunakan)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Amankan seluruh data sekolah (akun, proker, presensi, surat, kas, jadwal piket) ke dalam file cadangan JSON kapan saja.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900">Ekspor Cadangan Lengkap (.json)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unduh salinan seluruh data ERP OSIS ke dalam komputer Anda sebagai arsip cadangan resmi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onExportAllData}
                    className="min-h-[42px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Cadangan Sekarang</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900">Pulihkan Data dari Cadangan (.json)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Muat kembali data dari file cadangan komputer Anda ke dalam sistem ini secara instan.
                    </p>
                  </div>

                  <label className="min-h-[42px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer text-center">
                    <Upload className="w-4 h-4" />
                    <span>Pilih File Cadangan (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={onImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Sistem ERP OSIS Resmi SMK Tridharma Gorontalo
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all ml-auto"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
