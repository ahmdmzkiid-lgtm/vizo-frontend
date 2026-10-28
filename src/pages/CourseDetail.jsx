import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import CourseAvatarIcon, {
  CourseIconCrudModal,
  resolveCourseAvatar,
  extractIconFromDescription,
  embedIconInDescription,
  setLocalCourseIcon,
} from '../components/CourseAvatarIcon';
import QuizBankTab from '../components/quiz/QuizBankTab';
import {
  ArrowLeft,
  FileText,
  Video,
  Link2,
  Download,
  Trash2,
  Eye,
  Plus,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, canManageCourse } = useAuth();
  const toast = useToast();

  const initialView = searchParams.get('view');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    initialView === 'quiz'
      ? 'QUIZ'
      : initialView === 'assignments'
      ? 'ASSIGNMENTS'
      : 'SESSIONS'
  );
  const tabsRef = useRef(null);

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false,
  });

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`vizo_todo_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleTaskDone = (assignmentId) => {
    const updated = completedTasks.includes(assignmentId)
      ? completedTasks.filter((taskId) => taskId !== assignmentId)
      : [...completedTasks, assignmentId];
    setCompletedTasks(updated);
    if (user?.id) {
      localStorage.setItem(`vizo_todo_${user.id}`, JSON.stringify(updated));
    }
  };

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSessionNumber, setSelectedSessionNumber] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'PDF',
    file: null,
    externalUrl: '',
  });
  const [uploading, setUploading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const [savingIcon, setSavingIcon] = useState(false);
  const [iconVersion, setIconVersion] = useState(0);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.course);
    } catch (error) {
      console.error('Failed to fetch course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleSaveCourseIcon = async (newIconId) => {
    if (!course) return;
    setSavingIcon(true);
    try {
      setLocalCourseIcon(course.id, newIconId);
      if (canManageCourse(course.id)) {
        const { cleanDescription } = extractIconFromDescription(course.description);
        const descriptionWithIcon = embedIconInDescription(cleanDescription, newIconId);
        await api.put(`/courses/${course.id}`, {
          code: course.code,
          name: course.name,
          semester: course.semester,
          credits: course.credits,
          lecturerName: course.lecturerName,
          lecturerContact: course.lecturerContact || '',
          scheduleDay: course.scheduleDay || 'Senin',
          scheduleTime: course.scheduleTime || '08:00 - 10:30 WIB',
          room: course.room || 'Ruang Kuliah',
          description: descriptionWithIcon,
        });
      }
      setIconVersion((v) => v + 1);
      setShowIconModal(false);
      toast.success(
        newIconId
          ? 'Icon avatar mata kuliah berhasil diperbarui!'
          : 'Icon mata kuliah di-reset ke default.'
      );
      fetchCourse();
    } catch {
      setIconVersion((v) => v + 1);
      setShowIconModal(false);
      toast.success('Icon avatar mata kuliah berhasil diterapkan.');
    } finally {
      setSavingIcon(false);
    }
  };

  const handleOpenUpload = (session) => {
    setSelectedSessionId(session.id);
    setSelectedSessionNumber(session.sessionNumber);
    setUploadData({
      title: '',
      type: 'PDF',
      file: null,
      externalUrl: '',
    });
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('sessionId', selectedSessionId);
      formData.append('courseId', course.id);
      formData.append('title', uploadData.title);
      formData.append('type', uploadData.type);

      if (['PDF', 'SLIDE', 'OTHER'].includes(uploadData.type)) {
        if (!uploadData.file) {
          toast.warning('Pilih file materi yang ingin diunggah!');
          setUploading(false);
          return;
        }
        formData.append('file', uploadData.file);
      } else {
        if (!uploadData.externalUrl) {
          toast.warning('Masukkan tautan / URL materi!');
          setUploading(false);
          return;
        }
        formData.append('externalUrl', uploadData.externalUrl);
      }

      await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowUploadModal(false);
      toast.success('Materi berhasil diunggah!');
      fetchCourse();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Gagal mengunggah materi: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = (materialId) => {
    setConfirmState({
      open: true,
      title: 'Hapus Materi',
      message:
        'Yakin ingin menghapus materi perkuliahan ini? File akan dihapus permanen dari storage.',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmState((s) => ({ ...s, loading: true }));
          await api.delete(`/materials/${materialId}`);
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
          });
          toast.success('Materi berhasil dihapus.');
          fetchCourse();
        } catch (error) {
          console.error('Delete failed:', error);
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
          });
          toast.error('Gagal menghapus materi: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handleDownload = async (material) => {
    if (material.id && material.r2Key) {
      try {
        const res = await api.get(`/materials/${material.id}/download`);
        if (res.data?.url) {
          window.open(res.data.url, '_blank');
        }
      } catch (err) {
        console.error('Download failed:', err);
        const token = localStorage.getItem('vizo_token') || '';
        const baseUrl = import.meta.env.VITE_API_URL || '/api';
        window.open(
          `${baseUrl}/materials/${material.id}/view?token=${token}&download=true`,
          '_blank'
        );
      }
    } else if (material.fileUrl) {
      window.open(material.fileUrl, '_blank');
    }
  };

  const handlePreview = async (material) => {
    if (material.id && material.r2Key) {
      try {
        const res = await api.get(`/materials/${material.id}/download`);
        if (res.data?.url) {
          setPreviewUrl(res.data.url);
        } else {
          const token = localStorage.getItem('vizo_token') || '';
          const baseUrl = import.meta.env.VITE_API_URL || '/api';
          setPreviewUrl(`${baseUrl}/materials/${material.id}/view?token=${token}`);
        }
      } catch (err) {
        console.error('Preview URL fetch failed:', err);
        const token = localStorage.getItem('vizo_token') || '';
        const baseUrl = import.meta.env.VITE_API_URL || '/api';
        setPreviewUrl(`${baseUrl}/materials/${material.id}/view?token=${token}`);
      }
    } else if (material.fileUrl) {
      setPreviewUrl(material.fileUrl);
    }
    setPreviewTitle(material.title);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#64748B] text-[13px]">
        <div className="w-5 h-5 rounded-full border-2 border-[#1D63FF] border-t-transparent animate-spin mr-3" />
        <span>Memuat arsip perkuliahan...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-[#E11D48] text-[16px] font-bold mb-4">
          Mata kuliah tidak ditemukan
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#1D63FF] text-white text-[13px] font-semibold hover:bg-[#1550D6] transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const hasManageRights = canManageCourse(course.id);
  const avatar = resolveCourseAvatar(course);
  const lecturerDigits = (course.lecturerContact || '').replace(/\D/g, '');
  const hasValidLecturerPhone = lecturerDigits.length >= 6;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/?tab=courses"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#64748B] hover:text-[#1D63FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Materi Kuliah</span>
        </Link>
      </div>

      {/* Course Header Banner */}
      <div
        key={`header-${course.id}-${iconVersion}`}
        className="bg-[#F4F7FE] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <CourseAvatarIcon
              course={course}
              size="lg"
              editable={true}
              onClickEdit={() => setShowIconModal(true)}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  style={{ backgroundColor: avatar.bg, color: avatar.accent }}
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase"
                >
                  {course.code}
                </span>
                <span className="text-[11px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                  Semester {course.semester} • {course.credits} SKS
                </span>
                {hasManageRights && (
                  <span className="text-[11px] font-semibold bg-[#ECFDF3] text-[#059669] border border-[#D1FADF] px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Akses Pengelola Aktif</span>
                  </span>
                )}
              </div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-[#1D63FF] leading-snug">
                {course.name}
              </h1>
              <p className="text-[13px] text-[#64748B] mt-1">
                Dosen Pengampu:{' '}
                <strong className="text-[#1E293B] font-semibold">{course.lecturerName}</strong>
              </p>
            </div>
          </div>

          {/* Quick Contacts & Icon CRUD Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowIconModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#EAF2FF] border border-[#E2E8F0] hover:border-[#CFE2FF] text-[#1E293B] hover:text-[#1D63FF] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1D63FF]" />
              <span>Ganti Icon</span>
            </button>

            {hasValidLecturerPhone && (
              <a
                href={`https://wa.me/${lecturerDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi Dosen ({course.lecturerContact})</span>
              </a>
            )}
          </div>
        </div>

        {/* Course Schedule & Coordinators Bar */}
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-[12px]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
            <div>
              <span className="text-[#64748B] mr-1.5">Jadwal:</span>
              <span className="font-semibold text-[#1E293B]">
                {course.scheduleDay || 'Senin'}, {course.scheduleTime || 'WIB'}
              </span>
            </div>
            <div className="sm:border-l sm:border-[#E2E8F0] sm:pl-4">
              <span className="text-[#64748B] mr-1.5">Ruangan:</span>
              <span className="font-semibold text-[#1D63FF]">
                {course.room || 'Ruang Kuliah'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#64748B]">PJ Matkul:</span>
            <span className="font-semibold text-[#1D63FF] bg-[#EAF2FF] px-2.5 py-0.5 rounded-md border border-[#CFE2FF]">
              {course.coordinators && course.coordinators.length > 0
                ? course.coordinators.map((c) => c.user.name).join(', ')
                : 'Belum ditetapkan'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-[#E2E8F0] pb-3">
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          className="sm:hidden p-2 mr-1 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1D63FF] shrink-0"
          aria-label="Geser tab ke kiri"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={tabsRef}
          className="flex items-center gap-2 overflow-x-auto whitespace-nowrap flex-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            onClick={() => setActiveTab('SESSIONS')}
            className={`py-2 px-4 rounded-xl text-[13px] font-semibold transition-all shrink-0 ${
              activeTab === 'SESSIONS'
                ? 'bg-[#EBF2FF] text-[#1D63FF]'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            16 Pertemuan & Materi
          </button>

          <button
            onClick={() => setActiveTab('ASSIGNMENTS')}
            className={`py-2 px-4 rounded-xl text-[13px] font-semibold transition-all shrink-0 ${
              activeTab === 'ASSIGNMENTS'
                ? 'bg-[#EBF2FF] text-[#1D63FF]'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            Tugas Kuliah ({course.assignments?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('QUIZ')}
            className={`py-2 px-4 rounded-xl text-[13px] font-semibold transition-all shrink-0 ${
              activeTab === 'QUIZ'
                ? 'bg-[#EBF2FF] text-[#1D63FF]'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            Latihan & Bank Soal
          </button>
        </div>

        <button
          type="button"
          onClick={() => scrollTabs('right')}
          className="sm:hidden p-2 ml-1 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1D63FF] shrink-0"
          aria-label="Geser tab ke kanan"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* TAB CONTENT: 16 SESSIONS */}
      {activeTab === 'SESSIONS' && (
        <div className="space-y-4">
          {course.sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3.5 mb-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-bold bg-[#EAF2FF] text-[#1D63FF] px-3 py-1.5 rounded-lg shrink-0">
                    M-{String(session.sessionNumber).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-[14.5px] font-semibold text-[#1E293B]">
                      {session.topicTitle}
                    </h3>
                    {session.notes && (
                      <p className="text-[12px] text-[#64748B] mt-0.5">{session.notes}</p>
                    )}
                  </div>
                </div>

                {hasManageRights && (
                  <button
                    onClick={() => handleOpenUpload(session)}
                    title="Tambah Materi"
                    className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Materi</span>
                  </button>
                )}
              </div>

              {/* Materials List */}
              {session.materials.length === 0 ? (
                <div className="py-4 text-center text-[12px] text-[#94A3B8]">
                  Belum ada slide atau dokumen yang diunggah untuk pertemuan ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {session.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#EAF2FF] text-[#1D63FF] flex items-center justify-center shrink-0">
                          {mat.type === 'VIDEO_LINK' ? (
                            <Video className="w-4 h-4" />
                          ) : mat.type === 'DRIVE_LINK' ? (
                            <Link2 className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-semibold text-[#1E293B] truncate">
                            {mat.title}
                          </h4>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">
                            {mat.type} • {mat.uploadedBy.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {mat.type === 'PDF' && (
                          <button
                            onClick={() => handlePreview(mat)}
                            title="Pratinjau PDF"
                            className="p-2 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#1D63FF] text-[#64748B] hover:text-[#1D63FF] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDownload(mat)}
                          title="Unduh / Buka File"
                          className="p-2 rounded-lg bg-[#CFE2FF] text-[#1D63FF] hover:bg-[#1D63FF] hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {hasManageRights && (
                          <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            title="Hapus Materi"
                            className="p-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#FFF1F2] hover:border-[#FFE4E6] text-[#E11D48] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: ASSIGNMENTS */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="space-y-4">
          {course.assignments.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
              <Clock className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-[13px] text-[#64748B]">
                Tidak ada tugas untuk mata kuliah ini saat ini.
              </p>
            </div>
          ) : (
            course.assignments.map((assignment) => {
              const isDone = completedTasks.includes(assignment.id);

              return (
                <div
                  key={assignment.id}
                  className={`bg-white border rounded-2xl p-5 transition-all ${
                    isDone ? 'border-[#D1FADF] bg-[#ECFDF3]/30' : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3.5 mb-3.5">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${
                          isDone
                            ? 'bg-[#D1FADF] text-[#059669]'
                            : 'bg-[#EAF2FF] text-[#1D63FF]'
                        }`}
                      >
                        {isDone ? 'Selesai ✓' : 'Tugas Kuliah'}
                      </span>
                      <h3
                        className={`text-[16px] font-semibold mt-1.5 ${
                          isDone ? 'line-through text-[#94A3B8]' : 'text-[#1E293B]'
                        }`}
                      >
                        {assignment.title}
                      </h3>
                    </div>
                    <div className="text-[12px] text-[#E11D48] font-semibold bg-[#FFF1F2] border border-[#FFE4E6] px-3 py-1.5 rounded-lg self-start sm:self-auto">
                      Tenggat: {new Date(assignment.deadline).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <p className="text-[13px] text-[#64748B] whitespace-pre-line mb-4 leading-relaxed">
                    {assignment.description}
                  </p>

                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[12px]">
                    <div>
                      {assignment.attachmentUrl && (
                        <a
                          href={assignment.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-[#1D63FF] hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Soal Dosen</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => toggleTaskDone(assignment.id)}
                      className={`py-2 px-4 rounded-xl text-[12px] font-semibold transition-all inline-flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-[#22C55E] text-white'
                          : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] hover:bg-[#EBF2FF] hover:text-[#1D63FF] hover:border-[#CFE2FF]'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Sudah Selesai</span>
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
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: QUIZ & QUESTION BANK */}
      {activeTab === 'QUIZ' && (
        <QuizBankTab course={course} canManageCourse={hasManageRights} />
      )}

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-md p-6 shadow-xl animate-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
              <div>
                <span className="text-[11px] text-[#1D63FF] font-semibold uppercase">
                  Pertemuan {selectedSessionNumber}
                </span>
                <h3 className="text-[16px] font-bold text-[#1E293B]">
                  Tambah Materi Perkuliahan
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Judul Materi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Slide PPT Modul 03 - Inheritance"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Jenis Materi
                </label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                >
                  <option value="PDF">Dokumen PDF</option>
                  <option value="SLIDE">Slide Presentasi (PPT/PPTX)</option>
                  <option value="DRIVE_LINK">Tautan Google Drive</option>
                  <option value="VIDEO_LINK">Tautan Rekaman Zoom/YouTube</option>
                  <option value="OTHER">File Dokumen Lainnya (ZIP/DOCX)</option>
                </select>
              </div>

              {['PDF', 'SLIDE', 'OTHER'].includes(uploadData.type) ? (
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Pilih File
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setUploadData({ ...uploadData, file: e.target.files[0] })
                    }
                    className="w-full p-2.5 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-[12px]"
                  />
                  <span className="text-[11px] text-[#94A3B8] block mt-1">
                    Mendukung file hingga 100MB (Cloudflare R2).
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Tautan / URL Materi
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={uploadData.externalUrl}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, externalUrl: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Mengunggah...' : 'Unggah Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF In-App Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <span className="text-[13px] font-semibold text-[#1E293B] truncate">
                Pratinjau Dokumen: {previewTitle}
              </span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="px-3 py-1.5 rounded-lg bg-[#FFF1F2] text-[#E11D48] text-[12px] font-semibold hover:bg-[#FFE4E6] transition-colors"
              >
                Tutup
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-900">
              <iframe
                src={previewUrl}
                title={previewTitle}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Course Icon CRUD Modal */}
      <CourseIconCrudModal
        open={showIconModal}
        course={course}
        saving={savingIcon}
        onClose={() => setShowIconModal(false)}
        onSaveIcon={handleSaveCourseIcon}
      />

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
