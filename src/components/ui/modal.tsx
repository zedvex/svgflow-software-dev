import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden p-4">
      <div className="w-[800px] max-h-[calc(100vh-2rem)] flex flex-col rounded-lg bg-slate-800 shadow-xl">
        <div className="flex-none flex items-center justify-between border-b border-slate-600 p-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-700"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
} 