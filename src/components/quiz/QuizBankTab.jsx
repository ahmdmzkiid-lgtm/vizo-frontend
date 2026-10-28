import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import ConfirmModal from '../ConfirmModal';
import ContributionModal from './ContributionModal';
import QuestionPreviewModal from './QuestionPreviewModal';
import QuizPracticeView from './QuizPracticeView';
import {
  Plus,
  Play,
  BookOpen,
  Layers,
  Trash2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

export default function QuizBankTab({ course, canManageCourse }) {
  const { user } = useAuth();
  const toast = useToast();
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false,
  });

  const [viewMode, setViewMode] = useState('MODULES');

  const [practiceSessionId, setPracticeSessionId] = useState('ALL');
  const [practiceContributionId, setPracticeContributionId] = useState(null);
  const [reviewAttempt, setReviewAttempt] = useState(null);

  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionInitialSession, setContributionInitialSession] = useState(null);
  const [contributionInitialMode, setContributionInitialMode] = useState('MANUAL');

  const [previewContribution, setPreviewContribution] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);

  useEffect(() => {
    fetchQuizSummary();
    fetchQuestions();
    fetchAttempts();
  }, [course.id]);

  const fetchQuizSummary = async () => {
    try {
      const res = await api.get(`/quiz/courses/${course.id}/summary`);
      setSummary(res.data.summary);
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Fetch quiz summary error:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quiz/courses/${course.id}/questions`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Fetch questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      const res = await api.get(`/quiz/courses/${course.id}/attempts/my`);
      setAttempts(res.data.attempts || []);
    } catch (err) {
      console.error('Fetch attempts error:', err);
    }
  };

  const handleStartPractice = (sessionId = 'ALL', contributionId = null) => {
    setPracticeSessionId(sessionId);
    setPracticeContributionId(contributionId);
    setReviewAttempt(null);
    setViewMode('PRACTICE');
  };

  const handleReviewAttempt = (attempt) => {
    setReviewAttempt(attempt);
    setViewMode('PRACTICE');
  };

  const getAttemptForContribution = (contributionId) => {
    if (!attempts || attempts.length === 0) return null;
    return attempts.find((att) =>
      att.evaluatedAnswers?.some((ans) => {
        if (ans.contributionId && ans.contributionId === contributionId) return true;
        const q = questions.find((item) => item.id === ans.questionId);
        return q && q.contributionId === contributionId;
      })
    );
  };

  const getAttemptForSession = (sessionId) => {
    if (!attempts || attempts.length === 0) return null;
    return attempts.find((att) => {
      if (att.sessionId === sessionId) return true;
      return att.evaluatedAnswers?.some((ans) => {
        if (ans.session?.id === sessionId) return true;
        const q = questions.find((item) => item.id === ans.questionId);
        return q && q.sessionId === sessionId;
      });
    });
  };

  const handleBackFromPractice = () => {
    setViewMode('MODULES');
    setReviewAttempt(null);
    fetchQuizSummary();
    fetchAttempts();
  };

  const handleDeleteContribution = (contributionId) => {
    setConfirmState({
      open: true,
      title: 'Hapus Latihan',
      message: 'Yakin ingin menghapus latihan ini beserta soal di dalamnya?',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmState((s) => ({ ...s, loading: true }));
          await api.delete(`/quiz/contributions/${contributionId}`);
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
          });
          toast.success('Latihan berhasil dihapus.');
          fetchQuizSummary();
          fetchQuestions();
        } catch (err) {
          console.error('Delete contribution error:', err);
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
          });
          toast.error(
            'Gagal menghapus latihan: ' + (err.response?.data?.message || err.message)
          );
        }
      },
    });
  };

  if (viewMode === 'PRACTICE') {
    return (
      <QuizPracticeView
        course={course}
        initialSessionId={practiceSessionId}
        initialContributionId={practiceContributionId}
        reviewAttempt={reviewAttempt}
        onBack={handleBackFromPractice}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Bar: Modul Title + Simulasi UTS/UAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EAF2FF] text-[#1D63FF] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-[14px] font-semibold text-[#1E293B]">
            Daftar Latihan per Modul (M-01 — M-16)
          </span>
        </div>

        {summary && summary.totalQuestions > 0 && (
          <button
            onClick={() => handleStartPractice('ALL', null)}
            className="bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulasi UTS / UAS (Semua Modul)</span>
          </button>
        )}
      </div>

      {/* DAFTAR PERTEMUAN M-01 SAMPAI M-16 */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-[13px] text-[#64748B] bg-white border border-[#E2E8F0] rounded-2xl">
            Memuat daftar latihan modul...
          </div>
        ) : (
          sessions.map((session) => {
            const sessionQuestions = questions.filter((q) => q.sessionId === session.id);
            const hasQuestions = sessionQuestions.length > 0;
            const contributions = session.contributions || [];

            return (
              <div
                key={session.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 transition-all"
              >
                {/* Header Pertemuan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3.5 mb-3.5">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-[12px] font-bold bg-[#EAF2FF] text-[#1D63FF] px-3 py-1.5 rounded-lg shrink-0">
                      M-{String(session.sessionNumber).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14.5px] font-semibold text-[#1E293B]">
                          {session.topicTitle}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                            hasQuestions
                              ? 'bg-[#D1FADF] text-[#059669]'
                              : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          {sessionQuestions.length} Soal
                        </span>
                      </div>

                      {/* Covered page indicators */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[11px] text-[#64748B]">Cakupan Slide:</span>
                        {contributions.length > 0 ? (
                          contributions.map((c) => (
                            <span
                              key={c.id}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#1E293B] border border-[#E2E8F0]"
                              title={`Disusun oleh: ${c.contributor?.name} (${c.questionsCount} soal)`}
                            >
                              Hal. {c.startPage}–{c.endPage} ({c.questionsCount} soal)
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] italic">
                            Belum ada halaman yang ter-cover
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons on this session */}
                  <div className="flex flex-wrap items-center gap-2 text-[11.5px] shrink-0">
                    <button
                      onClick={() => {
                        setContributionInitialSession(session.id);
                        setContributionInitialMode('MANUAL');
                        setShowContributionModal(true);
                      }}
                      className="bg-[#CFE2FF] hover:bg-[#1D63FF] text-[#1D63FF] hover:text-white font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Soal</span>
                    </button>

                    <button
                      onClick={() => {
                        setContributionInitialSession(session.id);
                        setContributionInitialMode('EXCEL');
                        setShowContributionModal(true);
                      }}
                      className="bg-[#ECFDF3] hover:bg-[#059669] text-[#059669] hover:text-white border border-[#D1FADF] font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Bulk import banyak soal sekaligus dari file Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Import Excel</span>
                    </button>

                    {hasQuestions && (
                      <>
                        {(() => {
                          const sessionAttempt = getAttemptForSession(session.id);
                          if (!sessionAttempt) return null;
                          return (
                            <button
                              onClick={() => handleReviewAttempt(sessionAttempt)}
                              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] hover:border-[#1D63FF] hover:text-[#1D63FF] font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                              title="Lihat pembahasan pengerjaan sesi ini"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#1D63FF]" />
                              <span>Pembahasan</span>
                            </button>
                          );
                        })()}

                        <button
                          onClick={() => handleStartPractice(session.id, null)}
                          className="bg-[#1D63FF] hover:bg-[#1550D6] text-white font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Kerjakan Semua ({sessionQuestions.length})</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Body: Daftar Latihan per 5 Halaman Slide */}
                {contributions.length === 0 ? (
                  <div className="py-5 text-center text-[12px] text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]/50">
                    <p>
                      Belum ada latihan soal untuk pertemuan M-
                      {String(session.sessionNumber).padStart(2, '0')}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {contributions.map((c, cIdx) => (
                      <div
                        key={c.id}
                        className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl flex flex-col justify-between space-y-3 group transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#EAF2FF] text-[#1D63FF] shrink-0 text-[12px] font-bold flex items-center justify-center">
                              {String(cIdx + 1).padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#1D63FF] leading-snug line-clamp-2 transition-colors">
                                {c.notes || `Latihan Slide (Hal. ${c.startPage}–${c.endPage})`}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-[#64748B]">
                                <span className="bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-md font-semibold text-[#1E293B]">
                                  Hal. {c.startPage}–{c.endPage}
                                </span>
                                <span>•</span>
                                <span className="font-semibold text-[#1E293B]">
                                  {c.questionsCount} Soal
                                </span>
                                <span>•</span>
                                <span className="truncate max-w-[130px]">
                                  {c.contributor?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card footer actions */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] text-[11.5px]">
                          <button
                            onClick={() => {
                              const pkgQuestions = questions.filter(
                                (q) => q.contributionId === c.id
                              );
                              setPreviewContribution(c);
                              setPreviewQuestions(pkgQuestions);
                            }}
                            className="text-[#64748B] hover:text-[#1D63FF] font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Soal ({c.questionsCount})</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {(user?.id === c.contributor?.id || canManageCourse) && (
                              <button
                                onClick={() => handleDeleteContribution(c.id)}
                                className="text-[#94A3B8] hover:text-[#E11D48] p-1 rounded-md transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {(() => {
                              const contributionAttempt = getAttemptForContribution(c.id);
                              if (!contributionAttempt) return null;
                              return (
                                <button
                                  onClick={() => handleReviewAttempt(contributionAttempt)}
                                  className="bg-white border border-[#E2E8F0] text-[#1E293B] hover:border-[#1D63FF] hover:text-[#1D63FF] px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                                  title="Lihat riwayat dan pembahasan latihan ini"
                                >
                                  <BookOpen className="w-3 h-3 text-[#1D63FF]" />
                                  <span>Pembahasan</span>
                                </button>
                              );
                            })()}

                            <button
                              onClick={() => handleStartPractice(session.id, c.id)}
                              className="bg-[#1D63FF] hover:bg-[#1550D6] text-white px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Kerjakan</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL KONTRIBUSI SOAL */}
      {showContributionModal && (
        <ContributionModal
          course={course}
          sessions={sessions}
          initialSessionId={contributionInitialSession}
          initialMode={contributionInitialMode}
          onClose={() => setShowContributionModal(false)}
          onSuccess={() => {
            setShowContributionModal(false);
            fetchQuizSummary();
            fetchQuestions();
          }}
        />
      )}

      {/* MODAL DETAIL / PREVIEW SOAL */}
      {previewContribution && (
        <QuestionPreviewModal
          contribution={previewContribution}
          questions={previewQuestions}
          onClose={() => {
            setPreviewContribution(null);
            setPreviewQuestions([]);
          }}
          onStartQuiz={(contributionId) => {
            setPreviewContribution(null);
            handleStartPractice(
              previewContribution.sessionId || sessions[0]?.id,
              contributionId
            );
          }}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        loading={confirmState.loading}
        confirmText="Ya, Hapus"
        onConfirm={confirmState.onConfirm}
        onCancel={() =>
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
          })
        }
      />
    </div>
  );
}
