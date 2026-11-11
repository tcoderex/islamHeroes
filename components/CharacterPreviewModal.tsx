'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Volume2, MessageSquare, Crown, Skull, Compass } from 'lucide-react';
import { getRatingTier, TierIcon, formatTierRange } from '@/lib/ratingTiers';
import HonorBadge from '@/components/HonorBadge';
import GlowingScoreBadge from '@/components/GlowingScoreBadge';
import Super3DBadge from '@/components/Super3DBadge';
import BadgeInfoModal from '@/components/BadgeInfoModal';
import AlignmentTiersModal from '@/components/AlignmentTiersModal';
import { speakInArabic, stopArabicSpeech, getLocalizedCharacterName } from '@/lib/arabicTransliteration';
import { parseImagePosition } from '@/lib/imagePosition';
import RedXOverlay from '@/components/RedXOverlay';
import { AppTheme } from '@/lib/theme';

export interface PreviewableCharacter {
  id: string;
  name: string;
  rawName?: string;
  secondaryName?: string;
  title?: string;
  era?: string;
  summary?: string;
  picture?: string;
  rating?: number; // -1000 to 1000
  imagePosition?: string;
  badgeId?: string;
  hideRedX?: boolean;
}

interface CharacterPreviewModalProps {
  character: PreviewableCharacter | null;
  onClose: () => void;
  isAr: boolean;
  onOpenComments?: (character: PreviewableCharacter) => void;
  isAdmin?: boolean;
  onOpenBadgePicker?: (character: PreviewableCharacter) => void;
  redXGlobalEnabled?: boolean;
  theme?: AppTheme;
}

