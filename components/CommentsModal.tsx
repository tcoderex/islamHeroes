'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  TrendingUp,
  User,
  Clock,
  Loader2,
  Check,
  Sliders,
} from 'lucide-react';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';
import { AppTheme } from '@/lib/theme';
import { CustomCharacter } from '@/components/CharactersView';
import { parseImagePosition } from '@/lib/imagePosition';
import { getLocalizedCharacterName } from '@/lib/arabicTransliteration';
import GlowingScoreBadge from '@/components/GlowingScoreBadge';
import HonorBadge from '@/components/HonorBadge';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [includeRating, setIncludeRating] = useState(true);
  const [suggestedRating, setSuggestedRating] = useState<number>(850);

  const isRamadan = theme === 'ramadan';

  // Load comments whenever modal opens for this character
  const fetchComments = useCallback(async (charId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments?characterId=${encodeURIComponent(charId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
        onCommentsUpdated?.(charId, data.comments.length);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [onCommentsUpdated]);

  const charId = character?.id;
  const charRating = character?.rating;

  useEffect(() => {
    if (isOpen && charId) {
      fetchComments(charId);
      // Set default suggested rating to character's current rating
      setSuggestedRating(charRating ?? 0);
      setCommentText('');
    }
  }, [isOpen, charId, charRating, fetchComments]);

  // Compute community stats
  const { avgRating, ratingCount, tierInfo } = useMemo(() => {
    const withRating = comments.filter((c) => c.suggestedRating !== undefined);
    if (withRating.length === 0) {
      return { avgRating: null, ratingCount: 0, tierInfo: null };
    }
    const sum = withRating.reduce((acc, c) => acc + (c.suggestedRating || 0), 0);
    const avg = Math.round(sum / withRating.length);
    return {
      avgRating: avg,
      ratingCount: withRating.length,
      tierInfo: getRatingTier(avg),
    };
  }, [comments]);

  if (!isOpen || !character) return null;

  const charDisplayName = getLocalizedCharacterName(character.name, isAr);
  const currentCharTier = getRatingTier(character.rating);
  const currentSuggestTier = getRatingTier(suggestedRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        characterId: character.id,
        userName: authorName.trim() || (isAr ? 'زائر' : 'Guest User'),
        text: commentText.trim(),
        suggestedRating: includeRating ? suggestedRating : undefined,
      };

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        const updated = [data.comment, ...comments];
        setComments(updated);
        setCommentText('');
        onCommentsUpdated?.(character.id, updated.length);
        onShowToast?.(
          isAr
            ? 'تم نشر تعليقك ومقترح التقييم بنجاح!'
            : 'Comment and suggested rating posted successfully!'
        );
      } else {
        onShowToast?.(
          isAr ? 'تعذر نشر التعليق، يرجى المحاولة لاحقاً' : 'Failed to post comment'
        );
      }
    } catch {
      onShowToast?.(
        isAr ? 'حدث خطأ أثناء إرسال التعليق' : 'An error occurred while posting comment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا التعليق كمسؤول؟' : 'Delete this comment as admin?')) {
      return;
    }

    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        const updated = comments.filter((c) => c.id !== commentId);
        setComments(updated);
        onCommentsUpdated?.(character.id, updated.length);
        onShowToast?.(isAr ? 'تم حذف التعليق بنجاح' : 'Comment deleted by admin');
      }
    } catch {
      onShowToast?.(isAr ? 'فشل حذف التعليق' : 'Failed to delete comment');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl bg-white dark:bg-[#0c1825] border rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${
          isRamadan
            ? 'border-amber-500/35 bg-[#0b1622] text-amber-50 shadow-[0_20px_60px_rgba(245,158,11,0.15)]'
            : 'border-slate-200 bg-white text-slate-800 shadow-[0_20px_60px_rgba(0,103,192,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            isRamadan
              ? 'border-amber-500/25 bg-gradient-to-r from-[#0f2130] via-[#12283a] to-[#0f2130]'
              : 'border-slate-100 bg-gradient-to-r from-blue-50/60 via-slate-50 to-blue-50/60'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Character Thumbnail */}
            <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-slate-200 shadow-sm">
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
                <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-500">
                  {charDisplayName.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg truncate tracking-tight">
                  {charDisplayName}
                </h3>
                {/* Official Tier Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-2xs ${currentCharTier.badgeGradient}`}
                >
                  <TierIcon tierKey={currentCharTier.key} className="w-3 h-3" />
                  <span>{isAr ? currentCharTier.nameAr : currentCharTier.nameEn}</span>
                  <span className="font-mono text-[10px]">({character.rating > 0 ? `+${character.rating}` : character.rating})</span>
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 flex items-center gap-1.5 ${
                  isRamadan ? 'text-amber-200/70' : 'text-slate-500'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#0067c0] dark:text-amber-400" />
                <span>
                  {isAr ? 'منصة آراء ومقترحات المجتمع والتقييم' : 'Community opinions & rating suggestions'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isRamadan
                ? 'border-amber-500/30 text-amber-200 hover:bg-white/10'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 1. Community Rating Suggestion Consensus Card */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
              isRamadan
                ? 'bg-[#0f2130]/90 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.06)]'
                : 'bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-slate-50 border-blue-200/80 shadow-[0_4px_16px_rgba(0,103,192,0.05)]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isRamadan ? 'bg-amber-400/20 text-amber-300' : 'bg-[#0067c0]/15 text-[#0067c0]'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>{isAr ? 'متوسط مقترحات المستخدمين للتقييم' : 'Community Suggested Rating'}</span>
                  </h4>
                  <p
                    className={`text-[11px] ${
                      isRamadan ? 'text-amber-200/70' : 'text-slate-500'
                    }`}
                  >
                    {ratingCount > 0
                      ? isAr
                        ? `بناءً على ${ratingCount} تصويت ومقترح من المستخدمين`
                        : `Based on ${ratingCount} user rating votes`
                      : isAr
                        ? 'لم يقترح أحد تقييماً بعد، كن أول من يقترح!'
                        : 'No community rating suggestions yet. Be the first!'}
                  </p>
                </div>
              </div>

              {avgRating !== null && tierInfo ? (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div
                    className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs ${tierInfo.badgeGradient}`}
                  >
                    <TierIcon tierKey={tierInfo.key} className="w-3.5 h-3.5" />
                    <span>{avgRating > 0 ? `+${avgRating}` : avgRating}</span>
                    <span className="opacity-80">({isAr ? tierInfo.nameAr : tierInfo.nameEn})</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-mono">
                  {isAr ? 'في انتظار المقترحات' : 'Awaiting Suggestions'}
                </span>
              )}
            </div>
          </div>

          {/* 2. Interactive Input Form: Add Comment & Rating Suggestion */}
          <form
            onSubmit={handleSubmit}
            className={`p-3.5 sm:p-4 rounded-2xl border space-y-3.5 transition-all ${
              isRamadan
                ? 'bg-[#0e1d2c] border-amber-500/25'
                : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0067c0] dark:text-amber-400" />
                <span>{isAr ? 'أضف تعليقك ومقترحك' : 'Add Your Comment & Rating'}</span>
              </h4>
              <span className="text-[10px] text-slate-400">
                {isAr ? 'شارك رأيك بحرية' : 'Share your perspective'}
              </span>
            </div>

            {/* Author Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-amber-200 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{isAr ? 'اسمك أو لقبك' : 'Your Name / Nickname'}</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {isAr ? '(اختياري - افتراضياً: زائر)' : '(Optional - defaults to Guest)'}
                </span>
              </div>
              <input
                type="text"
                maxLength={40}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={isAr ? 'مثال: أحمد، طالب علم، باحث...' : 'e.g. Ahmad, Tariq, Researcher...'}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 focus:bg-white focus:border-[#0067c0] focus:ring-2 focus:ring-[#0067c0]/15 outline-none transition-all"
              />
            </div>

            {/* Suggested Rating Section */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                includeRating
                  ? isRamadan
                    ? 'bg-[#122436] border-amber-500/30'
                    : 'bg-blue-50/60 border-blue-200/70'
                  : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={includeRating}
                    onChange={(e) => setIncludeRating(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0067c0] accent-[#0067c0] cursor-pointer"
                  />
                  <span>{isAr ? 'أريد اقتراح تقييم للشخصية (-1000 إلى +1000):' : 'I want to suggest a rating (-1000 to +1000):'}</span>
                </label>

                {includeRating && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs ${currentSuggestTier.badgeGradient}`}
                  >
                    <TierIcon tierKey={currentSuggestTier.key} className="w-3 h-3" />
                    <span>{suggestedRating > 0 ? `+${suggestedRating}` : suggestedRating}</span>
                    <span className="text-[10px]">({isAr ? currentSuggestTier.nameAr : currentSuggestTier.nameEn})</span>
                  </span>
                )}
              </div>

              {includeRating && (
                <div className="space-y-2 mt-2">
                  <input
                    type="range"
                    min={-1000}
                    max={1000}
                    step={10}
                    value={suggestedRating}
                    onChange={(e) => setSuggestedRating(Number(e.target.value))}
                    className="w-full accent-[#0067c0] cursor-pointer"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-slate-400 font-medium">
                      {isAr ? 'اختيار سريع:' : 'Presets:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSuggestedRating(950)}
                      className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 hover:bg-sky-200 font-semibold cursor-pointer"
                    >
                      {isAr ? 'ملائكي (+950)' : 'Celestial (+950)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestedRating(700)}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 font-semibold cursor-pointer"
                    >
                      {isAr ? 'صالح (+700)' : 'Virtuous (+700)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestedRating(-30)}
                      className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 hover:bg-amber-200 font-bold border border-amber-300 cursor-pointer"
                    >
                      {isAr ? 'معتدل (-30)' : 'Moderate (-30)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestedRating(-120)}
                      className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 font-medium cursor-pointer"
                    >
                      {isAr ? 'ذو عثرات (-120)' : 'Flawed (-120)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestedRating(-850)}
                      className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 font-medium cursor-pointer"
                    >
                      {isAr ? 'طاغية (-850)' : 'Tyrant (-850)'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Comment Text Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-amber-200 mb-1">
                {isAr ? 'التعليق أو سبب التقييم' : 'Comment or Reasoning'}
              </label>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب رأيك، إنجازات الشخصية، أو سبب هذا التقييم المقترح...'
                    : 'Share your perspective, historical context, or reason for this rating...'
                }
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 focus:bg-white focus:border-[#0067c0] focus:ring-2 focus:ring-[#0067c0]/15 outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                isRamadan
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400'
                  : 'bg-[#0067c0] hover:bg-[#005fb8] text-white'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              )}
              <span>{isAr ? 'نشر التعليق والمقترح' : 'Post Comment & Suggestion'}</span>
            </button>
          </form>

          {/* 3. Comments List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#0067c0] dark:text-amber-400" />
                <span>
                  {isAr ? `تعليقات المستخدمين (${comments.length})` : `User Comments (${comments.length})`}
                </span>
              </h4>

              {isAdmin && (
                <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                  <span>{isAr ? 'وضع المشرف: متاح حذف أي تعليق غير لائق' : 'Admin: delete uncool comments'}</span>
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0067c0] dark:text-amber-400" />
                <span className="text-xs text-slate-400">
                  {isAr ? 'جاري تحميل التعليقات...' : 'Loading comments...'}
                </span>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
                <p className="text-xs sm:text-sm text-slate-400 mb-2">
                  {isAr ? 'لا توجد تعليقات حتى الآن لهذه الشخصية' : 'No comments yet for this figure.'}
                </p>
                <p className="text-xs text-slate-500">
                  {isAr ? 'كن أول من يعلق ويقترح تقييماً في الميزان!' : 'Be the first to comment and suggest a rating!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {comments.map((cmt) => {
                  const cmtTier = cmt.suggestedRating !== undefined ? getRatingTier(cmt.suggestedRating) : null;

                  return (
                    <div
                      key={cmt.id}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                        isRamadan
                          ? 'bg-[#0f2130]/80 border-amber-500/20 hover:border-amber-500/40'
                          : 'bg-white border-slate-200/80 hover:border-blue-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* Author info */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isRamadan
                                ? 'bg-amber-400/20 text-amber-300'
                                : 'bg-[#0067c0]/15 text-[#0067c0]'
                            }`}
                          >
                            {cmt.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm block">
                              {cmt.userName}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatRelativeTime(cmt.createdAt)}</span>
                            </span>
                          </div>
                        </div>

                        {/* Top Right: Suggested Rating & Admin Delete */}
                        <div className="flex items-center gap-1.5">
                          {cmtTier && cmt.suggestedRating !== undefined && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-2xs ${cmtTier.badgeGradient}`}
                              title={isAr ? 'التقييم المقترح من المستخدم' : 'User suggested rating'}
                            >
                              <TierIcon tierKey={cmtTier.key} className="w-3 h-3" />
                              <span>{cmt.suggestedRating > 0 ? `+${cmt.suggestedRating}` : cmt.suggestedRating}</span>
                            </span>
                          )}

                          {/* Admin Delete Action */}
                          {isAdmin && (
                            <button
                              type="button"
                              disabled={deletingId === cmt.id}
                              onClick={() => handleDeleteComment(cmt.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title={isAr ? 'حذف هذا التعليق كمسؤول' : 'Delete comment as admin'}
                            >
                              {deletingId === cmt.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p
                        className={`text-xs sm:text-sm mt-2 leading-relaxed whitespace-pre-wrap ${
                          isRamadan ? 'text-amber-100/90' : 'text-slate-700'
                        }`}
                      >
                        {cmt.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
