import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutGrid,
  FileText,
  Clock,
  Settings,
  Info,
  LogOut,
  Search,
  Bell,
  CheckSquare,
  X,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Calendar,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isKetuaKelas } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showNotif, setShowNotif] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [notifications, setNotifications] = useState({ announcements: [], deadlines: [] });
  const notifRef = useRef(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const [annRes, assRes] = await Promise.all([
          api.get('/announcements'),
          api.get('/assignments'),
        ]);
        const upcoming = (assRes.data.assignments || []).filter(
          (a) => new Date(a.deadline) >= new Date()
        );
        setNotifications({
          announcements: (annRes.data.announcements || []).slice(0, 4),
          deadlines: upcoming.slice(0, 4),
        });
      } catch {
        // silent fail for header badge
      }
    };
    fetchNotifs();
  }, [user, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const cleanName = (name) => name?.replace(/\s*\([^)]*\)/g, '').trim() || 'Mahasiswa';

  const roleLabel = () => {
    switch (user.role) {
      case 'KETUA_KELAS':
        return 'Ketua Kelas';
      case 'PJ_MATKUL':
        return 'PJ Mata Kuliah';
      default:
        return `Mahasiswa • ${user.nim}`;
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (location.pathname === '/') {
      const nextParams = new URLSearchParams(searchParams);
      if (val) {
        nextParams.set('tab', 'courses');
        nextParams.set('q', val);
      } else {
        nextParams.delete('q');
      }
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(
      searchQuery.trim()
        ? `/?tab=courses&q=${encodeURIComponent(searchQuery.trim())}`
        : '/?tab=courses'
    );
  };

  const currentTab = searchParams.get('tab');
  const isDashboardActive = location.pathname === '/' && currentTab !== 'courses';
  const isCoursesActive =
    (location.pathname === '/' && currentTab === 'courses') ||
    location.pathname.startsWith('/course/');
  const isScheduleActive = location.pathname === '/schedule';
  const isDeadlinesActive = location.pathname === '/deadlines';
  const isSettingsActive = location.pathname === '/manage-coordinators';

  const totalNotifCount =
    notifications.announcements.length + notifications.deadlines.length;

  return (
    <>
      {/* ================================================================= */}
      {/* LEFT SIDEBAR (Desktop Fixed 230px)                                */}
      {/* ================================================================= */}
      <aside className="hidden md:flex flex-col w-[230px] shrink-0 bg-white border-r border-[#E2E8F0] px-4 py-6 select-none z-30">
        {/* 1. Brand Header */}
        <Link to="/" className="flex items-center gap-3 px-2 group">
          <div className="w-8 h-8 rounded-[8px] bg-[#1D63FF] flex items-center justify-center relative shadow-sm group-hover:bg-[#1550D6] transition-colors">
            {/* White top bookmark/ribbon accent matching AnyLearn icon */}
            <div className="w-4 h-1.5 bg-white rounded-sm -mt-2" />
          </div>
          <span className="text-[20px] font-bold tracking-tight text-[#1E293B]">
            Vizo
          </span>
        </Link>

        {/* 2. Navigation List */}
        <nav className="mt-10 flex flex-col gap-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] transition-all ${
              isDashboardActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <LayoutGrid
              className={`w-[18px] h-[18px] ${
                isDashboardActive ? 'text-[#1D63FF]' : 'text-[#64748B]'
              }`}
            />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/?tab=courses"
            className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] transition-all ${
              isCoursesActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <FileText
              className={`w-[18px] h-[18px] ${
                isCoursesActive ? 'text-[#1D63FF]' : 'text-[#64748B]'
              }`}
            />
            <span>Materi Kuliah</span>
          </Link>

          <Link
            to="/schedule"
            className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] transition-all ${
              isScheduleActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <Clock
              className={`w-[18px] h-[18px] ${
                isScheduleActive ? 'text-[#1D63FF]' : 'text-[#64748B]'
              }`}
            />
            <span>Jadwal Kuliah</span>
          </Link>

          <Link
            to="/deadlines"
            className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] transition-all ${
              isDeadlinesActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <CheckSquare
              className={`w-[18px] h-[18px] ${
                isDeadlinesActive ? 'text-[#1D63FF]' : 'text-[#64748B]'
              }`}
            />
            <span>Tenggat Tugas</span>
          </Link>

          {isKetuaKelas && (
            <Link
              to="/manage-coordinators"
              className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] transition-all ${
                isSettingsActive
                  ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                  : 'text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#1E293B]'
              }`}
            >
              <Settings
                className={`w-[18px] h-[18px] ${
                  isSettingsActive ? 'text-[#1D63FF]' : 'text-[#64748B]'
                }`}
              />
              <span>Kelola PJ</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-all text-left"
          >
            <Info className="w-[18px] h-[18px] text-[#64748B]" />
            <span>Panduan</span>
          </button>
        </nav>

        {/* 3. Bottom Action (Logout) */}
        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] font-medium text-[#64748B] hover:bg-[#FFF1F2] hover:text-[#E11D48] transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                                      */}
      {/* ================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-1.5">
        <div className={`grid ${isKetuaKelas ? 'grid-cols-5' : 'grid-cols-4'} gap-1`}>
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              isDashboardActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Dashboard</span>
          </Link>

          <Link
            to="/?tab=courses"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              isCoursesActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Materi</span>
          </Link>

          <Link
            to="/schedule"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              isScheduleActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Jadwal</span>
          </Link>

          <Link
            to="/deadlines"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              isDeadlinesActive
                ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Tugas</span>
          </Link>

          {isKetuaKelas && (
            <Link
              to="/manage-coordinators"
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                isSettingsActive
                  ? 'bg-[#EBF2FF] text-[#1D63FF] font-semibold'
                  : 'text-[#64748B]'
              }`}
            >
              <Settings className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">Kelola PJ</span>
            </Link>
          )}
        </div>
      </nav>

      {/* ================================================================= */}
      {/* HELP / PANDUAN MODAL                                              */}
      {/* ================================================================= */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelpModal(false);
          }}
        >
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#EAF2FF] text-[#1D63FF] flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1E293B]">
                    Panduan & Bantuan Vizo
                  </h3>
                  <p className="text-[12px] text-[#64748B]">
                    Portal Akademik, Materi & Bank Soal Kolaboratif
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-[13px] text-[#64748B]">
              <div className="p-3.5 rounded-xl bg-[#EAF2FF]/60 border border-[#CFE2FF] flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#1D63FF] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Arsip Materi 16 Pertemuan</div>
                  <p className="text-[12px] mt-0.5 leading-relaxed">
                    Pilih mata kuliah di Dashboard untuk mengunduh atau melihat pratinjau slide PDF, link Drive, dan rekaman per pertemuan.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#ECFDF3] border border-[#D1FADF] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Bank Soal Kolaboratif & AI Pembahasan</div>
                  <p className="text-[12px] mt-0.5 leading-relaxed">
                    Seluruh mahasiswa dapat berkontribusi membuat soal dari slide dosen (manual atau import Excel) dan meminta pembahasan mendalam berbasis AI.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FEF0C7] flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#1E293B]">Jadwal Kuliah, Lab & Tenggat Tugas</div>
                  <p className="text-[12px] mt-0.5 leading-relaxed">
                    Pantau jadwal kuliah reguler, praktikum, kelas pengganti (reschedule), dan tandai tugas yang sudah kamu selesaikan.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Top Header Component (72px height, Search on Left, Notification & User Profile on Right)
 */
