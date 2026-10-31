import { saveAs } from 'file-saver';
import { DAFTAR_KELAS } from '../data/classList';

/**
 * Utilitas untuk mengenerate dan mengunduh Dokumen Word (.doc) 
 * Template Resmi Input Massal Anggota & Pengurus OSIS SMK Tridharma Gorontalo
 */
export const downloadWordTemplate = (namaSekolah = 'SMK TRIDHARMA GORONTALO') => {
  const dateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const content = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Template Input Massal Anggota OSIS ${namaSekolah}</title>
<style>
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    color: #1e293b;
    margin: 20mm 15mm 20mm 15mm;
  }
  .kop {
    text-align: center;
    border-bottom: 3px double #0f172a;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .kop h1 {
    font-size: 16pt;
    font-weight: bold;
    color: #1e1b4b;
    margin: 0;
    text-transform: uppercase;
  }
  .kop h2 {
    font-size: 13pt;
    font-weight: bold;
    color: #4338ca;
    margin: 4px 0 0 0;
  }
  .kop p {
    font-size: 9pt;
    color: #64748b;
    margin: 4px 0 0 0;
  }
  .instructions {
    background-color: #f1f5f9;
    border-left: 4px solid #4338ca;
    padding: 10px 14px;
    margin-bottom: 18px;
    font-size: 9.5pt;
  }
  .instructions ol {
    margin: 4px 0 0 18px;
    padding: 0;
  }
  .instructions li {
    margin-bottom: 3px;
  }
  .badge-classes {
    background-color: #e0e7ff;
    color: #3730a3;
    padding: 4px 8px;
    font-weight: bold;
    font-size: 9pt;
    display: inline-block;
    margin-top: 4px;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 9.5pt;
  }
  table.data-table th {
    background-color: #312e81;
    color: #ffffff;
    font-weight: bold;
    padding: 8px 6px;
    border: 1px solid #1e1b4b;
    text-align: center;
  }
  table.data-table td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    vertical-align: middle;
  }
  table.data-table tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .ttd-box {
    margin-top: 30px;
    width: 100%;
  }
  .ttd-col {
    width: 45%;
    display: inline-block;
    text-align: center;
    vertical-align: top;
    font-size: 10pt;
  }
