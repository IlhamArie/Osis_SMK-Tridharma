import { SchoolIdentityConfig } from '../types/erp';

// High-resolution Vector SVG Data URIs for offline, fast & crisp logo rendering
export const LOGO_PRESET_OFFICIAL_TRIDHARMA = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Outer Ring Shield -->
  <path d="M 120,12 C 185,12 220,38 220,95 C 220,165 155,215 120,228 C 85,215 20,165 20,95 C 20,38 55,12 120,12 Z" 
        fill="url(#shieldGrad)" stroke="url(#goldGrad)" stroke-width="6" filter="url(#glow)"/>

  <!-- Inner Gold Border -->
  <path d="M 120,24 C 175,24 206,46 206,96 C 206,155 150,198 120,212 C 90,198 34,155 34,96 C 34,46 65,24 120,24 Z" 
        fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="4,3"/>

  <!-- Vocational Gear (Roda Gigi Vokasi) -->
  <g transform="translate(120, 110) scale(0.68)">
    <circle cx="0" cy="0" r="44" fill="none" stroke="url(#goldGrad)" stroke-width="12"/>
    <g fill="url(#goldGrad)">
      <rect x="-8" y="-58" width="16" height="18" rx="3"/>
      <rect x="-8" y="40" width="16" height="18" rx="3"/>
      <rect x="-58" y="-8" width="18" height="16" rx="3"/>
      <rect x="40" y="-8" width="18" height="16" rx="3"/>
      <rect x="-42" y="-42" width="16" height="16" rx="3" transform="rotate(45)"/>
      <rect x="-42" y="-42" width="16" height="16" rx="3" transform="rotate(-45)"/>
      <rect x="-42" y="-42" width="16" height="16" rx="3" transform="rotate(135)"/>
      <rect x="-42" y="-42" width="16" height="16" rx="3" transform="rotate(-135)"/>
    </g>
    <!-- Center Core -->
    <circle cx="0" cy="0" r="28" fill="#1e1b4b" stroke="url(#goldGrad)" stroke-width="4"/>
    <text x="0" y="8" fill="#fde047" font-family="Arial, sans-serif" font-weight="900" font-size="20" text-anchor="middle">TD</text>
  </g>

  <!-- Open Book of Wisdom (Buku Ilmu) -->
  <path d="M 82,156 Q 102,150 120,158 Q 138,150 158,156 L 158,172 Q 138,166 120,174 Q 102,166 82,172 Z" 
        fill="#f8fafc" stroke="#0284c7" stroke-width="2"/>
  <line x1="120" y1="158" x2="120" y2="174" stroke="#0284c7" stroke-width="2"/>

  <!-- Torch of Light (Obor Pendidikan) -->
  <g transform="translate(120, 62) scale(0.65)">
    <!-- Flame -->
    <path d="M 0,-36 Q 16,-18 10,2 Q 4,-4 0,-14 Q -4,-4 -10,2 Q -16,-18 0,-36 Z" fill="#ef4444"/>
    <path d="M 0,-24 Q 9,-12 6,2 Q 2,-2 0,-8 Q -2,-2 -6,2 Q -9,-12 0,-24 Z" fill="#f59e0b"/>
    <!-- Handle -->
    <polygon points="-6,4 6,4 4,24 -4,24" fill="url(#goldGrad)"/>
    <line x1="-8" y1="4" x2="8" y2="4" stroke="url(#goldGrad)" stroke-width="3"/>
  </g>

  <!-- School Name Ribbon Arc -->
  <rect x="52" y="184" width="136" height="22" rx="6" fill="#0f172a" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <text x="120" y="199" fill="#fef08a" font-family="Arial, sans-serif" font-weight="800" font-size="10.5" letter-spacing="1" text-anchor="middle">
    SMK TRIDHARMA
  </text>
  <text x="120" y="52" fill="#93c5fd" font-family="Arial, sans-serif" font-weight="800" font-size="9" letter-spacing="1.5" text-anchor="middle">
    KOTA GORONTALO
  </text>
</svg>
`)}`;

