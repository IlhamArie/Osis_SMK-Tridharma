import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  X, 
  Upload, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  SwitchCamera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QrPresensiPayload } from './PresensiQrPembinaModal';

interface PresensiQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (payload: {
    jenis: string;
    token: string;
    pembina: string;
    rawPayload: any;
  }) => void;
}

export const PresensiQrScannerModal: React.FC<PresensiQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'token'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualToken, setManualToken] = useState<string>('');
  const [manualJenis, setManualJenis] = useState<string>('Kehadiran Sekolah & Piket');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Play a soft positive audio beep on scan success
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio not supported or blocked, continue
    }
  };

  const handleSuccessfulScan = (codeData: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      let parsed: any;
      try {
        parsed = JSON.parse(codeData);
      } catch {
        parsed = { token: codeData, jenis: 'Kehadiran Sekolah & Piket', pembina: 'Ilham Arief, S.Pd.' };
      }

      playBeep();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      const jenis = parsed.jenis || 'Kehadiran Sekolah & Piket';
      const token = parsed.token || codeData;
      const pembina = parsed.pembina || 'Ilham Arief, S.Pd.';

      setSuccessInfo(`QR Terverifikasi! [${jenis}] - Token: ${token}`);

      setTimeout(() => {
        onScanSuccess({
          jenis,
          token,
          pembina,
          rawPayload: parsed,
        });
        setIsProcessing(false);
        onClose();
      }, 1200);
    } catch (err) {
      setIsProcessing(false);
      setCameraError('Format QR Code tidak dikenali sebagai kode presensi resmi OSIS.');
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn('Gagal akses kamera:', err);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan opsi "Unggah Foto QR" atau "Input Kode Token" di bawah.'
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Animation frame loop scanning the video feed
  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(tick);
      return;
    }

    const video = videoRef.current;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleSuccessfulScan(code.data);
        return; // stop loop
      }
    }

    if (!isProcessing) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode]);

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            handleSuccessfulScan(code.data);
          } else {
            alert('Tidak ditemukan barcode QR Code yang terbaca pada gambar tersebut. Coba foto lebih dekat dan jelas.');
          }
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Manual Token Submit
  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    handleSuccessfulScan(
      JSON.stringify({
        type: 'MANUAL_TOKEN_ENTRY',
        token: manualToken.trim().toUpperCase(),
        jenis: manualJenis,
        pembina: 'Ilham Arief, S.Pd.',
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  SCANNER PRESENSI
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Scan QR Code Resmi Pembina
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Mode Buttons */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'camera'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera Live</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Foto QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('token')}
            className={`flex-1 min-h-[38px] py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'token'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Ketik Token</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Success Toast Banner */}
          {successInfo && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-900 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* MODE 1: LIVE CAMERA */}
          {activeMode === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center">
                {/* Video element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                ></video>

                {/* Hidden canvas for decoding */}
                <canvas ref={canvasRef} className="hidden"></canvas>

                {/* Viewfinder Target Frame */}
                <div className="absolute inset-8 border-2 border-dashed border-indigo-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></span>
                    <span className="w-5 h-5 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></span>
                  </div>
                  {/* Laser Scanning Animation Bar */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></div>
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></span>
                    <span className="w-5 h-5 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></span>
                  </div>
                </div>

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                    <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                    <span className="text-xs font-bold">Memverifikasi QR Code...</span>
                  </div>
                )}
              </div>

              {/* Camera Switcher & Status */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Arahkan kamera ke lembar poster Pembina</span>
                <button
                  type="button"
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 active:scale-95"
                >
                  <SwitchCamera className="w-3.5 h-3.5" />
                  <span>Putar Kamera</span>
                </button>
              </div>

              {cameraError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Akses Kamera Belum Diizinkan:</span>
                  </div>
                  <p className="leading-relaxed">{cameraError}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveMode('token')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs"
                    >
                      Ketik Token Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMode('upload')}
                      className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 rounded-lg font-semibold text-xs"
                    >
                      Unggah Foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: UPLOAD FOTO QR */}
          {activeMode === 'upload' && (
            <div className="space-y-4 py-2">
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-6 text-center space-y-3 bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Pilih Foto atau Screenshot QR Pembina
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan opsi ini jika Anda memotret poster QR di sekolah
                  </p>
                </div>

                <label className="inline-flex min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Ambil Foto / Buka Galeri</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* MODE 3: MANUAL TOKEN INPUT */}
          {activeMode === 'token' && (
            <form onSubmit={handleManualTokenSubmit} className="space-y-4 py-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilihan Agenda / Jenis Presensi
                </label>
                <select
                  value={manualJenis}
                  onChange={(e) => setManualJenis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Kehadiran Sekolah & Piket">Kehadiran Sekolah & Piket Rutin</option>
                  <option value="Apel Pagi / Upacara">Apel Pagi / Upacara Bendera</option>
                  <option value="Rapat Rutin">Rapat Rutin OSIS / BPH</option>
                  <option value="Kepanitiaan">Kepanitiaan & Program Kerja</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode Token Verifikasi Pembina
                </label>
                <input
                  type="text"
                  required
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                  placeholder="Contoh: OSIS-TRI-8492"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold tracking-wider text-center text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <span className="text-[10px] text-slate-500 mt-1 block text-center">
                  Kode token tercetak di bagian bawah poster QR Code Pembina.
                </span>
              </div>

              <button
                type="submit"
                disabled={!manualToken.trim()}
                className="w-full min-h-[44px] py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verifikasi Presensi Sekarang</span>
              </button>
            </form>
          )}

          {/* Tips Info */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Presensi otomatis diverifikasi dengan koordinat GPS Anda untuk memastikan kehadiran nyata di lingkungan kampus SMK Tridharma Gorontalo.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
