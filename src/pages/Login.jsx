import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration fields
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ nim, name, email, password });
      } else {
        await login(identifier, password);
      }
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Terjadi kesalahan saat masuk ke sistem.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#1D63FF] flex items-center justify-center mb-3 shadow-sm">
              <div className="w-5 h-2 bg-white rounded-sm -mt-2.5" />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#1E293B]">
              Vizo
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1">
              Portal akademik, jadwal kuliah & materi Kelas 1IA03
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-1.5 mb-6 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[12px]">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              className={`py-2 rounded-lg text-center font-semibold transition-all ${
                !isRegister
                  ? 'bg-[#EBF2FF] text-[#1D63FF]'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              className={`py-2 rounded-lg text-center font-semibold transition-all ${
                isRegister
                  ? 'bg-[#EBF2FF] text-[#1D63FF]'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#E11D48] text-[12px] font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister ? (
              <>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    NPM (Nomor Pokok Mahasiswa)
                  </label>
                  <input
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 50426980"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1D63FF]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ahmad Muzaki"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1D63FF]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                    Alamat Email Kampus
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="50426980@student.gunadarma.ac.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1D63FF]"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                  NPM atau Alamat Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan NPM atau Email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1D63FF]"
                />
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-[#1E293B] mb-1.5">
                Kata Sandi (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1D63FF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white font-semibold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Memproses...'
                  : isRegister
                  ? 'Buat Akun Mahasiswa'
                  : 'Masuk ke Portal'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center">
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              {!isRegister ? (
                <>
                  Mengalami kendala saat masuk? Silakan hubungi{' '}
                  <strong className="text-[#1E293B] font-semibold">Ketua Kelas</strong> atau{' '}
                  <strong className="text-[#1E293B] font-semibold">PJ Matkul</strong>.
                </>
              ) : (
                <>
                  Pendaftaran akun khusus mahasiswa aktif. Pastikan{' '}
                  <strong className="text-[#1E293B] font-semibold">NPM</strong> dan{' '}
                  <strong className="text-[#1E293B] font-semibold">Nama</strong> sesuai data resmi.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