</style>
</head>
<body>
  <div class="kop">
    <h1>ORGANISASI SISWA INTRA SEKOLAH (OSIS)</h1>
    <h2>${namaSekolah}</h2>
    <p>Jl. Pangeran Hidayat No. 123, Kota Gorontalo · Surel: osis@smktridharma.sch.id · Periode 2025/2026</p>
  </div>

  <h3 style="text-align: center; text-transform: uppercase; margin-bottom: 6px; font-size: 12pt; color: #1e1b4b;">
    FORMULIR REKAPITULASI INPUT MASSAL DATA ANGGOTA & PENGURUS OSIS
  </h3>
  <p style="text-align: center; font-size: 9pt; color: #64748b; margin-top: 0;">
    Dokumen Resmi Pembina OSIS · Diunduh tanggal ${dateFormatted}
  </p>

  <div class="instructions">
    <strong>PETUNJUK PENGISIAN UNTUK PEMBINA & BPH:</strong>
    <ol>
      <li>Isikan nama-nama siswa yang akan didaftarkan sebagai pengurus atau anggota OSIS pada tabel di bawah.</li>
      <li><strong>Wajib memilih salah satu dari 7 Kelas Resmi SMK Tridharma:</strong>
        <br><span class="badge-classes">${DAFTAR_KELAS.join('  ·  ')}</span>
      </li>
      <li>Untuk kolom <strong>Jabatan / Sekbid</strong>, tuliskan peran seperti:
        <em>Ketua Umum, Wakil Ketua, Sekretaris, Bendahara, Koordinator Sekbid 1 (Ketaqwaan), Anggota Sekbid 1, Koordinator Sekbid 2, dll</em>.
      </li>
      <li>Setelah selesai, <strong>salin (copy) baris tabel ini</strong> atau <strong>unggah berkas ini</strong> kembali ke Portal Pembina (Control Room). Sistem akan <strong>otomatis membuatkan akun login (username & password)</strong> serta <strong>Kartu Tanda Anggota (KTA)</strong> untuk setiap siswa.</li>
    </ol>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 35px;">No.</th>
        <th style="width: 160px;">Nama Lengkap Siswa</th>
        <th style="width: 85px;">NIS / NISN</th>
        <th style="width: 95px;">Kelas</th>
        <th style="width: 180px;">Jabatan / Sekbid</th>
        <th style="width: 95px;">No. WhatsApp</th>
        <th style="width: 45px;">L/P</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center;">1</td>
        <td><strong>Rahmat Hidayatullah</strong></td>
        <td>0071234501</td>
        <td>XI Askep</td>
        <td>Koordinator Sekbid 1 (Ketaqwaan)</td>
        <td>081234567890</td>
        <td style="text-align: center;">L</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td><strong>Nurul Fadhilah</strong></td>
        <td>0071234502</td>
        <td>XI Farmasi</td>
        <td>Anggota Sekbid 1 (Ketaqwaan)</td>
        <td>081234567891</td>
        <td style="text-align: center;">P</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td><strong>Bayu Pratama S.</strong></td>
        <td>0071234503</td>
        <td>X Askep 1</td>
        <td>Koordinator Sekbid 3 (Bela Negara)</td>
        <td>081234567892</td>
        <td style="text-align: center;">L</td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td><strong>Siti Azzahra Monoarfa</strong></td>
        <td>0071234504</td>
        <td>X Askep 2</td>
        <td>Anggota Sekbid 4 (Seni & Olahraga)</td>
        <td>081234567893</td>
        <td style="text-align: center;">P</td>
      </tr>
      <tr>
        <td style="text-align: center;">5</td>
        <td><strong>Fadlan Djafar</strong></td>
        <td>0071234505</td>
        <td>X Farmasi</td>
        <td>Anggota Sekbid 8 (TIK & Publikasi)</td>
        <td>081234567894</td>
        <td style="text-align: center;">L</td>
      </tr>
      <tr>
        <td style="text-align: center;">6</td>
        <td></td>
        <td></td>
        <td>XII Askep</td>
        <td></td>
        <td></td>
        <td style="text-align: center;"></td>
      </tr>
      <tr>
        <td style="text-align: center;">7</td>
        <td></td>
        <td></td>
        <td>XII Farmasi</td>
        <td></td>
        <td></td>
        <td style="text-align: center;"></td>
      </tr>
      <tr>
        <td style="text-align: center;">8</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td style="text-align: center;"></td>
      </tr>
      <tr>
        <td style="text-align: center;">9</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td style="text-align: center;"></td>
      </tr>
      <tr>
        <td style="text-align: center;">10</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td style="text-align: center;"></td>
      </tr>
    </tbody>
  </table>

  <br><br>
  <table style="width: 100%; border: none; font-size: 10pt;">
    <tr>
      <td style="width: 50%; border: none; text-align: center;">
        Mengetahui,<br>
        <strong>Ketua Umum OSIS</strong><br><br><br><br>
        <u>Fachri Ramadhan Monoarfa</u><br>
        NISN: 0068912341
      </td>
      <td style="width: 50%; border: none; text-align: center;">
        Gorontalo, ${dateFormatted}<br>
        <strong>Pembina OSIS SMK Tridharma</strong><br><br><br><br>
        <u>Ilham Arief, S.Pd.</u><br>
        NIP/NUPTK: 198504122011011008
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const blob = new Blob(['\ufeff' + content], {
    type: 'application/msword;charset=utf-8',
  });
  saveAs(blob, `Template_Data_Pengurus_OSIS_${namaSekolah.replace(/\s+/g, '_')}.doc`);
};
