import React, { useState } from 'react';
import { SchoolGeoConfig, UserAccount } from '../../types/erp';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Sliders, 
  Save, 
  Sparkles, 
  Compass, 
  Radio, 
  Layers, 
  ShieldCheck, 
  Crosshair, 
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';

interface GeoLocationConfigMapsProps {
  currentUser: UserAccount;
  currentGeoConfig: SchoolGeoConfig;
  onSaveGeoConfig: (newConfig: SchoolGeoConfig) => void;
  onNavigateToPresensi?: () => void;
}

interface MapPreset {
  id: string;
  nama: string;
  alamat: string;
  lat: number;
  lng: number;
  defaultRadius: number;
  keterangan: string;
  tipe: 'kampus' | 'kegiatan' | 'olahraga';
}

const PRESET_LOCATIONS: MapPreset[] = [
  {
    id: 'kampus-utama',
    nama: 'Kampus Utama SMK Tridharma Gorontalo',
    alamat: 'Jl. Mayor Dullah No. 12, Limba B, Kota Gorontalo',
    lat: 0.543500,
    lng: 123.064200,
    defaultRadius: 150,
    keterangan: 'Lokasi default presensi harian, apel Senin, dan jam piket pengurus OSIS.',
    tipe: 'kampus',
  },
  {
    id: 'ruang-osis',
    nama: 'Sekretariat OSIS & Lab Vokasi Tridharma',
    alamat: 'Gedung A Lantai 1, SMK Tridharma Gorontalo',
    lat: 0.543710,
    lng: 123.064120,
    defaultRadius: 80,
    keterangan: 'Radius presensi terfokus untuk rapat pengurus dan koordinasi kerja sekretariat.',
    tipe: 'kampus',
  },
  {
    id: 'bongohulawa-ldks',
    nama: 'Bumi Perkemahan Bongohulawa (LDKS 2026)',
    alamat: 'Kecamatan Limboto, Kabupaten Gorontalo',
    lat: 0.638900,
    lng: 122.981400,
    defaultRadius: 350,
    keterangan: 'Lokasi khusus Latihan Dasar Kepemimpinan Siswa (LDKS) alam terbuka.',
    tipe: 'kegiatan',
  },
  {
    id: 'aula-limba',
    nama: 'Aula Pertemuan Limba B & Safari Ramadan',
    alamat: 'Kelurahan Limba B, Kota Gorontalo',
    lat: 0.541200,
    lng: 123.061500,
    defaultRadius: 200,
    keterangan: 'Lokasi penyelenggaraan bakti sosial pembagian sembako & buka puasa bersama.',
    tipe: 'kegiatan',
  },
  {
    id: 'gor-nani',
    nama: 'Gelanggang Olahraga Nani Wartabone Gorontalo',
    alamat: 'Jl. Nani Wartabone, Kota Gorontalo',
    lat: 0.548200,
    lng: 123.059300,
    defaultRadius: 300,
    keterangan: 'Lokasi pertandingan turnamen porseni / classmeeting luar kampus.',
    tipe: 'olahraga',
  },
];

