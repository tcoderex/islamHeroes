'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Clock, Volume2, MessageSquare, Crown, Skull, Compass, Sun, Flame } from 'lucide-react';
import { getRatingTier, TierIcon, formatTierRange } from '@/lib/ratingTiers';
import { CHENGUM_SHEET } from '@/lib/motionPresets';
import HonorBadge from '@/components/HonorBadge';
import GlowingScoreBadge from '@/components/GlowingScoreBadge';
import Super3DBadge from '@/components/Super3DBadge';
import BadgeInfoModal from '@/components/BadgeInfoModal';
import AlignmentTiersModal from '@/components/AlignmentTiersModal';
import CharacterStatsCard from '@/components/CharacterStatsCard';
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
  const isHeaven = rating >= 0;
  const realmBackdropSrc = isHeaven
    ? '/images/previews/heaven_bg.jpg'
    : '/images/previews/hell_bg.jpg';

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
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 backdrop-blur-md overflow-y-auto overscroll-contain ${
        isHeaven
          ? 'bg-sky-950/75'
          : 'bg-rose-950/82'
      }`}
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={CHENGUM_SHEET}
        className={`relative w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl rounded-t-3xl sm:rounded-3xl border overflow-hidden sm:my-auto max-h-[92dvh] flex flex-col md:flex-row ${
          isHeaven
            ? 'border-sky-300/45 shadow-[0_28px_80px_rgba(14,165,233,0.35)] bg-slate-950'
            : 'border-rose-500/45 shadow-[0_28px_80px_rgba(225,29,72,0.42)] bg-[#110506]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1 rounded-full bg-white/30 mx-auto mt-2.5 mb-0.5 shrink-0 relative z-30" aria-hidden="true" />
        {/* Full-Card Heaven / Hell Environmental Backdrop Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none select-none"
          style={{ backgroundImage: `url('${realmBackdropSrc}')` }}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 pointer-events-none ${
            isHeaven
              ? 'bg-gradient-to-br from-sky-950/65 via-slate-950/75 to-indigo-950/88'
              : 'bg-gradient-to-br from-[#1f0608]/72 via-[#120405]/82 to-black/92'
          }`}
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className={`absolute top-3 z-30 p-2 rounded-full bg-slate-950/75 hover:bg-slate-900 text-white border border-white/20 transition-colors cursor-pointer shadow-md ${
            isAr ? 'left-3' : 'right-3'
          }`}
          title={isAr ? 'إغلاق' : 'Close'}
          aria-label={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Portrait Column: Framed inside Heaven or Hell atmosphere */}
        <div className="relative z-10 w-full md:w-5/12 h-64 sm:h-72 md:h-auto md:min-h-[440px] flex items-center justify-center overflow-hidden p-3 select-none shrink-0">
          {/* Realm Atmosphere Indicator Top-Center (clean typographic readout, no pill box) */}
          <div
            className={`absolute bottom-3 right-3 z-30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md border shadow-md ${
              isHeaven
                ? 'bg-sky-950/80 border-sky-300/40 text-amber-200'
                : 'bg-rose-950/85 border-rose-500/45 text-rose-200'
            }`}
          >
            {isHeaven ? (
              <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            )}
            <span>{isAr ? (isHeaven ? 'أفق النور والجنة' : 'أفق الجحيم والوعيد') : isHeaven ? 'Heaven Aura' : 'Hell Aura'}</span>
          </div>

          {/* Top-Left Alignment Logo (Clickable to view all 32 alignments) */}
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
            <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden border border-white/25 shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={character.picture}
                alt={character.name}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                style={parseImagePosition(character.imagePosition || '50% 20%')}
                className="w-full h-full object-cover"
              />
              {/* Subtle Heaven/Hell vignette rim on the portrait */}
              <div
                className={`absolute inset-0 pointer-events-none ${
                  isHeaven
                    ? 'shadow-[inset_0_0_28px_rgba(56,189,248,0.28)]'
                    : 'shadow-[inset_0_0_32px_rgba(225,29,72,0.42)]'
                }`}
              />
            </div>
          ) : (
            <div className="relative z-10 w-full h-full rounded-2xl border border-white/20 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white py-8">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-2 ${
                  isHeaven
                    ? 'bg-gradient-to-br from-sky-500 to-amber-400'
                    : 'bg-gradient-to-br from-rose-700 to-orange-600'
                }`}
              >
                <span className="text-3xl font-bold font-serif text-white select-none">
                  {displayName.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-slate-300">
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

        {/* Right Details Column: High-contrast frosted pane over Heaven / Hell scenery */}
        <div className="relative z-10 p-4 sm:p-5 md:p-6 space-y-4 flex-1 overflow-y-auto flex flex-col justify-between text-white">
          <div className="space-y-4">
            {/* Header: Name, Audio, Alignment Tier */}
            <div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
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
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      isSpeaking
                        ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
                    }`}
                    title={isAr ? 'قراءة الاسم صوتياً بالعربية' : 'Pronounce name in Arabic'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Clickable Alignment Button */}
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
                    title={isAr ? 'اضغط لعرض دليل المراتب الـ32' : 'Click to view all 32 alignment tiers'}
                  >
                    <TierIcon tierKey={tier.key} tone="on-badge" className="w-3.5 h-3.5" />
                    <span>{isAr ? tier.nameAr : tier.nameEn}</span>
                  </button>
                </div>
              </div>

              {/* Clean typographic secondary metadata with separators */}
              {(character.secondaryName || showTitle || character.era) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  {character.secondaryName && (
                    <span className="font-serif text-slate-200">{character.secondaryName}</span>
                  )}
                  {character.secondaryName && (showTitle || character.era) && (
                    <span aria-hidden="true" className="opacity-45">·</span>
                  )}
                  {showTitle && (
                    <span className="font-semibold text-amber-300">{character.title}</span>
                  )}
                  {showTitle && character.era && (
                    <span aria-hidden="true" className="opacity-45">·</span>
                  )}
                  {character.era && (
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{character.era}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Alignment Summary & Spectrum Bar */}
            <div
              className={`p-3.5 rounded-2xl border backdrop-blur-md space-y-2.5 ${
                isHeaven
                  ? 'bg-slate-950/60 border-sky-300/25'
                  : 'bg-black/65 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <HonorBadge
                    rating={rating}
                    isAr={isAr}
                    size="sm"
                    onClick={() => setShowTierGuide(true)}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <TierIcon tierKey={tier.key} tone="glow" className="w-4 h-4 shrink-0" />
                      <span className="truncate">{isAr ? tier.nameAr : tier.nameEn}</span>
                    </span>
                    <span className="text-[11px] text-slate-300 block truncate font-mono tabular-nums">
                      {isAr
                        ? `الرتبة #${tier.rank} من 32 · ${formatTierRange(tier, true)}`
                        : `Rank #${tier.rank}/32 · ${formatTierRange(tier, false)}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 font-mono tabular-nums shrink-0">
                  <span className={`text-lg font-black tracking-tight ${isHeaven ? 'text-sky-300' : 'text-rose-400'}`}>
                    {rating > 0 ? `+${rating}` : rating}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">/ 1000</span>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {isAr ? tier.subtitleAr : tier.subtitleEn}
              </p>

              {character.summary && (
                <p className="text-xs sm:text-[13px] text-slate-100 leading-relaxed bg-white/10 p-2.5 rounded-xl border border-white/15">
                  {character.summary}
                </p>
              )}

              {/* Spectrum Meter (-1000 to +1000) */}
              <div className="space-y-1 pt-0.5">
                <div className="relative w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5">
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-r from-purple-700 via-rose-500 via-amber-400 via-emerald-500 to-sky-400"
                    aria-hidden="true"
                  />
                  <div
                    className={`relative z-10 h-full rounded-full transition-all duration-300 ${tier.barColor}`}
                    style={{ width: `${Math.max(4, Math.min(100, ratingPercent))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono tabular-nums px-0.5 text-slate-300">
                  <span
                    className="text-rose-400 font-semibold inline-flex items-center gap-0.5"
                    title={isAr ? 'طاغية عاتٍ (-1000)' : 'Arch-Tyrant (-1000)'}
                  >
                    <Skull className="w-3 h-3" />
                    <span>-1000</span>
                  </span>
                  <span>-500</span>
                  <span className="text-amber-300 font-semibold">0</span>
                  <span>+500</span>
                  <span
                    className="text-sky-300 font-semibold inline-flex items-center gap-0.5"
                    title={isAr ? 'نوراني سامٍ (+1000)' : 'Celestial Exemplar (+1000)'}
                  >
                    <span>+1000</span>
                    <Crown className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Score-Derived Random Curve & Blurred Abilities Statistics */}
            <CharacterStatsCard
              characterId={character.id}
              rating={rating}
              isAr={isAr}
            />
          </div>

          {/* Footer Action Row */}
          <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenComments?.(character);
                }}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? 'التعليقات' : 'Comments'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTierGuide(true)}
                className="px-4 py-2 text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                title={isAr ? 'دليل المراتب والشارات (32)' : 'View all 32 Alignment Tiers'}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? 'المراتب (32)' : '32 Tiers'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className={`w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap ${
                isHeaven
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isAr ? 'إغلاق' : 'Close Preview'}
            </button>
          </div>
        </div>
      </motion.div>

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

      {/* Interactive 32 Alignment Tiers Explorer Modal */}
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
