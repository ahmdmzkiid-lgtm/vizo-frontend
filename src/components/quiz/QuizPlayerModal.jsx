import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../Toast';
import CornerReticle from '../CornerReticle';
import { 
  X, CheckCircle2, XCircle, AlertCircle, ArrowLeft, ArrowRight, 
  RotateCcw, BookOpen, Award, Check, FileText, HelpCircle, Layers 
} from 'lucide-react';

export default function QuizPlayerModal({ course, initialSessionId, initialContributionId, onClose }) {
  const toast = useToast();
  // State: 'SETUP' | 'PLAYING' | 'RESULT'
  const [stage, setStage] = useState(initialContributionId ? 'PLAYING' : 'SETUP');
  
  // Setup configuration
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || 'ALL');
  const [selectedContributionId, setSelectedContributionId] = useState(initialContributionId || null);
  const [questionTypeFilter, setQuestionTypeFilter] = useState('ALL');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Playing state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: answerValue }
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [resultData, setResultData] = useState(null);

  // Fetch questions matching filter
  useEffect(() => {
    fetchQuestions();
  }, [selectedSessionId, selectedContributionId, questionTypeFilter]);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const params = {};
      if (selectedContributionId) {
        params.contributionId = selectedContributionId;
      } else if (selectedSessionId !== 'ALL') {
        params.sessionId = selectedSessionId;
      }
      if (questionTypeFilter !== 'ALL') params.type = questionTypeFilter;

      const res = await api.get(`/quiz/courses/${course.id}/questions`, { params });
      setAvailableQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Fetch questions for quiz error:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStartQuiz = () => {
    if (availableQuestions.length === 0) return;
    setUserAnswers({});
    setCurrentIndex(0);
    setStage('PLAYING');
  };

  const handleSelectAnswer = (questionId, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const formattedAnswers = availableQuestions.map((q) => ({
        questionId: q.id,
        userAnswer: userAnswers[q.id] || '',
      }));

      const res = await api.post('/quiz/submit-attempt', {
        courseId: course.id,
        sessionId: selectedSessionId !== 'ALL' ? Number(selectedSessionId) : null,
        answers: formattedAnswers,
      });

      setResultData(res.data);
      setStage('RESULT');
    } catch (err) {
      console.error('Submit quiz failed:', err);
      toast.error('Gagal mengirim jawaban latihan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = availableQuestions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden w-full max-w-3xl relative shadow-xl my-6 animate-in">
        <CornerReticle />

        {/* Modal Header */}
        <div className="bg-[#F4F7FE] text-[#1E293B] px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold bg-brand-orange text-white px-2 py-0.5">
              {stage === 'SETUP' ? 'SIMULASI KUIS' : stage === 'PLAYING' ? 'MODE LATIHAN' : 'HASIL EVALUASI'}
            </span>
            <h2 className="font-tech text-base font-bold uppercase tracking-wider">
              {course.code} — {course.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-brand-orange transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* STAGE 1: SETUP SCREEN                                     */}
        {/* ========================================================= */}
        {stage === 'SETUP' && (
          <div className="p-6 space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <Award className="w-12 h-12 text-brand-orange mx-auto" />
              <h3 className="font-tech text-xl font-bold uppercase text-ink">
                LATIHAN SOAL BERGOTONG-ROYONG
              </h3>
              <p className="font-mono text-xs text-ink-muted">
                Kerjakan bank soal yang telah disusun dan dikontribusikan ramai-ramai oleh mahasiswa kelas dari slide materi dosen.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1.5">
                  CAKUPAN PERTEMUAN (SESI)
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full bg-canvas border border-grid-border px-3 py-2 font-mono text-xs focus:border-ink focus:outline-none"
                >
                  <option value="ALL">★ Semua Sesi (Simulasi Lengkap UTS / UAS)</option>
                  {course.sessions?.map((s) => (
                    <option key={s.id} value={s.id}>
                      M-{String(s.sessionNumber).padStart(2, '0')}: {s.topicTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1.5">
                  FILTER TIPE SOAL
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setQuestionTypeFilter('ALL')}
                    className={`py-2 px-3 border text-center transition-all ${
                      questionTypeFilter === 'ALL'
                        ? 'bg-ink text-white font-bold border-ink'
                        : 'bg-canvas border-grid-border text-ink-muted hover:border-ink'
                    }`}
                  >
                    Semua Tipe Soal
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionTypeFilter('MULTIPLE_CHOICE')}
                    className={`py-2 px-3 border text-center transition-all ${
                      questionTypeFilter === 'MULTIPLE_CHOICE'
                        ? 'bg-brand-orange text-white font-bold border-brand-orange'
                        : 'bg-canvas border-grid-border text-ink-muted hover:border-ink'
                    }`}
                  >
                    Pilihan Ganda Saja (Auto-Graded)
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-grid-border flex items-center justify-between font-mono text-xs">
                <span className="text-ink-muted">Jumlah Soal Tersedia:</span>
                <span className="font-bold text-ink bg-canvas px-2.5 py-1 border border-grid-border">
                  {loadingQuestions ? 'Memuat...' : `${availableQuestions.length} Soal`}
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={availableQuestions.length === 0 || loadingQuestions}
                className="px-8 py-3 bg-[#1D63FF] hover:bg-[#1550D6] rounded-xl text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md inline-flex items-center space-x-2"
              >
                <span>MULAI MENGERJAKAN LATIHAN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: PLAYING SCREEN                                   */}
        {/* ========================================================= */}
        {stage === 'PLAYING' && currentQ && (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Progress Bar & Header Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold bg-ink text-white px-2 py-0.5">
                    SOAL {currentIndex + 1} / {availableQuestions.length}
                  </span>
                  <span className="text-ink-muted font-bold">
                    M-{String(currentQ.session?.sessionNumber || 1).padStart(2, '0')} • Hal Slide {currentQ.pageReference || 1}
                  </span>
                </div>
                <span className="text-ink-muted text-[11px]">
                  Penyusun: {currentQ.createdBy?.name || 'Mahasiswa'}
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-grid-border h-1.5 overflow-hidden">
                <div
                  className="bg-brand-orange h-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / availableQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <div className="font-tech text-base sm:text-lg font-bold text-ink leading-relaxed">
                {currentQ.questionText}
              </div>

              {/* TYPE: MULTIPLE CHOICE (4 Options) */}
              {currentQ.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2.5 pt-2">
                  {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                    const optText = currentQ.options?.[optIdx] || '';
                    if (!optText) return null;
                    const isSelected = userAnswers[currentQ.id] === letter;

                    return (
                      <button
                        type="button"
                        key={letter}
                        onClick={() => handleSelectAnswer(currentQ.id, letter)}
                        className={`w-full text-left p-3 border-2 font-mono text-xs transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-brand-orange/10 border-brand-orange text-ink font-bold shadow-sm'
                            : 'bg-canvas border-grid-border text-ink hover:border-ink hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isSelected
                              ? 'bg-brand-orange text-white border-brand-orange'
                              : 'bg-white border-grid-border text-ink'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="pt-0.5 leading-snug">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TYPE: SHORT ANSWER */}
              {currentQ.type === 'SHORT_ANSWER' && (
                <div className="pt-2 space-y-2">
                  <label className="block font-mono text-xs font-bold text-ink">
                    KETIK JAWABAN SINGKAT ANDA:
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik jawaban di sini..."
                    value={userAnswers[currentQ.id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                    className="w-full bg-canvas border border-[#E2E8F0] rounded-xl p-3 font-mono text-xs focus:border-ink focus:outline-none"
                    autoFocus
                  />
                </div>
              )}

              {/* TYPE: ESSAY */}
              {currentQ.type === 'ESSAY' && (
                <div className="pt-2 space-y-2">
                  <label className="block font-mono text-xs font-bold text-ink">
                    TULIS JAWABAN / ANALISIS ANDA:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan analisis atau pemaparan konsep anda di sini..."
                    value={userAnswers[currentQ.id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                    className="w-full bg-canvas border border-[#E2E8F0] rounded-xl p-3 font-sans text-xs focus:border-ink focus:outline-none"
                  />
                  <p className="font-mono text-[11px] text-ink-muted">
                    * Setelah submit, rubrik kunci jawaban dosen akan ditampilkan untuk bahan evaluasi mandiri.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-grid-border pt-4 font-mono text-xs">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 bg-canvas border border-grid-border text-ink hover:border-ink transition-colors disabled:opacity-30 font-bold uppercase flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>SEBELUMNYA</span>
              </button>

              <div className="flex items-center space-x-2">
                {currentIndex < availableQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-5 py-2 bg-[#1D63FF] hover:bg-[#1550D6] rounded-lg text-white font-bold uppercase transition-colors flex items-center space-x-1"
                  >
                    <span>SELANJUTNYA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2 bg-[#1D63FF] hover:bg-[#1550D6] rounded-xl text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center space-x-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'MEMERIKSA...' : 'SELESAIKAN & LIHAT NILAI'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: RESULT & EVALUATION SCREEN                       */}
        {/* ========================================================= */}
        {stage === 'RESULT' && resultData && (
          <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Big Score Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-center space-y-2 relative">
              <CornerReticle />
              <span className="font-mono text-xs font-bold text-ink-muted uppercase">
                HASIL LATIHAN SOAL KOLABORATIF
              </span>
              <div className="font-tech text-5xl font-black text-brand-orange">
                {resultData.score}
                <span className="text-xl text-ink-muted"> / 100</span>
              </div>
              <p className="font-mono text-xs text-ink">
                Benar <strong>{resultData.correctCount}</strong> dari {resultData.autoGradableCount} soal otomatis dinilai ({resultData.totalItems} total soal dikerjakan).
              </p>
              <div className="pt-2">
                <span
                  className={`inline-block font-mono text-xs font-bold px-3 py-1 border ${
                    resultData.score >= 75
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {resultData.score >= 75 ? '✓ PEMAHAMAN MATERI SANGAT BAIK' : '⚠ PERLU REVIEW ULANG SLIDE DOSEN'}
                </span>
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="space-y-4">
              <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider border-b border-grid-border pb-2 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-brand-orange" />
                <span>PEMBAHASAN & KUNCI JAWABAN LENGKAP</span>
              </h3>

              <div className="space-y-3">
                {resultData.evaluatedAnswers.map((ev, idx) => (
                  <div
                    key={ev.questionId}
                    className={`bg-white border-2 p-4 space-y-2.5 font-mono text-xs ${
                      ev.isCorrect === true
                        ? 'border-emerald-500'
                        : ev.isCorrect === false
                        ? 'border-red-500'
                        : 'border-grid-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-grid-border pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold bg-ink text-white px-2 py-0.5">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-ink">
                          M-{String(ev.session?.sessionNumber || 1).padStart(2, '0')} • Hal Slide {ev.pageReference || 1}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 font-bold">
                        {ev.isCorrect === true && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>BENAR (+1)</span>
                          </span>
                        )}
                        {ev.isCorrect === false && (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 border border-red-300 flex items-center space-x-1">
                            <X className="w-3.5 h-3.5" />
                            <span>SALAH</span>
                          </span>
                        )}
                        {ev.isCorrect === null && (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 border border-purple-300">
                            EVALUASI ESSAY
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <p className="font-tech text-sm font-bold text-ink">{ev.questionText}</p>

                    {/* Answers Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-canvas p-2.5 border border-grid-border text-[11px]">
                      <div>
                        <span className="text-ink-muted block font-bold">JAWABAN KAMU:</span>
                        <span className={`font-bold ${ev.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                          {ev.userAnswer || '(Tidak dijawab)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-muted block font-bold">KUNCI JAWABAN BENAR:</span>
                        <span className="font-bold text-ink">
                          {ev.correctAnswer || '(Lihat Rubrik di bawah)'}
                        </span>
                      </div>
                    </div>

                    {/* Essay Rubric */}
                    {ev.essayRubric && (
                      <div className="bg-purple-50 border border-purple-200 p-2.5 text-[11px]">
                        <span className="font-bold text-purple-800 block mb-1">
                          MODEL JAWABAN / RUBRIK DOSEN:
                        </span>
                        <p className="text-purple-950 font-sans whitespace-pre-line">{ev.essayRubric}</p>
                      </div>
                    )}

                    {/* Explanation */}
                    {ev.explanation && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 text-[11px]">
                        <span className="font-bold text-amber-800 block mb-1">
                          PEMBAHASAN (SLIDE HAL. {ev.pageReference}):
                        </span>
                        <p className="text-amber-950 font-sans">{ev.explanation}</p>
                      </div>
                    )}

                    <div className="text-[10px] text-ink-muted pt-1">
                      Disusun oleh: {ev.contributor?.name} ({ev.contributor?.nim})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t-2 border-grid-border pt-4 font-mono text-xs">
              <button
                type="button"
                onClick={handleStartQuiz}
                className="px-4 py-2 bg-canvas border border-grid-border text-ink hover:border-ink transition-colors font-bold uppercase flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ULANGI LATIHAN</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#1D63FF] hover:bg-[#1550D6] rounded-lg text-white font-bold uppercase transition-colors"
              >
                SELESAI & KEMBALI KE BANK SOAL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
