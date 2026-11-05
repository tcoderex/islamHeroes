'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Trash2,
  Clock,
  Loader2,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AppTheme } from '@/lib/theme';
import { CustomCharacter } from '@/components/CharactersView';
import { parseImagePosition } from '@/lib/imagePosition';
import { getLocalizedCharacterName } from '@/lib/arabicTransliteration';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';
import GoogleAuthButton, { GoogleUserProfile } from '@/components/GoogleAuthButton';
import { generateDiverseCommentsForCharacter } from '@/lib/characterCommentsSeed';

export interface CharacterComment {
  id: string;
  characterId: string;
  userName: string;
  userEmail?: string;
  text: string;
  guestId?: string;
  suggestedRating?: number;
  createdAt: number;
}

interface CommentsModalProps {
  character: CustomCharacter | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  isAr: boolean;
  theme?: AppTheme;
  currentUser?: GoogleUserProfile | null;
  onUserChange?: (user: GoogleUserProfile | null) => void;
  onCommentsUpdated?: (characterId: string, newCount: number) => void;
  onShowToast?: (msg: string) => void;
}

export default function CommentsModal({
  character,
  isOpen,
  onClose,
  isAdmin = false,
  isAr,
  theme = 'tgis',
  currentUser = null,
  onUserChange,
  onCommentsUpdated,
  onShowToast,
}: CommentsModalProps) {
  const [comments, setComments] = useState<CharacterComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Google User Authentication State
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(currentUser);
  const [isBanned, setIsBanned] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isRamadan = theme === 'ramadan';

  // Store onCommentsUpdated in a ref to avoid re-render loops
  const onCommentsUpdatedRef = useRef(onCommentsUpdated);
  useEffect(() => {
    onCommentsUpdatedRef.current = onCommentsUpdated;
  }, [onCommentsUpdated]);

  // Check ban status when Google user logs in
  const checkBanStatus = useCallback(async (email?: string, googleId?: string) => {
    if (!email && !googleId) {
      setIsBanned(false);
      return;
    }
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
      setIsBanned(false);
    }
  }, []);

  // Sync with currentUser prop whenever it updates in parent
  useEffect(() => {
    if (currentUser !== undefined) {
      setGoogleUser(currentUser);
      if (currentUser) {
        checkBanStatus(currentUser.email, currentUser.googleId);
      } else {
        setIsBanned(false);
      }
    }
  }, [currentUser, checkBanStatus]);

  const handleUserChange = useCallback((user: GoogleUserProfile | null) => {
    setGoogleUser((prev) => {
      if (
        prev &&
        user &&
        prev.email === user.email &&
        prev.googleId === user.googleId &&
        prev.name === user.name
      ) {
        return prev;
      }
      return user;
    });

    onUserChange?.(user);

    if (user) {
      checkBanStatus(user.email, user.googleId);
    } else {
      setIsBanned(false);
    }
  }, [checkBanStatus, onUserChange]);

  const charId = character?.id;

  // Fetch comments only when modal opens
  useEffect(() => {
    if (!isOpen || !charId) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/comments?characterId=${encodeURIComponent(charId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
          onCommentsUpdatedRef.current?.(charId, data.comments.length);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, charId]);

  if (!isOpen || !character) return null;

  const charDisplayName = getLocalizedCharacterName(character.name, isAr);
  const currentCharTier = getRatingTier(character.rating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) {
      onShowToast?.(isAr ? 'يرجى تسجيل الدخول بـ Google أولاً للتعليق' : 'Please sign in with Google to post comments');
      return;
    }

    if (isBanned) {
      onShowToast?.(isAr ? 'تم حظر حسابك من إضافة التعليقات' : 'Your account is banned from posting comments');
      return;
    }

    const trimmedText = commentText.trim();
    if (!trimmedText) return;

    setIsSubmitting(true);

    const optimisticComment: CharacterComment = {
      id: `temp-${Date.now()}`,
      characterId: character.id,
      userName: googleUser.name,
      userEmail: googleUser.email,
      text: trimmedText,
      guestId: googleUser.googleId,
      createdAt: Date.now(),
    };

    setComments((prev) => [optimisticComment, ...prev]);
    setCommentText('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          userName: googleUser.name,
          userEmail: googleUser.email,
          text: trimmedText,
          guestId: googleUser.googleId,
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? data.comment : c))
        );
        onCommentsUpdatedRef.current?.(character.id, comments.length + 1);
        onShowToast?.(isAr ? 'تم نشر تعليقك بنجاح' : 'Comment posted successfully');
      } else if (res.status === 403 || data.error?.includes('محظور')) {
        setIsBanned(true);
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
        onShowToast?.(isAr ? 'حسابك محظور من إضافة التعليقات' : 'Your account has been banned');
      } else {
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
        onShowToast?.(isAr ? 'تعذر نشر التعليق' : 'Failed to post comment');
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      onShowToast?.(isAr ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete single comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(isAr ? 'حذف هذا التعليق كمسؤول؟' : 'Delete this comment as admin?')) return;

    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => {
          const updated = prev.filter((c) => c.id !== commentId);
          onCommentsUpdatedRef.current?.(character.id, updated.length);
          return updated;
        });
        onShowToast?.(isAr ? 'تم حذف التعليق بنجاح' : 'Comment deleted');
      }
    } catch {
      onShowToast?.(isAr ? 'فشل حذف التعليق' : 'Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  // Ban User & Delete ALL their comments
  const handleBanUserAndPurge = async (userEmail: string, userName: string, googleId?: string) => {
    if (
      !confirm(
        isAr
          ? `حظر المستخدم "${userName}" (${userEmail}) وتطهير كافة تعليقاته من التطبيق؟`
          : `Ban user "${userName}" (${userEmail}) and delete ALL their comments?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/banned-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          googleId: googleId,
          userName: userName,
          reason: 'Banned by Admin from Comments Panel',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setComments((prev) => {
          const updated = prev.filter(
            (c) =>
              c.userEmail?.toLowerCase() !== userEmail.toLowerCase() &&
              c.userName !== userName &&
              c.guestId !== googleId
          );
          onCommentsUpdatedRef.current?.(character.id, updated.length);
          return updated;
        });

        if (googleUser && googleUser.email.toLowerCase() === userEmail.toLowerCase()) {
          setIsBanned(true);
        }

        onShowToast?.(
          isAr
            ? `تم حظر المستخدم "${userName}" وتطهير جميع تعليقاته بنجاح!`
            : `Successfully banned "${userName}" and purged all their comments!`
        );
      } else {
        onShowToast?.(data.error || (isAr ? 'فشل حظر المستخدم' : 'Failed to ban user'));
      }
    } catch {
      onShowToast?.(isAr ? 'خطأ في حظر المستخدم' : 'Error banning user');
    }
  };

  // 1-Click Seed Diverse Arabic Community Comments (Positive, Balanced, Critical) - Strictly Admin
  const handleSeedCommunityComments = async () => {
    if (!character) return;
    setIsLoading(true);
    try {
      const seeds = generateDiverseCommentsForCharacter(character.id, character.name);
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: seeds }),
      });
      const data = await res.json();
      if (data.success) {
        // Re-fetch comments
        const fetchRes = await fetch(`/api/comments?characterId=${encodeURIComponent(character.id)}`);
        const fetchData = await fetchRes.json();
        if (fetchData.success && Array.isArray(fetchData.comments)) {
          setComments(fetchData.comments);
          onCommentsUpdatedRef.current?.(character.id, fetchData.comments.length);
        }
        onShowToast?.(
          isAr
            ? 'تمت إضافة 3 تعليقات مجتمعية متنوعة (إيجابية ومتوازنة ونقدية) بنجاح!'
            : 'Successfully added 3 diverse Arabic community comments!'
        );
      } else {
        onShowToast?.(isAr ? 'فشل إضافة التعليقات' : 'Failed to seed comments');
      }
    } catch {
      onShowToast?.(isAr ? 'فشل إضافة التعليقات المجتمعية' : 'Failed to seed comments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return isAr ? 'الآن' : 'Just now';
    if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`;
    }
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
    }
    const days = Math.floor(diff / 86400);
    return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className={`relative w-full max-w-xl border rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] transition-all text-left ${
            isRamadan
              ? 'border-slate-700/80 bg-[#0a1520] text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
              : 'border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(0,103,192,0.12)]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div
          className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 ${
            isRamadan
              ? 'border-slate-800 bg-[#0e1c2b]'
              : 'border-slate-100 bg-gradient-to-r from-blue-50/60 via-slate-50 to-blue-50/60'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-11 h-13 sm:w-12 sm:h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-200 shadow-sm">
              {character.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={character.picture}
                  alt={character.name}
                  referrerPolicy="no-referrer"
                  style={parseImagePosition(character.imagePosition || '50% 20%')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-base text-slate-500">
                  {charDisplayName.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base truncate tracking-tight text-slate-900 dark:text-white font-sans">
                  {charDisplayName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${currentCharTier.badgeGradient}`}
                >
                  <TierIcon tierKey={currentCharTier.key} className="w-3 h-3" />
                  <span>{isAr ? currentCharTier.nameAr : currentCharTier.nameEn}</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs mt-0.5 flex items-center gap-1 text-slate-500 dark:text-slate-300 font-sans">
                <MessageSquare className="w-3.5 h-3.5 text-[#0067c0] dark:text-sky-400" />
                <span>
                  {isAr ? 'التعليقات والمناقشات' : 'Comments & Discussion'} ({comments.length})
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 font-sans">
          {/* Google Auth Status Bar */}
          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0c1825] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {googleUser ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={googleUser.picture}
                    alt={googleUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                </div>
              ) : (
                <UserCheck className="w-5 h-5 text-[#0067c0] dark:text-sky-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-xs block text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{googleUser ? googleUser.name : isAr ? 'حساب Google للتعليق' : 'Google Comment Profile'}</span>
                  {googleUser && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {googleUser
                    ? isAr
                      ? `متصل وموثق: ${googleUser.email}`
                      : `Verified Google Account: ${googleUser.email}`
                    : isAr
                      ? 'قم بتسجيل الدخول بـ Google لتأكيد هويتك وكتابة تعليق'
                      : 'Sign in with Google to post verified comments'}
                </span>
              </div>
            </div>

            {!googleUser ? (
              <GoogleAuthButton onUserChange={handleUserChange} isAr={isAr} theme={theme} size="sm" />
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? 'حساب موثق وجاهز' : 'Verified & Ready'}</span>
              </div>
            )}
          </div>

          {/* Ban Warning if user is banned */}
          {isBanned && (
            <div className="p-3.5 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold">
                  {isAr ? 'تم حظر حسابك من قبل الإدارة' : 'Your account has been banned'}
                </span>
                <span className="text-[11px] opacity-90">
                  {isAr
                    ? 'لقد تم حظر بريدك الإلكتروني وتطهير تعليقاتك بسبب مخالفة إرشادات التطبيق.'
                    : 'Your account has been banned and comments purged for policy violations.'}
                </span>
              </div>
            </div>
          )}

          {/* Comment Posting Form (Unlocked only when signed in with Google & not banned) */}
          {googleUser && !isBanned ? (
            <form
              onSubmit={handleSubmit}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1825] shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={googleUser.picture}
                    alt={googleUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <span>{googleUser.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-[#0067c0] dark:text-sky-400" />
                  </span>
                  <span className="text-[10px] text-slate-400">{googleUser.email}</span>
                </div>
              </div>

              <textarea
                rows={3}
                required
                maxLength={800}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
                placeholder={
                  isAr
                    ? 'اكتب تعليقك بكل احترام ومحبة... (اضغط Ctrl+Enter للإرسال السريع)'
                    : 'Write your verified comment here... (Press Ctrl+Enter to send)'
                }
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#060e18] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none transition-all leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  {commentText.length}/800
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed bg-[#0067c0] hover:bg-[#005fb8] text-white active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isAr ? 'جاري الإرسال...' : 'Posting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                      <span>{isAr ? 'إرسال التعليق' : 'Post Comment'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : !googleUser ? (
            /* Unauthenticated Info Notice */
            <div className="p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isAr
                  ? '🔒 يُرجى تسجيل الدخول بـ Google أعلاه لكتابة تعليق موثق.'
                  : '🔒 Please sign in with Google above to post a comment.'}
              </p>
            </div>
          ) : null}

          {/* Comments List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isAr ? 'تعليقات المجتمع' : 'Community Comments'}
              </span>

              <div className="flex items-center gap-2">
                {/* Seed Diverse Community Comments Button - strictly for admin */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleSeedCommunityComments}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title={isAr ? 'توليد 3 تعليقات مجتمعية متنوعة (إيجابية ومتوازنة ونقدية) لهذه الشخصية' : 'Seed 3 diverse community comments for this figure'}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? '💬 توليد تعليقات مجتمعية' : 'Seed Community Comments'}</span>
                  </button>
                )}

                <span className="text-[11px] text-slate-400 font-mono">
                  {comments.length} {isAr ? 'تعليق' : 'comments'}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#0067c0]" />
                <span className="text-xs">{isAr ? 'جاري تحميل التعليقات...' : 'Loading comments...'}</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 text-slate-500 dark:text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs sm:text-sm font-medium">
                  {isAr
                    ? 'لا توجد تعليقات بعد، كن أول من يشارك برأيه!'
                    : 'No comments yet. Be the first to share your thoughts!'}
                </p>
              </div>
            ) : (
              comments.map((c) => {
                const authorEmail = c.userEmail || c.userName;

                return (
                  <div
                    key={c.id}
                    className="p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1825] text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 bg-gradient-to-tr from-blue-600 to-indigo-700">
                          {c.userName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-slate-100 font-sans">
                            {c.userName}
                          </span>
                          {c.userEmail && (
                            <span className="text-[10px] text-slate-400 truncate">
                              {c.userEmail}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatRelativeTime(c.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Admin Management Actions: Delete Comment or Ban User */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Ban User & Purge All Comments */}
                          <button
                            type="button"
                            onClick={() =>
                              handleBanUserAndPurge(authorEmail, c.userName, c.guestId)
                            }
                            className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-rose-300 dark:border-rose-800"
                            title={isAr ? `حظر المستخدم "${c.userName}" وتطهير جميع تعليقاته` : `Ban user "${c.userName}" and delete all comments`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isAr ? 'حظر وتطهير' : 'Ban User'}</span>
                          </button>

                          {/* Delete Single Comment */}
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            disabled={deletingId === c.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title={isAr ? 'حذف هذا التعليق فقط' : 'Delete this comment only'}
                          >
                            {deletingId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-medium break-words font-sans">
                      {c.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