export default function CharacterPreviewModal({
  character,
  onClose,
  isAr,
  onOpenComments,
  isAdmin = false,
  onOpenBadgePicker,
  redXGlobalEnabled = true,
  theme = 'tgis',
}: CharacterPreviewModalProps) {
  const [imgError, setImgError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);
  const [showTierGuide, setShowTierGuide] = useState(false);

  const activeCharId = character?.id ?? null;

  useEffect(() => {
    stopArabicSpeech();
    return () => {
      stopArabicSpeech();
    };
  }, [activeCharId]);

  const handleClose = () => {
    stopArabicSpeech();
    setIsSpeaking(false);
    onClose();
  };

  if (!character) return null;

  const displayName = getLocalizedCharacterName(character.name, isAr);
  const speechName = getLocalizedCharacterName(character.rawName || character.name, true);
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
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_24px_60px_rgba(0,103,192,0.18)] overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className={`absolute top-3 z-30 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-colors cursor-pointer shadow-md ${
            isAr ? 'left-3' : 'right-3'
          }`}
          title={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Uncropped Photo Viewport: Image fits fully without zooming or cropping */}
        <div className="relative w-full md:w-5/12 h-56 sm:h-64 md:h-auto md:min-h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden p-2 select-none shrink-0">
          {/* Top-Left Alignment Logo (Clickable to view all 16 alignments) */}
          <HonorBadge
            rating={rating}
            isAr={isAr}
            size="md"
            onClick={() => setShowTierGuide(true)}
            className="absolute top-3 left-3 z-30"
          />

          {/* Top-Right Glowing Score Badge */}
          <GlowingScoreBadge
            rating={rating}
            size="lg"
            className="absolute top-3 right-3 z-30"
          />

          {/* Bottom-Left 3D Islamic Honor Badge */}
          {character.badgeId && (
            <Super3DBadge
              badgeId={character.badgeId}
              isAr={isAr}
              size="lg"
              className="absolute bottom-3 left-3 z-30 animate-[badge-float_4s_ease-in-out_infinite]"
              isAdmin={isAdmin}
              onClick={() => setShowBadgeInfo(true)}
            />
          )}

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
                style={parseImagePosition(character.imagePosition || '50% 20%')}
                className="relative z-10 w-full h-full object-cover rounded-lg drop-shadow-md"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-white py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0067c0] to-sky-400 flex items-center justify-center shadow-md mb-2">
                <span className="text-3xl font-bold font-serif text-white select-none">
                  {displayName.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {isAr ? 'لا توجد صورة' : 'No photo uploaded'}
              </span>
            </div>
          )}

          {/* Progressive Red X Overlay for ratings 0 to -1000 */}
          <RedXOverlay
            rating={rating}
            hidden={Boolean(character.hideRedX)}
            globalEnabled={redXGlobalEnabled}
            size="lg"
            className="z-20"
          />
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 md:p-6 space-y-4 flex-1 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header: Name, Secondary Name, and Tier Badge + Honor Badge */}
            <div className="mb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                    {displayName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) {
                        stopArabicSpeech();
                        setIsSpeaking(false);
                        return;
                      }
                      stopArabicSpeech();
                      setIsSpeaking(true);
                      speakInArabic(speechName || displayName, () => {
                        setIsSpeaking(false);
                      });
                    }}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-[#0067c0] border-slate-200'
                    }`}
                    title={isAr ? 'قراءة الاسم صوتياً بالعربية' : 'Pronounce name in Arabic'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Thematic Tier Badge Pill & Alignment Logo */}
                <div className="flex items-center gap-2 shrink-0">
                  <HonorBadge
                    rating={rating}
                    isAr={isAr}
                    size="sm"
                    onClick={() => setShowTierGuide(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTierGuide(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs cursor-pointer transition-transform hover:scale-105 ${tier.badgeGradient}`}
                    title={isAr ? 'اضغط لعرض دليل المراتب الـ16' : 'Click to view all 16 alignment tiers'}
                  >
                    <TierIcon tierKey={tier.key} tone="on-badge" className="w-3.5 h-3.5" />
                    <span>{isAr ? tier.nameAr : tier.nameEn}</span>
                  </button>
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <HonorBadge
                    rating={rating}
                    isAr={isAr}
                    size="sm"
                    onClick={() => setShowTierGuide(true)}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <TierIcon tierKey={tier.key} tone="colored" className="w-4 h-4 shrink-0" />
                      <span className="truncate">{isAr ? tier.nameAr : tier.nameEn}</span>
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block truncate">
                      {isAr ? `الرتبة #${tier.rank} · ${formatTierRange(tier, true)}` : `Rank #${tier.rank} · ${formatTierRange(tier, false)}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 font-mono shrink-0">
                  <span className={`text-lg font-black tracking-tight ${tier.textColor}`}>
                    {rating > 0 ? `+${rating}` : rating}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    / 1000
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr ? tier.subtitleAr : tier.subtitleEn}
              </p>

              {/* Character's actual description */}
              {character.summary && (
                <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  {character.summary}
                </p>
              )}

              {/* Dynamic Tier Progress Bar across the full 16-tier spectrum */}
              <div className="space-y-1 pt-1">
                <div className="relative w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-r from-purple-700 via-rose-500 via-amber-400 via-emerald-500 to-sky-400"
                    aria-hidden="true"
                  />

                  {/* Active fill */}
                  <div
                    className={`relative z-10 h-full rounded-full transition-all duration-300 ${tier.barColor}`}
                    style={{ width: `${Math.max(4, Math.min(100, ratingPercent))}%` }}
                  />
                </div>

                {/* Range Labels with Lucide icons */}
                <div className="flex justify-between items-center text-[10px] font-mono px-0.5 text-slate-500">
                  <span
                    className="text-purple-700 font-semibold inline-flex items-center gap-0.5"
                    title={isAr ? 'طاغية عاتٍ (-1000)' : 'Arch-Tyrant (-1000)'}
                  >
                    <Skull className="w-3 h-3" />
                    <span>-1000</span>
                  </span>
                  <span className="text-rose-600 font-semibold">-500</span>
                  <span className="text-amber-600 font-semibold">0</span>
                  <span className="text-emerald-600 font-semibold">+500</span>
                  <span
                    className="text-sky-600 font-semibold inline-flex items-center gap-0.5"
                    title={isAr ? 'نوراني سامٍ (+1000)' : 'Celestial Exemplar (+1000)'}
                  >
                    <span>+1000</span>
                    <Crown className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Community Comments, 16-Tier Guide & Close Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenComments?.(character);
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-[#0067c0] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isAr ? 'التعليقات' : 'Comments'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTierGuide(true)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title={isAr ? 'دليل المراتب والشارات (16)' : 'View all 16 Alignment Tiers'}
                >
                  <Compass className="w-3.5 h-3.5 text-[#0067c0]" />
                  <span>{isAr ? 'المراتب (16)' : '16 Tiers'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-[#0067c0] hover:bg-[#005fb8] active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Badge Information Modal */}
      {character.badgeId && (
        <BadgeInfoModal
          isOpen={showBadgeInfo}
          onClose={() => setShowBadgeInfo(false)}
          badgeId={character.badgeId}
          characterName={displayName}
          characterPicture={character.picture}
          characterRating={character.rating}
          isAr={isAr}
          isAdmin={isAdmin}
          onOpenPicker={
            onOpenBadgePicker
              ? () => {
                  setShowBadgeInfo(false);
                  onOpenBadgePicker(character);
                }
              : undefined
          }
        />
      )}

      {/* Interactive 16 Alignment Tiers Explorer Modal */}
      <AlignmentTiersModal
        isOpen={showTierGuide}
        onClose={() => setShowTierGuide(false)}
        isAr={isAr}
        theme={theme}
        focusedRating={rating}
      />
    </div>
  );
}
