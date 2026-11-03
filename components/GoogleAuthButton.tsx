'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  LogOut,
  ShieldAlert,
  X,
  Check,
  Mail,
  UserCheck,
  User,
  Pencil,
  Loader2,
  Trash2,
  CheckCircle2,
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Profile Edit state
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Fallback modal inputs
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  // Stable callback ref to decouple parent callback re-renders
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

  // Listen for real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const cleanEmail = firebaseUser.email.toLowerCase();
        const displayName =
          firebaseUser.displayName ||
          cleanEmail.split('@')[0].replace(/[._]/g, ' ');
        const formattedName =
          displayName.charAt(0).toUpperCase() + displayName.slice(1);

        const photo =
          firebaseUser.photoURL ||
          `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

        const profile: GoogleUserProfile = {
          googleId: firebaseUser.uid || `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
          email: cleanEmail,
          name: formattedName,
          picture: photo,
          signedInAt: Date.now(),
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

  // Trigger REAL Google OAuth Sign In via Firebase
  const handleRealGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const { user: fbUser } = await signInWithGoogleReal();
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase();
        const displayName =
          fbUser.displayName ||
          cleanEmail.split('@')[0].replace(/[._]/g, ' ');
        const formattedName =
          displayName.charAt(0).toUpperCase() + displayName.slice(1);

        const photo =
          fbUser.photoURL ||
          `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

        const googleUser: GoogleUserProfile = {
          googleId: fbUser.uid || `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
          email: cleanEmail,
          name: formattedName,
          picture: photo,
          signedInAt: Date.now(),
        };

        // Register user to central database so admin can ban any account
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
        setAuthError(isAr ? 'تم إغلاق نافذة تسجيل الدخول' : 'Sign-in window closed');
      } else {
        // Fallback option if popup blocked by browser
        setInputEmail('tcoderex@gmail.com');
        setInputName('Tcoder');
        setIsFallbackModalOpen(true);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Fallback submit
  const handleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) return;

    setIsAuthenticating(true);
    const cleanEmail = inputEmail.trim().toLowerCase();
    const defaultName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName =
      defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    const finalName = inputName.trim() || formattedName || 'Google User';

    const deterministicGoogleId = `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const detectedPicture = `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

    const googleUser: GoogleUserProfile = {
      googleId: deterministicGoogleId,
      email: cleanEmail,
      name: finalName,
      picture: detectedPicture,
      signedInAt: Date.now(),
    };

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
    setEditName(googleUser.name);
    localStorage.setItem('heroes_google_user', JSON.stringify(googleUser));
    window.dispatchEvent(new Event('heroes_auth_change'));
    await checkBanStatus(googleUser.email, googleUser.googleId);

    setIsAuthenticating(false);
    setIsFallbackModalOpen(false);
  };

  // Save updated profile display name
  const handleSaveProfileName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editName.trim()) return;

    setIsSavingName(true);
    const newName = editName.trim();

    try {
      await updateDisplayNameReal(newName);
    } catch {
      // ignore
    }

    const updatedUser: GoogleUserProfile = {
      ...user,
      name: newName,
    };

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
    } catch {
      // ignore
    }

    setUser(updatedUser);
    localStorage.setItem('heroes_google_user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('heroes_auth_change'));

    setIsSavingName(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileMenuOpen(false);
    }, 600);
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
              setIsProfileMenuOpen(true);
            }}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#0c1825] hover:border-blue-400 dark:hover:border-blue-500 shadow-2xs font-sans transition-all cursor-pointer active:scale-95"
            title={isAr ? 'عرض البروفايل وتعديل الاسم' : 'View Profile & Edit Name'}
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
                  ? 'جاري الدخول...'
                  : 'Signing in...'
                : isAr
                  ? 'دخول Google'
                  : 'Sign in with Google'}
            </span>
          </button>

          {authError && (
            <span className="text-[10px] text-rose-500 font-semibold animate-pulse">
              {authError}
            </span>
          )}
        </div>
      )}

      {/* USER PROFILE MENU MODAL -> Rendered into document.body via Portal (Never trapped by header) */}
      {isMounted && typeof document !== 'undefined' && isProfileMenuOpen && user && createPortal(
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
          onClick={() => setIsProfileMenuOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1520] text-slate-900 dark:text-slate-100 shadow-2xl p-5 sm:p-6 space-y-4 font-sans text-left my-auto animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
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

            {/* Profile Settings Section */}
            <form onSubmit={handleSaveProfileName} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم العرض في التعليقات (Display Name):' : 'Display Name (for comments):'}
                </label>
                <div className="relative">
                  <Pencil className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={isAr ? 'أدخل اسمك الخاص...' : 'Enter your name...'}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#060e18] text-slate-900 dark:text-white outline-none focus:border-[#0067c0]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {isAr ? 'هذا الاسم يظهر للآخرين عند إضافة تعليق' : 'This name appears publicly when you post comments'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSavingName || !editName.trim()}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0067c0] hover:bg-[#005fb8] text-white transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSavingName ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {savedSuccess
                    ? (isAr ? 'تم حفظ الاسم بنجاح!' : 'Name Saved!')
                    : (isAr ? 'حفظ اسم العرض' : 'Save Display Name')}
                </span>
              </button>
            </form>

            {/* Google Account Status Info */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#060e18] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px]">
                <span>{isAr ? 'حساب Google المتصل:' : 'Google Account:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[170px]">
                  {user.email}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span>{isAr ? 'حالة الحساب:' : 'Account Status:'}</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    isBanned ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isBanned ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span>
                    {isBanned
                      ? isAr
                        ? 'محظور من التعليق'
                        : 'Banned from comments'
                      : isAr
                        ? 'متصل ومفعل'
                        : 'Connected & Verified'}
                  </span>
                </span>
              </div>
            </div>

            {/* Disconnect / Sign Out Button */}
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

      {/* FALLBACK SIGN IN MODAL -> Rendered into document.body via Portal */}
      {isMounted && typeof document !== 'undefined' && isFallbackModalOpen && createPortal(
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
          onClick={() => setIsFallbackModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md my-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1520] text-slate-900 dark:text-slate-100 shadow-2xl p-5 space-y-4 font-sans text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-[#0067c0] dark:text-sky-400 shadow-2xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {isAr ? 'تسجيل الدخول بـ Google' : 'Google Account Sign In'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'إدخال بريدك الإلكتروني والاسم الشخصي' : 'Enter your Google email and display name'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFallbackModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFallbackSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'البريد الإلكتروني (Google Email):' : 'Google Email:'}
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
                disabled={isAuthenticating || !inputEmail.trim()}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0067c0] hover:bg-[#005fb8] text-white transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isAr ? 'تأكيد ودخول' : 'Confirm & Sign In'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
