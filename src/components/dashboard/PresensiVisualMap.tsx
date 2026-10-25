import React, { useState, useEffect, useRef } from 'react';
import { SchoolGeoConfig } from '../../types/erp';
import { 
  Navigation, 
  Crosshair, 
  Layers, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  ZoomIn, 
  ZoomOut, 
  MapPin, 
  Search,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Footprints,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface PresensiVisualMapProps {
  currentLat: number;
  currentLng: number;
  targetGeoConfig: SchoolGeoConfig;
  currentDistance: number;
  isValid: boolean;
  onLocationChange?: (lat: number, lng: number, label: string) => void;
  onDetectGps?: () => void;
  isLocating?: boolean;
}

export const PresensiVisualMap: React.FC<PresensiVisualMapProps> = ({
  currentLat,
  currentLng,
  targetGeoConfig,
  currentDistance,
  isValid,
  onLocationChange,
  onDetectGps,
  isLocating = false,
}) => {
  // Map Type: Google 'roadmap' (vector street) vs 'satellite' (aerial photo) vs 'terrain'
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(17);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [isHoveringPin, setIsHoveringPin] = useState<'school' | 'user' | null>(null);

  // Map Center reference
  const centerLat = targetGeoConfig.latitude;
  const centerLng = targetGeoConfig.longitude;

  // Degrees to meters in Gorontalo (near equator: 1 deg lat ~ 110,574m, 1 deg lng ~ 111,320m)
  const metersPerDegLat = 110574;
  const metersPerDegLng = 111320;

  // Offset of User relative to Center
  const deltaLatMeters = (currentLat - centerLat) * metersPerDegLat;
  const deltaLngMeters = (currentLng - centerLng) * metersPerDegLng;

  // Pixel scaling factor based on Google Maps zoom levels (at zoom 17: ~1.2 pixels/meter)
  const zoomScale = Math.pow(2, zoomLevel - 16);
  const pixelsPerMeter = 0.95 * zoomScale;

  // Pixel coordinates relative to center (0, 0)
  const userPixelX = deltaLngMeters * pixelsPerMeter;
  const userPixelY = -deltaLatMeters * pixelsPerMeter;

  // Clamped pixel coordinates for display bounds inside container
  const maxBound = 220;
  const displayUserX = Math.max(-maxBound, Math.min(maxBound, userPixelX));
  const displayUserY = Math.max(-maxBound, Math.min(maxBound, userPixelY));

  // Geofence Radius Circle in pixels
  const radiusDiameterPx = Math.max(80, Math.min(480, targetGeoConfig.radiusToleransiMeter * pixelsPerMeter * 2));

  // Walking time estimation (~80 meters / minute)
  const estimatedWalkMinutes = Math.max(1, Math.round(currentDistance / 80));

  // Handle click on map to reposition user testing pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onLocationChange) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = e.clientY - rect.top - rect.height / 2;

    const metersX = clickX / pixelsPerMeter;
    const metersY = -clickY / pixelsPerMeter;

    const newLng = Number((centerLng + metersX / metersPerDegLng).toFixed(6));
    const newLat = Number((centerLat + metersY / metersPerDegLat).toFixed(6));

    onLocationChange(newLat, newLng, `Titik Peta Google Maps (${Math.round(Math.hypot(metersX, metersY))}m dari sekolah)`);
  };

  return (
    <div className="bg-[#f8f9fa] rounded-3xl border border-slate-300 overflow-hidden shadow-md text-slate-800 relative flex flex-col select-none font-sans transition-all">
      {/* Google Maps Top Bar / Header Ribbon */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Authentic Google Maps Brand Logo Badge */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-0.5">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="#EA4335" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-700 tracking-tight">
              Google Maps <span className="font-normal text-slate-500">· Presensi Geofence</span>
            </span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Location status badge */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`}></span>
            <span className={`text-[11px] font-bold ${isValid ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isValid ? 'DALAM JANGKAUAN' : 'DI LUAR JANGKAUAN'}
            </span>
          </div>
        </div>

        {/* Map Type Switcher (Google Maps Style: Peta / Satelit) */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium shadow-inner">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapType === 'roadmap'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peta
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapType === 'satellite'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satelit
          </button>
          <button
            type="button"
            onClick={() => setMapType('terrain')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mapType === 'terrain'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Medan
          </button>
        </div>
      </div>

      {/* Main Interactive Map Viewport */}
      <div
        onClick={handleMapClick}
        className="relative h-[340px] sm:h-[400px] w-full cursor-crosshair overflow-hidden select-none"
        title="Klik di mana saja pada peta Google Maps untuk simulasi posisi Anda"
      >
        {/* MAP BACKGROUND LAYER 1: ROADMAP (Google Maps Default Style) */}
        {mapType === 'roadmap' && (
          <div className="absolute inset-0 bg-[#f4f3f0]">
            {/* Soft Green Park / School Field Ground */}
            <div className="absolute top-[20%] left-[25%] w-[50%] h-[60%] bg-[#d9ebd4] rounded-3xl opacity-70 border border-[#b8ddaf]"></div>
            
            {/* Secondary Green Zone (Lap. Olahraga / Taman) */}
            <div className="absolute top-[35%] right-[10%] w-[25%] h-[40%] bg-[#d9ebd4] rounded-2xl opacity-60"></div>

            {/* School Building Blocks (Google Maps Light Greys) */}
            <div className="absolute top-[32%] left-[36%] w-[28%] h-[36%] bg-[#e9e6df] rounded-xl border border-[#d2cec3] shadow-sm flex flex-col items-center justify-center p-2 opacity-90">
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">
                Gedung Kampus SMK Tridharma
              </span>
              <div className="flex gap-1 mt-1">
                <span className="w-3 h-2 bg-[#d7d2c6] rounded-xs"></span>
                <span className="w-3 h-2 bg-[#d7d2c6] rounded-xs"></span>
                <span className="w-3 h-2 bg-[#d7d2c6] rounded-xs"></span>
              </div>
            </div>

            {/* Google Maps Road Network (Main Highway & Local Streets) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Arterial Yellow Road: Jl. Mayor Dullah */}
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fed876" strokeWidth="16" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff" strokeWidth="12" />
              
              {/* Vertical Street: Jl. Nani Wartabone / Gang Masuk */}
              <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#fed876" strokeWidth="14" />
              <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#ffffff" strokeWidth="10" />

              {/* Minor Access Roads */}
              <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#ffffff" strokeWidth="8" />
              <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#ffffff" strokeWidth="7" />
              <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#ffffff" strokeWidth="8" />

              {/* Road Center Dotted Lines */}
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />

              {/* Google Maps Style Street Names */}
              <text x="6%" y="48%" fill="#5f6368" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                Jl. Mayor Dullah
              </text>
              <text x="50%" y="18%" fill="#5f6368" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                Kawasan Limba B
              </text>
              <text x="76%" y="85%" fill="#70757a" fontSize="9" fontFamily="sans-serif">
                Arah Lapangan Taruna
              </text>
            </svg>

            {/* Google Live Traffic lines (Green = Smooth) */}
            {showTraffic && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
                <line x1="0" y1="52%" x2="100%" y2="52%" stroke="#0f9d58" strokeWidth="2.5" />
                <line x1="49.5%" y1="0" x2="49.5%" y2="100%" stroke="#0f9d58" strokeWidth="2.5" />
              </svg>
            )}
          </div>
        )}

        {/* MAP BACKGROUND LAYER 2: SATELLITE (Google Maps Satellite View) */}
        {mapType === 'satellite' && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80')`,
              filter: 'brightness(0.9) contrast(1.1)',
            }}
          >
            {/* Semi-transparent street overlay on satellite */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff" strokeWidth="6" strokeDasharray="8 4" />
              <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#ffffff" strokeWidth="6" strokeDasharray="8 4" />
              <text x="8%" y="46%" fill="#ffffff" fontSize="11" fontWeight="700" filter="drop-shadow(0 1px 2px black)">
                Jl. Mayor Dullah
              </text>
            </svg>
          </div>
        )}

        {/* MAP BACKGROUND LAYER 3: TERRAIN */}
        {mapType === 'terrain' && (
          <div className="absolute inset-0 bg-[#e8ece1]">
            {/* Topographic contour lines */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(ellipse at 50% 50%, #788c69 1px, transparent 1px), radial-gradient(ellipse at 20% 30%, #788c69 1px, transparent 1px)',
                backgroundSize: '40px 40px, 60px 60px',
              }}
            ></div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70">
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff" strokeWidth="10" />
              <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#ffffff" strokeWidth="8" />
              <text x="6%" y="47%" fill="#4a5568" fontSize="11" fontWeight="600">Jl. Mayor Dullah</text>
            </svg>
          </div>
        )}

        {/* GOOGLE MAPS FLOATING SEARCH & INFO CARD (Top-Left) */}
        <div className="absolute top-3 left-3 z-20 max-w-[280px] sm:max-w-xs bg-white rounded-2xl shadow-lg border border-slate-200/80 p-3 pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
              <span className="font-black text-xs">TD</span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                {targetGeoConfig.namaLokasi}
              </h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {targetGeoConfig.alamat}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                  ★ 4.9
                </span>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                  Radius {targetGeoConfig.radiusToleransiMeter}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAP CENTER / GEOFENCE / PINS OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Google Maps Geofence Radius Circle (Translucent Blue Aura) */}
          <div
            style={{
              width: `${radiusDiameterPx}px`,
              height: `${radiusDiameterPx}px`,
            }}
            className="rounded-full border-2 border-[#4285F4] bg-[#4285F4]/10 flex items-center justify-center transition-all duration-300 pointer-events-none shadow-[0_0_30px_rgba(66,133,244,0.2)]"
          >
            {/* Subtle inner pulse ring */}
            <div className="w-4/5 h-4/5 rounded-full border border-[#4285F4]/30 animate-pulse"></div>
          </div>

          {/* DOTTED WALKING ROUTE LINE (Google Maps Style Directions) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Route line shadow */}
            <line
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${displayUserX}px)`}
              y2={`calc(50% + ${displayUserY}px)`}
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Route line primary (Google Maps Walking Blue Dots) */}
            <line
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${displayUserX}px)`}
              y2={`calc(50% + ${displayUserY}px)`}
              stroke="#4285F4"
              strokeWidth="3.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>

          {/* FLOATING WALKING ETA CHIP (Midpoint between School and User) */}
          <div
            style={{
              transform: `translate(${displayUserX / 2}px, ${displayUserY / 2}px)`,
            }}
            className="absolute z-20 pointer-events-none -translate-y-3"
          >
            <div className="px-2 py-0.5 rounded-full bg-white text-slate-800 text-[10px] font-bold shadow-md border border-slate-200 flex items-center gap-1 whitespace-nowrap">
              <span>🚶</span>
              <span>{estimatedWalkMinutes} mnt</span>
              <span className="text-slate-400">({currentDistance}m)</span>
            </div>
          </div>

          {/* ICONIC GOOGLE MAPS RED DESTINATION PIN (Sekolah / Pusat Target) */}
          <div className="absolute z-20 flex flex-col items-center -translate-y-6 pointer-events-none">
            {/* Google Label Callout */}
            <div className="px-2.5 py-0.5 rounded-md bg-white text-slate-900 font-bold text-[10px] shadow-md border border-slate-200 whitespace-nowrap mb-0.5">
              🏫 {targetGeoConfig.namaLokasi.split('(')[0].trim()}
            </div>

            {/* Google Red Drop Pin SVG */}
            <div className="relative filter drop-shadow-md">
              <svg width="34" height="42" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 0C7.16 0 0 7.16 0 16C0 26.5 16 40 16 40C16 40 32 26.5 32 16C32 7.16 24.84 0 16 0Z"
                  fill="#EA4335"
                />
                <circle cx="16" cy="14" r="6" fill="#B31412" />
                <circle cx="16" cy="14" r="5" fill="#FFFFFF" />
              </svg>
            </div>
          </div>

          {/* ICONIC GOOGLE MAPS BLUE USER LOCATION DOT (Pengurus Posisi) */}
          <div
            style={{
              transform: `translate(${displayUserX}px, ${displayUserY}px)`,
            }}
            className="absolute z-30 flex flex-col items-center transition-all duration-300 pointer-events-none -translate-y-3"
          >
            {/* User status callout badge */}
            <div
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] shadow-lg border whitespace-nowrap mb-1 flex items-center gap-1.5 ${
                isValid
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-rose-600 text-white border-rose-400'
              }`}
            >
              <span>{isValid ? '📍 Lokasi Anda (Sah)' : '⚠️ Di Luar Batas'}</span>
              <span className="font-mono bg-black/20 px-1 rounded">{currentDistance}m</span>
            </div>

            {/* Google Maps Blue Dot with Accuracy Halo Ring */}
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Accuracy Halo */}
              <div
                className={`w-9 h-9 rounded-full absolute pointer-events-none animate-ping opacity-50 ${
                  isValid ? 'bg-[#4285F4]' : 'bg-[#EA4335]'
                }`}
              ></div>

              {/* Translucent Accuracy Circle */}
              <div
                className={`w-8 h-8 rounded-full border border-white/80 ${
                  isValid ? 'bg-[#4285F4]/30' : 'bg-[#EA4335]/30'
                }`}
              ></div>

              {/* Solid Blue Core Dot with Crisp White Border */}
              <div
                className={`w-4 h-4 rounded-full border-2 border-white absolute shadow-md ${
                  isValid ? 'bg-[#4285F4]' : 'bg-[#EA4335]'
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* GOOGLE MAPS FLOATING CONTROLS (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Compass / Reset Orientation */}
          <button
            type="button"
            onClick={() => setZoomLevel(17)}
            className="w-9 h-9 rounded-full bg-white shadow-md hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            title="Arah Utara / Reset Orientasi"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
          </button>

          {/* My Location GPS Button (Google Blue Target Icon) */}
          {onDetectGps && (
            <button
              type="button"
              disabled={isLocating}
              onClick={onDetectGps}
              className={`w-9 h-9 rounded-full bg-white shadow-md hover:bg-slate-50 border border-slate-200 flex items-center justify-center transition-colors disabled:opacity-50 ${
                isLocating ? 'animate-spin text-sky-600' : 'text-slate-700 hover:text-sky-600'
              }`}
              title="Pusatkan ke Lokasi GPS Perangkat Saya"
            >
              <Crosshair className="w-4 h-4 text-[#4285F4]" />
            </button>
          )}

          {/* Google Maps Zoom In / Out Pill */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(19, z + 1))}
              className="w-9 h-8 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-base transition-colors border-b border-slate-200"
              title="Perbesar (Zoom In)"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(14, z - 1))}
              className="w-9 h-8 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-base transition-colors"
              title="Perkecil (Zoom Out)"
            >
              −
            </button>
          </div>
        </div>

        {/* GOOGLE MAPS ATTRIBUTION & SCALE (Bottom-Left) */}
        <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2 pointer-events-none text-[10px] text-slate-500 font-sans">
          <div className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Google</span>
            <span>·</span>
            <span>Data peta ©2026</span>
            <span>·</span>
            <span className="font-mono">Skala: 50 m</span>
          </div>
        </div>
      </div>

      {/* Google Maps Bottom Telemetry Bar */}
      <div className="bg-white px-4 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-600">
          <span className="font-semibold text-slate-900 flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-indigo-600" />
            <span>Jarak Fisik:</span>
          </span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-md ${
              isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {currentDistance} meter
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Batas Maksimal: {targetGeoConfig.radiusToleransiMeter} m
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            GPS: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            *Klik sembarang titik di peta untuk memindahkan posisi pengujian
          </span>
        </div>
      </div>
    </div>
  );
};
