import React, { useState } from 'react';
import { TransaksiKas, UserAccount } from '../../types/erp';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  FileText, 
  Receipt, 
  Eye, 
  Trash2, 
  DollarSign, 
  ShieldCheck 
} from 'lucide-react';

interface KeuanganKasProps {
  currentUser: UserAccount;
  transaksiList: TransaksiKas[];
  onAddTransaksi: (transaksi: Omit<TransaksiKas, 'id'>) => void;
  onDeleteTransaksi: (id: string) => void;
}

export const KeuanganKas: React.FC<KeuanganKasProps> = ({
  currentUser,
  transaksiList,
  onAddTransaksi,
  onDeleteTransaksi,
}) => {
  const [filterJenis, setFilterJenis] = useState<'Semua' | 'Pemasukan' | 'Pengeluaran'>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<TransaksiKas | null>(null);

  // Form State
  const [jenis, setJenis] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
  const [kategori, setKategori] = useState<TransaksiKas['kategori']>('ATK & Kesekretariatan');
  const [nominal, setNominal] = useState<number>(150000);
  const [keterangan, setKeterangan] = useState('');
  const [nomorBukti, setNomorBukti] = useState(`NOTA-${new Date().getMonth() + 1}-${Math.floor(100 + Math.random() * 900)}`);
  const [lampiranNotaUrl, setLampiranNotaUrl] = useState('Bukti Pembelian Perlengkapan Toko Tridharma');

  // Aggregations
  const totalMasuk = transaksiList
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalKeluar = transaksiList
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((acc, t) => acc + t.nominal, 0);

  const saldoKas = totalMasuk - totalKeluar;

  const filteredTransaksi = filterJenis === 'Semua'
    ? transaksiList
    : transaksiList.filter((t) => t.jenis === filterJenis);

  const handleCreateTransaksi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim() || nominal <= 0) return;

    onAddTransaksi({
      kodeTransaksi: `KAS-${jenis === 'Pemasukan' ? 'IN' : 'OUT'}-2026-${(transaksiList.length + 1).toString().padStart(3, '0')}`,
      tanggal: new Date().toISOString().split('T')[0],
      jenis,
      kategori,
      nominal: Number(nominal),
      keterangan: keterangan.trim(),
      penanggungJawab: currentUser.fullName,
      nomorBukti: nomorBukti.trim(),
      lampiranNotaUrl: lampiranNotaUrl.trim(),
    });

    setShowAddModal(false);
    setKeterangan('');
    setNominal(100000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-mono mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>KENDALI KEBENDAHARAAN · BUKU KAS UMUM & KARSIPAN</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Keuangan & Kearsipan Kuitansi OSIS</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pencatatan mutasi kas masuk/keluar yang akuntabel, terhubung dengan anggaran Proker dan bukti kuitansi digital SMK Tridharma Gorontalo.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat Transaksi Kas</span>
        </button>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Saldo Kas Terkini</span>
            <Wallet className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
            Rp {saldoKas.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">
            Surplus Kas Operasional Aktif
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Total Pemasukan (Inflow)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 tabular-nums">
            Rp {totalMasuk.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Iuran Anggota + Dana BOS Kesiswaan
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Total Pengeluaran (Outflow)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 tabular-nums">
            Rp {totalKeluar.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Realisasi Proker, ATK & Perlengkapan
          </div>
        </div>
      </div>

      {/* Filter & Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Buku Kas Umum (BKU)</h3>
            <p className="text-xs text-slate-500">Mutasi kas lengkap dengan nomor bukti verifikasi</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            {(['Semua', 'Pemasukan', 'Pengeluaran'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterJenis(mode)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filterJenis === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Tanggal & Kode</th>
                <th className="py-3 px-4">Jenis & Kategori</th>
                <th className="py-3 px-4">Uraian / Keterangan</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">No. Bukti / Nota</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransaksi.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{tr.tanggal}</div>
                    <div className="text-[11px] font-mono text-slate-400">{tr.kodeTransaksi}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        tr.jenis === 'Pemasukan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tr.jenis}
                    </span>
                    <div className="text-[11px] font-medium text-slate-600 mt-0.5">{tr.kategori}</div>
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-semibold text-slate-900">{tr.keterangan}</div>
                    <div className="text-[11px] text-slate-500">PJ: {tr.penanggungJawab}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className={tr.jenis === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'}>
                      {tr.jenis === 'Pemasukan' ? '+ ' : '- '}
                      Rp {tr.nominal.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedReceipt(tr)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono text-[11px] inline-flex items-center gap-1 transition-colors"
                      title="Lihat Kuitansi Digital"
                    >
                      <Receipt className="w-3 h-3 text-indigo-600" />
                      <span>{tr.nomorBukti}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus transaksi ${tr.kodeTransaksi}?`)) {
                          onDeleteTransaksi(tr.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Transaksi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>Pencatatan Transaksi Kas Baru</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransaksi} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Arus Kas</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-teal-500"
                  >
                    <option value="Pengeluaran">Pengeluaran (Kas Keluar)</option>
                    <option value="Pemasukan">Pemasukan (Kas Masuk)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={nominal}
                    onChange={(e) => setNominal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Kategori Akuntansi</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
                >
                  <option value="ATK & Kesekretariatan">ATK & Kesekretariatan</option>
                  <option value="Konsumsi Rapat">Konsumsi Rapat / Pertemuan</option>
                  <option value="Sarana & Perlengkapan">Sarana & Perlengkapan Acara</option>
                  <option value="Biaya Kegiatan Proker">Biaya Kegiatan Proker</option>
                  <option value="Kas Anggota">Iuran Kas Pengurus</option>
                  <option value="BOS Kesiswaan">Dana BOS Kesiswaan</option>
                  <option value="Sponsor/Donasi">Sponsor / Donasi Luar</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Uraian / Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Pembelian kertas sertifikat dan konsumsi juri..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor Nota / Kuitansi</label>
                  <input
                    type="text"
                    required
                    value={nomorBukti}
                    onChange={(e) => setNomorBukti(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Keterangan Nota Lampiran</label>
                  <input
                    type="text"
                    value={lampiranNotaUrl}
                    onChange={(e) => setLampiranNotaUrl(e.target.value)}
                    placeholder="Struk Toko / Stempel"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
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
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Digital Receipt Viewer */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">Bukti Arsip Kuitansi Digital</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
              <div className="text-center font-bold text-slate-900 pb-2 border-b border-dashed border-slate-300">
                OSIS SMK TRIDHARMA GORONTALO
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>No. Bukti:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.nomorBukti}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Tanggal:</span>
                <span>{selectedReceipt.tanggal}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Kategori:</span>
                <span>{selectedReceipt.kategori}</span>
              </div>
              <div className="py-2 border-t border-b border-dashed border-slate-300">
                <div className="text-[11px] text-slate-500">Keterangan:</div>
                <div className="text-slate-900 font-semibold">{selectedReceipt.keterangan}</div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-1">
                <span>TOTAL:</span>
                <span>Rp {selectedReceipt.nominal.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 text-center">
                Diverifikasi oleh Bendahara OSIS & Pembina
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Tutup Bukti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
