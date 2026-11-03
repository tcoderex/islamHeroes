'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  LogOut,
  X,
  Check,
  Mail,
  Pencil,
  Loader2,
  CheckCircle2,
  Lock,
  Clock,
  Crown,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  signInWithGoogleReal,
  signOutReal,
  updateDisplayNameReal,
  auth,
} from '@/lib/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  signedInAt: number;
  lastDisplayNameChangeAt?: number;
}

interface GoogleAuthButtonProps {
  onUserChange?: (user: GoogleUserProfile | null) => void;
  isAr: boolean;
  theme?: string;
  size?: 'sm' | 'md' | 'lg';
  compactHeader?: boolean;
  isAdmin?: boolean;
}

const TWENTY_ONE_DAYS_MS = 21 * 24 * 60 * 60 * 1000; // 21 days in ms

export default function GoogleAuthButton({
  onUserChange,
  isAr,
  theme = 'tgis',
  size = 'md',
  compactHeader = false,
  isAdmin = false,
}: GoogleAuthButtonProps) {
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Profile Edit state
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Stable callback ref to decouple parent callback re-renders
  const onUserChangeRef = useRef(onUserChange);
  useEffect(() => {
    onUserChangeRef.current = onUserChange;
  }, [onUserChange]);

  // Determine if current user has admin status (prop or admin email)
  const isUserAdmin = useMemo(() => {
    if (isAdmin) return true;
    if (user?.email && user.email.toLowerCase() === 'tcoderex@gmail.com') return true;
    return false;
  }, [isAdmin, user]);

  // Calculate 21-day cooldown parameters
  const { isOnCooldown, remainingDays, remainingHours, nextChangeDate } = useMemo(() => {
    if (isUserAdmin || !user?.lastDisplayNameChangeAt) {
      return { isOnCooldown: false, remainingDays: 0, remainingHours: 0, nextChangeDate: null };
    }

    const lastChanged = user.lastDisplayNameChangeAt;
    const nextAllowed = lastChanged + TWENTY_ONE_DAYS_MS;
    const now = Date.now();

    if (now < nextAllowed) {
      const remainingMs = nextAllowed - now;
      const days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      const hours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return {
        isOnCooldown: true,
        remainingDays: days,
        remainingHours: hours,
        nextChangeDate: new Date(nextAllowed),
      };
    }

    return { isOnCooldown: false, remainingDays: 0, remainingHours: 0, nextChangeDate: null };
  }, [isUserAdmin, user]);

  const checkBanStatus = useCallback(async (email: string, googleId?: string) => {
    try {
      const query = email
        ? `email=${encodeURIComponent(email)}`
        : `googleId=${encodeURIComponent(googleId || '')}`;
      const res = await fetch(`/api/banned-users?${query}`);
      const data = await res.json();
      if (data.success && data.isBanned) {
        setIsBanned(true);
      } else {
        setIsBanned(false);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync session state safely from LocalStorage
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
              prev.picture === parsed.picture &&
              prev.lastDisplayNameChangeAt === parsed.lastDisplayNameChangeAt
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

  // Listen for real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const cleanEmail = firebaseUser.email.toLowerCase();

        // Check if there is an already stored custom name and lastDisplayNameChangeAt in server DB
        let existingName = firebaseUser.displayName || '';
        let lastDisplayNameChangeAt: number | undefined;

        try {
          const userRes = await fetch(`/api/users?email=${encodeURIComponent(cleanEmail)}`);
          const userData = await userRes.json();
          if (userData.success && userData.user) {
            if (userData.user.name) existingName = userData.user.name;
            if (userData.user.lastDisplayNameChangeAt) {
              lastDisplayNameChangeAt = userData.user.lastDisplayNameChangeAt;
            }
          }
        } catch {
          // ignore
        }

        const fallbackName =
          cleanEmail.split('@')[0].replace(/[._]/g, ' ');
        const formattedName =
          existingName ||
          fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

        const photo =
          firebaseUser.photoURL ||
          `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

        const profile: GoogleUserProfile = {
          googleId: firebaseUser.uid || `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
          email: cleanEmail,
          name: formattedName,
          picture: photo,
          signedInAt: Date.now(),
          lastDisplayNameChangeAt,
        };

        setUser(profile);
        setEditName(profile.name);
        try {
          localStorage.setItem('heroes_google_user', JSON.stringify(profile));
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
          });
        } catch {
          // ignore
        }
        checkBanStatus(profile.email, profile.googleId);
      }
    });

    return () => unsubscribe();
  }, [checkBanStatus]);

  // Notify parent component safely after render whenever user state updates
  useEffect(() => {
    onUserChangeRef.current?.(user);
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  // Listen to cross-component auth events and localStorage changes
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

  // Trigger REAL Google OAuth Sign In via Firebase Popup
  const handleRealGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const { user: fbUser } = await signInWithGoogleReal();
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase();

        // Check if there is already an existing saved display name and cooldown timestamp
        let existingName = fbUser.displayName || '';
        let lastDisplayNameChangeAt: number | undefined;

        try {
          const userRes = await fetch(`/api/users?email=${encodeURIComponent(cleanEmail)}`);
          const userData = await userRes.json();
          if (userData.success && userData.user) {
            if (userData.user.name) existingName = userData.user.name;
            if (userData.user.lastDisplayNameChangeAt) {
              lastDisplayNameChangeAt = userData.user.lastDisplayNameChangeAt;
            }
          }
        } catch {
          // ignore
        }

        const fallbackName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
        const formattedName =
          existingName || fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

        const photo =
          fbUser.photoURL ||
          `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

        const googleUser: GoogleUserProfile = {
          googleId: fbUser.uid || `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
          email: cleanEmail,
          name: formattedName,
          picture: photo,
          signedInAt: Date.now(),
          lastDisplayNameChangeAt,
        };

        // Register user to central database
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleUser),
        });

        setUser(googleUser);
        setEditName(googleUser.name);
        localStorage.setItem('heroes_google_user', JSON.stringify(googleUser));
        window.dispatchEvent(new Event('heroes_auth_change'));
        await checkBanStatus(googleUser.email, googleUser.googleId);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError(isAr ? 'تم إغلاق نافذة تسجيل الدخول' : 'Sign-in popup was closed');
      } else if (err?.code === 'auth/popup-blocked') {
        setAuthError(
          isAr
            ? 'تم حظر النافذة المنبثقة بواسطة المتصفح. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة.'
            : 'Popup blocked by browser. Please allow popups and try again.'
        );
      } else if (err?.code === 'auth/cancelled-popup-request') {
        // Ignored duplicate popup click
      } else {
        setAuthError(
          isAr
            ? 'تعذر إتمام الدخول بـ Google. يرجى المحاولة مرة أخرى.'
            : 'Failed to connect Google account. Please try again.'
        );
      }

      // Auto-clear error after 6 seconds
      setTimeout(() => {
        setAuthError(null);
      }, 6000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Save updated profile display name with 21-day check
  const handleSaveProfileName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editName.trim()) return;

    setNameError(null);
    const newName = editName.trim();

    // 1. If non-admin and currently on cooldown, reject immediately
    if (!isUserAdmin && isOnCooldown) {
      setNameError(
        isAr
          ? `لا يمكن تغيير اسم العرض إلا مرة واحدة كل 21 يوماً. يمكنك تغييره بعد ${remainingDays} يوم.`
          : `Display name can only be changed once every 21 days. Next change allowed in ${remainingDays} days.`
      );
      return;
    }

    setIsSavingName(true);

    try {
      // Call backend API with updateDisplayName flag
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: newName,
          updateDisplayName: true,
          isAdmin: isUserAdmin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setNameError(
          data.error ||
            (isAr
              ? 'فشل تحديث اسم العرض بسبب فترة الانتظار (21 يوماً).'
              : 'Failed to update name due to 21-day cooldown.')
        );
        setIsSavingName(false);
        return;
      }

      // Also update Firebase profile if possible
      try {
        await updateDisplayNameReal(newName);
      } catch {
        // ignore
      }

      const updatedUser: GoogleUserProfile = {
        ...user,
        name: newName,
        lastDisplayNameChangeAt: data.user?.lastDisplayNameChangeAt || Date.now(),
      };

      setUser(updatedUser);
      localStorage.setItem('heroes_google_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('heroes_auth_change'));

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsProfileMenuOpen(false);
      }, 900);
    } catch {
      setNameError(
        isAr ? 'حدث خطأ أثناء حفظ الاسم. حاول ثانية' : 'Error saving display name. Please try again'
      );
    } finally {
      setIsSavingName(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOutReal();
    } catch {
      // ignore
    }
    setUser(null);
    setIsBanned(false);
    setIsProfileMenuOpen(false);
    try {
      localStorage.removeItem('heroes_google_user');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('heroes_auth_change'));
  };

  return (
    <>
      {user ? (
        <div className="relative inline-block">
          {/* Authenticated User Profile Button -> Compact Single-Row Pill */}
          <button
            type="button"
            onClick={() => {
              setSavedSuccess(false);
              setNameError(null);
              setEditName(user.name);
              setIsProfileMenuOpen(true);
            }}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#0c1825] hover:border-blue-400 dark:hover:border-blue-500 shadow-2xs font-sans transition-all cursor-pointer active:scale-95"
            title={isAr ? 'عرض البروفايل وتعديل الاسم' : 'View Profile & Settings'}
          >
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 shrink-0">
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

            <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-slate-100 truncate max-w-[80px] xs:max-w-[110px] sm:max-w-[140px]">
              {user.name.split(' ')[0] || user.name}
            </span>

            {isUserAdmin && (
              <Crown className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
            )}

            {isBanned && (
              <span className="px-1 py-0.2 rounded-full text-[8px] font-bold bg-rose-500 text-white shrink-0">
                !
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleRealGoogleSignIn}
            className={`font-sans inline-flex items-center justify-center gap-1.5 font-bold rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-60 ${
              size === 'sm' || compactHeader
                ? 'px-2.5 py-1 text-[11px] sm:text-xs'
                : 'px-3.5 py-1.5 text-xs sm:text-sm'
            } bg-white dark:bg-[#0c1825] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80`}
          >
            {isAuthenticating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0067c0]" />
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span className="whitespace-nowrap">
              {isAuthenticating
                ? isAr
                  ? 'جاري الربط مع Google...'
                  : 'Connecting Google...'
                : isAr
                  ? 'دخول بحساب Google'
                  : 'Sign in with Google'}
            </span>
          </button>

          {authError && (
            <span className="text-[10px] text-rose-500 font-semibold animate-pulse max-w-[200px] text-right">
              {authError}
            </span>
          )}
        </div>
      )}

      {/* USER PROFILE MODAL -> Portal to document.body, perfectly centered and responsive */}
      {isMounted && typeof document !== 'undefined' && isProfileMenuOpen && user && createPortal(
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
          onClick={() => setIsProfileMenuOpen(false)}
        >
          <div
            className="relative w-full max-w-md my-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1520] text-slate-900 dark:text-slate-100 shadow-2xl p-5 sm:p-6 space-y-4 font-sans text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3 overflow-hidden pr-1">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 dark:border-blue-400 bg-slate-100 shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.picture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                    <span className="truncate">{user.name}</span>
                    {isUserAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
                        <Crown className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{isAr ? 'مشرف' : 'Admin'}</span>
                      </span>
                    )}
                    {isBanned && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white shrink-0">
                        {isAr ? 'محظور' : 'Banned'}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display Name Edit Form with 21-Day Cooldown Policy */}
            <form onSubmit={handleSaveProfileName} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'اسم العرض في التعليقات:' : 'Display Name in Comments:'}
                  </label>
                  {isUserAdmin ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-amber-400" />
                      {isAr ? 'تغيير غير محدود (مشرف)' : 'Unlimited (Admin)'}
                    </span>
                  ) : isOnCooldown ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isAr ? `متبقي ${remainingDays} يوم` : `${remainingDays}d left`}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {isAr ? 'متاح للتغيير الآن' : 'Available now'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  {isOnCooldown ? (
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                  ) : (
                    <Pencil className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  )}
                  <input
                    type="text"
                    required
                    disabled={isOnCooldown || isSavingName}
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setNameError(null);
                    }}
                    placeholder={isAr ? 'أدخل اسمك الخاص...' : 'Enter display name...'}
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border outline-none transition-all ${
                      isOnCooldown
                        ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/60 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#060e18] text-slate-900 dark:text-white focus:border-[#0067c0]'
                    }`}
                  />
                </div>

                {/* 21-Day Cooldown Guidance Banner */}
                {isOnCooldown ? (
                  <div className="mt-2.5 p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        {isAr
                          ? 'قاعدة الـ 21 يوماً: تم قفل اسم العرض'
                          : '21-Day Rule: Display name is locked'}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                      {isAr
                        ? `يمكن تغيير اسم العرض مرة واحدة فقط كل 21 يوماً لحماية هويات المستخدمين. يمكنك تغيير اسمك مجدداً بعد ${remainingDays} يوم (${nextChangeDate ? nextChangeDate.toLocaleDateString() : ''}). المشرف فقط يمكنه التغيير في أي وقت.`
                        : `Display name can only be changed once every 21 days to safeguard identities. You can change it again in ${remainingDays} days (${nextChangeDate ? nextChangeDate.toLocaleDateString() : ''}). Only administrators can change it anytime.`}
                    </p>
                  </div>
                ) : isUserAdmin ? (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1 font-medium">
                    <Crown className="w-3 h-3 fill-amber-400 shrink-0" />
                    <span>
                      {isAr
                        ? 'بصفتك مشرفاً، يمكنك تغيير اسم العرض الخاص بك وحفظه متى شئت بلا قيد الـ 21 يوماً.'
                        : 'As an administrator, you can change and update your display name anytime without the 21-day limit.'}
                    </span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      {isAr
                        ? 'ملاحظة: عند حفظ الاسم الجديد، لن تتمكن من تغييره مجدداً إلا بعد 21 يوماً.'
                        : 'Note: Once updated, you will not be able to change your name again for 21 days.'}
                    </span>
                  </p>
                )}

                {nameError && (
                  <div className="mt-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={isOnCooldown || isSavingName || !editName.trim()}
                className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                  isOnCooldown
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0067c0] hover:bg-[#005fb8] text-white cursor-pointer active:scale-95 disabled:opacity-50'
                }`}
              >
                {isSavingName ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : isOnCooldown ? (
                  <Lock className="w-4 h-4 text-slate-400" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {savedSuccess
                    ? isAr
                      ? 'تم حفظ الاسم بنجاح!'
                      : 'Display Name Saved!'
                    : isOnCooldown
                      ? isAr
                        ? `تغيير الاسم متاح بعد ${remainingDays} يوم`
                        : `Available in ${remainingDays} days`
                      : isAr
                        ? 'حفظ اسم العرض'
                        : 'Save Display Name'}
                </span>
              </button>
            </form>

            {/* Google Account Information Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060e18] border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{isAr ? 'حساب Google المتصل:' : 'Connected Google:'}</span>
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[170px]">
                  {user.email}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{isAr ? 'آخر تعديل للاسم:' : 'Last Name Change:'}</span>
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {user.lastDisplayNameChangeAt
                    ? new Date(user.lastDisplayNameChangeAt).toLocaleDateString()
                    : isAr
                      ? 'لم يتم تغييره مسبقاً'
                      : 'Never changed'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px] pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                <span>{isAr ? 'حالة الحساب:' : 'Account Status:'}</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    isBanned ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isBanned ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  />
                  <span>
                    {isBanned
                      ? isAr
                        ? 'محظور من التعليق'
                        : 'Banned from comments'
                      : isAr
                        ? 'متصل ومفعل بـ Google'
                        : 'Connected via Google'}
                  </span>
                </span>
              </div>
            </div>

            {/* Disconnect & Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{isAr ? 'قطع الاتصال وتسجيل الخروج' : 'Disconnect & Sign Out'}</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
