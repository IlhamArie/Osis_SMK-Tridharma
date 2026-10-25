import React, { useState } from 'react';
import { SuratDokumen, UserAccount, SchoolIdentityConfig } from '../../types/erp';
import { INITIAL_SCHOOL_IDENTITY } from '../../data/schoolIdentityPresets';
import { downloadSuratDocx } from '../../utils/docxGenerator';
import { 
  FileText, 
  Download, 
  Printer, 
  Plus, 
  CheckCircle, 
  Clock, 
  UploadCloud, 
  Eye, 
  Trash2, 
  ShieldCheck,
  FileCode
} from 'lucide-react';

interface SuratGeneratorProps {
  currentUser: UserAccount;
  suratList: SuratDokumen[];
  schoolIdentity?: SchoolIdentityConfig;
  onAddSurat: (surat: Omit<SuratDokumen, 'id' | 'createdAt'>) => void;
  onUpdateSurat: (surat: SuratDokumen) => void;
  onDeleteSurat: (id: string) => void;
}

export const SuratGenerator: React.FC<SuratGeneratorProps> = ({
  currentUser,
  suratList,
  schoolIdentity,
  onAddSurat,
  onUpdateSurat,
  onDeleteSurat,
}) => {
  const identity = schoolIdentity || INITIAL_SCHOOL_IDENTITY;
  const [activeTab, setActiveTab] = useState<'create' | 'archive'>('create');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [jenisSurat, setJenisSurat] = useState<SuratDokumen['jenisSurat']>('Undangan Kegiatan');
  const [nomorSurat, setNomorSurat] = useState(`045/OSIS-SMK-TD/${new Date().getMonth() + 1}/2026`);
  const [perihal, setPerihal] = useState('Undangan Menghadiri Upacara Pembukaan Classmeeting Vokasi 2026');
  const [tujuan, setTujuan] = useState('Bapak/Ibu Kepala Jurusan & Dewan Guru');
  const [tanggalSurat, setTanggalSurat] = useState('30 September 2026');
  const [namaAcara, setNamaAcara] = useState('Pembukaan Classmeeting dan Expo Karya Vokasi');
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState('Senin, 5 Oktober 2026');
  const [waktuPelaksanaan, setWaktuPelaksanaan] = useState('08.00 - 11.30 WITA');
  const [tempatPelaksanaan, setTempatPelaksanaan] = useState('Lapangan Utama SMK Tridharma Gorontalo');
  const [penandatangan1, setPenandatangan1] = useState('Fachri Ramadhan Monoarfa');
  const [penandatangan2, setPenandatangan2] = useState('Aisyah Putri Djafar');
  const [mengetahui, setMengetahui] = useState('Ilham Arief, S.Pd.');

  // Selected preview in archive
  const [previewSurat, setPreviewSurat] = useState<SuratDokumen | null>(null);

  // Template upload mock feedback
  const [uploadedTemplateName, setUploadedTemplateName] = useState<string | null>(
    'Template_Resmi_Kop_Tridharma_v2.docx'
  );

  // Construct current form object for live preview
  const currentSuratObject: SuratDokumen = {
    id: 'preview-current',
    nomorSurat,
    jenisSurat,
    perihal,
    tujuan,
    tanggalSurat,
    namaAcara,
    tanggalPelaksanaan,
    waktuPelaksanaan,
    tempatPelaksanaan,
    penandatangan1,
    penandatangan2,
    mengetahui,
    status: 'Terbit',
    createdAt: new Date().toISOString().split('T')[0],
  };

  const handleDownloadDocx = async (surat: SuratDokumen) => {
    setIsGenerating(true);
    try {
      await downloadSuratDocx(surat);
    } catch (err) {
      console.error(err);
      alert('Gagal membuat berkas .docx. Silakan coba kembali.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    onAddSurat({
      nomorSurat,
      jenisSurat,
      perihal,
      tujuan,
      tanggalSurat,
      namaAcara,
      tanggalPelaksanaan,
      waktuPelaksanaan,
      tempatPelaksanaan,
      penandatangan1,
      penandatangan2,
      mengetahui,
      status: 'Terbit',
      fileDocxName: `Surat_${nomorSurat.replace(/[\/\\]/g, '_')}.docx`,
    });

    // Auto download docx
    await handleDownloadDocx(currentSuratObject);
    alert('Surat berhasil dibuat, diarsipkan ke database, dan berkas .docx telah diunduh!');
    setActiveTab('archive');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-800/50 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-mono mb-1">
              <FileCode className="w-3.5 h-3.5" />
              <span>DOCUMENT GENERATOR & ARSIP DIGITAL · DOCX RESMI</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Surat-Menyurat Otomatis SMK Tridharma</h2>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Otomasi pembuatan surat resmi berformat Kop Surat SMK Tridharma Gorontalo. Data dimasukkan secara dinamis, langsung menghasilkan berkas <strong>.docx asli</strong> siap cetak dan otomatis tersimpan di arsip digital.
            </p>
          </div>

          {/* Template Info / Upload for Pembina */}
          <div className="p-3 bg-purple-900/60 rounded-xl border border-purple-700/60 text-xs flex items-center gap-3">
            <div>
              <span className="text-[10px] text-purple-300 block font-mono">Template Master:</span>
              <span className="font-semibold text-white truncate max-w-[180px] block">
                {uploadedTemplateName}
              </span>
            </div>
            <label className="cursor-pointer px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded-lg text-white font-medium text-[11px] transition-colors whitespace-nowrap">
              Unggah Baru
              <input
                type="file"
                accept=".docx"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedTemplateName(file.name);
                    alert(`Template dasar baru "${file.name}" berhasil diunggah.`);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'create'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generator Surat Baru & Live Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'archive'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Arsip Digital Persuratan ({suratList.length})</span>
        </button>
      </div>

      {/* TAB 1: GENERATOR & LIVE PREVIEW */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Variabel & Parameter Surat</h3>
              <p className="text-xs text-slate-500">
                Isi rincian kegiatan untuk otomatis menempel ke template surat.
              </p>
            </div>

            <form onSubmit={handleSaveToArchive} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenis Surat</label>
                  <select
                    value={jenisSurat}
                    onChange={(e) => setJenisSurat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Undangan Kegiatan">Undangan Kegiatan</option>
                    <option value="Permohonan Dispensasi">Permohonan Dispensasi</option>
                    <option value="Peminjaman Sarpras">Peminjaman Sarpras</option>
                    <option value="Pemberitahuan Proker">Pemberitahuan Proker</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor Surat</label>
                  <input
                    type="text"
                    required
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Perihal / Hal</label>
                <input
                  type="text"
                  required
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kepada / Tujuan</label>
                  <input
                    type="text"
                    required
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Surat</label>
                  <input
                    type="text"
                    required
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Acara / Agenda</label>
                <input
                  type="text"
                  required
                  value={namaAcara}
                  onChange={(e) => setNamaAcara(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hari & Tanggal Pelaksanaan</label>
                  <input
                    type="text"
                    required
                    value={tanggalPelaksanaan}
                    onChange={(e) => setTanggalPelaksanaan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    required
                    value={waktuPelaksanaan}
                    onChange={(e) => setWaktuPelaksanaan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tempat Pelaksanaan</label>
                <input
                  type="text"
                  required
                  value={tempatPelaksanaan}
                  onChange={(e) => setTempatPelaksanaan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ketua OSIS</label>
                  <input
                    type="text"
                    value={penandatangan1}
                    onChange={(e) => setPenandatangan1(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sekretaris OSIS</label>
                  <input
                    type="text"
                    value={penandatangan2}
                    onChange={(e) => setPenandatangan2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mengetahui: Pembina OSIS</label>
                <input
                  type="text"
                  value={mengetahui}
                  onChange={(e) => setMengetahui(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Memproses Berkas...' : 'Unduh .docx & Simpan Arsip'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview Official Letter Document */}
          <div className="lg:col-span-7 bg-slate-200/80 p-6 rounded-2xl border border-slate-300 flex justify-center">
            {/* Paper Sheet Preview */}
            <div className="bg-white shadow-xl rounded-sm p-8 max-w-xl w-full text-slate-900 font-serif text-[11px] leading-relaxed space-y-4 border border-slate-300/80">
              {/* Kop Surat */}
              <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
                {identity.logoUrl && (
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center p-0.5">
                    <img
                      src={identity.logoUrl}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="text-center flex-1 space-y-0.5">
                  <div className="font-bold text-xs tracking-wider uppercase">{identity.kopSuratBaris1}</div>
                  <div className="font-black text-sm tracking-wide text-slate-950 uppercase">
                    {identity.kopSuratBaris2}
                  </div>
                  <div className="font-bold text-xs tracking-wider text-indigo-900">
                    ORGANISASI SISWA INTRA SEKOLAH (OSIS)
                  </div>
                  <div className="text-[10px] text-slate-600 font-sans">
                    {identity.alamat}
                  </div>
                  <div className="text-[9px] text-slate-500 font-sans">
                    Telp: {identity.telepon} | Pos-el: {identity.email} | Laman: {identity.website}
                  </div>
                </div>
              </div>

              {/* Meta & Date */}
              <div className="flex justify-between items-start pt-1 font-sans text-[11px]">
                <div className="space-y-0.5">
                  <div><strong>Nomor</strong> : {nomorSurat}</div>
                  <div><strong>Lampiran</strong> : 1 (satu) Berkas</div>
                  <div><strong>Perihal</strong> : <u>{perihal}</u></div>
                </div>
                <div className="text-right">
                  Gorontalo, {tanggalSurat}
                </div>
              </div>

              {/* Kepada */}
              <div className="pt-2">
                <div>Kepada Yth.</div>
                <div className="font-bold text-slate-900">{tujuan}</div>
                <div>di Tempat</div>
              </div>

              {/* Isi Surat */}
              <div className="space-y-2 text-justify">
                <p>Dengan hormat,</p>
                <p>
                  Sehubungan dengan akan dilaksanakannya program kerja OSIS SMK Tridharma Gorontalo yaitu kegiatan "<strong>{namaAcara}</strong>", maka bersama surat ini kami mengundang / memohon perkenan Bapak/Ibu/Saudara/i untuk hadir pada:
                </p>

                <div className="pl-6 space-y-0.5 font-sans text-[11px]">
                  <div><strong>Hari/Tanggal</strong> : {tanggalPelaksanaan}</div>
                  <div><strong>Waktu</strong> : {waktuPelaksanaan}</div>
                  <div><strong>Tempat</strong> : {tempatPelaksanaan}</div>
                  <div><strong>Agenda Pokok</strong> : {namaAcara}</div>
                </div>

                <p>
                  Demikian surat ini kami sampaikan. Atas perhatian, dukungan, dan kerja sama yang baik dari Bapak/Ibu/Saudara/i, kami haturkan terima kasih.
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-4 space-y-4 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-700">
                  Pengurus OSIS SMK Tridharma Gorontalo
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div>Ketua OSIS,</div>
                    <div className="h-10"></div>
                    <div className="font-bold underline">{penandatangan1}</div>
                    <div className="text-[10px] text-slate-500 font-sans">NISN. 0068912341</div>
                  </div>
                  <div>
                    <div>Sekretaris OSIS,</div>
                    <div className="h-10"></div>
                    <div className="font-bold underline">{penandatangan2}</div>
                    <div className="text-[10px] text-slate-500 font-sans">NISN. 0071239855</div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-slate-600">Mengetahui,</div>
                  <div className="font-bold text-[11px]">Pembina OSIS SMK Tridharma</div>
                  <div className="h-10"></div>
                  <div className="font-bold underline">{mengetahui}</div>
                  <div className="text-[10px] text-slate-500 font-sans">NIP. 19850412 201101 1 008</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ARSIP SURAT */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Arsip Surat Digital Terpusat</h3>
              <p className="text-xs text-slate-500">
                Seluruh persuratan tersimpan rapi dan dapat diunduh ulang sewaktu-waktu dalam format .docx.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nomor & Tanggal</th>
                    <th className="py-3 px-4">Jenis Surat</th>
                    <th className="py-3 px-4">Perihal & Acara</th>
                    <th className="py-3 px-4">Tujuan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {suratList.map((surat) => (
                    <tr key={surat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {surat.nomorSurat}
                        <div className="text-[11px] text-slate-400 font-sans font-normal">{surat.tanggalSurat}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{surat.jenisSurat}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{surat.perihal}</div>
                        <div className="text-[11px] text-slate-500 truncate">{surat.namaAcara}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{surat.tujuan}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            surat.status === 'Terbit'
                              ? 'bg-emerald-100 text-emerald-800'
                              : surat.status === 'Disetujui Pembina'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {surat.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleDownloadDocx(surat)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1"
                          title="Unduh format .docx"
                        >
                          <Download className="w-3 h-3" />
                          <span>.docx</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus arsip surat ${surat.nomorSurat}?`)) {
                              onDeleteSurat(surat.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Surat"
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
    </div>
  );
};
