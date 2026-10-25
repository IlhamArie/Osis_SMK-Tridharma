import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  ProgramKerja, 
  PresensiRecord, 
  SchoolGeoConfig, 
  JadwalPiketItem,
  AgendaHarianSekretaris,
  ProkerStatus,
  ProkerUpdateLog,
  SchoolIdentityConfig,
  OrgMember,
  OSIS_SEKBID_LIST,
  SekbidDefinition
} from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { 
  calculateHaversineDistance, 
  isWithinSchoolRadius, 
  GEOFENCE_PRESETS,
  getWitaDate,
  evaluateTardiness,
  TIME_SIMULATION_PRESETS,
  SCHOOL_CUTOFF_HOUR,
  SCHOOL_CUTOFF_MINUTE
} from '../../utils/geoUtils';
import { VOCATIONAL_IMAGE_PRESETS } from '../../data/imagePresets';
import { PresensiVisualMap } from './PresensiVisualMap';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  FileText, 
  Calendar, 
  UploadCloud, 
  Camera, 
  LogOut, 
  UserCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  CheckCircle,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  DollarSign,
  AlertOctagon,
  BellRing,
  ExternalLink,
  Users
} from 'lucide-react';

interface PortalPengurusProps {
  currentUser: UserAccount;
  allAccounts: UserAccount[];
  orgMembers?: OrgMember[];
  sekbidList?: SekbidDefinition[];
  prokerList: ProgramKerja[];
  presensiList: PresensiRecord[];
  currentGeoConfig: SchoolGeoConfig;
  jadwalPiket: JadwalPiketItem[];
  agendaSekretaris?: AgendaHarianSekretaris;
  schoolIdentity?: SchoolIdentityConfig;
  onAddPresensi: (record: Omit<PresensiRecord, 'id'>) => void;
  onUpdateProker: (updatedProker: ProgramKerja) => void;
  onSwitchUser: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenPublicPortal: () => void;
}

