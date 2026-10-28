import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import CourseAvatarIcon, {
  CourseIconCrudModal,
  PLAYFUL_AVATAR_PRESETS,
  getCustomIconsList,
  extractIconFromDescription,
  embedIconInDescription,
  setLocalCourseIcon,
  resolveCourseAvatar,
} from '../components/CourseAvatarIcon';
import {
  BookOpen,
  Plus,
  Bell,
  Trash2,
  Edit3,
  Repeat,
  ArrowRight,
  Star,
  User,
  Briefcase,
  MoreHorizontal,
  X,
  Monitor,
  Code2,
  Database,
  Cpu,
  Layers,
  AlertCircle,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ShieldCheck,
  KeyRound,
  Sparkles,
  FileText,
  Phone,
  MapPin,
} from 'lucide-react';

const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const DAY_INDEX_MAP = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

// Pastel theme system from vizo_newdesign.md
const PASTEL_THEMES = [
  {
    name: 'yellow',
    bg: 'bg-[#FFFBEB]',
    accent: 'bg-[#FEF0C7]',
    text: 'text-[#D97706]',
  },
  {
    name: 'green',
    bg: 'bg-[#ECFDF3]',
    accent: 'bg-[#D1FADF]',
    text: 'text-[#059669]',
  },
  {
    name: 'pink',
    bg: 'bg-[#FFF1F2]',
    accent: 'bg-[#FFE4E6]',
    text: 'text-[#E11D48]',
  },
  {
    name: 'blue',
    bg: 'bg-[#EAF2FF]',
    accent: 'bg-[#CFE2FF]',
    text: 'text-[#1D63FF]',
  },
];

const LIST_PASTEL_THEMES = [
  PASTEL_THEMES[3], // Blue
  PASTEL_THEMES[1], // Green
  PASTEL_THEMES[0], // Yellow
  PASTEL_THEMES[2], // Pink
];

const AUTHOR_PASTEL_THEMES = [
  PASTEL_THEMES[3], // Blue
  PASTEL_THEMES[0], // Yellow
  PASTEL_THEMES[1], // Green
  PASTEL_THEMES[2], // Pink
  PASTEL_THEMES[1], // Green
];

const COURSE_ICONS = [Monitor, Layers, Code2, Database, Cpu, BookOpen];

const AVATAR_COLORS = [
  { bg: '#CFE2FF', shirt: '#1E293B', hair: '#451A03' },
  { bg: '#FEF0C7', shirt: '#D97706', hair: '#1E293B' },
  { bg: '#D1FADF', shirt: '#059669', hair: '#7C2D12' },
  { bg: '#FFE4E6', shirt: '#E11D48', hair: '#31102F' },
  { bg: '#E9D5FF', shirt: '#7C3AED', hair: '#1E293B' },
];

