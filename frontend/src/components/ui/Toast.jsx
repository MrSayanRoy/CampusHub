import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-[#DC2626] shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0" />,
    info: <Info className="h-5 w-5 text-[#DC2626] shrink-0" />,
  };

  const borders = {
    success: 'border-l-4 border-l-[#16A34A]',
    error: 'border-l-4 border-l-[#DC2626]',
    warning: 'border-l-4 border-l-[#D97706]',
    info: 'border-l-4 border-l-[#DC2626]',
  };

  return (
    <div
      className={`
        pointer-events-auto bg-white rounded-lg border border-[#E5E5E5] shadow-md p-3.5
        flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in
        ${borders[toast.type] || borders.info}
      `}
      role="alert"
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-semibold text-[#171717] leading-snug">
            {toast.title}
          </h4>
        )}
        {toast.message && (
          <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[#A3A3A3] hover:text-[#DC2626] p-0.5 rounded-md transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
