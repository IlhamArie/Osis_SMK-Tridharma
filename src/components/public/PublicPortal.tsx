import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ProgramKerja, 
  OrgMember, 
  GaleriKegiatan, 
  HeroBanner,
  AspirasiSiswa,
  SchoolIdentityConfig,
  OSIS_SEKBID_LIST,
  SekbidDefinition
} from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { DAFTAR_KELAS } from '../../data/classList';
import { 
  Send, 
  CheckCircle, 
  Search, 
  Eye, 
  ShieldCheck, 
  Users, 
  Calendar, 
  ArrowRight, 
  MessageSquare, 
  Camera, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Lock, 
  BookOpen, 
  Compass, 
  Award,
  Layers,
  HeartHandshake,
  MapPin,
  ExternalLink,
  User,
  ZoomIn,
  Menu,
  X,
  Crown,
  GraduationCap
} from 'lucide-react';

interface PublicPortalProps {
  prokerList: ProgramKerja[];
  orgMembers: OrgMember[];
  sekbidList?: SekbidDefinition[];
  galeriList: GaleriKegiatan[];
  heroBanners: HeroBanner[];
  aspirasiList: AspirasiSiswa[];
  schoolIdentity?: SchoolIdentityConfig;
  onAddAspirasi: (aspirasi: Omit<AspirasiSiswa, 'id' | 'tiketKode' | 'tanggal' | 'status'>) => string;
  onOpenLogin: () => void;
  onOpenBlueprint?: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  prokerList,
  orgMembers,
  sekbidList,
  galeriList,
  heroBanners,
  aspirasiList,
  schoolIdentity,
  onAddAspirasi,
  onOpenLogin,
  onOpenBlueprint,
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;
  const currentSekbids = sekbidList && sekbidList.length > 0 ? sekbidList : OSIS_SEKBID_LIST;

  // Banner slide state
  const activeBanners = heroBanners.filter(b => b.isActive).length > 0 
    ? heroBanners.filter(b => b.isActive) 
    : heroBanners;
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-advance banner every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // Proker filter state
  const [selectedSekbid, setSelectedSekbid] = useState<string>('Semua');

  // Galeri filter state
  const [selectedGaleriCat, setSelectedGaleriCat] = useState<string>('Semua');

  // Aspirasi form state
  const [namaPengirim, setNamaPengirim] = useState('');
  const [kelasPengirim, setKelasPengirim] = useState<string>('X Askep 1');
  const [isAnonim, setIsAnonim] = useState(false);
  const [kategoriAspirasi, setKategoriAspirasi] = useState<AspirasiSiswa['kategori']>('Sarana & Prasarana');
  const [judulAspirasi, setJudulAspirasi] = useState('');
  const [pesanAspirasi, setPesanAspirasi] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Aspirasi tracking state
  const [searchTicketCode, setSearchTicketCode] = useState('');
  const [searchedAspirasi, setSearchedAspirasi] = useState<AspirasiSiswa | null | undefined>(undefined);

  // Lightbox / Galeri modal state
  const [selectedGaleri, setSelectedGaleri] = useState<GaleriKegiatan | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [publicSekbidFilter, setPublicSekbidFilter] = useState<number | 'semua'>('semua');

