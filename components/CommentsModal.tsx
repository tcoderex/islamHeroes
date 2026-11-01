'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Trash2,
  UserX,
  Clock,
  Loader2,
  Sparkles,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { AppTheme } from '@/lib/theme';
import { CustomCharacter } from '@/components/CharactersView';
import { parseImagePosition } from '@/lib/imagePosition';
import { getLocalizedCharacterName } from '@/lib/arabicTransliteration';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';

export interface CharacterComment {
  id: string;
  characterId: string;
  userName: string;
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
  onCommentsUpdated?: (characterId: string, newCount: number) => void;
  onShowToast?: (msg: string) => void;
}

// Generates a pleasant consistent gradient for avatar background based on username or guestId
function getAvatarGradient(name: string): string {
  const gradients = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-indigo-600 to-purple-700',
    'from-violet-600 to-purple-800',
    'from-rose-600 to-pink-700',
    'from-cyan-600 to-blue-700',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}

export default function CommentsModal({
  character,
  isOpen,
  onClose,
  isAdmin = false,
  isAr,
  theme = 'tgis',
  onCommentsUpdated,
  onShowToast,
}: CommentsModalProps) {
  const [comments, setComments] = useState<CharacterComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUserGuestId, setDeletingUserGuestId] = useState<string | null>(null);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [guestId, setGuestId] = useState('');

  const isRamadan = theme === 'ramadan';

  // Store onCommentsUpdated in a ref to avoid infinite dependency re-renders
  const onCommentsUpdatedRef = useRef(onCommentsUpdated);
  useEffect(() => {
    onCommentsUpdatedRef.current = onCommentsUpdated;
  }, [onCommentsUpdated]);

  // Persistent Unique Guest Identity from LocalStorage
  useEffect(() => {
    try {
      let storedId = localStorage.getItem('heroes_guest_id');
      let storedName = localStorage.getItem('heroes_guest_name');

      if (!storedId) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        storedId = `guest_${Date.now()}_${randomNum}`;
        storedName = isAr ? `زائر #${randomNum}` : `Guest #${randomNum}`;
        localStorage.setItem('heroes_guest_id', storedId);
        localStorage.setItem('heroes_guest_name', storedName);
      }

      setGuestId(storedId);
      setAuthorName(storedName || (isAr ? 'زائر' : 'Guest'));
    } catch {
      setGuestId(`guest_${Date.now()}`);
      setAuthorName(isAr ? 'زائر' : 'Guest');
    }
  }, [isAr]);

  const handleNameChange = (val: string) => {
    setAuthorName(val);
    try {
      localStorage.setItem('heroes_guest_name', val.trim() || (isAr ? 'زائر' : 'Guest'));
    } catch {
      // ignore
    }
  };

  const charId = character?.id;

  // Fetch comments only when modal opens or character changes
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
        // ignore error
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
    const trimmedText = commentText.trim();
    if (!trimmedText) return;

    setIsSubmitting(true);
    const finalAuthor = authorName.trim() || (isAr ? 'زائر' : 'Guest');

    // Create optimistic comment
    const optimisticComment: CharacterComment = {
      id: `temp-${Date.now()}`,
      characterId: character.id,
      userName: finalAuthor,
      text: trimmedText,
      guestId: guestId,
      createdAt: Date.now(),
    };

    // Instant optimistic update for smooth UX
    setComments((prev) => [optimisticComment, ...prev]);
    setCommentText('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          userName: finalAuthor,
          text: trimmedText,
          guestId: guestId,
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? data.comment : c))
        );
        onCommentsUpdatedRef.current?.(character.id, comments.length + 1);
        onShowToast?.(isAr ? 'تم نشر تعليقك بنجاح' : 'Comment posted successfully');
      } else {
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
        onShowToast?.(
          isAr ? 'تعذر نشر التعليق، يرجى المحاولة ثانية' : 'Failed to post comment'
        );
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      onShowToast?.(
        isAr ? 'حدث خطأ في الاتصال أثناء نشر التعليق' : 'Connection error while posting comment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete single comment by ID
  const handleDeleteComment = async (commentId: string) => {
    if (
      !confirm(
        isAr
          ? 'هل أنت متأكد من حذف هذا التعليق كمسؤول؟'
          : 'Are you sure you want to delete this comment as admin?'
      )
    ) {
      return;
    }

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
        onShowToast?.(isAr ? 'تم حذف التعليق بواسطة المشرف' : 'Comment deleted by admin');
      } else {
        onShowToast?.(isAr ? 'فشل حذف التعليق' : 'Failed to delete comment');
      }
    } catch {
      onShowToast?.(isAr ? 'حدث خطأ أثناء حذف التعليق' : 'Error deleting comment');
    } finally {
      setDeletingId(null);
    }
  };

  // Delete ALL comments by a specific user / guestId (Admin Ban / Wipe user)
  const handleDeleteUserAllComments = async (userGuestId: string, userName: string) => {
    if (
      !confirm(
        isAr
          ? `هل أنت متأكد من حذف جميع تعليقات المستخدم "${userName}" وحظر إساءاته؟`
          : `Delete all comments posted by user "${userName}"?`
      )
    ) {
      return;
    }

    setDeletingUserGuestId(userGuestId);
    try {
      const res = await fetch(`/api/comments?guestId=${encodeURIComponent(userGuestId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => {
          const updated = prev.filter(
            (c) => (c.guestId || c.userName) !== userGuestId && c.userName !== userName
          );
          onCommentsUpdatedRef.current?.(character.id, updated.length);
          return updated;
        });
        onShowToast?.(
          isAr
            ? `تم حذف جميع تعليقات المستخدم "${userName}" بنجاح`
            : `Successfully removed all comments from "${userName}"`
        );
      } else {
        onShowToast?.(isAr ? 'فشل حذف تعليقات المستخدم' : 'Failed to delete user comments');
      }
    } catch {
      onShowToast?.(isAr ? 'حدث خطأ أثناء حذف تعليقات المستخدم' : 'Error deleting user comments');
    } finally {
      setDeletingUserGuestId(null);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl border rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${
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
            {/* Character Thumbnail */}
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
                  {isAr ? 'التعليقات والآراء' : 'Comments & Discussion'} ({comments.length})
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

        {/* Scrollable Comments List & Form */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 font-sans">
          {/* Persistent Guest Identity Info Banner */}
          <div className="p-2.5 rounded-xl border border-blue-200 dark:border-slate-800 bg-blue-50/60 dark:bg-[#0d1e2e] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <UserCheck className="w-4 h-4 text-[#0067c0] dark:text-sky-400 shrink-0" />
              <span>
                {isAr
                  ? `معرف الزائر الخاص بك ثابت في هذا المتصفح`
                  : `Your unique guest identifier is saved in this browser`}
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-700 text-[#0067c0] dark:text-sky-300">
              {guestId.slice(-6)}
            </span>
          </div>

          {/* Comment Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0c1825] transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-2xs bg-gradient-to-tr ${getAvatarGradient(
                  authorName || 'Guest'
                )}`}
              >
                {(authorName.trim() || (isAr ? 'ز' : 'G')).charAt(0).toUpperCase()}
              </div>

              {/* Author Name Input */}
              <input
                type="text"
                maxLength={40}
                value={authorName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isAr ? 'اسمك (محفوظ تلقائياً في متصفحك)' : 'Your name (saved in browser)'}
                className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060e18] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#0067c0] focus:ring-2 focus:ring-[#0067c0]/15 font-sans"
              />
            </div>

            {/* Comment Textarea */}
            <div className="relative">
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
                    ? 'اكتب تعليقك أو رأيك هنا بكل احترام ومحبة... (اضغط Ctrl+Enter للإرسال السريع)'
                    : 'Write your comment here respectfully... (Press Ctrl+Enter to send)'
                }
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#060e18] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none transition-all leading-relaxed font-sans"
              />
            </div>

            {/* Form Footer with Send Button */}
            <div className="flex items-center justify-between mt-2 pt-1">
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

          {/* Comments List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isAr ? 'تعليقات المجتمع' : 'Community Comments'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {comments.length} {isAr ? 'تعليق' : 'comments'}
              </span>
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
                const userGuestIdentifier = c.guestId || c.userName;
                const isUserDeleting = deletingUserGuestId === userGuestIdentifier;

                return (
                  <div
                    key={c.id}
                    className="p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1825] text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {/* User Avatar */}
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 bg-gradient-to-tr ${getAvatarGradient(
                            c.userName
                          )}`}
                        >
                          {c.userName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-slate-100 font-sans">
                              {c.userName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatRelativeTime(c.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Admin Management Actions: Delete Single Comment or Delete All User Comments */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Delete All Comments From This User */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUserAllComments(userGuestIdentifier, c.userName)}
                            disabled={isUserDeleting}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-amber-300 dark:border-amber-700"
                            title={isAr ? `حذف جميع تعليقات المستخدم "${c.userName}"` : `Delete all comments from "${c.userName}"`}
                          >
                            {isUserDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">{isAr ? 'حذف المستخدم' : 'Delete User'}</span>
                              </>
                            )}
                          </button>

                          {/* Delete Single Comment */}
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            disabled={deletingId === c.id}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title={isAr ? 'حذف هذا التعليق كمسؤول' : 'Delete comment as admin'}
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

                    {/* Comment Body - Clean White/Dark-Slate Text, NO Yellow! */}
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
  );
}
