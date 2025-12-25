
import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  theme?: 'blue' | 'amber';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md', theme = 'blue' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Content */}
      <div className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full ${maxWidth} animate-in fade-in zoom-in duration-200`}>
        <div className={`px-6 py-4 flex items-center justify-between border-b border-slate-100 ${theme === 'amber' ? 'bg-amber-50' : 'bg-slate-50/50'}`}>
          <h3 className={`font-bold text-lg ${theme === 'amber' ? 'text-amber-800' : 'text-slate-800'}`}>{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
