'use client';

import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';
import HonorBadge from '@/components/HonorBadge';
import GlowingScoreBadge from '@/components/GlowingScoreBadge';

export interface PreviewableCharacter {
  id: string;
  name: string;
  secondaryName?: string;
  title?: string;
  era?: string;
  summary?: string;
  picture?: string;
  rating?: number; // -1000 to 1000
}

interface CharacterPreviewModalProps {
  character: PreviewableCharacter | null;
  onClose: () => void;
  isAr: boolean;
}

export default function CharacterPreviewModal({
  character,
  onClose,
  isAr,
}: CharacterPreviewModalProps) {
  const [imgError, setImgError] = useState(false);

  if (!character) return null;

  const rating = character.rating ?? 1000;
  const tier = getRatingTier(rating);

  // Calculate percentage for visual rating bar (-1000 -> 0%, 0 -> 50%, 1000 -> 100%)
  const ratingPercent = Math.round(((rating + 1000) / 2000) * 100);

  // Guard against duplicate description: only show title if different from summary and name
  const showTitle =
    Boolean(character.title) &&
    character.title !== character.summary &&
    character.title !== character.name;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_24px_60px_rgba(0,103,192,0.18)] overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-3 z-30 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-colors cursor-pointer shadow-md ${
            isAr ? 'left-3' : 'right-3'
          }`}
          title={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Uncropped Photo Viewport: Image fits fully without zooming or cropping */}
        <div className="relative w-full md:w-5/12 h-56 sm:h-64 md:h-auto md:min-h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden p-2 select-none shrink-0">
          {/* Top-Left Honor Badge */}
          <HonorBadge
            rating={rating}
            isAr={isAr}
            size="md"
            className="absolute top-3 left-3 z-30"
          />

          {/* Top-Middle Glowing Score Badge */}
          <GlowingScoreBadge
            rating={rating}
            size="md"
            className="absolute top-3 left-1/2 -translate-x-1/2 z-30"
          />

          {character.picture && !imgError ? (
            <>
              {/* Ambient blurred backdrop for seamless visual framing */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-35 scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${character.picture})` }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

              {/* Main Image: object-contain ensures 100% of photo is visible */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={character.picture}
                alt={character.name}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain rounded-lg drop-shadow-md"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-white py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0067c0] to-sky-400 flex items-center justify-center shadow-md mb-2">
                <span className="text-3xl font-bold font-serif text-white select-none">
                  {character.name.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {isAr ? 'لا توجد صورة' : 'No photo uploaded'}
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 md:p-6 space-y-4 flex-1 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header: Name, Secondary Name, and Tier Badge + Honor Badge */}
            <div className="mb-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {character.name}
                </h2>
                {/* Thematic Tier Badge Pill & Honor Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <HonorBadge rating={rating} isAr={isAr} size="sm" />
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${tier.badgeGradient}`}
                  >
                    <TierIcon tierKey={tier.key} className="w-3.5 h-3.5" />
                    <span>{isAr ? tier.nameAr : tier.nameEn}</span>
                  </div>
                </div>
              </div>

              {character.secondaryName && (
                <p className="text-xs text-slate-500 font-serif mt-0.5">
                  {character.secondaryName}
                </p>
              )}

              {/* Title / Honorific (only displayed if distinct from summary/description) */}
              {showTitle && (
                <p className="text-xs sm:text-sm font-semibold text-[#0067c0] mt-1">
                  {character.title}
                </p>
              )}

              {character.era && (
                <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{character.era}</span>
                </p>
              )}
            </div>

            {/* Enhanced Character Alignment Rating Box with Character Description */}
            <div className={`p-3.5 ${tier.bgLight} border ${tier.borderColor} rounded-2xl flex flex-col gap-2.5 transition-all`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <TierIcon tierKey={tier.key} className="w-4 h-4" />
                  <span>{isAr ? 'ميزان الشخصية' : 'Character Alignment'}</span>
                </span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className={`text-lg font-black tracking-tight ${tier.textColor}`}>
                    {rating > 0 ? `+${rating}` : rating}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    / 1000
                  </span>
                </div>
              </div>

              {/* Replaced generic text with character's actual description */}
              {character.summary && (
                <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  {character.summary}
                </p>
              )}

              {/* Dynamic Tier Progress Bar with 5 Color Zones legend */}
              <div className="space-y-1 pt-1">
                <div className="relative w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden p-0.5">
                  {/* 5-zone background guide */}
                  <div className="absolute inset-0 flex opacity-25 pointer-events-none">
                    <div className="w-[25%] bg-purple-600" title="-1000 to -500 (Devil)" />
                    <div className="w-[25%] bg-rose-500" title="-500 to 0 (Corrupt)" />
                    <div className="w-[25%] bg-amber-400" title="0 to 500 (Neutral)" />
                    <div className="w-[17.5%] bg-emerald-500" title="500 to 850 (Virtuous)" />
                    <div className="w-[7.5%] bg-sky-400" title="850 to 1000 (Angelic)" />
                  </div>

                  {/* Active fill */}
                  <div
                    className={`relative z-10 h-full rounded-full transition-all duration-300 ${tier.barColor}`}
                    style={{ width: `${Math.max(4, Math.min(100, ratingPercent))}%` }}
                  />
                </div>

                {/* Range Labels with colors matching tiers */}
                <div className="flex justify-between items-center text-[10px] font-mono px-0.5 text-slate-400">
                  <span className="text-purple-600 font-semibold" title={isAr ? 'شيطاني (-1000)' : 'Devil (-1000)'}>
                    -1000 😈
                  </span>
                  <span className="text-rose-500 font-semibold">-500</span>
                  <span className="text-amber-600 font-semibold">0</span>
                  <span className="text-emerald-600 font-semibold">+500</span>
                  <span className="text-sky-500 font-semibold" title={isAr ? 'ملائكي (+1000)' : 'Angel (+1000)'}>
                    😇 +1000
                  </span>
                </div>
              </div>
            </div>

            {/* Close Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-[#0067c0] hover:bg-[#005fb8] active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
