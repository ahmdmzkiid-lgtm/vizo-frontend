import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const STYLES = {
  success: 'border-[#D1FADF] bg-white text-[#1E293B]',
  error: 'border-[#FFE4E6] bg-white text-[#1E293B]',
  warning: 'border-[#FEF0C7] bg-white text-[#1E293B]',
  info: 'border-[#CFE2FF] bg-white text-[#1E293B]',
};

const ICON_STYLES = {
  success: 'bg-[#ECFDF3] text-[#059669]',
  error: 'bg-[#FFF1F2] text-[#E11D48]',
  warning: 'bg-[#FFFBEB] text-[#D97706]',
  info: 'bg-[#EAF2FF] text-[#1D63FF]',
};

const BAR_STYLES = {
  success: 'bg-[#22C55E]',
  error: 'bg-[#FF6B6B]',
  warning: 'bg-[#D97706]',
  info: 'bg-[#1D63FF]',
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const addToast = useCallback(
    (type, message, duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
      timers.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const api = {
    success: (msg, dur) => addToast('success', msg, dur),
    error: (msg, dur) => addToast('error', msg, dur ?? 6000),
    warning: (msg, dur) => addToast('warning', msg, dur),
    info: (msg, dur) => addToast('info', msg, dur),
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <X className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="fixed top-4 right-4 z-[200] flex flex-col items-end space-y-2.5 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full border rounded-xl shadow-lg relative overflow-hidden animate-slide-in ${STYLES[t.type]}`}
          >
            <div className="flex items-start p-3.5 gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${ICON_STYLES[t.type]}`}
              >
                {renderIcon(t.type)}
              </div>
              <p className="text-[12.5px] font-medium text-[#1E293B] leading-relaxed flex-1 pt-0.5">
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[#94A3B8] hover:text-[#1E293B] p-0.5 shrink-0 mt-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className={`h-0.5 ${BAR_STYLES[t.type]} animate-shrink`} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
