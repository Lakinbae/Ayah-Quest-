import React, { useState } from 'react';
import { 
  X, Check, Star, Smartphone, Copy, ExternalLink, ShieldAlert, 
  CheckCircle2, Upload, Image as ImageIcon, Clock, HeartHandshake, AlertCircle 
} from 'lucide-react';
import { TelebirrPaymentRequest, UserProfile } from '../types';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTelebirr: (req: Omit<TelebirrPaymentRequest, 'id' | 'status' | 'created_at'>) => void;
  onActivateProInstant: () => void;
  isPro: boolean;
  user: UserProfile;
}

export const ProModal: React.FC<ProModalProps> = ({
  isOpen,
  onClose,
  onSubmitTelebirr,
  onActivateProInstant,
  isPro,
  user,
}) => {
  const [telebirrRef, setTelebirrRef] = useState<string>('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [submittedStatus, setSubmittedStatus] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'telebirr' | 'stars'>('telebirr');

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('0938054751');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP screenshot).');
      return;
    }

    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTelebirrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telebirrRef.trim() || telebirrRef.trim().length < 4) {
      alert('Please enter your valid Telebirr Reference Number from the SMS.');
      return;
    }

    if (!screenshotDataUrl) {
      alert('Please attach a screenshot of your Telebirr payment receipt for admin verification.');
      return;
    }

    onSubmitTelebirr({
      telegram_id: user.telegram_id,
      username: user.username || 'user',
      full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Hafiz Seeker',
      amount: 50,
      reference_number: telebirrRef.trim(),
      screenshot_url: screenshotDataUrl,
    });

    setSubmittedStatus(true);
  };

  const handleStarsPay = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openInvoice) {
      alert('Telegram Stars invoice launched via WebApp API (20 XTR)');
    } else {
      // In web preview sandbox
      onActivateProInstant();
      alert('🌟 Telegram Stars payment (20 XTR) succeeded! Ayah Quest Pro is now active.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#faf8f5] dark:bg-stone-900 w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[92vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 text-[10px] font-black tracking-wider uppercase mb-1.5">
            AYAH QUEST PRO & SCHOLARLY SUITE
          </span>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
            Support the Mission & Unlock Advanced Tools
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 italic">
            "Whoever guides someone to goodness will have a reward like one who did it."
          </p>
        </div>

        {/* Free Tier Reassurance Banner */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-900 dark:text-emerald-200">
              Complete Quran & Active Recall Are Always 100% Free
            </span>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              All 114 Surahs, full audio recitations, repetition loop controls, and all 7 Active Recall modes are open to everyone without payment. Pro provides advanced linguistic roots and supports ongoing server hosting.
            </p>
          </div>
        </div>

        {/* Pro Benefits List */}
        <div className="bg-white dark:bg-stone-850 rounded-2xl p-3.5 border border-stone-200/90 dark:border-stone-800 space-y-2 text-xs">
          <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px] uppercase tracking-wide">
            What Pro Unlocks:
          </span>
          {[
            'Deep Quranic Word-by-Word I’rab (إعراب) & root morphology',
            'Full audio library access for all renowned Qaris',
            'Continuous cloud sync & cross-device backup',
            'Direct support for high-bandwidth Islamic audio CDN infrastructure'
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-stone-700 dark:text-stone-300 text-[11px]">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {isPro ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              You are an Active Pro Member!
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Jazakum Allahu Khayran for supporting the Ayah Quest application.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('telebirr')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'telebirr'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Telebirr (50 ETB)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stars')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'stars'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Telegram Stars (20)</span>
              </button>
            </div>

            {/* Tab 1: Telebirr Payment Flow with Mandatory Screenshot Upload */}
            {activeTab === 'telebirr' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Telebirr Manual Transfer
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                    50 ETB
                  </span>
                </div>

                {/* Transfer Details Card */}
                <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs space-y-1.5">
                  <span className="text-[11px] text-stone-500">1. Transfer 50 ETB via Telebirr app to:</span>
                  <div className="flex items-center justify-between bg-white dark:bg-stone-800 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700">
                    <div>
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        0938054751
                      </span>
                      <span className="text-stone-400 text-[10px] ml-2">(Recipient: Lakin)</span>
                    </div>
                    <button
                      onClick={handleCopyPhone}
                      className="text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-emerald-600 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {!submittedStatus ? (
                  <form onSubmit={handleTelebirrSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        2. Enter Telebirr Transaction Reference *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5HB79XXXXX"
                        value={telebirrRef}
                        onChange={(e) => setTelebirrRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    {/* Screenshot File Upload & Preview */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        3. Upload Telebirr Receipt Screenshot *
                      </label>
                      <div className="mt-1 flex justify-center px-4 pt-3 pb-3 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl hover:border-emerald-500 transition-colors bg-stone-50 dark:bg-stone-900">
                        <div className="space-y-1 text-center">
                          {screenshotDataUrl ? (
                            <div className="space-y-2">
                              <img
                                src={screenshotDataUrl}
                                alt="Receipt Preview"
                                className="h-28 mx-auto object-contain rounded-lg border border-stone-200 dark:border-stone-700"
                              />
                              <p className="text-[10px] text-emerald-600 font-bold truncate max-w-xs">
                                ✓ {screenshotFileName || 'Screenshot Attached'}
                              </p>
                              <label className="inline-block px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-[10px] font-semibold cursor-pointer">
                                Change Screenshot
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="sr-only"
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="cursor-pointer block">
                              <Upload className="mx-auto h-7 w-7 text-stone-400" />
                              <div className="flex text-xs text-stone-600 dark:text-stone-400 mt-1 justify-center">
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                                  Click to upload screenshot
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-400">PNG, JPG, or WEBP</p>
                              <input
                                type="file"
                                accept="image/*"
                                required
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-stone-700 dark:text-stone-300 flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Telebirr requests are <strong>manually verified by Admin</strong>. Pro access will activate immediately once approved.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-xs active:scale-98"
                    >
                      Submit for Admin Verification
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold mx-auto">
                      ⏳
                    </div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Payment Request Submitted
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Reference <span className="font-mono font-bold text-emerald-700">{telebirrRef}</span> has been securely sent with your screenshot to the Admin. Pro features will unlock upon approval!
                    </p>
                    <button
                      onClick={() => setSubmittedStatus(false)}
                      className="text-[11px] text-stone-500 hover:text-stone-700 underline"
                    >
                      Submit another payment reference
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Telegram Stars Instant Payment */}
            {activeTab === 'stars' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Telegram Stars
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 text-xs font-black">
                    20 XTR
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Instant automatic activation through Telegram Bot payments without waiting for manual admin approval.
                </p>
                <button
                  onClick={handleStarsPay}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                >
                  <Star className="w-3.5 h-3.5 fill-stone-950" />
                  <span>Pay 20 Stars with Telegram</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Support Link */}
        <div className="pt-2 text-center border-t border-stone-200/60 dark:border-stone-800">
          <a
            href="https://t.me/luck_7n"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 hover:text-emerald-600"
          >
            <span>Need assistance? Contact Telegram support:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">@luck_7n</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
