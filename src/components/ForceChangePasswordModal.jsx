import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, Check, LogOut, Eye, EyeOff } from 'lucide-react';

export default function ForceChangePasswordModal() {
  const { user, changePassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user || !user.isDefaultPassword) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword === 'password123') {
      setError('Kata sandi baru tidak boleh sama dengan password default (password123).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Gagal memperbarui kata sandi. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-xl animate-in">
        {/* Header Alert */}
        <div className="flex items-start gap-3.5 border-b border-[#E2E8F0] pb-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#EAF2FF] text-[#1D63FF] border border-[#CFE2FF] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FEF0C7] px-2 py-0.5 rounded-md uppercase tracking-wider">
              Keamanan Akun Wajib
            </span>
            <h2 className="text-[17px] font-bold text-[#1E293B] mt-1">
              Ganti Kata Sandi
            </h2>
          </div>
        </div>

        <p className="text-[13px] text-[#64748B] leading-relaxed mb-4">
          Halo, <strong className="text-[#1E293B] font-semibold">{user.name}</strong>! Anda masih menggunakan kata sandi bawaan. Demi keamanan akun Anda, silakan buat kata sandi baru sebelum menggunakan portal.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#E11D48] text-[12px] font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-5 rounded-xl bg-[#ECFDF3] border border-[#D1FADF] text-[#059669] text-center space-y-2">
            <div className="w-9 h-9 mx-auto bg-[#22C55E] text-white rounded-full flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-[15px] font-bold text-[#1E293B]">
              Kata Sandi Berhasil Diganti!
            </p>
            <p className="text-[12px] text-[#059669]">
              Membuka portal kelas untuk Anda...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                Kata Sandi Baru *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1D63FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                Konfirmasi Kata Sandi Baru *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1D63FF]"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-[12.5px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="py-2.5 px-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#FFF1F2] hover:text-[#E11D48] text-[#64748B] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Keluar dari sesi"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
