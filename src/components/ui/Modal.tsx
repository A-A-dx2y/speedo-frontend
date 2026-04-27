import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10 shadow-2xl shadow-blue-500/5 overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-black/90 dark:text-white/90">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
