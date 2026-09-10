import React, { useState } from 'react';
import { 
  X, Check, ShieldCheck, XCircle, Clock, Smartphone, 
  User, Image as ImageIcon, ZoomIn, CheckCircle2 
} from 'lucide-react';
import { TelebirrPaymentRequest } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: TelebirrPaymentRequest[];
  onApprove: (id: string, telegramId: number) => void;
  onReject: (id: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  requests,
  onApprove,
  onReject,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#faf8f5] dark:bg-stone-900 w-full max-w-xl rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[92vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Admin Telebirr Verification Desk
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Authorized Admin Telegram ID: <span className="font-mono text-emerald-600 font-bold">6545688842</span>
        </p>

        {requests.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-400 text-xs">
            No Telebirr submissions in the moderation queue right now.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/90 dark:border-stone-800 space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>{req.full_name} (@{req.username})</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      req.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                        : req.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-700 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-stone-50 dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div>
                    <span className="text-[10px] text-stone-500">Amount:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{req.amount} ETB</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500">Telebirr Ref #:</span>
                    <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 select-all">
                      {req.reference_number}
                    </p>
                  </div>
                </div>

                {/* Screenshot view */}
                {req.screenshot_url && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Uploaded Payment Receipt:
                    </span>
                    <div 
                      onClick={() => setSelectedImage(req.screenshot_url || null)}
                      className="cursor-pointer group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-40 bg-stone-100 dark:bg-stone-900 flex items-center justify-center"
                    >
                      <img
                        src={req.screenshot_url}
                        alt="Receipt"
                        className="max-h-40 w-auto object-contain transition-transform group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1 transition-opacity">
                        <ZoomIn className="w-4 h-4" />
                        <span>Tap to enlarge</span>
                      </div>
                    </div>
                  </div>
                )}

                {req.status === 'pending' ? (
                  <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => onApprove(req.id, req.telegram_id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Unlock Pro Access</span>
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-400 italic">
                    Decision recorded.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal lightbox for full-resolution screenshot */}
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-2xl max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Enlarged Receipt"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              <p className="text-center text-white text-xs mt-2">Tap anywhere to close</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
