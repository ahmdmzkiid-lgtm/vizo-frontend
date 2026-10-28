import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ShieldCheck, Search, Check, X } from 'lucide-react';

export default function ManageCoordinators() {
  const { isKetuaKelas } = useAuth();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, usersRes] = await Promise.all([
        api.get('/courses'),
        api.get('/auth/users'),
      ]);
      setCourses(coursesRes.data.courses || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Error fetching coordinator data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssign = (course) => {
    setSelectedCourse(course);
    setSelectedUserIds(
      course.coordinators ? course.coordinators.map((c) => c.user.id) : []
    );
  };

  const toggleUserSelection = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSaveCoordinators = async () => {
    setSaving(true);
    try {
      await api.post(`/courses/${selectedCourse.id}/coordinators`, {
        userIds: selectedUserIds,
      });
      toast.success('Koordinator / PJ Matkul berhasil diperbarui!');
      setSelectedCourse(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan koordinator.');
    } finally {
      setSaving(false);
    }
  };

  if (!isKetuaKelas) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-[13px] text-[#E11D48]">
        Akses Ditolak: Hanya Ketua Kelas yang dapat mengelola penugasan PJ Matkul.
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.nim.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-[#F4F7FE] border border-[#E2E8F0] rounded-2xl p-6 sm:p-7">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] border border-[#CFE2FF] text-[#1D63FF] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#1D63FF] bg-[#CFE2FF] px-2.5 py-0.5 rounded-md uppercase">
              Panel Ketua Kelas
            </span>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#1E293B] mt-1.5">
              Penetapan PJ Mata Kuliah
            </h1>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Tunjuk mahasiswa yang bertanggung jawab menghubungi dosen dan mengunggah materi di tiap matkul.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Table (Desktop) & Card List (Mobile) */}
      {loading ? (
        <div className="py-20 text-center text-[13px] text-[#64748B]">
          Memuat data kelas...
        </div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="md:hidden space-y-3">
            {courses.map((course) => (
              <div
                key={`mob-${course.id}`}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-block text-[10.5px] font-bold bg-[#EAF2FF] text-[#1D63FF] px-2.5 py-0.5 rounded-md">
                      {course.code}
                    </span>
                    <h3 className="text-[14px] font-bold text-[#1E293B] mt-1.5 leading-snug">
                      {course.name}
                    </h3>
                    <p className="text-[12px] text-[#64748B] mt-0.5">
                      {course.lecturerName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAssign(course)}
                    className="py-1.5 px-3 rounded-lg bg-[#CFE2FF] hover:bg-[#1D63FF] text-[#1D63FF] hover:text-white text-[11px] font-bold uppercase transition-colors shrink-0"
                  >
                    Tetapkan PJ
                  </button>
                </div>

                <div className="pt-2.5 border-t border-[#F1F5F9] flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#64748B] mr-1">
                    PJ Saat Ini:
                  </span>
                  {course.coordinators && course.coordinators.length > 0 ? (
                    course.coordinators.map((c) => (
                      <span
                        key={c.user.id}
                        className="text-[11px] bg-[#ECFDF3] border border-[#D1FADF] text-[#059669] px-2 py-0.5 rounded-md font-semibold"
                      >
                        {c.user.name} ({c.user.nim})
                      </span>
                    ))
                  ) : (
                    <span className="text-[11.5px] text-[#94A3B8] italic">
                      Belum ada PJ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11.5px] font-semibold text-[#64748B] uppercase">
                  <tr>
                    <th className="py-3.5 px-5">Kode</th>
                    <th className="py-3.5 px-5">Nama Mata Kuliah</th>
                    <th className="py-3.5 px-5">Dosen Pengampu</th>
                    <th className="py-3.5 px-5">PJ Matkul Saat Ini</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-[#F8FAFC]/80 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <span className="text-[11px] font-bold bg-[#EAF2FF] text-[#1D63FF] px-2.5 py-1 rounded-md">
                          {course.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#1E293B]">
                        {course.name}
                      </td>
                      <td className="py-3.5 px-5 text-[#64748B]">
                        {course.lecturerName}
                      </td>
                      <td className="py-3.5 px-5">
                        {course.coordinators && course.coordinators.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {course.coordinators.map((c) => (
                              <span
                                key={c.user.id}
                                className="text-[11px] bg-[#ECFDF3] border border-[#D1FADF] text-[#059669] px-2.5 py-0.5 rounded-md font-semibold"
                              >
                                {c.user.name} ({c.user.nim})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#94A3B8] italic">
                            Belum ada PJ
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleOpenAssign(course)}
                          className="py-1.5 px-3.5 rounded-lg bg-[#CFE2FF] hover:bg-[#1D63FF] text-[#1D63FF] hover:text-white text-[11px] font-bold uppercase transition-colors"
                        >
                          Tetapkan PJ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Assign Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[85vh] flex flex-col animate-in">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
              <div>
                <span className="text-[11px] text-[#1D63FF] font-semibold uppercase">
                  Pilih Mahasiswa Sebagai PJ
                </span>
                <h3 className="text-[16px] font-bold text-[#1E293B]">
                  [{selectedCourse.code}] {selectedCourse.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF1F2] text-[#64748B] hover:text-[#E11D48] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search user */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau NIM mahasiswa..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:border-[#1D63FF] focus:outline-none"
              />
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 border border-[#E2E8F0] rounded-xl p-2.5 bg-[#F8FAFC]">
              {filteredUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleUserSelection(u.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#EAF2FF] border-[#1D63FF] text-[#1D63FF]'
                        : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div>
                      <div className="text-[13px] font-semibold">{u.name}</div>
                      <div className="text-[11px] text-[#64748B]">
                        NIM: {u.nim} • {u.email}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1D63FF]" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 mt-3 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveCoordinators}
                className="px-5 py-2 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12px] font-semibold disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Penetapan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
