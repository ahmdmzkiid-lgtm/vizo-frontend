import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../Toast';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Award,
  Check,
  X,
} from 'lucide-react';
import AiExplanationBlock from './AiExplanationBlock';

export default function QuizPracticeView({
  course,
  initialSessionId,
  initialContributionId,
  reviewAttempt,
  onBack,
}) {
  const toast = useToast();
  const [stage, setStage] = useState(
    reviewAttempt ? 'RESULT' : initialContributionId ? 'PLAYING' : 'SETUP'
  );

  const [selectedSessionId, setSelectedSessionId] = useState(
    initialSessionId || 'ALL'
  );
  const [selectedContributionId, setSelectedContributionId] = useState(
    initialContributionId || null
  );
  const [questionTypeFilter, setQuestionTypeFilter] = useState('ALL');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [resultData, setResultData] = useState(reviewAttempt || null);

  useEffect(() => {
    if (reviewAttempt) {
      setResultData(reviewAttempt);
      setStage('RESULT');
    } else {
      fetchQuestions();
    }
  }, [selectedSessionId, selectedContributionId, questionTypeFilter, reviewAttempt]);

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
      const qList = res.data.questions || [];
      setAvailableQuestions(qList);

      if (initialContributionId && qList.length > 0 && stage === 'SETUP') {
        setUserAnswers({});
        setCurrentIndex(0);
        setStage('PLAYING');
      }
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
      toast.error(
        'Gagal mengirim jawaban latihan: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = availableQuestions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 text-[13px]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#1D63FF] font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bank Soal</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold bg-[#EAF2FF] text-[#1D63FF] px-3 py-1 rounded-lg uppercase">
            {stage === 'SETUP'
              ? 'Pengaturan Kuis'
              : stage === 'PLAYING'
              ? 'Mode Latihan Aktif'
              : 'Evaluasi & Pembahasan'}
          </span>
        </div>
      </div>

      {/* STAGE 1: SETUP SCREEN */}
      {stage === 'SETUP' && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#1D63FF] flex items-center justify-center mx-auto mb-3">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-[20px] font-bold text-[#1E293B]">
              Latihan Soal Kolaboratif
            </h3>
            <p className="text-[13px] text-[#64748B]">
              Pilih cakupan modul untuk memulai sesi latihan mandiri berbasis materi slide dosen.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                Cakupan Pertemuan (Sesi)
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => {
                  setSelectedSessionId(e.target.value);
                  setSelectedContributionId(null);
                }}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-[13px] focus:border-[#1D63FF] focus:outline-none"
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
              <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                Filter Tipe Soal
              </label>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <button
                  type="button"
                  onClick={() => setQuestionTypeFilter('ALL')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                    questionTypeFilter === 'ALL'
                      ? 'bg-[#1D63FF] text-white border-[#1D63FF]'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#1E293B]'
                  }`}
                >
                  Semua Tipe Soal
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionTypeFilter('MULTIPLE_CHOICE')}
                  className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                    questionTypeFilter === 'MULTIPLE_CHOICE'
                      ? 'bg-[#1D63FF] text-white border-[#1D63FF]'
                      : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#1E293B]'
                  }`}
                >
                  Pilihan Ganda Saja
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[12.5px]">
              <span className="text-[#64748B]">Jumlah Soal Tersedia:</span>
              <span className="font-bold text-[#1D63FF] bg-[#EAF2FF] px-3 py-1 rounded-lg">
                {loadingQuestions ? 'Memuat...' : `${availableQuestions.length} Soal`}
              </span>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={availableQuestions.length === 0 || loadingQuestions}
              className="px-7 py-3 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[13px] font-semibold transition-all disabled:opacity-50 shadow-sm inline-flex items-center gap-2"
            >
              <span>Mulai Mengerjakan Latihan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: PLAYING SCREEN */}
      {stage === 'PLAYING' && currentQ && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Progress Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold bg-[#1D63FF] text-white px-2.5 py-1 rounded-lg">
                  Soal {currentIndex + 1} dari {availableQuestions.length}
                </span>
                <span className="text-[#1E293B] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                  M-{String(currentQ.session?.sessionNumber || 1).padStart(2, '0')} • Slide Hal.{' '}
                  {currentQ.pageReference || 1}
                </span>
                <span
                  className={`font-bold px-2.5 py-1 rounded-lg text-[10.5px] ${
                    currentQ.type === 'MULTIPLE_CHOICE'
                      ? 'bg-[#EAF2FF] text-[#1D63FF]'
                      : currentQ.type === 'SHORT_ANSWER'
                      ? 'bg-[#FFFBEB] text-[#D97706]'
                      : 'bg-[#F3E8FF] text-[#7C3AED]'
                  }`}
                >
                  {currentQ.type === 'MULTIPLE_CHOICE'
                    ? 'Pilihan Ganda'
                    : currentQ.type === 'SHORT_ANSWER'
                    ? 'Isian Singkat'
                    : 'Essay'}
                </span>
              </div>

              <span className="text-[#64748B] text-[12px]">
                Penyusun:{' '}
                <strong className="text-[#1E293B]">
                  {currentQ.createdBy?.name || 'Mahasiswa'}
                </strong>
              </span>
            </div>

            {/* Progress Bar (Green Track + Green Fill per Design System) */}
            <div className="w-full bg-[#DCFCE7] h-[6px] rounded-full overflow-hidden">
              <div
                className="bg-[#22C55E] h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / availableQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text & Options */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 space-y-5">
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#1E293B] leading-relaxed">
              {currentQ.questionText}
            </h3>

            {/* TYPE: MULTIPLE CHOICE */}
            {currentQ.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2.5 pt-1">
                {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                  const optText = currentQ.options?.[optIdx];
                  if (!optText) return null;
                  const isSelected = userAnswers[currentQ.id] === letter;

                  return (
                    <button
                      type="button"
                      key={letter}
                      onClick={() => handleSelectAnswer(currentQ.id, letter)}
                      className={`w-full text-left p-3.5 rounded-xl border text-[13px] transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-[#EAF2FF] border-[#1D63FF] text-[#1E293B] font-semibold'
                          : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0 ${
                          isSelected
                            ? 'bg-[#1D63FF] text-white'
                            : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]'
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
                <label className="block text-[12px] font-semibold text-[#1E293B]">
                  Ketik Jawaban Singkat Kamu:
                </label>
                <input
                  type="text"
                  placeholder="Ketik jawaban di sini..."
                  value={userAnswers[currentQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3.5 text-[13px] focus:border-[#1D63FF] focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            {/* TYPE: ESSAY */}
            {currentQ.type === 'ESSAY' && (
              <div className="pt-2 space-y-2">
                <label className="block text-[12px] font-semibold text-[#1E293B]">
                  Tulis Jawaban / Analisis Kamu:
                </label>
                <textarea
                  rows={5}
                  placeholder="Tuliskan analisis atau konsep jawaban kamu di sini..."
                  value={userAnswers[currentQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3.5 text-[13px] focus:border-[#1D63FF] focus:outline-none"
                />
                <p className="text-[11.5px] text-[#64748B]">
                  * Setelah diselesaikan, model jawaban ideal dosen akan ditampilkan untuk evaluasi mandiri.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4 text-[12.5px]">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] transition-colors disabled:opacity-40 font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <div className="flex items-center gap-2">
              {currentIndex < availableQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white font-semibold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Memeriksa...' : 'Selesaikan & Lihat Nilai'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: RESULT & EVALUATION SCREEN */}
      {stage === 'RESULT' && resultData && (
        <div className="space-y-6">
          {/* Big Score Card */}
          <div className="bg-[#F4F7FE] border border-[#E2E8F0] rounded-2xl p-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[12px] font-bold text-[#1D63FF] bg-[#CFE2FF] px-3 py-1 rounded-full uppercase">
                Hasil Evaluasi Latihan
              </span>
              {resultData.completedAt && (
                <span className="text-[12px] text-[#64748B]">
                  • {new Date(resultData.completedAt).toLocaleString('id-ID')}
                </span>
              )}
            </div>

            <div className="text-[52px] font-extrabold text-[#1D63FF] leading-none pt-2">
              {resultData.totalScore !== undefined ? resultData.totalScore : resultData.score}
              <span className="text-[22px] font-semibold text-[#94A3B8]"> / 100</span>
            </div>

            <p className="text-[13px] text-[#64748B]">
              Benar <strong className="text-[#1E293B]">{resultData.correctCount}</strong> dari{' '}
              {resultData.autoCount !== undefined
                ? resultData.autoCount
                : resultData.autoGradableCount}{' '}
              soal pilihan ganda / isian ({resultData.totalItems} total soal).
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
            <button
              type="button"
              onClick={() => {
                if (availableQuestions.length === 0 && resultData?.evaluatedAnswers) {
                  setAvailableQuestions(
                    resultData.evaluatedAnswers.map((ev) => ({
                      id: ev.questionId,
                      type: ev.type,
                      questionText: ev.questionText,
                      pageReference: ev.pageReference,
                      options: ev.options,
                      correctAnswer: ev.correctAnswer,
                      explanation: ev.explanation,
                      essayRubric: ev.essayRubric,
                      session: ev.session,
                    }))
                  );
                }
                setStage('PLAYING');
                setCurrentIndex(0);
                setUserAnswers({});
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#1D63FF] text-[#1E293B] font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-[#1D63FF]" />
              <span>Ulangi Latihan Ini</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white font-semibold transition-colors"
            >
              Kembali ke Bank Soal
            </button>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-semibold text-[#1E293B] border-b border-[#E2E8F0] pb-2.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1D63FF]" />
              <span>Pembahasan & Kunci Jawaban Lengkap</span>
            </h3>

            <div className="space-y-3.5">
              {resultData.evaluatedAnswers?.map((ev, idx) => (
                <div
                  key={ev.questionId || idx}
                  className={`bg-white border rounded-2xl p-5 space-y-3.5 text-[13px] ${
                    ev.isCorrect === true
                      ? 'border-[#D1FADF]'
                      : ev.isCorrect === false
                      ? 'border-[#FFE4E6]'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold bg-[#EAF2FF] text-[#1D63FF] px-2.5 py-0.5 rounded-md text-[11px]">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-[#64748B] text-[12px]">
                        M-{String(ev.session?.sessionNumber || 1).padStart(2, '0')} • Slide Hal.{' '}
                        {ev.pageReference || 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      {ev.isCorrect === true && (
                        <span className="text-[#059669] bg-[#ECFDF3] px-2.5 py-0.5 rounded-md border border-[#D1FADF] inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Benar</span>
                        </span>
                      )}
                      {ev.isCorrect === false && (
                        <span className="text-[#E11D48] bg-[#FFF1F2] px-2.5 py-0.5 rounded-md border border-[#FFE4E6] inline-flex items-center gap-1">
                          <X className="w-3.5 h-3.5" />
                          <span>Salah</span>
                        </span>
                      )}
                      {ev.isCorrect === null && (
                        <span className="text-[#7C3AED] bg-[#F3E8FF] px-2.5 py-0.5 rounded-md border border-[#E9D5FF]">
                          Evaluasi Essay
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question text */}
                  <p className="text-[15px] font-semibold text-[#1E293B] leading-snug">
                    {ev.questionText}
                  </p>

                  {/* Multiple Choice options */}
                  {ev.type === 'MULTIPLE_CHOICE' && ev.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[12.5px]">
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                        const optText = ev.options[optIdx];
                        if (!optText) return null;
                        const isCorrectOption = ev.correctAnswer === letter;
                        const isUserOption = ev.userAnswer === letter;

                        return (
                          <div
                            key={letter}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                              isCorrectOption
                                ? 'bg-[#ECFDF3] border-[#D1FADF] text-[#059669] font-semibold'
                                : isUserOption && !ev.isCorrect
                                ? 'bg-[#FFF1F2] border-[#FFE4E6] text-[#E11D48] font-semibold'
                                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isCorrectOption
                                  ? 'bg-[#22C55E] text-white'
                                  : isUserOption && !ev.isCorrect
                                  ? 'bg-[#E11D48] text-white'
                                  : 'bg-white border border-[#E2E8F0] text-[#64748B]'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="pt-0.5">{optText}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* User Answer vs Key Answer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-[12px]">
                    <div>
                      <span className="text-[#64748B] block font-medium mb-0.5">
                        Jawaban Kamu:
                      </span>
                      <span
                        className={`font-semibold ${
                          ev.isCorrect ? 'text-[#059669]' : 'text-[#E11D48]'
                        }`}
                      >
                        {ev.userAnswer || '(Tidak dijawab)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block font-medium mb-0.5">
                        Kunci Jawaban Benar:
                      </span>
                      <span className="font-semibold text-[#1E293B]">
                        {ev.correctAnswer || '(Lihat Rubrik di bawah)'}
                      </span>
                    </div>
                  </div>

                  {/* Essay Rubric */}
                  {ev.essayRubric && (
                    <div className="bg-[#F3E8FF]/60 border border-[#E9D5FF] rounded-xl p-3.5 text-[12px]">
                      <span className="font-bold text-[#7C3AED] block mb-1">
                        Model Jawaban / Rubrik Dosen:
                      </span>
                      <p className="text-[#1E293B] whitespace-pre-line">{ev.essayRubric}</p>
                    </div>
                  )}

                  {/* Explanation */}
                  {ev.explanation && (
                    <div className="bg-[#FFFBEB] border border-[#FEF0C7] rounded-xl p-3.5 text-[12px]">
                      <span className="font-bold text-[#D97706] block mb-1">
                        Pembahasan (Slide Hal. {ev.pageReference}):
                      </span>
                      <p className="text-[#1E293B]">{ev.explanation}</p>
                    </div>
                  )}

                  {/* AI Explanation */}
                  <AiExplanationBlock
                    questionId={ev.questionId}
                    userAnswer={ev.userAnswer}
                    isCorrect={ev.isCorrect}
                    cachedExplanation={ev.aiExplanation || null}
                    questionData={ev}
                  />

                  {ev.contributor && (
                    <div className="text-[11px] text-[#94A3B8] pt-1">
                      Disusun oleh: {ev.contributor?.name} ({ev.contributor?.nim})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
