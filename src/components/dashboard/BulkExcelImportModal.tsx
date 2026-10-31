import React, { useState, useRef } from 'react';
import { UserAccount, OrgMember, SekbidDefinition } from '../../types/erp';
import { DAFTAR_KELAS, KelasSMK } from '../../data/classList';
import { downloadExcelTemplate, parseExcelFile } from '../../utils/excelTemplateGenerator';
import { parsePastedTableData, ParsedMemberRow } from '../../utils/bulkMemberParser';
import { VOCATIONAL_IMAGE_PRESETS } from '../../data/imagePresets';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Clipboard, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  UserPlus, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  Plus,
  FileCheck,
  Info
} from 'lucide-react';

interface BulkExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts: UserAccount[];
  sekbidList?: SekbidDefinition[];
  schoolName?: string;
  onCommitBulkMembers: (
    newAccounts: Omit<UserAccount, 'id' | 'createdAt'>[],
    newOrgMembers: Omit<OrgMember, 'id'>[]
  ) => void;
}

export const BulkExcelImportModal: React.FC<BulkExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingAccounts,
  sekbidList,
  schoolName = 'SMK Tridharma Gorontalo',
  onCommitBulkMembers,
}) => {
  const [activeInputMethod, setActiveInputMethod] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedMemberRow[]>([]);
  const [isSuccessCommitted, setIsSuccessCommitted] = useState(false);
  const [committedAccounts, setCommittedAccounts] = useState<ParsedMemberRow[]>([]);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const existingUsernames = existingAccounts.map((a) => a.username.toLowerCase());

  // Handle Parse Trigger from Pasted Text
  const handleParse = (textToParse: string) => {
    const rows = parsePastedTableData(textToParse, existingUsernames);
    setParsedRows(rows);
  };

  // Handle Textarea Change & Auto Parse
  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    if (val.trim()) {
      handleParse(val);
    } else {
      setParsedRows([]);
    }
  };

  // Handle Sample Data Insertion for Fast Demo
  const handleLoadSample = () => {
    const sample = `1	Rahmat Hidayatullah	0071234501	XI Askep	Koordinator Sekbid 1 (Ketaqwaan)	L	081234567890	Aktif
2	Nurul Fadhilah	0071234502	XI Farmasi	Anggota Sekbid 1 (Ketaqwaan)	P	081234567891	Aktif
3	Bayu Pratama S.	0071234503	X Askep 1	Koordinator Sekbid 3 (Bela Negara)	L	081234567892	Aktif
4	Siti Azzahra Monoarfa	0071234504	X Askep 2	Anggota Sekbid 4 (Seni & Olahraga)	P	081234567893	Aktif
5	Fadlan Djafar	0071234505	X Farmasi	Anggota Sekbid 8 (TIK & Multimedia)	L	081234567894	Aktif
6	Nadia Syaputri	0071234506	XII Askep	Koordinator Sekbid 7 (Kesehatan & UKS)	P	081234567895	Aktif
7	Reza Aditya	0071234507	XII Farmasi	Anggota Sekbid 6 (Kewirausahaan)	L	081234567896	Aktif`;

    setRawText(sample);
    handleParse(sample);
    setActiveInputMethod('paste');
  };

  // Handle Excel File Upload (.xlsx, .xls, .csv)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsLoadingFile(true);

    try {
      const rows = await parseExcelFile(file, existingUsernames);
      setParsedRows(rows);
    } catch (err) {
      console.error('Gagal membaca file Excel:', err);
      alert('Gagal membaca file Excel. Pastikan format file adalah .xlsx atau .xls.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Delete row from parsed list
  const handleDeleteRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Edit row in parsed list
  const handleUpdateRow = (id: string, field: keyof ParsedMemberRow, value: any) => {
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        return updated;
      })
    );
  };

  // Commit valid members to app state
  const handleCommit = () => {
    const validRows = parsedRows.filter((r) => r.isValid && r.nama.trim().length > 0);
    if (validRows.length === 0) {
      alert('Tidak ada baris data siswa yang valid untuk diimpor.');
      return;
    }

    const newAccounts: Omit<UserAccount, 'id' | 'createdAt'>[] = [];
    const newOrgMembers: Omit<OrgMember, 'id'>[] = [];

    validRows.forEach((row, idx) => {
      // 1. Account
      newAccounts.push({
        fullName: row.nama,
        username: row.suggestedUsername,
        password: row.suggestedPassword,
        role: row.role,
        jabatan: row.jabatan,
        kelas: row.kelas,
        nisn: row.nisn,
        telepon: row.telepon || row.nisn,
        isActive: true,
      });

      // 2. Org Member
      const pengurusPresets = VOCATIONAL_IMAGE_PRESETS.filter((p) => p.category === 'pengurus').map((p) => p.url);
      const fallbackUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
      const fotoUrl = pengurusPresets.length > 0 ? pengurusPresets[idx % pengurusPresets.length] : fallbackUrl;

      newOrgMembers.push({
        nama: row.nama,
        jabatan: row.jabatan,
        kategori: row.kategori,
        kelas: row.kelas,
        fotoUrl,
        kontak: row.telepon || row.nisn,
        peranSekbid: row.peranSekbid,
        sekbidNomor: row.sekbidNomor,
        urutan: idx + 10,
      });
    });

    onCommitBulkMembers(newAccounts, newOrgMembers);
    setCommittedAccounts(validRows);
    setIsSuccessCommitted(true);
  };

  // Copy created accounts summary for WhatsApp share
  const handleCopyCredentialsSummary = () => {
    let summary = `*REKAPITULASI AKUN PENGURUS OSIS ${schoolName.toUpperCase()}*\n`;
    summary += `Total Terdaftar: ${committedAccounts.length} Siswa\n`;
    summary += `Generated: ${new Date().toLocaleDateString('id-ID')}\n`;
    summary += `-------------------------------------------\n\n`;

    committedAccounts.forEach((acc, i) => {
      summary += `${i + 1}. *${acc.nama}*\n`;
      summary += `   • Kelas: ${acc.kelas}\n`;
      summary += `   • Jabatan: ${acc.jabatan}\n`;
      summary += `   • NISN: ${acc.nisn}\n`;
      summary += `   • *Username:* ${acc.suggestedUsername}\n`;
      summary += `   • *Password:* ${acc.suggestedPassword}\n\n`;
    });

    summary += `-------------------------------------------\n`;
    summary += `Harap simpan dan berikan akun ini kepada masing-masing pengurus OSIS secara aman.\n`;
    summary += `Pembina OSIS: Bapak Ilham Arief, S.Pd.`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-6 border-b border-emerald-800/40 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-semibold">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>OTOMASI INPUT MASSAL SISWA · EXCEL TO DATABASE</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2.5">
              <span>Impor Data Pengurus dari Microsoft Excel</span>
              <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                .XLSX TERINTEGRASI
              </span>
            </h3>
            <p className="text-xs text-emerald-200/90 max-w-2xl leading-relaxed">
              Pembina dapat mengisi daftar siswa di Excel atau meng-copy tabel langsung. Sistem secara otomatis mendeteksi 7 kelas resmi, menetapkan jabatan, serta membangkitkan <strong>Username & Password</strong> unik secara instan.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!isSuccessCommitted ? (
            <>
              {/* Step 1: Download Official Excel Template Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <span>Langkah 1: Unduh Template Excel (.xlsx) Resmi</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">
                        DIREKOMENDASIKAN
                      </span>
                    </h4>
                    <p className="text-xs text-emerald-800/80 mt-0.5 max-w-xl leading-relaxed">
                      File spreadsheet berisi 2 sheet: formulir data siap isi dengan panduan 7 kelas resmi (<em>X Askep 1, X Askep 2, X Farmasi, XI Askep, XI Farmasi, XII Askep, XII Farmasi</em>) dan referensi Sekbid 1-8.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadExcelTemplate(schoolName)}
                    className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Template Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Input Method Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Langkah 2: Pilih Metode Masukan Data</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Muat 7 Contoh Siswa Otomatis</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveInputMethod('upload')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      activeInputMethod === 'upload'
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeInputMethod === 'upload'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Upload File Excel (.xlsx / .xls)</div>
                      <div className="text-[11px] text-slate-500">Pilih file spreadsheet yang sudah diisi</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInputMethod('paste')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      activeInputMethod === 'paste'
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activeInputMethod === 'paste'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Clipboard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Copy-Paste Tabel Spreadsheet</div>
                      <div className="text-[11px] text-slate-500">Blok baris di Excel/Sheets lalu paste di sini</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2A: Upload Box */}
              {activeInputMethod === 'upload' && (
                <div className="bg-slate-50 border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-file-upload-input"
                  />
                  <label
                    htmlFor="excel-file-upload-input"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                      {isLoadingFile ? (
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : uploadedFileName ? (
                        <FileCheck className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <Upload className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {uploadedFileName ? (
                          <span className="text-emerald-700">File Terpilih: {uploadedFileName}</span>
                        ) : (
                          'Klik untuk Memilih File Excel (.xlsx / .xls)'
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Sistem langsung memproses baris data siswa dan membuatkan username & password otomatis.
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all">
                      {uploadedFileName ? 'Ganti File Excel' : 'Pilih File Excel Dari Komputer'}
                    </span>
                  </label>
                </div>
              )}

              {/* Step 2B: Paste Box */}
              {activeInputMethod === 'paste' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Tempel (Ctrl+V) baris tabel dari Microsoft Excel di bawah:</span>
                    <span className="font-mono">{parsedRows.length} baris terdeteksi</span>
                  </div>
                  <textarea
                    rows={5}
                    value={rawText}
                    onChange={handlePasteChange}
                    placeholder="Contoh salinan tabel Excel:&#10;1	Rahmat Hidayatullah	0071234501	XI Askep	Koordinator Sekbid 1 (Ketaqwaan)	L	081234567890&#10;2	Nurul Fadhilah	0071234502	XI Farmasi	Anggota Sekbid 1 (Ketaqwaan)	P	081234567891"
                    className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-300 border border-slate-700 rounded-2xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              )}

              {/* Step 3: Parsed Results Table Preview */}
              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Langkah 3: Pratinjau Kredensial Otomatis ({parsedRows.length} Siswa)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Periksa hasil konversi. Username dan Password telah digenerate secara acak dan aman.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {parsedRows.filter((r) => r.isValid).length} Siap Diimpor
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto max-h-[320px]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px] z-10">
                          <tr>
                            <th className="py-2.5 px-3">No</th>
                            <th className="py-2.5 px-3">Nama Lengkap</th>
                            <th className="py-2.5 px-3">Kelas Resmi (7 Jurusan)</th>
                            <th className="py-2.5 px-3">Jabatan & Sekbid</th>
                            <th className="py-2.5 px-3">Username Otomatis</th>
                            <th className="py-2.5 px-3">Password Otomatis</th>
                            <th className="py-2.5 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {parsedRows.map((row, idx) => (
                            <tr
                              key={row.id}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                !row.isValid ? 'bg-rose-50/50' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                <div>{row.nama}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  NISN: {row.nisn} · JK: {row.jenisKelamin}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={row.kelas}
                                  onChange={(e) =>
                                    handleUpdateRow(row.id, 'kelas', e.target.value as KelasSMK)
                                  }
                                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                                >
                                  {DAFTAR_KELAS.map((k) => (
                                    <option key={k} value={k}>
                                      {k}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-medium text-slate-800 block">{row.jabatan}</span>
                                <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1 rounded">
                                  {row.kategori === 'bph'
                                    ? 'BPH'
                                    : row.sekbidNomor
                                    ? `Sekbid #${row.sekbidNomor}`
                                    : 'Sekbid'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold bg-emerald-50/40">
                                @{row.suggestedUsername}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-800 bg-slate-50">
                                {row.suggestedPassword}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(row.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  title="Hapus baris ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* SUCCESS COMMITTED VIEW */
            <div className="space-y-6 py-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-emerald-950">
                  {committedAccounts.length} Akun Pengurus OSIS Berhasil Didaftarkan!
                </h4>
                <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed">
                  Data master dan kredensial akses telah tersimpan. Pengurus kini dapat masuk ke portal resmi OSIS menggunakan akun di bawah ini. Anda juga bisa langsung mencetak Kartu Tanda Anggota (KTA).
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCredentialsSummary}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    {copiedSummary ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSummary ? 'Tersalin ke Clipboard!' : 'Salin Semua Akun (Format WhatsApp)'}</span>
                  </button>
                </div>
              </div>

              {/* Table of committed credentials */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Daftar Kredensial Pengurus Baru</span>
                  <span className="font-mono text-emerald-700">{committedAccounts.length} Akun Aktif</span>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">No</th>
                        <th className="py-2 px-3">Nama</th>
                        <th className="py-2 px-3">Kelas</th>
                        <th className="py-2 px-3">Jabatan</th>
                        <th className="py-2 px-3">Username</th>
                        <th className="py-2 px-3">Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                      {committedAccounts.map((acc, i) => (
                        <tr key={acc.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 font-sans font-bold text-slate-900">{acc.nama}</td>
                          <td className="py-2 px-3 font-sans">{acc.kelas}</td>
                          <td className="py-2 px-3 font-sans">{acc.jabatan}</td>
                          <td className="py-2 px-3 text-emerald-700 font-bold">@{acc.suggestedUsername}</td>
                          <td className="py-2 px-3 text-slate-800 bg-slate-50 font-bold">{acc.suggestedPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isSuccessCommitted
              ? 'Proses impor selesai. Seluruh data telah aktif di sistem.'
              : `${parsedRows.filter((r) => r.isValid).length} calon pengurus siap diaktifkan.`}
          </div>

          <div className="flex items-center gap-2">
            {!isSuccessCommitted ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={parsedRows.filter((r) => r.isValid).length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Simpan & Aktifkan Semua Akun</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Selesai & Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
