import React, { useState } from 'react';
import { ProgramKerja, SystemModulesConfig, ProkerStatus } from '../../types/erp';
import { VOCATIONAL_IMAGE_PRESETS } from '../../data/imagePresets';
import { 
  Sliders, 
  PlusCircle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Trash2, 
  Edit3,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';

interface ControlRoomJendela2Props {
  prokerList: ProgramKerja[];
  systemModules: SystemModulesConfig;
  onAddProker: (proker: Omit<ProgramKerja, 'id' | 'updatedAt'>) => void;
  onUpdateProker: (proker: ProgramKerja) => void;
  onDeleteProker: (id: string) => void;
  onToggleModule: (moduleKey: keyof SystemModulesConfig) => void;
}

export const ControlRoomJendela2: React.FC<ControlRoomJendela2Props> = ({
  prokerList,
  systemModules,
  onAddProker,
  onUpdateProker,
  onDeleteProker,
  onToggleModule,
}) => {
  const [activeTab, setActiveTab] = useState<'proker' | 'modules'>('proker');
  const [showAddProkerModal, setShowAddProkerModal] = useState(false);
  const [editingProker, setEditingProker] = useState<ProgramKerja | null>(null);

  // Form New Proker
  const [kode, setKode] = useState('');
  const [namaProker, setNamaProker] = useState('');
  const [sekbid, setSekbid] = useState('Sekbid 1 (Ketaqwaan)');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [targetBulan, setTargetBulan] = useState('Oktober 2026');
  const [anggaranRAB, setAnggaranRAB] = useState<number>(3000000);
  const [deskripsi, setDeskripsi] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [indikatorKeberhasilan, setIndikatorKeberhasilan] = useState('');
  const [posterUrl, setPosterUrl] = useState(VOCATIONAL_IMAGE_PRESETS[16].url);

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPosterUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaProker.trim() || !penanggungJawab.trim()) return;

    const generatedKode = kode.trim() || `PRK-2026-${(prokerList.length + 1).toString().padStart(2, '0')}`;

    onAddProker({
      kode: generatedKode,
      namaProker: namaProker.trim(),
      sekbid,
      penanggungJawab: penanggungJawab.trim(),
      targetBulan,
      anggaranRAB: Number(anggaranRAB) || 0,
      realisasiAnggaran: 0,
      progress: 0,
      status: 'Perencanaan',
      deskripsi: deskripsi.trim(),
      tujuan: tujuan.trim(),
      indikatorKeberhasilan: indikatorKeberhasilan.trim(),
      catatanTerbaru: 'Program kerja baru dimasukkan ke sistem kendali.',
      posterUrl: posterUrl.trim(),
    });

    setShowAddProkerModal(false);
    setKode('');
    setNamaProker('');
    setPenanggungJawab('');
    setDeskripsi('');
    setTujuan('');
    setIndikatorKeberhasilan('');
  };

  const handleSaveProgress = (proker: ProgramKerja, newProgress: number, newStatus: ProkerStatus) => {
    onUpdateProker({
      ...proker,
      progress: newProgress,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>KENDALI OPERASIONAL · JENDELA 2</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Manajemen Proker & Konfigurasi Modul ERP</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Panel eksklusif Admin, Ketua OSIS, dan BPH untuk menginput Proker, mendelegasikan tugas ke Sekbid, memperbarui realisasi progres capaian, serta mengaktifkan/menonaktifkan modul sistem sesuai kebutuhan organisasi.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('proker')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'proker'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Daftar Program Kerja ({prokerList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'modules'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Saklar Modul Sistem (Feature Flags)</span>
        </button>
      </div>

      {/* TAB 1: PROKER */}
      {activeTab === 'proker' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Program Kerja OSIS SMK Tridharma</h3>
              <p className="text-xs text-slate-500">
                Data progres persentase di sini langsung memperbarui visual bar di Halaman Portal Publik.
              </p>
            </div>

            <button
              onClick={() => setShowAddProkerModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Proker Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {prokerList.map((proker) => (
              <div
                key={proker.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {proker.posterUrl && (
                      <div className="w-14 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={proker.posterUrl}
                          alt={proker.namaProker}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {proker.kode}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{proker.sekbid}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{proker.namaProker}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">PJ:</span>
                    <span className="text-xs font-bold text-slate-800">{proker.penanggungJawab}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus proker "${proker.namaProker}"?`)) {
                          onDeleteProker(proker.id);
                        }
                      }}
                      className="ml-2 text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Hapus Proker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Deskripsi Kegiatan:</span>
                    <p className="text-slate-700 leading-relaxed">{proker.deskripsi}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Tujuan & Target:</span>
                    <p className="text-slate-700 leading-relaxed">{proker.tujuan}</p>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Bulan Target: <span className="font-semibold text-slate-700">{proker.targetBulan}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Alokasi Anggaran:</span>
                    <div className="text-slate-800 font-mono font-bold">
                      RAB: Rp {proker.anggaranRAB.toLocaleString('id-ID')}
                    </div>
                    <div className="text-emerald-700 font-mono text-[11px] mt-0.5">
                      Realisasi: Rp {proker.realisasiAnggaran.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Interactive Progress Slider & Status Selector */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 max-w-md space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Set Realisasi Capaian Proker:</span>
                      <span className="font-mono font-bold text-indigo-600">{proker.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={proker.progress}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        let autoStatus: ProkerStatus = proker.status;
                        if (val === 100) autoStatus = 'Selesai';
                        else if (val > 0) autoStatus = 'Berjalan';
                        else autoStatus = 'Perencanaan';
                        handleSaveProgress(proker, val, autoStatus);
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                    {(['Perencanaan', 'Berjalan', 'Evaluasi', 'Selesai'] as ProkerStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleSaveProgress(proker, proker.progress, st)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                          proker.status === st
                            ? st === 'Selesai'
                              ? 'bg-emerald-600 text-white'
                              : st === 'Berjalan'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM MODULE TOGGLES */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Saklar Modul Dashboard OSIS</h3>
            <p className="text-xs text-slate-500">
              Admin dapat mengaktifkan atau menonaktifkan fitur modul sesuai fase birokrasi yang dibutuhkan. Modul nonaktif akan disembunyikan dari navigasi sidebar pengurus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                key: 'modulPresensi' as const,
                title: 'Modul Presensi Geofencing GPS',
                desc: 'Validasi kehadiran pengurus berbasis lokasi koordinat radius 150m SMK Tridharma Gorontalo.',
              },
              {
                key: 'modulSurat' as const,
                title: 'Modul Surat-Menyurat Otomatis (.docx)',
                desc: 'Pembuatan surat resmi ber-kop otomatis dan unduhan format dokumen Microsoft Word.',
              },
              {
                key: 'modulRapat' as const,
                title: 'Modul Manajemen Rapat & Notulensi',
                desc: 'Kalender agenda rapat, checklist presensi peserta, dan notulensi digital terpusat.',
              },
              {
                key: 'modulKeuangan' as const,
                title: 'Modul Kas & Kearsipan Keuangan',
                desc: 'Buku kas umum masuk/keluar serta penyimpanan arsip kuitansi dan nota belanja.',
              },
              {
                key: 'modulInventaris' as const,
                title: 'Modul Manajemen Inventaris Aset',
                desc: 'Pencatatan aset barang milik OSIS dan pencatatan status peminjaman sarana.',
              },
              {
                key: 'modulPiket' as const,
                title: 'Modul Jadwal Piket Harian',
                desc: 'Rotasi pembagian tugas harian Senin s.d. Sabtu terintegrasi presensi.',
              },
              {
                key: 'modulAspirasiPublik' as const,
                title: 'Modul Kotak Aspirasi Digital Siswa',
                desc: 'Menerima dan memoderasi saran dari seluruh siswa di Portal Publik.',
              },
              {
                key: 'modulGaleriPublik' as const,
                title: 'Modul Lensa Dokumentasi Kegiatan',
                desc: 'Pameran dokumentasi kegiatan siswa di laman muka portal.',
              },
            ].map((mod) => {
              const isEnabled = systemModules[mod.key];
              return (
                <div
                  key={mod.key}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    isEnabled
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{mod.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{mod.desc}</p>
                    <span
                      className={`inline-block mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isEnabled ? 'STATUS: AKTIF' : 'STATUS: DINONAKTIFKAN'}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleModule(mod.key)}
                    className="p-1 text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-8 h-8 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add Proker */}
      {showAddProkerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Pencatatan Program Kerja Baru</span>
              </h3>
              <button
                onClick={() => setShowAddProkerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProker} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Program Kerja</label>
                <input
                  type="text"
                  required
                  value={namaProker}
                  onChange={(e) => setNamaProker(e.target.value)}
                  placeholder="Contoh: Peringatan Hari Guru & Apresiasi Vokasi..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sekbid Pengampu</label>
                  <select
                    value={sekbid}
                    onChange={(e) => setSekbid(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sekbid 1 (Ketaqwaan)">Sekbid 1 (Ketaqwaan)</option>
                    <option value="Sekbid 2 (Budi Pekerti)">Sekbid 2 (Budi Pekerti)</option>
                    <option value="Sekbid 3 (Bela Negara)">Sekbid 3 (Bela Negara)</option>
                    <option value="Sekbid 4 (Seni & Olahraga)">Sekbid 4 (Seni & Olahraga)</option>
                    <option value="Sekbid 5 (Demokrasi & HAM)">Sekbid 5 (Demokrasi & HAM)</option>
                    <option value="Sekbid 6 (Kewirausahaan)">Sekbid 6 (Kewirausahaan)</option>
                    <option value="Sekbid 7 (Kesehatan)">Sekbid 7 (Kesehatan)</option>
                    <option value="Sekbid 8 (TIK)">Sekbid 8 (TIK)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    required
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    placeholder="Nama Koordinator"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Bulan</label>
                  <input
                    type="text"
                    required
                    value={targetBulan}
                    onChange={(e) => setTargetBulan(e.target.value)}
                    placeholder="November 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Anggaran RAB (Rp)</label>
                  <input
                    type="number"
                    required
                    value={anggaranRAB}
                    onChange={(e) => setAnggaranRAB(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Poster / Flyer Image */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Poster / Banner Kegiatan:</label>
                  <label className="cursor-pointer px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors">
                    <UploadCloud className="w-3 h-3" />
                    <span>Unggah Poster</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePosterUpload}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="URL Poster..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800 focus:outline-none"
                />

                {posterUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-300 shrink-0">
                      <img
                        src={posterUrl}
                        alt="Preview Poster"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">Pratinjau visual yang akan tampil pada kartu Transparansi Proker di Laman Publik</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={2}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Ringkasan konsep dan bentuk kegiatan..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProkerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Simpan Proker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
