import { SchoolGeoConfig } from '../types/erp';

// SMK Tridharma Gorontalo Geolocation Configuration
// Lokasi: Jl. Mayor Dullah No. 12, Kota Gorontalo, Provinsi Gorontalo
export const SCHOOL_GEO_CONFIG: SchoolGeoConfig = {
  namaLokasi: 'Kampus Utama SMK Tridharma Gorontalo',
  alamat: 'Jl. Mayor Dullah No. 12, Limba B, Kota Gorontalo',
  latitude: 0.543500,
  longitude: 123.064200,
  radiusToleransiMeter: 150, // Radius presensi valid (dalam meter)
  deskripsi: 'Area gerbang utama, lapangan upacara, dan ruang kelas SMK Tridharma',
  updatedBy: 'Ilham Arief, S.Pd. (Pembina OSIS)',
  updatedAt: '2026-09-30 08:00 WITA',
};

/**
 * Menghitung jarak antara dua koordinat geografis menggunakan Haversine Formula
 * @returns jarak dalam satuan meter
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number = SCHOOL_GEO_CONFIG.latitude,
  lon2: number = SCHOOL_GEO_CONFIG.longitude
): number {
  const R = 6371e3; // Radius bumi dalam meter
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

export function isWithinSchoolRadius(
  userLat: number,
  userLon: number,
  centerLat: number = SCHOOL_GEO_CONFIG.latitude,
  centerLon: number = SCHOOL_GEO_CONFIG.longitude,
  radiusMeter: number = SCHOOL_GEO_CONFIG.radiusToleransiMeter
): { isValid: boolean; distance: number } {
  const distance = calculateHaversineDistance(userLat, userLon, centerLat, centerLon);
  return {
    isValid: distance <= radiusMeter,
    distance,
  };
}

export interface PresetLocation {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  deskripsi: string;
  expectedValid: boolean;
}

export const GEOFENCE_PRESETS: PresetLocation[] = [
  {
    id: 'gerbang',
    label: 'Gerbang Utama & Lapangan Upacara (0m)',
    latitude: 0.543500,
    longitude: 123.064200,
    deskripsi: 'Titik pusat kampus SMK Tridharma Gorontalo',
    expectedValid: true,
  },
  {
    id: 'ruang_osis',
    label: 'Ruang Sekretariat OSIS (28m)',
    latitude: 0.543710,
    longitude: 123.064120,
    deskripsi: 'Gedung A Lantai 1 SMK Tridharma',
    expectedValid: true,
  },
  {
    id: 'lab_vokasi',
    label: 'Bengkel & Lab Vokasi Praktik (72m)',
    latitude: 0.543950,
    longitude: 123.064400,
    deskripsi: 'Area praktik kejuruan SMK Tridharma',
    expectedValid: true,
  },
  {
    id: 'kantin',
    label: 'Kantin & Gazebo Belakang (118m)',
    latitude: 0.542800,
    longitude: 123.063800,
    deskripsi: 'Batas selatan area kampus SMK Tridharma',
    expectedValid: true,
  },
  {
    id: 'lapangan_taruna',
    label: 'Di Luar Radius - Lapangan Taruna Remaja (~1.8 km)',
    latitude: 0.536000,
    longitude: 123.060000,
    deskripsi: 'Area publik pusat kota Gorontalo (Tidak Valid)',
    expectedValid: false,
  },
  {
    id: 'rumah_siswa',
    label: 'Di Luar Radius - Rumah Siswa Kota Barat (~3.5 km)',
    latitude: 0.552000,
    longitude: 123.035000,
    deskripsi: 'Kediaman pribadi di luar area sekolah (Tidak Valid)',
    expectedValid: false,
  },
];

// --- SISTEM WAKTU WITA & EVALUASI KETERLAMBATAN SEKOLAH (CUTOFF 07:15 WITA) ---
export const SCHOOL_CUTOFF_HOUR = 7;
export const SCHOOL_CUTOFF_MINUTE = 15; // 07:15 WITA (SMK Tridharma Gorontalo)

/**
 * Mengubah objek Date ke waktu WITA (UTC+8)
 */
export function getWitaDate(date: Date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 8);
}

/**
 * Mengevaluasi status keterlambatan kehadiran sekolah berdasarkan jam dan menit WITA
 */
export function evaluateTardiness(
  hours: number,
  minutes: number
): {
  isTerlambat: boolean;
  menitKeterlambatan: number;
  sisaMenitTepatWaktu: number;
  statusBadge: 'Tepat Waktu' | 'Terlambat';
  pesanStatus: string;
} {
  const currentTotalMinutes = hours * 60 + minutes;
  const cutoffTotalMinutes = SCHOOL_CUTOFF_HOUR * 60 + SCHOOL_CUTOFF_MINUTE; // 07:15 = 435 menit

  if (currentTotalMinutes > cutoffTotalMinutes) {
    const lateMinutes = currentTotalMinutes - cutoffTotalMinutes;
    return {
      isTerlambat: true,
      menitKeterlambatan: lateMinutes,
      sisaMenitTepatWaktu: 0,
      statusBadge: 'Terlambat',
      pesanStatus: `Terlambat ${lateMinutes} menit (Melewati batas masuk sekolah 07:15 WITA)`,
    };
  } else {
    const remainingMinutes = cutoffTotalMinutes - currentTotalMinutes;
    return {
      isTerlambat: false,
      menitKeterlambatan: 0,
      sisaMenitTepatWaktu: remainingMinutes,
      statusBadge: 'Tepat Waktu',
      pesanStatus: `Tepat waktu (${remainingMinutes} menit tersisa sebelum batas 07:15 WITA)`,
    };
  }
}

export interface TimeSimulationPreset {
  id: string;
  label: string;
  hours: number;
  minutes: number;
  seconds?: number;
  isRealtime?: boolean;
}

export const TIME_SIMULATION_PRESETS: TimeSimulationPreset[] = [
  { id: 'realtime', label: 'Waktu Nyata Sekarang (WITA)', hours: 0, minutes: 0, isRealtime: true },
  { id: 'piket_pagi', label: '06:45 WITA · Piket Gerbang Utama (Tepat Waktu)', hours: 6, minutes: 45, seconds: 0 },
  { id: 'apel_pagi', label: '07:05 WITA · Bersiap Apel / Sisa 10 Menit', hours: 7, minutes: 5, seconds: 0 },
  { id: 'deadline', label: '07:14 WITA · Menjelang Bel Berbunyi', hours: 7, minutes: 14, seconds: 30 },
  { id: 'terlambat_ringan', label: '07:22 WITA · Terlambat +7 Menit (Lewat 07:15)', hours: 7, minutes: 22, seconds: 15 },
  { id: 'terlambat_sedang', label: '07:40 WITA · Terlambat +25 Menit (Lewat 07:15)', hours: 7, minutes: 40, seconds: 0 },
];
