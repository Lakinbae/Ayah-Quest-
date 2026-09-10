import React from 'react';
import { X, Check, ShieldCheck, XCircle, Clock, Smartphone, User } from 'lucide-react';
import { TelebirrPaymentRequest } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: TelebirrPaymentRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  requests,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Admin Telebirr Moderation
          </h2>
        </div>
        <p className="text-xs text-stone-400 mb-4">
          Admin Telegram ID: <span className="font-mono text-emerald-600 font-bold">6545688842</span>
        </p>

        {requests.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-400 text-xs">
            No pending Telebirr submissions right now.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>{req.full_name} (@{req.username})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                    {req.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div>
                    <span className="text-[10px] text-stone-400">Amount:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{req.amount} ETB</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">Reference:</span>
                    <p className="font-mono font-bold text-emerald-600">{req.reference_number}</p>
                  </div>
                </div>

                {req.screenshot_url && (
                  <div className="text-[11px] text-stone-500 truncate">
                    Receipt: <span className="font-mono">{req.screenshot_url}</span>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onApprove(req.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Pro</span>
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
