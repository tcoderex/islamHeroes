'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, ShieldAlert, X, Check, Mail, UserCheck, Sparkles } from 'lucide-react';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  signedInAt: number;
}

interface GoogleAuthButtonProps {
  onUserChange?: (user: GoogleUserProfile | null) => void;
  isAr: boolean;
  theme?: string;
  size?: 'sm' | 'md' | 'lg';
  compactHeader?: boolean;
}

export default function GoogleAuthButton({
  onUserChange,
  isAr,
  theme = 'tgis',
  size = 'md',
  compactHeader = false,
}: GoogleAuthButtonProps) {
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states inside modal
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Stable callback ref to decouple parent callback re-renders from state loops
  const onUserChangeRef = useRef(onUserChange);
  useEffect(() => {
    onUserChangeRef.current = onUserChange;
  }, [onUserChange]);

  const checkBanStatus = useCallback(async (email: string, googleId?: string) => {
    try {
      const query = email
        ? `email=${encodeURIComponent(email)}`
        : `googleId=${encodeURIComponent(googleId || '')}`;
      const res = await fetch(`/api/banned-users?${query}`);
      const data = await res.json();
      if (data.success && data.isBanned) {
        setIsBanned((prev) => (prev === true ? prev : true));
      } else {
        setIsBanned((prev) => (prev === false ? prev : false));
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync session state safely from LocalStorage with strict object equality checks
  const syncSession = useCallback(() => {
    try {
      const stored = localStorage.getItem('heroes_google_user');
      if (stored) {
        const parsed = JSON.parse(stored) as GoogleUserProfile;
        if (parsed && parsed.email) {
          setUser((prev) => {
            if (
              prev &&
              prev.email === parsed.email &&
              prev.googleId === parsed.googleId &&
              prev.name === parsed.name &&
              prev.picture === parsed.picture
            ) {
              return prev;
            }
            return parsed;
          });
          checkBanStatus(parsed.email, parsed.googleId);
          return;
        }
      }
    } catch {
      // ignore
    }
    setUser(null);
    setIsBanned(false);
  }, [checkBanStatus]);

  // Notify parent component safely after render whenever user state updates
  useEffect(() => {
    onUserChangeRef.current?.(user);
  }, [user]);

  // Listen to cross-component auth events and localStorage changes safely
  useEffect(() => {
    syncSession();

    const handleAuthChange = () => {
      syncSession();
    };

    window.addEventListener('heroes_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('heroes_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [syncSession]);

  const openSignInModal = () => {
    setInputEmail('tcoderex@gmail.com');
    setInputName('Tcoder');
    setAvatarError(false);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) return;

    setIsSubmitting(true);
    const cleanEmail = inputEmail.trim().toLowerCase();
    const defaultName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName =
      defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    const finalName = inputName.trim() || formattedName || 'Google User';

    // Single deterministic unique ID per email address (No multiple user creation!)
    const deterministicGoogleId = `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    // Auto-detect Gmail profile picture using Unavatar with DiceBear fallback
    const detectedPicture = `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

    const googleUser: GoogleUserProfile = {
      googleId: deterministicGoogleId,
      email: cleanEmail,
      name: finalName,
      picture: detectedPicture,
      signedInAt: Date.now(),
    };

    // Register user to central database so admin can manage/ban them
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });
    } catch {
      // ignore
    }

    setUser(googleUser);
    localStorage.setItem('heroes_google_user', JSON.stringify(googleUser));

    // Dispatch global event for instant 0ms sync across all components
    window.dispatchEvent(new Event('heroes_auth_change'));

    await checkBanStatus(googleUser.email, googleUser.googleId);

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsBanned(false);
    try {
      localStorage.removeItem('heroes_google_user');
    } catch {
      // ignore
    }
    // Instant event dispatch to log out across all components
    window.dispatchEvent(new Event('heroes_auth_change'));
  };

  return (
    <>
      {user ? (
        <div
          className={`flex items-center gap-2 p-1.5 px-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-[#0c1825] shadow-2xs font-sans transition-all ${
            compactHeader ? 'max-w-[180px] sm:max-w-none' : ''
          }`}
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                avatarError
                  ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`
                  : user.picture
              }
              alt={user.name}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0 pr-0.5">
            <span className="font-bold text-xs truncate text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <span className="truncate">{user.name}</span>
              {isBanned && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white flex items-center gap-0.5 shrink-0">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span>{isAr ? 'محظور' : 'Banned'}</span>
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden sm:block font-mono">
              {user.email}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
            title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openSignInModal}
          className={`font-sans inline-flex items-center justify-center gap-2 font-bold rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
            size === 'sm'
              ? 'px-2.5 py-1.5 text-xs'
              : size === 'lg'
                ? 'px-5 py-3 text-sm'
                : 'px-3.5 py-2 text-xs sm:text-sm'
          } bg-white dark:bg-[#0c1825] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80`}
        >
          {/* Official Google G Logo SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="whitespace-nowrap">
            {compactHeader
              ? isAr
                ? 'دخول'
                : 'Sign In'
              : isAr
                ? 'تسجيل الدخول بـ Google'
                : 'Sign in with Google'}
          </span>
        </button>
      )}

      {/* Google Sign In Modal Dialog */}
      {isModalOpen && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1520] text-slate-900 dark:text-slate-100 shadow-2xl p-5 sm:p-6 space-y-4 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#0067c0] dark:text-sky-400 shadow-2xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {isAr ? 'تسجيل الدخول بـ Google' : 'Sign in with Google'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'إنشاء حساب موحد وتحديد الصورة شخصية' : 'Single account & automatic picture detection'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                {isAr ? 'اختر حساب موثق أو أدخل بريدك:' : 'Select account or enter email:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setInputEmail('tcoderex@gmail.com');
                  setInputName('Tcoder');
                }}
                className="w-full p-2.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-300 dark:border-blue-700 bg-slate-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://unavatar.io/tcoderex@gmail.com?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=tcoderex%40gmail.com"
                      alt="Tcoder"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Tcoder (Admin / Owner)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      tcoderex@gmail.com
                    </span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-[#0067c0]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'البريد الإلكتروني (Google Email):' : 'Google Email Address:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#060e18] text-slate-900 dark:text-white outline-none focus:border-[#0067c0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الاسم الظاهر في التعليقات:' : 'Display Name:'}
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder={isAr ? 'مثال: أحمد علي' : 'e.g. Ahmed'}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#060e18] text-slate-900 dark:text-white outline-none focus:border-[#0067c0]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !inputEmail.trim()}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0067c0] hover:bg-[#005fb8] text-white transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isAr ? 'تأكيد ودخول موحد' : 'Confirm & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
