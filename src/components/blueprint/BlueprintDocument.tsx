import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  Database, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Calendar, 
  Wallet, 
  Package, 
  Users, 
  Sparkles,
  ArrowRight,
  Code2,
  HardDrive,
  GitBranch,
  ExternalLink
} from 'lucide-react';

interface BlueprintDocumentProps {
  onBackToApp: () => void;
}

export const BlueprintDocument: React.FC<BlueprintDocumentProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'techstack' | 'erd' | 'strategy'>('sitemap');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Cetak Biru Teknis & Arsitektur</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">v2.4 Production-Ready</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Sistem ERP Administrasi OSIS Terpadu SMK Tridharma Gorontalo</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-indigo-900/50"
          >
            <span>Buka Aplikasi ERP Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="border-b border-slate-800 bg-slate-950/50 px-6 py-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sitemap'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>1. Sitemap & UI/UX Flow</span>
        </button>
        <button
          onClick={() => setActiveTab('techstack')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'techstack'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>2. Tech Stack Recommendation</span>
        </button>
        <button
          onClick={() => setActiveTab('erd')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'erd'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>3. Database Architecture (ERD Logical Design)</span>
        </button>
        <button
          onClick={() => setActiveTab('strategy')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'strategy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>4. Implementation Strategy & Deployment</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* TAB 1: SITEMAP & UI/UX FLOW */}
        {activeTab === 'sitemap' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview Banner */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-2">
                <span>SECTION 01</span>
                <span>/</span>
                <span>ARUS PENGGUNA & HIERARKI NAVIGASI</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Pemisahan Jalur Publik (Siswa Umum) & Dashboard Pengurus Tertutup</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                Arsitektur navigasi membagi sistem menjadi dua zona independen: <strong>Area Publik</strong> yang dapat diakses tanpa autentikasi oleh seluruh siswa dan guru untuk transparansi, serta <strong>Dashboard Pengurus & Control Room</strong> yang terkunci rapat dengan autentikasi berbasis peran (RBAC) yang hanya dapat dibuat oleh Super Admin (Pembina OSIS Bapak Ilham Arief, S.Pd.).
              </p>
            </div>

            {/* Visual Sitemap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Public Portal Tree */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">A. Portal Publik (Akses Bebas)</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Route: /</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80">
                    <div className="text-emerald-400 font-bold mb-1">/ (Beranda Publik OSIS)</div>
                    <p className="text-slate-400 text-xs font-sans">
                      Hero sambutan Pembina, Visi Misi Vokasi, Statistik Agregat, Quick Action.
                    </p>
                  </div>
                  <div className="pl-4 border-l-2 border-emerald-500/30 space-y-2">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-emerald-300 font-semibold">#struktur</span> - Bagan Hirarki Kepengurusan
                      <p className="text-slate-400 text-[11px] font-sans mt-1">
                        Tersinkronisasi otomatis dari database Jendela 1 Control Room Admin.
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-emerald-300 font-semibold">#proker</span> - Transparansi Program Kerja
                      <p className="text-slate-400 text-[11px] font-sans mt-1">
                        Progress bar realisasi 0-100%, filter per Sekbid, alokasi anggaran dan status.
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-emerald-300 font-semibold">#lensa</span> - Lensa Kegiatan & Dokumentasi
                      <p className="text-slate-400 text-[11px] font-sans mt-1">
                        Galeri foto interaktif kegiatan (LDKS, Baksos, Porseni) dengan filter kategori.
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-emerald-300 font-semibold">#aspirasi</span> - Kotak Aspirasi Digital Siswa
                      <p className="text-slate-400 text-[11px] font-sans mt-1">
                        Form saran interaktif, opsi anonim, konfeti visual, dan tiket kode pelacakan unik.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Dashboard Tree */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">B. Dashboard Pengurus (Terkunci)</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Route: /dashboard/*</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-800/40">
                    <div className="text-indigo-400 font-bold mb-1">/login (Gerbang Autentikasi Tunggal)</div>
                    <p className="text-slate-400 text-xs font-sans">
                      Hanya kredensial yang dibuat oleh Admin/Pembina. Tidak ada pendaftaran publik mandiri.
                    </p>
                  </div>
                  <div className="pl-4 border-l-2 border-indigo-500/30 space-y-2">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-indigo-900/30">
                      <span className="text-indigo-300 font-semibold">Control Room: Jendela 1</span> (Admin / Pembina / Sekretaris)
                      <p className="text-slate-400 text-[11px] font-sans mt-0.5">Master Akun Pengurus, Password, & Editor Struktur Organisasi Dinamis.</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-indigo-900/30">
                      <span className="text-indigo-300 font-semibold">Control Room: Jendela 2</span> (Admin / Ketua / BPH)
                      <p className="text-slate-400 text-[11px] font-sans mt-0.5">Manajemen Target Proker, Delegasi Sekbid, & Toggle Saklar Modul.</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-slate-300">Modul Presensi GPS</span> (Validasi Geofencing 150m SMK Tridharma Gorontalo)
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-slate-300">Modul Persuratan .docx</span> (Generator Otomatis Kop Surat & Arsip Digital)
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-slate-300">Modul Rapat & Notulensi</span> (Jadwal, Daftar Hadir Realtime, Notulensi Auto-Save)
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-slate-300">Modul Kas & Keuangan</span> (Buku Kas Umum, Upload Nota Bukti, Rekapitulasi)
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-slate-300">Modul Inventaris & Aset</span> (Peminjaman, Status Barang Tersedia/Rusak/Dipinjam)
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-slate-300">Modul Jadwal Piket Harian</span> (Rotasi Senin-Sabtu terhubung Presensi)
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/50">
                      <span className="text-slate-300">Modul Moderasi Aspirasi</span> (Tinjau, Tindak Lanjut, Balas Saran Siswa)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animation & Micro-interactions Specifications */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Spesifikasi Animasi UI/UX & Micro-Interactions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="font-semibold text-indigo-400 mb-1">1. Motion Curve & Latency Budget</div>
                  <p className="text-slate-400 leading-relaxed">
                    Setiap transisi tombol dan modal menggunakan kurva <code className="text-slate-300">cubic-bezier(0.16, 1, 0.3, 1)</code> dengan durasi maksimal 180-220ms, mencegah kesan lambat dan menjaga ketegasan responsifitas enterprise.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400 mb-1">2. Compositor-Only Transformations</div>
                  <p className="text-slate-400 leading-relaxed">
                    Animasi kartu proker, hover baris tabel, dan modal dokumen hanya menggerakkan properti GPU <code className="text-slate-300">transform</code> dan <code className="text-slate-300">opacity</code> tanpa memicu kalkulasi ulang reflow layout.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <div className="font-semibold text-amber-400 mb-1">3. Feedback Sukses (Confetti & Radar Pulse)</div>
                  <p className="text-slate-400 leading-relaxed">
                    Formulir aspirasi publik dilengkapi trigger partikel konfeti visual instan, sedangkan modul presensi dilengkapi animasi radar pulsa geofencing realtime yang menyala hijau saat GPS berada dalam koordinat kampus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TECH STACK RECOMMENDATION */}
        {activeTab === 'techstack' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-2">
                <span>SECTION 02</span>
                <span>/</span>
                <span>REKOMENDASI TEKNOLOGI & ARSITEKTUR KODE</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Stack Modern: Tangguh, Cepat, Tanpa Beban Lisensi Berat</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                Dipilih untuk memastikan sistem dapat dijalankan dengan lancar di server sekolah lokal maupun cloud hosting hemat sumber daya, dengan pemisahan dependensi yang bersih dan dokumentasi kode TypeScript yang aman dari kesalahan tipe (type-safe).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <Code2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Frontend Layer</h4>
                <p className="text-xs text-slate-400 mb-3">React 19 + TypeScript + Vite</p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>Komponen modular berbasis hooks</li>
                  <li>Type-safety penuh di seluruh modul</li>
                  <li>Tailwind CSS v4 engine terkini</li>
                  <li>Lucide Icons untuk simbol konsisten</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <MapPin className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Presensi & Geolocation</h4>
                <p className="text-xs text-slate-400 mb-3">HTML5 Geolocation + Haversine</p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>Presisi GPS high-accuracy browser</li>
                  <li>Kalkulasi radius Haversine formula</li>
                  <li>Koordinat patokan SMK Tridharma</li>
                  <li>Radius toleransi 150 meter terukur</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Document Generator</h4>
                <p className="text-xs text-slate-400 mb-3">docx + file-saver</p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>Generate murni format Microsoft .docx</li>
                  <li>Kop surat Yayasan & SMK Tridharma</li>
                  <li>Blok tanda tangan berjenjang</li>
                  <li>Dapat dibuka di Word / Google Docs</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Backend & Persistence</h4>
                <p className="text-xs text-slate-400 mb-3">Node.js Express / PostgreSQL</p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>RESTful JSON endpoints terstruktur</li>
                  <li>JWT / Session Cookie token secure</li>
                  <li>Password hashing via bcrypt salt 10</li>
                  <li>Relasi terindeks untuk query cepat</li>
                </ul>
              </div>
            </div>

            {/* Code Architecture Table */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Matriks Perbandingan & Alasan Pemilihan Library</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Kebutuhan Modul</th>
                      <th className="py-2.5 px-3">Teknologi Terpilih</th>
                      <th className="py-2.5 px-3">Alternatif Lain</th>
                      <th className="py-2.5 px-3">Alasan Teknis & Keunggulan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Geofencing Validasi</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-mono">HTML5 Geo + Haversine Formula</td>
                      <td className="py-2.5 px-3 text-slate-500">Google Maps Roads API</td>
                      <td className="py-2.5 px-3">Zero-cost API quota, evaluasi radius 150m instan tanpa lag jaringan eksternal.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Otomasi Persuratan</td>
                      <td className="py-2.5 px-3 text-purple-400 font-mono">docx npm client/server</td>
                      <td className="py-2.5 px-3 text-slate-500">PDFKit / Puppeteer HTML-to-PDF</td>
                      <td className="py-2.5 px-3">Siswa/Guru membutuhkan berkas .docx yang masih dapat diedit manual jika ada revisi nama/gelar.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Umpan Balik Visual</td>
                      <td className="py-2.5 px-3 text-amber-400 font-mono">Canvas Confetti + Motion</td>
                      <td className="py-2.5 px-3 text-slate-500">Heavy Lottie animations</td>
                      <td className="py-2.5 px-3">Ringan (&lt;10KB), rendering GPU canvas cepat bahkan di smartphone siswa low-end.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ERD LOGICAL DESIGN */}
        {activeTab === 'erd' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-2">
                <span>SECTION 03</span>
                <span>/</span>
                <span>DESAIN LOGIS BASIS DATA & ENTITY RELATIONSHIP</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Arsitektur Database Relasional Terintegrasi</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                Skema tabel dirancang normal (3NF) guna mencegah anomali data, memastikan riwayat persuratan, mutasi kas, notulensi rapat, dan inventaris barang memiliki integritas referensial yang ketat.
              </p>
            </div>

            {/* Visual ERD Entity Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Table 1: Akun_Login */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-indigo-950/60 border-b border-indigo-800/40 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white font-mono">t_akun_pengurus</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">Master</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-amber-400">
                    <span>id (PK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>username (UNIQUE)</span>
                    <span className="text-slate-500">VARCHAR(50)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>password_hash</span>
                    <span className="text-slate-500">VARCHAR(255)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>nama_lengkap</span>
                    <span className="text-slate-500">VARCHAR(100)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>nisn</span>
                    <span className="text-slate-500">VARCHAR(18)</span>
                  </div>
                  <div className="flex justify-between text-indigo-400">
                    <span>role</span>
                    <span className="text-slate-500">ENUM</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>kelas</span>
                    <span className="text-slate-500">VARCHAR(30)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>is_active</span>
                    <span className="text-slate-500">BOOLEAN</span>
                  </div>
                </div>
              </div>

              {/* Table 2: Struktur Organisasi */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-emerald-950/60 border-b border-emerald-800/40 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white font-mono">t_struktur_organisasi</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Publik Sync</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-amber-400">
                    <span>id (PK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>akun_id (FK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>nama</span>
                    <span className="text-slate-500">VARCHAR(100)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>jabatan</span>
                    <span className="text-slate-500">VARCHAR(80)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>kategori</span>
                    <span className="text-slate-500">ENUM(pembina,bph,sekbid)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>sekbid_nomor</span>
                    <span className="text-slate-500">INT NULL</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>urutan_tampil</span>
                    <span className="text-slate-500">INT</span>
                  </div>
                </div>
              </div>

              {/* Table 3: Program Kerja */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-purple-950/60 border-b border-purple-800/40 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white font-mono">t_program_kerja</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">Control 2</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-amber-400">
                    <span>id (PK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>kode_proker</span>
                    <span className="text-slate-500">VARCHAR(20)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>nama_proker</span>
                    <span className="text-slate-500">VARCHAR(150)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>sekbid_pj</span>
                    <span className="text-slate-500">VARCHAR(80)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>anggaran_rab</span>
                    <span className="text-slate-500">DECIMAL(12,2)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>realisasi_anggaran</span>
                    <span className="text-slate-500">DECIMAL(12,2)</span>
                  </div>
                  <div className="flex justify-between text-indigo-400">
                    <span>progress_persen</span>
                    <span className="text-slate-500">INT (0-100)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>status</span>
                    <span className="text-slate-500">ENUM</span>
                  </div>
                </div>
              </div>

              {/* Table 4: Absensi Geofencing */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-sky-950/60 border-b border-sky-800/40 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white font-mono">t_presensi_geofence</span>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">Audit</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-amber-400">
                    <span>id (PK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>user_id (FK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>timestamp_wita</span>
                    <span className="text-slate-500">DATETIME</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>latitude</span>
                    <span className="text-slate-500">DECIMAL(10,8)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>longitude</span>
                    <span className="text-slate-500">DECIMAL(11,8)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>jarak_meter</span>
                    <span className="text-slate-500">INT</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>status_validasi</span>
                    <span className="text-slate-500">ENUM</span>
                  </div>
                </div>
              </div>

              {/* Table 5: Surat Dokumen */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-rose-950/60 border-b border-rose-800/40 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white font-mono">t_arsip_surat</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">Docx</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-amber-400">
                    <span>id (PK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>nomor_surat</span>
                    <span className="text-slate-500">VARCHAR(60)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>jenis_surat</span>
                    <span className="text-slate-500">VARCHAR(50)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>perihal</span>
                    <span className="text-slate-500">TEXT</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>tujuan</span>
                    <span className="text-slate-500">VARCHAR(150)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>tanggal_pelaksanaan</span>
                    <span className="text-slate-500">DATE</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>penandatangan_pembina</span>
                    <span className="text-slate-500">VARCHAR(100)</span>
                  </div>
                </div>
              </div>

              {/* Table 6: Keuangan & Kas */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-teal-950/60 border-b border-teal-800/40 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-white font-mono">t_transaksi_kas</span>
                  </div>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono">Ledger</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-amber-400">
                    <span>id (PK)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>kode_transaksi</span>
                    <span className="text-slate-500">VARCHAR(30)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>jenis</span>
                    <span className="text-slate-500">ENUM(in,out)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>nominal</span>
                    <span className="text-slate-500">DECIMAL(12,2)</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>proker_id (FK NULL)</span>
                    <span className="text-slate-500">VARCHAR(36)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>bukti_nota_file</span>
                    <span className="text-slate-500">VARCHAR(255)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMPLEMENTATION STRATEGY */}
        {activeTab === 'strategy' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-2">
                <span>SECTION 04</span>
                <span>/</span>
                <span>STRATEGI IMPLEMENTASI, ROLLOUT & ADOPSI SEKOLAH</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">4 Tahapan Implementasi ERP OSIS di SMK Tridharma Gorontalo</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                Rencana aksi terstruktur mulai dari inisialisasi basis data sekolah, verifikasi geofencing di lapangan, sosialisasi pengurus, hingga peluncuran portal publik bagi seluruh warga sekolah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </span>
                  <h4 className="text-sm font-bold text-white">Tahap 1: Setup Master Data & Akun (Minggu 1)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Bapak Ilham Arief, S.Pd. selaku Pembina OSIS menetapkan kredensial awal untuk seluruh pengurus inti dan koordinator Sekbid melalui Jendela 1 Control Room. Tidak ada registrasi mandiri guna mencegah akses liar.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
                  Target: 100% akun pengurus aktif, struktur hirarki terisi, dan template kop surat terkunci.
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </span>
                  <h4 className="text-sm font-bold text-white">Tahap 2: Kalibrasi Geofencing Lapangan (Minggu 2)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Pengujian akurasi koordinat GPS di titik gerbang, lapangan upacara, ruang sekretariat OSIS, dan bengkel praktik SMK Tridharma Gorontalo untuk memastikan batas toleransi 150 meter presisi.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
                  Target: Eliminasi false-positive presensi saat pengurus berada di luar kampus.
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </span>
                  <h4 className="text-sm font-bold text-white">Tahap 3: Bimbingan Teknis Pengurus (Minggu 3)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Pelatihan Sekretaris untuk generator dokumen .docx otomatis, Bendahara untuk pelaporan kas, dan Koordinator Sekbid untuk pelaporan progres program kerja berkala.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
                  Target: Seluruh alur administrasi berpindah dari kertas fisik menjadi arsip digital ERP.
                </div>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                    04
                  </span>
                  <h4 className="text-sm font-bold text-white">Tahap 4: Peluncuran Publik Siswa (Minggu 4)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Sosialisasi saat apel hari Senin mengenai portal publik SMK Tridharma, transparansi program kerja OSIS, dan penggunaan Kotak Aspirasi Digital untuk seluruh siswa.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
                  Target: Meningkatkan partisipasi dan kepercayaan seluruh siswa terhadap kepengurusan OSIS.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
