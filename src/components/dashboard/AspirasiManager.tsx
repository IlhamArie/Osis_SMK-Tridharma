import React, { useState } from 'react';
import { AspirasiSiswa, UserAccount } from '../../types/erp';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Send, 
  Search, 
  Filter, 
  Trash2, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

interface AspirasiManagerProps {
  currentUser: UserAccount;
  aspirasiList: AspirasiSiswa[];
  onUpdateAspirasi: (item: AspirasiSiswa) => void;
  onDeleteAspirasi: (id: string) => void;
}

export const AspirasiManager: React.FC<AspirasiManagerProps> = ({
  currentUser,
  aspirasiList,
  onUpdateAspirasi,
  onDeleteAspirasi,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAspirasi, setSelectedAspirasi] = useState<AspirasiSiswa | null>(null);

  // Response text state
  const [tanggapanText, setTanggapanText] = useState('');
  const [statusResponse, setStatusResponse] = useState<AspirasiSiswa['status']>('Ditindaklanjuti');

  const filteredList = aspirasiList.filter((item) => {
    const matchesFilter = filterStatus === 'Semua' || item.status === filterStatus;
    const matchesSearch =
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tiketKode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectAspirasi = (item: AspirasiSiswa) => {
    setSelectedAspirasi(item);
    setTanggapanText(item.tanggapanPengurus || '');
    setStatusResponse(item.status);
  };

  const handleSaveTanggapan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAspirasi) return;

    const updated: AspirasiSiswa = {
      ...selectedAspirasi,
      status: statusResponse,
      tanggapanPengurus: tanggapanText.trim(),
      tanggalTanggapan: new Date().toISOString().split('T')[0],
    };

    onUpdateAspirasi(updated);
    setSelectedAspirasi(updated);
    alert(`Tanggapan untuk tiket ${updated.tiketKode} berhasil disimpan dan diperbarui di portal publik!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>KENDALI KOMUNIKASI & HUBUNGAN SISWA</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Manajemen Aspirasi & Masukan Siswa</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Tinjau seluruh aspirasi dan kritik konstruktif yang dikirim siswa melalui Portal Publik. Berikan tanggapan resmi yang dapat dilacak siswa menggunakan kode tiket.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tiket, judul, atau kategori aspirasi..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
          {['Semua', 'Masuk', 'Ditinjau', 'Ditindaklanjuti', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: List & Detail Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Aspirasi Cards List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredList.map((item) => {
            const isSelected = selectedAspirasi?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectAspirasi(item)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.tiketKode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Ditindaklanjuti'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                  {item.judul}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 mb-2.5">
                  {item.pesan}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>
                    Dari: <strong>{item.namaPengirim}</strong> ({item.kelasPengirim})
                  </span>
                  <span>{item.tanggal}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Response / Moderation Card */}
        <div className="lg:col-span-6">
          {selectedAspirasi ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono text-indigo-600 font-bold block mb-0.5">
                    {selectedAspirasi.tiketKode} · {selectedAspirasi.kategori}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{selectedAspirasi.judul}</h3>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Hapus tiket ${selectedAspirasi.tiketKode}?`)) {
                      onDeleteAspirasi(selectedAspirasi.id);
                      setSelectedAspirasi(null);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Hapus Tiket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message Content */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Pengirim: <strong>{selectedAspirasi.namaPengirim}</strong></span>
                  <span>Kelas: <strong>{selectedAspirasi.kelasPengirim}</strong></span>
                  <span>Tanggal: {selectedAspirasi.tanggal}</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-sans italic">
                  "{selectedAspirasi.pesan}"
                </p>
              </div>

              {/* Response Form */}
              <form onSubmit={handleSaveTanggapan} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status Penanganan</label>
                  <select
                    value={statusResponse}
                    onChange={(e) => setStatusResponse(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Ditinjau">Ditinjau oleh Pengurus</option>
                    <option value="Ditindaklanjuti">Ditindaklanjuti ke Pihak Terkait</option>
                    <option value="Selesai">Selesai Dituntaskan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggapan Resmi Pengurus (Dapat dilihat Siswa via Kode Tiket)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={tanggapanText}
                    onChange={(e) => setTanggapanText(e.target.value)}
                    placeholder="Tuliskan respon resmi, langkah nyata yang telah atau akan diambil pengurus..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publikasikan Tanggapan Resmi</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-64 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
              Pilih salah satu kartu tiket aspirasi di sebelah kiri untuk melihat rincian & memberi tanggapan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
