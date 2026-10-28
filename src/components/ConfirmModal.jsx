import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

export default function ConfirmModal({
  open,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, loading, onCancel]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      accent: 'bg-[#E11D48] hover:bg-rose-700',
      icon: Trash2,
      iconBg: 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]',
    },
    warning: {
      accent: 'bg-[#D97706] hover:bg-amber-700',
      icon: AlertTriangle,
      iconBg: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF0C7]',
    },
    info: {
      accent: 'bg-[#1D63FF] hover:bg-[#1550D6]',
      icon: Info,
      iconBg: 'bg-[#EAF2FF] text-[#1D63FF] border-[#CFE2FF]',
    },
  };

  const v = variantStyles[variant] || variantStyles.danger;
  const IconComp = v.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
    >
      <div
        className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-sm p-5 shadow-xl animate-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="flex items-start gap-3.5 mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${v.iconBg}`}
          >
            <IconComp className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="confirm-title"
              className="text-[15px] font-semibold text-[#1E293B] leading-snug"
            >
              {title}
            </h3>
            <div className="text-[12.5px] text-[#64748B] mt-1 leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3.5 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[12px] font-semibold text-[#64748B] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-white text-[12px] font-semibold transition-all disabled:opacity-50 ${v.accent}`}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
