import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-end transition-opacity duration-300 ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};