export const GeoLocationConfigMaps: React.FC<GeoLocationConfigMapsProps> = ({
  currentUser,
  currentGeoConfig,
  onSaveGeoConfig,
  onNavigateToPresensi,
}) => {
  // Form State
  const [namaLokasi, setNamaLokasi] = useState(currentGeoConfig.namaLokasi);
  const [alamat, setAlamat] = useState(currentGeoConfig.alamat);
  const [latitude, setLatitude] = useState<number>(currentGeoConfig.latitude);
  const [longitude, setLongitude] = useState<number>(currentGeoConfig.longitude);
  const [radiusMeter, setRadiusMeter] = useState<number>(currentGeoConfig.radiusToleransiMeter);
  const [deskripsi, setDeskripsi] = useState(currentGeoConfig.deskripsi);
  const [mapTheme, setMapTheme] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  
  // Status states
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Map interactive click offset relative to current center
  const [zoomLevel, setZoomLevel] = useState<number>(17);

  // Apply Preset
  const handleApplyPreset = (preset: MapPreset) => {
    setNamaLokasi(preset.nama);
    setAlamat(preset.alamat);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setRadiusMeter(preset.defaultRadius);
    setDeskripsi(preset.keterangan);
    setSaveSuccess(false);
  };

  // Detect Pembina Current Device GPS
  const handleDetectDeviceLocation = () => {
    setIsDetectingGps(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('Browser tidak mendukung pendeteksian geolokasi.');
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = Number(pos.coords.latitude.toFixed(6));
        const detectedLng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(detectedLat);
        setLongitude(detectedLng);
        setNamaLokasi(`Titik Koordinat Pembina (${currentUser.fullName.split(' ')[0]})`);
        setAlamat(`Lokasi Terdeteksi GPS Perangkat: Akurasi ±${Math.round(pos.coords.accuracy)}m`);
        setDeskripsi(`Ditetapkan langsung melalui GPS perangkat ${currentUser.fullName} pada ${new Date().toLocaleTimeString('id-ID')} WITA.`);
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError(`Gagal membaca GPS: ${err.message}. Anda tetap dapat menggeser pin peta atau memasukkan koordinat manual.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle Map Click to Pin New Location
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel offset to delta lat/lng based on zoom
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (x - centerX) / rect.width;
    const deltaY = (y - centerY) / rect.height;

    // Scaling factor for Gorontalo coordinate space (~0.005 degrees span)
    const scaleFactor = 0.008 * (16 / zoomLevel);

    const newLng = Number((longitude + deltaX * scaleFactor).toFixed(6));
    const newLat = Number((latitude - deltaY * scaleFactor).toFixed(6));

    setLatitude(newLat);
    setLongitude(newLng);
    setSaveSuccess(false);
  };

  // Submit Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} WITA`;

    const updatedConfig: SchoolGeoConfig = {
      namaLokasi: namaLokasi.trim(),
      alamat: alamat.trim(),
      latitude,
      longitude,
      radiusToleransiMeter: Number(radiusMeter),
      deskripsi: deskripsi.trim(),
      updatedBy: `${currentUser.fullName} (${currentUser.jabatan})`,
      updatedAt: timeStr,
    };

    onSaveGeoConfig(updatedConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Reset to default school
  const handleResetToDefault = () => {
    handleApplyPreset(PRESET_LOCATIONS[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Akses Eksklusif Pembina & BPH
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Kalibrasi Geofencing Presensi</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-indigo-600" />
            <span>Pengaturan Lokasi Presensi (Visual Maps)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Pembina OSIS dan Badan Pengurus Harian (BPH) dapat memindahkan atau mengkalibrasi titik pusat presensi serta menentukan radius toleransi valid untuk kegiatan harian maupun acara di luar kampus.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Kembalikan ke Kampus Utama"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Kampus</span>
          </button>

          {onNavigateToPresensi && (
            <button
              onClick={onNavigateToPresensi}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-100"
            >
              <span>Uji Presensi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span>Lokasi presensi berhasil diperbarui & disimpan!</span>
              <p className="text-[11px] text-emerald-700 font-normal mt-0.5">
                Seluruh pengurus OSIS kini akan divalidasi presensinya terhadap <strong>{namaLokasi}</strong> (Radius: {radiusMeter} meter).
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">
            AKTIF
          </span>
        </div>
      )}

      {/* GPS Error Notification */}
      {gpsError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Main Grid: Visual Map Canvas (Left) & Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Map Canvas & Radar (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#f8f9fa] rounded-3xl border border-slate-300 overflow-hidden shadow-md text-slate-800 relative flex flex-col font-sans">
            {/* Google Maps Top Bar */}
            <div className="px-4 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between z-20 relative shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-0.5">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" fill="#EA4335" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    Google Maps <span className="font-normal text-slate-500">· Kalibrasi Titik Presensi</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Kota Gorontalo, Provinsi Gorontalo
                  </span>
                </div>
              </div>

              {/* Map Theme Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium shadow-inner">
                <button
                  type="button"
                  onClick={() => setMapTheme('roadmap')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    mapTheme === 'roadmap'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Peta
                </button>
                <button
                  type="button"
                  onClick={() => setMapTheme('satellite')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    mapTheme === 'satellite'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Satelit
                </button>
                <button
                  type="button"
                  onClick={() => setMapTheme('terrain')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    mapTheme === 'terrain'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Medan
                </button>
              </div>
            </div>

            {/* Interactive Visual Map Body */}
            <div
              onClick={handleMapClick}
              className="relative h-[380px] sm:h-[440px] w-full cursor-crosshair overflow-hidden select-none"
              title="Klik di mana saja pada peta Google Maps untuk memindahkan titik koordinat presensi!"
            >
              {/* Map Background Style: Roadmap (Google Maps Clean Street View) */}
              {mapTheme === 'roadmap' && (
                <div className="absolute inset-0 bg-[#f4f3f0]">
                  {/* Green Park / School Field */}
                  <div className="absolute top-[20%] left-[25%] w-[50%] h-[60%] bg-[#d9ebd4] rounded-3xl opacity-75 border border-[#b8ddaf]"></div>
                  
                  {/* Building Block */}
                  <div className="absolute top-[34%] left-[36%] w-[28%] h-[32%] bg-[#e9e6df] rounded-xl border border-[#d2cec3] shadow-sm flex flex-col items-center justify-center p-2 opacity-95">
                    <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                      Gedung Kampus Tridharma
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">SMK Kejuruan</span>
                  </div>

                  {/* Google Street Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fed876" strokeWidth="16" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff" strokeWidth="12" />
                    <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#fed876" strokeWidth="14" />
                    <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#ffffff" strokeWidth="10" />
                    <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#ffffff" strokeWidth="8" />
                    <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#ffffff" strokeWidth="7" />
                    <text x="6%" y="47%" fill="#5f6368" fontSize="11" fontWeight="600">Jl. Mayor Dullah</text>
                    <text x="50%" y="18%" fill="#5f6368" fontSize="10" fontWeight="600">Limba B</text>
                  </svg>
                </div>
              )}

              {/* Map Background Style: Satellite */}
              {mapTheme === 'satellite' && (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')`,
                    filter: 'brightness(0.9) contrast(1.1)',
                  }}
                >
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff" strokeWidth="6" strokeDasharray="8 4" />
                    <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#ffffff" strokeWidth="6" strokeDasharray="8 4" />
                    <text x="8%" y="46%" fill="#ffffff" fontSize="11" fontWeight="700" filter="drop-shadow(0 1px 2px black)">Jl. Mayor Dullah</text>
                  </svg>
                </div>
              )}

              {/* Map Background Style: Terrain */}
              {mapTheme === 'terrain' && (
                <div className="absolute inset-0 bg-[#e8ece1]">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff" strokeWidth="10" />
                    <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#ffffff" strokeWidth="8" />
                    <text x="6%" y="47%" fill="#4a5568" fontSize="11" fontWeight="600">Jl. Mayor Dullah</text>
                  </svg>
                </div>
              )}

              {/* Google Maps Floating Search / Destination Card (Top-Left) */}
              <div className="absolute top-3 left-3 z-20 max-w-[270px] bg-white rounded-2xl shadow-lg border border-slate-200/80 p-3 pointer-events-none">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <span className="font-black text-xs">TD</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {namaLokasi}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {alamat}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                        Radius: {radiusMeter} Meter
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Beacon / Pin & Animated Geofence Radius Circle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Geofence Boundary Circle (Google Translucent Blue Halo) */}
                <div
                  style={{
                    width: `${Math.min(380, Math.max(90, (radiusMeter / 150) * 180))}px`,
                    height: `${Math.min(380, Math.max(90, (radiusMeter / 150) * 180))}px`,
                  }}
                  className="rounded-full border-2 border-[#4285F4] bg-[#4285F4]/10 flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(66,133,244,0.25)]"
                >
                  <div className="w-3/4 h-3/4 rounded-full border border-[#4285F4]/30 animate-pulse"></div>
                </div>

                {/* Iconic Google Red Destination Pin */}
                <div className="absolute -translate-y-6 flex flex-col items-center pointer-events-none">
                  <div className="px-2.5 py-0.5 rounded-md bg-white text-slate-900 font-bold text-[10px] shadow-md border border-slate-200 whitespace-nowrap mb-0.5">
                    📍 {namaLokasi.split('(')[0].trim()}
                  </div>
                  <div className="relative filter drop-shadow-md">
                    <svg width="34" height="42" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M16 0C7.16 0 0 7.16 0 16C0 26.5 16 40 16 40C16 40 32 26.5 32 16C32 7.16 24.84 0 16 0Z"
                        fill="#EA4335"
                      />
                      <circle cx="16" cy="14" r="6" fill="#B31412" />
                      <circle cx="16" cy="14" r="5" fill="#FFFFFF" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Google Maps Floating Controls (Bottom-Right) */}
              <div className="absolute bottom-3 right-3 z-20 flex flex-col items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setZoomLevel(17)}
                  className="w-9 h-9 rounded-full bg-white shadow-md hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                  title="Arah Utara"
                >
                  <Compass className="w-4 h-4 text-indigo-600" />
                </button>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(19, z + 1))}
                    className="w-9 h-8 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-base transition-colors border-b border-slate-200"
                    title="Perbesar"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(14, z - 1))}
                    className="w-9 h-8 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-base transition-colors"
                    title="Perkecil"
                  >
                    −
                  </button>
                </div>
              </div>

              {/* Google Maps Attribution & Scale (Bottom-Left) */}
              <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2 pointer-events-none text-[10px] text-slate-500 font-sans">
                <div className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">Google</span>
                  <span>·</span>
                  <span>Data peta ©2026</span>
                  <span>·</span>
                  <span className="font-mono">Radius: {radiusMeter}m</span>
                </div>
              </div>
            </div>

            {/* Map Bottom Coordinates Readout */}
            <div className="p-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">Koordinat Terpilih:</span>
                <span className="text-slate-800 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Lat: {latitude.toFixed(6)}
                </span>
                <span className="text-slate-800 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Lng: {longitude.toFixed(6)}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                *Klik di mana saja pada peta untuk menggeser pin merah Google Maps
              </div>
            </div>
          </div>

          {/* Quick Presets Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Preset Lokasi Acara & Kampus Cepat</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">1-Klik Terapkan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    latitude === preset.lat && longitude === preset.lng
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 line-clamp-1">{preset.nama}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold shrink-0">
                        {preset.defaultRadius}m
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{preset.alamat}</p>
                  </div>
                  <div className="mt-2 text-[10px] text-indigo-600 font-medium">
                    {preset.tipe === 'kampus' ? '🏛️ Wilayah Sekolah' : '🏕️ Lokasi Kegiatan Luar'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Configuration Form & Radius Slider (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Formulir Parameter Geofence</span>
              </h3>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                REAL-TIME
              </span>
            </div>

            {/* Nama Lokasi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nama Titik Lokasi Presensi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaLokasi}
                onChange={(e) => setNamaLokasi(e.target.value)}
                placeholder="Contoh: Kampus Utama SMK Tridharma Gorontalo"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Alamat / Keterangan Wilayah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Contoh: Jl. Mayor Dullah No. 12, Kelurahan Limba B"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Live GPS Device Capture Button */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-sky-600" />
                  <span>Deteksi Posisi Pembina Sekarang</span>
                </span>
                {isDetectingGps && (
                  <span className="text-[10px] font-mono text-sky-600 animate-pulse">
                    Mencari satelit...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                Tekan tombol ini saat Anda sudah tiba di lokasi kegiatan baru (misal lokasi kemah, gedung lomba, atau tempat bakti sosial) untuk menyalin GPS Anda langsung.
              </p>
              <button
                type="button"
                disabled={isDetectingGps}
                onClick={handleDetectDeviceLocation}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isDetectingGps ? 'Membaca GPS Perangkat...' : 'Gunakan Koordinat GPS Saya Saat Ini'}</span>
              </button>
            </div>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Radius Toleransi Valid Slider */}
            <div className="space-y-2 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Radius Toleransi Geofence
                </label>
                <span className="text-xs font-black font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs">
                  {radiusMeter} Meter
                </span>
              </div>

              <input
                type="range"
                min="30"
                max="1000"
                step="10"
                value={radiusMeter}
                onChange={(e) => setRadiusMeter(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>30 m (Sangat Ketat)</span>
                <span>150 m (Standar Kampus)</span>
                <span>1000 m (Wilayah Luas)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Pengurus yang melakukan presensi di luar jarak <strong>{radiusMeter} meter</strong> akan otomatis ditandai berstatus <em>"Di Luar Radius"</em>.
              </p>
            </div>

            {/* Catatan / Keterangan */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Instruksi Presensi untuk Pengurus
              </label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tuliskan catatan arahan presensi untuk pengurus..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              ></textarea>
            </div>

            {/* Last Updated By Info */}
            <div className="p-3 bg-slate-100/80 rounded-xl flex items-start gap-2 text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span>Terakhir diperbarui oleh: <strong>{currentGeoConfig.updatedBy}</strong></span>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{currentGeoConfig.updatedAt}</div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terapkan Titik Geofence Ini</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
