import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmer',
  isDangerous = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isDangerous ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">{message}</p>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                isDangerous ? 'bg-red-700 hover:bg-red-800' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
