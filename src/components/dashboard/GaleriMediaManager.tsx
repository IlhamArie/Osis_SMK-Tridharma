import React, { useState } from 'react';
import { GaleriKegiatan, HeroBanner, UserAccount } from '../../types/erp';
import { VOCATIONAL_IMAGE_PRESETS, ImagePreset } from '../../data/imagePresets';
import { 
  Camera, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Sparkles, 
  Eye, 
  ExternalLink, 
  CheckCircle, 
  Sliders, 
  SlidersHorizontal,
  Layers,
  MapPin,
  Calendar,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface GaleriMediaManagerProps {
  currentUser: UserAccount;
  galeriList: GaleriKegiatan[];
  heroBanners: HeroBanner[];
  onAddGaleri: (item: Omit<GaleriKegiatan, 'id'>) => void;
  onUpdateGaleri: (item: GaleriKegiatan) => void;
  onDeleteGaleri: (id: string) => void;
  onAddHeroBanner: (banner: Omit<HeroBanner, 'id'>) => void;
  onUpdateHeroBanner: (banner: HeroBanner) => void;
  onDeleteHeroBanner: (id: string) => void;
  onViewPublicPortal: () => void;
}

export const GaleriMediaManager: React.FC<GaleriMediaManagerProps> = ({
  currentUser,
  galeriList,
  heroBanners,
  onAddGaleri,
  onUpdateGaleri,
  onDeleteGaleri,
  onAddHeroBanner,
  onUpdateHeroBanner,
  onDeleteHeroBanner,
  onViewPublicPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'galeri' | 'banner' | 'presets'>('galeri');
  const [showAddGaleriModal, setShowAddGaleriModal] = useState(false);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);

  // Form State Galeri
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<GaleriKegiatan['kategori']>('Classmeeting');
  const [tanggal, setTanggal] = useState('Oktober 2026');
  const [lokasi, setLokasi] = useState('Kampus SMK Tridharma Gorontalo');
  const [deskripsi, setDeskripsi] = useState('');
  const [imageUrl, setImageUrl] = useState(VOCATIONAL_IMAGE_PRESETS[0].url);
  const [fotografer, setFotografer] = useState('Sekbid 8 TIK & Humas');
  const [featured, setFeatured] = useState(true);

  // Form State Banner
  const [bannerJudul, setBannerJudul] = useState('');
  const [bannerSubjudul, setBannerSubjudul] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState(VOCATIONAL_IMAGE_PRESETS[0].url);
  const [bannerBadge, setBannerBadge] = useState('KAMPUS SMK TRIDHARMA');
  const [bannerLinkText, setBannerLinkText] = useState('Lihat Rincian');
  const [bannerLinkHref, setBannerLinkHref] = useState('#proker');

  // Handle local computer image upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'galeri' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (target === 'galeri') {
            setImageUrl(reader.result);
          } else {
            setBannerImageUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGaleri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !imageUrl.trim()) return;

    onAddGaleri({
      judul: judul.trim(),
      kategori,
      tanggal: tanggal.trim(),
      lokasi: lokasi.trim(),
      deskripsi: deskripsi.trim(),
      jumlahFoto: Math.floor(12 + Math.random() * 20),
      imageUrl: imageUrl.trim(),
      fotografer: fotografer.trim(),
      featured,
      fotoUrls: [imageUrl.trim()],
    });

    setShowAddGaleriModal(false);
    setJudul('');
    setDeskripsi('');
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerJudul.trim() || !bannerImageUrl.trim()) return;

    onAddHeroBanner({
      judul: bannerJudul.trim(),
      subjudul: bannerSubjudul.trim(),
      imageUrl: bannerImageUrl.trim(),
      badgeText: bannerBadge.trim(),
      linkText: bannerLinkText.trim(),
      linkHref: bannerLinkHref.trim(),
      isActive: true,
      urutan: heroBanners.length + 1,
    });

    setShowAddBannerModal(false);
    setBannerJudul('');
    setBannerSubjudul('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-700/40 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono mb-1">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>MEDIA & VISUAL ASSETS MANAGER · PORTAL ADMIN</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Pengelola Gambar & Lensa Kegiatan Publik</h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              Tambahkan foto dokumentasi kegiatan, poster proker, dan banner hero langsung melalui portal Admin untuk menghidupkan laman publik SMK Tridharma Gorontalo secara dinamis.
            </p>
          </div>

          <button
            onClick={onViewPublicPortal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
          >
            <span>Lihat Laman Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('galeri')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'galeri'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Foto Lensa Kegiatan ({galeriList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('banner')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'banner'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Hero Banner & Spotlight ({heroBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'presets'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Pustaka Foto Vokasi Siap Pakai</span>
        </button>
      </div>

      {/* TAB 1: GALERI KEGIATAN */}
      {activeTab === 'galeri' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dokumentasi Lensa Kegiatan Aktif</h3>
              <p className="text-xs text-slate-500">
                Setiap foto yang ditambahkan di sini otomatis tampil pada galeri interaktif Lensa Kegiatan di Laman Publik.
              </p>
            </div>

            <button
              onClick={() => setShowAddGaleriModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Unggah Dokumentasi Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {galeriList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-900 overflow-hidden group">
                    <img
                      src={item.imageUrl}
                      alt={item.judul}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback styling
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur text-white border border-white/20">
                        {item.kategori}
                      </span>
                    </div>

                    {item.featured && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                          ★ Featured
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.tanggal}</span>
                      <span>·</span>
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[150px]">{item.lokasi}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.judul}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Foto: <strong>{item.jumlahFoto} Berkas</strong>
                  </span>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus dokumentasi "${item.judul}"?`)) {
                        onDeleteGaleri(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus Foto Kegiatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HERO BANNER & SPOTLIGHT */}
      {activeTab === 'banner' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hero Highlight Banners</h3>
              <p className="text-xs text-slate-500">
                Banner visual utama yang tampil di bagian atas Laman Publik sebagai etalase prestisius OSIS SMK Tridharma.
              </p>
            </div>

            <button
              onClick={() => setShowAddBannerModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Banner Spotlight</span>
            </button>
          </div>

          <div className="space-y-4">
            {heroBanners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-36 h-20 rounded-lg bg-slate-900 overflow-hidden shrink-0 relative">
                    <img
                      src={banner.imageUrl}
                      alt={banner.judul}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {banner.badgeText}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{banner.judul}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{banner.subjudul}</p>
                    {banner.linkHref && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Tautan CTA: {banner.linkHref} ({banner.linkText || 'Lihat'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      onUpdateHeroBanner({
                        ...banner,
                        isActive: !banner.isActive,
                      })
                    }
                    className="p-1 text-slate-600 hover:text-indigo-600"
                    title={banner.isActive ? 'Nonaktifkan Banner' : 'Aktifkan Banner'}
                  >
                    {banner.isActive ? (
                      <ToggleRight className="w-8 h-8 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus banner "${banner.judul}"?`)) {
                        onDeleteHeroBanner(banner.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pustaka Foto Vokasi Siap Pakai</h3>
            <p className="text-xs text-slate-500">
              Koleksi foto bertema pendidikan kejuruan, kepemimpinan siswa, olahraga, dan sosial yang telah terkurasi. Anda dapat langsung menggunakannya sebagai foto dokumentasi atau banner hanya dengan 1 klik!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VOCATIONAL_IMAGE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-slate-900 overflow-hidden">
                    <img
                      src={preset.url}
                      alt={preset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {preset.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{preset.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{preset.description}</p>
                  </div>
                </div>

                <div className="p-3 pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => {
                      setImageUrl(preset.url);
                      setJudul(preset.title);
                      setDeskripsi(preset.description);
                      setShowAddGaleriModal(true);
                    }}
                    className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Pakai di Lensa Kegiatan
                  </button>
                  <button
                    onClick={() => {
                      setBannerImageUrl(preset.url);
                      setBannerJudul(preset.title);
                      setBannerSubjudul(preset.description);
                      setShowAddBannerModal(true);
                    }}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Pakai di Banner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Galeri */}
      {showAddGaleriModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Unggah Dokumentasi Foto Kegiatan</span>
              </h3>
              <button
                onClick={() => setShowAddGaleriModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGaleri} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Judul Kegiatan / Peristiwa</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Pembukaan Turnamen Futsal Classmeeting 2026..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Classmeeting">Classmeeting Vokasi</option>
                    <option value="LDKS">LDKS Kepemimpinan</option>
                    <option value="Bakti Sosial">Bakti Sosial & Peduli</option>
                    <option value="Bazar Vokasi">Bazar & Expo Vokasi</option>
                    <option value="Apel & Upacara">Apel & Upacara Bendera</option>
                    <option value="Prestasi Siswa">Prestasi Siswa / TIK</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="text"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    placeholder="Contoh: 12 Oktober 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Image Input (File or URL or Preview) */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800">Pilih Berkas Foto / Gambar:</label>
                <div className="flex gap-2">
                  <label className="cursor-pointer px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Pilih dari Komputer/HP</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e, 'galeri')}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mt-1 mb-0.5">Atau gunakan URL Foto langsung:</label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Preview Box */}
                {imageUrl && (
                  <div className="h-32 rounded-lg bg-slate-900 overflow-hidden relative border border-slate-300">
                    <img
                      src={imageUrl}
                      alt="Pratinjau"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 backdrop-blur text-white px-2 py-0.5 rounded font-mono">
                      Pratinjau Gambar
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    required
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    placeholder="Lapangan SMK Tridharma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fotografer / Sekbid</label>
                  <input
                    type="text"
                    value={fotografer}
                    onChange={(e) => setFotografer(e.target.value)}
                    placeholder="Sekbid 8 TIK"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Deskripsi & Catatan Kegiatan</label>
                <textarea
                  rows={3}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Uraikan rangkaian acara, antusiasme peserta, dan tujuan kegiatan..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGaleriModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Terbitkan ke Laman Publik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Hero Banner */}
      {showAddBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Tambah Hero Banner Spotlight Publik</span>
              </h3>
              <button
                onClick={() => setShowAddBannerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Judul Utama Banner</label>
                <input
                  type="text"
                  required
                  value={bannerJudul}
                  onChange={(e) => setBannerJudul(e.target.value)}
                  placeholder="Contoh: Semarak Porseni & Expo Teaching Factory 2026..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Subjudul / Deskripsi Pendek</label>
                <input
                  type="text"
                  required
                  value={bannerSubjudul}
                  onChange={(e) => setBannerSubjudul(e.target.value)}
                  placeholder="Ringkasan 1-2 baris kalimat penyemangat..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Badge Kategori</label>
                  <input
                    type="text"
                    required
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    placeholder="PROGRAM UNGGULAN"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 uppercase font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tautan Tombol CTA</label>
                  <input
                    type="text"
                    value={bannerLinkHref}
                    onChange={(e) => setBannerLinkHref(e.target.value)}
                    placeholder="#proker atau #lensa"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Banner Image Upload / URL */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800">Berkas Gambar Banner (Aspek 16:9):</label>
                <div className="flex gap-2">
                  <label className="cursor-pointer px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Pilih Berkas dari Komputer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e, 'banner')}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mt-1 mb-0.5">Atau tautan URL Gambar:</label>
                  <input
                    type="text"
                    required
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                {bannerImageUrl && (
                  <div className="h-32 rounded-lg bg-slate-900 overflow-hidden relative border border-slate-300">
                    <img
                      src={bannerImageUrl}
                      alt="Banner Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBannerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Aktifkan Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
