import React, { useState } from 'react';
import { SchoolIdentityConfig, UserAccount } from '../../types/erp';
import {
  PRESET_SCHOOL_LOGOS,
  INITIAL_SCHOOL_IDENTITY,
} from '../../data/schoolIdentityPresets';
import {
  Image,
  UploadCloud,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Link,
  ShieldCheck,
  Save,
  Building,
  FileText,
  Eye,
  AlertCircle,
  Trash2,
  Sliders,
  Check
} from 'lucide-react';

interface SchoolLogoManagerProps {
  currentUser: UserAccount;
  currentIdentity: SchoolIdentityConfig;
  onSaveIdentity: (newIdentity: SchoolIdentityConfig) => void;
  onViewPublicPortal?: () => void;
}

export const SchoolLogoManager: React.FC<SchoolLogoManagerProps> = ({
  currentUser,
  currentIdentity,
  onSaveIdentity,
  onViewPublicPortal,
}) => {
  const isSuperAdmin = currentUser.role === 'pembina';

  // Working state for editing
  const [logoUrl, setLogoUrl] = useState<string>(currentIdentity.logoUrl);
  const [namaSekolah, setNamaSekolah] = useState<string>(currentIdentity.namaSekolah);
  const [singkatan, setSingkatan] = useState<string>(currentIdentity.singkatan);
  const [npsn, setNpsn] = useState<string>(currentIdentity.npsn);
  const [motto, setMotto] = useState<string>(currentIdentity.motto);
  const [alamat, setAlamat] = useState<string>(currentIdentity.alamat);
  const [telepon, setTelepon] = useState<string>(currentIdentity.telepon);
  const [email, setEmail] = useState<string>(currentIdentity.email);
  const [website, setWebsite] = useState<string>(currentIdentity.website);
  const [kopSuratBaris1, setKopSuratBaris1] = useState<string>(currentIdentity.kopSuratBaris1);
  const [kopSuratBaris2, setKopSuratBaris2] = useState<string>(currentIdentity.kopSuratBaris2);

  // Logo Input Mode: 'preset' | 'upload' | 'url'
  const [logoInputMode, setLogoInputMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>(
    PRESET_SCHOOL_LOGOS[0]?.id || 'preset-official'
  );

  // File Upload Handler (Converts file to Base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 3MB for base64 local storage)
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Ukuran berkas melebihi 3MB. Silakan pilih gambar yang lebih kecil.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Format berkas harus berupa gambar (PNG, JPG, SVG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setLogoUrl(base64);
        setActivePresetId('');
        setToastMessage('Foto logo berhasil dimuat! Klik "Simpan Perubahan" untuk menerapkan.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: typeof PRESET_SCHOOL_LOGOS[0]) => {
    setLogoUrl(preset.dataUrl);
    setActivePresetId(preset.id);
    setToastMessage(`Preset "${preset.nama}" dipilih!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // URL Input Handler
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setLogoUrl(customUrlInput.trim());
    setActivePresetId('');
    setToastMessage('URL gambar berhasil diterapkan ke pratinjau.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('Kembalikan logo dan profil sekolah ke lambang resmi awal?')) {
      setLogoUrl(INITIAL_SCHOOL_IDENTITY.logoUrl);
      setNamaSekolah(INITIAL_SCHOOL_IDENTITY.namaSekolah);
      setSingkatan(INITIAL_SCHOOL_IDENTITY.singkatan);
      setNpsn(INITIAL_SCHOOL_IDENTITY.npsn);
      setMotto(INITIAL_SCHOOL_IDENTITY.motto);
      setAlamat(INITIAL_SCHOOL_IDENTITY.alamat);
      setTelepon(INITIAL_SCHOOL_IDENTITY.telepon);
      setEmail(INITIAL_SCHOOL_IDENTITY.email);
      setWebsite(INITIAL_SCHOOL_IDENTITY.website);
      setKopSuratBaris1(INITIAL_SCHOOL_IDENTITY.kopSuratBaris1);
      setKopSuratBaris2(INITIAL_SCHOOL_IDENTITY.kopSuratBaris2);
      setActivePresetId(PRESET_SCHOOL_LOGOS[0].id);
      setToastMessage('Logo dan identitas dikembalikan ke pengaturan resmi.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} WITA`;

    const updated: SchoolIdentityConfig = {
      logoUrl: logoUrl.trim(),
      namaSekolah: namaSekolah.trim() || 'SMK Tridharma Gorontalo',
      singkatan: singkatan.trim() || 'TD',
      npsn: npsn.trim() || '40501234',
      motto: motto.trim(),
      alamat: alamat.trim(),
      telepon: telepon.trim(),
      email: email.trim(),
      website: website.trim(),
      kopSuratBaris1: kopSuratBaris1.trim(),
      kopSuratBaris2: kopSuratBaris2.trim(),
      updatedAt: timeStr,
      updatedBy: `${currentUser.fullName} (${currentUser.jabatan})`,
    };

    onSaveIdentity(updated);
    setToastMessage('✅ Logo dan Identitas Resmi Sekolah Berhasil Diperbarui & Disinkronkan ke Seluruh Sistem!');
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>HAK AKSES KHUSUS ADMIN (PEMBINA OSIS)</span>
            </span>
            <span className="text-xs text-indigo-300 font-mono">Control Room · Jendela 1</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Pengaturan Logo & Identitas Resmi Sekolah
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pembina OSIS berwenang memperbarui logo sekolah, nama lembaga, dan atribut kop surat resmi. Perubahan logo akan otomatis disinkronkan secara *real-time* ke <strong>Navbar Publik</strong>, <strong>Sidebar ERP</strong>, <strong>Kop Surat</strong>, dan <strong>Modal Login</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          {onViewPublicPortal && (
            <button
              type="button"
              onClick={onViewPublicPortal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Cek Tampilan Publik</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Editor & Right Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Methods to change logo (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Logo Replacement Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ganti Lambang / Logo Sekolah</h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih preset lambang resmi, upload foto dari perangkat, atau tautkan URL gambar
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setLogoInputMode('preset')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  logoInputMode === 'preset'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preset Resmi</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoInputMode('upload')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  logoInputMode === 'upload'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Berkas</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoInputMode('url')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  logoInputMode === 'url'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Tautkan URL</span>
              </button>
            </div>

            {/* METHOD 1: PRESET LOGOS */}
            {logoInputMode === 'preset' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Pilih Lambang Resmi Vokasi SMK Tridharma:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_SCHOOL_LOGOS.map((preset) => {
                    const isSelected = logoUrl === preset.dataUrl;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl bg-white p-1.5 shadow-2xs border border-slate-200 shrink-0 flex items-center justify-center">
                          <img
                            src={preset.dataUrl}
                            alt={preset.nama}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                              {preset.badge}
                            </span>
                            {isSelected && (
                              <span className="text-indigo-600 font-bold text-xs flex items-center gap-1">
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Aktif</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {preset.nama}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                            {preset.deskripsi}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* METHOD 2: UPLOAD IMAGE FILE */}
            {logoInputMode === 'upload' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Unggah Berkas Gambar Logo dari Komputer / HP:
                </span>
                <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-indigo-50/30 hover:bg-indigo-50/60 transition-all space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-950 block">
                      Klik untuk memilih berkas atau seret gambar ke sini
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mendukung format PNG, JPG, WebP, atau SVG (Maks. 3MB)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tips Resolusi:</strong> Gunakan gambar logo dengan latar belakang transparan (format PNG atau SVG) agar tampilan di navbar dan kop surat terlihat profesional.
                  </span>
                </div>
              </div>
            )}

            {/* METHOD 3: URL LINK */}
            {logoInputMode === 'url' && (
              <form onSubmit={handleApplyCustomUrl} className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Tautkan Tautan URL Gambar Logo:
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://contoh-domain.sch.id/logo-sekolah.png"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                  >
                    Terapkan URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pastikan URL berawalan <code>https://</code> dan dapat diakses publik tanpa perlu login.
                </p>
              </form>
            )}
          </div>

          {/* Form Detail Profil & Kop Surat */}
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-100">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Identitas Lembaga & Kop Surat Resmi</h3>
                <p className="text-[11px] text-slate-500">
                  Data ini disinkronkan ke footer laman publik, generator surat .docx, dan dokumen resmi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Resmi Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Singkatan Brand / Monogram <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singkatan}
                  onChange={(e) => setSingkatan(e.target.value)}
                  placeholder="Contoh: TD"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  NPSN (Nomor Pokok Sekolah Nasional)
                </label>
                <input
                  type="text"
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Telepon / WhatsApp Resmi
                </label>
                <input
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Semboyan / Motto Vokasi
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white italic"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Lengkap Kampus
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pos-el (Email Resmi)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Laman Web Resmi
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kop Surat Baris 1 (Nama Yayasan / Instansi Induk)
                </label>
                <input
                  type="text"
                  value={kopSuratBaris1}
                  onChange={(e) => setKopSuratBaris1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kop Surat Baris 2 (Nama Satuan Pendidikan)
                </label>
                <input
                  type="text"
                  value={kopSuratBaris2}
                  onChange={(e) => setKopSuratBaris2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Logo & Identitas</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview Panel: Live Mockups across the ERP System (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-5">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block">
                  PRATINJAU LANGSUNG (LIVE MOCKUP)
                </span>
                <h3 className="text-base font-bold text-white">Visual Logo di Seluruh Modul</h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            {/* MOCKUP 1: Top Navbar Publik */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                1. Tampilan Navbar Laman Publik:
              </span>
              <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-bold text-indigo-600 text-sm">{singkatan}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs tracking-tight block">
                      OSIS {namaSekolah}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Gorontalo · Berkarakter Vokasi</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[9px] font-bold">
                    Beranda
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-semibold">
                    Proker
                  </span>
                </div>
              </div>
            </div>

            {/* MOCKUP 2: Sidebar Dashboard ERP */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                2. Tampilan Header Sidebar Dashboard:
              </span>
              <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <span className="font-bold text-white text-sm">{singkatan}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    ERP OSIS {singkatan}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono">Kota Gorontalo</div>
                </div>
              </div>
            </div>

            {/* MOCKUP 3: Kop Surat Resmi Dokumen */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                3. Tampilan Kop Surat Resmi (.docx / Cetak):
              </span>
              <div className="bg-white text-slate-900 rounded-2xl p-4 border border-slate-200 shadow-xs font-serif text-[10px] space-y-2">
                <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-2">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-bold text-indigo-700 text-xs">{singkatan}</span>
                    )}
                  </div>
                  <div className="text-center flex-1 leading-tight space-y-0.5">
                    <div className="font-bold text-[9px] uppercase tracking-wider">{kopSuratBaris1}</div>
                    <div className="font-black text-xs text-slate-950 uppercase">{kopSuratBaris2}</div>
                    <div className="text-[8.5px] text-indigo-950 font-bold">ORGANISASI SISWA INTRA SEKOLAH (OSIS)</div>
                    <div className="text-[7.5px] text-slate-600 font-sans">{alamat}</div>
                  </div>
                </div>
                <div className="flex justify-between font-sans text-[8px] text-slate-500">
                  <span>Nomor: 045/OSIS-SMK-TD/10/2026</span>
                  <span>Gorontalo, 1 Oktober 2026</span>
                </div>
              </div>
            </div>

            {/* MOCKUP 4: Modal Login Header */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                4. Tampilan Modal Login Pengurus:
              </span>
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-black text-xs text-indigo-600">{singkatan}</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Portal Pengurus OSIS</div>
                  <div className="text-[10px] text-slate-500 font-mono">{namaSekolah}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
