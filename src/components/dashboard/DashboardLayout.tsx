import React from 'react';
import { UserAccount, SystemModulesConfig, SchoolIdentityConfig } from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { 
  Shield, 
  Sliders, 
  MapPin, 
  FileText, 
  Calendar, 
  Wallet, 
  Package, 
  Clock, 
  MessageSquare, 
  Layers, 
  LogOut, 
  ExternalLink, 
  ChevronRight, 
  UserCircle,
  Sparkles,
  Menu,
  X,
  Camera,
  Compass,
  Cloud
} from 'lucide-react';

export type DashboardView = 
  | 'jendela1' 
  | 'jendela2' 
  | 'geomaps'
  | 'galeri'
  | 'presensi' 
  | 'surat' 
  | 'rapat' 
  | 'keuangan' 
  | 'inventaris' 
  | 'piket' 
  | 'aspirasi';

interface DashboardLayoutProps {
  currentUser: UserAccount;
  allAccounts: UserAccount[];
  currentView: DashboardView;
  systemModules: SystemModulesConfig;
  schoolIdentity?: SchoolIdentityConfig;
  onSelectView: (view: DashboardView) => void;
  onSwitchUser?: (user: UserAccount) => void;
  onLogout: () => void;
  onOpenPublicPortal: () => void;
  onOpenBlueprint: () => void;
  onOpenVercelGuide?: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  allAccounts,
  currentView,
  systemModules,
  schoolIdentity,
  onSelectView,
  onSwitchUser,
  onLogout,
  onOpenPublicPortal,
  onOpenBlueprint,
  onOpenVercelGuide,
  children,
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Check if role has admin control access
  const isSuperAdmin = currentUser.role === 'pembina';
  const isBPH = ['pembina', 'ketua', 'wakil', 'sekretaris', 'bendahara'].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-indigo-500/10 p-0.5">
                {identity.logoUrl ? (
                  <img
                    src={identity.logoUrl}
                    alt={`Logo ${identity.namaSekolah}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-white font-black text-lg">{identity.singkatan}</span>
                )}
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                  ERP OSIS {identity.singkatan}
                </h1>
                <div className="text-[11px] text-slate-400 font-mono">Kota Gorontalo</div>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)]">
            {/* Group 1: Control Room */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Ruang Kendali (Control Room)
              </div>

              <button
                onClick={() => {
                  onSelectView('jendela1');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'jendela1'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Jendela 1: Master & Akun</span>
                </div>
                {isSuperAdmin && (
                  <span className="text-[9px] font-mono bg-indigo-500/30 text-indigo-300 px-1 rounded">
                    ADMIN
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectView('jendela2');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'jendela2'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Jendela 2: Proker & Modul</span>
                </div>
                {isBPH && (
                  <span className="text-[9px] font-mono bg-indigo-500/30 text-indigo-300 px-1 rounded">
                    BPH
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectView('geomaps');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'geomaps'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Lokasi Presensi (Visual Maps)</span>
                </div>
                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  MAPS
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectView('galeri');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'galeri'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Media & Visual Laman Publik</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                  MEDIA
                </span>
              </button>
            </div>

            {/* Group 2: Operational Modules */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Modul Birokrasi & Operasional
              </div>

              {systemModules.modulPresensi && (
                <button
                  onClick={() => {
                    onSelectView('presensi');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'presensi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span>
                      {currentUser.role === 'pembina'
                        ? 'Validasi Presensi BPH & Pengurus'
                        : 'Presensi Geofencing GPS'}
                    </span>
                  </div>
                  {currentUser.role === 'pembina' && (
                    <span className="text-[9px] font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      VALIDASI
                    </span>
                  )}
                </button>
              )}

              {systemModules.modulSurat && (
                <button
                  onClick={() => {
                    onSelectView('surat');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'surat'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Surat-Menyurat (.docx)</span>
                </button>
              )}

              {systemModules.modulRapat && (
                <button
                  onClick={() => {
                    onSelectView('rapat');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'rapat'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Manajemen Rapat & Notulensi</span>
                </button>
              )}

              {systemModules.modulKeuangan && (
                <button
                  onClick={() => {
                    onSelectView('keuangan');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'keuangan'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-teal-400" />
                  <span>Kas & Kearsipan Keuangan</span>
                </button>
              )}

              {systemModules.modulInventaris && (
                <button
                  onClick={() => {
                    onSelectView('inventaris');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'inventaris'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4 text-rose-400" />
                  <span>Inventaris & Aset OSIS</span>
                </button>
              )}

              {systemModules.modulPiket && (
                <button
                  onClick={() => {
                    onSelectView('piket');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'piket'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Jadwal Piket Harian</span>
                </button>
              )}

              {systemModules.modulAspirasiPublik && (
                <button
                  onClick={() => {
                    onSelectView('aspirasi');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'aspirasi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Moderasi Aspirasi Siswa</span>
                </button>
              )}
            </div>

            {/* Group 3: System & Public */}
            <div className="space-y-1 pt-2 border-t border-slate-900">
              <button
                onClick={onOpenBlueprint}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Dokumentasi Arsitektur Teknis & Database Blueprint (Khusus Pembina)"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Blueprint Arsitektur</span>
                </div>
                <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-bold">
                  PEMBINA
                </span>
              </button>

              <button
                onClick={onOpenPublicPortal}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Lihat Portal Publik</span>
              </button>
            </div>
          </nav>
        </div>

        {/* User Account Footer & Switcher */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  {currentUser.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate max-w-[130px]">
                    {currentUser.fullName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      currentUser.role === 'pembina' 
                        ? 'bg-indigo-500/30 text-indigo-300' 
                        : isBPH 
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-sky-500/30 text-sky-300'
                    }`}>
                      {currentUser.role === 'pembina' ? 'PEMBINA' : isBPH ? 'BPH EKSEKUTIF' : 'PENGURUS'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Keluar dari Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Cloud Database & Vercel Guide Action */}
            {onOpenVercelGuide && (
              <button
                type="button"
                onClick={onOpenVercelGuide}
                className="w-full min-h-[34px] px-2.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center justify-between transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Database Cloud & Vercel</span>
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                  Gratis
                </span>
              </button>
            )}

            {/* Authenticated Session Status */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sesi Terverifikasi</span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Keluar untuk berganti akun pengurus lain"
              >
                Ganti Akun
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-3.5 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden min-w-[42px] min-h-[42px] rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
              <span className="hidden sm:inline">ERP OSIS</span>
              <span className="hidden sm:inline">SMK Tridharma</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
              <span className="text-slate-900 font-bold uppercase tracking-wide truncate">
                {currentView === 'jendela1'
                  ? 'Jendela 1: Master'
                  : currentView === 'jendela2'
                  ? 'Jendela 2: Proker'
                  : currentView === 'geomaps'
                  ? 'Lokasi Presensi'
                  : currentView === 'galeri'
                  ? 'Media Publik'
                  : currentView === 'presensi'
                  ? 'Presensi GPS'
                  : currentView === 'surat'
                  ? 'Surat-Menyurat'
                  : currentView === 'rapat'
                  ? 'Rapat & Notula'
                  : currentView === 'keuangan'
                  ? 'Keuangan Kas'
                  : currentView === 'inventaris'
                  ? 'Inventaris'
                  : currentView === 'piket'
                  ? 'Jadwal Piket'
                  : 'Moderasi Aspirasi'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>SMK Tridharma Gorontalo</span>
            </div>

            {onOpenVercelGuide && (
              <button
                type="button"
                onClick={onOpenVercelGuide}
                className="min-h-[40px] px-3 sm:px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
                title="Panduan Deploy Vercel & Database Cloud Gratis"
              >
                <Cloud className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Database Cloud & Vercel</span>
                <span className="sm:hidden">Cloud</span>
              </button>
            )}

            <button
              onClick={onOpenPublicPortal}
              className="min-h-[40px] px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span className="text-xs">Laman Publik</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-3.5 sm:p-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto animate-fadeIn min-w-0">
          {children}
        </main>

        {/* Mobile Quick Bottom Navigation Bar for Smart Navigation on Phones */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
          <button
            type="button"
            onClick={() => onSelectView('jendela1')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
              currentView === 'jendela1'
                ? 'text-indigo-600 font-bold bg-indigo-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Master</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('jendela2')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
              currentView === 'jendela2'
                ? 'text-indigo-600 font-bold bg-indigo-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Proker</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('presensi')}
            className={`flex flex-col items-center justify-center min-w-[62px] min-h-[48px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
              currentView === 'presensi'
                ? 'text-indigo-600 font-bold bg-indigo-50/80 ring-1 ring-indigo-200'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-5 h-5 mb-0.5 text-indigo-600 shrink-0" />
            <span className="text-[10px] leading-tight font-bold">Presensi</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView(systemModules.modulSurat ? 'surat' : 'rapat')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
              currentView === 'surat' || currentView === 'rapat'
                ? 'text-indigo-600 font-bold bg-indigo-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Surat/Rapat</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 rounded-xl text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
            aria-label="Semua Menu"
          >
            <Menu className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="text-[10px] leading-tight">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
