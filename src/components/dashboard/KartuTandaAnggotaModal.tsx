import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UserAccount, OrgMember, SchoolIdentityConfig, SekbidDefinition } from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { DAFTAR_KELAS } from '../../data/classList';
import { 
  CreditCard, 
  Printer, 
  Search, 
  Download, 
  X, 
  CheckCircle, 
  QrCode, 
  Eye, 
  ChevronRight, 
  School,
  Grid,
  Upload,
  RotateCcw,
  Palette,
  Compass,
  Check,
  FileDown,
  Loader2,
  Trash2,
  Sparkles,
  FolderArchive,
  Image as ImageIcon,
  Layers,
  FileArchive
} from 'lucide-react';

interface KartuTandaAnggotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgMembers: OrgMember[];
  accounts: UserAccount[];
  sekbidList?: SekbidDefinition[];
  schoolIdentity?: SchoolIdentityConfig;
}

type CardOrientation = 'landscape' | 'portrait';
type CardThemePreset = 'emerald-gold' | 'navy-sapphire' | 'dark-titanium' | 'clean-white' | 'custom';
type TextColorMode = 'light' | 'dark';

export const KartuTandaAnggotaModal: React.FC<KartuTandaAnggotaModalProps> = ({
  isOpen,
  onClose,
  orgMembers,
  accounts,
  sekbidList,
  schoolIdentity,
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('semua');
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'individual' | 'batch_a4'>('individual');

  // Orientation & Custom Design State
  const [cardOrientation, setCardOrientation] = useState<CardOrientation>('portrait');
  const [themePreset, setThemePreset] = useState<CardThemePreset>('emerald-gold');
  const [customFrontBg, setCustomFrontBg] = useState<string | null>(null);
  const [customBackBg, setCustomBackBg] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(25); // 0% to 80%
  const [textColorMode, setTextColorMode] = useState<TextColorMode>('light');
  const [showCustomDesignDrawer, setShowCustomDesignDrawer] = useState(false);

  // PDF & Download State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressMsg, setPdfProgressMsg] = useState('');
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});
  const [isPrinting, setIsPrinting] = useState(false);

  // ZIP & Image Export State
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number; memberName: string; percent: number }>({
    current: 0,
    total: 0,
    memberName: '',
    percent: 0,
  });
  const [zipStatusText, setZipStatusText] = useState('');
  const [isGeneratingSingleImg, setIsGeneratingSingleImg] = useState(false);
  const [workerMember, setWorkerMember] = useState<any | null>(null);

  // File upload refs
  const frontBgInputRef = useRef<HTMLInputElement>(null);
  const backBgInputRef = useRef<HTMLInputElement>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Combine OrgMember with Account credentials (like NISN)
  const combinedMembers = orgMembers.map((m, index) => {
    const acc = accounts.find(
      (a) => a.fullName.toLowerCase() === m.nama.toLowerCase() || (a.nisn && a.nisn === m.kontak)
    );
    const nisn = acc?.nisn || `007${String(1234500 + index).padStart(7, '0')}`;
    const noKta = `KTA-OSIS/${new Date().getFullYear()}/${String(index + 1).padStart(3, '0')}`;
    return {
      ...m,
      nisn,
      noKta,
      username: acc?.username || m.nama.toLowerCase().replace(/\s+/g, '.'),
    };
  });

  // Filtered members list
  const filteredList = combinedMembers.filter((m) => {
    const matchesSearch =
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nisn.includes(searchQuery) ||
      m.noKta.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKelas = filterKelas === 'semua' || m.kelas === filterKelas;
    const matchesKategori = filterKategori === 'semua' || m.kategori === filterKategori;

    return matchesSearch && matchesKelas && matchesKategori;
  });

  // Set default selected member
  useEffect(() => {
    if (combinedMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(combinedMembers[0].id);
    }
  }, [combinedMembers, selectedMemberId]);

  // Pre-generate QR codes for active members
  useEffect(() => {
    if (!isOpen) return;

    const generateQRs = async () => {
      const qrs: Record<string, string> = {};
      for (const m of filteredList.slice(0, 50)) {
        try {
          const payload = JSON.stringify({
            inst: identity.namaSekolah,
            kta: m.noKta,
            name: m.nama,
            role: m.jabatan,
            cls: m.kelas,
            pembina: 'Ilham Arief, S.Pd.',
            ver: '2025/2026',
          });
          const url = await QRCode.toDataURL(payload, {
            width: 200,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          qrs[m.id] = url;
        } catch (err) {
          console.error('Failed to generate QR', err);
        }
      }
      setQrCodeDataUrls((prev) => ({ ...prev, ...qrs }));
    };

    generateQRs();
  }, [isOpen, filteredList.length, identity.namaSekolah]);

  if (!isOpen) return null;

  const currentMember = combinedMembers.find((m) => m.id === selectedMemberId) || combinedMembers[0];

  // Upload Custom Front Background Image
  const handleUploadFrontBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomFrontBg(result);
        setThemePreset('custom');
      }
    };
    reader.readAsDataURL(file);
    // Reset input value so user can re-select the same file if needed
    e.target.value = '';
  };

  // Upload Custom Back Background Image
  const handleUploadBackBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomBackBg(result);
        setThemePreset('custom');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Reset custom background
  const handleResetCustomBg = () => {
    setCustomFrontBg(null);
    setCustomBackBg(null);
    setThemePreset('emerald-gold');
    setTextColorMode('light');
    setOverlayOpacity(25);
  };

  // ==========================================
  // DIRECT PDF DOWNLOAD ENGINE (True client-side .pdf)
  // ==========================================
  const handleDownloadPdf = async () => {
    const printableElement = document.getElementById('kta-printable-area');
    if (!printableElement) {
      alert('Elemen cetak kartu tidak ditemukan.');
      return;
    }

    setIsGeneratingPdf(true);
    setPdfProgressMsg('Menyiapkan grafis kartu beresolusi tinggi...');

    try {
      const isA4Batch = viewMode === 'batch_a4';
      setPdfProgressMsg('Merender kartu tanda anggota ke format PDF...');

      // html-to-image natively supports modern CSS colors including oklch
      const imgData = await toJpeg(printableElement, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        },
      });

      setPdfProgressMsg('Menyusun lembar cetak PDF standard A4...');

      // Load image to calculate true pixel dimensions
      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memuat gambar render'));
      });

      // Create PDF in A4
      const pdf = new jsPDF({
        orientation: cardOrientation === 'landscape' && isA4Batch ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 16; // 8mm margin each side
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 8; // 8mm top margin

      // First page
      pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 16);

      // Add extra pages if needed for batch print
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 8;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 8, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 16);
      }

      const fileName = `KTA_OSIS_${identity.singkatan}_${cardOrientation.toUpperCase()}_${viewMode === 'batch_a4' ? 'SEMUA' : currentMember.nama.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      setPdfProgressMsg('PDF Berhasil Diunduh!');
    } catch (err) {
      console.error('Error generating PDF with html-to-image:', err);
      // Fallback: try window.print() if html-to-image/jspdf fails
      alert('Gagal membuat PDF otomatis. Mengalihkan ke dialog cetak / Simpan PDF browser...');
      window.print();
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfProgressMsg('');
      }, 800);
    }
  };

  // Browser Print trigger
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  // ==========================================
  // SINGLE CARD IMAGE DOWNLOAD (JPEG HD)
  // ==========================================
  const handleDownloadSingleCardImage = async (side: 'front' | 'back' | 'both' = 'both') => {
    if (!currentMember) return;
    setIsGeneratingSingleImg(true);

    try {
      const orientationSuffix = cardOrientation.toUpperCase();
      const cleanName = currentMember.nama.replace(/\s+/g, '_');

      if (side === 'front' || side === 'both') {
        const frontEl = document.getElementById('single-card-front');
        if (frontEl) {
          const frontDataUrl = await toJpeg(frontEl, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            pixelRatio: 2.5,
            skipFonts: true,
          });
          const link = document.createElement('a');
          link.href = frontDataUrl;
          link.download = `KTA_${identity.singkatan}_${orientationSuffix}_${cleanName}_DEPAN.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }

      if (side === 'back' || side === 'both') {
        const backEl = document.getElementById('single-card-back');
        if (backEl) {
          const backDataUrl = await toJpeg(backEl, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            pixelRatio: 2.5,
            skipFonts: true,
          });
          const link = document.createElement('a');
          link.href = backDataUrl;
          link.download = `KTA_${identity.singkatan}_${orientationSuffix}_${cleanName}_BELAKANG.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err) {
      console.error('Gagal mengunduh gambar kartu:', err);
      alert('Gagal mengunduh gambar kartu.');
    } finally {
      setIsGeneratingSingleImg(false);
    }
  };

  // ==========================================
  // ALL CARDS ZIP DOWNLOAD ENGINE (JSZip + JPEG HD)
  // ==========================================
  const handleDownloadAllZip = async () => {
    if (filteredList.length === 0) {
      alert('Tidak ada kartu yang dipilih untuk diunduh.');
      return;
    }

    setIsGeneratingZip(true);
    setZipStatusText('Menyiapkan kompresi berkas ZIP seluruh kartu KTA...');
    setZipProgress({
      current: 0,
      total: filteredList.length,
      memberName: 'Memulai...',
      percent: 0,
    });

    try {
      const zip = new JSZip();
      const folderName = `KTA_OSIS_${identity.singkatan}_${cardOrientation.toUpperCase()}`;
      const zipFolder = zip.folder(folderName) || zip;

      // Iterasi seluruh anggota dalam daftar aktif
      for (let i = 0; i < filteredList.length; i++) {
        const m = filteredList[i];
        setZipProgress({
          current: i + 1,
          total: filteredList.length,
          memberName: m.nama,
          percent: Math.round(((i + 1) / filteredList.length) * 100),
        });
        setZipStatusText(`Memproses kartu ${i + 1} dari ${filteredList.length}: ${m.nama}...`);

        // Mount anggota ke offscreen worker element
        setWorkerMember(m);
        // Beri jeda agar React render DOM offscreen beserta gambar & QR Code
        await new Promise((r) => setTimeout(r, 80));

        const frontEl = document.getElementById('zip-worker-card-front');
        const backEl = document.getElementById('zip-worker-card-back');

        const prefix = `${String(i + 1).padStart(3, '0')}_${m.nama.replace(/[^a-zA-Z0-9]/g, '_')}`;

        if (frontEl) {
          const frontDataUrl = await toJpeg(frontEl, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            skipFonts: true,
          });
          const frontBase64 = frontDataUrl.split(',')[1];
          zipFolder.file(`${prefix}_DEPAN.jpg`, frontBase64, { base64: true });
        }

        if (backEl) {
          const backDataUrl = await toJpeg(backEl, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            skipFonts: true,
          });
          const backBase64 = backDataUrl.split(',')[1];
          zipFolder.file(`${prefix}_BELAKANG.jpg`, backBase64, { base64: true });
        }
      }

      // Tambahkan berkas dokumentasi resmi di dalam ZIP
      const readmeDoc = `===================================================================
ARSIP RESMI KARTU TANDA ANGGOTA (KTA) OSIS
${identity.namaSekolah.toUpperCase()}
===================================================================
• NPSN Sekolah     : ${identity.npsn}
• Alamat Kampus    : ${identity.alamat}
• Pembina OSIS     : Ilham Arief, S.Pd. (NIP. 198504122011011008)
• Format Kartu     : ${cardOrientation.toUpperCase()} (Standard PVC & Lanyard)
• Total Anggota    : ${filteredList.length} Siswa Pengurus
• Waktu Ekspor     : ${new Date().toLocaleString('id-ID')}
• Isi Paket ZIP    : Setiap anggota memiliki 2 berkas foto (Sisi DEPAN dan BELAKANG)

PETUNJUK PENCETAKAN:
1. Berkas gambar JPEG ini siap dicetak langsung pada printer kartu PVC ID Card
   maupun kertas foto glossy premium (tebal 230-260 gsm).
2. Terdapat QR Code verifikasi digital aktif pada sisi depan kartu.
3. Desain memuat logo resmi sekolah di kop dan tanda tangan basah Pembina OSIS.
===================================================================`;

      zipFolder.file('INFORMASI_KTA_RESMI.txt', readmeDoc);

      setZipStatusText('Mengompresi seluruh gambar ke berkas .ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipStatusText(`Mengompresi berkas ZIP: ${metadata.percent.toFixed(0)}%`);
      });

      const zipFileName = `KTA_OSIS_${identity.singkatan}_${cardOrientation.toUpperCase()}_SEMUA_GAMBAR.zip`;
      saveAs(zipBlob, zipFileName);
      setZipStatusText('Pengunduhan ZIP Selesai!');
    } catch (err) {
      console.error('Error generating all cards ZIP:', err);
      alert('Terjadi kesalahan saat memproses paket ZIP gambar KTA.');
    } finally {
      setTimeout(() => {
        setIsGeneratingZip(false);
        setWorkerMember(null);
        setZipStatusText('');
      }, 1200);
    }
  };

  // Determine Background & Styling Classes based on Theme Preset
  const getThemeStyles = (isFront: boolean = true) => {
    const customImg = isFront ? customFrontBg : customBackBg;

    if (customImg) {
      return {
        isCustom: true,
        bgImgUrl: customImg,
        overlayColor: textColorMode === 'light' ? `rgba(10, 15, 30, ${overlayOpacity / 100})` : `rgba(255, 255, 255, ${overlayOpacity / 100})`,
        textClass: textColorMode === 'light' ? 'text-white' : 'text-slate-950 font-bold',
        subtextClass: textColorMode === 'light' ? 'text-slate-200' : 'text-slate-700 font-semibold',
        badgeBg: textColorMode === 'light' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-800 text-white font-black',
        borderColor: textColorMode === 'light' ? 'border-white/30' : 'border-slate-400',
        pembinaColor: textColorMode === 'light' ? 'text-white' : 'text-slate-950 font-black',
      };
    }

    switch (themePreset) {
      case 'emerald-gold': // Official SMK Tridharma Emerald Green & Gold
        return {
          isCustom: false,
          bgClass: isFront 
            ? 'bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 text-white' 
            : 'bg-white text-slate-900 border-2 border-slate-300',
          overlayColor: 'transparent',
          textClass: isFront ? 'text-white' : 'text-slate-900',
          subtextClass: isFront ? 'text-emerald-200' : 'text-slate-600',
          badgeBg: isFront ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-700 text-white font-bold',
          borderColor: isFront ? 'border-amber-400/40' : 'border-slate-300',
          pembinaColor: isFront ? 'text-amber-300' : 'text-slate-900',
        };
      case 'navy-sapphire':
        return {
          isCustom: false,
          bgClass: isFront
            ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 text-white'
            : 'bg-white text-slate-900 border-2 border-slate-300',
          overlayColor: 'transparent',
          textClass: isFront ? 'text-white' : 'text-slate-900',
          subtextClass: isFront ? 'text-indigo-200' : 'text-slate-600',
          badgeBg: isFront ? 'bg-sky-400 text-slate-950 font-black' : 'bg-indigo-700 text-white font-bold',
          borderColor: isFront ? 'border-sky-400/40' : 'border-slate-300',
          pembinaColor: isFront ? 'text-sky-300' : 'text-slate-900',
        };
      case 'dark-titanium':
        return {
          isCustom: false,
          bgClass: isFront
            ? 'bg-gradient-to-br from-black via-zinc-950 to-neutral-900 text-white'
            : 'bg-zinc-950 text-zinc-100 border border-zinc-700',
          overlayColor: 'transparent',
          textClass: 'text-white',
          subtextClass: 'text-zinc-300',
          badgeBg: 'bg-amber-400 text-slate-950 font-black',
          borderColor: 'border-zinc-700',
          pembinaColor: 'text-amber-300',
        };
      case 'clean-white':
        return {
          isCustom: false,
          bgClass: 'bg-white text-slate-900 border-2 border-slate-300',
          overlayColor: 'transparent',
          textClass: 'text-slate-900 font-bold',
          subtextClass: 'text-slate-700 font-medium',
          badgeBg: 'bg-emerald-700 text-white font-bold',
          borderColor: 'border-slate-300',
          pembinaColor: 'text-slate-950 font-black',
        };
      default:
        return {
          isCustom: false,
          bgClass: isFront
            ? 'bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 text-white'
            : 'bg-white text-slate-900 border-2 border-slate-300',
          overlayColor: 'transparent',
          textClass: isFront ? 'text-white' : 'text-slate-900',
          subtextClass: isFront ? 'text-emerald-200' : 'text-slate-600',
          badgeBg: isFront ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-700 text-white font-bold',
          borderColor: isFront ? 'border-amber-400/40' : 'border-slate-300',
          pembinaColor: isFront ? 'text-amber-300' : 'text-slate-900',
        };
    }
  };

  const frontTheme = getThemeStyles(true);
  const backTheme = getThemeStyles(false);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Print Style Injector */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #kta-printable-area, #kta-printable-area * {
            visibility: visible !important;
          }
          #kta-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-6xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 border-b border-emerald-900/40 flex items-start justify-between no-print">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-semibold">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>PERCETAKAN IDENTITAS · KARTU TANDA ANGGOTA (KTA) OSIS</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight flex flex-wrap items-center gap-2.5">
              <span>Kartu Tanda Anggota (KTA) {identity.namaSekolah}</span>
              <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                SIAP UNDUH PDF & CETAK
              </span>
            </h3>
            <p className="text-xs text-emerald-200/90 max-w-2xl leading-relaxed">
              Pilihan orientasi <strong>Landscape & Portrait</strong> dengan tipografi terbaca jelas, fitur upload desain kustom dari komputer, dan unduh PDF resmi secara langsung.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download ALL as ZIP */}
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={isGeneratingZip || isGeneratingPdf}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title={`Unduh semua kartu (${filteredList.length} siswa) dalam berkas arsip .ZIP berisi gambar JPG depan & belakang`}
            >
              <FolderArchive className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh Gambar Semua (ZIP)</span>
              <span className="sm:hidden">ZIP</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isGeneratingZip}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Unduh langsung file PDF resmi A4 siap cetak"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{pdfProgressMsg || 'Menyusun PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Unduh PDF A4</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>

            {/* Browser Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-slate-700"
              title="Cetak via dialog browser"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master Control Bar: Orientation Toggle, Custom Design Drawer, View Mode & Filters */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 space-y-3 no-print">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            {/* Left: Orientation Selector & View Mode */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Orientation Buttons */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCardOrientation('portrait')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    cardOrientation === 'portrait'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                  }`}
                  title="Format Vertikal (Lanyard Badge 54mm × 85.6mm) - Teks Besar & Jelas"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Portrait (Vertikal)</span>
                  <span className="text-[9px] bg-emerald-950/40 px-1 rounded font-mono">Besar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardOrientation('landscape')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    cardOrientation === 'landscape'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                  }`}
                  title="Format Horisontal (Standard PVC CR80 85.6mm × 54mm)"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Landscape (Horisontal)</span>
                </button>
              </div>

              {/* View Mode: Individual vs Batch A4 */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('individual')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'individual'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Kartu Tunggal HD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('batch_a4')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'batch_a4'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Lembar A4 Semua ({filteredList.length})</span>
                </button>
              </div>
            </div>

            {/* Right: Custom Design Trigger & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCustomDesignDrawer(!showCustomDesignDrawer)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showCustomDesignDrawer || customFrontBg
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Upload Desain Sendiri</span>
                {customFrontBg && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>

              {/* Search */}
              <div className="relative min-w-[140px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa / NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-600 outline-none text-slate-800"
                />
              </div>

              {/* Filter 7 Kelas Resmi */}
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:border-emerald-600 outline-none cursor-pointer"
              >
                <option value="semua">Semua 7 Kelas</option>
                {DAFTAR_KELAS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CUSTOM DESIGN & BACKGROUND UPLOAD DRAWER (Direct & Robust) */}
          {showCustomDesignDrawer && (
            <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-md space-y-4 animate-in slide-in-from-top-2 duration-150">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-600" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      Kustomisasi Desain KTA (Upload Background Depan & Belakang)
                    </h5>
                    <p className="text-xs text-slate-500">
                      Unggah gambar kartu buatan Canva / Corel / Photoshop Anda (PNG, JPG, JPEG) atau gunakan tema resmi sekolah.
                    </p>
                  </div>
                </div>

                {customFrontBg && (
                  <button
                    type="button"
                    onClick={handleResetCustomBg}
                    className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ke Desain Bawaan</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* 1. Direct Upload Buttons with Live Thumbnails */}
                <div className="md:col-span-6 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                    Unggah Gambar Desain Kustom:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Front Bg Upload */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Background Sisi Depan</span>
                        {customFrontBg && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>

                      {customFrontBg ? (
                        <div className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden border border-emerald-400 shadow-xs">
                          <img
                            src={customFrontBg}
                            alt="Front Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomFrontBg(null)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-xs cursor-pointer"
                            title="Hapus Desain Depan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full aspect-[1.586/1] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                          <Upload className="w-6 h-6 mb-1 text-slate-400" />
                          <span className="text-[10px]">Belum ada gambar</span>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={frontBgInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleUploadFrontBg}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => frontBgInputRef.current?.click()}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{customFrontBg ? 'Ganti Desain Depan' : 'Pilih Gambar Depan'}</span>
                      </button>
                    </div>

                    {/* Back Bg Upload */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Background Sisi Belakang</span>
                        {customBackBg && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>

                      {customBackBg ? (
                        <div className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden border border-emerald-400 shadow-xs">
                          <img
                            src={customBackBg}
                            alt="Back Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomBackBg(null)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-xs cursor-pointer"
                            title="Hapus Desain Belakang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full aspect-[1.586/1] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                          <Upload className="w-6 h-6 mb-1 text-slate-400" />
                          <span className="text-[10px]">Opsional (Default putih)</span>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={backBgInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleUploadBackBg}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => backBgInputRef.current?.click()}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{customBackBg ? 'Ganti Desain Belakang' : 'Pilih Gambar Belakang'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Theme Presets & Contrast Adjustments */}
                <div className="md:col-span-6 space-y-3 border-t md:border-t-0 md:border-l border-slate-200 md:pl-5">
                  <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                    Pengaturan Warna & Keterbacaan Teks:
                  </label>

                  <div className="space-y-3">
                    {/* Contrast Tint Overlay Slider */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Lapisan Pelindung Teks (Dark/Light Overlay):</span>
                        <span className="font-mono text-emerald-700 font-bold">{overlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Geser untuk menggelapkan / menerangkan latar agar nama dan QR Code terbaca 100% tajam.
                      </p>
                    </div>

                    {/* Text mode */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Warna Tulisan:</span>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setTextColorMode('light')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            textColorMode === 'light' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Teks Putih / Emas
                        </button>
                        <button
                          type="button"
                          onClick={() => setTextColorMode('dark')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            textColorMode === 'dark' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Teks Gelap / Hitam
                        </button>
                      </div>
                    </div>

                    {/* Preset Themes */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Atau Gunakan Tema Resmi Bawaan:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setThemePreset('emerald-gold');
                            setCustomFrontBg(null);
                            setTextColorMode('light');
                          }}
                          className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                            themePreset === 'emerald-gold' && !customFrontBg
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-700 shrink-0" />
                          <span>Hijau-Emas (Tridharma)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setThemePreset('navy-sapphire');
                            setCustomFrontBg(null);
                            setTextColorMode('light');
                          }}
                          className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                            themePreset === 'navy-sapphire' && !customFrontBg
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-2xs'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-indigo-700 shrink-0" />
                          <span>Biru Safir Elegan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          {viewMode === 'individual' ? (
            /* ========================================================
               INDIVIDUAL VIEW MODE: High-Definition Single Card
               ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Member Selector List (Left Sidebar on desktop) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2 no-print">
                <div className="flex items-center justify-between px-2 pt-1 pb-1">
                  <span className="text-xs font-bold text-slate-900">
                    Pilih Pengurus ({filteredList.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Pratinjau KTA</span>
                </div>

                <div className="max-h-[520px] overflow-y-auto space-y-1.5 pr-1">
                  {filteredList.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        selectedMemberId === m.id
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={m.fotoUrl}
                          alt={m.nama}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="truncate">
                          <div className="text-xs truncate font-bold">{m.nama}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">
                            {m.kelas} · {m.jabatan}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Card HD Preview (Right Side) */}
              <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-6">
                {currentMember && (
                  <div className="w-full flex flex-col items-center space-y-4">
                    {/* Quick Single Card Action Bar */}
                    <div className="w-full max-w-[490px] flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs no-print">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Unduh Gambar {currentMember.nama.split(' ')[0]}:</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleCardImage('front')}
                          disabled={isGeneratingSingleImg}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Unduh gambar JPG kartu sisi depan"
                        >
                          <ImageIcon className="w-3 h-3 text-slate-500" />
                          <span>Depan (JPG)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleCardImage('back')}
                          disabled={isGeneratingSingleImg}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Unduh gambar JPG kartu sisi belakang"
                        >
                          <ImageIcon className="w-3 h-3 text-slate-500" />
                          <span>Belakang (JPG)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadAllZip}
                          disabled={isGeneratingZip}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Unduh semua kartu siswa dalam 1 file ZIP"
                        >
                          <FolderArchive className="w-3.5 h-3.5 text-indigo-600" />
                          <span>ZIP Semua ({filteredList.length})</span>
                        </button>
                      </div>
                    </div>

                    <div id="kta-printable-area" ref={printableAreaRef} className="w-full flex flex-col items-center space-y-6">
                    {/* 
                      ===========================================================
                      1. PORTRAIT CARD (VERTIKAL 54mm × 85.6mm) - ENLARGED CRISP TYPOGRAPHY
                      ===========================================================
                    */}
                    {cardOrientation === 'portrait' && (
                      <div className="w-full flex flex-col items-center space-y-6">
                        {/* PORTRAIT FRONT */}
                        <div
                          id="single-card-front"
                          className={`relative w-full max-w-[370px] aspect-[0.63/1] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 flex flex-col justify-between p-5 select-none print-card-break transition-all ${
                            frontTheme.bgClass || 'bg-slate-950'
                          }`}
                        >
                          {/* Custom Image or Default Background */}
                          {customFrontBg ? (
                            <>
                              <img
                                src={customFrontBg}
                                alt="Custom Front"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                              />
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: frontTheme.overlayColor }}
                              />
                            </>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-slate-950 to-teal-950 opacity-95"></div>
                              <div
                                className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{
                                  backgroundImage: `radial-gradient(circle at 50% 15%, #10b981 0%, transparent 55%), radial-gradient(circle at 50% 85%, #d97706 0%, transparent 55%)`,
                                }}
                              ></div>
                              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl"></div>
                            </>
                          )}

                          {/* Top: Header & School Logo with ENLARGED TEXT */}
                          <div
                            className={`relative z-10 flex flex-col items-center text-center border-b pb-2.5 ${frontTheme.borderColor}`}
                          >
                            <div className="w-13 h-13 rounded-2xl bg-white/95 border-2 border-amber-400/60 p-1 flex items-center justify-center overflow-hidden shadow-md mb-1.5 shrink-0">
                              {identity.logoUrl ? (
                                <img
                                  src={identity.logoUrl}
                                  alt="Logo Sekolah"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <School className="w-8 h-8 text-emerald-700" />
                              )}
                            </div>
                            <div className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-black">
                              KARTU TANDA ANGGOTA RESMI
                            </div>
                            <div
                              className={`text-sm sm:text-base font-black tracking-tight uppercase leading-tight mt-0.5 ${frontTheme.textClass}`}
                            >
                              OSIS {identity.namaSekolah}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase font-black tracking-wider ${frontTheme.badgeBg}`}
                              >
                                ANGGOTA AKTIF
                              </span>
                              <span className={`text-[10px] font-mono font-bold ${frontTheme.subtextClass}`}>
                                {currentMember.noKta}
                              </span>
                            </div>
                          </div>

                          {/* Center: Member Photo & Primary Identification with ENLARGED TEXT */}
                          <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-2.5 py-1">
                            {/* Member Photo Frame */}
                            <div className="relative w-28 h-35 rounded-2xl overflow-hidden border-3 border-amber-400 shadow-xl bg-slate-900">
                              <img
                                src={currentMember.fotoUrl}
                                alt={currentMember.nama}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 inset-x-0 bg-emerald-900/95 text-[8.5px] text-center font-black py-0.5 text-emerald-200 uppercase tracking-wider">
                                VERIFIED MEMBER
                              </div>
                            </div>

                            {/* Name & Role (Substantially Enlarged) */}
                            <div className="space-y-1 w-full px-1">
                              <div
                                className={`text-base sm:text-lg font-black tracking-tight uppercase leading-tight line-clamp-2 ${frontTheme.textClass}`}
                              >
                                {currentMember.nama}
                              </div>
                              <div className="text-xs sm:text-[13px] font-bold text-amber-300 tracking-tight">
                                {currentMember.jabatan}
                              </div>
                            </div>

                            {/* Class & NISN Badges */}
                            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full text-xs font-mono font-bold">
                              <span className="bg-amber-400/25 text-amber-200 border border-amber-400/40 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                {currentMember.kelas}
                              </span>
                              <span className="bg-black/40 text-slate-200 border border-white/20 px-2.5 py-0.5 rounded-lg">
                                NISN: {currentMember.nisn}
                              </span>
                            </div>
                          </div>

                          {/* Bottom: QR Code & Pembina Signature with ENLARGED READABLE TEXT */}
                          <div
                            className={`relative z-10 flex items-center justify-between pt-2.5 border-t ${frontTheme.borderColor}`}
                          >
                            {/* QR Code */}
                            <div className="flex items-center gap-2">
                              <div className="w-13 h-13 bg-white p-1 rounded-xl border border-slate-700 shrink-0 flex items-center justify-center shadow-sm">
                                {qrCodeDataUrls[currentMember.id] ? (
                                  <img
                                    src={qrCodeDataUrls[currentMember.id]}
                                    alt="QR Code"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <QrCode className="w-9 h-9 text-slate-800" />
                                )}
                              </div>
                              <div
                                className={`text-[8px] leading-tight font-mono text-left ${frontTheme.subtextClass}`}
                              >
                                <div className="font-bold text-amber-300">Scan QR</div>
                                <div>Verifikasi Digital</div>
                              </div>
                            </div>

                            {/* Pembina Signature */}
                            <div className="text-right">
                              <div className={`text-[8.5px] ${frontTheme.subtextClass}`}>
                                Mengetahui, Pembina OSIS
                              </div>
                              <div
                                className={`text-xs font-bold uppercase tracking-tight mt-0.5 ${frontTheme.pembinaColor}`}
                              >
                                <u>Ilham Arief, S.Pd.</u>
                              </div>
                              <div
                                className={`text-[8px] font-mono ${frontTheme.subtextClass}`}
                              >
                                NIP. 198504122011011008
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PORTRAIT BACK */}
                        <div
                          id="single-card-back"
                          className={`relative w-full max-w-[370px] aspect-[0.63/1] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 flex flex-col justify-between p-5 select-none print-card-break transition-all ${
                            backTheme.bgClass || 'bg-white text-slate-900'
                          }`}
                        >
                          {customBackBg ? (
                            <>
                              <img
                                src={customBackBg}
                                alt="Custom Back"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                              />
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: backTheme.overlayColor }}
                              />
                            </>
                          ) : null}

                          {/* Header with Logo */}
                          <div
                            className={`relative z-10 flex items-center justify-center gap-2.5 border-b pb-2 ${backTheme.borderColor}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-300 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {identity.logoUrl ? (
                                <img src={identity.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
                              ) : (
                                <School className="w-5 h-5 text-emerald-700" />
                              )}
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-black uppercase tracking-tight text-emerald-950">
                                IKRAR & TATA TERTIB PENGURUS OSIS
                              </div>
                              <div className="text-[9px] font-mono text-slate-500 font-bold">
                                {identity.namaSekolah.toUpperCase()}
                              </div>
                            </div>
                          </div>

                          <div className="relative z-10 text-[9.5px] text-slate-700 space-y-2 my-auto leading-relaxed">
                            <div className="font-bold text-slate-950 text-center text-[10.5px]">
                              5 Janji Kehormatan Pengurus OSIS:
                            </div>
                            <ol className="list-decimal pl-4 space-y-1 text-slate-800 font-medium">
                              <li>Bertaqwa kepada Tuhan Yang Maha Esa.</li>
                              <li>Menjadi teladan kedisiplinan kejuruan Asisten Keperawatan & Farmasi.</li>
                              <li>Melaksanakan amanah kepengurusan dengan integritas dan loyalitas penuh.</li>
                              <li>Menjunjung tinggi nama baik almamater SMK Tridharma Gorontalo.</li>
                              <li>Mematuhi bimbingan Pembina OSIS serta dewan guru.</li>
                            </ol>
                            <p className="text-[8.5px] text-slate-500 italic pt-1 text-center">
                              Kartu ini sah & wajib dibawa pada setiap kegiatan dinas kepengurusan OSIS.
                            </p>
                          </div>

                          <div
                            className={`relative z-10 border-t pt-2 text-center text-[8.5px] text-slate-600 font-mono space-y-0.5 ${backTheme.borderColor}`}
                          >
                            <div>Sekretariat: Kampus SMK Tridharma Gorontalo</div>
                            <div>Masa Berlaku: Periode Resmi 2025/2026</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 
                      ===========================================================
                      2. LANDSCAPE CARD (HORISONTAL 85.6mm × 54mm)
                      ===========================================================
                    */}
                    {cardOrientation === 'landscape' && (
                      <div className="w-full flex flex-col items-center space-y-6">
                        {/* LANDSCAPE FRONT */}
                        <div
                          id="single-card-front"
                          className={`relative w-full max-w-[490px] aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 flex flex-col justify-between p-5 select-none print-card-break transition-all ${
                            frontTheme.bgClass || 'bg-slate-950'
                          }`}
                        >
                          {/* Custom Front Bg or Default Guilloche */}
                          {customFrontBg ? (
                            <>
                              <img
                                src={customFrontBg}
                                alt="Custom Front"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                              />
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: frontTheme.overlayColor }}
                              />
                            </>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 opacity-95"></div>
                              <div
                                className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{
                                  backgroundImage: `radial-gradient(circle at 20% 30%, #10b981 0%, transparent 40%), radial-gradient(circle at 80% 70%, #d97706 0%, transparent 40%)`,
                                }}
                              ></div>
                              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl"></div>
                            </>
                          )}

                          {/* Header of Landscape Card */}
                          <div
                            className={`relative z-10 flex items-center justify-between border-b pb-2 ${frontTheme.borderColor}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-white/95 border border-amber-400/50 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                {identity.logoUrl ? (
                                  <img
                                    src={identity.logoUrl}
                                    alt="Logo Sekolah"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <School className="w-6 h-6 text-emerald-700" />
                                )}
                              </div>
                              <div>
                                <div className="text-[9px] font-mono tracking-widest text-amber-300 uppercase font-black">
                                  KARTU TANDA ANGGOTA RESMI
                                </div>
                                <div
                                  className={`text-xs sm:text-sm font-black tracking-tight uppercase leading-tight ${frontTheme.textClass}`}
                                >
                                  OSIS {identity.namaSekolah}
                                </div>
                                <div className={`text-[8.5px] font-medium ${frontTheme.subtextClass}`}>
                                  Masa Bakti Kepengurusan 2025/2026
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-[8.5px] font-mono px-2 py-0.5 rounded font-black uppercase ${frontTheme.badgeBg}`}
                              >
                                AKTIF
                              </span>
                              <div className={`text-[9px] font-mono mt-0.5 font-bold ${frontTheme.subtextClass}`}>
                                {currentMember.noKta}
                              </div>
                            </div>
                          </div>

                          {/* Body of Landscape Card */}
                          <div className="relative z-10 grid grid-cols-12 gap-3.5 my-auto items-center">
                            {/* Member Photo */}
                            <div className="col-span-4 flex flex-col items-center">
                              <div className="relative w-23 h-28 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-900">
                                <img
                                  src={currentMember.fotoUrl}
                                  alt={currentMember.nama}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-emerald-900/90 text-[8px] text-center font-bold py-0.5 text-emerald-200">
                                  VERIFIED
                                </div>
                              </div>
                            </div>

                            {/* Member Info */}
                            <div className="col-span-8 space-y-1 text-left">
                              <div>
                                <span
                                  className={`text-[8.5px] font-mono uppercase block font-bold ${frontTheme.subtextClass}`}
                                >
                                  Nama Lengkap Siswa
                                </span>
                                <div
                                  className={`text-sm sm:text-base font-black tracking-tight uppercase leading-snug line-clamp-1 ${frontTheme.textClass}`}
                                >
                                  {currentMember.nama}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span
                                    className={`text-[8px] font-mono uppercase block font-semibold ${frontTheme.subtextClass}`}
                                  >
                                    NISN
                                  </span>
                                  <span
                                    className={`font-mono font-bold ${frontTheme.textClass}`}
                                  >
                                    {currentMember.nisn}
                                  </span>
                                </div>
                                <div>
                                  <span
                                    className={`text-[8px] font-mono uppercase block font-semibold ${frontTheme.subtextClass}`}
                                  >
                                    Kelas Resmi
                                  </span>
                                  <span className="font-bold text-amber-300 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-400/30">
                                    {currentMember.kelas}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span
                                  className={`text-[8px] font-mono uppercase block font-semibold ${frontTheme.subtextClass}`}
                                >
                                  Jabatan Organisasi
                                </span>
                                <div className="text-xs font-bold text-emerald-300 line-clamp-1">
                                  {currentMember.jabatan}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer of Landscape Card */}
                          <div
                            className={`relative z-10 flex items-end justify-between pt-2 border-t ${frontTheme.borderColor}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-11 h-11 bg-white p-0.5 rounded-lg border border-slate-700 shrink-0 flex items-center justify-center">
                                {qrCodeDataUrls[currentMember.id] ? (
                                  <img
                                    src={qrCodeDataUrls[currentMember.id]}
                                    alt="QR Code"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <QrCode className="w-8 h-8 text-slate-800" />
                                )}
                              </div>
                              <div
                                className={`text-[8px] leading-tight font-mono ${frontTheme.subtextClass}`}
                              >
                                <div>Scan QR untuk</div>
                                <div>Verifikasi Keabsahan</div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`text-[8px] ${frontTheme.subtextClass}`}>
                                Gorontalo, Mengetahui
                              </div>
                              <div className="text-[9px] font-bold text-amber-300">
                                Pembina OSIS
                              </div>
                              <div
                                className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${frontTheme.pembinaColor}`}
                              >
                                <u>Ilham Arief, S.Pd.</u>
                              </div>
                              <div
                                className={`text-[7.5px] font-mono ${frontTheme.subtextClass}`}
                              >
                                NIP. 198504122011011008
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* LANDSCAPE BACK */}
                        <div
                          id="single-card-back"
                          className={`relative w-full max-w-[490px] aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 flex flex-col justify-between p-5 select-none print-card-break transition-all ${
                            backTheme.bgClass || 'bg-white text-slate-900'
                          }`}
                        >
                          {customBackBg ? (
                            <>
                              <img
                                src={customBackBg}
                                alt="Custom Back"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                              />
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ backgroundColor: backTheme.overlayColor }}
                              />
                            </>
                          ) : null}

                          <div
                            className={`relative z-10 border-b pb-2 flex items-center justify-between ${backTheme.borderColor}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-white border border-slate-300 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                {identity.logoUrl ? (
                                  <img src={identity.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
                                ) : (
                                  <School className="w-4 h-4 text-emerald-700" />
                                )}
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold uppercase tracking-tight text-emerald-950">
                                  KETENTUAN & JANJI PENGURUS OSIS
                                </div>
                                <div className="text-[8px] font-mono text-slate-500">
                                  {identity.namaSekolah}
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 font-bold">
                              SISI BELAKANG (PVC)
                            </span>
                          </div>

                          <div className="relative z-10 text-[9px] text-slate-700 space-y-1.5 my-auto leading-relaxed">
                            <div className="font-bold text-slate-950">
                              5 Janji Kehormatan Pengurus OSIS SMK Tridharma:
                            </div>
                            <ol className="list-decimal pl-4 space-y-0.5 text-slate-800 font-medium">
                              <li>Bertaqwa kepada Tuhan Yang Maha Esa dan menjunjung etika moral.</li>
                              <li>Menjadi teladan kedisiplinan dan keahlian vokasi Keperawatan & Farmasi.</li>
                              <li>Melaksanakan program kerja dengan dedikasi penuh dan tanggung jawab.</li>
                              <li>Menjaga martabat dan nama baik almamater SMK Tridharma Gorontalo.</li>
                              <li>Patuh dan taat pada arahan Pembina OSIS serta dewan guru.</li>
                            </ol>
                            <p className="text-[8px] text-slate-500 italic pt-0.5">
                              * Kartu ini sah sebagai identitas anggota pengurus OSIS. Jika menemukan kartu tercecer, harap menyerahkan ke Sekretariat OSIS.
                            </p>
                          </div>

                          <div
                            className={`relative z-10 border-t pt-2 flex items-center justify-between text-[8px] text-slate-500 font-mono ${backTheme.borderColor}`}
                          >
                            <div>Sekretariat: Kampus SMK Tridharma Gorontalo</div>
                            <div>Masa Berlaku: 2025 - 2026</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
            /* ========================================================
               BATCH PRINT A4 MODE: Printable Sheet of All Filtered Cards
               ======================================================== */
            <div id="kta-printable-area" ref={printableAreaRef} className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Lembar Cetak Massal A4 ({filteredList.length} Kartu Siap Diunduh/Cetak)</span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      Format: {cardOrientation}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kartu tersusun rapi dengan garis potong. Klik <strong>Unduh File PDF</strong> untuk menyimpan berkas PDF beresolusi tinggi langsung ke komputer.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isGeneratingZip || isGeneratingPdf}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                    title="Unduh seluruh kartu siswa dalam format berkas ZIP (berisi JPG depan & belakang)"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>Unduh Gambar Semua (ZIP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf || isGeneratingZip}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    <span>Unduh PDF Semua Kartu</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Dialog</span>
                  </button>
                </div>
              </div>

              {/* Grid of cards according to Orientation */}
              {cardOrientation === 'portrait' ? (
                /* PORTRAIT A4: 3 cards per row with LARGE CLEAR TYPOGRAPHY */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-3 bg-white rounded-2xl border border-slate-200">
                  {filteredList.map((m) => (
                    <div
                      key={m.id}
                      className={`relative w-full aspect-[0.63/1] rounded-2xl overflow-hidden border-2 border-dashed border-slate-400 text-white flex flex-col justify-between p-4 print-card-break shadow-xs ${
                        frontTheme.bgClass || 'bg-slate-950'
                      }`}
                    >
                      {/* Background */}
                      {customFrontBg ? (
                        <>
                          <img
                            src={customFrontBg}
                            alt="Custom Front"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ backgroundColor: frontTheme.overlayColor }}
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-slate-950 to-teal-950 opacity-95" />
                      )}

                      {/* Header with Logo */}
                      <div
                        className={`relative z-10 flex items-center gap-2 border-b pb-2 ${frontTheme.borderColor}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-amber-400 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {identity.logoUrl ? (
                            <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <School className="w-4 h-4 text-emerald-700" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-[7.5px] font-mono text-amber-300 uppercase font-black tracking-wider leading-none">
                            KTA RESMI OSIS
                          </div>
                          <div
                            className={`text-[10.5px] font-black uppercase leading-tight truncate mt-0.5 ${frontTheme.textClass}`}
                          >
                            {identity.namaSekolah}
                          </div>
                          <div className={`text-[7.5px] font-mono ${frontTheme.subtextClass}`}>
                            {m.noKta}
                          </div>
                        </div>
                      </div>

                      {/* Photo & Name (Enlarged) */}
                      <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-1.5 py-1">
                        <div className="w-20 h-25 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shadow-md">
                          <img
                            src={m.fotoUrl}
                            alt={m.nama}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div
                          className={`text-xs sm:text-sm font-black uppercase leading-tight line-clamp-2 px-1 ${frontTheme.textClass}`}
                        >
                          {m.nama}
                        </div>
                        <div className="text-[10px] font-bold text-amber-300 line-clamp-1">
                          {m.jabatan}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-400/30">
                            {m.kelas}
                          </span>
                          <span className="text-[8.5px] font-mono bg-black/40 text-slate-200 px-1.5 py-0.5 rounded">
                            {m.nisn}
                          </span>
                        </div>
                      </div>

                      {/* Footer (Enlarged) */}
                      <div
                        className={`relative z-10 flex items-center justify-between pt-1.5 border-t ${frontTheme.borderColor}`}
                      >
                        <div className="w-10 h-10 bg-white p-0.5 rounded-lg border border-slate-700 shrink-0 flex items-center justify-center">
                          {qrCodeDataUrls[m.id] ? (
                            <img
                              src={qrCodeDataUrls[m.id]}
                              alt="QR"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <QrCode className="w-7 h-7 text-slate-800" />
                          )}
                        </div>

                        <div className="text-right">
                          <div className={`text-[7.5px] ${frontTheme.subtextClass}`}>
                            Pembina OSIS
                          </div>
                          <div
                            className={`text-[9px] font-bold uppercase ${frontTheme.pembinaColor}`}
                          >
                            <u>Ilham Arief, S.Pd.</u>
                          </div>
                          <div className={`text-[7px] font-mono ${frontTheme.subtextClass}`}>
                            NIP. 198504122011011008
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* LANDSCAPE A4: 2 cards per row */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded-2xl border border-slate-200">
                  {filteredList.map((m) => (
                    <div
                      key={m.id}
                      className={`relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden border-2 border-dashed border-slate-400 text-white flex flex-col justify-between p-4 print-card-break shadow-xs ${
                        frontTheme.bgClass || 'bg-slate-950'
                      }`}
                    >
                      {customFrontBg ? (
                        <>
                          <img
                            src={customFrontBg}
                            alt="Custom Front"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ backgroundColor: frontTheme.overlayColor }}
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 opacity-95" />
                      )}

                      {/* Header */}
                      <div
                        className={`relative z-10 flex items-center justify-between border-b pb-1.5 ${frontTheme.borderColor}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/95 border border-amber-400/40 p-0.5 flex items-center justify-center shrink-0">
                            {identity.logoUrl ? (
                              <img
                                src={identity.logoUrl}
                                alt="Logo"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <School className="w-4 h-4 text-emerald-700" />
                            )}
                          </div>
                          <div>
                            <div className="text-[7.5px] font-mono text-amber-300 uppercase font-black">
                              KTA RESMI OSIS
                            </div>
                            <div
                              className={`text-[10px] font-black uppercase leading-tight ${frontTheme.textClass}`}
                            >
                              {identity.namaSekolah}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[7.5px] font-mono px-1.5 py-0.2 rounded font-black uppercase ${frontTheme.badgeBg}`}
                          >
                            AKTIF
                          </span>
                          <div className={`text-[7.5px] font-mono mt-0.5 ${frontTheme.subtextClass}`}>
                            {m.noKta}
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="relative z-10 grid grid-cols-12 gap-2.5 my-auto items-center">
                        <div className="col-span-4 flex justify-center">
                          <div className="w-20 h-24 rounded-lg overflow-hidden border border-amber-400 shadow-sm bg-slate-900">
                            <img
                              src={m.fotoUrl}
                              alt={m.nama}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="col-span-8 space-y-0.5 text-left">
                          <div>
                            <span
                              className={`text-[7.5px] font-mono uppercase block ${frontTheme.subtextClass}`}
                            >
                              Nama Lengkap
                            </span>
                            <div
                              className={`text-xs sm:text-sm font-bold uppercase leading-snug line-clamp-1 ${frontTheme.textClass}`}
                            >
                              {m.nama}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[9px]">
                            <div>
                              <span
                                className={`text-[7.5px] font-mono uppercase block ${frontTheme.subtextClass}`}
                              >
                                NISN
                              </span>
                              <span
                                className={`font-mono font-bold ${frontTheme.textClass}`}
                              >
                                {m.nisn}
                              </span>
                            </div>
                            <div>
                              <span
                                className={`text-[7.5px] font-mono uppercase block ${frontTheme.subtextClass}`}
                              >
                                Kelas
                              </span>
                              <span className="font-bold text-amber-300">{m.kelas}</span>
                            </div>
                          </div>

                          <div>
                            <span
                              className={`text-[7.5px] font-mono uppercase block ${frontTheme.subtextClass}`}
                            >
                              Jabatan
                            </span>
                            <div className="text-[10px] font-semibold text-emerald-300 line-clamp-1">
                              {m.jabatan}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        className={`relative z-10 flex items-end justify-between pt-1 border-t ${frontTheme.borderColor}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-9 h-9 bg-white p-0.5 rounded border border-slate-700 shrink-0 flex items-center justify-center">
                            {qrCodeDataUrls[m.id] ? (
                              <img
                                src={qrCodeDataUrls[m.id]}
                                alt="QR"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <QrCode className="w-6 h-6 text-slate-800" />
                            )}
                          </div>
                          <div
                            className={`text-[7px] font-mono ${frontTheme.subtextClass}`}
                          >
                            Verifikasi Digital
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-[7px] ${frontTheme.subtextClass}`}>
                            Pembina OSIS
                          </div>
                          <div
                            className={`text-[8.5px] font-bold uppercase ${frontTheme.pembinaColor}`}
                          >
                            <u>Ilham Arief, S.Pd.</u>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            Total <strong>{filteredList.length} kartu KTA</strong> siap diunduh dalam format PDF, gambar satuan, atau paket ZIP (Orientasi: <strong className="text-emerald-800 uppercase font-mono">{cardOrientation}</strong>).
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={isGeneratingZip || isGeneratingPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              title="Unduh seluruh foto kartu siswa dalam format .ZIP (Depan & Belakang)"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Unduh Semua Gambar (.ZIP)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || isGeneratingZip}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>Unduh File PDF Sekarang</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dialog</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* ZIP GENERATION PROGRESS OVERLAY MODAL */}
      {isGeneratingZip && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <FolderArchive className="w-8 h-8 animate-bounce text-indigo-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Mengemas Semua KTA ke Format ZIP
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {zipStatusText || 'Sedang memproses seluruh gambar kartu...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200 p-0.5">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${zipProgress.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                <span>{zipProgress.current} dari {zipProgress.total} Siswa</span>
                <span className="text-indigo-600 font-black">{zipProgress.percent}%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-left space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Isi Paket Berkas ZIP:</span>
              </div>
              <p>Setiap anggota akan memiliki 2 foto JPEG kualitas HD (Sisi Depan & Belakang) lengkap dengan kop, logo, dan QR Code resmi.</p>
            </div>
          </div>
        </div>
      )}

      {/* OFFSCREEN ZIP EXPORT WORKER (Hidden offscreen DOM element) */}
      {workerMember && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: cardOrientation === 'portrait' ? '370px' : '490px',
            opacity: 1,
            pointerEvents: 'none',
            zIndex: -999,
          }}
        >
          {cardOrientation === 'portrait' ? (
            <div className="space-y-6">
              {/* Worker Portrait Front */}
              <div
                id="zip-worker-card-front"
                className={`relative w-[370px] aspect-[0.63/1] rounded-3xl overflow-hidden p-5 flex flex-col justify-between border-2 border-slate-800 ${
                  frontTheme.bgClass || 'bg-slate-950'
                }`}
              >
                {customFrontBg ? (
                  <>
                    <img
                      src={customFrontBg}
                      alt="Custom Front"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: frontTheme.overlayColor }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-slate-950 to-teal-950 opacity-95" />
                )}

                {/* Header with Logo */}
                <div className={`relative z-10 flex flex-col items-center text-center border-b pb-2.5 ${frontTheme.borderColor}`}>
                  <div className="w-13 h-13 rounded-2xl bg-white border-2 border-amber-400/70 p-1 flex items-center justify-center overflow-hidden mb-1.5 shadow-md">
                    {identity.logoUrl ? (
                      <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <School className="w-8 h-8 text-emerald-700" />
                    )}
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-black">
                    KARTU TANDA ANGGOTA RESMI
                  </div>
                  <div className={`text-sm font-black uppercase leading-tight mt-0.5 ${frontTheme.textClass}`}>
                    OSIS {identity.namaSekolah}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase font-black ${frontTheme.badgeBg}`}>
                      ANGGOTA AKTIF
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${frontTheme.subtextClass}`}>
                      {workerMember.noKta}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-2 py-1">
                  <div className="w-28 h-35 rounded-2xl overflow-hidden border-3 border-amber-400 bg-slate-900 shadow-xl">
                    <img src={workerMember.fotoUrl} alt={workerMember.nama} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5 w-full px-1">
                    <div className={`text-base font-black uppercase leading-tight line-clamp-2 ${frontTheme.textClass}`}>
                      {workerMember.nama}
                    </div>
                    <div className="text-xs font-bold text-amber-300">
                      {workerMember.jabatan}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                    <span className="bg-amber-400/25 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-lg">
                      {workerMember.kelas}
                    </span>
                    <span className="bg-black/40 text-slate-200 border border-white/20 px-2 py-0.5 rounded-lg">
                      NISN: {workerMember.nisn}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className={`relative z-10 flex items-center justify-between pt-2.5 border-t ${frontTheme.borderColor}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-13 h-13 bg-white p-1 rounded-xl border border-slate-700 flex items-center justify-center">
                      {qrCodeDataUrls[workerMember.id] ? (
                        <img src={qrCodeDataUrls[workerMember.id]} alt="QR" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="w-9 h-9 text-slate-800" />
                      )}
                    </div>
                    <div className={`text-[8px] leading-tight font-mono text-left ${frontTheme.subtextClass}`}>
                      <div className="font-bold text-amber-300">Scan QR</div>
                      <div>Verifikasi Digital</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[8.5px] ${frontTheme.subtextClass}`}>Mengetahui, Pembina OSIS</div>
                    <div className={`text-xs font-bold uppercase mt-0.5 ${frontTheme.pembinaColor}`}>
                      <u>Ilham Arief, S.Pd.</u>
                    </div>
                    <div className={`text-[8px] font-mono ${frontTheme.subtextClass}`}>NIP. 198504122011011008</div>
                  </div>
                </div>
              </div>

              {/* Worker Portrait Back */}
              <div
                id="zip-worker-card-back"
                className={`relative w-[370px] aspect-[0.63/1] rounded-3xl overflow-hidden p-5 flex flex-col justify-between border-2 border-slate-800 ${
                  backTheme.bgClass || 'bg-white text-slate-900'
                }`}
              >
                {customBackBg ? (
                  <>
                    <img src={customBackBg} alt="Custom Back" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ backgroundColor: backTheme.overlayColor }} />
                  </>
                ) : null}

                {/* Header with Logo */}
                <div className={`relative z-10 flex items-center justify-center gap-2.5 border-b pb-2 ${backTheme.borderColor}`}>
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-300 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                    {identity.logoUrl ? (
                      <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <School className="w-5 h-5 text-emerald-700" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-tight text-emerald-950">
                      IKRAR & TATA TERTIB PENGURUS OSIS
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 font-bold">
                      {identity.namaSekolah.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-[9.5px] text-slate-700 space-y-2 my-auto leading-relaxed">
                  <div className="font-bold text-slate-950 text-center text-[10.5px]">5 Janji Kehormatan Pengurus OSIS:</div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-800 font-medium">
                    <li>Bertaqwa kepada Tuhan Yang Maha Esa.</li>
                    <li>Menjadi teladan kedisiplinan kejuruan Asisten Keperawatan & Farmasi.</li>
                    <li>Melaksanakan amanah kepengurusan dengan integritas dan loyalitas penuh.</li>
                    <li>Menjunjung tinggi nama baik almamater SMK Tridharma Gorontalo.</li>
                    <li>Mematuhi bimbingan Pembina OSIS serta dewan guru.</li>
                  </ol>
                  <p className="text-[8.5px] text-slate-500 italic pt-1 text-center">
                    Kartu ini sah & wajib dibawa pada setiap kegiatan dinas kepengurusan OSIS.
                  </p>
                </div>

                <div className={`relative z-10 border-t pt-2 text-center text-[8.5px] text-slate-600 font-mono space-y-0.5 ${backTheme.borderColor}`}>
                  <div>Sekretariat: Kampus SMK Tridharma Gorontalo</div>
                  <div>Masa Berlaku: Periode Resmi 2025/2026</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Worker Landscape Front */}
              <div
                id="zip-worker-card-front"
                className={`relative w-[490px] aspect-[1.586/1] rounded-2xl overflow-hidden p-5 flex flex-col justify-between border-2 border-slate-800 ${
                  frontTheme.bgClass || 'bg-slate-950'
                }`}
              >
                {customFrontBg ? (
                  <>
                    <img src={customFrontBg} alt="Custom Front" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ backgroundColor: frontTheme.overlayColor }} />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 opacity-95" />
                )}

                {/* Header with Logo */}
                <div className={`relative z-10 flex items-center justify-between border-b pb-2 ${frontTheme.borderColor}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-amber-400/50 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      {identity.logoUrl ? (
                        <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <School className="w-6 h-6 text-emerald-700" />
                      )}
                    </div>
                    <div>
                      <div className="text-[9px] font-mono tracking-widest text-amber-300 uppercase font-black">
                        KARTU TANDA ANGGOTA RESMI
                      </div>
                      <div className={`text-sm font-black uppercase leading-tight ${frontTheme.textClass}`}>
                        OSIS {identity.namaSekolah}
                      </div>
                      <div className={`text-[8.5px] font-medium ${frontTheme.subtextClass}`}>
                        Masa Bakti Kepengurusan 2025/2026
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded font-black uppercase ${frontTheme.badgeBg}`}>
                      AKTIF
                    </span>
                    <div className={`text-[9px] font-mono mt-0.5 font-bold ${frontTheme.subtextClass}`}>
                      {workerMember.noKta}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="relative z-10 grid grid-cols-12 gap-3.5 my-auto items-center">
                  <div className="col-span-4 flex justify-center">
                    <div className="w-23 h-28 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shadow-md">
                      <img src={workerMember.fotoUrl} alt={workerMember.nama} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="col-span-8 space-y-1 text-left">
                    <div>
                      <span className={`text-[8.5px] font-mono uppercase block font-bold ${frontTheme.subtextClass}`}>
                        Nama Lengkap Siswa
                      </span>
                      <div className={`text-sm font-black uppercase leading-snug line-clamp-1 ${frontTheme.textClass}`}>
                        {workerMember.nama}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className={`text-[8px] font-mono uppercase block font-semibold ${frontTheme.subtextClass}`}>NISN</span>
                        <span className={`font-mono font-bold ${frontTheme.textClass}`}>{workerMember.nisn}</span>
                      </div>
                      <div>
                        <span className={`text-[8px] font-mono uppercase block font-semibold ${frontTheme.subtextClass}`}>Kelas</span>
                        <span className="font-bold text-amber-300">{workerMember.kelas}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[8px] font-mono uppercase block font-semibold ${frontTheme.subtextClass}`}>Jabatan Organisasi</span>
                      <div className="text-xs font-bold text-emerald-300 line-clamp-1">{workerMember.jabatan}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`relative z-10 flex items-end justify-between pt-2 border-t ${frontTheme.borderColor}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-11 h-11 bg-white p-0.5 rounded-lg border border-slate-700 flex items-center justify-center">
                      {qrCodeDataUrls[workerMember.id] ? (
                        <img src={qrCodeDataUrls[workerMember.id]} alt="QR" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="w-8 h-8 text-slate-800" />
                      )}
                    </div>
                    <div className={`text-[8px] leading-tight font-mono ${frontTheme.subtextClass}`}>
                      <div>Scan QR Verifikasi</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[8px] ${frontTheme.subtextClass}`}>Mengetahui Pembina OSIS</div>
                    <div className={`text-[10px] font-bold uppercase mt-0.5 ${frontTheme.pembinaColor}`}>
                      <u>Ilham Arief, S.Pd.</u>
                    </div>
                    <div className={`text-[7.5px] font-mono ${frontTheme.subtextClass}`}>NIP. 198504122011011008</div>
                  </div>
                </div>
              </div>

              {/* Worker Landscape Back */}
              <div
                id="zip-worker-card-back"
                className={`relative w-[490px] aspect-[1.586/1] rounded-2xl overflow-hidden p-5 flex flex-col justify-between border-2 border-slate-800 ${
                  backTheme.bgClass || 'bg-white text-slate-900'
                }`}
              >
                {customBackBg ? (
                  <>
                    <img src={customBackBg} alt="Custom Back" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ backgroundColor: backTheme.overlayColor }} />
                  </>
                ) : null}

                <div className={`relative z-10 border-b pb-2 flex items-center justify-between ${backTheme.borderColor}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-300 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                      {identity.logoUrl ? (
                        <img src={identity.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <School className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold uppercase tracking-tight text-emerald-950">
                        KETENTUAN & JANJI PENGURUS OSIS
                      </div>
                      <div className="text-[8px] font-mono text-slate-500">{identity.namaSekolah}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">SISI BELAKANG (PVC)</span>
                </div>

                <div className="relative z-10 text-[9px] text-slate-700 space-y-1 my-auto leading-relaxed">
                  <div className="font-bold text-slate-950">5 Janji Kehormatan Pengurus OSIS:</div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-800 font-medium">
                    <li>Bertaqwa kepada Tuhan Yang Maha Esa dan menjunjung etika moral.</li>
                    <li>Menjadi teladan kedisiplinan dan keahlian vokasi Keperawatan & Farmasi.</li>
                    <li>Melaksanakan program kerja dengan dedikasi penuh dan tanggung jawab.</li>
                    <li>Menjaga martabat dan nama baik almamater SMK Tridharma Gorontalo.</li>
                    <li>Patuh dan taat pada arahan Pembina OSIS serta dewan guru.</li>
                  </ol>
                </div>

                <div className={`relative z-10 border-t pt-2 flex items-center justify-between text-[8px] text-slate-500 font-mono ${backTheme.borderColor}`}>
                  <div>Sekretariat: Kampus SMK Tridharma Gorontalo</div>
                  <div>Masa Berlaku: 2025 - 2026</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
