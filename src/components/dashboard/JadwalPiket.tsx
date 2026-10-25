import React, { useState } from 'react';
import { JadwalPiketItem, PresensiRecord, UserAccount, AgendaHarianSekretaris } from '../../types/erp';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  FileText,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

interface JadwalPiketProps {
  currentUser: UserAccount;
  jadwalList: JadwalPiketItem[];
  presensiList: PresensiRecord[];
  agendaSekretaris?: AgendaHarianSekretaris;
  onUpdateAgendaSekretaris?: (agenda: AgendaHarianSekretaris) => void;
  onNavigateToPresensi: () => void;
}

export const JadwalPiket: React.FC<JadwalPiketProps> = ({
  currentUser,
  jadwalList,
  presensiList,
  agendaSekretaris,
  onUpdateAgendaSekretaris,
  onNavigateToPresensi,
}) => {
  // Current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayIndex = new Date().getDay();
  const todayName = dayNames[todayIndex] || 'Kamis';

  const [selectedHari, setSelectedHari] = useState<string>(
    todayName === 'Minggu' ? 'Senin' : todayName
  );

  const selectedJadwal = jadwalList.find((j) => j.hari === selectedHari) || jadwalList[0];

  // Secretary Editor Modal State
  const isSecretaryOrBph = ['pembina', 'ketua', 'wakil', 'sekretaris', 'bendahara'].includes(currentUser.role);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Form State for Secretary Agenda
  const [formTema, setFormTema] = useState(agendaSekretaris?.temaHari || 'Kedisiplinan Gerbang & Pengecekan Kerapian Atribut Kejuruan');
  const [formInstruksi, setFormInstruksi] = useState(agendaSekretaris?.instruksiSekretaris || '');
  const [formKoordinator, setFormKoordinator] = useState(agendaSekretaris?.koordinatorPiket || 'Aisyah Putri Djafar (Sekretaris Umum)');
  const [formPetugasStr, setFormPetugasStr] = useState(agendaSekretaris?.petugasPiket.join(', ') || '');
  const [formCatatan, setFormCatatan] = useState(agendaSekretaris?.catatanKhusus || '');

  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateAgendaSekretaris || !agendaSekretaris) return;

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} WITA`;

    const updated: AgendaHarianSekretaris = {
      ...agendaSekretaris,
      temaHari: formTema.trim(),
      instruksiSekretaris: formInstruksi.trim(),
      koordinatorPiket: formKoordinator.trim(),
      petugasPiket: formPetugasStr.split(',').map((s) => s.trim()).filter(Boolean),
      catatanKhusus: formCatatan.trim(),
      updatedBy: `${currentUser.fullName} (${currentUser.jabatan})`,
      updatedAt: timeStr,
    };

    onUpdateAgendaSekretaris(updated);
    setIsEditorOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>KENDALI KEDISIPLINAN · ROTASI PIKET & AGENDA HARIAN</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Jadwal Piket & Agenda Terintegrasi Sekretaris</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Jadwal operasional harian pengurus OSIS SMK Tridharma Gorontalo yang disinkronkan langsung dengan instruksi harian Sekretaris OSIS dan presensi masuk sekolah (Batas tepat waktu: 07.15 WITA).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSecretaryOrBph && onUpdateAgendaSekretaris && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Input Agenda Hari Ini (Sekretaris)</span>
            </button>
          )}

          <button
            onClick={onNavigateToPresensi}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Buka Presensi Geofencing</span>
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Agenda harian Sekretaris berhasil diperbarui dan disiarkan ke seluruh pengurus OSIS!</span>
        </div>
      )}

      {/* INTEGRATED SECRETARY'S DAILY DIRECTIVE & AGENDA CARD */}
      {agendaSekretaris && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-700/50 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold shadow-md shadow-indigo-500/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    BRIEFING & INPUT SEKRETARIS HARI INI
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-emerald-400 font-bold font-mono">
                    {agendaSekretaris.hari}, {agendaSekretaris.tanggal}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {agendaSekretaris.temaHari}
                </h3>
              </div>
            </div>

            <div className="text-[11px] text-indigo-200/80 font-mono text-left sm:text-right">
              <span>Diterbitkan oleh: <strong>{agendaSekretaris.updatedBy}</strong></span>
              <div className="text-[10px] text-slate-400">{agendaSekretaris.updatedAt}</div>
            </div>
          </div>

          {/* Secretary Directive Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instruksi Resmi Sekretaris OSIS untuk Seluruh Pengurus:</span>
            </span>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed italic">
              "{agendaSekretaris.instruksiSekretaris}"
            </p>
          </div>

          {/* Today's Officers & Schedule Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            <div className="md:col-span-6 bg-slate-950/60 rounded-2xl p-4 border border-indigo-800/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Petugas Piket Bertugas Hari Ini:</span>
                <span className="text-[10px] text-indigo-300 font-mono">Koordinator: {agendaSekretaris.koordinatorPiket.split('(')[0]}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agendaSekretaris.petugasPiket.map((petugas, idx) => {
                  const isMe = petugas.toLowerCase().includes(currentUser.fullName.toLowerCase()) ||
                               currentUser.fullName.toLowerCase().includes(petugas.toLowerCase());
                  return (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                        isMe
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {isMe && <span>🎯</span>}
                      <span>{petugas}</span>
                      {isMe && <span className="text-[9px] bg-black/30 text-amber-100 px-1 rounded">ANDA</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-6 bg-slate-950/60 rounded-2xl p-4 border border-indigo-800/40 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Rangkaian Agenda Hari Ini:</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {agendaSekretaris.agendaKegiatan.map((ag, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-[10px] font-mono text-indigo-300 font-bold shrink-0 bg-white/5 px-1.5 py-0.5 rounded">
                      {ag.waktu.split(' ')[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white block truncate">{ag.kegiatan}</span>
                      <span className="text-[10px] text-slate-400">{ag.lokasi} · PJ: {ag.penanggungJawab}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Selector Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {jadwalList.map((j) => {
          const isToday = j.hari === todayName;
          const isSelected = j.hari === selectedHari;
          return (
            <button
              key={j.id}
              onClick={() => setSelectedHari(j.hari)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{j.hari}</span>
              {isToday && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  HARI INI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Duty Officers & Presensi Status */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                Petugas Piket Rutin Hari {selectedJadwal.hari}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Koordinator: {selectedJadwal.koordinator}
              </h3>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {selectedJadwal.anggotaPiket.length} Petugas
            </span>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Daftar Petugas & Status Presensi Kehadiran Sekolah:
            </span>
            <div className="space-y-2">
              {selectedJadwal.anggotaPiket.map((petugas, idx) => {
                // Check if this officer has a presensi record today
                const record = presensiList.find((p) => p.namaPengurus.includes(petugas.split(' ')[0]));
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {petugas.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{petugas}</div>
                        <div className="text-[11px] text-slate-500">Pengurus OSIS Tridharma</div>
                      </div>
                    </div>

                    <div>
                      {record ? (
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold font-mono ${
                            record.isTerlambat
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            <span>{record.isTerlambat ? `Terlambat (${record.waktu})` : `Tepat Waktu (${record.waktu})`}</span>
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded bg-slate-200 text-slate-600 text-[10px] font-mono">
                          Belum Presensi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Duty Instructions & SOP */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">SOP & Tugas Pokok Piket</h3>
              <p className="text-xs text-slate-500">
                Wajib dilaksanakan dan dilaporkan kepada Pembina OSIS Bapak Ilham Arief, S.Pd.
              </p>
            </div>

            <div className="space-y-2.5">
              {selectedJadwal.tugasUtama.map((tugas, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{tugas}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
            <span className="font-medium">Batas Waktu Hadir: <strong>07:15 WITA</strong></span>
            <button
              onClick={onNavigateToPresensi}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 underline underline-offset-2"
            >
              <span>Presensi GPS Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECRETARY AGENDA EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  Form Kesekretariatan OSIS
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Input & Terbitkan Agenda Harian Sekretaris
                </h3>
                <p className="text-xs text-slate-500">
                  Agenda dan instruksi yang Anda simpan akan langsung disiarkan ke seluruh pengurus OSIS hari ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tema Kedisiplinan / Fokus Harian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTema}
                  onChange={(e) => setFormTema(e.target.value)}
                  placeholder="Contoh: Kedisiplinan Gerbang & Pengecekan Kerapian Seragam"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Arahan & Instruksi Khusus Sekretaris untuk Seluruh Pengurus <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formInstruksi}
                  onChange={(e) => setFormInstruksi(e.target.value)}
                  placeholder="Tuliskan arahan tugas piket, jam kumpul gerbang (sebelum 07.00 WITA), dan batas presensi 07.15 WITA..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Koordinator Piket Hari Ini
                  </label>
                  <input
                    type="text"
                    value={formKoordinator}
                    onChange={(e) => setFormKoordinator(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Daftar Nama Petugas (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={formPetugasStr}
                    onChange={(e) => setFormPetugasStr(e.target.value)}
                    placeholder="Nama 1, Nama 2, Nama 3..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan Khusus / Berkas Surat yang Perlu Disiapkan
                </label>
                <input
                  type="text"
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Contoh: Berkas proposal LDKS disiapkan untuk tanda tangan pembina"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Terbitkan Agenda Harian</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
