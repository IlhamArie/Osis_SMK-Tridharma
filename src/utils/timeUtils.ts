// Utility for WITA Time and School Attendance Late Policy (07:15 WITA)

export interface LateEvaluationResult {
  isTerlambat: boolean;
  menitKeterlambatan: number;
  waktuBatas: string;
  waktuAktual: string;
  statusPresensi: 'Hadir Valid (Tepat Waktu)' | 'Hadir Valid (Terlambat)' | 'Di Luar Radius';
  pesanPeringatan: string;
}

/**
 * Menghitung status keterlambatan presensi berdasarkan batas sekolah 07:15 WITA
 * @param customTimeString Optional format "HH:mm" atau "HH:mm:ss"
 */
export function evaluateSchoolLatePolicy(
  customTimeString?: string,
  isRadiusValid: boolean = true
): LateEvaluationResult {
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (customTimeString) {
    const match = customTimeString.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      seconds = match[3] ? parseInt(match[3], 10) : 0;
    }
  } else {
    // Current WITA Time (UTC + 8)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcSeconds = now.getUTCSeconds();
    hours = (utcHours + 8) % 24;
    minutes = utcMinutes;
    seconds = utcSeconds;
  }

  const currentSeconds = hours * 3600 + minutes * 60 + seconds;
  // Batas cutoff sekolah: 07:15:00 WITA
  const cutoffSeconds = 7 * 3600 + 15 * 60;

  const diffSeconds = currentSeconds - cutoffSeconds;
  const isTerlambat = diffSeconds > 0;
  const menitKeterlambatan = isTerlambat ? Math.ceil(diffSeconds / 60) : 0;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const waktuAktual = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} WITA`;
  const waktuBatas = '07:15 WITA';

  let statusPresensi: LateEvaluationResult['statusPresensi'] = 'Hadir Valid (Tepat Waktu)';
  let pesanPeringatan = 'Tepat waktu: Anda hadir sebelum batas akhir pukul 07.15 WITA.';

  if (!isRadiusValid) {
    statusPresensi = 'Di Luar Radius';
    pesanPeringatan = 'Peringatan: Posisi Anda berada di luar radius lokasi presensi sekolah.';
  } else if (isTerlambat) {
    statusPresensi = 'Hadir Valid (Terlambat)';
    pesanPeringatan = `Peringatan Keterlambatan: Anda tercatat hadir pukul ${waktuAktual} (Terlambat ${menitKeterlambatan} menit melewati batas 07.15 WITA).`;
  }

  return {
    isTerlambat,
    menitKeterlambatan,
    waktuBatas,
    waktuAktual,
    statusPresensi,
    pesanPeringatan,
  };
}

/**
 * Mendapatkan string jam WITA saat ini
 */
export function getCurrentWitaTimeString(): string {
  const now = new Date();
  const hours = (now.getUTCHours() + 8) % 24;
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} WITA`;
}
