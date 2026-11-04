'use client';

import React, { useEffect } from 'react';
import { X, Award, Sparkles, BookOpen, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getCharacterBadge, CharacterBadge } from '@/lib/characterBadges';
import Super3DBadge from './Super3DBadge';

interface BadgeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeId?: string | null;
  badge?: CharacterBadge | null;
  characterName?: string;
  characterPicture?: string;
  characterRating?: number;
  isAr?: boolean;
  isAdmin?: boolean;
  onOpenPicker?: () => void;
}

export default function BadgeInfoModal({
  isOpen,
  onClose,
  badgeId,
  badge: badgeProp,
  characterName,
  characterPicture,
  characterRating,
  isAr = true,
  isAdmin = false,
  onOpenPicker,
}: BadgeInfoModalProps) {
  const badge = badgeProp || getCharacterBadge(badgeId);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen || !badge) return null;

  const titleText = isAr ? badge.nameAr : badge.nameEn;
  const secondaryTitle = isAr ? badge.nameEn : badge.nameAr;
  const categoryText = isAr ? badge.categoryLabelAr : badge.categoryLabelEn;
  const meaningText = isAr ? badge.meaningAr : badge.meaningEn;
  const secondaryMeaning = isAr ? badge.meaningEn : badge.meaningAr;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-info-title"
    >
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-[#0d1c2d] to-slate-950 border border-amber-500/30 text-white shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200"
      >
        {/* Top Decorative Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/20 via-yellow-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer backdrop-blur-sm"
          aria-label={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Big 3D Badge Visual */}
        <div className="pt-8 pb-4 px-6 flex flex-col items-center text-center relative z-10">
          {/* Category Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-400/40 text-amber-300 shadow-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{categoryText}</span>
          </div>

          {/* Big Super 3D Animated Medallion */}
          <div className="my-2 relative flex items-center justify-center">
            {/* Pulsing ring aura */}
            <div className="absolute inset-0 rounded-3xl bg-amber-400/25 blur-xl animate-pulse scale-125" />
            <Super3DBadge
              badge={badge}
              isAr={isAr}
              size="xl"
              showTooltip={false}
              className="animate-[badge-float_4s_ease-in-out_infinite]"
            />
          </div>

          {/* Badge Title */}
          <h2
            id="badge-info-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3 mb-1 font-arabic"
          >
            {titleText}
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/80 font-medium">
            {secondaryTitle}
          </p>
        </div>

        {/* Character Bearer Card (if associated) */}
        {characterName && (
          <div className="mx-6 mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 backdrop-blur-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              {characterPicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={characterPicture}
                  alt={characterName}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover border border-amber-400/40 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0067c0] to-sky-400 flex items-center justify-center shrink-0 font-bold text-white shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="text-right overflow-hidden">
                <p className="text-[11px] text-amber-300/80 font-medium">
                  {isAr ? 'حامل هذا الوسام الشريف:' : 'Bearer of this noble honor:'}
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {characterName}
                </p>
              </div>
            </div>

            {typeof characterRating === 'number' && (
              <div className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/15 text-xs font-bold text-emerald-400 shrink-0">
                {characterRating > 0 ? `+${characterRating}` : characterRating}
              </div>
            )}
          </div>
        )}

        {/* Badge Meaning & Honorary Description */}
        <div className="px-6 pb-6 space-y-4 text-right">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-400/20 text-slate-200">
            <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold text-xs">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isAr ? 'المعنى والدلالة التاريخية الشريفة:' : 'Significance & Historical Meaning:'}</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium">
              {meaningText}
            </p>
            {secondaryMeaning && (
              <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/10 italic">
                {secondaryMeaning}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isAr
                ? 'أوسمة شرفية تاريخية تُمنح لرموز الأمة الإسلامية تقديراً لعلمهم وجهادهم ومساهماتهم الخالدة في تاريخ وحضارة الإسلام.'
                : 'Authentic Islamic honor badges recognizing scholars, commanders, and leaders for their enduring contributions to Islamic history and civilization.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            {isAdmin && onOpenPicker && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPicker();
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>{isAr ? 'تغيير هذا الوسام (مشرف)' : 'Change Badge (Admin)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`w-full ${
                isAdmin && onOpenPicker ? 'sm:w-auto' : 'sm:flex-1'
              } py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'إغلاق' : 'Close'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
