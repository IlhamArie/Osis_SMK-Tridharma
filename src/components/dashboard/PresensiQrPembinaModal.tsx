import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Award,
  RefreshCw,
  FileText
} from 'lucide-react';
import { SchoolIdentityConfig } from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';

interface PresensiQrPembinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolIdentity?: SchoolIdentityConfig;
  pembinaName?: string;
}

export interface QrPresensiPayload {
  app: string;
  type: string;
  npsn: string;
  tanggal: string;
  jenis: 'Kehadiran Sekolah & Piket' | 'Apel Pagi / Upacara' | 'Rapat Rutin' | 'Kepanitiaan';
  token: string;
  pembina: string;
  batasWita: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export const PresensiQrPembinaModal: React.FC<PresensiQrPembinaModalProps> = ({
  isOpen,
  onClose,
  schoolIdentity,
  pembinaName = 'Ilham Arief, S.Pd.',
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;

  const getTodayWita = () => {
    const d = new Date();
    // Tambah UTC+8 jika perlu atau format YYYY-MM-DD
    const now = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (8 * 3600000));
    return now.toISOString().split('T')[0];
  };

  const [jenisPresensi, setJenisPresensi] = useState<'Kehadiran Sekolah & Piket' | 'Apel Pagi / Upacara' | 'Rapat Rutin' | 'Kepanitiaan'>('Kehadiran Sekolah & Piket');
  const [tanggal, setTanggal] = useState<string>(getTodayWita());
  const [batasWaktu, setBatasWaktu] = useState<string>('07:15 WITA');
  const [keteranganAcara, setKeteranganAcara] = useState<string>('Presensi Kehadiran Pagi & Piket Rutin OSIS Kampus SMK Tridharma');
  
  const [tokenCode, setTokenCode] = useState<string>(() => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `OSIS-TRI-${rand}`;
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const generateNewToken = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setTokenCode(`OSIS-TRI-${rand}`);
  };

  useEffect(() => {
    if (!isOpen) return;

    const payload: QrPresensiPayload = {
      app: 'ERP_OSIS_SMK_TRIDHARMA',
      type: 'OFFICIAL_PRESENSI_QR',
      npsn: identity.npsn || '40501069',
      tanggal,
      jenis: jenisPresensi,
      token: tokenCode,
      pembina: pembinaName,
      batasWita: batasWaktu,
      lat: 0.536783,
      lng: 123.059523,
      createdAt: new Date().toISOString(),
    };

    QRCode.toDataURL(JSON.stringify(payload), {
      width: 500,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Gagal generate QR Code:', err));
  }, [isOpen, jenisPresensi, tanggal, batasWaktu, tokenCode, identity, pembinaName]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-Presensi-OSIS-${jenisPresensi.replace(/\s+/g, '_')}-${tanggal}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenCode);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* CSS Khusus Print agar hanya poster QR yang dicetak */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-poster-container, #print-poster-container * {
            visibility: visible !important;
          }
          #print-poster-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            padding: 24px !important;
            margin: 0 !important;
            background: white !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 no-print animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
          {/* Modal Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    RESMI PEMBINA OSIS
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Bisa Dicetak / Print</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Generator QR Code Presensi Resmi Pembina
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Pengaturan Sesi Presensi */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Konfigurasi Sesi Presensi</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Agenda Presensi
                    </label>
                    <select
                      value={jenisPresensi}
                      onChange={(e) => setJenisPresensi(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Kehadiran Sekolah & Piket">🏫 Kehadiran Sekolah & Piket Rutin</option>
                      <option value="Apel Pagi / Upacara">🚩 Apel Pagi / Upacara Bendera</option>
                      <option value="Rapat Rutin">👥 Rapat Rutin OSIS / BPH</option>
                      <option value="Kepanitiaan">⚡ Kepanitiaan & Program Kerja</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Berlaku
                      </label>
                      <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Batas Waktu Tepat
                      </label>
                      <input
                        type="text"
                        value={batasWaktu}
                        onChange={(e) => setBatasWaktu(e.target.value)}
                        placeholder="07:15 WITA"
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keterangan Poster / Lokasi Penempelan
                    </label>
                    <input
                      type="text"
                      value={keteranganAcara}
                      onChange={(e) => setKeteranganAcara(e.target.value)}
                      placeholder="Contoh: Ditempel di Meja Piket Lobi Utama"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                      <span className="font-semibold">Kode Token Verifikasi:</span>
                      <button
                        type="button"
                        onClick={generateNewToken}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 active:scale-95"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Acak Ulang Token</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-900 tracking-wider text-center">
                        {tokenCode}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 flex items-center gap-1 active:scale-95"
                        title="Salin Kode Token"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken ? 'Disalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Print & Download Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Poster QR Code (Print / PDF)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Unduh Gambar QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Salin Token Acara</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tips Penempelan:</strong> Cetak poster ini lalu tempelkan di ruang piket atau depan pintu lobi sekolah. Pengurus OSIS cukup membuka kamera di Portal Pengurus untuk langsung scan.
                  </span>
                </div>
              </div>

              {/* Right Column: Live Poster Preview (Siap Print) */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                  Pratinjau Lembar Cetak Poster (A4 / Standar)
                </span>

                {/* Container Printable Poster */}
                <div 
                  ref={printAreaRef}
                  id="print-poster-container"
                  className="w-full max-w-md bg-white border-4 border-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl text-slate-900 flex flex-col items-center text-center space-y-4"
                >
                  {/* Kop Poster Resmi */}
                  <div className="w-full pb-3 border-b-2 border-slate-800 flex items-center justify-between gap-3 text-left">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 p-1">
                      {identity.logoUrl ? (
                        <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="font-black text-indigo-700 text-xs">{identity.singkatan}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                        SISTEM PRESENSI RESMI ORGANISASI SISWA
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase leading-tight">
                        {identity.namaSekolah}
                      </h4>
                      <p className="text-[9px] text-slate-600 leading-tight">
                        {identity.alamat} • NPSN: {identity.npsn}
                      </p>
                    </div>
                  </div>

                  {/* Title of Event */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full uppercase border border-indigo-200">
                      PRESENSI SCAN QR • {jenisPresensi.toUpperCase()}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                      LEMBAR SCAN PRESENSI RESMI
                    </h3>
                    <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                      {keteranganAcara}
                    </p>
                  </div>

                  {/* QR Box with High Contrast */}
                  <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-inner inline-block">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code Presensi" 
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                        Membuat QR Code...
                      </div>
                    )}
                  </div>

                  {/* Token & Info Row */}
                  <div className="w-full bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs space-y-1 font-mono">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Tanggal:</span>
                      <strong className="text-slate-900">{tanggal}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Batas Tepat Waktu:</span>
                      <strong className="text-emerald-700">{batasWaktu}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 border-t border-slate-200 pt-1">
                      <span>Kode Token Manual:</span>
                      <strong className="text-indigo-700 font-bold tracking-widest">{tokenCode}</strong>
                    </div>
                  </div>

                  {/* Instruksi Pengurus */}
                  <div className="w-full text-left bg-indigo-50/60 rounded-xl p-3 border border-indigo-100 text-[10px] space-y-1">
                    <div className="font-bold text-indigo-950 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Petunjuk Scan bagi Pengurus OSIS:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-0.5 text-indigo-900 pl-0.5">
                      <li>Buka situs ERP OSIS di HP &rarr; Masuk ke <strong>Portal Pengurus</strong>.</li>
                      <li>Pilih menu <strong>Presensi</strong> &rarr; klik tombol <strong>Scan QR Pembina</strong>.</li>
                      <li>Arahkan kamera ke barcode di atas sampai tanda centang hijau muncul.</li>
                    </ol>
                  </div>

                  {/* Signatures Footer */}
                  <div className="w-full pt-2 flex items-end justify-between text-left text-[10px] text-slate-700 border-t border-slate-200">
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono">Validasi Sistem:</div>
                      <div className="font-bold text-slate-900">Geofence GPS Aktif</div>
                      <div className="text-[9px] text-slate-500">Radius Kampus Tridharma</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-slate-500">Kota Gorontalo, {tanggal}</div>
                      <div className="text-[9px] font-semibold text-slate-700">Pembina OSIS,</div>
                      <div className="h-7 flex items-center justify-end">
                        <span className="font-serif italic font-bold text-indigo-950 text-xs">
                          {pembinaName}
                        </span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-600">NIP/Kredensial Terverifikasi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
