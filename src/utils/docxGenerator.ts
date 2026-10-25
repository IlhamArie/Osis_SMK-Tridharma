import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { SuratDokumen } from '../types/erp';

/**
 * Menghasilkan dan mengunduh berkas .docx resmi dengan Kop Surat SMK Tridharma Gorontalo
 */
export async function downloadSuratDocx(surat: SuratDokumen): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Kop Surat Yayasan Tridharma Gorontalo
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'YAYASAN TRIDHARMA GORONTALO',
                bold: true,
                size: 24, // 12pt
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'SEKOLAH MENENGAH KEJURUAN (SMK) TRIDHARMA GORONTALO',
                bold: true,
                size: 28, // 14pt
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'ORGANISASI SISWA INTRA SEKOLAH (OSIS)',
                bold: true,
                size: 24, // 12pt
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Jl. Mayor Dullah No. 12, Kel. Limba B, Kec. Kota Selatan, Kota Gorontalo 96115',
                size: 18, // 9pt
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Pos-el: osis@smktridharma-gorontalo.sch.id | Laman: smktridharma-gorontalo.sch.id',
                size: 18,
                font: 'Times New Roman',
              }),
            ],
          }),

          // Garis Pembatas Kop Surat
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '_________________________________________________________________________________',
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }), // Spacer

          // Nomor & Tanggal Surat
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Nomor       : ', bold: true, font: 'Times New Roman' }),
                          new TextRun({ text: surat.nomorSurat, font: 'Times New Roman' }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Lampiran  : ', bold: true, font: 'Times New Roman' }),
                          new TextRun({ text: '1 (satu) Berkas', font: 'Times New Roman' }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Perihal      : ', bold: true, font: 'Times New Roman' }),
                          new TextRun({ text: surat.perihal, bold: true, font: 'Times New Roman' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `Gorontalo, ${surat.tanggalSurat}`,
                            font: 'Times New Roman',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '' }),

          // Kepada Yth.
          new Paragraph({
            children: [
              new TextRun({ text: 'Kepada Yth.', font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: surat.tujuan, bold: true, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'di Tempat', font: 'Times New Roman' }),
            ],
          }),

          new Paragraph({ text: '' }),

          // Salam Pembuka & Isi
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dengan hormat,',
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: `Sehubungan dengan akan dilaksanakannya program kerja OSIS SMK Tridharma Gorontalo yaitu kegiatan "${surat.namaAcara}", maka bersama surat ini kami mengundang / memberitahukan kehadiran dan partisipasi Bapak/Ibu/Saudara/i pada kegiatan yang akan diselenggarakan pada:`,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({ text: '' }),

          // Rincian Pelaksanaan
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: 'Hari/Tanggal : ', bold: true, font: 'Times New Roman' }),
              new TextRun({ text: surat.tanggalPelaksanaan, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: 'Waktu            : ', bold: true, font: 'Times New Roman' }),
              new TextRun({ text: surat.waktuPelaksanaan, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: 'Tempat          : ', bold: true, font: 'Times New Roman' }),
              new TextRun({ text: surat.tempatPelaksanaan, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: 'Agenda Pokok: ', bold: true, font: 'Times New Roman' }),
              new TextRun({ text: surat.namaAcara, font: 'Times New Roman' }),
            ],
          }),

          new Paragraph({ text: '' }),

          // Penutup
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'Demikian surat ini kami sampaikan. Atas perhatian, dukungan, dan kerja sama yang baik dari Bapak/Ibu/Saudara/i, kami ucapkan terima kasih yang setinggi-tingginya.',
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({ text: '' }),

          // Tanda Tangan Organisasi
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'PENGURUS OSIS SMK TRIDHARMA GORONTALO',
                bold: true,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Blok Tanda Tangan Ketua & Sekretaris
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'Ketua OSIS,', font: 'Times New Roman' }),
                        ],
                      }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: surat.penandatangan1 || 'Fachri Ramadhan',
                            bold: true,
                            underline: {},
                            font: 'Times New Roman',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'NISN. 0068912341', font: 'Times New Roman' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'Sekretaris OSIS,', font: 'Times New Roman' }),
                        ],
                      }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({ text: '' }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: surat.penandatangan2 || 'Aisyah Putri Djafar',
                            bold: true,
                            underline: {},
                            font: 'Times New Roman',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'NISN. 0071239855', font: 'Times New Roman' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '' }),

          // Mengetahui Pembina OSIS
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Mengetahui,', font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Pembina OSIS SMK Tridharma Gorontalo',
                bold: true,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: surat.mengetahui || 'Ilham Arief, S.Pd.',
                bold: true,
                underline: {},
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'NIP. 19850412 201101 1 008', font: 'Times New Roman' }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFileName = `Surat_OSIS_${surat.nomorSurat.replace(/[\/\\]/g, '_')}.docx`;
  saveAs(blob, cleanFileName);
}