  // Handle Aspirasi Submit
  const handleSubmitAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulAspirasi.trim() || !pesanAspirasi.trim()) return;

    const generatedCode = onAddAspirasi({
      kategori: kategoriAspirasi,
      judul: judulAspirasi,
      pesan: pesanAspirasi,
      namaPengirim: isAnonim ? 'Anonim' : (namaPengirim.trim() || 'Siswa SMK Tridharma'),
      kelasPengirim: kelasPengirim,
      isAnonim: isAnonim,
    });

    setSubmittedTicket(generatedCode);
    setJudulAspirasi('');
    setPesanAspirasi('');
    setNamaPengirim('');

    // Trigger visual confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch {
      // safe fallback
    }
  };

  // Handle Search Aspirasi
  const handleSearchAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketCode.trim()) return;
    const found = aspirasiList.find(
      (item) => item.tiketKode.toLowerCase() === searchTicketCode.trim().toLowerCase()
    );
    setSearchedAspirasi(found || null);
  };

  // Filter proker
  const filteredProkers = selectedSekbid === 'Semua' 
    ? prokerList 
    : prokerList.filter(p => p.sekbid.toLowerCase().includes(selectedSekbid.toLowerCase()));

  // Filter galeri
  const filteredGaleri = selectedGaleriCat === 'Semua'
    ? galeriList
    : galeriList.filter(g => g.kategori.toLowerCase() === selectedGaleriCat.toLowerCase());

  // Group Org Members for Dynamic Tree
  const pembina =
    orgMembers.find((m) => m.kategori === 'pembina' && !m.sekbidNomor && m.peranSekbid !== 'pembina_guru') ||
    orgMembers.find((m) => m.kategori === 'pembina') ||
    orgMembers[0];
  const guruPembinaSekbids = orgMembers
    .filter(
      (m) =>
        m.peranSekbid === 'pembina_guru' ||
        (m.kategori === 'pembina' && m.sekbidNomor) ||
        m.jabatan.toLowerCase().includes('guru pembina')
    )
    .sort((a, b) => (a.sekbidNomor || 0) - (b.sekbidNomor || 0));
  const bphMembers = orgMembers.filter((m) => m.kategori === 'bph').sort((a, b) => a.urutan - b.urutan);
  const sekbidMembers = orgMembers.filter((m) => m.kategori === 'sekbid').sort((a, b) => a.urutan - b.urutan);

  const currentBanner = activeBanners[currentBannerIndex] || activeBanners[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              {identity.logoUrl ? (
                <img
                  src={identity.logoUrl}
                  alt={`Logo ${identity.namaSekolah}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-black text-indigo-600 text-sm">{identity.singkatan}</span>
              )}
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-900 text-sm tracking-tight block truncate">
                OSIS {identity.namaSekolah}
              </span>
              <span className="text-[11px] text-slate-500 block -mt-0.5 truncate">
                Gorontalo · {identity.motto || 'Berkarakter Vokasi'}
              </span>
            </div>
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#beranda" className="hover:text-indigo-600 transition-colors">Beranda</a>
            <a href="#struktur" className="hover:text-indigo-600 transition-colors">Struktur Kepengurusan</a>
            <a href="#proker" className="hover:text-indigo-600 transition-colors">Transparansi Proker</a>
            <a href="#lensa" className="hover:text-indigo-600 transition-colors">Lensa Kegiatan</a>
            <a href="#aspirasi" className="hover:text-indigo-600 transition-colors">Kotak Aspirasi</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 min-h-[40px] px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Portal Pengurus</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden min-w-[42px] min-h-[42px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all"
              aria-label="Navigasi Menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
            <a
              href="#beranda"
              onClick={() => setMobileNavOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              🏠 Beranda
            </a>
            <a
              href="#struktur"
              onClick={() => setMobileNavOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              👥 Struktur Kepengurusan
            </a>
            <a
              href="#proker"
              onClick={() => setMobileNavOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              📋 Transparansi Program Kerja
            </a>
            <a
              href="#lensa"
              onClick={() => setMobileNavOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              📸 Lensa & Galeri Kegiatan
            </a>
            <a
              href="#aspirasi"
              onClick={() => setMobileNavOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              💬 Kotak Aspirasi Siswa
            </a>
          </div>
        )}
      </header>

      {/* Hero Section with Live Banner Spotlight Carousel */}
      <section id="beranda" className="relative pt-8 pb-16 md:pt-12 md:pb-20 overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          
          {/* Top Banner Slider / Spotlight */}
          {currentBanner && (
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl shadow-slate-300/40 text-white min-h-[360px] md:min-h-[440px] flex flex-col justify-end p-6 md:p-12 transition-all duration-700">
              {/* Background Image with Measured Gradient Scrim */}
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.judul}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 transition-transform duration-1000 ease-out"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="absolute inset-0 bg-indigo-950/20 mix-blend-multiply"></div>

              {/* Top Controls on Banner */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20">
                <span className="text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/20 text-indigo-300 uppercase">
                  {currentBanner.badgeText}
                </span>

                {activeBanners.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-2 py-1 rounded-full border border-white/10">
                    <button
                      onClick={() =>
                        setCurrentBannerIndex((prev) =>
                          prev === 0 ? activeBanners.length - 1 : prev - 1
                        )
                      }
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                      title="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-300 px-1">
                      {currentBannerIndex + 1} / {activeBanners.length}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length)
                      }
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                      title="Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Banner Content Body */}
              <div className="relative z-20 max-w-3xl space-y-3.5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                  {currentBanner.judul}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl drop-shadow-sm">
                  {currentBanner.subjudul}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {currentBanner.linkHref && (
                    <a
                      href={currentBanner.linkHref}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{currentBanner.linkText || 'Lihat Rincian'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <a
                    href="#lensa"
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-semibold border border-white/30 transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Jelajahi Lensa Kegiatan</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Lower Hero Grid: Welcome Quote & Live Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kepemimpinan Berintegritas & Karakter Vokasi Unggul</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Portal Administrasi OSIS SMK Tridharma Gorontalo
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                Di bawah arahan Pembina OSIS <strong>Bapak Ilham Arief, S.Pd.</strong>, portal ini mengintegrasikan seluruh birokrasi, presensi berbasis lokasi GPS, persuratan otomatis berformat .docx, transparansi program kerja, dan wadah aspirasi bagi seluruh warga sekolah.
              </p>

              {/* Pembina Profile Box */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-start gap-3.5 max-w-xl">
                <div className="w-14 h-14 rounded-full bg-slate-900 overflow-hidden border-2 border-indigo-400 shrink-0 shadow-inner">
                  {pembina.fotoUrl ? (
                    <img
                      src={pembina.fotoUrl}
                      alt={pembina.nama}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white">
                      IA
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{pembina.nama}</div>
                  <div className="text-[11px] text-indigo-600 font-semibold mb-1">
                    Pembina OSIS SMK Tridharma Gorontalo
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{pembina.visiSingkat || 'Membangun karakter kepemimpinan vokasi yang tangguh, santun, dan adaptif teknologi.'}"
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-indigo-600 font-mono">100%</div>
                <div className="text-xs font-bold text-slate-800">Administrasi Digital</div>
                <div className="text-[11px] text-slate-500">Surat & Notulensi Paperless</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-emerald-600 font-mono">{prokerList.length}</div>
                <div className="text-xs font-bold text-slate-800">Program Kerja Utama</div>
                <div className="text-[11px] text-slate-500">8 Seksi Bidang Vokasi</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-amber-600 font-mono">150 m</div>
                <div className="text-xs font-bold text-slate-800">Geofencing Presensi</div>
                <div className="text-[11px] text-slate-500">Radius Valid SMK Tridharma</div>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-purple-600 font-mono">{galeriList.length}</div>
                <div className="text-xs font-bold text-slate-800">Dokumentasi Lensa</div>
                <div className="text-[11px] text-slate-500">Kegiatan & Lomba Siswa</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Bagan / Struktur Kepengurusan dengan Foto Pengurus */}
      <section id="struktur" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            Terhubung Dinamis dengan Control Room Jendela 1
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Bagan Struktur Kepengurusan OSIS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Struktur kepengurusan OSIS SMK Tridharma Gorontalo periode aktif lengkap dengan profil dan foto pengurus yang diperbarui oleh Admin.
          </p>
        </div>

        {/* Tree Container */}
        <div className="space-y-12">
          {/* Level 1: Pembina OSIS */}
          <div className="flex flex-col items-center">
            <div className="relative group max-w-md w-full bg-white rounded-2xl border-2 border-indigo-500 p-6 shadow-sm hover:shadow-md transition-all text-center">
              <div className="w-20 h-20 mx-auto mb-3.5 rounded-full bg-slate-900 border-2 border-indigo-500 overflow-hidden shadow-inner">
                {pembina.fotoUrl ? (
                  <img
                    src={pembina.fotoUrl}
                    alt={pembina.nama}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-base">
                    IA
                  </div>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900">{pembina.nama}</div>
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                {pembina.jabatan}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{pembina.kelas}</div>
              {pembina.visiSingkat && (
                <p className="text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-100 italic">
                  "{pembina.visiSingkat}"
                </p>
              )}
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-10 bg-indigo-300"></div>
          </div>

          {/* Level 1.5: Dewan Guru Pembina di Setiap Seksi Bidang */}
          {guruPembinaSekbids.length > 0 && (
            <div className="flex flex-col items-center">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                  <span>Dewan Guru Pembina Seksi Bidang</span>
                </div>
                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                  Para guru pembimbing dan pendamping program kerja di setiap Seksi Bidang kejuruan & kesiswaan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                {guruPembinaSekbids.map((guru) => (
                  <div
                    key={guru.id}
                    className="bg-white rounded-2xl border border-purple-200/90 p-4 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-purple-200 overflow-hidden shrink-0 shadow-2xs">
                          {guru.fotoUrl ? (
                            <img
                              src={guru.fotoUrl}
                              alt={guru.nama}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-purple-700">
                              {guru.nama.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono inline-block mb-1">
                            SEKBID #{guru.sekbidNomor}
                          </span>
                          <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{guru.nama}</div>
                          <div className="text-[11px] font-semibold text-purple-700 truncate">{guru.mataPelajaran || 'Guru Pembimbing'}</div>
                          {guru.nip && <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {guru.nip}</div>}
                        </div>
                      </div>
                    </div>
                    {guru.visiSingkat && (
                      <p className="text-[11px] text-slate-600 pt-2 border-t border-purple-50 italic line-clamp-2">
                        "{guru.visiSingkat}"
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Connecting Vertical Line */}
              <div className="w-0.5 h-10 bg-indigo-300 mt-8"></div>
            </div>
          )}

          {/* Level 2: Badan Pengurus Harian (BPH) */}
          <div>
            <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
              Badan Pengurus Harian (BPH)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bphMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-13 h-13 rounded-full bg-slate-900 border border-slate-300 overflow-hidden shrink-0">
                        {member.fotoUrl ? (
                          <img
                            src={member.fotoUrl}
                            alt={member.nama}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                            {member.nama.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">{member.nama}</div>
                        <div className="text-[11px] font-semibold text-indigo-600">{member.jabatan}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Kelas: {member.kelas}</div>
                      </div>
                    </div>
                  </div>

                  {member.visiSingkat && (
                    <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100 italic line-clamp-2">
                      "{member.visiSingkat}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Level 3: Seksi-Seksi Bidang Lengkap dengan Koordinator & Anggota */}
          <div>
            <div className="text-center mb-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {currentSekbids.length} Seksi Bidang OSIS Terdaftar
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Koordinator & Anggota Seksi Bidang
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl mx-auto">
                Setiap Seksi Bidang mengemban amanah program kerja kejuruan dan pembinaan siswa, didukung oleh Koordinator dan Anggota aktif.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-4 mb-4 scrollbar-thin">
              <button
                type="button"
                onClick={() => setPublicSekbidFilter('semua')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  publicSekbidFilter === 'semua'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua Sekbid ({currentSekbids.length})
              </button>

              {currentSekbids.map((sek) => {
                const totalPersonel = orgMembers.filter(
                  (m) => (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') && m.sekbidNomor === sek.nomor
                ).length;

                return (
                  <button
                    key={sek.nomor}
                    type="button"
                    onClick={() => setPublicSekbidFilter(sek.nomor)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      publicSekbidFilter === sek.nomor
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono font-bold">#{sek.nomor}</span>
                    <span>{sek.singkatan}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      publicSekbidFilter === sek.nomor ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {totalPersonel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sekbid Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentSekbids.filter(
                (s) => publicSekbidFilter === 'semua' || s.nomor === publicSekbidFilter
              ).map((sek) => {
                const guruPembina = orgMembers.find(
                  (m) =>
                    (m.peranSekbid === 'pembina_guru' ||
                      (m.kategori === 'pembina' && m.sekbidNomor) ||
                      m.jabatan.toLowerCase().includes('guru pembina')) &&
                    m.sekbidNomor === sek.nomor
                );

                const koordinator = orgMembers.find(
                  (m) =>
                    (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') &&
                    m.sekbidNomor === sek.nomor &&
                    (m.peranSekbid === 'koordinator' || m.jabatan.toLowerCase().includes('koordinator'))
                );

                const anggotaSekbid = orgMembers.filter(
                  (m) =>
                    (m.kategori === 'sekbid' || m.kategori === 'anggota_sekbid') &&
                    m.sekbidNomor === sek.nomor &&
                    (m.peranSekbid === 'anggota' || (!m.peranSekbid && !m.jabatan.toLowerCase().includes('koordinator')))
                );

                return (
                  <div
                    key={sek.nomor}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Sekbid Header */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 font-mono">
                            SEKBID #{sek.nomor}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                            {(guruPembina ? 1 : 0) + (koordinator ? 1 : 0) + anggotaSekbid.length} Personel ({guruPembina ? '1 Guru' : '0 Guru'}, {koordinator ? '1 Koord' : '0 Koord'}, {anggotaSekbid.length} Anggota)
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                          {sek.nama}
                        </h4>
                        <p className="text-xs text-indigo-200/80 mt-1 line-clamp-2 leading-relaxed">
                          {sek.deskripsi}
                        </p>
                      </div>

                      {/* Members Content */}
                      <div className="p-4 sm:p-5 space-y-3.5">
                        {/* Guru Pembina Sekbid */}
                        {guruPembina && (
                          <div className="bg-gradient-to-r from-purple-50/90 via-white to-purple-50/50 rounded-2xl border border-purple-200 p-3.5 flex items-center gap-3.5 shadow-2xs">
                            <div className="w-13 h-13 rounded-2xl bg-slate-900 border-2 border-purple-400 overflow-hidden shrink-0 shadow-sm">
                              {guruPembina.fotoUrl ? (
                                <img
                                  src={guruPembina.fotoUrl}
                                  alt={guruPembina.nama}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-purple-700">
                                  {guruPembina.nama.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {guruPembina.nama}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono flex items-center gap-1">
                                  <GraduationCap className="w-2.5 h-2.5" />
                                  <span>GURU PEMBINA</span>
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-purple-700 truncate">
                                {guruPembina.mataPelajaran || 'Guru Pendamping Sekbid'}
                              </div>
                              {guruPembina.nip && (
                                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                  NIP: {guruPembina.nip}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Koordinator */}
                        {koordinator && (
                          <div className="bg-gradient-to-r from-indigo-50/70 to-white rounded-2xl border border-indigo-100 p-3.5 flex items-center gap-3.5">
                            <div className="w-13 h-13 rounded-2xl bg-slate-900 border-2 border-indigo-400 overflow-hidden shrink-0 shadow-sm">
                              {koordinator.fotoUrl ? (
                                <img
                                  src={koordinator.fotoUrl}
                                  alt={koordinator.nama}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-indigo-600">
                                  {koordinator.nama.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {koordinator.nama}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                                  KOORDINATOR
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-indigo-700 truncate">
                                {koordinator.jabatan}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Kelas: {koordinator.kelas}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Anggota Seksi Bidang List */}
                        <div>
                          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Anggota Sekbid ({anggotaSekbid.length} Siswa)</span>
                          </div>

                          {anggotaSekbid.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {anggotaSekbid.map((agt) => (
                                <div
                                  key={agt.id}
                                  className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-2.5 flex items-center gap-2.5 hover:bg-slate-100/80 transition-colors"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-300 overflow-hidden shrink-0 shadow-2xs">
                                    {agt.fotoUrl ? (
                                      <img
                                        src={agt.fotoUrl}
                                        alt={agt.nama}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-emerald-600">
                                        {agt.nama.slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[11px] font-bold text-slate-900 truncate">
                                      {agt.nama}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {agt.kelas}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400 italic">
                              Belum ada anggota terdaftar di Sekbid ini.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Visi Singkat / Motto from Koordinator */}
                    {koordinator?.visiSingkat && (
                      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 italic">
                        "{koordinator.visiSingkat}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Transparansi Program Kerja dengan Poster Visual */}
      <section id="proker" className="py-16 bg-slate-100/70 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                Akuntabilitas Terbuka Siswa
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Transparansi Program Kerja
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Pantau realisasi proker OSIS SMK Tridharma lengkap dengan poster visual kegiatan, alokasi anggaran, dan persentase capaian.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200 text-xs shadow-sm">
              {['Semua', ...currentSekbids.map((s) => `Sekbid ${s.nomor}`)].map((sekbid) => (
                <button
                  key={sekbid}
                  onClick={() => setSelectedSekbid(sekbid)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedSekbid === sekbid
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sekbid}
                </button>
              ))}
            </div>
          </div>

          {/* Proker Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProkers.map((proker) => (
              <div
                key={proker.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  {/* Poster Thumbnail Header */}
                  {proker.posterUrl && (
                    <div className="h-40 bg-slate-900 relative overflow-hidden">
                      <img
                        src={proker.posterUrl}
                        alt={proker.namaProker}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur text-white border border-white/20">
                          {proker.kode}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
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

                  <div className="p-5">
                    {!proker.posterUrl && (
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-mono text-slate-500 font-semibold">{proker.kode}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-indigo-100 text-indigo-800">
                          {proker.status}
                        </span>
                      </div>
                    )}

                    <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                      {proker.namaProker}
                    </h3>

                    <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                      {proker.deskripsi}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Realisasi Progres</span>
                        <span className="font-bold font-mono text-indigo-600">{proker.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            proker.progress === 100
                              ? 'bg-emerald-500'
                              : proker.progress >= 50
                              ? 'bg-indigo-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${proker.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex justify-between">
                    <span>PJ Sekbid:</span>
                    <span className="font-semibold text-slate-700">{proker.penanggungJawab}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-semibold text-slate-700">{proker.targetBulan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alokasi RAB:</span>
                    <span className="font-mono font-bold text-slate-800">
                      Rp {proker.anggaranRAB.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lensa Kegiatan (Photo Gallery Showcase) */}
      <section id="lensa" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Dokumentasi & Rekam Jejak
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Lensa Kegiatan OSIS
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Potret dinamika siswa SMK Tridharma Gorontalo dalam kegiatan kepemimpinan, aksi sosial, classmeeting, dan unjuk kejuruan.
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-xs">
            {['Semua', 'Classmeeting', 'LDKS', 'Bakti Sosial', 'Bazar Vokasi', 'Prestasi Siswa'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedGaleriCat(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  selectedGaleriCat === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGaleri.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedGaleri(item);
                setLightboxIndex(0);
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Photo Frame */}
              <div className="h-52 bg-slate-900 relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.judul}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-black/60 backdrop-blur text-white border border-white/20">
                    {item.kategori}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="text-[11px] text-white font-mono flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded">
                    <Camera className="w-3 h-3 text-indigo-400" />
                    <span>{item.jumlahFoto} Foto</span>
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.tanggal}</span>
                  </div>
                  <h4 className="text-xs font-bold leading-snug drop-shadow-sm line-clamp-1">
                    {item.judul}
                  </h4>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {item.deskripsi}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="truncate max-w-[180px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.lokasi}
                  </span>
                  <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Buka Foto</span>
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kotak Aspirasi Digital Siswa */}
      <section id="aspirasi" className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Form Aspirasi */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Kanal Suara Siswa & Transparansi
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Kotak Aspirasi Digital OSIS
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">
                  Punya ide perbaikan fasilitas, saran kegiatan ekstrakurikuler, atau masukan untuk SMK Tridharma Gorontalo? Sampaikan langsung di sini dengan opsi anonim (rahasia).
                </p>
              </div>

              {submittedTicket ? (
                <div className="p-6 bg-slate-800/90 rounded-2xl border border-emerald-500/40 space-y-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Aspirasi Berhasil Dikirim!</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Terima kasih atas kepedulian Anda untuk memajukan SMK Tridharma Gorontalo. Salin kode tiket di bawah ini untuk memantau status tindak lanjut:
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Kode Tiket Pelacakan</span>
                      <span className="text-base font-bold font-mono text-emerald-400">{submittedTicket}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(submittedTicket);
                        alert(`Kode tiket ${submittedTicket} berhasil disalin!`);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
                    >
                      Salin Tiket
                    </button>
                  </div>
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    ← Kirim Aspirasi Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitAspirasi} className="space-y-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kategori */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Kategori Aspirasi
                      </label>
                      <select
                        value={kategoriAspirasi}
                        onChange={(e) => setKategoriAspirasi(e.target.value as any)}
                        className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Sarana & Prasarana">Sarana & Prasarana Kampus</option>
                        <option value="Kegiatan Siswa">Kegiatan & Lomba Siswa</option>
                        <option value="Ekstrakurikuler">Ekstrakurikuler Vokasi</option>
                        <option value="Kebersihan & Ketertiban">Kebersihan & Ketertiban</option>
                        <option value="Aspirasi Akademik">Aspirasi Akademik & Praktik</option>
                      </select>
                    </div>

                    {/* Kelas / Jurusan */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Kelas & Program Keahlian
                      </label>
                      <select
                        value={kelasPengirim}
                        onChange={(e) => setKelasPengirim(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        {DAFTAR_KELAS.map((kls) => (
                          <option key={kls} value={kls}>
                            {kls}
                          </option>
                        ))}
                        <option value="Guru / Staf Pendidik">Guru / Staf Pendidik</option>
                      </select>
                    </div>
                  </div>

                  {/* Anonymous Switcher */}
                  <div className="flex items-center justify-between p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">Kirim Sebagai Anonim</span>
                      <span className="text-[11px] text-slate-400">Nama Anda tidak akan ditampilkan kepada siapapun</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonim}
                        onChange={(e) => setIsAnonim(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {!isAnonim && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={namaPengirim}
                        onChange={(e) => setNamaPengirim(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda..."
                        className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Judul */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Judul / Pokok Saran <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={judulAspirasi}
                      onChange={(e) => setJudulAspirasi(e.target.value)}
                      placeholder="Contoh: Pengadaan Stop Kontak Tambahan di Bengkel..."
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Pesan */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Isi Pesan Aspirasi <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={pesanAspirasi}
                      onChange={(e) => setPesanAspirasi(e.target.value)}
                      placeholder="Jelaskan kendala, lokasi spesifik, atau usulan solusi secara santun..."
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-950"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Aspirasi Sekarang</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Cek Status Aspirasi */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-2">
                  <Search className="w-4 h-4" />
                  <span>LACAK STATUS ASPIRASI</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Punya Kode Tiket Aspirasi?</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Masukkan kode tiket yang Anda peroleh saat mengirim aspirasi untuk melihat catatan respon dan tindak lanjut dari pengurus OSIS.
                </p>

                <form onSubmit={handleSearchAspirasi} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTicketCode}
                      onChange={(e) => setSearchTicketCode(e.target.value)}
                      placeholder="Contoh: ASP-2026-081"
                      className="flex-1 text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Lacak
                    </button>
                  </div>
                </form>

                {/* Search Result */}
                {searchedAspirasi !== undefined && (
                  <div className="mt-4 pt-4 border-t border-slate-800 animate-fadeIn">
                    {searchedAspirasi === null ? (
                      <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-xs text-rose-300">
                        Tiket <strong>"{searchTicketCode}"</strong> tidak ditemukan. Pastikan format tiket sesuai (contoh: ASP-2026-081).
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-indigo-400">
                            {searchedAspirasi.tiketKode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              searchedAspirasi.status === 'Selesai'
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                                : searchedAspirasi.status === 'Ditindaklanjuti'
                                ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                                : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                            }`}
                          >
                            Status: {searchedAspirasi.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">{searchedAspirasi.judul}</div>
                        <p className="text-[11px] text-slate-400 italic">"{searchedAspirasi.pesan}"</p>

                        {searchedAspirasi.tanggapanPengurus ? (
                          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] bg-slate-900/80 p-2.5 rounded text-emerald-300">
                            <span className="font-bold block text-white mb-0.5">Tanggapan Resmi Pengurus:</span>
                            {searchedAspirasi.tanggapanPengurus}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">
                            Sedang dalam antrean peninjauan oleh Sekbid terkait.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sample Ticket Chips */}
              <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">Contoh Tiket Terverifikasi:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {aspirasiList.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchTicketCode(item.tiketKode);
                        setSearchedAspirasi(item);
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-[11px] border border-slate-700 transition-colors"
                    >
                      {item.tiketKode} ({item.status})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              {identity.logoUrl ? (
                <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="font-bold text-indigo-600 text-[10px]">{identity.singkatan}</span>
              )}
            </div>
            <span className="font-bold text-slate-800">OSIS {identity.namaSekolah}</span>
            <span>·</span>
            <span>Pembina: Bapak Ilham Arief, S.Pd.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenLogin}
              className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Ruang Kendali Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Lightbox Photo Viewer Modal */}
      {selectedGaleri && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 text-white shadow-2xl flex flex-col max-h-[92vh]">
            {/* Lightbox Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-600 text-white">
                  {selectedGaleri.kategori}
                </span>
                <span className="text-xs text-slate-400">{selectedGaleri.tanggal}</span>
              </div>

              <button
                onClick={() => setSelectedGaleri(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* High-Resolution Photo Display */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[400px] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={
                  selectedGaleri.fotoUrls && selectedGaleri.fotoUrls[lightboxIndex]
                    ? selectedGaleri.fotoUrls[lightboxIndex]
                    : selectedGaleri.imageUrl
                }
                alt={selectedGaleri.judul}
                referrerPolicy="no-referrer"
                className="max-h-[55vh] w-auto max-w-full object-contain"
              />

              {/* Navigation Arrows if multiple photos */}
              {selectedGaleri.fotoUrls && selectedGaleri.fotoUrls.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        prev === 0 ? selectedGaleri.fotoUrls!.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setLightboxIndex((prev) =>
                        (prev + 1) % selectedGaleri.fotoUrls!.length
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Description Footer */}
            <div className="p-6 bg-slate-950 space-y-3">
              <div>
                <h3 className="text-base font-bold text-white mb-1">{selectedGaleri.judul}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedGaleri.deskripsi}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{selectedGaleri.lokasi}</span>
                </div>
                {selectedGaleri.fotografer && (
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dokumentasi: {selectedGaleri.fotografer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
