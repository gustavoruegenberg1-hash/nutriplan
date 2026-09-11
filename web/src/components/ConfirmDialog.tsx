import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          iconBg: 'bg-rose-500/20',
          btnBg: 'bg-rose-600 hover:bg-rose-500 text-white',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          iconBg: 'bg-amber-500/20',
          btnBg: 'bg-amber-600 hover:bg-amber-500 text-white',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-teal-400" />,
          iconBg: 'bg-teal-500/20',
          btnBg: 'bg-teal-600 hover:bg-teal-500 text-white',
        };
    }
  };

  const { icon, iconBg, btnBg } = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#151D28] border border-[#243044] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-up">
        <button
          onClick={onCancel}
          data-close-modal
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A2332] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">{title}</h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#243044]">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#1A2332] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all ${btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
