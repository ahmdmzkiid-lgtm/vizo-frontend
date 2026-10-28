import * as XLSX from 'xlsx';

/**
 * Download official Excel template for Quiz/Exercises
 */
export const downloadQuizTemplate = (courseCode = 'MATKUL', sessionNum = 1) => {
  const wsData = [
    [
      'No',
      'Tipe Soal (PG / ISIAN / ESSAY)',
      'Halaman Slide',
      'Pertanyaan',
      'Pilihan A',
      'Pilihan B',
      'Pilihan C',
      'Pilihan D',
      'Kunci Jawaban',
      'Pembahasan / Penjelasan Slide'
    ],
    [
      1,
      'PG',
      1,
      'Apa kepanjangan dari CPU dalam arsitektur komputer?',
      'Central Processing Unit',
      'Computer Personal Unit',
      'Central Power Utility',
      'Control Program Unit',
      'A',
      'Slide Hal 1: Komponen utama CPU dan fungsinya sebagai otak komputer.'
    ],
    [
      2,
      'PG',
      2,
      'Manakah berikut ini yang merupakan jenis memori volatile?',
      'ROM',
      'Hard Disk Drive',
      'RAM',
      'Flash Drive',
      'C',
      'Slide Hal 2: Karakteristik memori utama (RAM) yang kehilangan data saat daya mati.'
    ],
    [
      3,
      'ISIAN',
      3,
      'Protokol standar yang digunakan untuk mentransfer dokumen web secara aman adalah ...',
      '',
      '',
      '',
      '',
      'HTTPS',
      'Slide Hal 3: Protokol HTTPS menggunakan port 443 dengan enkripsi TLS/SSL.'
    ],
    [
      4,
      'ESSAY',
      4,
      'Jelaskan perbedaan mendasar antara memori volatile dan non-volatile beserta contohnya!',
      '',
      '',
      '',
      '',
      'Rubrik Jawaban: Volatile kehilangan data saat listrik padam (contoh: RAM/Cache). Non-volatile menyimpan data permanen (contoh: SSD/HDD/ROM).',
      'Slide Hal 4: Perbandingan hierarki memori dan persistensi data.'
    ]
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for comfortable editing in Excel
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 55 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 22 },
    { wch: 45 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template Soal');
  const filename = `Template_Soal_M${String(sessionNum).padStart(2, '0')}_${String(courseCode).replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Helper to match keys flexibly in user spreadsheets
 */
const findVal = (row, ...keywords) => {
  const rowKeys = Object.keys(row);
  for (const kw of keywords) {
    const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const rk of rowKeys) {
      const cleanRk = rk.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanRk === cleanKw || cleanRk.includes(cleanKw)) {
        return row[rk];
      }
    }
  }
  return '';
};

/**
 * Parse an Excel file (.xlsx, .xls, .csv) into validated Quiz questions
 */
export const parseQuizExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('File Excel tidak memiliki lembar kerja (sheet).');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rows || rows.length === 0) {
          throw new Error('Sheet Excel kosong atau tidak memiliki data baris.');
        }

        const parsedQuestions = [];
        const errors = [];

        rows.forEach((row, idx) => {
          const rowNum = idx + 2; // Row 1 is header
          const questionText = String(findVal(row, 'pertanyaan', 'soal', 'question', 'text') || '').trim();
          
          // Skip completely empty rows
          if (!questionText && Object.values(row).every((v) => !String(v).trim())) {
            return;
          }

          if (!questionText) {
            errors.push(`Baris ${rowNum}: Kolom pertanyaan kosong.`);
            return;
          }

          const typeRaw = String(findVal(row, 'tipesoal', 'tipe', 'type', 'jenis') || '').toUpperCase();
          const pageRefRaw = findVal(row, 'halamanslide', 'halaman', 'page', 'slide', 'hal');
          const pageReference = Number(pageRefRaw) > 0 ? Number(pageRefRaw) : 1;

          const optA = String(findVal(row, 'pilihana', 'opsia', 'opt a', 'a') || '').trim();
          const optB = String(findVal(row, 'pilihanb', 'opsib', 'opt b', 'b') || '').trim();
          const optC = String(findVal(row, 'pilihanc', 'opsic', 'opt c', 'c') || '').trim();
          const optD = String(findVal(row, 'pilihand', 'opsid', 'opt d', 'd') || '').trim();

          const keyAnsRaw = String(findVal(row, 'kuncijawaban', 'kunci', 'jawaban', 'answer', 'key') || '').trim();
          const explanation = String(findVal(row, 'pembahasan', 'penjelasan', 'explanation', 'catatan') || '').trim();

          // Determine Question Type
          let type = 'MULTIPLE_CHOICE';
          if (typeRaw.includes('ISIAN') || typeRaw.includes('SHORT')) {
            type = 'SHORT_ANSWER';
          } else if (typeRaw.includes('ESSAY') || typeRaw.includes('ESAI')) {
            type = 'ESSAY';
          } else if (typeRaw.includes('PG') || typeRaw.includes('MULTIPLE') || typeRaw.includes('PILIHAN')) {
            type = 'MULTIPLE_CHOICE';
          } else {
            // Auto detect from options presence
            if (optA && optB) {
              type = 'MULTIPLE_CHOICE';
            } else if (keyAnsRaw.length > 25) {
              type = 'ESSAY';
            } else {
              type = 'SHORT_ANSWER';
            }
          }

          let options = null;
          let correctAnswer = '';
          let essayRubric = '';
          let rowError = null;

          if (type === 'MULTIPLE_CHOICE') {
            options = [optA, optB, optC, optD];
            if (!optA || !optB || !optC || !optD) {
              rowError = `Opsi A, B, C, D belum lengkap.`;
            }
            const cleanKey = keyAnsRaw.toUpperCase().replace(/[^A-D]/g, '');
            correctAnswer = cleanKey ? cleanKey[0] : 'A';
          } else if (type === 'SHORT_ANSWER') {
            correctAnswer = keyAnsRaw;
            if (!correctAnswer) {
              rowError = `Kunci jawaban isian belum diisi.`;
            }
          } else if (type === 'ESSAY') {
            essayRubric = keyAnsRaw || explanation || 'Model jawaban / rubrik penilaian';
          }

          parsedQuestions.push({
            id: Date.now() + idx,
            rowNum,
            type,
            questionText,
            pageReference,
            options,
            correctAnswer,
            explanation,
            essayRubric,
            isValid: !rowError,
            error: rowError,
          });
        });

        resolve({
          questions: parsedQuestions,
          totalCount: parsedQuestions.length,
          validCount: parsedQuestions.filter((q) => q.isValid).length,
          invalidCount: parsedQuestions.filter((q) => !q.isValid).length,
          errors,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file spreadsheet.'));
    reader.readAsArrayBuffer(file);
  });
};
