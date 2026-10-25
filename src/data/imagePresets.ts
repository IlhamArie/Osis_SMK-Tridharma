export interface ImagePreset {
  id: string;
  title: string;
  category: 'kegiatan' | 'pengurus' | 'banner' | 'proker';
  url: string;
  description: string;
}

export const VOCATIONAL_IMAGE_PRESETS: ImagePreset[] = [
  // Banners & Highlights
  {
    id: 'ban-01',
    title: 'Gedung Kampus & Lapangan SMK Tridharma',
    category: 'banner',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    description: 'Halaman utama dan gedung kampus SMK Tridharma Gorontalo saat pagi cerah',
  },
  {
    id: 'ban-02',
    title: 'Pelantikan & Rapat Kerja OSIS Terpadu',
    category: 'banner',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    description: 'Barisan pengurus OSIS dalam seremonial pelantikan resmi',
  },
  {
    id: 'ban-03',
    title: 'Classmeeting Kejuruan & Turnamen Olahraga',
    category: 'banner',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    description: 'Semarak kompetisi olahraga futsal dan basket antarkelas',
  },
  {
    id: 'ban-04',
    title: 'Teaching Factory & Inovasi Kejuruan Vokasi',
    category: 'banner',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description: 'Pameran karya kejuruan teknik dan rekayasa perangkat lunak siswa',
  },

  // Kegiatan / Dokumentasi
  {
    id: 'keg-01',
    title: 'Latihan Dasar Kepemimpinan Siswa (LDKS) Alam Terbuka',
    category: 'kegiatan',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    description: 'Dinamika kelompok dan pembekalan karakter disiplin calon pengurus OSIS',
  },
  {
    id: 'keg-02',
    title: 'Aksi Peduli Sosial & Safari Ramadan Tridharma',
    category: 'kegiatan',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    description: 'Penyaluran sembako dan santunan sosial untuk warga sekitar Gorontalo',
  },
  {
    id: 'keg-03',
    title: 'Turnamen Futsal & E-Sports Antarkelas',
    category: 'kegiatan',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    description: 'Pertandingan final classmeeting dengan sorak antusias penonton',
  },
  {
    id: 'keg-04',
    title: 'Bazar Kewirausahaan Kreatif Siswa Vokasi',
    category: 'kegiatan',
    url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80',
    description: 'Stand produk inovasi teaching factory kuliner dan jasa teknologi siswa',
  },
  {
    id: 'keg-05',
    title: 'Apel Bendera Hari Senin & Penegakan Kedisiplinan',
    category: 'kegiatan',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    description: 'Upacara bendera khidmat dipimpin pengurus OSIS di lapangan upacara',
  },
  {
    id: 'keg-06',
    title: 'Workshop Coding & Kecerdasan Buatan Sekbid TIK',
    category: 'kegiatan',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    description: 'Pelatihan teknis praktikum rekayasa perangkat lunak dan literasi AI',
  },

  // Pengurus & Pembina
  {
    id: 'peng-01',
    title: 'Potret Pembina OSIS (Ilham Arief, S.Pd.)',
    category: 'pengurus',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80',
    description: 'Potret resmi Pembina OSIS SMK Tridharma Gorontalo',
  },
  {
    id: 'peng-02',
    title: 'Potret Ketua Umum OSIS (Fachri Ramadhan)',
    category: 'pengurus',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80',
    description: 'Potret Ketua Umum OSIS SMK Tridharma',
  },
  {
    id: 'peng-03',
    title: 'Potret Wakil Ketua OSIS (Raihan Suleman)',
    category: 'pengurus',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    description: 'Potret Wakil Ketua OSIS',
  },
  {
    id: 'peng-04',
    title: 'Potret Sekretaris Umum (Aisyah Putri Djafar)',
    category: 'pengurus',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    description: 'Potret Sekretaris Umum OSIS',
  },
  {
    id: 'peng-05',
    title: 'Potret Bendahara Umum (Nabil Mohamad Gobel)',
    category: 'pengurus',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    description: 'Potret Bendahara Umum OSIS',
  },
  {
    id: 'peng-06',
    title: 'Potret Koordinator Sekbid Vokasi (Cindy Clarissa)',
    category: 'pengurus',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
    description: 'Potret Koordinator Sekbid',
  },

  // Proker Posters
  {
    id: 'prk-img-01',
    title: 'Poster LDKS Kepemimpinan Vokasi',
    category: 'proker',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80',
    description: 'Poster resmi LDKS Kepemimpinan Siswa',
  },
  {
    id: 'prk-img-02',
    title: 'Poster Safari Ramadan Berbagi',
    category: 'proker',
    url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=700&q=80',
    description: 'Poster bakti sosial dan sembako ramadan',
  },
  {
    id: 'prk-img-03',
    title: 'Poster Turnamen Classmeeting Vokasi',
    category: 'proker',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=700&q=80',
    description: 'Poster turnamen olahraga dan games antarkelas',
  },
  {
    id: 'prk-img-04',
    title: 'Poster Workshop AI & Literasi TIK',
    category: 'proker',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80',
    description: 'Poster workshop kecerdasan buatan',
  },
  {
    id: 'prk-img-05',
    title: 'Poster Festival Sulaman Karawo Gorontalo',
    category: 'proker',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
    description: 'Poster festival kearifan budaya daerah',
  },
];
