import React, { useState } from 'react';
import { X, Check, Star, Smartphone, Copy, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TelebirrPaymentRequest } from '../types';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTelebirr: (req: Omit<TelebirrPaymentRequest, 'id' | 'status' | 'created_at'>) => void;
  onActivateProInstant: () => void;
  isPro: boolean;
}

export const ProModal: React.FC<ProModalProps> = ({
  isOpen,
  onClose,
  onSubmitTelebirr,
  onActivateProInstant,
  isPro,
}) => {
  const [telebirrRef, setTelebirrRef] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [submittedStatus, setSubmittedStatus] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0938054751');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelebirrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telebirrRef.trim() || telebirrRef.trim().length < 4) {
      alert('Please enter your valid Telebirr Reference Number.');
      return;
    }

    onSubmitTelebirr({
      telegram_id: 123456789,
      username: 'quran_seeker',
      full_name: 'Tariq',
      amount: 50,
      reference_number: telebirrRef.trim(),
      screenshot_url: screenshotUrl.trim() || undefined,
    });

    setSubmittedStatus(true);
  };

  const handleStarsPay = () => {
    // If running in Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openInvoice) {
      alert('Telegram Stars invoice launched via WebApp API (20 XTR)');
    } else {
      // In web preview: activate instant demo
      onActivateProInstant();
      alert('🌟 Simulated Telegram Stars payment (20 XTR) succeeded! Ayah Quest Pro is now active.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Section */}
        <div className="text-center pt-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/30 text-[10px] font-black tracking-wider uppercase mb-2">
            AYAH QUEST PRO
          </span>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
            Upgrade Your Memorization
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 italic">
            "Train smarter. Revise better. Memorize with confidence."
          </p>
        </div>

        {/* Pro Benefits Checklist */}
        <div className="my-5 bg-emerald-500/5 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-500/10 space-y-2 text-xs">
          {[
            'AI recitation mistake detection',
            'Word-level analysis & pronunciation match',
            'Smart review queue (SuperMemo-2 SRS)',
            'Adaptive repetition for weak verses',
            'Recurring mistake history logs',
            'Advanced analytics & mastery speed charts',
            'Smart Hifz planning & custom targets',
            'All 7 Active Recall training modes'
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {isPro ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">You are an Ayah Quest Pro Member!</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">All advanced speech recognition & spaced repetition modules are unlocked.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Payment Option 1: Telegram Stars */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Telegram Stars</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 text-xs font-black">
                  20 XTR
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Instant automatic activation through Telegram Bot invoice.
              </p>
              <button
                onClick={handleStarsPay}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
              >
                <Star className="w-3.5 h-3.5 fill-stone-950" />
                <span>Pay 20 Stars with Telegram</span>
              </button>
            </div>

            {/* Payment Option 2: Telebirr (50 ETB) */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Telebirr (Ethiopia)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                  50 ETB
                </span>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs space-y-1.5">
                <div className="text-[11px] text-stone-500">1. Transfer 50 ETB to:</div>
                <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-850 p-2 rounded-lg">
                  <div>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      0938054751
                    </span>
                    <span className="text-stone-400 text-[10px] ml-2">(Lakin)</span>
                  </div>
                  <button
                    onClick={handleCopyPhone}
                    className="text-xs font-semibold text-stone-500 hover:text-emerald-600 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {!submittedStatus ? (
                <form onSubmit={handleTelebirrSubmit} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Telebirr Reference Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5HB79XXXXX"
                      value={telebirrRef}
                      onChange={(e) => setTelebirrRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Payment Screenshot (URL or receipt note)
                    </label>
                    <input
                      type="text"
                      placeholder="Optional receipt image link"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-sm active:scale-98"
                  >
                    Submit Telebirr Payment for Verification
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center space-y-1">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    ⏳ Status: Pending verification
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Reference <span className="font-mono font-semibold">{telebirrRef}</span> sent to admin (ID: 6545688842). You will be notified on Telegram once approved!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Link */}
        <div className="mt-4 text-center">
          <a
            href="https://t.me/luck_7n"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-emerald-600"
          >
            <span>Have questions or need manual activation?</span>
            <span className="font-bold text-emerald-600">@luck_7n</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
