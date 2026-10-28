import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import CornerReticle from '../components/CornerReticle';
import { 
  Calendar as CalendarIcon, Clock, MapPin, AlertTriangle, 
  Plus, Edit3, Trash2, Phone, ChevronLeft, ChevronRight, 
  CheckCircle2, Bell, BookOpen, Repeat, FlaskConical, Bookmark, CalendarDays 
} from 'lucide-react';

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function ScheduleCalendar() {
  const { user, isKetuaKelas, isPJMatkul, canManageCourse } = useAuth();
  const toast = useToast();
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'YA, LANJUTKAN' });
  const closeConfirm = () => setConfirmState({ open: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'YA, LANJUTKAN' });
  const [courses, setCourses] = useState([]);
  const [practicums, setPracticums] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar Navigation
  const [viewDate, setViewDate] = useState(new Date()); // Current month in view
  const [selectedDate, setSelectedDate] = useState(new Date()); // Selected day for Detail

  // Class Agenda Modal (Kegiatan / Acara Luar Matkul & Praktikum)
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [isEditingAgenda, setIsEditingAgenda] = useState(false);
  const [agendaData, setAgendaData] = useState({
    id: null,
    title: '',
    category: 'RAPAT',
    date: '',
    startTime: '13:00',
    endTime: '15:00',
    location: 'Ruang Kelas / Online',
    description: '',
  });
  const [savingAgenda, setSavingAgenda] = useState(false);

  // Add Course Modal (Ketua Kelas)
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
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
  });
  const [savingCourse, setSavingCourse] = useState(false);

  // Reschedule Modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    courseId: '',
    newDate: '',
    newStartTime: '13:00',
    newEndTime: '15:30',
    newRoom: '',
    reason: '',
  });
  const [savingReschedule, setSavingReschedule] = useState(false);

  // Edit Regular Schedule Modal
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editSelectedDays, setEditSelectedDays] = useState(['Senin']);
  const [editCourseData, setEditCourseData] = useState({
    courseId: '',
    courseName: '',
    scheduleTime: '',
    room: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Practicum Schedule Modal (Ketua Kelas atau PJ Matkul)
  const [showPracticumModal, setShowPracticumModal] = useState(false);
  const [isEditingPracticum, setIsEditingPracticum] = useState(false);
  const [practicumSelectedDays, setPracticumSelectedDays] = useState(['Senin']);
  const [practicumData, setPracticumData] = useState({
    id: null,
    courseId: '',
    title: '',
    isRecurring: true,
    date: '',
    startTime: '13:00',
    endTime: '15:30',
    room: 'Lab Komputer 01',
    assistant: '',
    group: 'Shift 1',
    notes: '',
  });
  const [savingPracticum, setSavingPracticum] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedRes, assignRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/assignments'),
      ]);
      setCourses(schedRes.data.courses || []);
      setPracticums(schedRes.data.practicums || []);
      setAgendas(schedRes.data.agendas || []);
      setAssignments(assignRes.data.assignments || []);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar Grid Calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Starting day of week: adjust so Monday is first (1: Sen, 2: Sel ... 0: Min)
  const firstDayRaw = new Date(year, month, 1).getDay(); // 0 is Sunday
  const startDayOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // 0 for Monday, 6 for Sunday

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Extract all active reschedules
  const allReschedules = courses.flatMap((course) =>
    (course.reschedules || []).map((r) => ({ ...r, course }))
  );

  // Check events for a specific day in the calendar grid
  const getEventsForDate = (dateObj) => {
    const dayName = INDO_DAYS[dateObj.getDay()];
    const dateKey = formatDateKey(dateObj);

    // Regular courses on this day (supports recurring multi-days like "Senin, Kamis")
    const regularClasses = courses.filter((c) => {
      if (!c.scheduleDay) return false;
      const days = c.scheduleDay.split(',').map((d) => d.trim());
      return days.includes(dayName);
    });

    // Reschedules specifically on this date
    const dateReschedules = allReschedules.filter((r) => {
      const rKey = formatDateKey(new Date(r.newDate));
      return rKey === dateKey;
    });

    // Deadlines on this date
    const dateDeadlines = assignments.filter((a) => {
      const aKey = formatDateKey(new Date(a.deadline));
      return aKey === dateKey;
    });

    // Practicums on this date (recurring weekly or specific date)
    const datePracticums = practicums.filter((p) => {
      if (p.isRecurring) {
        if (!p.day) return false;
        const days = p.day.split(',').map((d) => d.trim());
        return days.includes(dayName);
      } else if (p.date) {
        const pKey = formatDateKey(new Date(p.date));
        return pKey === dateKey;
      }
      return false;
    });

    // Class Agendas on this date
    const dateAgendas = agendas.filter((a) => {
      if (!a.date) return false;
      const aKey = formatDateKey(new Date(a.date));
      return aKey === dateKey;
    });

    return { regularClasses, dateReschedules, dateDeadlines, datePracticums, dateAgendas };
  };

  // Detail for the selected date
  const selectedEvents = getEventsForDate(selectedDate);
  const selectedDayName = INDO_DAYS[selectedDate.getDay()];
  const selectedFormatted = selectedDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isToday = (d) => formatDateKey(d) === formatDateKey(new Date());
  const isSelected = (d) => formatDateKey(d) === formatDateKey(selectedDate);

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

  // Handlers for Modals
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      await api.post('/courses', {
        ...newCourse,
        scheduleDay: addSelectedDays.join(', '),
      });
      setShowAddCourseModal(false);
      setNewCourse({
        code: '',
        name: '',
        semester: 4,
        credits: 3,
        lecturerName: '',
        lecturerContact: '',
        scheduleTime: '08:00 - 10:30 WIB',
        room: 'Ruang Kuliah',
      });
      setAddSelectedDays(['Senin']);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan mata kuliah.');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleOpenEditSchedule = (course) => {
    const days = course.scheduleDay
      ? course.scheduleDay.split(',').map((d) => d.trim())
      : ['Senin'];
    setEditSelectedDays(days);
    setEditCourseData({
      courseId: course.id,
      courseName: course.name,
      scheduleTime: course.scheduleTime || '08:00 - 10:30 WIB',
      room: course.room || 'Ruang Kuliah',
    });
    setShowEditScheduleModal(true);
  };

  const handleSaveRegularSchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      await api.put(`/schedules/course/${editCourseData.courseId}`, {
        scheduleDay: editSelectedDays.join(', '),
        scheduleTime: editCourseData.scheduleTime,
        room: editCourseData.room,
      });
      setShowEditScheduleModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan jadwal.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleCreateReschedule = async (e) => {
    e.preventDefault();
    setSavingReschedule(true);
    try {
      await api.post('/schedules/reschedule', rescheduleData);
      setShowRescheduleModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat reschedule.');
    } finally {
      setSavingReschedule(false);
    }
  };

  const handleDeleteReschedule = (id) => {
    setConfirmState({
      open: true,
      title: 'Batalkan Reschedule',
      message: 'Batalkan jadwal reschedule ini?',
      confirmText: 'YA, BATALKAN',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmState((s) => ({ ...s, loading: true }));
          await api.delete(`/schedules/reschedule/${id}`);
          closeConfirm();
          toast.success('Reschedule berhasil dibatalkan.');
          fetchData();
        } catch (err) {
          closeConfirm();
          toast.error('Gagal membatalkan reschedule.');
        }
      },
    });
  };

  // Handlers for Practicum
  const handleOpenAddPracticum = () => {
    setIsEditingPracticum(false);
    setPracticumSelectedDays([selectedDayName || 'Senin']);
    setPracticumData({
      id: null,
      courseId: courses[0]?.id ? String(courses[0].id) : '',
      title: courses[0] ? `Praktikum ${courses[0].name}` : 'Praktikum Komputer',
      isRecurring: true,
      date: formatDateKey(selectedDate),
      startTime: '13:00',
      endTime: '15:30',
      room: 'Lab Komputer 01',
      assistant: '',
      group: 'Shift 1',
      notes: '',
    });
    setShowPracticumModal(true);
  };

  const handleOpenEditPracticum = (p) => {
    setIsEditingPracticum(true);
    const days = p.day ? p.day.split(',').map((d) => d.trim()) : ['Senin'];
    setPracticumSelectedDays(days);
    setPracticumData({
      id: p.id,
      courseId: p.courseId ? String(p.courseId) : '',
      title: p.title,
      isRecurring: p.isRecurring,
      date: p.date ? formatDateKey(new Date(p.date)) : formatDateKey(selectedDate),
      startTime: p.startTime || '13:00',
      endTime: p.endTime || '15:30',
      room: p.room || 'Lab Komputer',
      assistant: p.assistant || '',
      group: p.group || '',
      notes: p.notes || '',
    });
    setShowPracticumModal(true);
  };

  const togglePracticumDay = (day) => {
    if (practicumSelectedDays.includes(day)) {
      if (practicumSelectedDays.length > 1) {
        setPracticumSelectedDays(practicumSelectedDays.filter((d) => d !== day));
      }
    } else {
      setPracticumSelectedDays([...practicumSelectedDays, day]);
    }
  };

  const handleSavePracticum = async (e) => {
    e.preventDefault();
    setSavingPracticum(true);
    try {
      const payload = {
        ...practicumData,
        courseId: practicumData.courseId ? Number(practicumData.courseId) : null,
        day: practicumSelectedDays.join(', '),
      };

      if (isEditingPracticum && practicumData.id) {
        await api.put(`/schedules/practicum/${practicumData.id}`, payload);
      } else {
        await api.post('/schedules/practicum', payload);
      }

      setShowPracticumModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan jadwal praktikum.');
    } finally {
      setSavingPracticum(false);
    }
  };

  const handleDeletePracticum = (id) => {
    setConfirmState({
      open: true,
      title: 'Hapus Jadwal Praktikum',
      message: 'Hapus jadwal praktikum ini? Tindakan ini tidak bisa dibatalkan.',
      confirmText: 'YA, HAPUS',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmState((s) => ({ ...s, loading: true }));
          await api.delete(`/schedules/practicum/${id}`);
          closeConfirm();
          toast.success('Jadwal praktikum berhasil dihapus.');
          fetchData();
        } catch (err) {
          closeConfirm();
          toast.error('Gagal menghapus jadwal praktikum.');
        }
      },
    });
  };

  // Handlers for Class Agenda (Acara / Kegiatan Luar Matkul)
  const handleOpenAddAgenda = () => {
    setIsEditingAgenda(false);
    setAgendaData({
      id: null,
      title: '',
      category: 'RAPAT',
      date: formatDateKey(selectedDate),
      startTime: '13:00',
      endTime: '15:00',
      location: 'Ruang Kelas / Online',
      description: '',
    });
    setShowAgendaModal(true);
  };

  const handleOpenEditAgenda = (agenda) => {
    setIsEditingAgenda(true);
    setAgendaData({
      id: agenda.id,
      title: agenda.title,
      category: agenda.category || 'UMUM',
      date: formatDateKey(new Date(agenda.date)),
      startTime: agenda.startTime || '13:00',
      endTime: agenda.endTime || '15:00',
      location: agenda.location || 'Ruang Kelas / Online',
      description: agenda.description || '',
    });
    setShowAgendaModal(true);
  };

  const handleSaveAgenda = async (e) => {
    e.preventDefault();
    setSavingAgenda(true);
    try {
      if (isEditingAgenda && agendaData.id) {
        await api.put(`/schedules/agenda/${agendaData.id}`, agendaData);
      } else {
        await api.post('/schedules/agenda', agendaData);
      }
      setShowAgendaModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan agenda kegiatan.');
    } finally {
      setSavingAgenda(false);
    }
  };

  const handleDeleteAgenda = (id) => {
    setConfirmState({
      open: true,
      title: 'Hapus Agenda',
      message: 'Hapus agenda kegiatan ini?',
      confirmText: 'YA, HAPUS',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmState((s) => ({ ...s, loading: true }));
          await api.delete(`/schedules/agenda/${id}`);
          closeConfirm();
          toast.success('Agenda berhasil dihapus.');
          fetchData();
        } catch (err) {
          closeConfirm();
          toast.error('Gagal menghapus agenda kegiatan.');
        }
      },
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* ========================================================= */}
      {/* 1. BAGIAN ATAS: DETAIL AGENDA TANGGAL (MIRIP DEADLINE BOARD) */}
      {/* ========================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 relative">
        <CornerReticle />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-grid-border pb-4 mb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 bg-brand-orange inline-block"></span>
              <span className="font-mono text-[11px] font-bold text-brand-orange uppercase tracking-wider">
                DETAIL AGENDA HARIAN
              </span>
            </div>
            <h1 className="font-tech text-2xl sm:text-3xl font-bold uppercase text-ink">
              {selectedFormatted}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={goToToday}
              className="h-9 px-3.5 bg-canvas-dark hover:bg-canvas-subtle border border-[#E2E8F0] rounded-xl text-ink font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center shadow-brutal transition-transform active:translate-x-0.5 active:translate-y-0.5 shrink-0"
              title="Kembali ke Hari Ini"
            >
              HARI INI
            </button>

            {isKetuaKelas && (
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="h-9 px-3.5 bg-white hover:bg-canvas-subtle border border-[#E2E8F0] rounded-xl text-ink font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center space-x-1.5 shadow-brutal transition-transform active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                title="Tambah Mata Kuliah"
              >
                <Plus className="w-3.5 h-3.5 text-brand-orange" />
                <span>MATKUL</span>
              </button>
            )}

            {(isKetuaKelas || isPJMatkul) && (
              <>
                <button
                  onClick={handleOpenAddPracticum}
                  className="h-9 px-3.5 bg-teal-600 hover:bg-teal-700 text-white border border-[#E2E8F0] rounded-xl font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center space-x-1.5 shadow-brutal transition-transform active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                  title="Tambah Jadwal Praktikum / Lab"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>PRAKTIKUM</span>
                </button>

                <button
                  onClick={() => {
                    setRescheduleData({
                      ...rescheduleData,
                      newDate: formatDateKey(selectedDate),
                    });
                    setShowRescheduleModal(true);
                  }}
                  className="h-9 px-3.5 bg-[#1D63FF] hover:bg-[#1550D6] rounded-xl text-white border border-[#E2E8F0] rounded-xl font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center space-x-1.5 shadow-brutal transition-transform active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                  title="Reschedule / Kuliah Pengganti"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>RESCHEDULE</span>
                </button>
              </>
            )}

            <button
              onClick={handleOpenAddAgenda}
              className="h-9 px-3.5 bg-purple-600 hover:bg-purple-700 text-white border border-[#E2E8F0] rounded-xl font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center space-x-1.5 shadow-brutal transition-transform active:translate-x-0.5 active:translate-y-0.5 shrink-0"
              title="Tambah Agenda Kegiatan Kelas"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>AGENDA</span>
            </button>
          </div>
        </div>

        {/* DETAIL CONTENT: CLASSES, PRACTICUMS, AGENDAS & DEADLINES FOR SELECTED DATE */}
        {selectedEvents.regularClasses.length === 0 && 
         selectedEvents.dateReschedules.length === 0 && 
         selectedEvents.datePracticums.length === 0 && 
         selectedEvents.dateAgendas.length === 0 && 
         selectedEvents.dateDeadlines.length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-ink-muted">
            Tidak ada perkuliahan reguler, praktikum lab, agenda kegiatan kelas, kuliah pengganti, atau tenggat tugas di tanggal ini.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Class Agendas on this day */}
            {selectedEvents.dateAgendas.map((agenda) => {
              const canManage = isKetuaKelas || (agenda.createdById === user?.id);
              return (
                <div
                  key={agenda.id}
                  className="p-4 bg-purple-50/70 border-2 border-purple-600 relative flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-purple-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-purple-700 text-white px-2 py-0.5 uppercase flex items-center space-x-1">
                        <Bookmark className="w-3 h-3" />
                        <span>AGENDA KELAS</span>
                      </span>
                      <span className="font-mono text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 uppercase">
                        {agenda.category}
                      </span>
                      {agenda.createdBy && (
                        <span className="font-mono text-[10px] text-ink-muted">
                          • Dibuat oleh: <strong className="text-ink">{agenda.createdBy.name}</strong>
                        </span>
                      )}
                    </div>

                    <h3 className="font-tech text-lg font-bold text-ink uppercase">
                      {agenda.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-ink-muted">
                      <div className="flex items-center space-x-1 text-purple-950 font-bold">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>{agenda.startTime} - {agenda.endTime || 'Selesai'} WIB</span>
                      </div>

                      <div className="flex items-center space-x-1 text-ink font-bold bg-white border border-grid-border px-2 py-0.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <span>{agenda.location}</span>
                      </div>
                    </div>

                    {agenda.description && (
                      <p className="font-sans text-xs text-ink-muted bg-white/80 border border-purple-200 p-2 mt-1">
                        <strong className="text-purple-900 font-mono text-[11px]">Keterangan:</strong> {agenda.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
                      <button
                        onClick={() => handleOpenEditAgenda(agenda)}
                        className="py-1.5 px-3 bg-white border border-purple-600 hover:bg-purple-600 hover:text-white text-purple-800 text-[11px] font-mono font-bold uppercase transition-colors flex items-center space-x-1"
                        title="Ubah Agenda"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-600 hover:text-white" />
                        <span>UBAH</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAgenda(agenda.id)}
                        className="py-1.5 px-3 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-[11px] font-mono font-bold uppercase transition-colors"
                        title="Hapus Agenda"
                      >
                        HAPUS
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Active Practicums on this day */}
            {selectedEvents.datePracticums.map((p) => {
              const canManage = isKetuaKelas || (p.courseId && canManageCourse(p.courseId));
              return (
                <div
                  key={p.id}
                  className="p-4 bg-teal-50/70 border-2 border-teal-600 relative flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-teal-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-teal-700 text-white px-2 py-0.5 uppercase flex items-center space-x-1">
                        <FlaskConical className="w-3 h-3" />
                        <span>PRAKTIKUM / LAB</span>
                      </span>
                      {p.course && (
                        <span className="font-mono text-xs font-bold bg-ink text-white px-2 py-0.5">
                          {p.course.code}
                        </span>
                      )}
                      {p.group && (
                        <span className="font-mono text-[11px] font-bold text-teal-900 bg-teal-100 border border-teal-300 px-1.5 py-0.5">
                          {p.group}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-ink-muted">
                        {p.isRecurring ? `• Berulang Setiap ${p.day}` : '• Sesi Khusus'}
                      </span>
                    </div>

                    <h3 className="font-tech text-lg font-bold text-ink uppercase">
                      {p.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-ink-muted">
                      <div className="flex items-center space-x-1 text-teal-950 font-bold">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{p.startTime} - {p.endTime || 'Selesai'} WIB</span>
                      </div>

                      <div className="flex items-center space-x-1 text-ink font-bold bg-white border border-grid-border px-2 py-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>{p.room}</span>
                      </div>

                      {p.assistant && (
                        <div className="flex items-center space-x-1 text-ink">
                          <span>Asisten / Pembimbing: </span>
                          <strong className="text-teal-950 font-sans font-semibold">{p.assistant}</strong>
                        </div>
                      )}
                    </div>

                    {p.notes && (
                      <p className="font-sans text-xs text-ink-muted bg-white/80 border border-teal-200 p-2 mt-1">
                        <strong className="text-teal-900 font-mono text-[11px]">Catatan / Bahan:</strong> {p.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
                      <button
                        onClick={() => handleOpenEditPracticum(p)}
                        className="py-1.5 px-3 bg-white border border-teal-600 hover:bg-teal-600 hover:text-white text-teal-800 text-[11px] font-mono font-bold uppercase transition-colors flex items-center space-x-1"
                        title="Ubah Jadwal Praktikum"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-teal-600 hover:text-white" />
                        <span>UBAH</span>
                      </button>
                      <button
                        onClick={() => handleDeletePracticum(p.id)}
                        className="py-1.5 px-3 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-[11px] font-mono font-bold uppercase transition-colors"
                        title="Hapus Jadwal Praktikum"
                      >
                        HAPUS
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active Reschedules on this day */}
            {selectedEvents.dateReschedules.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-amber-50 border-2 border-amber-500 relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-[10px] font-bold bg-amber-500 text-black px-1.5 py-0.5 uppercase">
                      KULIAH PENGGANTI (RESCHEDULE)
                    </span>
                    <span className="font-mono text-xs font-bold text-ink">
                      [{item.course.code}] {item.course.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs pt-1">
                    <div className="flex items-center space-x-1 text-red-700 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.newStartTime} - {item.newEndTime || 'Selesai'} WIB</span>
                    </div>
                    <div className="flex items-center space-x-1 text-ink font-bold">
                      <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Ruangan: {item.newRoom}</span>
                    </div>
                  </div>

                  {item.reason && (
                    <p className="font-sans text-xs text-ink-muted italic mt-1">
                      Alasan: "{item.reason}"
                    </p>
                  )}
                </div>

                {(isKetuaKelas || canManageCourse(item.course.id)) && (
                  <button
                    onClick={() => handleDeleteReschedule(item.id)}
                    className="self-start sm:self-center py-1 px-2.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-[11px] font-mono font-bold uppercase transition-colors"
                  >
                    BATALKAN
                  </button>
                )}
              </div>
            ))}

            {/* Regular Classes on this day */}
            {selectedEvents.regularClasses.map((course) => {
              const canEdit = canManageCourse(course.id);

              return (
                <div
                  key={course.id}
                  className="p-4 bg-canvas-subtle border border-grid-border hover:border-ink transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-ink text-white px-2 py-0.5">
                        {course.code}
                      </span>
                      <span className="font-mono text-xs text-ink-muted">
                        SEM {course.semester} • {course.credits} SKS
                      </span>
                    </div>

                    <h3 className="font-tech text-lg font-bold text-ink uppercase">
                      {course.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-ink-muted">
                      <div className="flex items-center space-x-1 text-ink font-bold">
                        <Clock className="w-3.5 h-3.5 text-brand-orange" />
                        <span>{course.scheduleTime || '08:00 - 10:30 WIB'}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-ink font-bold bg-brand-orange/10 border border-brand-orange/30 px-2 py-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                        <span>{course.room || 'Ruangan Belum Diatur'}</span>
                      </div>

                      <div>
                        <span>Dosen: </span>
                        <strong className="text-ink font-sans font-semibold">
                          {course.lecturerName}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-start md:self-center">
                    {course.lecturerContact && (
                      <a
                        href={`https://wa.me/${course.lecturerContact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white border border-grid-border hover:border-ink text-green-700 transition-colors"
                        title="Hubungi Dosen via WA"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => handleOpenEditSchedule(course)}
                        className="py-1.5 px-3 bg-white border border-grid-border hover:border-brand-orange text-ink font-mono text-xs font-bold uppercase flex items-center space-x-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-orange" />
                        <span>UBAH RUANGAN / JAM</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Deadlines due on this date */}
            {selectedEvents.dateDeadlines.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-red-50 border border-red-300 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold bg-red-600 text-white px-1.5 py-0.5 text-[10px] uppercase">
                    DEADLINE TUGAS
                  </span>
                  <span className="font-bold text-ink">
                    [{task.course?.code}] {task.title}
                  </span>
                </div>
                <span className="text-red-700 font-bold">
                  Pukul {new Date(task.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. BAGIAN BAWAH: REAL CALENDAR GRID (1 - 30 / 31)         */}
      {/* ========================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 relative">
        <CornerReticle />
        
        {/* Calendar Month Navigation Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-brand-orange" />
            <h2 className="font-tech text-2xl font-bold uppercase tracking-tight text-ink">
              {INDO_MONTHS[month]} {year}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 border border-grid-border hover:border-ink bg-canvas-subtle hover:bg-white transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border border-grid-border hover:border-ink bg-canvas-subtle hover:bg-white transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container with horizontal scroll on small mobile screens */}
        <div className="overflow-x-auto -mx-2 sm:mx-0 pb-2">
          <div className="min-w-[580px] sm:min-w-0">
            {/* Day Name Header Row (Senin - Minggu) */}
            <div className="grid grid-cols-7 border-t border-l border-grid-border text-center font-mono text-xs font-bold text-ink uppercase bg-canvas-dark">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((d) => (
                <div key={d} className="py-2.5 border-r border-b border-grid-border">
                  {d}
                </div>
              ))}
            </div>

            {/* Days 1 - 30/31 Grid */}
            <div className="grid grid-cols-7 border-l border-grid-border">
              {/* Empty offset days for previous month */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[90px] sm:min-h-[110px] bg-canvas-subtle/40 border-r border-b border-grid-border p-2"
                />
              ))}

              {/* Actual days 1 to daysInMonth */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDate = new Date(year, month, dayNum);
                const events = getEventsForDate(cellDate);
                const activeToday = isToday(cellDate);
                const activeSelected = isSelected(cellDate);

                const hasClasses = events.regularClasses.length > 0;
                const hasReschedules = events.dateReschedules.length > 0;
                const hasPracticums = events.datePracticums.length > 0;
                const hasAgendas = events.dateAgendas.length > 0;
                const hasDeadlines = events.dateDeadlines.length > 0;

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDate(cellDate)}
                    className={`min-h-[90px] sm:min-h-[110px] border-r border-b border-grid-border p-2 cursor-pointer transition-all flex flex-col justify-between ${
                      activeSelected
                        ? 'bg-brand-orange/10 ring-2 ring-brand-orange z-10'
                        : 'bg-white hover:bg-canvas-subtle'
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-bold w-6 h-6 flex items-center justify-center ${
                          activeToday
                            ? 'bg-brand-orange text-white'
                            : activeSelected
                            ? 'bg-ink text-white'
                            : 'text-ink'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Micro indicator counts */}
                      <div className="flex items-center space-x-1">
                        {hasReschedules && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Ada Reschedule" />
                        )}
                        {hasPracticums && (
                          <span className="w-2 h-2 rounded-full bg-teal-600" title="Ada Praktikum / Lab" />
                        )}
                        {hasAgendas && (
                          <span className="w-2 h-2 rounded-full bg-purple-600" title="Ada Agenda Kelas" />
                        )}
                        {hasDeadlines && (
                          <span className="w-2 h-2 rounded-full bg-red-600" title="Ada Deadline Tugas" />
                        )}
                      </div>
                    </div>

                    {/* Event Tags inside the cell */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {hasReschedules && (
                        <div className="text-[9px] font-mono font-bold bg-amber-500 text-black px-1 py-0.5 truncate uppercase">
                          ⚠️ Reschedule ({events.dateReschedules.length})
                        </div>
                      )}

                      {hasPracticums && (
                        <div className="text-[9px] font-mono font-bold bg-teal-600 text-white px-1 py-0.5 truncate uppercase">
                          🧪 Lab ({events.datePracticums.length})
                        </div>
                      )}

                      {hasAgendas && (
                        <div className="text-[9px] font-mono font-bold bg-purple-600 text-white px-1 py-0.5 truncate uppercase">
                          📌 Agenda ({events.dateAgendas.length})
                        </div>
                      )}

                      {hasClasses && (
                        <div className="text-[9px] font-mono text-ink bg-canvas-dark border border-grid-border px-1 py-0.5 truncate">
                          {events.regularClasses.map((c) => c.code).join(', ')}
                        </div>
                      )}

                      {hasDeadlines && (
                        <div className="text-[9px] font-mono font-bold bg-red-600 text-white px-1 py-0.5 truncate uppercase">
                          Tugas ({events.dateDeadlines.length})
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] font-mono text-ink-muted text-right truncate">
                      {hasClasses && `${events.regularClasses.length} Kuliah `}
                      {hasPracticums && `${events.datePracticums.length} Lab `}
                      {hasAgendas && `${events.dateAgendas.length} Agenda`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-grid-border flex flex-wrap items-center gap-4 text-xs font-mono text-ink-muted">
          <span className="font-bold text-ink">KETERANGAN:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-brand-orange inline-block"></span>
            <span>Hari Ini</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-ink inline-block"></span>
            <span>Tanggal Dipilih</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
            <span>Praktikum / Laboratorium</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
            <span>Agenda Kegiatan Kelas</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Kuliah Pengganti (Reschedule)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
            <span>Tenggat Tugas Kuliah</span>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit Jadwal Praktikum */}
      {showPracticumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 relative shadow-xl animate-in max-h-[90vh] overflow-y-auto">
            <CornerReticle />
            <div className="flex items-center justify-between border-b border-grid-border pb-3 mb-4">
              <h3 className="font-tech text-xl font-bold uppercase text-ink flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                <span>{isEditingPracticum ? 'EDIT JADWAL PRAKTIKUM' : '+ TAMBAH JADWAL PRAKTIKUM'}</span>
              </h3>
              <button
                onClick={() => setShowPracticumModal(false)}
                className="font-mono text-xs font-bold px-2 py-1 bg-canvas-dark border border-grid-border hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePracticum} className="space-y-3 font-sans text-xs">
              {/* Mata Kuliah Terkait */}
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Mata Kuliah Terkait
                </label>
                <select
                  value={practicumData.courseId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const selected = courses.find((c) => String(c.id) === String(cId));
                    setPracticumData({
                      ...practicumData,
                      courseId: cId,
                      title: selected ? `Praktikum ${selected.name}` : practicumData.title,
                    });
                  }}
                  className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                >
                  <option value="">-- Praktikum Mandiri / Tanpa Matkul Khusus --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Judul / Nama Praktikum */}
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Judul / Nama Praktikum *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praktikum Jaringan Komputer"
                  value={practicumData.title}
                  onChange={(e) => setPracticumData({ ...practicumData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-sans bg-canvas-subtle"
                />
              </div>

              {/* Tipe Pengulangan: Rutin Mingguan vs Tanggal Spesifik */}
              <div className="p-3 bg-canvas-subtle border border-grid-border space-y-2">
                <label className="font-mono text-[11px] font-bold uppercase text-ink flex items-center space-x-1.5">
                  <Repeat className="w-3.5 h-3.5 text-teal-600" />
                  <span>POLA JADWAL PRAKTIKUM</span>
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setPracticumData({ ...practicumData, isRecurring: true })}
                    className={`py-1.5 px-3 border text-center transition-all ${
                      practicumData.isRecurring
                        ? 'bg-teal-600 text-white font-bold border-teal-600 shadow-sm'
                        : 'bg-white text-ink border-grid-border hover:border-ink'
                    }`}
                  >
                    Rutin Mingguan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticumData({ ...practicumData, isRecurring: false })}
                    className={`py-1.5 px-3 border text-center transition-all ${
                      !practicumData.isRecurring
                        ? 'bg-teal-600 text-white font-bold border-teal-600 shadow-sm'
                        : 'bg-white text-ink border-grid-border hover:border-ink'
                    }`}
                  >
                    Tanggal Tertentu (Khusus)
                  </button>
                </div>

                {practicumData.isRecurring ? (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-mono text-ink-muted block">
                      PILIH HARI PRAKTIKUM:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => {
                        const isDaySelected = practicumSelectedDays.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => togglePracticumDay(day)}
                            className={`px-3 py-1 font-mono text-xs font-bold uppercase border transition-all ${
                              isDaySelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-white text-ink border-grid-border hover:border-ink'
                            }`}
                          >
                            {isDaySelected ? `✓ ${day}` : day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <label className="block font-mono text-[10px] text-ink-muted mb-1">
                      TANGGAL PRAKTIKUM:
                    </label>
                    <input
                      type="date"
                      required={!practicumData.isRecurring}
                      value={practicumData.date}
                      onChange={(e) => setPracticumData({ ...practicumData, date: e.target.value })}
                      className="w-full px-3 py-1.5 border border-grid-border font-mono bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Waktu Praktikum */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={practicumData.startTime}
                    onChange={(e) => setPracticumData({ ...practicumData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={practicumData.endTime}
                    onChange={(e) => setPracticumData({ ...practicumData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
              </div>

              {/* Ruangan & Shift/Kelompok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Ruangan Lab *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lab Komputer 02 / Gd. C Lt. 2"
                    value={practicumData.room}
                    onChange={(e) => setPracticumData({ ...practicumData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Shift / Kelompok
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Shift 1 / Seluruh Kelas"
                    value={practicumData.group}
                    onChange={(e) => setPracticumData({ ...practicumData, group: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
              </div>

              {/* Asisten Lab / Dosen */}
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Asisten Laboratorium / Dosen Pembimbing
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kak Sarah & Kak Kevin (Aslab)"
                  value={practicumData.assistant}
                  onChange={(e) => setPracticumData({ ...practicumData, assistant: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-sans bg-canvas-subtle"
                />
              </div>

              {/* Catatan / Bahan Persiapan */}
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Catatan / Bahan Persiapan Praktikan
                </label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Bawa laptop sendiri yang sudah terinstall software terkait"
                  value={practicumData.notes}
                  onChange={(e) => setPracticumData({ ...practicumData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-sans bg-canvas-subtle"
                />
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 flex justify-end space-x-2 border-t border-grid-border">
                <button
                  type="button"
                  onClick={() => setShowPracticumModal(false)}
                  className="px-4 py-2 bg-canvas-dark border border-grid-border font-mono font-bold"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={savingPracticum}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold tracking-wider shadow-brutal disabled:opacity-50"
                >
                  {savingPracticum ? 'MENYIMPAN...' : isEditingPracticum ? 'SIMPAN PERUBAHAN' : 'SIMPAN JADWAL PRAKTIKUM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reschedule Kuliah */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 relative shadow-xl animate-in">
            <CornerReticle />
            <div className="flex items-center justify-between border-b border-grid-border pb-3 mb-4">
              <h3 className="font-tech text-xl font-bold uppercase text-ink flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>+ CATAT RESCHEDULE KULIAH</span>
              </h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="font-mono text-xs font-bold px-2 py-1 bg-canvas-dark border border-grid-border hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReschedule} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Pilih Mata Kuliah
                </label>
                <select
                  required
                  value={rescheduleData.courseId}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
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
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Tanggal Baru (Kuliah Pengganti)
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Jam Mulai Baru
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.newStartTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, newStartTime: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Jam Selesai Baru
                  </label>
                  <input
                    type="time"
                    value={rescheduleData.newEndTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, newEndTime: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Ruangan Baru
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lab Komputer 03 / Gedung C R.201"
                  value={rescheduleData.newRoom}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newRoom: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Alasan Pemindahan Jadwal
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dosen berhalangan hadir pada hari biasa"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-sans bg-canvas-subtle"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-grid-border">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 bg-canvas-dark border border-grid-border font-mono font-bold"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={savingReschedule}
                  className="px-5 py-2 bg-[#1D63FF] hover:bg-[#1550D6] rounded-xl text-white font-mono font-bold tracking-wider shadow-brutal disabled:opacity-50"
                >
                  {savingReschedule ? 'MENYIMPAN...' : 'SIMPAN RESCHEDULE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Regular Schedule & Room */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-md p-6 relative shadow-xl animate-in">
            <CornerReticle />
            <div className="flex items-center justify-between border-b border-grid-border pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] text-brand-orange font-bold uppercase">
                  EDIT JADWAL REGULER
                </span>
                <h3 className="font-tech text-lg font-bold uppercase text-ink truncate">
                  {editCourseData.courseName}
                </h3>
              </div>
              <button
                onClick={() => setShowEditScheduleModal(false)}
                className="font-mono text-xs font-bold px-2 py-1 bg-canvas-dark border border-grid-border hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRegularSchedule} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Hari Perkuliahan Reguler
                </label>
                <select
                  value={editCourseData.scheduleDay}
                  onChange={(e) => setEditCourseData({ ...editCourseData, scheduleDay: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Jam Perkuliahan Reguler
                </label>
                <input
                  type="text"
                  required
                  placeholder="08:00 - 10:30 WIB"
                  value={editCourseData.scheduleTime}
                  onChange={(e) => setEditCourseData({ ...editCourseData, scheduleTime: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Ruangan Perkuliahan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gedung B Ruang 204"
                  value={editCourseData.room}
                  onChange={(e) => setEditCourseData({ ...editCourseData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-grid-border">
                <button
                  type="button"
                  onClick={() => setShowEditScheduleModal(false)}
                  className="px-4 py-2 bg-canvas-dark border border-grid-border font-mono font-bold"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 bg-[#1D63FF] hover:bg-[#1550D6] rounded-xl text-white font-mono font-bold tracking-wider shadow-brutal disabled:opacity-50"
                >
                  {savingSchedule ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Mata Kuliah (Ketua Kelas) */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 relative shadow-xl animate-in max-h-[90vh] overflow-y-auto">
            <CornerReticle />
            <div className="flex items-center justify-between border-b border-grid-border pb-3 mb-4">
              <h2 className="font-tech text-xl font-bold uppercase text-ink">
                + TAMBAH MATA KULIAH BARU
              </h2>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="font-mono text-xs font-bold px-2 py-1 bg-canvas-dark border border-grid-border hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Singkatan Matkul
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JARKOM / IF301"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Semester & SKS
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={newCourse.semester}
                      onChange={(e) => setNewCourse({ ...newCourse, semester: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                    />
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Nama Mata Kuliah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Web Lanjut"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-sans bg-canvas-subtle"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Nama Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Ir. Budi Santoso, M.Kom"
                    value={newCourse.lecturerName}
                    onChange={(e) => setNewCourse({ ...newCourse, lecturerName: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-sans bg-canvas-subtle"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Kontak Dosen (No WA/Email)
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newCourse.lecturerContact}
                    onChange={(e) => setNewCourse({ ...newCourse, lecturerContact: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
              </div>

              {/* FITUR PENGULANGAN JADWAL HARI MINGGUAN */}
              <div className="p-3 bg-canvas-subtle border border-grid-border space-y-2">
                <label className="font-mono text-[11px] font-bold uppercase text-ink flex items-center space-x-1.5">
                  <Repeat className="w-3.5 h-3.5 text-brand-orange" />
                  <span>PILIH HARI PENGULANGAN KULIAH (BERULANG SETIAP MINGGU)</span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => {
                    const isSelected = addSelectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleAddDay(day)}
                        className={`px-3 py-1 font-mono text-xs font-bold uppercase border transition-all ${
                          isSelected
                            ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                            : 'bg-white text-ink border-grid-border hover:border-ink'
                        }`}
                      >
                        {isSelected ? `✓ ${day}` : day}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] font-mono text-ink-muted">
                  *Matkul akan berulang otomatis di kalender setiap hari:{' '}
                  <strong className="text-brand-orange font-bold">
                    {addSelectedDays.join(', ')}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Jam Perkuliahan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08:00 - 10:30 WIB"
                    value={newCourse.scheduleTime}
                    onChange={(e) => setNewCourse({ ...newCourse, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Ruangan Kelas
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="R. 302 / Lab Komputer"
                    value={newCourse.room}
                    onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono bg-canvas-subtle"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-grid-border">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-canvas-dark border border-grid-border font-mono font-bold"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-5 py-2 bg-[#1D63FF] hover:bg-[#1550D6] rounded-xl text-white font-mono font-bold tracking-wider shadow-brutal disabled:opacity-50"
                >
                  {savingCourse ? 'MENYIMPAN...' : 'SIMPAN MATA KULIAH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Tambah / Edit Agenda Kegiatan Kelas */}
      {showAgendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 relative shadow-xl animate-in max-h-[90vh] overflow-y-auto">
            <CornerReticle />
            <div className="flex items-center justify-between border-b border-grid-border pb-3 mb-4">
              <h3 className="font-tech text-xl font-bold uppercase text-ink flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-purple-600" />
                <span>{isEditingAgenda ? 'EDIT AGENDA KEGIATAN' : '+ TAMBAH AGENDA KEGIATAN'}</span>
              </h3>
              <button
                onClick={() => setShowAgendaModal(false)}
                className="font-mono text-xs font-bold px-2 py-1 bg-canvas-dark border border-grid-border hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Judul Agenda Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Rapat Angkatan / Seminar AI / Bukber Kelas"
                  value={agendaData.title}
                  onChange={(e) => setAgendaData({ ...agendaData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono text-sm bg-canvas-subtle"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Kategori Agenda
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'RAPAT', label: 'Rapat Angkatan / Kelas' },
                    { id: 'SEMINAR', label: 'Seminar / Webinar' },
                    { id: 'KEGIATAN_KELAS', label: 'Kegiatan Kelas' },
                    { id: 'ACARA_KAMPUS', label: 'Acara Kampus' },
                    { id: 'LAINNYA', label: 'Lainnya / Umum' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setAgendaData({ ...agendaData, category: cat.id })}
                      className={`px-2.5 py-1.5 text-xs font-mono font-bold uppercase border text-center transition-all ${
                        agendaData.category === cat.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white text-ink border-grid-border hover:border-ink'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Tanggal Kegiatan *
                </label>
                <input
                  type="date"
                  required
                  value={agendaData.date}
                  onChange={(e) => setAgendaData({ ...agendaData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono text-sm bg-canvas-subtle"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={agendaData.startTime}
                    onChange={(e) => setAgendaData({ ...agendaData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono text-sm bg-canvas-subtle"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Jam Selesai (Opsional)
                  </label>
                  <input
                    type="time"
                    value={agendaData.endTime}
                    onChange={(e) => setAgendaData({ ...agendaData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-grid-border font-mono text-sm bg-canvas-subtle"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Lokasi / Ruangan / Link Meet
                </label>
                <input
                  type="text"
                  placeholder="Misal: Selasar Gedung B / Google Meet"
                  value={agendaData.location}
                  onChange={(e) => setAgendaData({ ...agendaData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-mono text-sm bg-canvas-subtle"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Keterangan / Pembahasan (Opsional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Deskripsi agenda pembahasan, pakaian yang dikenakan, link dokumen, dsb."
                  value={agendaData.description}
                  onChange={(e) => setAgendaData({ ...agendaData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-grid-border font-sans text-sm bg-canvas-subtle"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-grid-border">
                <button
                  type="button"
                  onClick={() => setShowAgendaModal(false)}
                  className="px-4 py-2 bg-canvas-dark border border-grid-border font-mono font-bold text-xs"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={savingAgenda}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs tracking-wider shadow-brutal disabled:opacity-50"
                >
                  {savingAgenda ? 'MENYIMPAN...' : isEditingAgenda ? 'SIMPAN PERUBAHAN' : 'TAMBAH AGENDA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        loading={confirmState.loading}
        confirmText={confirmState.confirmText}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}