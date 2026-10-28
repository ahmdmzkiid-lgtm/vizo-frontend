import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  Clock,
  Plus,
  Download,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';

export default function DeadlineBoard() {
  const { user, isKetuaKelas, isPJMatkul } = useAuth();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`vizo_todo_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    courseId: '',
    title: '',
    description: '',
    deadline: '',
    file: null,
  });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, coursesRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/courses'),
      ]);
      setAssignments(assignRes.data.assignments || []);
      setCourses(coursesRes.data.courses || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTaskDone = (assignmentId) => {
    const updated = completedTasks.includes(assignmentId)
      ? completedTasks.filter((id) => id !== assignmentId)
      : [...completedTasks, assignmentId];

    setCompletedTasks(updated);
    if (user?.id) {
      localStorage.setItem(`vizo_todo_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('courseId', newAssignment.courseId);
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('deadline', newAssignment.deadline);
      if (newAssignment.file) {
        formData.append('file', newAssignment.file);
      }

      await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowCreateModal(false);
      setNewAssignment({
        courseId: '',
        title: '',
        description: '',
        deadline: '',
        file: null,
      });
      toast.success('Tugas perkuliahan berhasil dicatat.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat tugas.');
    } finally {
      setCreating(false);
    }
  };

  const getUrgency = (deadlineStr, isDone) => {
    if (isDone)
      return {
        label: 'Selesai Dikerjakan',
        color: 'bg-[#D1FADF] text-[#059669]',
      };
    const diffHours = (new Date(deadlineStr) - new Date()) / (1000 * 60 * 60);
    if (diffHours < 0)
      return {
        label: 'Sudah Lewat',
        color: 'bg-[#F1F5F9] text-[#64748B]',
      };
    if (diffHours <= 24)
      return {
        label: '< 24 Jam (Kritis)',
        color: 'bg-[#FFE4E6] text-[#E11D48]',
      };
    if (diffHours <= 72)
      return {
        label: '< 3 Hari',
        color: 'bg-[#FEF0C7] text-[#D97706]',
      };
    return {
      label: 'Aktif',
      color: 'bg-[#CFE2FF] text-[#1D63FF]',
    };
  };

  const filteredAssignments = assignments.filter((a) => {
    const isDone = completedTasks.includes(a.id);
    if (filterStatus === 'PENDING') return !isDone;
    if (filterStatus === 'DONE') return isDone;
    return true;
  });

  const pendingCount = assignments.filter((a) => !completedTasks.includes(a.id)).length;
  const doneCount = assignments.filter((a) => completedTasks.includes(a.id)).length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Hero Banner */}
      <div className="bg-[#F4F7FE] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#1D63FF]">
              Tenggat Tugas & To-Do List
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1">
              Daftar tugas kuliah sekelas. Tandai checklist pribadi kamu jika sudah menyelesaikan tugas.
            </p>
          </div>

          {(isKetuaKelas || isPJMatkul) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold inline-flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Tugas Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`py-2 px-4 rounded-xl text-[12.5px] font-semibold transition-all ${
            filterStatus === 'ALL'
              ? 'bg-[#EBF2FF] text-[#1D63FF]'
              : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1E293B]'
          }`}
        >
          Semua ({assignments.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`py-2 px-4 rounded-xl text-[12.5px] font-semibold transition-all ${
            filterStatus === 'PENDING'
              ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF0C7]'
              : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1E293B]'
          }`}
        >
          Belum Selesai ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('DONE')}
          className={`py-2 px-4 rounded-xl text-[12.5px] font-semibold transition-all ${
            filterStatus === 'DONE'
              ? 'bg-[#ECFDF3] text-[#059669] border border-[#D1FADF]'
              : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1E293B]'
          }`}
        >
          Sudah Selesai ({doneCount})
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="py-16 text-center text-[13px] text-[#64748B]">
          Memuat daftar tugas kuliah...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <Clock className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
          <p className="text-[13px] text-[#64748B]">
            {filterStatus === 'DONE'
              ? 'Belum ada tugas yang kamu tandai selesai.'
              : filterStatus === 'PENDING'
              ? 'Semua tugas telah kamu selesaikan! Mantap.'
              : 'Tidak ada tugas perkuliahan tercatat.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const isDone = completedTasks.includes(assignment.id);
            const urgency = getUrgency(assignment.deadline, isDone);

            return (
              <div
                key={assignment.id}
                className={`bg-white border rounded-2xl p-5 transition-all ${
                  isDone
                    ? 'border-[#D1FADF] bg-[#ECFDF3]/20'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold bg-[#EAF2FF] text-[#1D63FF] px-2.5 py-0.5 rounded-md">
                        {assignment.course.code}
                      </span>
                      <span className="text-[12px] font-medium text-[#64748B]">
                        {assignment.course.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${urgency.color}`}
                      >
                        {urgency.label}
                      </span>
                    </div>

                    <h3
                      className={`text-[16px] font-semibold ${
                        isDone ? 'line-through text-[#94A3B8]' : 'text-[#1E293B]'
                      }`}
                    >
                      {assignment.title}
                    </h3>
                  </div>

                  <div className="text-left lg:text-right">
                    <span className="text-[11px] font-medium text-[#94A3B8] block">
                      Batas Waktu (Deadline)
                    </span>
                    <span className="text-[13px] font-semibold text-[#E11D48] block mt-0.5">
                      {new Date(assignment.deadline).toLocaleString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13px] text-[#64748B] whitespace-pre-line mb-4 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
                  <div>
                    {assignment.attachmentUrl ? (
                      <a
                        href={assignment.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#1D63FF] hover:underline font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Soal Dosen</span>
                      </a>
                    ) : (
                      <span className="text-[#94A3B8] italic">
                        Tidak ada lampiran soal.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskDone(assignment.id)}
                      className={`py-2 px-4 rounded-xl text-[12px] font-semibold transition-all inline-flex items-center gap-2 ${
                        isDone
                          ? 'bg-[#22C55E] text-white hover:bg-emerald-600'
                          : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] hover:bg-[#EBF2FF] hover:border-[#CFE2FF] hover:text-[#1D63FF]'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Sudah Dikerjakan ✓</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-[#94A3B8]" />
                          <span>Tandai Selesai</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
              <div>
                <h3 className="text-[16px] font-bold text-[#1E293B]">
                  Catat Tugas Perkuliahan
                </h3>
                <p className="text-[12px] text-[#64748B]">
                  Tambahkan tugas baru beserta batas waktu pengumpulan
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Pilih Mata Kuliah
                </label>
                <select
                  required
                  value={newAssignment.courseId}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, courseId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                >
                  <option value="">-- Pilih Mata Kuliah --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tugas 02 - Normalisasi Database"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Batas Waktu Pengumpulan (Deadline)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newAssignment.deadline}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, deadline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Instruksi & Tempat Pengumpulan
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Misal: Kumpul via Google Classroom / kirim ke email dosen..."
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Lampirkan File Soal Dosen (Opsional)
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, file: e.target.files[0] })
                  }
                  className="w-full p-2.5 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-[12px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold disabled:opacity-50"
                >
                  {creating ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
