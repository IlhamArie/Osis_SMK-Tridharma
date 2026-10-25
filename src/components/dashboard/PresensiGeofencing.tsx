import React, { useState, useEffect } from 'react';
import { PresensiRecord, UserAccount, SchoolGeoConfig, AgendaHarianSekretaris } from '../../types/erp';
import { 
  SCHOOL_GEO_CONFIG, 
  calculateHaversineDistance, 
  isWithinSchoolRadius, 
  GEOFENCE_PRESETS,
  getWitaDate,
  evaluateTardiness,
  TIME_SIMULATION_PRESETS,
  SCHOOL_CUTOFF_HOUR,
  SCHOOL_CUTOFF_MINUTE
} from '../../utils/geoUtils';
import { PresensiVisualMap } from './PresensiVisualMap';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  CheckCircle2,
  XCircle, 
  AlertTriangle, 
  AlertOctagon,
  Clock, 
  Radio, 
  ShieldCheck, 
  Compass, 
  RefreshCw,
  Search,
  Sliders,
  ExternalLink,
  Sparkles,
  Calendar,
  FileText,
  BellRing,
  UserCheck,
  CheckCheck,
  Award,
  Filter,
  AlertCircle,
  X,
  Save,
  Edit3,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RekapPresensiBulananModal } from './RekapPresensiBulananModal';

interface PresensiGeofencingProps {
  currentUser: UserAccount;
  presensiList: PresensiRecord[];
  currentGeoConfig?: SchoolGeoConfig;
  agendaSekretaris?: AgendaHarianSekretaris;
  onUpdateAgendaSekretaris?: (agenda: AgendaHarianSekretaris) => void;
  onAddPresensi: (record: Omit<PresensiRecord, 'id'>) => void;
  onUpdatePresensi?: (record: PresensiRecord) => void;
  onBatchValidatePresensi?: (
    ids: string[], 
    status: 'Disetujui Sah' | 'Diberi Teguran' | 'Ditolak / Anulir', 
    catatan?: string
  ) => void;
  onNavigateToMapsConfig?: () => void;
}

