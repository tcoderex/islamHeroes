import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  Scale,
  AlertCircle,
  TrendingDown,
  Flame,
  Skull,
  Crown,
} from 'lucide-react';

export type RatingTierKey =
  | 'angel'
  | 'virtuous'
  | 'honorable'
  | 'commendable'
  | 'neutral'
  | 'flawed'
  | 'errant'
  | 'oppressive'
  | 'devil';

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

/**
 * Maps moral alignment score (-1000 to +1000) into nuanced, accurate historical classes.
 * High-contrast, clean colors without murky grey or washed-out backgrounds.
 */
export function getRatingTier(rating: number = 0): RatingTierInfo {
  const r = Math.max(-1000, Math.min(1000, Number(rating) || 0));

  // 1. +850 to +1000: Angelic / Celestial
  if (r >= 850) {
    return {
      key: 'angel',
      nameEn: 'Celestial / Angelic',
      nameAr: 'ملائكي / نوراني',
      iconName: 'Sparkles',
      textColor: 'text-sky-800 dark:text-sky-200',
      bgLight: 'bg-sky-100 dark:bg-sky-900/50',
      borderColor: 'border-sky-300 dark:border-sky-500',
      barColor: 'bg-sky-500',
      badgeGradient: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(56,189,248,0.45)]',
    };
  }

  // 2. +600 to +849: Noble / Virtuous
  if (r >= 600) {
    return {
      key: 'virtuous',
      nameEn: 'Noble / Virtuous',
      nameAr: 'نبيل / صالح',
      iconName: 'ShieldCheck',
      textColor: 'text-emerald-800 dark:text-emerald-200',
      bgLight: 'bg-emerald-100 dark:bg-emerald-900/50',
      borderColor: 'border-emerald-300 dark:border-emerald-500',
      barColor: 'bg-emerald-500',
      badgeGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    };
  }

  // 3. +300 to +599: Honorable / Reformer
  if (r >= 300) {
    return {
      key: 'honorable',
      nameEn: 'Honorable / Reformer',
      nameAr: 'فاضل / مصلح',
      iconName: 'Award',
      textColor: 'text-teal-800 dark:text-teal-200',
      bgLight: 'bg-teal-100 dark:bg-teal-900/50',
      borderColor: 'border-teal-300 dark:border-teal-500',
      barColor: 'bg-teal-500',
      badgeGradient: 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]',
    };
  }

  // 4. +50 to +299: Commendable / Good
  if (r >= 50) {
    return {
      key: 'commendable',
      nameEn: 'Commendable / Good',
      nameAr: 'محمود / حميد السيرة',
      iconName: 'CheckCircle2',
      textColor: 'text-blue-800 dark:text-blue-200',
      bgLight: 'bg-blue-100 dark:bg-blue-900/50',
      borderColor: 'border-blue-300 dark:border-blue-500',
      barColor: 'bg-blue-500',
      badgeGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    };
  }

  // 5. -49 to +49: Balanced / Moderate (e.g. -30, 0, +25) - Clear golden gradient with crisp white text
  if (r >= -49) {
    return {
      key: 'neutral',
      nameEn: 'Balanced / Moderate',
      nameAr: 'متوازن / معتدل',
      iconName: 'Scale',
      textColor: 'text-amber-900 dark:text-amber-100',
      bgLight: 'bg-amber-100 dark:bg-amber-900/50',
      borderColor: 'border-amber-400 dark:border-amber-500',
      barColor: 'bg-amber-500',
      badgeGradient: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    };
  }

  // 6. -50 to -200: Controversial / Flawed - Crisp slate with white text (NOT muddy brown)
  if (r >= -200) {
    return {
      key: 'flawed',
      nameEn: 'Controversial / Flawed',
      nameAr: 'مثير للجدل / ذو عثرات',
      iconName: 'AlertCircle',
      textColor: 'text-slate-900 dark:text-slate-100',
      bgLight: 'bg-slate-200 dark:bg-slate-800',
      borderColor: 'border-slate-400 dark:border-slate-600',
      barColor: 'bg-slate-500',
      badgeGradient: 'bg-gradient-to-r from-slate-600 to-zinc-700 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(100,116,139,0.3)]',
    };
  }

  // 7. -201 to -450: Errant / Problematic
  if (r >= -450) {
    return {
      key: 'errant',
      nameEn: 'Errant / Transgressor',
      nameAr: 'عاثر / متجاوز',
      iconName: 'TrendingDown',
      textColor: 'text-orange-900 dark:text-orange-100',
      bgLight: 'bg-orange-100 dark:bg-orange-900/50',
      borderColor: 'border-orange-400 dark:border-orange-500',
      barColor: 'bg-orange-500',
      badgeGradient: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(249,115,22,0.35)]',
    };
  }

  // 8. -451 to -750: Oppressive / Corrupt
  if (r >= -750) {
    return {
      key: 'oppressive',
      nameEn: 'Oppressive / Corrupt',
      nameAr: 'جائر / فاسد',
      iconName: 'Flame',
      textColor: 'text-rose-900 dark:text-rose-100',
      bgLight: 'bg-rose-100 dark:bg-rose-900/50',
      borderColor: 'border-rose-400 dark:border-rose-500',
      barColor: 'bg-rose-500',
      badgeGradient: 'bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold shadow-xs',
      glowColor: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    };
  }

  // 9. -751 to -1000: Demonic / Arch-Tyrant
  return {
    key: 'devil',
    nameEn: 'Demonic / Tyrant',
    nameAr: 'شيطاني / طاغية',
    iconName: 'Skull',
    textColor: 'text-purple-900 dark:text-purple-100',
    bgLight: 'bg-purple-100 dark:bg-purple-900/50',
    borderColor: 'border-purple-400 dark:border-purple-500',
    barColor: 'bg-purple-600',
    badgeGradient: 'bg-gradient-to-r from-purple-700 via-indigo-900 to-purple-900 text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_20px_rgba(147,51,234,0.45)]',
  };
}

/**
 * Renders the thematic tier icon with appropriate visual cues
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
          <span className="absolute -top-1 w-3 h-1 rounded-full border border-sky-400 bg-sky-200/50 animate-pulse pointer-events-none" />
          <Sparkles className={`${className} text-sky-400 fill-sky-200`} />
        </span>
      );
    case 'virtuous':
      return <ShieldCheck className={`${className} text-emerald-500 fill-emerald-100`} />;
    case 'honorable':
      return <Award className={`${className} text-teal-500 fill-teal-100`} />;
    case 'commendable':
      return <CheckCircle2 className={`${className} text-blue-500 fill-blue-100`} />;
    case 'neutral':
      return <Scale className={`${className} text-amber-500`} />;
    case 'flawed':
      return <AlertCircle className={`${className} text-slate-300`} />;
    case 'errant':
      return <TrendingDown className={`${className} text-orange-400`} />;
    case 'oppressive':
      return <Flame className={`${className} text-rose-500 fill-rose-200`} />;
    case 'devil':
      return (
        <span className="relative inline-flex items-center justify-center">
          <span className="absolute -top-1 -left-0.5 text-[8px] leading-none text-purple-400 select-none pointer-events-none">▲</span>
          <span className="absolute -top-1 -right-0.5 text-[8px] leading-none text-purple-400 select-none pointer-events-none">▲</span>
          <Skull className={`${className} text-purple-500 fill-purple-200`} />
        </span>
      );
    default:
      return <Crown className={className} />;
  }
}
