/**
 * Daftar Resmi Kelas & Program Keahlian SMK Tridharma Gorontalo
 * Terdiri dari 7 kelas:
 * - X Askep 1 (Asuhan Keperawatan)
 * - X Askep 2 (Asuhan Keperawatan)
 * - X Farmasi
 * - XI Askep (Asuhan Keperawatan)
 * - XI Farmasi
 * - XII Askep (Asuhan Keperawatan)
 * - XII Farmasi
 */

export const DAFTAR_KELAS = [
  'X Askep 1',
  'X Askep 2',
  'X Farmasi',
  'XI Askep',
  'XI Farmasi',
  'XII Askep',
  'XII Farmasi',
] as const;

export type KelasSMK = typeof DAFTAR_KELAS[number];

export const DAFTAR_JURUSAN = [
  { kode: 'Askep', nama: 'Asuhan Keperawatan', deskripsi: 'Layanan Keperawatan Kesehatan Vokasi' },
  { kode: 'Farmasi', nama: 'Farmasi Klinis & Komunitas', deskripsi: 'Kefarmasian & Laboratorium Medis' },
] as const;
