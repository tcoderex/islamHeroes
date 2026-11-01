'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Trash2,
  User,
  Clock,
  Loader2,
  Sparkles,
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

// Generates a pleasant consistent pastel gradient for avatar background based on username
function getAvatarGradient(name: string): string {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-purple-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
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

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');

  const isRamadan = theme === 'ramadan';

  // Store onCommentsUpdated in a ref to avoid infinite dependency re-renders
  const onCommentsUpdatedRef = useRef(onCommentsUpdated);
  useEffect(() => {
    onCommentsUpdatedRef.current = onCommentsUpdated;
  }, [onCommentsUpdated]);

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
        // Rollback optimistic comment on failure
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl border rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${
          isRamadan
            ? 'border-amber-500/35 bg-[#0b1622] text-amber-50 shadow-[0_20px_60px_rgba(245,158,11,0.15)]'
            : 'border-slate-200 bg-white text-slate-800 shadow-[0_20px_60px_rgba(0,103,192,0.12)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 ${
            isRamadan
              ? 'border-amber-500/25 bg-gradient-to-r from-[#0f2130] via-[#12283a] to-[#0f2130]'
              : 'border-slate-100 bg-gradient-to-r from-blue-50/60 via-slate-50 to-blue-50/60'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Character Thumbnail */}
            <div className="relative w-11 h-13 sm:w-12 sm:h-14 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-slate-200 shadow-sm">
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
                <h3 className="font-bold text-sm sm:text-base truncate tracking-tight">
                  {charDisplayName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${currentCharTier.badgeGradient}`}
                >
                  <TierIcon tierKey={currentCharTier.key} className="w-3 h-3" />
                  <span>{isAr ? currentCharTier.nameAr : currentCharTier.nameEn}</span>
                </span>
              </div>
              <p
                className={`text-[11px] sm:text-xs mt-0.5 flex items-center gap-1 ${
                  isRamadan ? 'text-amber-200/70' : 'text-slate-500'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#0067c0] dark:text-amber-400" />
                <span>
                  {isAr ? 'التعليقات والآراء' : 'Comments & Discussion'} ({comments.length})
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isRamadan
                ? 'border-amber-500/30 text-amber-200 hover:bg-white/10'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Comments List & Form */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
          {/* Easy & Clean Comment Form */}
          <form
            onSubmit={handleSubmit}
            className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
              isRamadan
                ? 'bg-[#0e1d2c] border-amber-500/25'
                : 'bg-slate-50/70 border-slate-200/90 shadow-2xs'
            }`}
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
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={isAr ? 'اسمك (اختياري - افتراضياً: زائر)' : 'Your name (optional - defaults to Guest)'}
                className={`flex-1 px-3 py-1.5 text-xs rounded-xl border outline-none transition-all ${
                  isRamadan
                    ? 'bg-[#091420] border-amber-500/30 text-amber-100 placeholder:text-amber-200/40 focus:border-amber-400'
                    : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0067c0] focus:ring-2 focus:ring-[#0067c0]/15'
                }`}
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
                className={`w-full p-3 text-xs sm:text-sm rounded-xl border outline-none resize-none transition-all leading-relaxed ${
                  isRamadan
                    ? 'bg-[#091420] border-amber-500/30 text-amber-100 placeholder:text-amber-200/40 focus:border-amber-400'
                    : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0067c0] focus:ring-2 focus:ring-[#0067c0]/15'
                }`}
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
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${
                  isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-105 active:scale-95'
                    : 'bg-[#0067c0] text-white hover:bg-[#005fb8] active:scale-95'
                }`}
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
              <span className="text-xs font-bold text-slate-700 dark:text-amber-200">
                {isAr ? 'تعليقات المجتمع' : 'Community Comments'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {comments.length} {isAr ? 'تعليق' : 'comments'}
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#0067c0] dark:text-amber-400" />
                <span className="text-xs">{isAr ? 'جاري تحميل التعليقات...' : 'Loading comments...'}</span>
              </div>
            ) : comments.length === 0 ? (
              <div
                className={`p-6 text-center rounded-2xl border border-dashed ${
                  isRamadan
                    ? 'border-amber-500/20 bg-amber-500/5 text-amber-200/60'
                    : 'border-slate-200 bg-slate-50/60 text-slate-500'
                }`}
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs sm:text-sm font-medium">
                  {isAr
                    ? 'لا توجد تعليقات بعد، كن أول من يشارك برأيه!'
                    : 'No comments yet. Be the first to share your thoughts!'}
                </p>
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                    isRamadan
                      ? 'bg-[#0f2130]/90 border-amber-500/20 hover:border-amber-500/40 text-amber-50'
                      : 'bg-white border-slate-200/80 hover:border-blue-200/90 text-slate-800 shadow-2xs'
                  }`}
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
                          <span className="font-bold text-xs sm:text-sm truncate">
                            {c.userName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(c.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                        title={isAr ? 'حذف هذا التعليق كمسؤول' : 'Delete comment as admin'}
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Comment Body */}
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-amber-100/90 whitespace-pre-wrap leading-relaxed font-normal">
                    {c.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
