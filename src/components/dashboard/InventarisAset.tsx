import React, { useState } from 'react';
import { InventarisBarang, UserAccount } from '../../types/erp';
import { 
  Package, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Layers, 
  ArrowRightLeft, 
  Trash2,
  Search
} from 'lucide-react';

interface InventarisAsetProps {
  currentUser: UserAccount;
  inventarisList: InventarisBarang[];
  onAddInventaris: (item: Omit<InventarisBarang, 'id' | 'riwayatPeminjaman'>) => void;
  onUpdateInventaris: (item: InventarisBarang) => void;
  onDeleteInventaris: (id: string) => void;
}

export const InventarisAset: React.FC<InventarisAsetProps> = ({
  currentUser,
  inventarisList,
  onAddInventaris,
  onUpdateInventaris,
  onDeleteInventaris,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPinjamBarang, setSelectedPinjamBarang] = useState<InventarisBarang | null>(null);

  // Form Pinjam State
  const [peminjamNama, setPeminjamNama] = useState('');
  const [peminjamKelas, setPeminjamKelas] = useState('');
  const [jumlahPinjam, setJumlahPinjam] = useState<number>(1);
  const [estimasiKembali, setEstimasiKembali] = useState('2026-10-05');
  const [catatanPinjam, setCatatanPinjam] = useState('');

  // Form New Aset State
  const [namaBarang, setNamaBarang] = useState('');
  const [kodeBarang, setKodeBarang] = useState(`AST-TD-${(inventarisList.length + 1).toString().padStart(2, '0')}`);
  const [kategori, setKategori] = useState<InventarisBarang['kategori']>('Elektronik');
  const [jumlahTotal, setJumlahTotal] = useState<number>(1);
  const [lokasiPenyimpanan, setLokasiPenyimpanan] = useState('Ruang Sekretariat OSIS');

  const filteredList = inventarisList.filter(
    (b) =>
      b.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim()) return;

    onAddInventaris({
      kodeBarang: kodeBarang.trim(),
      namaBarang: namaBarang.trim(),
      kategori,
      jumlahTotal: Number(jumlahTotal) || 1,
      jumlahTersedia: Number(jumlahTotal) || 1,
      kondisi: 'Baik',
      lokasiPenyimpanan: lokasiPenyimpanan.trim(),
      status: 'Tersedia',
    });

    setShowAddModal(false);
    setNamaBarang('');
  };

  const handleProcessPinjam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPinjamBarang || !peminjamNama.trim()) return;

    const jlh = Math.min(jumlahPinjam, selectedPinjamBarang.jumlahTersedia);
    const newTersedia = selectedPinjamBarang.jumlahTersedia - jlh;

    const updated: InventarisBarang = {
      ...selectedPinjamBarang,
      jumlahTersedia: newTersedia,
      status: newTersedia === 0 ? 'Kosong/Dipinjam Semua' : 'Dipinjam Sebagian',
      riwayatPeminjaman: [
        {
          id: `pj-${Date.now()}`,
          peminjam: peminjamNama.trim(),
          kelasSekbid: peminjamKelas.trim() || 'Siswa SMK Tridharma',
          jumlah: jlh,
          tanggalPinjam: new Date().toISOString().split('T')[0],
          estimasiKembali,
          status: 'Dipinjam',
          catatan: catatanPinjam.trim(),
        },
        ...selectedPinjamBarang.riwayatPeminjaman,
      ],
    };

    onUpdateInventaris(updated);
    setSelectedPinjamBarang(null);
    setPeminjamNama('');
    setCatatanPinjam('');
  };

  const handleReturnBarang = (barang: InventarisBarang, pinjamId: string, jumlah: number) => {
    const updatedHistory = barang.riwayatPeminjaman.map((pj) => {
      if (pj.id === pinjamId) {
        return { ...pj, status: 'Dikembalikan' as const };
      }
      return pj;
    });

    const newTersedia = Math.min(barang.jumlahTotal, barang.jumlahTersedia + jumlah);

    onUpdateInventaris({
      ...barang,
      jumlahTersedia: newTersedia,
      status: newTersedia === barang.jumlahTotal ? 'Tersedia' : 'Dipinjam Sebagian',
      riwayatPeminjaman: updatedHistory,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>KENDALI SARANA & PRASARANA OSIS</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Manajemen Inventaris & Aset</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pelacakan aset barang milik OSIS SMK Tridharma Gorontalo secara real-time (Tersedia, Dipinjam, Rusak) beserta log sirkulasi peminjaman sarana.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Aset Barang</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aset (nama barang, kode, kategori)..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Total Aset: <strong className="text-slate-900">{inventarisList.length}</strong></span>
          <span>·</span>
          <span>Siap Pakai: <strong className="text-emerald-600">{inventarisList.filter(b => b.jumlahTersedia > 0).length}</strong></span>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {item.kodeBarang}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'Tersedia'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Dipinjam Sebagian'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                {item.namaBarang}
              </h4>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>Kategori: <span className="font-medium text-slate-700">{item.kategori}</span></div>
                <div>Lokasi: <span className="font-medium text-slate-700">{item.lokasiPenyimpanan}</span></div>
              </div>

              {/* Quantity Availability Bar */}
              <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Ketersediaan Unit:</span>
                <span className="font-bold text-slate-900">
                  <span className="text-emerald-600">{item.jumlahTersedia}</span> / {item.jumlahTotal} Unit
                </span>
              </div>
            </div>

            {/* Active Loans Preview */}
            {item.riwayatPeminjaman.some((pj) => pj.status === 'Dipinjam') && (
              <div className="text-[11px] bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                <span className="font-bold text-amber-900 block">Peminjam Sedang Berjalan:</span>
                {item.riwayatPeminjaman
                  .filter((pj) => pj.status === 'Dipinjam')
                  .map((pj) => (
                    <div key={pj.id} className="flex items-center justify-between text-amber-800">
                      <span>{pj.peminjam} ({pj.jumlah} unit)</span>
                      <button
                        onClick={() => handleReturnBarang(item, pj.id, pj.jumlah)}
                        className="text-[10px] font-bold bg-amber-200 hover:bg-amber-300 text-amber-900 px-1.5 py-0.5 rounded transition-colors"
                      >
                        Kembalikan
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedPinjamBarang(item)}
                disabled={item.jumlahTersedia <= 0}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Pinjamkan Barang</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Hapus data aset ${item.namaBarang}?`)) {
                    onDeleteInventaris(item.id);
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                title="Hapus Aset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Pinjam Barang */}
      {selectedPinjamBarang && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Formulir Peminjaman: {selectedPinjamBarang.namaBarang}
              </h3>
              <button
                onClick={() => setSelectedPinjamBarang(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessPinjam} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Peminjam / Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  value={peminjamNama}
                  onChange={(e) => setPeminjamNama(e.target.value)}
                  placeholder="Nama siswa atau perwakilan sekbid..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kelas / Sekbid</label>
                  <input
                    type="text"
                    required
                    value={peminjamKelas}
                    onChange={(e) => setPeminjamKelas(e.target.value)}
                    placeholder="X Askep 1 / Sekbid 4"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jumlah (Maks {selectedPinjamBarang.jumlahTersedia})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedPinjamBarang.jumlahTersedia}
                    value={jumlahPinjam}
                    onChange={(e) => setJumlahPinjam(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Estimasi Tanggal Pengembalian</label>
                <input
                  type="date"
                  required
                  value={estimasiKembali}
                  onChange={(e) => setEstimasiKembali(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Keperluan / Keterangan</label>
                <textarea
                  rows={2}
                  value={catatanPinjam}
                  onChange={(e) => setCatatanPinjam(e.target.value)}
                  placeholder="Kegiatan apel bendera / latihan tari..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPinjamBarang(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Konfirmasi Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add New Aset */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Registrasi Aset Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAset} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kode Aset</label>
                  <input
                    type="text"
                    required
                    value={kodeBarang}
                    onChange={(e) => setKodeBarang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Perlengkapan Acara">Perlengkapan Acara</option>
                    <option value="Atribut Organisasi">Atribut Organisasi</option>
                    <option value="ATK & Arsip">ATK & Arsip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Barang / Aset</label>
                <input
                  type="text"
                  required
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  placeholder="Contoh: Sound Portable Wireless 12 Inch..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jumlah Unit</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={jumlahTotal}
                    onChange={(e) => setJumlahTotal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lokasi Simpan</label>
                  <input
                    type="text"
                    required
                    value={lokasiPenyimpanan}
                    onChange={(e) => setLokasiPenyimpanan(e.target.value)}
                    placeholder="Lemari Ruang OSIS"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