export const PortalPengurus: React.FC<PortalPengurusProps> = ({
  currentUser,
  allAccounts,
  orgMembers = [],
  sekbidList,
  prokerList,
  presensiList,
  currentGeoConfig,
  jadwalPiket,
  agendaSekretaris,
  schoolIdentity,
  onAddPresensi,
  onUpdateProker,
  onSwitchUser,
  onLogout,
  onOpenPublicPortal,
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;
  const currentSekbids = sekbidList && sekbidList.length > 0 ? sekbidList : OSIS_SEKBID_LIST;
  // Main Tab in Pengurus Portal
  const [activeTab, setActiveTab] = useState<'presensi' | 'proker' | 'piket' | 'tim'>('presensi');

  // User Sekbid extraction
  const userSekbidNum = currentUser.sekbidId 
    ? parseInt(currentUser.sekbidId.replace('sekbid-', ''), 10) 
    : undefined;
  const [selectedSekbidTab, setSelectedSekbidTab] = useState<number>(userSekbidNum || 1);

  // --- WITA CLOCK & TARDINESS STATE (BATAS 07:15 WITA) ---
  const [selectedTimePreset, setSelectedTimePreset] = useState<string>('realtime');
  const [customHours, setCustomHours] = useState<number>(() => getWitaDate().getHours());
  const [customMinutes, setCustomMinutes] = useState<number>(() => getWitaDate().getMinutes());
  const [customSeconds, setCustomSeconds] = useState<number>(() => getWitaDate().getSeconds());
  const [alasanKeterlambatan, setAlasanKeterlambatan] = useState<string>('');

  // Ticker waktu WITA otomatis jika dalam mode realtime
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

  // Cek apakah pengurus bertugas piket hari ini sesuai input sekretaris
  const isAssignedToday = 
    agendaSekretaris?.petugasPiket.some(
      (p) => p.toLowerCase().includes(currentUser.fullName.toLowerCase()) ||
             currentUser.fullName.toLowerCase().includes(p.toLowerCase())
    ) ||
    agendaSekretaris?.koordinatorPiket.toLowerCase().includes(currentUser.fullName.toLowerCase());

  // --- PRESENSI STATE ---
  const [currentLat, setCurrentLat] = useState<number>(currentGeoConfig.latitude);
  const [currentLng, setCurrentLng] = useState<number>(currentGeoConfig.longitude);
  const [locationLabel, setLocationLabel] = useState<string>('Titik Presensi Utama (Sesuai Konfigurasi Pembina)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [jenisPresensi, setJenisPresensi] = useState<PresensiRecord['jenis']>('Kehadiran Sekolah & Piket');
  const [keteranganPresensi, setKeteranganPresensi] = useState<string>('Hadir tepat waktu dan siap menjalankan tugas OSIS');
  const [presensiSuccessToast, setPresensiSuccessToast] = useState<string | null>(null);
  const [showSimulators, setShowSimulators] = useState<boolean>(false);
  const [showCustomDetails, setShowCustomDetails] = useState<boolean>(false);
  const [forceShowForm, setForceShowForm] = useState<boolean>(false);

  // Dynamic distance calculation against Pembina's active location
  const evaluation = isWithinSchoolRadius(
    currentLat,
    currentLng,
    currentGeoConfig.latitude,
    currentGeoConfig.longitude,
    currentGeoConfig.radiusToleransiMeter
  );
  const currentDistance = evaluation.distance;
  const isValidRadius = evaluation.isValid;

  // Real device GPS fetch
  const handleFetchDeviceGps = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('Browser tidak mendukung pendeteksian geolokasi.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLat(pos.coords.latitude);
        setCurrentLng(pos.coords.longitude);
        setLocationLabel(`GPS Perangkat Saya (Akurasi: ±${Math.round(pos.coords.accuracy)}m)`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGpsError(`Gagal membaca GPS perangkat (${err.message}). Anda dapat menggunakan pilihan simulasi di bawah.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Submit Presensi
  const handleSubmitPresensi = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = formattedWitaTime;

    let statusFinal: PresensiRecord['status'];
    if (!isValidRadius) {
      statusFinal = 'Di Luar Radius';
    } else if (tardinessInfo.isTerlambat) {
      statusFinal = 'Hadir Valid (Terlambat)';
    } else {
      statusFinal = 'Hadir Valid (Tepat Waktu)';
    }

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
      keterangan: keteranganPresensi.trim(),
      akurasiMeter: 8,
      isTerlambat: tardinessInfo.isTerlambat,
      menitKeterlambatan: tardinessInfo.menitKeterlambatan,
      waktuBatas: '07:15 WITA',
      alasanKeterlambatan: tardinessInfo.isTerlambat 
        ? (alasanKeterlambatan.trim() || 'Terlambat melewati pukul 07:15 WITA')
        : undefined,
    });

    if (!isValidRadius) {
      setPresensiSuccessToast(
        `Presensi ${jenisPresensi} tercatat, namun BERSTATUS DI LUAR RADIUS (${currentDistance}m dari ${currentGeoConfig.namaLokasi}).`
      );
    } else if (tardinessInfo.isTerlambat) {
      setPresensiSuccessToast(
        `⚠️ Presensi DIVERIFIKASI DENGAN PERINGATAN KETERLAMBATAN (+${tardinessInfo.menitKeterlambatan} Menit Lewat dari 07.15 WITA). Tercatat dalam rekap kedisiplinan.`
      );
    } else {
      setPresensiSuccessToast(
        `✅ Presensi ${jenisPresensi} BERHASIL diverifikasi TEPAT WAKTU (${timeStr}). Anda berada dalam radius aman kampus (${currentDistance}m).`
      );
    }

    setTimeout(() => setPresensiSuccessToast(null), 6000);
  };

  // Filter Presensi khusus pengurus yang login
  const myPresensiHistory = presensiList.filter(
    (p) => p.userId === currentUser.id || p.namaPengurus.toLowerCase() === currentUser.fullName.toLowerCase()
  );

  // --- PROKER UPDATE STATE ---
  const [selectedProker, setSelectedProker] = useState<ProgramKerja | null>(null);
  const [prokerProgress, setProkerProgress] = useState<number>(0);
  const [prokerStatus, setProkerStatus] = useState<ProkerStatus>('Berjalan');
  const [prokerCatatan, setProkerCatatan] = useState<string>('');
  const [prokerRealisasi, setProkerRealisasi] = useState<number>(0);
  const [prokerFotoUrl, setProkerFotoUrl] = useState<string>('');
  const [prokerSuccessToast, setProkerSuccessToast] = useState<string | null>(null);

  // Filter proker: sekbid saya vs semua
  const [prokerFilter, setProkerFilter] = useState<'sekbid' | 'semua'>('sekbid');

  // Match prokers relevant to this pengurus
  const isSekbidMember = currentUser.jabatan.toLowerCase().includes('sekbid');
  const sekbidKeywords = currentUser.jabatan.match(/sekbid\s*(\d+)/i);
  const mySekbidNum = sekbidKeywords ? sekbidKeywords[1] : '';

  const relevantProkers = prokerList.filter((p) => {
    if (prokerFilter === 'semua') return true;
    if (mySekbidNum && p.sekbid.toLowerCase().includes(`sekbid ${mySekbidNum}`)) {
      return true;
    }
    // Also include if penanggung jawab is this user
    return p.penanggungJawab.toLowerCase().includes(currentUser.fullName.toLowerCase());
  });

  const displayProkers = relevantProkers.length > 0 ? relevantProkers : prokerList;

  // Open Update Modal for Proker
  const handleOpenUpdateModal = (proker: ProgramKerja) => {
    setSelectedProker(proker);
    setProkerProgress(proker.progress);
    setProkerStatus(proker.status);
    setProkerCatatan(proker.catatanTerbaru || '');
    setProkerRealisasi(proker.realisasiAnggaran);
    setProkerFotoUrl(proker.posterUrl || VOCATIONAL_IMAGE_PRESETS[16].url);
  };

  // Handle Photo Upload via FileReader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProkerFotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Proker Update
  const handleSaveProkerUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProker) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.toTimeString().split(' ')[0]} WITA`;

    const newLog: ProkerUpdateLog = {
      id: `log-${Date.now()}`,
      prokerId: selectedProker.id,
      tanggal: dateStr,
      waktu: timeStr,
      updatedBy: currentUser.fullName,
      jabatan: currentUser.jabatan,
      progressSebelumnya: selectedProker.progress,
      progressBaru: Number(prokerProgress),
      status: prokerStatus,
      catatan: prokerCatatan.trim(),
      fotoDokumentasiUrl: prokerFotoUrl.trim() || undefined,
      realisasiAnggaranBaru: Number(prokerRealisasi),
    };

    const updated: ProgramKerja = {
      ...selectedProker,
      progress: Number(prokerProgress),
      status: prokerStatus,
      catatanTerbaru: prokerCatatan.trim() || selectedProker.catatanTerbaru,
      realisasiAnggaran: Number(prokerRealisasi),
      posterUrl: prokerFotoUrl.trim() || selectedProker.posterUrl,
      riwayatUpdate: [newLog, ...(selectedProker.riwayatUpdate || [])],
      updatedAt: dateStr,
    };

    onUpdateProker(updated);
    setSelectedProker(null);
    setProkerSuccessToast(`Hasil & progres "${selectedProker.namaProker}" berhasil diperbarui ke ${prokerProgress}%!`);
    setTimeout(() => setProkerSuccessToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Navbar Pengurus */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-white text-base shadow-sm overflow-hidden p-0.5 shrink-0">
              {identity.logoUrl ? (
                <img
                  src={identity.logoUrl}
                  alt={`Logo ${identity.namaSekolah}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-indigo-400 font-black text-sm">{identity.singkatan}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                  Portal Pengurus OSIS
                </h1>
                <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  OPERASIONAL
                </span>
              </div>
              <div className="text-[11px] text-slate-400">{identity.namaSekolah}</div>
            </div>
          </div>

          {/* User profile preview & actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">{currentUser.fullName}</span>
              <span className="text-[10px] text-indigo-300 leading-tight">{currentUser.jabatan}</span>
            </div>

            {/* Switch User Dropdown */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = allAccounts.find((a) => a.id === e.target.value);
                if (found) onSwitchUser(found);
              }}
              className="min-h-[38px] text-xs bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[145px] sm:max-w-none truncate"
              title="Ganti Akun Demo"
            >
              {allAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.fullName} ({acc.role.toUpperCase()})
                </option>
              ))}
            </select>

            <button
              onClick={onOpenPublicPortal}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all flex items-center gap-1.5 active:scale-95"
              title="Buka Laman Publik"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Laman Publik</span>
            </button>

            <button
              onClick={onLogout}
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-900 active:scale-95 transition-all"
              title="Keluar / Logout"
              aria-label="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-6 pb-24 sm:pb-8 space-y-6 min-w-0">
        {/* Welcome & Identity Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 border-2 border-indigo-200 overflow-hidden shadow-inner shrink-0 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser.fullName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{currentUser.fullName}</h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  NISN: {currentUser.nisn}
                </span>
              </div>
              <div className="text-xs font-semibold text-indigo-600">{currentUser.jabatan}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Kelas: {currentUser.kelas} · {currentUser.telepon}
              </div>
            </div>
          </div>

          {/* Active Geofence Alert Notice from Pembina */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl max-w-md text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold mb-1">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Titik Presensi Aktif (Ditetapkan Pembina):</span>
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              <strong>{currentGeoConfig.namaLokasi}</strong>
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>Radius Toleransi: {currentGeoConfig.radiusToleransiMeter} Meter</span>
              <span className="text-emerald-600 font-bold">● GEOFENCE AKTIF</span>
            </div>
          </div>
        </div>

        {/* Success Feedback Toasts */}
        {presensiSuccessToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{presensiSuccessToast}</span>
          </div>
        )}

        {prokerSuccessToast && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 text-indigo-900 text-xs font-semibold animate-fadeIn">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>{prokerSuccessToast}</span>
          </div>
        )}

        {/* Tab Navigation: Only Presensi, Proker, and Piket */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('presensi')}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
              activeTab === 'presensi'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>1. Presensi GPS</span>
            {myPresensiHistory.length > 0 && (
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded-full">
                {myPresensiHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('proker')}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
              activeTab === 'proker'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>2. Progres Proker</span>
            <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-bold">
              {displayProkers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('piket')}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
              activeTab === 'piket'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>3. Jadwal Piket</span>
          </button>

          <button
            onClick={() => setActiveTab('tim')}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
              activeTab === 'tim'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/70 sm:bg-transparent'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>4. Tim & Anggota Sekbid</span>
          </button>
        </div>

        {/* TAB 1: PRESENSI GEOFENCING */}
        {activeTab === 'presensi' && (
          <div className="space-y-6">
            {/* 1. KARTU ARAHAN SEKRETARIS (SOFT & RINGKAS) */}
            {agendaSekretaris && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Agenda Hari Ini
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {agendaSekretaris.hari}, {agendaSekretaris.tanggal}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {agendaSekretaris.temaHari}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{agendaSekretaris.instruksiSekretaris}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-center">
                  {isAssignedToday ? (
                    <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Jadwal Piket Anda Hari Ini</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-xl">
                      Petugas: {agendaSekretaris.petugasPiket.length} Pengurus
                    </span>
                  )}
                  <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    Batas 07:15 WITA
                  </span>
                </div>
              </div>
            )}

            {/* 2. KARTU PRESENSI UTAMA (SUPER SIMPEL & PRAKTIS) */}
            {(() => {
              const todayDateStr = new Date().toISOString().split('T')[0];
              const todayAttendance = myPresensiHistory.find((p) => p.tanggal === todayDateStr);

              return (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
                    {/* Header Status Waktu & Kedisiplinan */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                          <Clock className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-[11px] font-mono font-semibold text-slate-500">
                            Waktu Sistem (WITA - Gorontalo)
                          </div>
                          <div className="text-xl font-mono font-extrabold text-slate-900">
                            {formattedWitaTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                            tardinessInfo.isTerlambat
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {tardinessInfo.isTerlambat ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Terlambat (+{tardinessInfo.menitKeterlambatan} menit)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tepat Waktu (Sebelum 07:15 WITA)</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Status Jika Sudah Absen Hari Ini */}
                    {todayAttendance && !forceShowForm ? (
                      <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-emerald-950">
                              Presensi Hari Ini Berhasil Terverifikasi!
                            </h4>
                            <p className="text-xs text-emerald-800 mt-0.5">
                              Tercatat pada pukul <strong>{todayAttendance.waktu}</strong> ({todayAttendance.status}).
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-700 mt-2 font-mono">
                              <span>Jarak: {todayAttendance.jarakMeter} meter</span>
                              <span>•</span>
                              <span>Jenis: {todayAttendance.jenis}</span>
                              <span>•</span>
                              <span className="font-bold">
                                {todayAttendance.isValidatedByPembina ? '✓ Tervalidasi Pembina' : 'Menunggu Validasi'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setForceShowForm(true)}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2"
                          >
                            Kirim presensi lagi / kegiatan lainnya →
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Form Absen Cepat (1-Klik) */
                      <form onSubmit={handleSubmitPresensi} className="space-y-4">
                        {/* Ringkasan Lokasi & Quick Action */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <MapPin className={`w-4 h-4 ${isValidRadius ? 'text-emerald-600' : 'text-rose-500'}`} />
                            <div>
                              <div className="font-semibold text-slate-800">
                                Lokasi Presensi: {currentGeoConfig.namaLokasi}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Jarak: <strong className={isValidRadius ? 'text-emerald-700' : 'text-rose-600'}>{currentDistance}m</strong> (Radius aman: {currentGeoConfig.radiusToleransiMeter}m)
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentLat(currentGeoConfig.latitude);
                                setCurrentLng(currentGeoConfig.longitude);
                                setLocationLabel('Titik Pusat Sekolah (Presensi Cepat)');
                                setGpsError(null);
                              }}
                              className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                              title="Setel koordinat tepat di lingkungan sekolah"
                            >
                              <span>📍 Pas di Sekolah</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleFetchDeviceGps}
                              disabled={isLocating}
                              className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                              title="Baca lokasi GPS langsung dari perangkat HP/Laptop Anda"
                            >
                              <Navigation className={`w-4 h-4 text-indigo-600 ${isLocating ? 'animate-spin' : ''}`} />
                              <span>{isLocating ? 'Mencari...' : 'GPS HP Saya'}</span>
                            </button>
                          </div>
                        </div>

                        {gpsError && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                            {gpsError}
                          </div>
                        )}

                        {/* Jika Terlambat: Input Alasan Cepat */}
                        {tardinessInfo.isTerlambat && (
                          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                            <label className="block text-xs font-bold text-amber-900">
                              Alasan Keterlambatan Masuk:
                            </label>
                            <input
                              type="text"
                              value={alasanKeterlambatan}
                              onChange={(e) => setAlasanKeterlambatan(e.target.value)}
                              placeholder="Contoh: Kendala di jalan / hujan lebat..."
                              className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <div className="flex flex-wrap gap-1.5 text-xs">
                              {['Kendala kendaraan di jalan', 'Cuaca hujan lebat di Gorontalo', 'Persiapan tugas piket pagi'].map((sug, i) => (
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

                        {/* Tombol Utama Presensi (Besar & Praktis) */}
                        <button
                          type="submit"
                          className={`w-full min-h-[50px] py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-white transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2.5 ${
                            !isValidRadius
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : tardinessInfo.isTerlambat
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                          <span>
                            {!isValidRadius
                              ? 'Kirim Presensi (Di Luar Radius)'
                              : tardinessInfo.isTerlambat
                              ? `Kirim Presensi (Terlambat +${tardinessInfo.menitKeterlambatan}m)`
                              : '✓ Absen Masuk Sekarang'}
                          </span>
                        </button>

                        {/* Accordion Detail Opsi Tambahan */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowCustomDetails(!showCustomDetails)}
                            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                          >
                            {showCustomDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span>Opsi jenis kegiatan & catatan (opsional)</span>
                          </button>

                          {showCustomDetails && (
                            <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-fadeIn">
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                  Jenis Presensi:
                                </label>
                                <select
                                  value={jenisPresensi}
                                  onChange={(e) => setJenisPresensi(e.target.value as PresensiRecord['jenis'])}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                                >
                                  <option value="Kehadiran Sekolah & Piket">Kehadiran Sekolah & Piket OSIS Pagi</option>
                                  <option value="Kehadiran Sekolah Reguler">Kehadiran Sekolah Reguler</option>
                                  <option value="Piket Harian">Piket Harian Ruang Sekretariat</option>
                                  <option value="Apel Pagi / Upacara">Apel Pagi / Upacara Bendera</option>
                                  <option value="Rapat Rutin">Rapat Rutin / Koordinasi</option>
                                </select>
                              </div>
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                  Catatan Tambahan:
                                </label>
                                <input
                                  type="text"
                                  value={keteranganPresensi}
                                  onChange={(e) => setKeteranganPresensi(e.target.value)}
                                  placeholder="Keterangan singkat..."
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </form>
                    )}
                  </div>

                  {/* 3. TOGGLE PETA VISUAL & ALAT PENGUJIAN RADAR (TERSEMBUNYI SECARA DEFAULT AGAR BERSIH) */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setShowSimulators(!showSimulators)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-indigo-500" />
                        <span>{showSimulators ? 'Sembunyikan Peta Radar & Pengujian Lokasi' : 'Buka Peta Radar & Pengujian Lokasi (Opsional)'}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {showSimulators ? 'Tutup ▲' : 'Buka ▼'}
                      </span>
                    </button>

                    {showSimulators && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                        <PresensiVisualMap
                          currentLat={currentLat}
                          currentLng={currentLng}
                          targetGeoConfig={currentGeoConfig}
                          currentDistance={currentDistance}
                          isValid={isValidRadius}
                          onLocationChange={(lat, lng, label) => {
                            setCurrentLat(lat);
                            setCurrentLng(lng);
                            setLocationLabel(label);
                            setGpsError(null);
                          }}
                          onDetectGps={handleFetchDeviceGps}
                          isLocating={isLocating}
                        />

                        {/* Quick Simulation Coordinates Picker */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-slate-600 block mb-2">
                            Preset Pengujian Lokasi Cepat:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {GEOFENCE_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setCurrentLat(preset.latitude);
                                  setCurrentLng(preset.longitude);
                                  setLocationLabel(preset.label);
                                  setGpsError(null);
                                }}
                                className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                                  currentLat === preset.latitude && currentLng === preset.longitude
                                    ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                                }`}
                              >
                                <div className="font-semibold truncate">{preset.label}</div>
                                <div className="text-[10px] text-slate-500">{preset.deskripsi}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Time Simulator Presets */}
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-600 block mb-2">
                            Uji Simulasi Waktu Masuk:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
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
                                    setCustomSeconds(preset.seconds || 0);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                                  selectedTimePreset === preset.id
                                    ? 'bg-indigo-600 text-white border-indigo-700 font-bold'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. RIWAYAT PRESENSI SAYA (SOFT CARDS) */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Riwayat Kehadiran Saya</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {myPresensiHistory.length} Kali Hadir
                      </span>
                    </div>

                    {myPresensiHistory.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        Belum ada riwayat kehadiran tercatat.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {myPresensiHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{item.jenis}</span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    item.status === 'Di Luar Radius'
                                      ? 'bg-rose-100 text-rose-800'
                                      : item.isTerlambat
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {item.tanggal} · {item.waktu} · Jarak: {item.jarakMeter}m
                              </div>
                              {item.alasanKeterlambatan && (
                                <div className="text-[10px] text-amber-900 italic">
                                  Alasan: {item.alasanKeterlambatan}
                                </div>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                item.isValidatedByPembina 
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.isValidatedByPembina ? '✓ Sah Pembina' : 'Menunggu Validasi'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: UPDATE HASIL & PROGRES PROKER */}
        {activeTab === 'proker' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Pembaruan Hasil & Capaian Program Kerja
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih program kerja yang didelegasikan ke sekbid Anda, masukkan persentase progres, catatan evaluasi terbaru, dan foto hasil kegiatan.
                </p>
              </div>

              {/* Filter Proker Sekbid vs Semua */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs self-start">
                <button
                  type="button"
                  onClick={() => setProkerFilter('sekbid')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    prokerFilter === 'sekbid'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Proker Sekbid Saya
                </button>
                <button
                  type="button"
                  onClick={() => setProkerFilter('semua')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    prokerFilter === 'semua'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Proker OSIS
                </button>
              </div>
            </div>

            {/* Proker Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProkers.map((proker) => (
                <div
                  key={proker.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Poster if exists */}
                    {proker.posterUrl && (
                      <div className="h-36 bg-slate-900 relative overflow-hidden">
                        <img
                          src={proker.posterUrl}
                          alt={proker.namaProker}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur text-white border border-white/20">
                            {proker.kode}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                              proker.status === 'Selesai'
                                ? 'bg-emerald-600 text-white'
                                : proker.status === 'Berjalan'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {proker.status}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      {!proker.posterUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-slate-500">{proker.kode}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-indigo-100 text-indigo-800">
                            {proker.status}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {proker.sekbid}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                          {proker.namaProker}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {proker.deskripsi}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Realisasi Capaian</span>
                          <span className="font-mono font-bold text-indigo-600">{proker.progress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${proker.progress}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              proker.progress === 100
                                ? 'bg-emerald-500'
                                : proker.progress >= 50
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                          ></div>
                        </div>
                      </div>

                      {/* Budget Readout */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Realisasi Dana:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          Rp {proker.realisasiAnggaran.toLocaleString('id-ID')} / Rp {proker.anggaranRAB.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Latest Note */}
                      {proker.catatanTerbaru && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                          <span className="font-bold text-slate-700 block mb-0.5">Catatan Terakhir:</span>
                          <p className="italic line-clamp-2">"{proker.catatanTerbaru}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => handleOpenUpdateModal(proker)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Update Hasil Proker</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: JADWAL PIKET */}
        {activeTab === 'piket' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Jadwal Piket & Arahan Terintegrasi Sekretaris</h3>
              <p className="text-xs text-slate-500">
                Rotasi piket harian pengurus OSIS SMK Tridharma Gorontalo yang disinkronkan langsung dengan instruksi harian Sekretaris OSIS dan presensi sekolah (Batas tepat waktu: 07.15 WITA).
              </p>
            </div>

            {/* AGENDA HARIAN SEKRETARIS UNTUK HARI INI */}
            {agendaSekretaris && (
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white border border-indigo-700/60 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/40 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-extrabold block">
                      INPUT RESMI SEKRETARIS OSIS · HARI INI
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {agendaSekretaris.hari}, {agendaSekretaris.tanggal} · {agendaSekretaris.temaHari}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg shadow-sm">
                      Batas Masuk: 07.15 WITA
                    </span>
                    <span className="text-xs font-mono text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
                      Diperbarui: {agendaSekretaris.updatedAt}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                      📢 Instruksi Harian Sekretaris:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                      "{agendaSekretaris.instruksiSekretaris}"
                    </p>
                    <div className="text-xs text-slate-300 pt-1">
                      Koordinator Piket Hari Ini: <strong className="text-white">{agendaSekretaris.koordinatorPiket}</strong>
                    </div>
                    <div className="text-xs text-slate-300">
                      Petugas Piket Terjadwal: <span className="text-indigo-200 font-semibold">{agendaSekretaris.petugasPiket.join(', ')}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      ⏰ Jadwal Agenda Kegiatan Hari Ini:
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {agendaSekretaris.agendaKegiatan.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between text-xs gap-2 py-1 border-b border-white/5 last:border-0"
                        >
                          <span className="font-mono text-[11px] font-bold text-amber-300 shrink-0">
                            {item.waktu}
                          </span>
                          <span className="text-slate-200 truncate flex-1 font-medium">
                            {item.kegiatan}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {item.lokasi}
                          </span>
                        </div>
                      ))}
                    </div>

                    {agendaSekretaris.catatanKhusus && (
                      <div className="text-[11px] text-amber-200 bg-amber-950/40 border border-amber-600/30 rounded-lg p-2 mt-2">
                        <strong>Catatan Sekretaris:</strong> {agendaSekretaris.catatanKhusus}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jadwalPiket.map((piket) => {
                const isMyDay = piket.anggotaPiket.some(
                  (a) => a.toLowerCase().includes(currentUser.fullName.toLowerCase()) ||
                         currentUser.fullName.toLowerCase().includes(a.toLowerCase())
                );

                return (
                  <div
                    key={piket.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isMyDay
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-slate-900">{piket.hari}</span>
                      {isMyDay && (
                        <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          JADWAL ANDA
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 mb-3">
                      <span className="font-semibold text-slate-800">Koordinator:</span> {piket.koordinator}
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Anggota Bertugas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {piket.anggotaPiket.map((nama, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-lg ${
                              nama.toLowerCase().includes(currentUser.fullName.toLowerCase())
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                          >
                            {nama}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/70 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block">Tugas Utama:</span>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                        {piket.tugasUtama.map((t, idx) => (
                          <li key={idx} className="line-clamp-1">{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: TIM & ANGGOTA SEKBID */}
        {activeTab === 'tim' && (
          <div className="space-y-6">
            {/* Header Sekbid Info */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                    <Users className="w-4 h-4" />
                    <span>Rekan Kerja & Struktur Seksi Bidang</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Seksi Bidang OSIS SMK Tridharma
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Koordinasi solid antara Koordinator dan Anggota Sekbid untuk keberhasilan seluruh program kerja.
                  </p>
                </div>

                {userSekbidNum && (
                  <span className="self-start sm:self-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono">
                    Bidang Tugas Anda: Sekbid #{userSekbidNum}
                  </span>
                )}
              </div>

              {/* Sekbid Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                {currentSekbids.map((s) => {
                  const isUserSekbid = userSekbidNum === s.nomor;
                  const isSelected = selectedSekbidTab === s.nomor;
                  const count = orgMembers.filter(
                    (m) => (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') && m.sekbidNomor === s.nomor
                  ).length;

                  return (
                    <button
                      key={s.nomor}
                      type="button"
                      onClick={() => setSelectedSekbidTab(s.nomor)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-mono font-bold">#{s.nomor}</span>
                      <span>{s.singkatan}</span>
                      {isUserSekbid && (
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Sekbid Card */}
            {(() => {
              const sek = currentSekbids.find((s) => s.nomor === selectedSekbidTab) || currentSekbids[0];
              const koordinator = orgMembers.find(
                (m) =>
                  (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') &&
                  m.sekbidNomor === sek.nomor &&
                  (m.peranSekbid === 'koordinator' || m.jabatan.toLowerCase().includes('koordinator'))
              );
              const anggotaList = orgMembers.filter(
                (m) =>
                  (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') &&
                  m.sekbidNomor === sek.nomor &&
                  (m.peranSekbid === 'anggota' || (!m.peranSekbid && !m.jabatan.toLowerCase().includes('koordinator')))
              );

              return (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b border-slate-800">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 font-mono">
                        SEKBID #{sek.nomor}
                      </span>
                      <span className="text-xs text-indigo-200 font-semibold">{sek.singkatan}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {sek.nama}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {sek.deskripsi}
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Koordinator */}
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Koordinator Seksi Bidang</span>
                      </div>

                      {koordinator ? (
                        <div className="bg-gradient-to-r from-indigo-50/70 to-white rounded-2xl border border-indigo-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-indigo-400 overflow-hidden shrink-0 shadow-sm">
                              {koordinator.fotoUrl ? (
                                <img
                                  src={koordinator.fotoUrl}
                                  alt={koordinator.nama}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm bg-indigo-600">
                                  {koordinator.nama.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {koordinator.nama}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                                  KOORDINATOR
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-indigo-700">
                                {koordinator.jabatan}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Kelas: {koordinator.kelas} {koordinator.kontak && `• WA: ${koordinator.kontak}`}
                              </div>
                            </div>
                          </div>

                          {koordinator.visiSingkat && (
                            <p className="text-xs text-slate-600 italic max-w-sm sm:text-right">
                              "{koordinator.visiSingkat}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                          Belum ada Koordinator yang ditugaskan untuk Sekbid #{sek.nomor}.
                        </div>
                      )}
                    </div>

                    {/* Anggota Sekbid */}
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Anggota Seksi Bidang ({anggotaList.length} Personel)</span>
                      </div>

                      {anggotaList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {anggotaList.map((agt) => (
                            <div
                              key={agt.id}
                              className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3.5 flex items-center gap-3 hover:bg-slate-100/80 transition-colors"
                            >
                              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-300 overflow-hidden shrink-0 shadow-2xs">
                                {agt.fotoUrl ? (
                                  <img
                                    src={agt.fotoUrl}
                                    alt={agt.nama}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-emerald-600">
                                    {agt.nama.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {agt.nama}
                                </div>
                                <div className="text-[11px] text-slate-600 truncate font-medium">
                                  {agt.jabatan}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                  Kelas: {agt.kelas}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                          Belum ada Anggota yang ditambahkan di Sekbid #{sek.nomor}.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* MODAL UPDATE HASIL PROKER */}
      {selectedProker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600">{selectedProker.kode}</span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Pembaruan Hasil: {selectedProker.namaProker}
                </h3>
                <p className="text-xs text-slate-500">{selectedProker.sekbid}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProker(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProkerUpdate} className="space-y-4">
              {/* Slider Progres (%) */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Capaian Progres Realisasi
                  </label>
                  <span className="text-sm font-black font-mono text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                    {prokerProgress}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={prokerProgress}
                  onChange={(e) => setProkerProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Rencana)</span>
                  <span>50% (Berjalan)</span>
                  <span>100% (Tuntas)</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Status Program Kerja
                </label>
                <select
                  value={prokerStatus}
                  onChange={(e) => setProkerStatus(e.target.value as ProkerStatus)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Perencanaan">Perencanaan</option>
                  <option value="Berjalan">Berjalan</option>
                  <option value="Evaluasi">Evaluasi</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              {/* Realisasi Anggaran */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Realisasi Anggaran Terpakai (RAB: Rp {selectedProker.anggaranRAB.toLocaleString('id-ID')})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={prokerRealisasi}
                    onChange={(e) => setProkerRealisasi(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Catatan / Laporan Perkembangan Terkini */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Laporan Hasil & Catatan Perkembangan Terkini <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={prokerCatatan}
                  onChange={(e) => setProkerCatatan(e.target.value)}
                  placeholder="Tuliskan capaian yang telah terlaksana, hambatan di lapangan, atau koordinasi yang telah dilakukan..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                ></textarea>
              </div>

              {/* Upload Foto Dokumentasi / Bukti Hasil */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Foto Bukti Kegiatan / Poster Hasil
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prokerFotoUrl}
                    onChange={(e) => setProkerFotoUrl(e.target.value)}
                    placeholder="URL gambar atau unggah file di samping..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Unggah</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {prokerFotoUrl && (
                  <div className="mt-2 h-24 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={prokerFotoUrl}
                      alt="Preview Dokumentasi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProker(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Laporan Hasil Proker</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile Bottom Navigation Bar for Portal Pengurus (Mode Ponsel) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-lg flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab('presensi')}
          className={`flex flex-col items-center justify-center min-w-[72px] min-h-[48px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'presensi'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 ring-1 ring-indigo-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] leading-tight font-bold">Presensi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proker')}
          className={`flex flex-col items-center justify-center min-w-[72px] min-h-[48px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'proker'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 ring-1 ring-indigo-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] leading-tight font-bold">Proker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('piket')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
            activeTab === 'piket'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 ring-1 ring-indigo-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] leading-tight font-bold">Piket</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tim')}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
            activeTab === 'tim'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 ring-1 ring-indigo-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5 shrink-0" />
          <span className="text-[10px] leading-tight font-bold">Tim Sekbid</span>
        </button>
      </div>
    </div>
  );
};
