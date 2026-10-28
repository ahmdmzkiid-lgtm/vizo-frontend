import React from 'react';
import { X, Play } from 'lucide-react';

export default function QuestionPreviewModal({
  contribution,
  questions,
  onClose,
  onStartQuiz,
}) {
  if (!contribution) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-3xl relative shadow-xl my-6 overflow-hidden animate-in">
        {/* Modal Header */}
        <div className="bg-[#F4F7FE] px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] font-bold bg-[#CFE2FF] text-[#1D63FF] px-2.5 py-1 rounded-md uppercase shrink-0">
              Detail Latihan
            </span>
            <h2 className="text-[15px] font-bold text-[#1E293B] truncate">
              {contribution.notes ||
                `Latihan Slide Hal. ${contribution.startPage}–${contribution.endPage}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub Header Info */}
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-3 text-[12px] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg font-semibold text-[#1E293B]">
              Cakupan: Slide Hal. {contribution.startPage}–{contribution.endPage}
            </span>
            <span className="text-[#64748B]">
              Total: <strong className="text-[#1E293B]">{questions.length} Soal</strong>
            </span>
            <span className="text-[#64748B]">
              Penyusun:{' '}
              <strong className="text-[#1E293B]">{contribution.contributor?.name}</strong> (
              {contribution.contributor?.nim})
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="p-6 space-y-4 max-h-[62vh] overflow-y-auto bg-[#F8FAFC]/50">
          {questions.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#64748B]">
              Memuat butir soal...
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 text-[12.5px]"
              >
                {/* Item header */}
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold bg-[#EAF2FF] text-[#1D63FF] px-2 py-0.5 rounded-md text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="text-[#64748B] font-medium text-[11.5px]">
                      Slide Hal. {q.pageReference || 1}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                        q.type === 'MULTIPLE_CHOICE'
                          ? 'bg-[#EAF2FF] text-[#1D63FF]'
                          : q.type === 'SHORT_ANSWER'
                          ? 'bg-[#FFFBEB] text-[#D97706]'
                          : 'bg-[#F3E8FF] text-[#7C3AED]'
                      }`}
                    >
                      {q.type === 'MULTIPLE_CHOICE'
                        ? 'Pilihan Ganda'
                        : q.type === 'SHORT_ANSWER'
                        ? 'Isian Singkat'
                        : 'Essay'}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <h4 className="text-[14px] font-semibold text-[#1E293B] leading-snug">
                  {q.questionText}
                </h4>

                {/* Multiple Choice options */}
                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                      const optText = q.options[optIdx];
                      if (!optText) return null;
                      const isCorrect = q.correctAnswer === letter;
                      return (
                        <div
                          key={letter}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                            isCorrect
                              ? 'bg-[#ECFDF3] border-[#D1FADF] text-[#059669] font-semibold'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isCorrect
                                ? 'bg-[#22C55E] text-white'
                                : 'bg-white text-[#64748B] border border-[#E2E8F0]'
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

                {/* Short Answer */}
                {q.type === 'SHORT_ANSWER' && (
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5">
                    <span className="text-[#64748B] font-semibold block text-[10px] mb-1">
                      KUNCI JAWABAN:
                    </span>
                    <span className="font-semibold text-[#1E293B] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0] inline-block">
                      {q.correctAnswer}
                    </span>
                  </div>
                )}

                {/* Essay */}
                {q.type === 'ESSAY' && q.essayRubric && (
                  <div className="bg-[#F3E8FF]/60 border border-[#E9D5FF] rounded-xl p-3">
                    <span className="text-[#7C3AED] font-bold block mb-1 text-[10px]">
                      RUBRIK / MODEL JAWABAN DOSEN:
                    </span>
                    <p className="text-[#1E293B] whitespace-pre-line text-[12px]">
                      {q.essayRubric}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="bg-[#FFFBEB] border border-[#FEF0C7] rounded-xl p-3">
                    <span className="text-[#D97706] font-bold block mb-0.5 text-[10px]">
                      PEMBAHASAN (SLIDE HAL. {q.pageReference}):
                    </span>
                    <p className="text-[#1E293B] text-[12px]">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-[12px]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] font-semibold transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onStartQuiz(contribution.id);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Kerjakan Latihan Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
}
