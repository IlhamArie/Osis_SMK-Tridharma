import React, { useState } from 'react';
import { RapatItem, UserAccount } from '../../types/erp';
import { 
  Calendar, 
  Clock, 
  Users, 
  FileCheck, 
  Plus, 
  Check, 
  X, 
  Save, 
  MapPin, 
  Edit3, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface ManajemenRapatProps {
  currentUser: UserAccount;
  rapatList: RapatItem[];
  accounts: UserAccount[];
  onAddRapat: (rapat: Omit<RapatItem, 'id'>) => void;
  onUpdateRapat: (rapat: RapatItem) => void;
  onDeleteRapat: (id: string) => void;
}

export const ManajemenRapat: React.FC<ManajemenRapatProps> = ({
  currentUser,
  rapatList,
  accounts,
  onAddRapat,
  onUpdateRapat,
  onDeleteRapat,
}) => {
  const [selectedRapat, setSelectedRapat] = useState<RapatItem>(rapatList[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form New Rapat
  const [judulRapat, setJudulRapat] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktuMulai, setWaktuMulai] = useState('14:30 WITA');
  const [waktuSelesai, setWaktuSelesai] = useState('16:30 WITA');
  const [tempat, setTempat] = useState('Ruang Sekretariat OSIS Gedung A');
  const [agenda, setAgenda] = useState('');

  // Editable Notulensi fields for currently selected rapat
  const [pembahasan, setPembahasan] = useState(selectedRapat?.notulensi.pembahasan || '');
  const [kesimpulan, setKesimpulan] = useState(selectedRapat?.notulensi.kesimpulan || '');
  const [tindakLanjut, setTindakLanjut] = useState(selectedRapat?.notulensi.tindakLanjut || '');
  const [savedNotulensiFeedback, setSavedNotulensiFeedback] = useState(false);

  const handleSelectRapat = (rapat: RapatItem) => {
    setSelectedRapat(rapat);
    setPembahasan(rapat.notulensi.pembahasan);
    setKesimpulan(rapat.notulensi.kesimpulan);
    setTindakLanjut(rapat.notulensi.tindakLanjut);
    setSavedNotulensiFeedback(false);
  };

  const handleCreateRapat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulRapat.trim()) return;

    const initialAttendance = accounts.map((acc) => ({
      userId: acc.id,
      nama: acc.fullName,
      jabatan: acc.jabatan,
      hadir: false,
    }));

    onAddRapat({
      nomorRapat: `RPT-2026-${(rapatList.length + 1).toString().padStart(2, '0')}`,
      judulRapat: judulRapat.trim(),
      tanggal,
      waktuMulai,
      waktuSelesai,
      tempat,
      pimpinanRapat: currentUser.fullName,
      notulis: 'Aisyah Putri Djafar (Sekretaris)',
      agenda: agenda.trim(),
      status: 'Terjadwal',
      kehadiran: initialAttendance,
      notulensi: {
        pembahasan: '',
        kesimpulan: '',
        tindakLanjut: '',
      },
    });

    setShowAddModal(false);
    setJudulRapat('');
    setAgenda('');
  };

  const handleToggleAttendance = (userId: string) => {
    if (!selectedRapat) return;
    const updatedKehadiran = selectedRapat.kehadiran.map((item) => {
      if (item.userId === userId) {
        return {
          ...item,
          hadir: !item.hadir,
          waktuHadir: !item.hadir ? new Date().toTimeString().split(' ')[0] : undefined,
        };
      }
      return item;
    });

    const updatedRapat: RapatItem = {
      ...selectedRapat,
      kehadiran: updatedKehadiran,
    };

    setSelectedRapat(updatedRapat);
    onUpdateRapat(updatedRapat);
  };

  const handleSaveNotulensi = () => {
    if (!selectedRapat) return;
    const updatedRapat: RapatItem = {
      ...selectedRapat,
      notulensi: {
        pembahasan,
        kesimpulan,
        tindakLanjut,
      },
    };
    setSelectedRapat(updatedRapat);
    onUpdateRapat(updatedRapat);
    setSavedNotulensiFeedback(true);
    setTimeout(() => setSavedNotulensiFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>KENDALI KESEKRETARIATAN · RAPAT & NOTULENSI DIGITAL</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Manajemen Rapat Terpusat OSIS</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Kalender rapat koordinasi yang dikelola Sekretaris, checklist absensi kehadiran anggota saat sidang pleno, dan notulensi digital terarsip permanen.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Jadwalkan Rapat Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meeting List Column */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Sidang / Rapat OSIS
          </h3>

          <div className="space-y-2.5">
            {rapatList.map((rapat) => {
              const isSelected = selectedRapat?.id === rapat.id;
              const hadirCount = rapat.kehadiran.filter((k) => k.hadir).length;
              return (
                <div
                  key={rapat.id}
                  onClick={() => handleSelectRapat(rapat)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-indigo-600">
                      {rapat.nomorRapat}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rapat.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rapat.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                    {rapat.judulRapat}
                  </h4>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>📅 {rapat.tanggal} · {rapat.waktuMulai}</div>
                    <div>📍 {rapat.tempat}</div>
                    <div className="text-indigo-600 font-medium pt-1">
                      👥 Kehadiran: {hadirCount} / {rapat.kehadiran.length} Anggota
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Rapat Details, Attendance & Notulensi */}
        {selectedRapat ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Header Selected Rapat */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono text-indigo-600 font-bold block mb-0.5">
                    {selectedRapat.nomorRapat}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{selectedRapat.judulRapat}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  <select
                    value={selectedRapat.status}
                    onChange={(e) => {
                      const updated = { ...selectedRapat, status: e.target.value as any };
                      setSelectedRapat(updated);
                      onUpdateRapat(updated);
                    }}
                    className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Pimpinan Rapat:</span>
                  <span className="font-bold text-slate-800">{selectedRapat.pimpinanRapat}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Notulis Sekretariat:</span>
                  <span className="font-bold text-slate-800">{selectedRapat.notulis}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Waktu & Tempat:</span>
                  <span className="font-bold text-slate-800">
                    {selectedRapat.waktuMulai} @ {selectedRapat.tempat}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Agenda Utama:</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {selectedRapat.agenda}
                </p>
              </div>
            </div>

            {/* Attendance Checklist Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Daftar Kehadiran Anggota Rapat</h4>
                </div>
                <span className="text-xs font-mono font-semibold text-indigo-600">
                  {selectedRapat.kehadiran.filter((k) => k.hadir).length} dari {selectedRapat.kehadiran.length} Hadir
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedRapat.kehadiran.map((peserta) => (
                  <div
                    key={peserta.userId}
                    onClick={() => handleToggleAttendance(peserta.userId)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      peserta.hadir
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{peserta.nama}</div>
                      <div className="text-[11px] text-slate-500">{peserta.jabatan}</div>
                      {peserta.waktuHadir && (
                        <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                          Tiba: {peserta.waktuHadir} WITA
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        peserta.hadir
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {peserta.hadir ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notulensi Editor Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Notulensi & Keputusan Rapat</h4>
                </div>
                {savedNotulensiFeedback && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersimpan di Database</span>
                  </span>
                )}
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Pokok Pembahasan & Dinamika Sidang
                  </label>
                  <textarea
                    rows={3}
                    value={pembahasan}
                    onChange={(e) => setPembahasan(e.target.value)}
                    placeholder="Uraikan jalannya diskusi, aspirasi peserta rapat, dan poin pertimbangan..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kesimpulan & Ketetapan Sidang
                  </label>
                  <textarea
                    rows={2}
                    value={kesimpulan}
                    onChange={(e) => setKesimpulan(e.target.value)}
                    placeholder="Keputusan bulat yang disepakati oleh seluruh peserta rapat..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tindak Lanjut (Action Items) & Delegasi Tugas
                  </label>
                  <textarea
                    rows={2}
                    value={tindakLanjut}
                    onChange={(e) => setTindakLanjut(e.target.value)}
                    placeholder="Rincian aksi nyata yang harus diselesaikan sekbid atau koordinator sebelum tenggat waktu..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveNotulensi}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Notulensi ke Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal Add Rapat */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Jadwalkan Rapat OSIS Baru</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRapat} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Judul / Topik Rapat</label>
                <input
                  type="text"
                  required
                  value={judulRapat}
                  onChange={(e) => setJudulRapat(e.target.value)}
                  placeholder="Contoh: Rapat Koordinasi Panitia Bulan Bahasa..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tempat / Ruang</label>
                  <input
                    type="text"
                    required
                    value={tempat}
                    onChange={(e) => setTempat(e.target.value)}
                    placeholder="Ruang OSIS / Aula"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Waktu Mulai</label>
                  <input
                    type="text"
                    required
                    value={waktuMulai}
                    onChange={(e) => setWaktuMulai(e.target.value)}
                    placeholder="14:00 WITA"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Waktu Selesai</label>
                  <input
                    type="text"
                    required
                    value={waktuSelesai}
                    onChange={(e) => setWaktuSelesai(e.target.value)}
                    placeholder="16:00 WITA"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Agenda Utama Pokok</label>
                <textarea
                  rows={3}
                  required
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="1. Pembahasan konsep teknis&#10;2. Pembagian tugas seksi&#10;3. Estimasi anggaran..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                ></textarea>
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
                  Jadwalkan Rapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
