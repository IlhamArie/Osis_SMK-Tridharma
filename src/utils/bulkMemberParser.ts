import { DAFTAR_KELAS, KelasSMK } from '../data/classList';
import { UserRole, OrgMember, UserAccount } from '../types/erp';

export interface ParsedMemberRow {
  id: string;
  nama: string;
  nisn: string;
  kelas: KelasSMK;
  jabatan: string;
  telepon: string;
  jenisKelamin: 'L' | 'P';
  kategori: 'bph' | 'sekbid' | 'anggota_sekbid';
  peranSekbid?: 'koordinator' | 'anggota';
  sekbidNomor?: number;
  sekbidNama?: string;
  role: UserRole;
  suggestedUsername: string;
  suggestedPassword: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Normalisasi cerdas input nama kelas agar sesuai 7 kelas resmi SMK Tridharma:
 * - X Askep 1
 * - X Askep 2
 * - X Farmasi
 * - XI Askep
 * - XI Farmasi
 * - XII Askep
 * - XII Farmasi
 */
export const normalizeClass = (raw: string): KelasSMK => {
  const clean = raw.trim().toUpperCase().replace(/KEPERAWATAN/g, 'ASKEP');

  // Exact match
  const exact = DAFTAR_KELAS.find((k) => k.toUpperCase() === clean);
  if (exact) return exact;

  // Patterns for Class X
  if (clean.includes('X ') || clean.startsWith('10 ') || clean.startsWith('X-')) {
    if (clean.includes('FARM')) return 'X Farmasi';
    if (clean.includes('2') || clean.includes(' B')) return 'X Askep 2';
    return 'X Askep 1';
  }

  // Patterns for Class XI
  if (clean.includes('XI ') || clean.startsWith('11 ') || clean.startsWith('XI-')) {
    if (clean.includes('FARM')) return 'XI Farmasi';
    return 'XI Askep';
  }

  // Patterns for Class XII
  if (clean.includes('XII ') || clean.startsWith('12 ') || clean.startsWith('XII-')) {
    if (clean.includes('FARM')) return 'XII Farmasi';
    return 'XII Askep';
  }

  // Default fallback
  return 'XI Askep';
};

/**
 * Deteksi Jabatan & Sekbid
 */
export const detectJabatanDetails = (jabatanRaw: string) => {
  const lower = jabatanRaw.toLowerCase();

  let role: UserRole = 'anggota';
  let kategori: 'bph' | 'sekbid' | 'anggota_sekbid' = 'anggota_sekbid';
  let peranSekbid: 'koordinator' | 'anggota' = 'anggota';
  let sekbidNomor: number | undefined = undefined;

  // Check BPH
  if (lower.includes('ketua') && !lower.includes('wakil')) {
    role = 'ketua';
    kategori = 'bph';
  } else if (lower.includes('wakil')) {
    role = 'wakil';
    kategori = 'bph';
  } else if (lower.includes('sekretaris')) {
    role = 'sekretaris';
    kategori = 'bph';
  } else if (lower.includes('bendahara')) {
    role = 'bendahara';
    kategori = 'bph';
  } else {
    // Check Sekbid 1-8
    const numMatch = lower.match(/(?:sekbid|seksi bidang)\s*#?([1-8])/);
    if (numMatch && numMatch[1]) {
      sekbidNomor = parseInt(numMatch[1], 10);
    }

    if (lower.includes('koordinator') || lower.includes('ketua sekbid')) {
      peranSekbid = 'koordinator';
      kategori = 'sekbid';
      role = 'sekbid';
    } else {
      peranSekbid = 'anggota';
      kategori = 'anggota_sekbid';
      role = 'anggota';
    }
  }

  return { role, kategori, peranSekbid, sekbidNomor };
};

/**
 * Buat Username & Password unik
 */
export const generateBulkCredentials = (name: string, existingUsernames: string[] = []) => {
  const parts = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
  let base = 'pengurus';
  if (parts.length === 1 && parts[0]) {
    base = parts[0];
  } else if (parts.length >= 2) {
    base = `${parts[0]}.${parts[1]}`;
  }

  let finalUser = base;
  let counter = 1;
  while (existingUsernames.includes(finalUser.toLowerCase())) {
    finalUser = `${base}${counter}`;
    counter++;
  }

  const rand = Math.floor(100 + Math.random() * 900);
  const finalPass = `tri${rand}`;

  return { username: finalUser, password: finalPass };
};

/**
 * Parser Teks Tabel (hasil copy-paste dari Microsoft Word, Excel, Google Docs, atau TSV/CSV)
 */
export const parsePastedTableData = (
  rawText: string,
  existingUsernames: string[] = []
): ParsedMemberRow[] => {
  if (!rawText.trim()) return [];

  // Split lines
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const rows: ParsedMemberRow[] = [];
  const usedUsernames = [...existingUsernames];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Lewati baris header jika mengandung kata kunci header tabel
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes('nama lengkap') ||
      lowerLine.includes('nis / nisn') ||
      lowerLine.includes('jabatan / sekbid') ||
      lowerLine.includes('formulir rekapitulasi') ||
      lowerLine.includes('petunjuk pengisian')
    ) {
      continue;
    }

    // Pisahkan berdasarkan tab (\t), koma (,), titik koma (;), atau pemisah vertikal (|)
    let cells: string[] = [];
    if (line.includes('\t')) {
      cells = line.split('\t').map((c) => c.trim());
    } else if (line.includes('|')) {
      cells = line.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
    } else if (line.includes(';')) {
      cells = line.split(';').map((c) => c.trim());
    } else if (line.includes(',')) {
      cells = line.split(',').map((c) => c.trim());
    } else {
      // Baris tunggal tanpa pemisah kolom, abaikan atau jadikan baris nama
      cells = [line];
    }

    // Hapus cell nomor urut jika cell pertama hanya angka (contoh: "1", "2")
    if (cells.length > 1 && /^\d+$/.test(cells[0])) {
      cells.shift();
    }

    // Minimal harus ada nama
    const rawNama = cells[0] || '';
    if (!rawNama || rawNama.length < 2) continue;

    // Bersihkan nama dari tanda petik atau bold html tag
    const nama = rawNama.replace(/<[^>]*>?/gm, '').replace(/["']/g, '').trim();

    // Kolom 2: NISN / NIS (biasanya angka)
    let nisn = cells[1] || '';
    let kelasRaw = cells[2] || '';
    let jabatanRaw = cells[3] || 'Anggota Pengurus OSIS';
    let teleponRaw = cells[4] || '-';
    let jkRaw = (cells[5] || 'L').toUpperCase();

    // Jika kolom 1 ternyata adalah kelas, geser
    if (DAFTAR_KELAS.some((k) => k.toLowerCase() === nisn.toLowerCase())) {
      kelasRaw = nisn;
      nisn = '007' + Math.floor(1000000 + Math.random() * 9000000);
    }

    // Normalisasi NISN
    if (!nisn || !/^\d{8,12}$/.test(nisn.replace(/\D/g, ''))) {
      nisn = '007' + Math.floor(1000000 + Math.random() * 9000000);
    }

    const kelas = normalizeClass(kelasRaw);
    const { role, kategori, peranSekbid, sekbidNomor } = detectJabatanDetails(jabatanRaw);

    const { username, password } = generateBulkCredentials(nama, usedUsernames);
    usedUsernames.push(username.toLowerCase());

    const errors: string[] = [];
    if (!nama.trim()) errors.push('Nama tidak boleh kosong');

    rows.push({
      id: `bulk-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      nama,
      nisn,
      kelas,
      jabatan: jabatanRaw || 'Anggota OSIS',
      telepon: teleponRaw || '-',
      jenisKelamin: jkRaw.includes('P') ? 'P' : 'L',
      kategori,
      peranSekbid,
      sekbidNomor,
      role,
      suggestedUsername: username,
      suggestedPassword: password,
      isValid: errors.length === 0,
      errors,
    });
  }

  return rows;
};