export const LOGO_PRESET_MODERN_MONOGRAM = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="modGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="60" fill="url(#modGrad)" />
  <circle cx="120" cy="120" r="92" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.25"/>
  <circle cx="120" cy="120" r="82" fill="#0f172a" fill-opacity="0.6"/>
  <!-- Modern Interlocking T & D -->
  <path d="M 65,80 L 135,80 L 135,102 L 112,102 L 112,168 L 88,168 L 88,102 L 65,102 Z" fill="#ffffff" />
  <path d="M 125,80 L 152,80 C 178,80 195,96 195,124 C 195,152 178,168 152,168 L 125,168 L 125,146 L 150,146 C 163,146 171,137 171,124 C 171,111 163,102 150,102 L 125,102 Z" fill="url(#accentGrad)" />
  <!-- Subtext -->
  <text x="120" y="196" fill="#e2e8f0" font-family="Arial, sans-serif" font-weight="800" font-size="11" letter-spacing="2" text-anchor="middle">
    VOCATIONAL TECH
  </text>
</svg>
`)}`;

export const LOGO_PRESET_GARUDA_GOLD = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="royalBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#172554" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>
    <linearGradient id="goldEagle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </linearGradient>
  </defs>
  <!-- Background Circle Badge -->
  <circle cx="120" cy="120" r="110" fill="url(#royalBlue)" stroke="url(#goldEagle)" stroke-width="6"/>
  <circle cx="120" cy="120" r="98" fill="none" stroke="url(#goldEagle)" stroke-width="2" stroke-dasharray="3,3"/>
  <!-- Wing Feathers Left -->
  <path d="M 120,95 C 95,65 52,68 36,92 C 55,95 72,110 82,126 C 65,124 50,132 44,142 C 64,145 80,154 92,165 L 120,135 Z" fill="url(#goldEagle)" opacity="0.95"/>
  <!-- Wing Feathers Right -->
  <path d="M 120,95 C 145,65 188,68 204,92 C 185,95 168,110 158,126 C 175,124 190,132 196,142 C 176,145 160,154 148,165 L 120,135 Z" fill="url(#goldEagle)" opacity="0.95"/>
  <!-- Shield Center -->
  <polygon points="120,80 148,96 148,142 120,165 92,142 92,96" fill="#020617" stroke="url(#goldEagle)" stroke-width="3"/>
  <text x="120" y="132" fill="#fde047" font-family="Arial, sans-serif" font-weight="900" font-size="24" text-anchor="middle">TD</text>
  <!-- Bottom Ribbon -->
  <rect x="50" y="178" width="140" height="24" rx="12" fill="#eab308" />
  <text x="120" y="194" fill="#0f172a" font-family="Arial, sans-serif" font-weight="900" font-size="10.5" letter-spacing="1" text-anchor="middle">
    TRIDHARMA 1985
  </text>
</svg>
`)}`;

export const LOGO_PRESET_EMERALD_ACADEMIC = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="55" fill="url(#emeraldGrad)"/>
  <path d="M 120,25 L 195,68 L 195,155 L 120,205 L 45,155 L 45,68 Z" fill="none" stroke="url(#goldStar)" stroke-width="4"/>
  <!-- Vocational Graduation Cap & Sprout -->
  <path d="M 68,110 L 120,86 L 172,110 L 120,134 Z" fill="#ffffff"/>
  <polygon points="120,134 165,114 165,142 120,158" fill="#e2e8f0"/>
  <!-- Star on top -->
  <polygon points="120,48 123,58 133,58 125,64 128,74 120,68 112,74 115,64 107,58 117,58" fill="url(#goldStar)"/>
  <text x="120" y="186" fill="#fef08a" font-family="Arial, sans-serif" font-weight="900" font-size="12" letter-spacing="1.5" text-anchor="middle">
    SMK TRIDHARMA
  </text>
</svg>
`)}`;

export interface SchoolLogoPresetItem {
  id: string;
  nama: string;
  deskripsi: string;
  badge: string;
  dataUrl: string;
  warnaTema: string;
}

export const PRESET_SCHOOL_LOGOS: SchoolLogoPresetItem[] = [
  {
    id: 'preset-official',
    nama: 'Lambang Resmi SMK Tridharma (Perisai Biru Emas)',
    deskripsi: 'Desain lambang resmi lengkap dengan obor pendidikan, roda gigi kejuruan vokasi, dan buku ilmu.',
    badge: 'REKOMENDASI RESMI',
    dataUrl: LOGO_PRESET_OFFICIAL_TRIDHARMA,
    warnaTema: '#312e81',
  },
  {
    id: 'preset-modern',
    nama: 'Monogram Modern Minimalis TD (Indigo Cyan)',
    deskripsi: 'Desain flat modern berkarakter teknologi informasi dan kejuruan digital abad ke-21.',
    badge: 'MODERN TECH',
    dataUrl: LOGO_PRESET_MODERN_MONOGRAM,
    warnaTema: '#4f46e5',
  },
  {
    id: 'preset-garuda',
    nama: 'Lambang Sayap Garuda Emas (Royal Navy Gold)',
    deskripsi: 'Simbol kepemimpinan berwibawa dengan sayap emas dan perisai vokasi tangguh.',
    badge: 'KEWIBAWAAN',
    dataUrl: LOGO_PRESET_GARUDA_GOLD,
    warnaTema: '#172554',
  },
  {
    id: 'preset-emerald',
    nama: 'Lambang Tunas Prestasi Vokasi (Zamrud Emas)',
    deskripsi: 'Emblem hijau zamrud dengan topi akademik dan bintang prestasi generasi unggul.',
    badge: 'PRESTASI AKADEMIK',
    dataUrl: LOGO_PRESET_EMERALD_ACADEMIC,
    warnaTema: '#047857',
  },
];

export const INITIAL_SCHOOL_IDENTITY: SchoolIdentityConfig = {
  logoUrl: LOGO_PRESET_OFFICIAL_TRIDHARMA,
  namaSekolah: 'SMK Tridharma Gorontalo',
  singkatan: 'TD',
  npsn: '40501234',
  motto: 'Vokasi Unggul, Berkarakter, Disiplin, dan Berdaya Saing Global',
  alamat: 'Jl. Mayor Dullah No. 12, Kel. Limba B, Kec. Kota Selatan, Kota Gorontalo 96115',
  telepon: '(0435) 821234 / 081244556677',
  email: 'osis@smktridharma-gorontalo.sch.id',
  website: 'smktridharma-gorontalo.sch.id',
  kopSuratBaris1: 'YAYASAN TRIDHARMA GORONTALO',
  kopSuratBaris2: 'SMK TRIDHARMA GORONTALO',
  updatedAt: '2026-10-01',
  updatedBy: 'Ilham Arief, S.Pd. (Pembina OSIS)',
};
