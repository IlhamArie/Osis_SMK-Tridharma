export type UserRole = 
  | 'pembina' 
  | 'ketua' 
  | 'wakil' 
  | 'sekretaris' 
  | 'bendahara' 
  | 'sekbid' 
  | 'anggota';

export interface UserAccount {
  id: string;
  username: string;
  password?: string; // stored for demo verification
  fullName: string;
  nisn: string;
  role: UserRole;
  jabatan: string;
  sekbidId?: string;
  kelas: string;
  telepon: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface OrgMember {
  id: string;
  nama: string;
  jabatan: string;
  kategori: 'pembina' | 'bph' | 'sekbid' | 'anggota_sekbid';
  peranSekbid?: 'koordinator' | 'anggota';
  sekbidNomor?: number;
  sekbidNama?: string;
  kelas: string;
  fotoUrl?: string;
  urutan: number;
  kontak: string;
  visiSingkat?: string;
}

export interface SekbidDefinition {
  nomor: number;
  nama: string;
  singkatan: string;
  deskripsi: string;
}

export const OSIS_SEKBID_LIST: SekbidDefinition[] = [
  { 
    nomor: 1, 
    nama: 'Ketaqwaan terhadap Tuhan Yang Maha Esa', 
    singkatan: 'Keimanan & Ketaqwaan', 
    deskripsi: 'Pembinaan rohani, kajian keagamaan, peringatan hari besar keagamaan dan toleransi beribadah di sekolah.' 
  },
  { 
    nomor: 2, 
    nama: 'Budi Pekerti Luhur & Akhlak Mulia', 
    singkatan: 'Budi Pekerti & Karakter', 
    deskripsi: 'Penerapan budaya 5S (Senyum, Sapa, Salam, Sopan, Santun), ketertiban siswa, dan pembinaan karakter vokasi.' 
  },
  { 
    nomor: 3, 
    nama: 'Kepribadian Unggul, Wawasan Kebangsaan & Bela Negara', 
    singkatan: 'Bela Negara & Kedisiplinan', 
    deskripsi: 'Pelaksanaan upacara bendera, baris-berbaris (Paskibra), LDKS, dan kedisiplinan apel pagi.' 
  },
  { 
    nomor: 4, 
    nama: 'Prestasi Akademik, Seni, Budaya & Olahraga', 
    singkatan: 'Seni, Budaya & Olahraga', 
    deskripsi: 'Pengembangan minat bakat seni musik daerah, tari, turnamen olahraga classmeeting, dan olimpiade kejuruan.' 
  },
  { 
    nomor: 5, 
    nama: 'Demokrasi, Hak Asasi Manusia, Pendidikan Politik & Lingkungan', 
    singkatan: 'Demokrasi, HAM & Lingkungan', 
    deskripsi: 'Musyawarah perwakilan kelas (MPK), pemilihan ketua OSIS (Pilketos), dan aksi lingkungan hidup Adiwiyata.' 
  },
  { 
    nomor: 6, 
    nama: 'Keterampilan Vokasi, Kreativitas & Kewirausahaan Mandiri', 
    singkatan: 'Kewirausahaan & Vokasi', 
    deskripsi: 'Teaching Factory, pameran produk inovasi siswa, bazar kewirausahaan dan jiwa technopreneur muda.' 
  },
  { 
    nomor: 7, 
    nama: 'Kualitas Jasmani, Kesehatan, Gizi & Sanitasi Sekolah', 
    singkatan: 'Kesehatan & UKS', 
    deskripsi: 'Palang Merah Remaja (PMR), layanan UKS, senam kesegaran jasmani, dan sanitasi lingkungan kantin sehat.' 
  },
  { 
    nomor: 8, 
    nama: 'Teknologi Informasi, Komunikasi & Publikasi Digital (TIK)', 
    singkatan: 'TIK & Multimedia', 
    deskripsi: 'Pengelolaan portal digital OSIS, publikasi media sosial, dokumentasi multimedia dan digital signage sekolah.' 
  },
];

export type ProkerStatus = 'Perencanaan' | 'Berjalan' | 'Evaluasi' | 'Selesai';

export interface ProkerUpdateLog {
  id: string;
  prokerId: string;
  tanggal: string;
  waktu: string;
  updatedBy: string;
  jabatan: string;
  progressSebelumnya: number;
  progressBaru: number;
  status: ProkerStatus;
  catatan: string;
  fotoDokumentasiUrl?: string;
  realisasiAnggaranBaru?: number;
}

export interface ProgramKerja {
  id: string;
  kode: string;
  namaProker: string;
  sekbid: string;
  penanggungJawab: string;
  targetBulan: string;
  anggaranRAB: number;
  realisasiAnggaran: number;
  progress: number; // 0 - 100
  status: ProkerStatus;
  deskripsi: string;
  tujuan: string;
  indikatorKeberhasilan: string;
  catatanTerbaru?: string;
  posterUrl?: string;
  riwayatUpdate?: ProkerUpdateLog[];
  updatedAt: string;
}

export interface SchoolGeoConfig {
  namaLokasi: string;
  alamat: string;
  latitude: number;
  longitude: number;
  radiusToleransiMeter: number;
  deskripsi: string;
  updatedBy: string;
  updatedAt: string;
}

export interface PresensiRecord {
  id: string;
  userId: string;
  namaPengurus: string;
  jabatan: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm:ss WITA
  jenis: 'Kehadiran Sekolah & Piket' | 'Kehadiran Sekolah Reguler' | 'Piket Harian' | 'Apel Pagi / Upacara' | 'Rapat Rutin' | 'Kepanitiaan';
  latitude: number;
  longitude: number;
  jarakMeter: number;
  status: 'Hadir Valid (Tepat Waktu)' | 'Hadir Valid (Terlambat)' | 'Hadir Valid (Dalam Radius)' | 'Di Luar Radius' | 'Izin' | 'Sakit';
  keterangan: string;
  akurasiMeter: number;
  isTerlambat?: boolean;
  menitKeterlambatan?: number;
  waktuBatas?: string; // "07:15 WITA"
  alasanKeterlambatan?: string;
  isValidatedByPembina?: boolean;
  statusValidasiPembina?: 'Menunggu Validasi' | 'Disetujui Sah' | 'Diberi Teguran' | 'Ditolak / Anulir';
  validatedBy?: string;
  validatedAt?: string;
  catatanPembina?: string;
  kategoriPengurus?: 'bph' | 'sekbid' | 'anggota';
  metodeVerifikasi?: 'Scan QR Pembina' | 'Geofencing GPS' | 'Manual';
  qrToken?: string;
}

export interface AgendaHarianSekretaris {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  temaHari: string;
  instruksiSekretaris: string;
  koordinatorPiket: string;
  petugasPiket: string[];
  agendaKegiatan: {
    waktu: string;
    kegiatan: string;
    lokasi: string;
    penanggungJawab: string;
  }[];
  catatanKhusus?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SuratDokumen {
  id: string;
  nomorSurat: string;
  jenisSurat: 'Undangan Kegiatan' | 'Permohonan Dispensasi' | 'Peminjaman Sarpras' | 'Pemberitahuan Proker';
  perihal: string;
  tujuan: string;
  tanggalSurat: string;
  namaAcara: string;
  tanggalPelaksanaan: string;
  waktuPelaksanaan: string;
  tempatPelaksanaan: string;
  penandatangan1: string; // Ketua OSIS
  penandatangan2: string; // Sekretaris
  mengetahui: string; // Pembina OSIS
  status: 'Draft' | 'Disetujui Pembina' | 'Terbit';
  fileDocxName?: string;
  createdAt: string;
}

export interface RapatItem {
  id: string;
  nomorRapat: string;
  judulRapat: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  tempat: string;
  pimpinanRapat: string;
  notulis: string;
  agenda: string;
  status: 'Terjadwal' | 'Sedang Berlangsung' | 'Selesai';
  kehadiran: {
    userId: string;
    nama: string;
    jabatan: string;
    hadir: boolean;
    waktuHadir?: string;
    keterangan?: string;
  }[];
  notulensi: {
    pembahasan: string;
    kesimpulan: string;
    tindakLanjut: string;
    lampiran?: string;
  };
}

export interface TransaksiKas {
  id: string;
  kodeTransaksi: string;
  tanggal: string;
  jenis: 'Pemasukan' | 'Pengeluaran';
  kategori: 'Kas Anggota' | 'BOS Kesiswaan' | 'Sponsor/Donasi' | 'ATK & Kesekretariatan' | 'Konsumsi Rapat' | 'Sarana & Perlengkapan' | 'Biaya Kegiatan Proker';
  nominal: number;
  keterangan: string;
  penanggungJawab: string;
  nomorBukti: string;
  lampiranNotaUrl?: string;
  prokerTerkait?: string;
}

export interface InventarisBarang {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: 'Elektronik' | 'Perlengkapan Acara' | 'Atribut Organisasi' | 'ATK & Arsip';
  jumlahTotal: number;
  jumlahTersedia: number;
  kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak Ringan';
  lokasiPenyimpanan: string;
  status: 'Tersedia' | 'Dipinjam Sebagian' | 'Kosong/Dipinjam Semua';
  riwayatPeminjaman: {
    id: string;
    peminjam: string;
    kelasSekbid: string;
    jumlah: number;
    tanggalPinjam: string;
    estimasiKembali: string;
    status: 'Dipinjam' | 'Dikembalikan';
    catatan: string;
  }[];
}

export interface JadwalPiketItem {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  koordinator: string;
  anggotaPiket: string[];
  tugasUtama: string[];
}

export interface AspirasiSiswa {
  id: string;
  tiketKode: string;
  tanggal: string;
  kategori: 'Sarana & Prasarana' | 'Kegiatan Siswa' | 'Ekstrakurikuler' | 'Kebersihan & Ketertiban' | 'Aspirasi Akademik';
  judul: string;
  pesan: string;
  namaPengirim: string; // 'Anonim' if anonymous
  kelasPengirim: string;
  isAnonim: boolean;
  status: 'Masuk' | 'Ditinjau' | 'Ditindaklanjuti' | 'Selesai';
  tanggapanPengurus?: string;
  tanggalTanggapan?: string;
}

export interface GaleriKegiatan {
  id: string;
  judul: string;
  kategori: 'LDKS' | 'Bakti Sosial' | 'Classmeeting' | 'Peringatan Hari Besar' | 'Bazar Vokasi' | 'Apel & Upacara' | 'Prestasi Siswa';
  tanggal: string;
  deskripsi: string;
  jumlahFoto: number;
  lokasi: string;
  imageUrl: string;
  fotoUrls?: string[];
  fotografer?: string;
  featured?: boolean;
}

export interface HeroBanner {
  id: string;
  judul: string;
  subjudul: string;
  imageUrl: string;
  badgeText: string;
  linkText?: string;
  linkHref?: string;
  isActive: boolean;
  urutan: number;
}

export interface SystemModulesConfig {
  modulPresensi: boolean;
  modulSurat: boolean;
  modulRapat: boolean;
  modulKeuangan: boolean;
  modulInventaris: boolean;
  modulPiket: boolean;
  modulAspirasiPublik: boolean;
  modulGaleriPublik: boolean;
}

export interface SchoolIdentityConfig {
  logoUrl: string;
  namaSekolah: string;
  singkatan: string;
  npsn: string;
  motto: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  kopSuratBaris1: string;
  kopSuratBaris2: string;
  updatedAt?: string;
  updatedBy?: string;
}