function AuthorAvatar({ index = 0 }) {
  const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="w-[38px] h-[38px] rounded-full overflow-hidden shrink-0 border border-white/80 shadow-sm flex items-center justify-center"
      style={{ backgroundColor: palette.bg }}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <circle cx="20" cy="20" r="20" fill={palette.bg} />
        <path d="M9 40 C9 31 31 31 31 40 Z" fill={palette.shirt} />
        <rect x="17.5" y="24" width="5" height="6" rx="2" fill="#FDBA94" />
        <circle cx="20" cy="18" r="7" fill="#FDBA94" />
        <path
          d="M13 17 C13 11 16 9.5 20 9.5 C24.5 9.5 27 12 27 16.5 C25.5 14 22.5 13 19 13.5 C15.5 14 14 15.5 13 17 Z"
          fill={palette.hair}
        />
        <circle cx="17.5" cy="18" r="0.85" fill="#1E293B" />
        <circle cx="22.5" cy="18" r="0.85" fill="#1E293B" />
        <path
          d="M18 21 Q20 22.4 22 21"
          stroke="#1E293B"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const { user, isKetuaKelas, isPJMatkul, canManageCourse, changePassword } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    practicums: [],
    agendas: [],
    reschedules: [],
  });
  const [loading, setLoading] = useState(true);

  // Filters for Materi Kuliah tab
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');

  // Personal task checklist stored per user account
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`vizo_todo_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`vizo_todo_${user?.id}`);
      setCompletedTasks(saved ? JSON.parse(saved) : []);
    } catch {
      setCompletedTasks([]);
    }
  }, [user?.id]);

  const togglePersonalTask = (assignmentId) => {
    const updated = completedTasks.includes(assignmentId)
      ? completedTasks.filter((id) => id !== assignmentId)
      : [...completedTasks, assignmentId];
    setCompletedTasks(updated);
    if (user?.id) {
      localStorage.setItem(`vizo_todo_${user.id}`, JSON.stringify(updated));
    }
  };

  const search = searchParams.get('q') || '';
  const isCoursesTab = searchParams.get('tab') === 'courses';

  // Confirm modal state
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false,
    confirmText: 'Ya, Hapus',
  });

  // Modal State for Adding Course (Ketua Kelas only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSelectedDays, setAddSelectedDays] = useState(['Senin']);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    semester: 4,
    credits: 3,
    lecturerName: '',
    lecturerContact: '',
    scheduleTime: '08:00 - 10:30 WIB',
    room: 'Ruang Kuliah',
    description: '',
    iconId: 'robo-ai',
  });

  // Modal State for Editing Course
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSelectedDays, setEditSelectedDays] = useState(['Senin']);
  const [editCourse, setEditCourse] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal State for Course Icon CRUD
  const [iconCrudCourse, setIconCrudCourse] = useState(null);
  const [savingIconCrud, setSavingIconCrud] = useState(false);
  const [iconVersion, setIconVersion] = useState(0);

  // Modal State for Adding Announcement (Ketua Kelas only)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    isUrgent: true,
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Modal State for Changing Personal Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, announcementsRes, assignmentsRes, schedulesRes] =
        await Promise.all([
          api.get('/courses'),
          api.get('/announcements'),
          api.get('/assignments').catch(() => ({ data: { assignments: [] } })),
          api.get('/schedules').catch(() => ({
            data: { courses: [], practicums: [], agendas: [] },
          })),
        ]);

      const fetchedCourses = coursesRes.data.courses || [];
      setCourses(fetchedCourses);
      setAnnouncements(announcementsRes.data.announcements || []);
      setAssignments(assignmentsRes.data.assignments || []);

      const schedCourses = schedulesRes.data?.courses || [];
      const activeReschedules = schedCourses.flatMap((c) =>
        (c.reschedules || []).map((r) => ({ ...r, courseName: c.name, courseCode: c.code }))
      );

      setScheduleData({
        practicums: schedulesRes.data?.practicums || [],
        agendas: schedulesRes.data?.agendas || [],
        reschedules: activeReschedules,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAddDay = (day) => {
    if (addSelectedDays.includes(day)) {
      if (addSelectedDays.length > 1) {
        setAddSelectedDays(addSelectedDays.filter((d) => d !== day));
      }
    } else {
      setAddSelectedDays([...addSelectedDays, day]);
    }
  };

  const toggleEditDay = (day) => {
    if (editSelectedDays.includes(day)) {
      if (editSelectedDays.length > 1) {
        setEditSelectedDays(editSelectedDays.filter((d) => d !== day));
      }
    } else {
      setEditSelectedDays([...editSelectedDays, day]);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const descriptionWithIcon = embedIconInDescription(
        newCourse.description,
        newCourse.iconId
      );
      const res = await api.post('/courses', {
        ...newCourse,
        description: descriptionWithIcon,
        scheduleDay: addSelectedDays.join(', '),
      });
      if (res.data?.course?.id && newCourse.iconId) {
        setLocalCourseIcon(res.data.course.id, newCourse.iconId);
      }
      setShowAddModal(false);
      setNewCourse({
        code: '',
        name: '',
        semester: 4,
        credits: 3,
        lecturerName: '',
        lecturerContact: '',
        scheduleTime: '08:00 - 10:30 WIB',
        room: 'Ruang Kuliah',
        description: '',
        iconId: 'robo-ai',
      });
      setAddSelectedDays(['Senin']);
      toast.success('Mata kuliah berhasil ditambahkan.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan mata kuliah.');
    }
  };

  const handleOpenEdit = (course) => {
    const days = course.scheduleDay
      ? course.scheduleDay.split(',').map((d) => d.trim())
      : ['Senin'];
    const { cleanDescription } = extractIconFromDescription(course.description);
    const resolvedAvatar = resolveCourseAvatar(course);
    setEditSelectedDays(days);
    setEditCourse({
      id: course.id,
      code: course.code,
      name: course.name,
      semester: course.semester,
      credits: course.credits,
      lecturerName: course.lecturerName,
      lecturerContact: course.lecturerContact || '',
      scheduleTime: course.scheduleTime || '08:00 - 10:30 WIB',
      room: course.room || 'Ruang Kuliah',
      description: cleanDescription,
      iconId: resolvedAvatar.id,
    });
    setShowEditModal(true);
  };

  const handleSaveEditCourse = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const descriptionWithIcon = embedIconInDescription(
        editCourse.description,
        editCourse.iconId
      );
      setLocalCourseIcon(editCourse.id, editCourse.iconId);
      await api.put(`/courses/${editCourse.id}`, {
        ...editCourse,
        description: descriptionWithIcon,
        scheduleDay: editSelectedDays.join(', '),
      });
      setShowEditModal(false);
      setIconVersion((v) => v + 1);
      toast.success('Data & icon mata kuliah berhasil diperbarui.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui data mata kuliah.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSaveIconCrud = async (newIconId) => {
    if (!iconCrudCourse) return;
    setSavingIconCrud(true);
    try {
      setLocalCourseIcon(iconCrudCourse.id, newIconId);
      if (canManageCourse(iconCrudCourse.id)) {
        const { cleanDescription } = extractIconFromDescription(
          iconCrudCourse.description
        );
        const descriptionWithIcon = embedIconInDescription(cleanDescription, newIconId);
        await api.put(`/courses/${iconCrudCourse.id}`, {
          code: iconCrudCourse.code,
          name: iconCrudCourse.name,
          semester: iconCrudCourse.semester,
          credits: iconCrudCourse.credits,
          lecturerName: iconCrudCourse.lecturerName,
          lecturerContact: iconCrudCourse.lecturerContact || '',
          scheduleDay: iconCrudCourse.scheduleDay || 'Senin',
          scheduleTime: iconCrudCourse.scheduleTime || '08:00 - 10:30 WIB',
          room: iconCrudCourse.room || 'Ruang Kuliah',
          description: descriptionWithIcon,
        });
      }
      setIconVersion((v) => v + 1);
      setIconCrudCourse(null);
      toast.success(
        newIconId
          ? 'Icon avatar mata kuliah berhasil diperbarui!'
          : 'Icon mata kuliah di-reset ke default.'
      );
      fetchData();
    } catch {
      // Even if remote API fails for non-coordinator, local icon is saved
      setIconVersion((v) => v + 1);
      setIconCrudCourse(null);
      toast.success('Icon avatar mata kuliah berhasil diterapkan.');
    } finally {
      setSavingIconCrud(false);
    }
  };

  const handleDeleteCourse = (courseId, courseName) => {
    setConfirmState({
      open: true,
      title: 'Hapus Mata Kuliah',
      message: `Hapus mata kuliah "${courseName}" beserta semua arsip pertemuannya? Tindakan ini tidak bisa dibatalkan.`,
      confirmText: 'Ya, Hapus',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmState((s) => ({ ...s, loading: true }));
          await api.delete(`/courses/${courseId}`);
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
            confirmText: 'Ya, Hapus',
          });
          toast.success('Mata kuliah berhasil dihapus.');
          fetchData();
        } catch (err) {
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
            confirmText: 'Ya, Hapus',
          });
          toast.error(err.response?.data?.message || 'Gagal menghapus mata kuliah.');
        }
      },
    });
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      await api.post('/announcements', newAnnouncement);
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: '', content: '', isUrgent: true });
      toast.success('Pengumuman berhasil dipublikasikan.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mempublikasikan pengumuman.');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = (id) => {
    setConfirmState({
      open: true,
      title: 'Hapus Pengumuman',
      message: 'Hapus pengumuman kelas ini?',
      confirmText: 'Ya, Hapus',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmState((s) => ({ ...s, loading: true }));
          await api.delete(`/announcements/${id}`);
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
            confirmText: 'Ya, Hapus',
          });
          toast.success('Pengumuman berhasil dihapus.');
          fetchData();
        } catch {
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
            confirmText: 'Ya, Hapus',
          });
          toast.error('Gagal menghapus pengumuman.');
        }
      },
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    try {
      setSavingPassword(true);
      await changePassword(passwordForm.newPassword, passwordForm.currentPassword);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Kata sandi akun berhasil diperbarui.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah kata sandi.');
    } finally {
      setSavingPassword(false);
    }
  };

  // =========================================================================
  // PERSONALIZED DATA COMPUTATIONS (FOR DASHBOARD VIEW)
  // =========================================================================
  const cleanName = (name) => name?.replace(/\s*\([^)]*\)/g, '').trim() || 'Mahasiswa';

  const formatLecturerName = (name) => {
    if (!name) return 'Dosen Pengampu';
    const trimmed = String(name).trim();
    if (trimmed === trimmed.toUpperCase()) {
      return trimmed
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return trimmed;
  };

  const formatCourseTitle = (title) => {
    if (!title) return '';
    return String(title).replace(/\s*\*+$/, '').trim();
  };

  const parseScheduleTime = (scheduleTime) => {
    if (!scheduleTime) return { timeRange: '08:00 - 10:30 WIB', jamSlot: null };
    const raw = String(scheduleTime).trim();
    const slotMatch = raw.match(/\(([^)]+)\)/);
    const jamSlot = slotMatch ? slotMatch[1].trim() : null;
    const timeRange = raw
      .replace(/\s*\([^)]+\)/g, '')
      .replace(/\s*WIB/i, '')
      .trim();
    return { timeRange: timeRange ? `${timeRange} WIB` : raw, jamSlot };
  };

  const roleBadgeLabel = () => {
    if (user?.role === 'KETUA_KELAS') return 'Ketua Kelas';
    if (user?.role === 'PJ_MATKUL') return 'PJ Mata Kuliah';
    return 'Mahasiswa';
  };

  const todayDateObj = new Date();
  const todayDayName = DAY_INDEX_MAP[todayDateObj.getDay()] || 'Senin';
  const formattedTodayDate = todayDateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Courses happening today
  const todayCourses = courses.filter((c) =>
    (c.scheduleDay || '')
      .toLowerCase()
      .split(',')
      .map((d) => d.trim())
      .includes(todayDayName.toLowerCase())
  );

  // Courses coordinated by this user account
  const myCoordinatedCourses = courses.filter((c) => canManageCourse(c.id));

  // Total credits
  const totalCredits = courses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0);

  // Personal Assignment Statistics
  const isAssignmentDone = (a) =>
    completedTasks.includes(a.id) || (a.submissions && a.submissions.length > 0);

  const doneAssignments = assignments.filter((a) => isAssignmentDone(a));
  const pendingAssignments = assignments.filter((a) => !isAssignmentDone(a));
  const urgentAssignments = pendingAssignments.filter((a) => {
    const diffHours = (new Date(a.deadline) - todayDateObj) / (1000 * 60 * 60);
    return diffHours <= 72; // <= 3 days or overdue
  });

  const totalTasksCount = assignments.length;
  const donePct =
    totalTasksCount > 0 ? Math.round((doneAssignments.length / totalTasksCount) * 100) : 100;
  const urgentPct =
    totalTasksCount > 0
      ? Math.round((urgentAssignments.length / totalTasksCount) * 100)
      : 0;
  const runningPct = Math.max(0, 100 - donePct - urgentPct);

  // Donut stroke dasharray helper (circumference = 2 * pi * 60 ≈ 377)
  const CIRCUMFERENCE = 377;
  const doneArc = Math.round((donePct / 100) * CIRCUMFERENCE);
  const runningArc = Math.round((runningPct / 100) * CIRCUMFERENCE);
  const urgentArc = Math.round((urgentPct / 100) * CIRCUMFERENCE);

  // =========================================================================
  // FILTERED COURSES (FOR MATERI KULIAH VIEW)
  // =========================================================================
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.lecturerName.toLowerCase().includes(search.toLowerCase());

    const matchesSemester =
      selectedSemester === 'ALL' || c.semester === Number(selectedSemester);

    const matchesDay =
      selectedDayFilter === 'ALL' ||
      (c.scheduleDay || '')
        .toLowerCase()
        .includes(selectedDayFilter.toLowerCase());

    return matchesSearch && matchesSemester && matchesDay;
  });

  const semesters = ['ALL', ...Array.from(new Set(courses.map((c) => c.semester))).sort()];

  // Lecturers list for Materi Kuliah right sidebar (synced with course avatar theme)
  const authorItems = courses.map((c) => ({
    id: c.id,
    name: formatLecturerName(c.lecturerName),
    contact: c.lecturerContact,
    subtitle: `${c.code} • ${formatCourseTitle(c.name)}`,
    credits: c.credits,
    courseId: c.id,
    course: c,
    avatar: resolveCourseAvatar(c),
  }));

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6">
      {/* ================================================================= */}
      {/* ACTIVE ANNOUNCEMENTS BAR (Shown on top if any exist)              */}
      {/* ================================================================= */}
      {announcements.length > 0 && (
        <div className="mb-5 space-y-2.5">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-3 ${
                item.isUrgent
                  ? 'bg-[#FFF1F2] border-[#FFE4E6] text-[#E11D48]'
                  : 'bg-[#EAF2FF] border-[#CFE2FF] text-[#1D63FF]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        item.isUrgent
                          ? 'bg-[#FFE4E6] text-[#E11D48]'
                          : 'bg-[#CFE2FF] text-[#1D63FF]'
                      }`}
                    >
                      {item.isUrgent ? 'Penting' : 'Info Kelas'}
                    </span>
                    <span className="text-[13px] font-semibold text-[#1E293B] truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-0.5 line-clamp-1">
                    {item.content}
                  </p>
                </div>
              </div>

              {isKetuaKelas && (
                <button
                  onClick={() => handleDeleteAnnouncement(item.id)}
                  title="Hapus Pengumuman"
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#E11D48] hover:bg-white/80 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 1: PERSONAL DASHBOARD (`/`) — FOKUS PERSONALISASI AKUN       */}
      {/* ================================================================= */}
      {!isCoursesTab ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px] gap-6 items-start">
          {/* LEFT MAIN AREA */}
          <div className="space-y-6 min-w-0">
            {/* 1. PERSONALIZED HERO BANNER */}
            <div className="bg-[#F4F7FE] border border-[#E2E8F0] rounded-2xl px-6 py-6 sm:px-8 sm:py-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span className="text-[11px] font-bold bg-[#CFE2FF] text-[#1D63FF] px-2.5 py-0.5 rounded-md uppercase">
                      {roleBadgeLabel()}
                    </span>
                    <span className="text-[11px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                      NIM: {user?.nim || '-'}
                    </span>
                    <span className="text-[11px] font-medium text-[#64748B]">
                      • {formattedTodayDate}
                    </span>
                  </div>

                  <h1 className="text-[20px] sm:text-[22px] font-bold text-[#1D63FF] leading-snug">
                    Halo, {cleanName(user?.name)}! 👋
                  </h1>

                  <p className="text-[13px] text-[#475569] mt-2 leading-[1.6]">
                    {todayCourses.length > 0
                      ? `Hari ini (${todayDayName}) kamu memiliki ${todayCourses.length} jadwal mata kuliah`
                      : `Tidak ada jadwal kuliah reguler pada hari ${todayDayName}`}{' '}
                    dan{' '}
                    <strong className="text-[#1E293B] font-semibold">
                      {pendingAssignments.length} tugas
                    </strong>{' '}
                    yang perlu diselesaikan.
                    {isPJMatkul && myCoordinatedCourses.length > 0
                      ? ` Kamu bertugas mengelola ${myCoordinatedCourses.length} mata kuliah.`
                      : ''}
                  </p>

                  {/* Quick Personal Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-4">
                    <Link
                      to="/?tab=courses"
                      className="px-3.5 py-2 rounded-lg bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[11.5px] font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Buka Katalog Materi</span>
                    </Link>

                    <Link
                      to="/deadlines"
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] text-[11.5px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Checklist Tugas ({pendingAssignments.length})</span>
                    </Link>

                    {isKetuaKelas && (
                      <button
                        type="button"
                        onClick={() => setShowAnnouncementModal(true)}
                        className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] text-[11.5px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5 text-[#1D63FF]" />
                        <span>Buat Pengumuman</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Vector Illustration */}
                <div className="hidden sm:flex items-center justify-end shrink-0 select-none">
                  <svg
                    viewBox="0 0 220 115"
                    className="w-[195px] h-[102px]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="8"
                      y="14"
                      width="48"
                      height="30"
                      rx="5"
                      fill="#FFFFFF"
                      stroke="#1E293B"
                      strokeWidth="1.3"
                    />
                    <line x1="14" y1="22" x2="36" y2="22" stroke="#1D63FF" strokeWidth="2" strokeLinecap="round" />
                    <line x1="14" y1="28" x2="46" y2="28" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="14" y1="34" x2="30" y2="34" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

                    <rect
                      x="64"
                      y="8"
                      width="34"
                      height="24"
                      rx="5"
                      fill="#EAF2FF"
                      stroke="#1E293B"
                      strokeWidth="1.3"
                    />
                    <polygon points="78,15 78,25 86,20" fill="#1D63FF" />

                    <rect
                      x="32"
                      y="52"
                      width="42"
                      height="26"
                      rx="5"
                      fill="#FFFFFF"
                      stroke="#1E293B"
                      strokeWidth="1.3"
                    />
                    <circle cx="43" cy="65" r="5" fill="#1D63FF" />
                    <line x1="53" y1="62" x2="67" y2="62" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="53" y1="68" x2="63" y2="68" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

                    <path
                      d="M122 108 C124 78 142 66 165 66 C188 66 202 80 205 108 Z"
                      fill="#FFFFFF"
                      stroke="#1E293B"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M168 74 C178 82 182 96 168 104"
                      stroke="#1E293B"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="158"
                      cy="42"
                      r="15"
                      fill="#FDE68A"
                      stroke="#1E293B"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M145 36 C145 24 156 20 166 23 C175 26 177 36 173 44 C171 35 164 32 155 32 C149 32 146 34 145 36 Z"
                      fill="#0F172A"
                    />
                    <circle cx="152" cy="42" r="1.3" fill="#1E293B" />
                    <circle cx="161" cy="42" r="1.3" fill="#1E293B" />
                    <path
                      d="M154 47 Q157 50 160 47"
                      stroke="#1E293B"
                      strokeWidth="1.3"
                      fill="none"
                      strokeLinecap="round"
                    />

                    <rect
                      x="86"
                      y="66"
                      width="58"
                      height="38"
                      rx="5"
                      fill="#1D63FF"
                    />
                    <circle cx="115" cy="85" r="4" fill="#FFFFFF" />
                    <rect x="76" y="102" width="78" height="5" rx="2.5" fill="#1D63FF" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. RINGKASAN PERSONAL AKUN (3-Column Cards) */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-[15px] font-semibold text-[#1E293B]">
                  Ringkasan Aktivitas Saya
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Progres Tugas Pribadi (Yellow Pastel Playful Mascot) */}
                <Link
                  to="/deadlines"
                  className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-[46px] h-[46px] rounded-[12px] overflow-hidden border border-black/5 shadow-sm shrink-0 transition-transform group-hover:scale-105">
                          <svg viewBox="0 0 48 48" className="w-full h-full">
                            <circle cx="24" cy="24" r="24" fill="#FEF0C7" />
                            {/* Sparkles */}
                            <circle cx="9.5" cy="13" r="1.8" fill="#F59E0B" />
                            <circle cx="39" cy="11" r="1.5" fill="#FF6B6B" />
                            {/* Clipboard Body */}
                            <rect
                              x="12"
                              y="11"
                              width="24"
                              height="29"
                              rx="5"
                              fill="#FBBF24"
                              stroke="#1E293B"
                              strokeWidth="1.7"
                            />
                            {/* Inner Paper */}
                            <rect
                              x="15"
                              y="15"
                              width="18"
                              height="22"
                              rx="3"
                              fill="#FFFFFF"
                              stroke="#1E293B"
                              strokeWidth="1.4"
                            />
                            {/* Top Clip */}
                            <rect
                              x="18.5"
                              y="8"
                              width="11"
                              height="6"
                              rx="2.5"
                              fill="#EA580C"
                              stroke="#1E293B"
                              strokeWidth="1.5"
                            />
                            <circle cx="24" cy="11" r="1.3" fill="#FEF0C7" />
                            {/* Cute Mascot Eyes & Rosy Cheeks */}
                            <circle cx="20.5" cy="22" r="1.5" fill="#1E293B" />
                            <circle cx="27.5" cy="22" r="1.5" fill="#1E293B" />
                            <circle cx="18" cy="23.8" r="1.6" fill="#FDA4AF" />
                            <circle cx="30" cy="23.8" r="1.6" fill="#FDA4AF" />
                            <path
                              d="M21.8 24.5 Q24 26.8 26.2 24.5"
                              stroke="#1E293B"
                              strokeWidth="1.4"
                              fill="none"
                              strokeLinecap="round"
                            />
                            {/* Playful Green Checkmark Badge at Bottom Right */}
                            <circle
                              cx="33"
                              cy="34"
                              r="7.5"
                              fill="#22C55E"
                              stroke="#1E293B"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M29.8 34.2 L32 36.4 L36.5 31.8"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[14px] font-semibold text-[#1E293B] group-hover:text-[#1D63FF] transition-colors">
                            Progres Tugas Saya
                          </h3>
                          <span className="text-[11px] font-medium text-[#64748B]">
                            Checklist Pribadi
                          </span>
                        </div>
                      </div>
                      <span className="bg-[#FEF0C7] text-[#D97706] px-2.5 py-[3px] rounded-[6px] text-[11px] font-bold">
                        {doneAssignments.length}/{totalTasksCount}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-1 text-[12px] font-medium text-[#64748B]">
                      <span>
                        {pendingAssignments.length === 0
                          ? 'Semua tugas kuliah sudah selesai!'
                          : `${pendingAssignments.length} tugas belum ditandai selesai`}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {urgentAssignments.length > 0
                          ? `${urgentAssignments.length} tugas mendekati tenggat waktu`
                          : 'Tidak ada tugas yang mendesak'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex items-center justify-end mb-1">
                      <span className="text-[11px] font-semibold text-[#64748B]">
                        {donePct}%
                      </span>
                    </div>
                    <div className="w-full h-[5px] bg-[#DCFCE7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
                        style={{ width: `${donePct}%` }}
                      />
                    </div>
                  </div>
                </Link>

                {/* Card 2: Jadwal Kuliah Hari Ini (Green Pastel Playful Mascot) */}
                <Link
                  to="/schedule"
                  className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-[46px] h-[46px] rounded-[12px] overflow-hidden border border-black/5 shadow-sm shrink-0 transition-transform group-hover:scale-105">
                          <svg viewBox="0 0 48 48" className="w-full h-full">
                            <circle cx="24" cy="24" r="24" fill="#D1FADF" />
                            {/* Calendar Body */}
                            <rect
                              x="10"
                              y="12"
                              width="28"
                              height="27"
                              rx="5.5"
                              fill="#FFFFFF"
                              stroke="#1E293B"
                              strokeWidth="1.7"
                            />
                            {/* Calendar Top Header */}
                            <path
                              d="M10 17.5 C10 14.5 12.5 12 15.5 12 H32.5 C35.5 12 38 14.5 38 17.5 V21 H10 Z"
                              fill="#10B981"
                              stroke="#1E293B"
                              strokeWidth="1.7"
                            />
                            {/* Binder Rings */}
                            <rect
                              x="15.5"
                              y="8.5"
                              width="3.5"
                              height="6.5"
                              rx="1.7"
                              fill="#F59E0B"
                              stroke="#1E293B"
                              strokeWidth="1.4"
                            />
                            <rect
                              x="29"
                              y="8.5"
                              width="3.5"
                              height="6.5"
                              rx="1.7"
                              fill="#F59E0B"
                              stroke="#1E293B"
                              strokeWidth="1.4"
                            />
                            {/* Cute Mascot Face on Calendar */}
                            <circle cx="19.5" cy="28" r="1.6" fill="#1E293B" />
                            <circle cx="28.5" cy="28" r="1.6" fill="#1E293B" />
                            <circle cx="16.5" cy="30" r="1.8" fill="#FDA4AF" />
                            <circle cx="31.5" cy="30" r="1.8" fill="#FDA4AF" />
                            <path
                              d="M21.5 31 Q24 33.5 26.5 31"
                              stroke="#1E293B"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                            />
                            {/* Mini Clock Badge */}
                            <circle
                              cx="35"
                              cy="35"
                              r="6.5"
                              fill="#FBBF24"
                              stroke="#1E293B"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M35 32 V35 L37 36.2"
                              stroke="#1E293B"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[14px] font-semibold text-[#1E293B] group-hover:text-[#1D63FF] transition-colors">
                            Kuliah Hari {todayDayName}
                          </h3>
                          <span className="text-[11px] font-medium text-[#64748B]">
                            Jadwal Harian Saya
                          </span>
                        </div>
                      </div>
                      <span className="bg-[#D1FADF] text-[#059669] px-2.5 py-[3px] rounded-[6px] text-[11px] font-bold">
                        {todayCourses.length} Kelas
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-1 text-[12px] font-medium text-[#64748B]">
                      {todayCourses.length > 0 ? (
                        <>
                          <span className="text-[#1E293B] font-semibold truncate">
                            {todayCourses[0].name}
                          </span>
                          <span className="text-[11.5px] truncate">
                            {todayCourses[0].scheduleTime} • {todayCourses[0].room}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Tidak ada jadwal kelas reguler hari ini</span>
                          <span className="text-[11px] text-[#94A3B8]">
                            Gunakan waktu untuk review materi & bank soal
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#059669]">
                      <span>Lihat Kalender Jadwal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>

                {/* Card 3: Status & Peran Akun (Blue Pastel Playful Mascot) */}
                <div className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 flex flex-col justify-between transition-all group">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-[46px] h-[46px] rounded-[12px] overflow-hidden border border-black/5 shadow-sm shrink-0 transition-transform group-hover:scale-105">
                          <svg viewBox="0 0 48 48" className="w-full h-full">
                            <circle cx="24" cy="24" r="24" fill="#CFE2FF" />
                            {/* Cute Scholar Mascot Head */}
                            <circle
                              cx="24"
                              cy="26"
                              r="11.5"
                              fill="#FFFFFF"
                              stroke="#1E293B"
                              strokeWidth="1.7"
                            />
                            {/* Smart Glasses */}
                            <circle
                              cx="20"
                              cy="25"
                              r="3.2"
                              fill="#EAF2FF"
                              stroke="#1E293B"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="28"
                              cy="25"
                              r="3.2"
                              fill="#EAF2FF"
                              stroke="#1E293B"
                              strokeWidth="1.5"
                            />
                            <line
                              x1="23.2"
                              y1="25"
                              x2="24.8"
                              y2="25"
                              stroke="#1E293B"
                              strokeWidth="1.5"
                            />
                            <circle cx="20" cy="25" r="1.3" fill="#1E293B" />
                            <circle cx="28" cy="25" r="1.3" fill="#1E293B" />
                            {/* Rosy Cheeks & Smile */}
                            <circle cx="16.8" cy="28" r="1.6" fill="#FDA4AF" />
                            <circle cx="31.2" cy="28" r="1.6" fill="#FDA4AF" />
                            <path
                              d="M21.5 29.8 Q24 32 26.5 29.8"
                              stroke="#1E293B"
                              strokeWidth="1.4"
                              fill="none"
                              strokeLinecap="round"
                            />
                            {/* Graduation Cap on Top */}
                            <polygon
                              points="24,7 9,13.5 24,19.5 39,13.5"
                              fill="#1D63FF"
                              stroke="#1E293B"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                            <rect
                              x="16.5"
                              y="16.5"
                              width="15"
                              height="4"
                              rx="1.5"
                              fill="#1E293B"
                            />
                            {/* Golden Tassel */}
                            <path
                              d="M35 14.5 L37.5 22"
                              stroke="#F59E0B"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <circle cx="37.5" cy="22.5" r="2" fill="#FBBF24" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[14px] font-semibold text-[#1E293B]">
                            {isPJMatkul ? 'Akses Pengelola' : 'Beban Studi Aktif'}
                          </h3>
                          <span className="text-[11px] font-medium text-[#64748B]">
                            {roleBadgeLabel()}
                          </span>
                        </div>
                      </div>
                      <span className="bg-[#CFE2FF] text-[#1D63FF] px-2.5 py-[3px] rounded-[6px] text-[11px] font-bold">
                        {totalCredits} SKS
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-1 text-[12px] font-medium text-[#64748B]">
                      <span>
                        Terdaftar pada{' '}
                        <strong className="text-[#1E293B]">{courses.length} Mata Kuliah</strong>{' '}
                        aktif
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {isPJMatkul
                          ? `Mengelola ${myCoordinatedCourses.length} mata kuliah sebagai ${roleBadgeLabel()}`
                          : 'Akses penuh ke materi 16 sesi & bank soal AI'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <Link
                      to="/?tab=courses"
                      className="flex items-center justify-between text-[11px] font-semibold text-[#1D63FF] hover:underline"
                    >
                      <span>Buka Semua Materi Kuliah</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MATA KULIAH YANG SAYA KELOLA (Jika PJ Matkul / Ketua Kelas) ATAU JADWAL KULIAH HARI INI */}
            {isPJMatkul && myCoordinatedCourses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[#1E293B]">
                      Mata Kuliah yang Saya Kelola ({roleBadgeLabel()})
                    </h2>
                  </div>
                  <Link
                    to="/?tab=courses"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#1D63FF] hover:underline"
                  >
                    <span>Lihat Semua Materi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {myCoordinatedCourses.slice(0, 3).map((course) => {
                    const avatar = resolveCourseAvatar(course);
                    const { timeRange } = parseScheduleTime(course.scheduleTime);
                    return (
                      <div
                        key={`${course.id}-${iconVersion}`}
                        className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-4 flex flex-col justify-between transition-all h-full group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CourseAvatarIcon
                                course={course}
                                size="sm"
                                editable={true}
                                onClickEdit={(c) => setIconCrudCourse(c)}
                              />
                              <span
                                className="px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wide truncate"
                                style={{ backgroundColor: avatar.bg, color: avatar.accent }}
                              >
                                {course.code}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-75 md:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setIconCrudCourse(course)}
                                title="Kelola Icon Avatar Matkul"
                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1D63FF] hover:bg-[#EAF2FF]"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(course)}
                                title="Edit Info Matkul"
                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1D63FF] hover:bg-[#F8FAFC]"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <Link to={`/course/${course.id}`} className="block">
                            <h3 className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#1D63FF] leading-[1.35] line-clamp-2 md:min-h-[38px] transition-colors">
                              {formatCourseTitle(course.name)}
                            </h3>
                          </Link>

                          <p className="text-[11.5px] font-medium text-[#64748B] mt-2 truncate">
                            {course.scheduleDay} • {timeRange} • R. {course.room}
                          </p>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-[#F1F5F9] grid grid-cols-2 gap-2">
                          <Link
                            to={`/course/${course.id}`}
                            style={{ backgroundColor: avatar.bg, color: avatar.accent }}
                            className="py-2 px-2.5 rounded-xl hover:opacity-90 text-[11.5px] font-bold text-center transition-opacity"
                          >
                            Kelola Materi
                          </Link>
                          <Link
                            to={`/course/${course.id}?view=quiz`}
                            className="py-2 px-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#1E293B] text-[11.5px] font-semibold text-center transition-colors"
                          >
                            Bank Soal
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. BOTTOM SPLIT ROW: Statistik Tugas Saya (1/3) + Checklist Tugas Pribadi (2/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* E. STATISTIK TUGAS PRIBADI (DONUT CHART) */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-[15px] font-semibold text-[#1E293B]">
                    Statistik Tugas Saya
                  </h2>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex-1 flex flex-col items-center justify-between relative">
                  <div className="w-full flex justify-end">
                    <Link
                      to="/deadlines"
                      title="Buka Halaman Tenggat Tugas"
                      className="w-6 h-6 rounded-full bg-[#CBD5E1]/50 hover:bg-[#CBD5E1] text-[#64748B] flex items-center justify-center transition-colors"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Dynamic Personal Donut Chart SVG */}
                  <div className="relative my-2 flex items-center justify-center shadow-donut rounded-full">
                    <svg className="w-[164px] h-[164px] -rotate-90" viewBox="0 0 160 160">
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="18"
                      />
                      {/* Selesai (Blue) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#1D63FF"
                        strokeWidth="18"
                        strokeDasharray={`${doneArc} ${CIRCUMFERENCE}`}
                        strokeDashoffset="0"
                      />
                      {/* Berjalan (Green) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="18"
                        strokeDasharray={`${runningArc} ${CIRCUMFERENCE}`}
                        strokeDashoffset={`-${doneArc}`}
                      />
                      {/* Mendesak (Coral) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#FF6B6B"
                        strokeWidth="18"
                        strokeDasharray={`${urgentArc} ${CIRCUMFERENCE}`}
                        strokeDashoffset={`-${doneArc + runningArc}`}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[20px] font-bold text-[#1E293B] leading-tight">
                        {totalTasksCount}
                      </span>
                      <span className="text-[11px] font-medium text-[#64748B] leading-tight mt-0.5">
                        Total
                        <br />
                        Tugas Saya
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-3 w-full mt-5 pt-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full border-[2.5px] border-[#1D63FF] mb-1.5" />
                      <span className="text-[12px] font-bold text-[#1E293B]">{donePct}%</span>
                      <span className="text-[10.5px] font-medium text-[#94A3B8]">
                        Selesai
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full border-[2.5px] border-[#22C55E] mb-1.5" />
                      <span className="text-[12px] font-bold text-[#1E293B]">
                        {runningPct}%
                      </span>
                      <span className="text-[10.5px] font-medium text-[#94A3B8]">
                        Berjalan
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full border-[2.5px] border-[#FF6B6B] mb-1.5" />
                      <span className="text-[12px] font-bold text-[#1E293B]">
                        {urgentPct}%
                      </span>
                      <span className="text-[10.5px] font-medium text-[#94A3B8]">
                        Mendesak
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* F. CHECKLIST TUGAS & TO-DO PRIBADI */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-[15px] font-semibold text-[#1E293B]">
                    Daftar Tugas & To-Do Saya
                  </h2>
                  <Link
                    to="/deadlines"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1E293B] hover:text-[#1D63FF] transition-colors"
                  >
                    <span>Kelola Semua</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex-1 flex flex-col gap-3 justify-center">
                  {assignments.length === 0 ? (
                    <div className="py-8 text-center space-y-2.5">
                      <div className="w-[54px] h-[54px] rounded-2xl overflow-hidden border border-black/5 shadow-sm mx-auto">
                        <svg viewBox="0 0 48 48" className="w-full h-full">
                          <circle cx="24" cy="24" r="24" fill="#FEF0C7" />
                          {/* Trophy Handles */}
                          <path
                            d="M14 16 H9 C9 23 13 25 16 25 M34 16 H39 C39 23 35 25 32 25"
                            fill="none"
                            stroke="#D97706"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />
                          {/* Trophy Cup */}
                          <path
                            d="M14 12 H34 V22 C34 28 29.5 32 24 32 C18.5 32 14 28 14 22 Z"
                            fill="#FBBF24"
                            stroke="#1E293B"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                          />
                          {/* Trophy Stem & Base */}
                          <rect x="21.5" y="32" width="5" height="5" fill="#D97706" stroke="#1E293B" strokeWidth="1.5" />
                          <rect x="16" y="37" width="16" height="4.5" rx="2" fill="#1E293B" />
                          {/* Cute Smiling Face on Trophy */}
                          <circle cx="20.5" cy="20" r="1.4" fill="#1E293B" />
                          <circle cx="27.5" cy="20" r="1.4" fill="#1E293B" />
                          <circle cx="18" cy="22" r="1.6" fill="#FDA4AF" />
                          <circle cx="30" cy="22" r="1.6" fill="#FDA4AF" />
                          <path
                            d="M21.8 23 Q24 25.2 26.2 23"
                            stroke="#1E293B"
                            strokeWidth="1.4"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <p className="text-[13px] font-semibold text-[#1E293B]">
                        Belum ada tugas perkuliahan aktif saat ini.
                      </p>
                      <p className="text-[12px] text-[#64748B]">
                        Kamu bisa menggunakan waktu luang untuk mempelajari slide atau latihan soal.
                      </p>
                    </div>
                  ) : (
                    assignments.slice(0, 4).map((task) => {
                      const isDone = isAssignmentDone(task);
                      const matchedCourse =
                        courses.find((c) => c.id === task.courseId) || task.course;
                      const avatar = resolveCourseAvatar(matchedCourse);
                      const deadlineDate = new Date(task.deadline);
                      const isOverdue = !isDone && deadlineDate < todayDateObj;

                      return (
                        <div
                          key={`${task.id}-${iconVersion}`}
                          className={`bg-white border rounded-xl px-3.5 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 transition-all ${
                            isDone
                              ? 'border-[#D1FADF] bg-[#ECFDF3]/20'
                              : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                          }`}
                        >
                          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => togglePersonalTask(task.id)}
                              title={
                                isDone
                                  ? 'Tandai Belum Selesai'
                                  : 'Tandai Selesai Dikerjakan'
                              }
                              className="relative shrink-0 group/taskbtn focus:outline-none"
                            >
                              <CourseAvatarIcon course={matchedCourse} size="sm" />
                              {isDone && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#22C55E] border border-white text-white flex items-center justify-center shadow-sm">
                                  <CheckCircle2 className="w-3 h-3" />
                                </span>
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    backgroundColor: avatar.bg,
                                    color: avatar.accent,
                                  }}
                                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0"
                                >
                                  {task.course?.code || matchedCourse?.code || 'TUGAS'}
                                </span>
                                <Link
                                  to="/deadlines"
                                  className={`text-[13.5px] font-semibold truncate block transition-colors ${
                                    isDone
                                      ? 'line-through text-[#94A3B8]'
                                      : 'text-[#1E293B] hover:text-[#1D63FF]'
                                  }`}
                                >
                                  {task.title}
                                </Link>
                              </div>
                              <p className="text-[12px] font-medium text-[#64748B] truncate mt-0.5">
                                Tenggat:{' '}
                                <span
                                  className={
                                    isOverdue ? 'text-[#E11D48] font-semibold' : ''
                                  }
                                >
                                  {deadlineDate.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => togglePersonalTask(task.id)}
                              style={
                                isDone
                                  ? undefined
                                  : {
                                      backgroundColor: avatar.bg,
                                      color: avatar.accent,
                                    }
                              }
                              className={`w-full sm:w-auto px-3.5 py-2 rounded-[8px] text-[10px] font-bold uppercase tracking-wider transition-opacity ${
                                isDone
                                  ? 'bg-[#D1FADF] text-[#059669]'
                                  : 'hover:opacity-90'
                              }`}
                            >
                              {isDone ? 'SELESAI ✓' : 'TANDAI SELESAI'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Profil Akun Saya + Jadwal & Agenda Hari Ini) */}
          <aside className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-7">
            {/* 1. Identitas & Pengaturan Akun */}
            <div>
              <h2 className="text-[15px] font-semibold text-[#1E293B] mb-4">
                Profil Akun Saya
              </h2>

              <div className="bg-[#F4F7FE] border border-[#E2E8F0] rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center gap-3">
                  <AuthorAvatar index={0} />
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#1E293B] truncate">
                      {cleanName(user?.name)}
                    </div>
                    <div className="text-[11.5px] font-medium text-[#64748B]">
                      NIM: {user?.nim || '-'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] space-y-2 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Peran Akun</span>
                    <span className="font-bold text-[#1D63FF] bg-[#CFE2FF] px-2 py-0.5 rounded-md text-[10.5px]">
                      {roleBadgeLabel()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Tugas Selesai</span>
                    <span className="font-semibold text-[#1E293B]">
                      {doneAssignments.length} / {totalTasksCount} Tugas
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Total Beban Studi</span>
                    <span className="font-semibold text-[#1E293B]">
                      {courses.length} Matkul ({totalCredits} SKS)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#EAF2FF] border border-[#E2E8F0] hover:border-[#CFE2FF] text-[#1D63FF] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Ubah Kata Sandi Akun</span>
                </button>
              </div>
            </div>

            {/* 2. Jadwal Hari Ini & Info Kelas Terdekat */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-semibold text-[#1E293B]">
                  Jadwal Hari Ini ({todayDayName})
                </h2>
                <Link
                  to="/schedule"
                  className="text-[11.5px] font-semibold text-[#1D63FF] hover:underline"
                >
                  Kalender
                </Link>
              </div>

              {todayCourses.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1">
                  <p className="text-[12.5px] font-semibold text-[#1E293B]">
                    Tidak Ada Kuliah Reguler
                  </p>
                  <p className="text-[11.5px] text-[#64748B]">
                    Hari {todayDayName} bebas dari jadwal kuliah reguler.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {todayCourses.map((c) => {
                    const avatar = resolveCourseAvatar(c);
                    return (
                      <Link
                        key={`${c.id}-${iconVersion}`}
                        to={`/course/${c.id}`}
                        style={{ backgroundColor: avatar.cardBg }}
                        className="rounded-xl px-3.5 py-3 flex items-center justify-between gap-2.5 transition-transform hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CourseAvatarIcon course={c} size="sm" />
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#1E293B] truncate">
                              {c.name}
                            </div>
                            <div className="text-[11px] font-medium text-[#64748B] truncate mt-0.5">
                              {c.scheduleTime} • {c.room}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{ backgroundColor: avatar.bg, color: avatar.accent }}
                          className="px-2.5 py-[5px] rounded-[6px] text-[9px] font-bold uppercase tracking-wider shrink-0"
                        >
                          {c.code}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Info Perubahan Jadwal / Agenda Kelas */}
            <div>
              <h2 className="text-[15px] font-semibold text-[#1E293B] mb-3">
                Perubahan Jadwal & Agenda
              </h2>

              <div className="divide-y divide-[#F1F5F9]">
                {scheduleData.reschedules.length === 0 &&
                scheduleData.agendas.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8] py-3">
                    Tidak ada perubahan jadwal (reschedule) atau agenda khusus.
                  </p>
                ) : (
                  <>
                    {scheduleData.reschedules.slice(0, 3).map((r) => (
                      <Link
                        key={`res-${r.id}`}
                        to="/schedule"
                        className="py-2.5 flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold text-[#E11D48] truncate">
                            Reschedule: {r.courseName}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5">
                            {new Date(r.newDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            • {r.newStartTime} ({r.newRoom})
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1D63FF] shrink-0" />
                      </Link>
                    ))}
                    {scheduleData.agendas.slice(0, 3).map((ag) => (
                      <Link
                        key={`ag-${ag.id}`}
                        to="/schedule"
                        className="py-2.5 flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold text-[#1E293B] group-hover:text-[#1D63FF] truncate">
                            {ag.title}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5">
                            {new Date(ag.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            • {ag.startTime} ({ag.location})
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1D63FF] shrink-0" />
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* =============================================================== */
        /* VIEW 2: MATERI KULIAH (`/?tab=courses`) — FOKUS MURNI MATERI     */
        /* =============================================================== */
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px] gap-6 items-start">
          {/* LEFT MAIN AREA: KATALOG MATERI & BANK SOAL */}
          <div className="space-y-6 min-w-0">
            {/* 1. HEADER KATALOG MATERI KULIAH */}
            <div className="bg-[#F4F7FE] border border-[#E2E8F0] rounded-2xl px-4 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold bg-[#CFE2FF] text-[#1D63FF] px-2.5 py-0.5 rounded-md uppercase">
                    Repositori Akademik Kelas
                  </span>
                  <h1 className="text-[18px] sm:text-[22px] font-bold text-[#1D63FF] mt-2">
                    Katalog Materi Kuliah & Bank Soal AI
                  </h1>
                  <p className="text-[12.5px] sm:text-[13px] text-[#475569] mt-1 leading-relaxed">
                    Pilih mata kuliah untuk mengakses arsip materi 16 pertemuan (slide PDF, rekaman, link Drive) serta latihan soal kolaboratif.
                  </p>
                </div>

                {isKetuaKelas && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold inline-flex items-center gap-2 shadow-sm transition-colors shrink-0 self-start md:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Mata Kuliah</span>
                  </button>
                )}
              </div>

              {/* Filter Bar: Hari Perkuliahan & Semester */}
              <div className="mt-4 sm:mt-5 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap -mx-1 px-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDayFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                      selectedDayFilter === 'ALL'
                        ? 'bg-[#1D63FF] text-white shadow-sm'
                        : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    Semua Hari ({courses.length})
                  </button>
                  {DAYS_LIST.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDayFilter(day)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                        selectedDayFilter === day
                          ? 'bg-[#1D63FF] text-white shadow-sm'
                          : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {semesters.length > 2 && (
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E2E8F0]">
                    {semesters.map((sem) => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setSelectedSemester(sem)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          selectedSemester === sem
                            ? 'bg-[#EBF2FF] text-[#1D63FF]'
                            : 'text-[#64748B] hover:text-[#1E293B]'
                        }`}
                      >
                        {sem === 'ALL' ? 'Semua Sem' : `Sem ${sem}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. GRID SELURUH MATA KULIAH & AKSES MATERI */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#1E293B]">
                  Daftar Mata Kuliah ({filteredCourses.length})
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="h-52 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] animate-pulse p-4"
                    />
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
                  <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-[13px] font-medium text-[#64748B]">
                    Tidak ada mata kuliah yang cocok dengan filter pencarian.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {filteredCourses.map((course) => {
                    const avatar = resolveCourseAvatar(course);
                    const hasManage = canManageCourse(course.id);
                    const hasPJ =
                      course.coordinators && course.coordinators.length > 0;
                    const pjNames = hasPJ
                      ? course.coordinators.map((c) => cleanName(c.user?.name)).join(', ')
                      : 'Belum ada PJ';
                    const { timeRange, jamSlot } = parseScheduleTime(
                      course.scheduleTime
                    );

                    return (
                      <div
                        key={`${course.id}-${iconVersion}`}
                        className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all h-full group"
                      >
                        <div>
                          {/* Top Row: Avatar + Badges on Left, Admin Tools on Right */}
                          <div className="flex items-center justify-between gap-2 mb-3.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CourseAvatarIcon
                                course={course}
                                size="md"
                                editable={true}
                                onClickEdit={(c) => setIconCrudCourse(c)}
                              />
                              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                <span
                                  className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wide truncate"
                                  style={{
                                    backgroundColor: avatar.bg,
                                    color: avatar.accent,
                                  }}
                                >
                                  {course.code}
                                </span>
                                <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[10.5px] font-semibold text-[#64748B] shrink-0">
                                  {course.credits} SKS
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setIconCrudCourse(course)}
                                title="Kelola / Ganti Icon Avatar Matkul"
                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1D63FF] hover:bg-[#EAF2FF] transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              {hasManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(course)}
                                    title="Edit Mata Kuliah"
                                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1D63FF] hover:bg-[#F8FAFC] transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  {isKetuaKelas && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteCourse(course.id, course.name)
                                      }
                                      title="Hapus Mata Kuliah"
                                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Course Title (Fixed 2-line min-height on desktop grid for uniform alignment) & Lecturer */}
                          <Link
                            to={`/course/${course.id}`}
                            className="block"
                          >
                            <h3 className="text-[15px] font-bold text-[#0F172A] group-hover:text-[#1D63FF] leading-[1.35] line-clamp-2 md:min-h-[41px] transition-colors">
                              {formatCourseTitle(course.name)}
                            </h3>
                          </Link>

                          <p className="text-[12.5px] font-medium text-[#64748B] truncate mt-1">
                            {formatLecturerName(course.lecturerName)}
                          </p>

                          {/* Structured 2-Column Schedule & Room Info Box */}
                          <div className="mt-4 bg-[#F8FAFC] border border-[#EEF2F6] rounded-xl p-2.5 sm:p-3 grid grid-cols-2 gap-2.5 sm:gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                                  Jadwal
                                </span>
                                {jamSlot && (
                                  <span className="text-[9.5px] font-bold text-[#475569] bg-white border border-[#E2E8F0] px-1.5 py-0.2 rounded shrink-0 whitespace-nowrap">
                                    {jamSlot}
                                  </span>
                                )}
                              </div>
                              <div className="text-[12px] sm:text-[12.5px] font-semibold text-[#1E293B] mt-0.5 truncate">
                                {course.scheduleDay || 'Senin'}
                              </div>
                              <div className="text-[11px] font-medium text-[#64748B] truncate">
                                {timeRange}
                              </div>
                            </div>

                            <div className="min-w-0 border-l border-[#E2E8F0] pl-2.5 sm:pl-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                                Ruang & PJ
                              </span>
                              <div className="text-[12px] sm:text-[12.5px] font-semibold text-[#1E293B] mt-0.5 truncate">
                                Ruang {course.room || '-'}
                              </div>
                              <div
                                className={`text-[11px] font-medium truncate ${
                                  hasPJ ? 'text-[#059669]' : 'text-[#94A3B8]'
                                }`}
                              >
                                {hasPJ ? `PJ: ${pjNames}` : pjNames}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Clean Footer Action Bar */}
                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                          <Link
                            to={`/course/${course.id}`}
                            style={{ backgroundColor: avatar.bg, color: avatar.accent }}
                            className="py-2.5 px-3 rounded-xl text-[12px] font-bold text-center hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span>Materi Kuliah</span>
                          </Link>

                          <Link
                            to={`/course/${course.id}?view=quiz`}
                            className="py-2.5 px-3 rounded-xl text-[12px] font-semibold text-center bg-white hover:bg-[#F8FAFC] text-[#334155] hover:text-[#1D63FF] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors inline-flex items-center justify-center gap-1.5"
                          >
                            <span>Latihan Soal</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR FOR MATERI KULIAH: DOSEN PENGAMPU & PJ MATKUL */}
          <aside className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-7">
            {/* 1. Daftar Dosen Pengampu */}
            <div>
              <h2 className="text-[15px] font-semibold text-[#1E293B] mb-4">
                Dosen Pengampu
              </h2>

              <div className="flex flex-col gap-2.5">
                {authorItems.length === 0 ? (
                  <p className="text-[12px] text-[#94A3B8] py-4 text-center">
                    Belum ada data dosen pengampu.
                  </p>
                ) : (
                  authorItems.map((author, idx) => {
                    const digitsOnly = (author.contact || '').replace(/\D/g, '');
                    const hasValidPhone = digitsOnly.length >= 6;
                    return (
                      <div
                        key={`${author.id}-${iconVersion}`}
                        style={{ backgroundColor: author.avatar.cardBg }}
                        className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AuthorAvatar index={idx} />
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-semibold text-[#1E293B] truncate">
                              {author.name}
                            </div>
                            <div className="text-[11px] font-medium text-[#64748B] truncate">
                              {author.subtitle}
                            </div>
                          </div>
                        </div>

                        {hasValidPhone ? (
                          <a
                            href={`https://wa.me/${digitsOnly}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Hubungi ${author.name}`}
                            style={{
                              backgroundColor: author.avatar.bg,
                              color: author.avatar.accent,
                            }}
                            className="px-2.5 py-[5px] rounded-[6px] text-[9px] font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1 hover:opacity-90"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>WA</span>
                          </a>
                        ) : (
                          <Link
                            to={`/course/${author.courseId}`}
                            style={{
                              backgroundColor: author.avatar.bg,
                              color: author.avatar.accent,
                            }}
                            className="px-2.5 py-[5px] rounded-[6px] text-[9px] font-bold uppercase tracking-wider shrink-0 hover:opacity-90"
                          >
                            MATERI
                          </Link>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Daftar PJ Mata Kuliah */}
            <div>
              <h2 className="text-[15px] font-semibold text-[#1E293B] mb-3">
                PJ Mata Kuliah
              </h2>

              <div className="divide-y divide-[#F1F5F9]">
                {courses.map((subj) => {
                  const pjList =
                    subj.coordinators && subj.coordinators.length > 0
                      ? subj.coordinators.map((c) => cleanName(c.user?.name)).join(', ')
                      : 'Belum ada PJ';

                  return (
                    <Link
                      key={subj.id}
                      to={`/course/${subj.id}`}
                      className="py-2.5 flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[#1E293B] group-hover:text-[#1D63FF] truncate transition-colors">
                          {subj.name}
                        </div>
                        <div className="text-[11.5px] font-medium text-[#64748B] mt-0.5 truncate">
                          PJ: <strong className="text-[#1E293B]">{pjList}</strong>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#1D63FF] shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ================================================================= */}
      {/* PERSONAL CHANGE PASSWORD MODAL                                    */}
      {/* ================================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-md p-6 shadow-xl animate-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#1E293B]">
                  Ubah Kata Sandi Akun
                </h2>
                <p className="text-[12px] text-[#64748B]">
                  Perbarui kata sandi untuk akun {cleanName(user?.name)} ({user?.nim})
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi lama"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
                >
                  {savingPassword ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ADD COURSE MODAL (Ketua Kelas only)                               */}
      {/* ================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#1E293B]">
                  Tambah Mata Kuliah Baru
                </h2>
                <p className="text-[12px] text-[#64748B]">
                  Masukkan informasi mata kuliah dan jadwal mingguan
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Singkatan Matkul
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JARKOM / IF301"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Semester & SKS
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={newCourse.semester}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, semester: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={newCourse.credits}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, credits: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Nama Mata Kuliah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Web Lanjut"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Nama Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Ir. Budi Santoso, M.Kom"
                    value={newCourse.lecturerName}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, lecturerName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Kontak Dosen (No WA)
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newCourse.lecturerContact}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, lecturerContact: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Weekly Recurrence Days */}
              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2.5">
                <label className="text-[12px] font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-[#1D63FF]" />
                  <span>Pilih Hari Pengulangan Kuliah (Mingguan)</span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {DAYS_LIST.map((day) => {
                    const isSelected = addSelectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleAddDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#1D63FF] text-white border-[#1D63FF]'
                            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E293B]'
                        }`}
                      >
                        {isSelected ? `✓ ${day}` : day}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-[#64748B]">
                  Berulang otomatis setiap hari:{' '}
                  <strong className="text-[#1D63FF] font-semibold">
                    {addSelectedDays.join(', ')}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Jam Perkuliahan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08:00 - 10:30 WIB"
                    value={newCourse.scheduleTime}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, scheduleTime: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Ruangan Kelas
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="R. 302 / Lab Komputer"
                    value={newCourse.room}
                    onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Playful Avatar Icon Picker */}
              <div className="p-3.5 bg-[#F4F7FE] border border-[#CFE2FF] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-[#1E293B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1D63FF]" />
                    <span>Pilih Icon Avatar Mata Kuliah</span>
                  </label>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[...PLAYFUL_AVATAR_PRESETS, ...getCustomIconsList()].map((item) => {
                    const isSelected = newCourse.iconId === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setNewCourse({ ...newCourse, iconId: item.id })}
                        title={item.name}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-white border-[#1D63FF] ring-2 ring-[#1D63FF]/20 scale-105'
                            : 'bg-white/70 border-[#E2E8F0] hover:bg-white'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden">
                          {item.renderSvg ? (
                            item.renderSvg()
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-[18px]"
                              style={{ backgroundColor: item.bg }}
                            >
                              {item.emoji}
                            </div>
                          )}
                        </div>
                        <span className="text-[9.5px] font-semibold text-[#1E293B] truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold transition-colors"
                >
                  Simpan Mata Kuliah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* EDIT COURSE MODAL                                                 */}
      {/* ================================================================= */}
      {showEditModal && editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#1E293B]">
                  Ubah Data Mata Kuliah
                </h2>
                <p className="text-[12px] text-[#64748B]">
                  Perbarui detail jadwal, ruangan, atau dosen pengampu
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCourse} className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Singkatan Matkul
                  </label>
                  <input
                    type="text"
                    required
                    value={editCourse.code}
                    onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Semester & SKS
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={editCourse.semester}
                      onChange={(e) =>
                        setEditCourse({ ...editCourse, semester: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={editCourse.credits}
                      onChange={(e) =>
                        setEditCourse({ ...editCourse, credits: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Nama Mata Kuliah
                </label>
                <input
                  type="text"
                  required
                  value={editCourse.name}
                  onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Nama Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    required
                    value={editCourse.lecturerName}
                    onChange={(e) =>
                      setEditCourse({ ...editCourse, lecturerName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Kontak Dosen (No WA)
                  </label>
                  <input
                    type="text"
                    value={editCourse.lecturerContact}
                    onChange={(e) =>
                      setEditCourse({ ...editCourse, lecturerContact: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2.5">
                <label className="text-[12px] font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-[#1D63FF]" />
                  <span>Pilih Hari Pengulangan Kuliah</span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {DAYS_LIST.map((day) => {
                    const isSelected = editSelectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleEditDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#1D63FF] text-white border-[#1D63FF]'
                            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E293B]'
                        }`}
                      >
                        {isSelected ? `✓ ${day}` : day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Jam Perkuliahan
                  </label>
                  <input
                    type="text"
                    value={editCourse.scheduleTime}
                    onChange={(e) =>
                      setEditCourse({ ...editCourse, scheduleTime: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Ruangan Kelas
                  </label>
                  <input
                    type="text"
                    value={editCourse.room}
                    onChange={(e) => setEditCourse({ ...editCourse, room: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Playful Avatar Icon Picker in Edit Modal */}
              <div className="p-3.5 bg-[#F4F7FE] border border-[#CFE2FF] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-[#1E293B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1D63FF]" />
                    <span>Pilih Icon Avatar Mata Kuliah</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const targetCourse = courses.find((c) => c.id === editCourse.id);
                      if (targetCourse) {
                        setShowEditModal(false);
                        setIconCrudCourse(targetCourse);
                      }
                    }}
                    className="text-[11px] font-bold text-[#1D63FF] hover:underline"
                  >
                    + Kelola / Buat Icon Custom
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[...PLAYFUL_AVATAR_PRESETS, ...getCustomIconsList()].map((item) => {
                    const isSelected = editCourse.iconId === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setEditCourse({ ...editCourse, iconId: item.id })}
                        title={item.name}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-white border-[#1D63FF] ring-2 ring-[#1D63FF]/20 scale-105'
                            : 'bg-white/70 border-[#E2E8F0] hover:bg-white'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden">
                          {item.renderSvg ? (
                            item.renderSvg()
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-[18px]"
                              style={{ backgroundColor: item.bg }}
                            >
                              {item.emoji}
                            </div>
                          )}
                        </div>
                        <span className="text-[9.5px] font-semibold text-[#1E293B] truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ADD ANNOUNCEMENT MODAL                                            */}
      {/* ================================================================= */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-md p-6 shadow-xl animate-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#1E293B]">
                  Buat Pengumuman Kelas
                </h2>
                <p className="text-[12px] text-[#64748B]">
                  Tampilkan informasi penting di halaman Dashboard
                </p>
              </div>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kuliah Pengganti Hari Kamis Jam 14:00"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  Isi Pengumuman
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tuliskan detail pengumuman untuk seluruh teman sekelas..."
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={newAnnouncement.isUrgent}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, isUrgent: e.target.checked })
                  }
                  className="w-4 h-4 text-[#1D63FF] border-[#E2E8F0] rounded focus:ring-[#1D63FF]"
                />
                <label htmlFor="isUrgent" className="text-[12px] text-[#1E293B] cursor-pointer">
                  Tandai sebagai <strong className="text-[#E11D48]">Penting</strong> (Banner Merah)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAnnouncement}
                  className="px-5 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
                >
                  {savingAnnouncement ? 'Mempublikasikan...' : 'Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Icon CRUD Modal */}
      <CourseIconCrudModal
        open={!!iconCrudCourse}
        course={iconCrudCourse}
        saving={savingIconCrud}
        onClose={() => setIconCrudCourse(null)}
        onSaveIcon={handleSaveIconCrud}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        loading={confirmState.loading}
        confirmText={confirmState.confirmText}
        onConfirm={confirmState.onConfirm}
        onCancel={() =>
          setConfirmState({
            open: false,
            title: '',
            message: '',
            onConfirm: null,
            loading: false,
            confirmText: 'Ya, Hapus',
          })
        }
      />
    </div>
  );
}
