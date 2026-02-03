import React, { useEffect } from 'react';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'info';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger'
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 md:inset-0">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
           <h3 className="text-lg font-semibold text-slate-900 flex items-center">
             {type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />}
             {title}
           </h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 rounded-b-lg border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant={type === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
            确认
          </Button>
        </div>
      </div>
    </div>
  );
};