import React from 'react';
import { Sparkles, Crown, ShieldCheck, Scale, Flame, Skull } from 'lucide-react';

export type RatingTierKey = 'angel' | 'virtuous' | 'neutral' | 'corrupt' | 'devil';

export interface RatingTierInfo {
  key: RatingTierKey;
  nameEn: string;
  nameAr: string;
  iconName: string;
  // Theme styling
  textColor: string;
  bgLight: string;
  borderColor: string;
  barColor: string;
  badgeGradient: string;
  glowColor: string;
}

export function getRatingTier(rating: number = 0): RatingTierInfo {
  // Clamped rating between -1000 and 1000
  const r = Math.max(-1000, Math.min(1000, rating));

  if (r >= 850) {
    return {
      key: 'angel',
      nameEn: 'Angelic / Celestial',
      nameAr: 'ملائكي / نوراني',
      iconName: 'Sparkles',
      textColor: 'text-sky-600',
      bgLight: 'bg-sky-50',
      borderColor: 'border-sky-300',
      barColor: 'bg-sky-400',
      badgeGradient: 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sky-400/30',
      glowColor: 'shadow-[0_0_15px_rgba(56,189,248,0.45)]',
    };
  }

  if (r >= 500) {
    return {
      key: 'virtuous',
      nameEn: 'Noble / Virtuous',
      nameAr: 'نبيل / صالح',
      iconName: 'ShieldCheck',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      barColor: 'bg-emerald-500',
      badgeGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    };
  }

  if (r >= 0) {
    return {
      key: 'neutral',
      nameEn: 'Balanced / Neutral',
      nameAr: 'متوازن / محايد',
      iconName: 'Scale',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-300',
      barColor: 'bg-amber-500',
      badgeGradient: 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-amber-500/25',
      glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    };
  }

  if (r >= -500) {
    return {
      key: 'corrupt',
      nameEn: 'Corrupt / Evil',
      nameAr: 'فاسد / عاصٍ',
      iconName: 'Flame',
      textColor: 'text-rose-600',
      bgLight: 'bg-rose-50',
      borderColor: 'border-rose-300',
      barColor: 'bg-rose-500',
      badgeGradient: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/30',
      glowColor: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    };
  }

  // -500 to -1000
  return {
    key: 'devil',
    nameEn: 'Demonic / Devil',
    nameAr: 'شيطاني / إبليسي',
    iconName: 'Skull',
    textColor: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-300',
    barColor: 'bg-purple-600',
    badgeGradient: 'bg-gradient-to-r from-purple-700 via-indigo-900 to-purple-900 text-white shadow-purple-600/35',
    glowColor: 'shadow-[0_0_20px_rgba(147,51,234,0.45)]',
  };
}

/**
 * Renders the thematic tier icon with appropriate visual cues (e.g. halo effect for Angel, horns/fire aura for Devil)
 */
export function TierIcon({
  tierKey,
  className = 'w-4 h-4',
}: {
  tierKey: RatingTierKey;
  className?: string;
}) {
  switch (tierKey) {
    case 'angel':
      return (
        <span className="relative inline-flex items-center justify-center">
          {/* Angelic Halo ring effect */}
          <span className="absolute -top-1 w-3 h-1 rounded-full border border-sky-400 bg-sky-200/50 animate-pulse pointer-events-none" />
          <Sparkles className={`${className} text-sky-400 fill-sky-200`} />
        </span>
      );
    case 'virtuous':
      return <ShieldCheck className={`${className} text-emerald-500 fill-emerald-100`} />;
    case 'neutral':
      return <Scale className={`${className} text-amber-500`} />;
    case 'corrupt':
      return <Flame className={`${className} text-rose-500 fill-rose-200`} />;
    case 'devil':
      return (
        <span className="relative inline-flex items-center justify-center">
          {/* Subtle devil horn markers */}
          <span className="absolute -top-1 -left-0.5 text-[8px] leading-none text-purple-400 select-none pointer-events-none">▲</span>
          <span className="absolute -top-1 -right-0.5 text-[8px] leading-none text-purple-400 select-none pointer-events-none">▲</span>
          <Skull className={`${className} text-purple-600 fill-purple-200`} />
        </span>
      );
    default:
      return <Crown className={className} />;
  }
}
