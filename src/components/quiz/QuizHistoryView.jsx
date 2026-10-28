import React from 'react';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

export default function QuizHistoryView({
  course,
  attempts,
  loading,
  onSelectAttempt,
  onStartQuiz,
}) {
  if (loading) {
    return (
      <div className="p-12 text-center text-[13px] text-[#64748B] bg-white border border-[#E2E8F0] rounded-2xl">
        Memuat riwayat pengerjaan...
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-4">
        <Clock className="w-10 h-10 text-[#94A3B8] mx-auto" />
        <div>
          <h3 className="text-[16px] font-bold text-[#1E293B]">
            Belum Ada Riwayat Pengerjaan
          </h3>
          <p className="text-[12.5px] text-[#64748B] mt-1 max-w-md mx-auto">
            Kamu belum pernah menyelesaikan latihan soal pada mata kuliah ini. Nilai dan pembahasan akan otomatis tersimpan di sini.
          </p>
        </div>
        <button
          onClick={onStartQuiz}
          className="px-5 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12.5px] font-semibold transition-colors inline-flex items-center gap-2"
        >
          <span>Mulai Latihan Pertama</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5 text-[12.5px]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1D63FF]" />
          <span className="font-semibold text-[#1E293B]">
            Riwayat Latihan Saya ({attempts.length} Sesi)
          </span>
        </div>
        <span className="text-[#94A3B8]">Tersimpan otomatis</span>
      </div>

      <div className="space-y-3">
        {attempts.map((att) => {
          const sessionTarget = course.sessions?.find((s) => s.id === att.sessionId);

          return (
            <div
              key={att.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 shrink-0 rounded-xl bg-[#EAF2FF] text-[#1D63FF] flex flex-col items-center justify-center">
                  <span className="text-[20px] font-bold leading-none">
                    {Math.round(att.totalScore)}
                  </span>
                  <span className="text-[9px] uppercase font-bold mt-0.5">Skor</span>
                </div>

                <div className="space-y-1">
                  <div>
                    <span className="text-[14.5px] font-semibold text-[#1E293B]">
                      {sessionTarget
                        ? `M-${String(sessionTarget.sessionNumber).padStart(2, '0')}: ${sessionTarget.topicTitle}`
                        : 'Simulasi Seluruh Modul (UTS / UAS)'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#64748B]">
                    <span>
                      Benar <strong className="text-[#1E293B]">{att.correctCount}</strong> dari{' '}
                      {att.autoCount} soal otomatis ({att.totalItems} total butir)
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(att.completedAt).toLocaleString('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectAttempt(att)}
                className="bg-[#CFE2FF] hover:bg-[#1D63FF] text-[#1D63FF] hover:text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka Pembahasan</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