export function TopHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState({ announcements: [], deadlines: [] });
  const notifRef = useRef(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const [annRes, assRes] = await Promise.all([
          api.get('/announcements'),
          api.get('/assignments'),
        ]);
        const upcoming = (assRes.data.assignments || []).filter(
          (a) => new Date(a.deadline) >= new Date()
        );
        setNotifications({
          announcements: (annRes.data.announcements || []).slice(0, 4),
          deadlines: upcoming.slice(0, 4),
        });
      } catch {
        // ignore
      }
    };
    fetchNotifs();
  }, [user, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const cleanName = (name) => name?.replace(/\s*\([^)]*\)/g, '').trim() || 'Mahasiswa';

  const roleSubtitle = () => {
    switch (user.role) {
      case 'KETUA_KELAS':
        return 'Ketua Kelas';
      case 'PJ_MATKUL':
        return 'PJ Mata Kuliah';
      default:
        return 'Mahasiswa';
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (location.pathname === '/') {
      const nextParams = new URLSearchParams(searchParams);
      if (val) {
        nextParams.set('tab', 'courses');
        nextParams.set('q', val);
      } else {
        nextParams.delete('q');
      }
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(
      searchQuery.trim()
        ? `/?tab=courses&q=${encodeURIComponent(searchQuery.trim())}`
        : '/?tab=courses'
    );
  };

  const totalNotifCount =
    notifications.announcements.length + notifications.deadlines.length;

  return (
    <header className="sticky top-0 z-20 h-[72px] bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between shrink-0">
      {/* Left: Mobile Logo + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Link to="/" className="md:hidden flex items-center gap-2 shrink-0 mr-1">
          <div className="w-7 h-7 rounded-[7px] bg-[#1D63FF] flex items-center justify-center">
            <div className="w-3.5 h-1 bg-white rounded-sm -mt-1.5" />
          </div>
        </Link>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full max-w-[320px]">
          <Search className="w-[18px] h-[18px] text-[#64748B] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari mata kuliah, kode, atau dosen..."
            className="w-full bg-transparent border-none text-[13.5px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (location.pathname === '/') {
                  const next = new URLSearchParams(searchParams);
                  next.delete('q');
                  setSearchParams(next, { replace: true });
                }
              }}
              className="text-[#94A3B8] hover:text-[#64748B]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Right: Notification Bell & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-6 shrink-0">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotif((prev) => !prev)}
            className="relative p-2 rounded-full hover:bg-[#F8FAFC] text-[#1E293B] transition-colors"
            title="Notifikasi & Pengumuman"
          >
            <Bell className="w-[20px] h-[20px] stroke-[1.75]" />
            {totalNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full bg-[#FF6B6B] ring-2 ring-white" />
            )}
          </button>

          {showNotif && (
            <div className="fixed inset-x-4 top-[76px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg p-4 z-50 animate-in">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E2E8F0]">
                <span className="text-[13px] font-semibold text-[#1E293B]">
                  Notifikasi Kelas
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EAF2FF] text-[#1D63FF]">
                  {totalNotifCount} Aktif
                </span>
              </div>

              {totalNotifCount === 0 ? (
                <p className="py-6 text-center text-[12px] text-[#94A3B8]">
                  Tidak ada pengumuman atau tenggat tugas dekat.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.announcements.map((a) => (
                    <div
                      key={`ann-${a.id}`}
                      className="p-2.5 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[12px]"
                    >
                      <div className="font-semibold text-[#E11D48] flex items-center justify-between">
                        <span>{a.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-[#E11D48]">
                          Info
                        </span>
                      </div>
                      <p className="text-[#64748B] text-[11px] mt-0.5 line-clamp-2">
                        {a.content}
                      </p>
                    </div>
                  ))}

                  {notifications.deadlines.map((d) => (
                    <Link
                      key={`dl-${d.id}`}
                      to="/deadlines"
                      onClick={() => setShowNotif(false)}
                      className="block p-2.5 rounded-xl bg-[#EAF2FF]/60 hover:bg-[#EAF2FF] border border-[#CFE2FF] text-[12px] transition-colors"
                    >
                      <div className="font-semibold text-[#1E293B] truncate">
                        {d.title}
                      </div>
                      <div className="text-[11px] text-[#1D63FF] font-medium mt-0.5">
                        {d.course?.code} • Tenggat:{' '}
                        {new Date(d.deadline).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[13.5px] font-semibold text-[#1E293B] leading-tight">
              {cleanName(user.name)}
            </div>
            <div className="text-[11.5px] font-medium text-[#94A3B8] leading-tight mt-0.5">
              {roleSubtitle()}
            </div>
          </div>

          {/* Circular Avatar (40x40px) with Pastel Green background */}
          <div
            className="w-10 h-10 rounded-full bg-[#BCEAD5] border border-[#A7F3D0] flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
            title={`${cleanName(user.name)} (${user.nim})`}
          >
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <circle cx="20" cy="20" r="20" fill="#BCEAD5" />
              {/* Shoulders / Shirt */}
              <path d="M8 40 C8 31 32 31 32 40 Z" fill="#1E293B" />
              <path d="M15 32 L20 38 L25 32 Z" fill="#FF6B6B" />
              {/* Neck & Head */}
              <rect x="17.5" y="24" width="5" height="6" rx="2" fill="#FDBA94" />
              <circle cx="20" cy="18" r="7.5" fill="#FDBA94" />
              {/* Hair */}
              <path
                d="M12.5 17 C12.5 11 16 9 20.5 9 C25 9 27.5 11.5 27.5 16.5 C26 14 23 13 19 13.5 C15 14 13.5 15.5 12.5 17 Z"
                fill="#7C2D12"
              />
              {/* Eyes & Smile */}
              <circle cx="17.5" cy="18" r="0.9" fill="#1E293B" />
              <circle cx="22.5" cy="18" r="0.9" fill="#1E293B" />
              <path
                d="M18 21 Q20 22.5 22 21"
                stroke="#1E293B"
                strokeWidth="1.1"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Mobile Logout Button */}
          <button
            type="button"
            onClick={logout}
            title="Keluar"
            className="md:hidden p-2 rounded-lg text-[#64748B] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
