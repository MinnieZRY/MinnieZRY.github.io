import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const styles = {
    success: 'bg-white border-l-4 border-emerald-500 text-slate-800',
    error: 'bg-white border-l-4 border-red-500 text-slate-800',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
  };

  return (
    <div className={`pointer-events-auto flex w-80 items-start gap-3 rounded-md border border-slate-200 p-4 shadow-lg transition-all animate-in slide-in-from-right-full ${styles[toast.type]}`}>
      <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};