export const PresensiGeofencing: React.FC<PresensiGeofencingProps> = ({
  currentUser,
  presensiList,
  currentGeoConfig,
  agendaSekretaris,
  onUpdateAgendaSekretaris,
  onAddPresensi,
  onUpdatePresensi,
  onBatchValidatePresensi,
  onNavigateToMapsConfig,
}) => {
  const activeGeo = currentGeoConfig || SCHOOL_GEO_CONFIG;
  const isPembina = currentUser.role === 'pembina';

  // State Validasi Khusus Pembina
  const [activePresensiTab, setActivePresensiTab] = useState<'daftar' | 'absen' | 'radar' | 'agenda'>(
    isPembina ? 'daftar' : 'absen'
  );
  const [filterKategori, setFilterKategori] = useState<
    'semua' | 'bph' | 'sekbid' | 'menunggu' | 'tervalidasi' | 'terlambat'
  >('semua');
  const [validationModalRecord, setValidationModalRecord] = useState<PresensiRecord | null>(null);
  const [catatanValidasi, setCatatanValidasi] = useState<string>('');
  const [statusValidasiPilihan, setStatusValidasiPilihan] = useState<
    'Disetujui Sah' | 'Diberi Teguran' | 'Ditolak / Anulir'
  >('Disetujui Sah');
  const [toastValidasi, setToastValidasi] = useState<string | null>(null);
  const [isRekapModalOpen, setIsRekapModalOpen] = useState<boolean>(false);

  // States for Simple & Practical Workflow
  const [forceShowAbsenForm, setForceShowAbsenForm] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Current detected or simulated location
  const [currentLat, setCurrentLat] = useState<number>(activeGeo.latitude);
  const [currentLng, setCurrentLng] = useState<number>(activeGeo.longitude);
  const [locationName, setLocationName] = useState<string>(activeGeo.namaLokasi);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsSource, setGpsSource] = useState<'simulator' | 'device'>('simulator');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WITA Clock & Tardiness State (Batas Masuk 07:15 WITA)
  const [selectedTimePreset, setSelectedTimePreset] = useState<string>('realtime');
  const [customHours, setCustomHours] = useState<number>(() => getWitaDate().getHours());
  const [customMinutes, setCustomMinutes] = useState<number>(() => getWitaDate().getMinutes());
  const [customSeconds, setCustomSeconds] = useState<number>(() => getWitaDate().getSeconds());
  const [alasanKeterlambatan, setAlasanKeterlambatan] = useState<string>('');

  // Secretary Agenda Editor State
  const [isAgendaEditorOpen, setIsAgendaEditorOpen] = useState(false);
  const [formTema, setFormTema] = useState(agendaSekretaris?.temaHari || '');
  const [formInstruksi, setFormInstruksi] = useState(agendaSekretaris?.instruksiSekretaris || '');
  const [formKoordinator, setFormKoordinator] = useState(agendaSekretaris?.koordinatorPiket || '');
  const [formPetugasStr, setFormPetugasStr] = useState(agendaSekretaris?.petugasPiket.join(', ') || '');
  const [formCatatan, setFormCatatan] = useState(agendaSekretaris?.catatanKhusus || '');

  // Keep editor state in sync if agendaSekretaris changes externally
  useEffect(() => {
    if (agendaSekretaris) {
      setFormTema(agendaSekretaris.temaHari);
      setFormInstruksi(agendaSekretaris.instruksiSekretaris);
      setFormKoordinator(agendaSekretaris.koordinatorPiket);
      setFormPetugasStr(agendaSekretaris.petugasPiket.join(', '));
      setFormCatatan(agendaSekretaris.catatanKhusus || '');
    }
  }, [agendaSekretaris]);

  const handleSaveAgendaFromPresensi = (e: React.FormEvent) => {
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
    setIsAgendaEditorOpen(false);
    setToastValidasi('Agenda harian Sekretaris berhasil diperbarui dan disiarkan!');
    setTimeout(() => setToastValidasi(null), 3500);
  };

  // Ticker waktu WITA otomatis
  useEffect(() => {
    if (selectedTimePreset !== 'realtime') return;
    const interval = setInterval(() => {
      const nowWita = getWitaDate();
      setCustomHours(nowWita.getHours());
      setCustomMinutes(nowWita.getMinutes());
      setCustomSeconds(nowWita.getSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTimePreset]);

  // Evaluasi keterlambatan terhadap 07:15 WITA
  const tardinessInfo = evaluateTardiness(customHours, customMinutes);
  const formattedWitaTime = `${customHours.toString().padStart(2, '0')}:${customMinutes.toString().padStart(2, '0')}:${customSeconds.toString().padStart(2, '0')} WITA`;

  // Form Presensi State (hanya dipakai jika bukan Pembina)
  const [jenisPresensi, setJenisPresensi] = useState<PresensiRecord['jenis']>('Kehadiran Sekolah & Piket');
  const [keterangan, setKeterangan] = useState<string>('Piket gerbang utama & presensi masuk sekolah');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Calculate Distance & Validity against active dynamic geofence
  const evaluation = isWithinSchoolRadius(
    currentLat, 
    currentLng, 
    activeGeo.latitude, 
    activeGeo.longitude, 
    activeGeo.radiusToleransiMeter
  );
  const currentDistance = evaluation.distance;
  const isValid = evaluation.isValid;

  // Real GPS Device Fetch
  const handleFetchDeviceGps = () => {
    setIsLocating(true);
    setErrorMessage(null);

    if (!('geolocation' in navigator)) {
      setErrorMessage('Browser tidak mendukung HTML5 Geolocation API.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLat(lat);
        setCurrentLng(lng);
        setLocationName('GPS Perangkat Asli (HTML5)');
        setGpsSource('device');
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setErrorMessage(
          `Gagal membaca koordinat GPS perangkat (${error.message}). Anda tetap dapat menggunakan simulator koordinat di bawah untuk menguji validasi radius.`
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Submit Presensi (Khusus akun Non-Pembina seperti BPH)
  const handleSubmitPresensi = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = formattedWitaTime;

    let statusFinal: PresensiRecord['status'];
    if (!isValid) {
      statusFinal = 'Di Luar Radius';
    } else if (tardinessInfo.isTerlambat) {
      statusFinal = 'Hadir Valid (Terlambat)';
    } else {
      statusFinal = 'Hadir Valid (Tepat Waktu)';
    }

    const isBPH = ['ketua', 'wakil', 'sekretaris', 'bendahara'].includes(currentUser.role);

    onAddPresensi({
      userId: currentUser.id,
      namaPengurus: currentUser.fullName,
      jabatan: currentUser.jabatan,
      tanggal: dateStr,
      waktu: timeStr,
      jenis: jenisPresensi,
      latitude: currentLat,
      longitude: currentLng,
      jarakMeter: currentDistance,
      status: statusFinal,
      keterangan: keterangan.trim() || 'Presensi kehadiran sekolah & tugas OSIS',
      akurasiMeter: gpsSource === 'device' ? 8 : 2,
      isTerlambat: tardinessInfo.isTerlambat,
      menitKeterlambatan: tardinessInfo.menitKeterlambatan,
      waktuBatas: '07:15 WITA',
      alasanKeterlambatan: tardinessInfo.isTerlambat 
        ? (alasanKeterlambatan.trim() || 'Terlambat melewati pukul 07:15 WITA')
        : undefined,
      kategoriPengurus: isBPH ? 'bph' : 'sekbid',
      statusValidasiPembina: 'Menunggu Validasi',
      isValidatedByPembina: false,
    });

    if (!isValid) {
      setSuccessToast(`Peringatan: Presensi tercatat 'Di Luar Radius' (${currentDistance}m dari kampus).`);
    } else if (tardinessInfo.isTerlambat) {
      setSuccessToast(`⚠️ Presensi TERCATAT TERLAMBAT (+${tardinessInfo.menitKeterlambatan} menit lewat batas 07.15 WITA).`);
    } else {
      setSuccessToast(`✅ Presensi Kehadiran Sekolah TEPAT WAKTU Berhasil Diverifikasi! (${timeStr})`);
    }

    setForceShowAbsenForm(false);

    setTimeout(() => {
      setSuccessToast(null);
    }, 5500);
  };

  // Validasi Tunggal oleh Pembina
  const handleValidateSingle = (
    record: PresensiRecord,
    status: 'Disetujui Sah' | 'Diberi Teguran' | 'Ditolak / Anulir',
    customCatatan?: string
  ) => {
    if (!onUpdatePresensi) return;
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} WITA`;

    const updated: PresensiRecord = {
      ...record,
      isValidatedByPembina: status === 'Disetujui Sah',
      statusValidasiPembina: status,
      validatedBy: `${currentUser.fullName} (Pembina OSIS)`,
      validatedAt: timeStr,
      catatanPembina:
        customCatatan ||
        (status === 'Disetujui Sah'
          ? 'Absensi kehadiran telah diverifikasi sah oleh Pembina OSIS.'
          : status === 'Diberi Teguran'
          ? 'Diberikan teguran kedisiplinan terkait kehadiran sekolah oleh Pembina OSIS.'
          : 'Absensi dibatalkan/dianulir oleh Pembina OSIS.'),
    };

    onUpdatePresensi(updated);
    setToastValidasi(`Presensi ${record.namaPengurus} berhasil divalidasi: "${status}"`);
    setTimeout(() => setToastValidasi(null), 4000);
    setValidationModalRecord(null);
    setCatatanValidasi('');
  };

  // Validasi Serentak / Batch oleh Pembina
  const handleBatchApproveAllOnTime = () => {
    if (!onBatchValidatePresensi) return;
    const onTimePendingIds = presensiList
      .filter((p) => !p.isTerlambat && p.status.includes('Valid') && !p.isValidatedByPembina)
      .map((p) => p.id);

    if (onTimePendingIds.length === 0) {
      setToastValidasi('Seluruh absensi tepat waktu sudah berstatus tervalidasi!');
      setTimeout(() => setToastValidasi(null), 3500);
      return;
    }

    onBatchValidatePresensi(
      onTimePendingIds,
      'Disetujui Sah',
      'Divalidasi serentak oleh Pembina OSIS (Hadir tepat waktu sebelum 07.15 WITA & dalam radius radius kampus).'
    );
    setToastValidasi(`Berhasil memvalidasi sah ${onTimePendingIds.length} absensi tepat waktu!`);
    setTimeout(() => setToastValidasi(null), 4000);
  };

  // Helper Cek Kategori BPH vs Sekbid
  const checkIsBPH = (record: PresensiRecord) => {
    if (record.kategoriPengurus === 'bph') return true;
    const lower = record.jabatan.toLowerCase();
    return ['ketua', 'wakil', 'sekretaris', 'bendahara'].some((r) => lower.includes(r));
  };

  // Filter Presensi untuk Ditampilkan
  const filteredPresensi = presensiList.filter((p) => {
    const isBPH = checkIsBPH(p);
    const isSekbid = !isBPH;
    const isPending = !p.isValidatedByPembina && p.statusValidasiPembina !== 'Disetujui Sah';
    const isApproved = p.isValidatedByPembina || p.statusValidasiPembina === 'Disetujui Sah';
    const isLate = p.isTerlambat || p.status === 'Hadir Valid (Terlambat)';

    if (filterKategori === 'bph' && !isBPH) return false;
    if (filterKategori === 'sekbid' && !isSekbid) return false;
    if (filterKategori === 'menunggu' && !isPending) return false;
    if (filterKategori === 'tervalidasi' && !isApproved) return false;
    if (filterKategori === 'terlambat' && !isLate) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.namaPengurus.toLowerCase().includes(q);
      const matchJabatan = p.jabatan.toLowerCase().includes(q);
      const matchTanggal = p.tanggal.toLowerCase().includes(q);
      if (!matchName && !matchJabatan && !matchTanggal) return false;
    }

    return true;
  });

  // Presensi Pengguna Saat Ini Hari Ini & Riwayat Terakhir
  const todayDateStr = new Date().toISOString().split('T')[0];
  const myTodayPresensi = presensiList.find(
    (p) => p.userId === currentUser.id && p.tanggal === todayDateStr
  );
  const myRecentPresensi = presensiList
    .filter((p) => p.userId === currentUser.id)
    .slice(0, 5);

  // Statistik Presensi
  const countTotal = presensiList.length;
  const countBPH = presensiList.filter((p) => checkIsBPH(p)).length;
  const countSekbid = countTotal - countBPH;
  const countPending = presensiList.filter(
    (p) => !p.isValidatedByPembina && p.statusValidasiPembina !== 'Disetujui Sah'
  ).length;
  const countApproved = presensiList.filter(
    (p) => p.isValidatedByPembina || p.statusValidasiPembina === 'Disetujui Sah'
  ).length;
  const countTerlambat = presensiList.filter(
    (p) => p.isTerlambat || p.status === 'Hadir Valid (Terlambat)'
  ).length;
  const countTepatWaktu = presensiList.filter(
    (p) => !p.isTerlambat && p.status.includes('Valid')
  ).length;
  const countLuarRadius = presensiList.filter((p) => p.status === 'Di Luar Radius').length;

  return (
    <div className="space-y-5">
      {/* 1. HEADER PRESENSI SOFT & RINGKAS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Presensi & Kedisiplinan Pengurus OSIS
            </h2>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              SMK Tridharma Gorontalo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Titik aktif: <strong>{activeGeo.namaLokasi}</strong> (Radius: {activeGeo.radiusToleransiMeter}m) · Batas Masuk: <strong>07:15 WITA</strong>
          </p>
        </div>

        {/* Digital Clock WITA & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">{formattedWitaTime}</span>
          </div>

          {isPembina && (
            <button
              type="button"
              onClick={() => setIsRekapModalOpen(true)}
              className="min-h-[40px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Rekap Bulanan (Excel)</span>
            </button>
          )}

          {onNavigateToMapsConfig && (
            <button
              type="button"
              onClick={onNavigateToMapsConfig}
              className="min-h-[40px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200 active:scale-95"
            >
              <Compass className="w-4 h-4 text-slate-600" />
              <span>Peta Lokasi</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleFetchDeviceGps}
            disabled={isLocating}
            className="min-h-[40px] px-3.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Mencari...' : 'GPS HP'}</span>
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGASI PRESENSI */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        {!isPembina ? (
          <>
            <button
              type="button"
              onClick={() => setActivePresensiTab('absen')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
                activePresensiTab === 'absen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>1. Absen Mandiri (Cepat)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePresensiTab('daftar')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
                activePresensiTab === 'daftar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
              }`}
            >
              <CheckCheck className="w-5 h-5" />
              <span>2. Riwayat & Rekap Pengurus</span>
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-full">
                {presensiList.length}
              </span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActivePresensiTab('daftar')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
                activePresensiTab === 'daftar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
              }`}
            >
              <CheckCheck className="w-5 h-5" />
              <span>1. Rekap & Validasi Pengurus</span>
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-full">
                {presensiList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePresensiTab('absen')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
                activePresensiTab === 'absen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>2. Form Simulasi Absen</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActivePresensiTab('radar')}
          className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
            activePresensiTab === 'radar'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span>3. Peta Radar & Radius</span>
        </button>

        {agendaSekretaris && (
          <button
            type="button"
            onClick={() => setActivePresensiTab('agenda')}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
              activePresensiTab === 'agenda'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>4. Agenda Harian</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successToast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            isValid
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {isValid ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{successToast}</span>
        </div>
      )}

      {toastValidasi && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastValidasi}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW TAB 1: FORM ABSEN MANDIRI (SUPER SIMPEL & PRAKTIS)        */}
      {/* ============================================================== */}
      {activePresensiTab === 'absen' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
            {/* Header Pengurus & Jam Digital Real-Time */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Halo, {currentUser.fullName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {currentUser.jabatan}
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {formattedWitaTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    tardinessInfo.isTerlambat
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {tardinessInfo.isTerlambat ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Terlambat (+{tardinessInfo.menitKeterlambatan}m lewat 07:15 WITA)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tepat Waktu (Batas Masuk 07:15 WITA)</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Cek Status Sudah Absen Hari Ini */}
            {myTodayPresensi && !forceShowAbsenForm ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-emerald-950">
                        Presensi Hari Ini Berhasil Terverifikasi!
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {myTodayPresensi.status}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Tercatat pada pukul <strong>{myTodayPresensi.waktu}</strong> ({myTodayPresensi.tanggal}).
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-700 pt-1 font-mono">
                      <span>📍 Jarak: {myTodayPresensi.jarakMeter}m</span>
                      <span>•</span>
                      <span>📋 Kegiatan: {myTodayPresensi.jenis}</span>
                      <span>•</span>
                      <span className="font-bold">
                        {myTodayPresensi.statusValidasiPembina || (myTodayPresensi.isValidatedByPembina ? '✓ Disetujui Pembina' : '⏳ Menunggu Validasi Pembina')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700">
                    Data kehadiran Anda telah tersimpan dan siap divalidasi oleh Pembina OSIS.
                  </span>
                  <button
                    type="button"
                    onClick={() => setForceShowAbsenForm(true)}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>+ Absen Sesi Lain / Kegiatan Baru</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Form Presensi Super Praktis (1-Klik) */
              <form onSubmit={handleSubmitPresensi} className="space-y-4">
                {/* Box Lokasi & 2 Tombol Aksi Cepat */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{activeGeo.namaLokasi}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {isValid ? 'DALAM RADIUS' : 'LUAR RADIUS'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Jarak: <strong className={isValid ? 'text-emerald-700' : 'text-rose-600'}>{currentDistance} meter</strong> (Radius toleransi: {activeGeo.radiusToleransiMeter}m)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentLat(activeGeo.latitude);
                        setCurrentLng(activeGeo.longitude);
                        setLocationName('Titik Pusat Sekolah (Presensi Cepat)');
                        setGpsSource('simulator');
                        setErrorMessage(null);
                      }}
                      className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-indigo-300 flex items-center justify-center gap-1.5 active:scale-95"
                      title="Setel koordinat langsung di lingkungan sekolah"
                    >
                      <span>📍 Pas di Sekolah</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFetchDeviceGps}
                      disabled={isLocating}
                      className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                      title="Deteksi lokasi langsung dari GPS perangkat"
                    >
                      <Navigation className={`w-4 h-4 text-sky-600 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Mencari...' : 'GPS HP Saya'}</span>
                    </button>
                  </div>
                </div>

                {/* Form Input Alasan jika Terlambat */}
                {tardinessInfo.isTerlambat && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <label className="block text-xs font-bold text-amber-950">
                          Alasan Keterlambatan Masuk:
                        </label>
                        <p className="text-[11px] text-amber-800">
                          Pukul saat ini {formattedWitaTime} (+{tardinessInfo.menitKeterlambatan}m lewat batas 07:15 WITA).
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={alasanKeterlambatan}
                      onChange={(e) => setAlasanKeterlambatan(e.target.value)}
                      placeholder="Tulis alasan keterlambatan..."
                      className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    <div className="flex flex-wrap gap-1.5 text-xs pt-1">
                      <span className="text-[10px] text-amber-800 font-semibold self-center">Pilihan Cepat:</span>
                      {[
                        'Kendala kendaraan di perjalanan',
                        'Cuaca hujan lebat di Gorontalo',
                        'Persiapan tugas piket pagi',
                        'Ada urusan keluarga mendadak',
                      ].map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAlasanKeterlambatan(sug)}
                          className="min-h-[36px] px-3 py-1.5 bg-white text-amber-900 border border-amber-200 rounded-xl text-xs font-medium hover:bg-amber-100/60 shadow-2xs transition-all active:scale-95"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tombol Utama Presensi (Sangat Jelas, Soft & Praktis) */}
                <button
                  type="submit"
                  className={`w-full min-h-[50px] py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-white transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2.5 ${
                    !isValid
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : tardinessInfo.isTerlambat
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  <span>
                    {!isValid
                      ? 'Kirim Presensi (Di Luar Radius)'
                      : tardinessInfo.isTerlambat
                      ? `Kirim Presensi (Terlambat +${tardinessInfo.menitKeterlambatan}m)`
                      : '✓ Absen Masuk Sekarang'}
                  </span>
                </button>

                {/* Opsi Tambahan Lipat (Accordion Ringan) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition-colors"
                  >
                    {showAdvancedOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{showAdvancedOptions ? 'Sembunyikan Opsi Lanjutan' : 'Opsi Lanjutan (Jenis Presensi & Catatan Tambahan)'}</span>
                  </button>

                  {showAdvancedOptions && (
                    <div className="mt-3 p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3.5 text-xs animate-fadeIn">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Jenis Presensi:
                        </label>
                        <select
                          value={jenisPresensi}
                          onChange={(e) => setJenisPresensi(e.target.value as PresensiRecord['jenis'])}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                        >
                          <option value="Kehadiran Sekolah & Piket">Kehadiran Sekolah & Piket OSIS (Pagi)</option>
                          <option value="Kehadiran Sekolah Reguler">Kehadiran Sekolah Reguler (Pengurus OSIS)</option>
                          <option value="Piket Harian">Piket Harian Ruang Sekretariat</option>
                          <option value="Apel Pagi / Upacara">Apel Pagi / Upacara Bendera</option>
                          <option value="Rapat Rutin">Rapat Rutin / Koordinasi</option>
                          <option value="Kepanitiaan">Kepanitiaan Proker Khusus</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Catatan / Tugas Hari Ini:
                        </label>
                        <input
                          type="text"
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                          placeholder="Catatan tugas hari ini..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Riwayat Presensi Saya Terakhir */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Presensi Saya Terbaru
                </h3>
                <p className="text-xs text-slate-500">
                  Rekam jejak kehadiran Anda di SMK Tridharma Gorontalo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePresensiTab('daftar')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Lihat Semua Rekapan →
              </button>
            </div>

            {myRecentPresensi.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Belum ada rekaman presensi atas nama Anda. Silakan klik tombol "Absen Masuk Sekarang" di atas.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myRecentPresensi.map((record) => (
                  <div key={record.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        record.isTerlambat ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {record.isTerlambat ? '!' : '✓'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{record.tanggal} · {record.waktu}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({record.jenis})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Jarak: {record.jarakMeter}m · {record.keterangan}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        record.status === 'Di Luar Radius'
                          ? 'bg-rose-100 text-rose-800'
                          : record.isTerlambat
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {record.status}
                      </span>

                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                        {record.statusValidasiPembina || (record.isValidatedByPembina ? 'Disetujui' : 'Menunggu')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW TAB 2: DAFTAR, LOG & VALIDASI PRESENSI PENGURUS           */}
      {/* ============================================================== */}
      {activePresensiTab === 'daftar' && (
        <div className="space-y-5">
          {/* 4 Kartu Statistik Kedisiplinan Pastel Soft */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Hadir</span>
              <span className="text-xl font-mono font-bold text-slate-900 mt-0.5 block">{countTotal}</span>
              <span className="text-[10px] text-slate-400">Pengurus OSIS</span>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/70 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">🟢 Tepat Waktu</span>
              <span className="text-xl font-mono font-bold text-emerald-700 mt-0.5 block">{countTepatWaktu}</span>
              <span className="text-[10px] text-emerald-600">&lt; 07:15 WITA</span>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">⚠️ Terlambat</span>
              <span className="text-xl font-mono font-bold text-amber-700 mt-0.5 block">{countTerlambat}</span>
              <span className="text-[10px] text-amber-600">&gt; 07:15 WITA</span>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/70 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-rose-800 block">🔴 Di Luar Radius</span>
              <span className="text-xl font-mono font-bold text-rose-700 mt-0.5 block">{countLuarRadius}</span>
              <span className="text-[10px] text-rose-600">&gt; {activeGeo.radiusToleransiMeter}m</span>
            </div>
          </div>

          {/* Banner Aksi Khusus Pembina OSIS */}
          {isPembina && (
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>OTORITAS & VALIDASI PEMBINA OSIS</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Sahkan presensi pengurus tepat waktu (&lt; 07.15 WITA) atau ekspor berkas evaluasi bulanan ke Excel.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBatchApproveAllOnTime}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Sahkan Semua Tepat Waktu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRekapModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Rekap Bulanan</span>
                </button>
              </div>
            </div>
          )}

          {/* Bar Filter & Pencarian */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pengurus atau jabatan..."
                className="w-full min-h-[42px] pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
              {[
                { key: 'semua', label: 'Semua', count: countTotal },
                { key: 'bph', label: 'BPH', count: countBPH },
                { key: 'sekbid', label: 'Sekbid', count: countSekbid },
                { key: 'menunggu', label: 'Menunggu', count: countPending },
                { key: 'tervalidasi', label: 'Tervalidasi', count: countApproved },
                { key: 'terlambat', label: 'Terlambat', count: countTerlambat },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterKategori(tab.key as any)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
                    filterKategori === tab.key
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono opacity-80">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* MODE PONSEL: Card List View untuk Layar Kecil (<sm) */}
          <div className="block sm:hidden space-y-3">
            {filteredPresensi.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Tidak ada rekaman presensi yang cocok.
              </div>
            ) : (
              filteredPresensi.map((record) => {
                const isBPH = checkIsBPH(record);
                const isApproved = record.isValidatedByPembina || record.statusValidasiPembina === 'Disetujui Sah';
                const isWarned = record.statusValidasiPembina === 'Diberi Teguran';

                return (
                  <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{record.namaPengurus}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isBPH
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-sky-100 text-sky-900 border border-sky-300'
                            }`}
                          >
                            {isBPH ? 'BPH' : 'Sekbid'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{record.jabatan}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-slate-900">{record.waktu} WITA</div>
                        <div className="font-mono text-[10px] text-slate-400">{record.tanggal}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium">
                        {record.jenis}
                      </span>
                      <span className="bg-slate-100 font-mono text-slate-800 px-2 py-0.5 rounded-lg font-bold">
                        📍 {record.jarakMeter}m
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg font-bold ${
                          record.status === 'Di Luar Radius'
                            ? 'bg-rose-100 text-rose-800'
                            : record.isTerlambat
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {record.status === 'Di Luar Radius'
                          ? 'Luar Radius'
                          : record.isTerlambat
                          ? `Terlambat ${record.menitKeterlambatan ? `+${record.menitKeterlambatan}m` : ''}`
                          : 'Tepat Waktu'}
                      </span>
                    </div>

                    {record.alasanKeterlambatan && (
                      <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <strong>Alasan:</strong> {record.alasanKeterlambatan}
                      </div>
                    )}

                    {record.catatanPembina && (
                      <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900">
                        <strong>Catatan Pembina:</strong> {record.catatanPembina}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isWarned
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {record.statusValidasiPembina || (isApproved ? 'Disetujui Sah' : 'Menunggu Validasi')}
                      </span>

                      {isPembina && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleValidateSingle(record, 'Disetujui Sah')}
                            className={`min-h-[38px] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800 opacity-60'
                                : 'bg-emerald-600 text-white shadow-2xs'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Sahkan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setValidationModalRecord(record);
                              setCatatanValidasi(record.catatanPembina || (record.isTerlambat ? 'Teguran kedisiplinan keterlambatan.' : ''));
                              setStatusValidasiPilihan(record.isTerlambat ? 'Diberi Teguran' : 'Disetujui Sah');
                            }}
                            className="min-h-[38px] p-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl border border-slate-200 active:scale-95 transition-all flex items-center justify-center"
                            title="Tulis Catatan"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Tabel Rekonsiliasi & Validasi (Untuk Layar Tablet/Desktop >=sm) */}
          <div className="hidden sm:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Waktu & Tanggal</th>
                    <th className="py-3 px-4">Nama & Jabatan</th>
                    <th className="py-3 px-4">Kegiatan</th>
                    <th className="py-3 px-4">Jarak Radius</th>
                    <th className="py-3 px-4">Kedisiplinan</th>
                    <th className="py-3 px-4">Status Validasi</th>
                    <th className="py-3 px-4">Catatan / Alasan</th>
                    {isPembina && <th className="py-3 px-4 text-center">Aksi Validasi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPresensi.length === 0 ? (
                    <tr>
                      <td colSpan={isPembina ? 8 : 7} className="text-center py-10 text-slate-400">
                        Tidak ada rekaman presensi yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPresensi.map((record) => {
                      const isBPH = checkIsBPH(record);
                      const isApproved = record.isValidatedByPembina || record.statusValidasiPembina === 'Disetujui Sah';
                      const isWarned = record.statusValidasiPembina === 'Diberi Teguran';

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{record.waktu}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{record.tanggal}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{record.namaPengurus}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  isBPH
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-sky-100 text-sky-900 border border-sky-300'
                                }`}
                              >
                                {isBPH ? 'BPH' : 'Sekbid'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">{record.jabatan}</div>
                          </td>

                          <td className="py-3.5 px-4 font-medium text-slate-800">{record.jenis}</td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {record.jarakMeter}m
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                                record.status === 'Di Luar Radius'
                                  ? 'bg-rose-100 text-rose-800'
                                  : record.isTerlambat
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {record.status === 'Di Luar Radius'
                                ? 'Di Luar Radius'
                                : record.isTerlambat
                                ? `Terlambat ${record.menitKeterlambatan ? `+${record.menitKeterlambatan}m` : ''}`
                                : 'Tepat Waktu'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isWarned
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-600 border border-slate-300'
                              }`}
                            >
                              {record.statusValidasiPembina || (isApproved ? 'Disetujui Sah' : 'Menunggu Validasi')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                            <div className="truncate">{record.keterangan}</div>
                            {record.alasanKeterlambatan && (
                              <div className="text-[10px] text-amber-900 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-200 mt-1">
                                <strong>Alasan:</strong> {record.alasanKeterlambatan}
                              </div>
                            )}
                            {record.catatanPembina && (
                              <div className="text-[10px] text-indigo-900 bg-indigo-50 rounded px-1.5 py-0.5 border border-indigo-200 mt-1">
                                <strong>Pembina:</strong> {record.catatanPembina}
                              </div>
                            )}
                          </td>

                          {isPembina && (
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleValidateSingle(record, 'Disetujui Sah')}
                                  className={`min-w-[38px] min-h-[38px] p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                                    isApproved
                                      ? 'bg-emerald-100 text-emerald-700 opacity-60'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                  }`}
                                  title="Sahkan Kehadiran"
                                >
                                  <CheckCircle className="w-4.5 h-4.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setValidationModalRecord(record);
                                    setCatatanValidasi(record.catatanPembina || (record.isTerlambat ? 'Teguran kedisiplinan keterlambatan.' : ''));
                                    setStatusValidasiPilihan(record.isTerlambat ? 'Diberi Teguran' : 'Disetujui Sah');
                                  }}
                                  className="min-w-[38px] min-h-[38px] p-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-all active:scale-95 border border-slate-200 flex items-center justify-center"
                                  title="Tulis Catatan / Tindakan Pembinaan"
                                >
                                  <FileText className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW TAB 3: PETA RADAR & RADIUS GEOFENCE (OPSIONAL/EKSPLORASI) */}
      {/* ============================================================== */}
      {activePresensiTab === 'radar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Peta Radar Visual & Radius Geofence Kampus
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Titik target: <strong>{activeGeo.namaLokasi}</strong> (Radius toleransi {activeGeo.radiusToleransiMeter} meter)
              </p>
            </div>

            <PresensiVisualMap
              currentLat={currentLat}
              currentLng={currentLng}
              targetGeoConfig={activeGeo}
              currentDistance={currentDistance}
              isValid={isValid}
              onLocationChange={(lat, lng, label) => {
                setCurrentLat(lat);
                setCurrentLng(lng);
                setLocationName(label);
                setErrorMessage(null);
              }}
              onDetectGps={handleFetchDeviceGps}
              isLocating={isLocating}
            />

            {/* Quick Coordinate Presets */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Simulator Titik Lokasi Cepat (Pengujian Radius):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {GEOFENCE_PRESETS.map((preset) => {
                  const isSelected =
                    currentLat === preset.latitude && currentLng === preset.longitude;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setCurrentLat(preset.latitude);
                        setCurrentLng(preset.longitude);
                        setLocationName(preset.label);
                        setGpsSource('simulator');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{preset.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{preset.deskripsi}</div>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          preset.expectedValid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {preset.expectedValid ? 'VALID' : 'INVALID'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Presets */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Simulasi Batas Waktu Masuk (07:15 WITA):
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {TIME_SIMULATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedTimePreset(preset.id);
                      if (preset.isRealtime) {
                        const now = getWitaDate();
                        setCustomHours(now.getHours());
                        setCustomMinutes(now.getMinutes());
                        setCustomSeconds(now.getSeconds());
                      } else {
                        setCustomHours(preset.hours);
                        setCustomMinutes(preset.minutes);
                        setCustomSeconds(0);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all ${
                      selectedTimePreset === preset.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW TAB 4: AGENDA HARIAN SEKRETARIS OSIS                      */}
      {/* ============================================================== */}
      {activePresensiTab === 'agenda' && agendaSekretaris && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      Instruksi Sekretaris OSIS
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {agendaSekretaris.hari}, {agendaSekretaris.tanggal}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {agendaSekretaris.temaHari}
                  </h3>
                </div>
              </div>

              {['sekretaris', 'ketua', 'wakil', 'pembina'].includes(currentUser.role) && (
                <button
                  type="button"
                  onClick={() => setIsAgendaEditorOpen(true)}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Agenda Harian</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Arahan & Instruksi:
              </span>
              <p className="text-sm font-medium text-slate-900 italic">
                "{agendaSekretaris.instruksiSekretaris}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Koordinator Piket Hari Ini:</span>
                <span className="text-sm font-bold text-slate-900 block">{agendaSekretaris.koordinatorPiket}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Petugas Piket Bertugas:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {agendaSekretaris.petugasPiket.map((petugas, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg font-medium text-xs">
                      {petugas}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {agendaSekretaris.catatanKhusus && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Catatan Tambahan / Berkas Surat:</span>
                <p>{agendaSekretaris.catatanKhusus}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MODAL DETAIL VALIDASI & CATATAN PEMBINA */}
      {validationModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-indigo-600 block">
                  LEMBAR VALIDASI PEMBINA OSIS
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {validationModalRecord.namaPengurus}
                </h3>
                <p className="text-xs text-slate-500">{validationModalRecord.jabatan}</p>
              </div>
              <button
                type="button"
                onClick={() => setValidationModalRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Info Rekam Presensi */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Kedatangan:</span>
                <strong className="text-slate-900">{validationModalRecord.waktu} ({validationModalRecord.tanggal})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jarak dari Sekolah:</span>
                <strong className="text-slate-900">{validationModalRecord.jarakMeter} meter (Toleransi: {activeGeo.radiusToleransiMeter}m)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Waktu:</span>
                <strong className={validationModalRecord.isTerlambat ? 'text-rose-600' : 'text-emerald-700'}>
                  {validationModalRecord.isTerlambat
                    ? `Terlambat ${validationModalRecord.menitKeterlambatan}m (Lewat 07:15 WITA)`
                    : 'Tepat Waktu (< 07:15 WITA)'}
                </strong>
              </div>
              {validationModalRecord.alasanKeterlambatan && (
                <div className="pt-2 border-t border-slate-200/80 font-sans">
                  <span className="text-slate-500 block text-[11px]">Alasan yang Disampaikan Siswa:</span>
                  <div className="text-amber-900 font-medium bg-amber-50 p-2 rounded-lg mt-0.5 border border-amber-200">
                    "{validationModalRecord.alasanKeterlambatan}"
                  </div>
                </div>
              )}
            </div>

            {/* Form Keputusan Validasi Pembina */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Keputusan Validasi Pembina OSIS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'Disetujui Sah', label: 'Disetujui Sah', color: 'emerald' },
                    { val: 'Diberi Teguran', label: 'Beri Teguran', color: 'amber' },
                    { val: 'Ditolak / Anulir', label: 'Tolak / Anulir', color: 'rose' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setStatusValidasiPilihan(opt.val as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        statusValidasiPilihan === opt.val
                          ? opt.color === 'emerald'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : opt.color === 'amber'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-rose-600 text-white border-rose-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan Pembina / Arahan Kedisiplinan
                </label>
                <textarea
                  rows={3}
                  value={catatanValidasi}
                  onChange={(e) => setCatatanValidasi(e.target.value)}
                  placeholder="Tuliskan arahan pembinaan, toleransi, atau catatan evaluasi untuk pengurus..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setValidationModalRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleValidateSingle(
                      validationModalRecord,
                      statusValidasiPilihan,
                      catatanValidasi.trim()
                    )
                  }
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Keputusan Pembina</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT AGENDA HARIAN SEKRETARIS */}
      {isAgendaEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Input & Terbitkan Agenda Harian Sekretaris
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Instruksi ini otomatis muncul di Presensi Geofencing & Jadwal Piket seluruh pengurus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAgendaEditorOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgendaFromPresensi} className="space-y-4 pt-4 text-xs">
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
                  placeholder="Contoh: Berkas proposal disiapkan untuk tanda tangan pembina"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAgendaEditorOpen(false)}
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

      {/* MODAL REKAPITULASI & EVALUASI BULANAN PEMBINA (EXCEL EXPORT) */}
      <RekapPresensiBulananModal
        currentUser={currentUser}
        presensiList={presensiList}
        isOpen={isRekapModalOpen}
        onClose={() => setIsRekapModalOpen(false)}
        onBatchValidate={onBatchValidatePresensi}
      />
    </div>
  );
};
