import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../Toast';
import CornerReticle from '../CornerReticle';
import { 
  X, Plus, Trash2, HelpCircle, FileText, CheckCircle2, 
  AlertTriangle, BookOpen, Layers, FileSpreadsheet,
  Download, UploadCloud, Edit3, PenTool, Check, ArrowRight
} from 'lucide-react';
import { downloadQuizTemplate, parseQuizExcel } from '../../utils/excelQuizParser';

export default function ContributionModal({ 
  course, 
  sessions, 
  initialSessionId, 
  initialMode = 'MANUAL', 
  onClose, 
  onSuccess 
}) {
  const toast = useToast();
  const [entryMode, setEntryMode] = useState(initialMode || 'MANUAL'); // 'MANUAL' | 'EXCEL'
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || sessions[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(5);
  const [notes, setNotes] = useState('');
  
  // Manual Questions State
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'MULTIPLE_CHOICE',
      questionText: '',
      pageReference: 1,
      options: ['', '', '', ''],
      correctAnswer: 'A',
      explanation: '',
      essayRubric: '',
    },
  ]);

  // Excel Bulk Import States
  const [parsedExcelQuestions, setParsedExcelQuestions] = useState([]);
  const [excelFileInfo, setExcelFileInfo] = useState(null);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sesi yang dipilih
  const currentSession = sessions.find((s) => s.id === Number(selectedSessionId)) || sessions[0] || {};
  const pdfMaterials = currentSession?.materials || [];

  // =========================================================================
  // HANDLERS FOR MANUAL MODE
  // =========================================================================
  const handleAddQuestion = (type) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        questionText: '',
        pageReference: Number(startPage),
        options: type === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : null,
        correctAnswer: type === 'MULTIPLE_CHOICE' ? 'A' : '',
        explanation: '',
        essayRubric: '',
      },
    ]);
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) {
      toast.warning('Minimal harus ada 1 pertanyaan dalam paket kontribusi.');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newOpts = [...(q.options || ['', '', '', ''])];
          newOpts[optionIndex] = value;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const handleSetPageRange = (start) => {
    const s = Math.max(1, Number(start));
    setStartPage(s);
    setEndPage(s + 4);
  };

  // =========================================================================
  // HANDLERS FOR EXCEL BULK IMPORT
  // =========================================================================
  const handleDownloadTemplate = () => {
    downloadQuizTemplate(course.code, currentSession.sessionNumber || 1);
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setParsingExcel(true);
      setError('');
      setSuccessNotice('');
      setExcelFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      });

      const result = await parseQuizExcel(file);
      setParsedExcelQuestions(result.questions);

      // Auto detect and adjust page range
      const pageRefs = result.questions
        .map((q) => q.pageReference)
        .filter((p) => !isNaN(p) && p > 0);
      if (pageRefs.length > 0) {
        const minP = Math.min(...pageRefs);
        const maxP = Math.max(...pageRefs);
        setStartPage(minP);
        setEndPage(Math.max(maxP, minP + 4));
      }

      setSuccessNotice(
        `✓ Berhasil membaca ${result.totalCount} soal (${result.validCount} valid) dari file Excel.`
      );
    } catch (err) {
      console.error('Parse excel error:', err);
      setError(err.message || 'Gagal memproses file Excel.');
    } finally {
      setParsingExcel(false);
    }
  };

  const handleDeleteParsedRow = (id) => {
    setParsedExcelQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleTransferToManual = () => {
    if (parsedExcelQuestions.length === 0) return;
    setQuestions(
      parsedExcelQuestions.map((q, idx) => ({
        ...q,
        id: Date.now() + idx,
      }))
    );
    setEntryMode('MANUAL');
    setSuccessNotice(`✓ ${parsedExcelQuestions.length} soal berhasil disalin ke formulir manual!`);
  };

  // =========================================================================
  // SUBMISSION LOGIC
  // =========================================================================
  const submitContribution = async (activeQuestions) => {
    setError('');

    if (!selectedSessionId) {
      setError('Silakan pilih sesi pertemuan.');
      return;
    }

    if (Number(startPage) <= 0 || Number(endPage) < Number(startPage)) {
      setError('Rentang halaman tidak valid (Halaman akhir harus >= halaman awal).');
      return;
    }

    if (!activeQuestions || activeQuestions.length === 0) {
      setError('Belum ada soal untuk disimpan.');
      return;
    }

    // Validasi soal
    for (let i = 0; i < activeQuestions.length; i++) {
      const q = activeQuestions[i];
      if (!q.questionText || !q.questionText.trim()) {
        setError(`Soal #${i + 1}: Pertanyaan tidak boleh kosong.`);
        return;
      }

      if (q.type === 'MULTIPLE_CHOICE') {
        if (!q.options || q.options.some((opt) => !String(opt || '').trim())) {
          setError(`Soal #${i + 1} (Pilihan Ganda): Semua 4 opsi (A, B, C, D) wajib diisi.`);
          return;
        }
        if (!q.correctAnswer) {
          setError(`Soal #${i + 1} (Pilihan Ganda): Kunci jawaban benar wajib dipilih.`);
          return;
        }
      } else if (q.type === 'SHORT_ANSWER') {
        if (!String(q.correctAnswer || '').trim()) {
          setError(`Soal #${i + 1} (Isian Singkat): Kunci jawaban wajib diisi.`);
          return;
        }
      } else if (q.type === 'ESSAY') {
        if (!String(q.essayRubric || '').trim()) {
          setError(`Soal #${i + 1} (Essay): Rubrik / model jawaban ideal wajib diisi.`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      await api.post(`/quiz/courses/${course.id}/contributions`, {
        sessionId: Number(selectedSessionId),
        materialId: selectedMaterialId ? Number(selectedMaterialId) : null,
        startPage: Number(startPage),
        endPage: Number(endPage),
        notes,
        questions: activeQuestions,
      });

      onSuccess();
    } catch (err) {
      console.error('Submit contribution failed:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan kontribusi soal.');
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (entryMode === 'EXCEL') {
      if (parsedExcelQuestions.length === 0) {
        setError('Silakan pilih dan upload file Excel terlebih dahulu.');
        return;
      }
      submitContribution(parsedExcelQuestions);
    } else {
      submitContribution(questions);
    }
  };

  const activeCount = entryMode === 'EXCEL' ? parsedExcelQuestions.length : questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden w-full max-w-4xl relative shadow-xl my-8 animate-in">
        <CornerReticle />

        {/* Modal Header */}
        <div className="bg-[#F4F7FE] text-[#1E293B] px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold bg-brand-orange text-white px-2 py-0.5">
              CROWDSOURCE
            </span>
            <h2 className="font-tech text-base font-bold uppercase tracking-wider">
              KONTRIBUSI SOAL LATIHAN DARI SLIDE DOSEN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-brand-orange transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-2 px-5 pt-3 bg-canvas border-b border-grid-border font-mono text-xs">
          <button
            type="button"
            onClick={() => setEntryMode('MANUAL')}
            className={`px-4 py-2 font-bold uppercase transition-all border-b-2 flex items-center space-x-1.5 ${
              entryMode === 'MANUAL'
                ? 'border-brand-orange text-brand-orange bg-white'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>1. INPUT FORMULIR MANUAL ({questions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('EXCEL')}
            className={`px-4 py-2 font-bold uppercase transition-all border-b-2 flex items-center space-x-1.5 ${
              entryMode === 'EXCEL'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-ink-muted hover:text-emerald-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. BULK IMPORT VIA EXCEL (.XLSX)</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 font-mono text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 font-mono text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* SECTION 1: Session & Slide Page Slot (Shared) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-4">
            <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider border-b border-grid-border pb-2 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-brand-orange" />
              <span>1. Tentukan Sesi & Rentang 5 Halaman Slide</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1">
                  PILIH PERTEMUAN (SESI) <span className="text-brand-orange">*</span>
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => {
                    setSelectedSessionId(e.target.value);
                    setSelectedMaterialId('');
                  }}
                  className="w-full bg-canvas border border-grid-border px-3 py-2 font-mono text-xs focus:border-ink focus:outline-none"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      M-{String(s.sessionNumber).padStart(2, '0')} : {s.topicTitle} ({s.questionsCount || 0} Soal)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1">
                  PILIH FILE SLIDE / PDF DOSEN (OPSIONAL)
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full bg-canvas border border-grid-border px-3 py-2 font-mono text-xs focus:border-ink focus:outline-none"
                >
                  <option value="">-- Pilih Dokumen PDF (Jika Tersedia) --</option>
                  {pdfMaterials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Page Range Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1">
                  DARI HALAMAN SLIDE <span className="text-brand-orange">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={startPage}
                  onChange={(e) => handleSetPageRange(e.target.value)}
                  className="w-full bg-canvas border border-grid-border px-3 py-2 font-mono text-xs focus:border-ink focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1">
                  SAMPAI HALAMAN SLIDE <span className="text-brand-orange">*</span>
                </label>
                <input
                  type="number"
                  min={startPage}
                  value={endPage}
                  onChange={(e) => setEndPage(Number(e.target.value))}
                  className="w-full bg-canvas border border-grid-border px-3 py-2 font-mono text-xs focus:border-ink focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1">
                  SLOT CEPAT (5 HALAMAN)
                </label>
                <div className="flex flex-wrap gap-1">
                  {[1, 6, 11, 16, 21, 26, 31].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handleSetPageRange(p)}
                      className={`font-mono text-[11px] px-2 py-1 border transition-all ${
                        startPage === p
                          ? 'bg-brand-orange text-white border-brand-orange font-bold'
                          : 'bg-canvas border-grid-border text-ink-muted hover:border-ink hover:text-ink'
                      }`}
                    >
                      {p}–{p + 4}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-ink mb-1">
                CATATAN / TOPIK BAHASAN (OPSIONAL)
              </label>
              <input
                type="text"
                placeholder="Misal: Bab Konsep Enkapsulasi & Abstraksi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-canvas border border-grid-border px-3 py-2 font-mono text-xs focus:border-ink focus:outline-none"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB CONTENT A: BULK IMPORT DARI EXCEL                                     */}
          {/* ========================================================================= */}
          {entryMode === 'EXCEL' && (
            <div className="space-y-5">
              {/* Step 1: Download Template */}
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-ink text-white px-2 py-0.5 uppercase">
                      LANGKAH 1
                    </span>
                    <h4 className="font-tech text-base font-bold text-ink uppercase mt-1">
                      UNDUH TEMPLATE EXCEL VIZO
                    </h4>
                    <p className="font-mono text-xs text-ink-muted mt-0.5">
                      Gunakan format template resmi agar data soal (PG, Isian, Essay) terbaca otomatis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="bg-[#1D63FF] hover:bg-[#1550D6] rounded-lg text-white font-mono text-xs font-bold px-4 py-2 uppercase transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4 text-brand-orange" />
                    <span>UNDUH TEMPLATE (.XLSX)</span>
                  </button>
                </div>

                <div className="bg-canvas border border-grid-border p-2.5 font-mono text-[11px] text-ink-muted">
                  <strong className="text-ink">Struktur Kolom:</strong> No • Tipe Soal (PG/ISIAN/ESSAY) • Halaman Slide • Pertanyaan • Pilihan A • Pilihan B • Pilihan C • Pilihan D • Kunci Jawaban • Pembahasan
                </div>
              </div>

              {/* Step 2: Upload Excel File */}
              <div className="p-6 bg-white border-2 border-dashed border-grid-border hover:border-emerald-600 transition-colors text-center space-y-3 relative">
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <label
                    htmlFor="excelFileInput"
                    className="cursor-pointer inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold px-5 py-2.5 uppercase tracking-wider shadow-sm transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>PILIH FILE EXCEL / CSV (.XLSX, .XLS, .CSV)</span>
                  </label>
                  <p className="font-mono text-[11px] text-ink-muted mt-2">
                    {excelFileInfo ? (
                      <span className="text-emerald-800 font-bold">
                        File Terpilih: {excelFileInfo.name} ({excelFileInfo.size})
                      </span>
                    ) : (
                      'Klik tombol di atas untuk memilih file template Excel yang sudah Anda isi.'
                    )}
                  </p>
                </div>
                {parsingExcel && (
                  <div className="font-mono text-xs text-brand-orange font-bold animate-pulse">
                    Sedang memverifikasi data soal...
                  </div>
                )}
              </div>

              {/* Step 3: Preview Parsed Questions */}
              {parsedExcelQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grid-border pb-2">
                    <div>
                      <h4 className="font-tech text-base font-bold text-ink uppercase flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>HASIL IMPORT: {parsedExcelQuestions.length} SOAL TERDETEKSI</span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-ink-muted mt-1">
                        <span className="bg-cyan-50 border border-cyan-300 text-cyan-900 px-1.5 py-0.5 font-bold">
                          PG: {parsedExcelQuestions.filter((q) => q.type === 'MULTIPLE_CHOICE').length}
                        </span>
                        <span className="bg-amber-50 border border-amber-300 text-amber-900 px-1.5 py-0.5 font-bold">
                          Isian: {parsedExcelQuestions.filter((q) => q.type === 'SHORT_ANSWER').length}
                        </span>
                        <span className="bg-purple-50 border border-purple-300 text-purple-900 px-1.5 py-0.5 font-bold">
                          Essay: {parsedExcelQuestions.filter((q) => q.type === 'ESSAY').length}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTransferToManual}
                      className="px-3 py-1.5 bg-canvas border border-grid-border hover:border-ink text-ink font-mono text-xs font-bold uppercase transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
                      title="Salin semua butir soal ke formulir manual untuk diedit"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand-orange" />
                      <span>EDIT DI FORM MANUAL</span>
                    </button>
                  </div>

                  {/* Table of Parsed Questions */}
                  <div className="border border-[#E2E8F0] rounded-xl bg-white max-h-72 overflow-y-auto divide-y divide-grid-border font-mono text-xs">
                    {parsedExcelQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3 hover:bg-canvas-subtle/50 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold bg-ink text-white px-1.5 py-0.5 text-[10px]">
                              #{idx + 1}
                            </span>
                            <span
                              className={`font-bold text-[10px] px-1.5 py-0.5 border ${
                                q.type === 'MULTIPLE_CHOICE'
                                  ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                                  : q.type === 'SHORT_ANSWER'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-purple-50 text-purple-900 border-purple-300'
                              }`}
                            >
                              {q.type === 'MULTIPLE_CHOICE'
                                ? 'PILIHAN GANDA'
                                : q.type === 'SHORT_ANSWER'
                                ? 'ISIAN SINGKAT'
                                : 'ESSAY'}
                            </span>
                            <span className="text-[10px] text-ink-muted">
                              Slide Hal. {q.pageReference}
                            </span>
                            {!q.isValid && (
                              <span className="bg-red-50 text-red-700 border border-red-300 px-1 py-0.5 text-[10px] font-bold">
                                ⚠️ {q.error}
                              </span>
                            )}
                          </div>

                          <p className="font-sans text-xs font-bold text-ink line-clamp-2">
                            {q.questionText}
                          </p>

                          {q.type === 'MULTIPLE_CHOICE' && q.options && (
                            <div className="text-[11px] text-ink-muted flex flex-wrap gap-x-3 gap-y-0.5">
                              {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                                <span
                                  key={letter}
                                  className={
                                    q.correctAnswer === letter ? 'text-emerald-800 font-bold' : ''
                                  }
                                >
                                  <strong>{letter}.</strong> {q.options[optIdx]}{' '}
                                  {q.correctAnswer === letter && '✓'}
                                </span>
                              ))}
                            </div>
                          )}

                          {q.type !== 'MULTIPLE_CHOICE' && (
                            <div className="text-[11px] text-ink-muted">
                              <strong className="text-ink">Kunci / Model:</strong>{' '}
                              {q.correctAnswer || q.essayRubric}
                            </div>
                          )}

                          {q.explanation && (
                            <div className="text-[10px] text-ink-muted italic">
                              Pembahasan: {q.explanation}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteParsedRow(q.id)}
                          className="text-red-500 hover:text-red-700 p-1 shrink-0 transition-colors"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT B: FORMULIR MANUAL                                            */}
          {/* ========================================================================= */}
          {entryMode === 'MANUAL' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grid-border pb-2">
                <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-brand-orange" />
                  <span>2. Daftar Soal Dalam Paket Ini ({questions.length} Soal)</span>
                </h3>

                {/* Action Buttons to Add Different Types */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}
                    className="bg-[#1D63FF] hover:bg-[#1550D6] rounded-lg text-white px-2.5 py-1 text-[11px] font-bold uppercase transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Pilihan Ganda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('SHORT_ANSWER')}
                    className="bg-[#1D63FF] hover:bg-[#1550D6] rounded-lg text-white px-2.5 py-1 text-[11px] font-bold uppercase transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Isian Singkat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion('ESSAY')}
                    className="bg-[#1D63FF] hover:bg-[#1550D6] rounded-lg text-white px-2.5 py-1 text-[11px] font-bold uppercase transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Essay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode('EXCEL')}
                    className="bg-emerald-50 border border-emerald-600 text-emerald-800 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-[11px] font-bold uppercase transition-colors flex items-center space-x-1"
                    title="Beralih ke bulk import Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Excel</span>
                  </button>
                </div>
              </div>

              {/* Questions Card Iteration */}
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 relative space-y-3 hover:border-ink transition-colors"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-grid-border pb-2">
                      <div className="flex items-center space-x-2 font-mono text-xs">
                        <span className="font-bold bg-ink text-white px-2 py-0.5">
                          #{idx + 1}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 text-[10px] ${
                            q.type === 'MULTIPLE_CHOICE'
                              ? 'bg-cyan-100 text-cyan-900 border border-cyan-400'
                              : q.type === 'SHORT_ANSWER'
                              ? 'bg-amber-100 text-amber-900 border border-amber-400'
                              : 'bg-purple-100 text-purple-900 border border-purple-400'
                          }`}
                        >
                          {q.type === 'MULTIPLE_CHOICE'
                            ? 'PILIHAN GANDA'
                            : q.type === 'SHORT_ANSWER'
                            ? 'ISIAN SINGKAT'
                            : 'ESSAY'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 font-mono text-xs">
                        <div className="flex items-center space-x-1">
                          <label className="text-[11px] text-ink-muted">Slide Hal:</label>
                          <input
                            type="number"
                            min="1"
                            value={q.pageReference}
                            onChange={(e) =>
                              handleQuestionChange(q.id, 'pageReference', Number(e.target.value))
                            }
                            className="w-14 bg-canvas border border-grid-border px-1.5 py-0.5 text-xs text-center font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Hapus Pertanyaan Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block font-mono text-xs font-bold text-ink mb-1">
                        TEKS PERTANYAAN <span className="text-brand-orange">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Ketik butir pertanyaan di sini..."
                        value={q.questionText}
                        onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
                        className="w-full bg-canvas border border-grid-border p-2 font-sans text-xs focus:border-ink focus:outline-none"
                      />
                    </div>

                    {/* TYPE 1: MULTIPLE CHOICE OPTIONS (A, B, C, D) */}
                    {q.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 pt-1 font-mono text-xs">
                        <label className="block font-bold text-ink">
                          OPSI PILIHAN (PILIH SATU SEBAGAI KUNCI JAWABAN BENAR):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                            const isCorrect = q.correctAnswer === letter;
                            return (
                              <div
                                key={letter}
                                className={`flex items-center space-x-2 border p-2 transition-colors ${
                                  isCorrect ? 'border-emerald-500 bg-emerald-50/50' : 'border-grid-border bg-canvas'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleQuestionChange(q.id, 'correctAnswer', letter)}
                                  className={`w-6 h-6 flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white text-ink-muted border border-grid-border hover:border-ink'
                                  }`}
                                  title="Pilih sebagai kunci jawaban"
                                >
                                  {letter}
                                </button>
                                <input
                                  type="text"
                                  required
                                  placeholder={`Opsi ${letter}...`}
                                  value={q.options?.[optIdx] || ''}
                                  onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                                  className="w-full bg-transparent border-none text-xs font-sans focus:outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TYPE 2: SHORT ANSWER KEYWORD */}
                    {q.type === 'SHORT_ANSWER' && (
                      <div className="space-y-1 font-mono text-xs">
                        <label className="block font-bold text-ink">
                          KUNCI JAWABAN BENAR (KATA KUNCI ISIAN SINGKAT) <span className="text-brand-orange">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: Polymorphism / Polimorfisme"
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                          className="w-full bg-canvas border border-grid-border px-3 py-2 font-mono text-xs focus:border-ink focus:outline-none"
                        />
                      </div>
                    )}

                    {/* TYPE 3: ESSAY RUBRIC */}
                    {q.type === 'ESSAY' && (
                      <div className="space-y-1 font-mono text-xs">
                        <label className="block font-bold text-ink">
                          MODEL JAWABAN IDEAL / RUBRIK PENILAIAN <span className="text-brand-orange">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Ketik model jawaban atau poin penting yang harus dijawab oleh mahasiswa..."
                          value={q.essayRubric}
                          onChange={(e) => handleQuestionChange(q.id, 'essayRubric', e.target.value)}
                          className="w-full bg-canvas border border-grid-border p-2 font-sans text-xs focus:border-ink focus:outline-none"
                        />
                      </div>
                    )}

                    {/* EXPLANATION / PEMBAHASAN SLIDE */}
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-ink-muted mb-1">
                        PEMBAHASAN / ALASAN JAWABAN (BERDASARKAN SLIDE):
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Misal: Berdasarkan slide hal 3, Class Diagram mendeskripsikan struktur statis sistem dan atributnya."
                        value={q.explanation}
                        onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)}
                        className="w-full bg-canvas border border-grid-border p-2 font-sans text-xs focus:border-ink focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t-2 border-grid-border font-mono text-xs">
            <span className="text-ink-muted">
              Total Soal yang Akan Disimpan: <strong>{activeCount}</strong>
            </span>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-canvas border border-grid-border text-ink hover:border-ink transition-colors font-bold uppercase"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || (entryMode === 'EXCEL' && parsedExcelQuestions.length === 0)}
                className="px-5 py-2 bg-[#1D63FF] hover:bg-[#1550D6] rounded-xl text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-sm"
              >
                {saving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {entryMode === 'EXCEL'
                        ? `KIRIM ${parsedExcelQuestions.length} SOAL DARI EXCEL`
                        : 'KIRIM KONTRIBUSI SOAL'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
