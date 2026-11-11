import React from 'react';
import {
  Crown,
  Sparkles,
  Sun,
  ShieldCheck,
  BookOpen,
  Shield,
  Award,
  CheckCircle2,
  Scale,
  Compass,
  AlertCircle,
  Zap,
  TrendingDown,
  Swords,
  Flame,
  Skull,
} from 'lucide-react';

export type RatingTierKey =
  | 'angel'
  | 'luminary'
  | 'reviver'
  | 'virtuous'
  | 'sage'
  | 'guardian'
  | 'honorable'
  | 'commendable'
  | 'neutral'
  | 'disputed'
  | 'flawed'
  | 'errant'
  | 'transgressor'
  | 'corrupt'
  | 'oppressive'
  | 'devil';

export type TierPolarity = 'light' | 'neutral' | 'shadow';

export interface RatingTierInfo {
  key: RatingTierKey;
  rank: number; // 1 (highest +1000) to 16 (lowest -1000)
  polarity: TierPolarity;
  minScore: number;
  maxScore: number;
  presetScore: number;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  iconName: string;
  logoSrc: string;
  logoAltEn: string;
  logoAltAr: string;
  // Theme & badge styling (static literal Tailwind utilities for Tailwind v4 JIT safety)
  textColor: string;
  bgLight: string;
  borderColor: string;
  barColor: string;
  badgeGradient: string;
  glowColor: string;
  // HonorBadge circular emblem ring + halo
  logoRingClass: string;
  logoShadowClass: string;
  // GlowingScoreBadge container & text glow
  scoreContainerClass: string;
  scoreTextGlowClass: string;
  // Quick preset button classes
  presetButtonClass: string;
  // TierIcon semantic colors by context
  iconColoredClass: string;
  iconGlowClass: string;
}

/**
 * 16 finely graduated historical & moral alignment tiers spanning -1000 to +1000.
 * Ordered from highest pinnacle Exemplar (+1000) down to Arch-Tyrant (-1000).
 */
export const RATING_TIERS: readonly RatingTierInfo[] = [
  {
    key: 'angel',
    rank: 1,
    polarity: 'light',
    minScore: 950,
    maxScore: 1000,
    presetScore: 980,
    nameEn: 'Celestial Exemplar',
    nameAr: 'نوراني سامٍ / ملائكي',
    subtitleEn: 'Pinnacle of integrity, prophetic wisdom, and radiant legacy.',
    subtitleAr: 'ذروة الصلاح والنور والقدوة التاريخية الخالدة.',
    iconName: 'Crown',
    logoSrc: '/images/angel_badge.jpg',
    logoAltEn: 'Celestial Exemplar Logo',
    logoAltAr: 'شعار المرتبة النورانية السامية',
    textColor: 'text-sky-900 dark:text-sky-200',
    bgLight: 'bg-sky-50 dark:bg-sky-950/50',
    borderColor: 'border-sky-300 dark:border-sky-500',
    barColor: 'bg-gradient-to-r from-sky-400 to-indigo-500',
    badgeGradient: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_18px_rgba(56,189,248,0.5)]',
    logoRingClass: 'ring-2 ring-sky-300',
    logoShadowClass: 'shadow-[0_0_18px_rgba(56,189,248,0.85),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-sky-400/95 shadow-[0_0_24px_rgba(56,189,248,0.8),0_0_48px_rgba(56,189,248,0.35)] ring-1 ring-sky-300/50 text-sky-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_9px_rgba(56,189,248,0.95)]',
    presetButtonClass: 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 border-sky-300 hover:bg-sky-200',
    iconColoredClass: 'text-sky-600 dark:text-sky-400',
    iconGlowClass: 'text-sky-300',
  },
  {
    key: 'luminary',
    rank: 2,
    polarity: 'light',
    minScore: 850,
    maxScore: 949,
    presetScore: 900,
    nameEn: 'Radiant Luminary',
    nameAr: 'منارة هدى / نجم ساطع',
    subtitleEn: 'Guiding beacon of knowledge, justice, and moral clarity.',
    subtitleAr: 'منارة علم وعدل يسترشد بها الناس عبر العصور.',
    iconName: 'Sparkles',
    logoSrc: '/images/alignments/luminary.jpg',
    logoAltEn: 'Radiant Luminary Logo',
    logoAltAr: 'شعار منارة الهدى',
    textColor: 'text-indigo-900 dark:text-indigo-200',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/50',
    borderColor: 'border-indigo-300 dark:border-indigo-500',
    barColor: 'bg-gradient-to-r from-indigo-500 to-sky-500',
    badgeGradient: 'bg-gradient-to-r from-indigo-500 via-blue-600 to-sky-500 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_16px_rgba(99,102,241,0.45)]',
    logoRingClass: 'ring-2 ring-indigo-300',
    logoShadowClass: 'shadow-[0_0_16px_rgba(99,102,241,0.8),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-indigo-400/90 shadow-[0_0_22px_rgba(99,102,241,0.75),0_0_42px_rgba(99,102,241,0.3)] ring-1 ring-indigo-300/40 text-indigo-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(129,140,248,0.9)]',
    presetButtonClass: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-300 hover:bg-indigo-200',
    iconColoredClass: 'text-indigo-600 dark:text-indigo-400',
    iconGlowClass: 'text-indigo-300',
  },
  {
    key: 'reviver',
    rank: 3,
    polarity: 'light',
    minScore: 750,
    maxScore: 849,
    presetScore: 800,
    nameEn: 'Great Reviver',
    nameAr: 'مجدّد / إمام أمة',
    subtitleEn: 'Visionary reformer reviving faith, scholarship, and society.',
    subtitleAr: 'مجدد عظيم أحيا معالم العلم والنهضة والعدل.',
    iconName: 'Sun',
    logoSrc: '/images/alignments/reviver.jpg',
    logoAltEn: 'Great Reviver Logo',
    logoAltAr: 'شعار المجدد وإمام الأمة',
    textColor: 'text-amber-900 dark:text-amber-200',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-300 dark:border-amber-500',
    barColor: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    badgeGradient: 'bg-gradient-to-r from-amber-500 via-yellow-600 to-orange-500 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_16px_rgba(245,158,11,0.45)]',
    logoRingClass: 'ring-2 ring-amber-300',
    logoShadowClass: 'shadow-[0_0_16px_rgba(245,158,11,0.8),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-amber-400/90 shadow-[0_0_22px_rgba(245,158,11,0.75),0_0_40px_rgba(245,158,11,0.3)] ring-1 ring-amber-300/45 text-amber-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]',
    presetButtonClass: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-300 hover:bg-amber-200',
    iconColoredClass: 'text-amber-600 dark:text-amber-400',
    iconGlowClass: 'text-amber-300',
  },
  {
    key: 'virtuous',
    rank: 4,
    polarity: 'light',
    minScore: 625,
    maxScore: 749,
    presetScore: 690,
    nameEn: 'Islamic Leader',
    nameAr: 'قائد إسلامي / نبيل',
    subtitleEn: 'Noble leadership grounded in principle, honor, and stewardship.',
    subtitleAr: 'قيادة إسلامية نبيلة تجمع بين العدل والهمة والوفاء.',
    iconName: 'ShieldCheck',
    logoSrc: '/images/islamic_leader_badge.jpg',
    logoAltEn: 'Islamic Leader Logo',
    logoAltAr: 'شعار القائد الإسلامي النبيل',
    textColor: 'text-emerald-900 dark:text-emerald-200',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderColor: 'border-emerald-300 dark:border-emerald-500',
    barColor: 'bg-emerald-500',
    badgeGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_16px_rgba(16,185,129,0.4)]',
    logoRingClass: 'ring-2 ring-emerald-400',
    logoShadowClass: 'shadow-[0_0_16px_rgba(16,185,129,0.8),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-emerald-400/90 shadow-[0_0_22px_rgba(16,185,129,0.75),0_0_40px_rgba(16,185,129,0.3)] ring-1 ring-emerald-300/40 text-emerald-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]',
    presetButtonClass: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 hover:bg-emerald-200',
    iconColoredClass: 'text-emerald-600 dark:text-emerald-400',
    iconGlowClass: 'text-emerald-300',
  },
  {
    key: 'sage',
    rank: 5,
    polarity: 'light',
    minScore: 500,
    maxScore: 624,
    presetScore: 560,
    nameEn: 'Wise Scholar',
    nameAr: 'عالم حكيم / فقيه',
    subtitleEn: 'Deep erudition, sound jurisprudence, and lasting scholarship.',
    subtitleAr: 'علم راسخ وحكمة بالغة وإسهام معرفي مرموق.',
    iconName: 'BookOpen',
    logoSrc: '/images/alignments/sage.jpg',
    logoAltEn: 'Wise Scholar Logo',
    logoAltAr: 'شعار العالم الحكيم',
    textColor: 'text-green-900 dark:text-green-200',
    bgLight: 'bg-green-50 dark:bg-green-950/50',
    borderColor: 'border-green-300 dark:border-green-500',
    barColor: 'bg-green-600',
    badgeGradient: 'bg-gradient-to-r from-green-600 to-emerald-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.35)]',
    logoRingClass: 'ring-2 ring-green-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(34,197,94,0.75),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-green-400/90 shadow-[0_0_20px_rgba(34,197,94,0.7),0_0_36px_rgba(34,197,94,0.28)] ring-1 ring-green-300/40 text-green-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(74,222,128,0.85)]',
    presetButtonClass: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 hover:bg-green-200',
    iconColoredClass: 'text-green-600 dark:text-green-400',
    iconGlowClass: 'text-green-300',
  },
  {
    key: 'guardian',
    rank: 6,
    polarity: 'light',
    minScore: 350,
    maxScore: 499,
    presetScore: 420,
    nameEn: 'Steadfast Guardian',
    nameAr: 'حامي الحمى / مرابط',
    subtitleEn: 'Courageous defender upholding dignity, security, and trust.',
    subtitleAr: 'مدافع شجاع صانَ الثغور والكرامة والأمانة.',
    iconName: 'Shield',
    logoSrc: '/images/alignments/guardian.jpg',
    logoAltEn: 'Steadfast Guardian Logo',
    logoAltAr: 'شعار حامي الحمى',
    textColor: 'text-teal-900 dark:text-teal-200',
    bgLight: 'bg-teal-50 dark:bg-teal-950/50',
    borderColor: 'border-teal-300 dark:border-teal-500',
    barColor: 'bg-teal-500',
    badgeGradient: 'bg-gradient-to-r from-teal-600 to-cyan-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]',
    logoRingClass: 'ring-2 ring-teal-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(20,184,166,0.75),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-teal-400/90 shadow-[0_0_20px_rgba(20,184,166,0.7),0_0_35px_rgba(20,184,166,0.3)] ring-1 ring-teal-300/40 text-teal-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(45,212,191,0.85)]',
    presetButtonClass: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-teal-300 hover:bg-teal-200',
    iconColoredClass: 'text-teal-600 dark:text-teal-400',
    iconGlowClass: 'text-teal-300',
  },
  {
    key: 'honorable',
    rank: 7,
    polarity: 'light',
    minScore: 200,
    maxScore: 349,
    presetScore: 270,
    nameEn: 'Honorable Reformer',
    nameAr: 'فاضل / مصلح',
    subtitleEn: 'Principled contributor committed to public good and growth.',
    subtitleAr: 'شخصية فاضلة سعت في الإصلاح وبناء الخير.',
    iconName: 'Award',
    logoSrc: '/images/alignments/honorable.jpg',
    logoAltEn: 'Honorable Reformer Logo',
    logoAltAr: 'شعار الفاضل المصلح',
    textColor: 'text-cyan-900 dark:text-cyan-200',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/50',
    borderColor: 'border-cyan-300 dark:border-cyan-500',
    barColor: 'bg-cyan-500',
    badgeGradient: 'bg-gradient-to-r from-cyan-600 to-sky-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(6,182,212,0.35)]',
    logoRingClass: 'ring-2 ring-cyan-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(6,182,212,0.7),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-cyan-400/90 shadow-[0_0_20px_rgba(6,182,212,0.7),0_0_35px_rgba(6,182,212,0.28)] ring-1 ring-cyan-300/40 text-cyan-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.85)]',
    presetButtonClass: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border-cyan-300 hover:bg-cyan-200',
    iconColoredClass: 'text-cyan-600 dark:text-cyan-400',
    iconGlowClass: 'text-cyan-300',
  },
  {
    key: 'commendable',
    rank: 8,
    polarity: 'light',
    minScore: 50,
    maxScore: 199,
    presetScore: 120,
    nameEn: 'Commendable / Upright',
    nameAr: 'محمود / حميد السيرة',
    subtitleEn: 'Respectable conduct with positive community impact.',
    subtitleAr: 'سيرة محمودة وحضور إيجابي مؤثر.',
    iconName: 'CheckCircle2',
    logoSrc: '/images/alignments/commendable.jpg',
    logoAltEn: 'Commendable Upright Logo',
    logoAltAr: 'شعار حميد السيرة',
    textColor: 'text-blue-900 dark:text-blue-200',
    bgLight: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-300 dark:border-blue-500',
    barColor: 'bg-blue-500',
    badgeGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(59,130,246,0.3)]',
    logoRingClass: 'ring-2 ring-blue-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(59,130,246,0.7),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-blue-400/90 shadow-[0_0_18px_rgba(59,130,246,0.7),0_0_32px_rgba(59,130,246,0.28)] ring-1 ring-blue-300/40 text-blue-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.85)]',
    presetButtonClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 hover:bg-blue-200',
    iconColoredClass: 'text-blue-600 dark:text-blue-400',
    iconGlowClass: 'text-blue-300',
  },
  {
    key: 'neutral',
    rank: 9,
    polarity: 'neutral',
    minScore: -49,
    maxScore: 49,
    presetScore: 0,
    nameEn: 'Balanced / Moderate',
    nameAr: 'متوازن / معتدل',
    subtitleEn: 'Center equilibrium weighing both strengths and human limits.',
    subtitleAr: 'موقع وسط متوازن يجمع بين الصواب والاجتهاد.',
    iconName: 'Scale',
    logoSrc: '/images/alignments/neutral.jpg',
    logoAltEn: 'Balanced Equilibrium Logo',
    logoAltAr: 'شعار التوازن والاعتدال',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    bgLight: 'bg-yellow-50 dark:bg-yellow-950/40',
    borderColor: 'border-yellow-400 dark:border-yellow-500',
    barColor: 'bg-amber-500',
    badgeGradient: 'bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(245,158,11,0.3)]',
    logoRingClass: 'ring-2 ring-amber-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(245,158,11,0.7),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-amber-400/90 shadow-[0_0_18px_rgba(245,158,11,0.65),0_0_32px_rgba(245,158,11,0.28)] ring-1 ring-amber-300/40 text-amber-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]',
    presetButtonClass: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 border-yellow-300 hover:bg-yellow-200',
    iconColoredClass: 'text-amber-600 dark:text-amber-400',
    iconGlowClass: 'text-amber-300',
  },
  {
    key: 'disputed',
    rank: 10,
    polarity: 'shadow',
    minScore: -149,
    maxScore: -50,
    presetScore: -100,
    nameEn: 'Debated / Ambiguous',
    nameAr: 'مختلف فيه / ملتبس',
    subtitleEn: 'Mixed record sparking scholarly debate and scrutiny.',
    subtitleAr: 'سيرة متباينة تثير نقاشاً تاريخياً ومراجعة نقدية.',
    iconName: 'Compass',
    logoSrc: '/images/alignments/disputed.jpg',
    logoAltEn: 'Debated Ambiguous Logo',
    logoAltAr: 'شعار المختلف فيه',
    textColor: 'text-slate-900 dark:text-slate-200',
    bgLight: 'bg-slate-100 dark:bg-slate-800/70',
    borderColor: 'border-slate-400 dark:border-slate-500',
    barColor: 'bg-slate-500',
    badgeGradient: 'bg-gradient-to-r from-slate-600 to-slate-700 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(100,116,139,0.3)]',
    logoRingClass: 'ring-2 ring-slate-300',
    logoShadowClass: 'shadow-[0_0_14px_rgba(148,163,184,0.65),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-slate-400/85 shadow-[0_0_18px_rgba(148,163,184,0.5),0_0_30px_rgba(148,163,184,0.22)] ring-1 ring-slate-300/35 text-slate-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_6px_rgba(203,213,225,0.8)]',
    presetButtonClass: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 hover:bg-slate-300',
    iconColoredClass: 'text-slate-600 dark:text-slate-300',
    iconGlowClass: 'text-slate-300',
  },
  {
    key: 'flawed',
    rank: 11,
    polarity: 'shadow',
    minScore: -299,
    maxScore: -150,
    presetScore: -220,
    nameEn: 'Controversial / Flawed',
    nameAr: 'مثير للجدل / ذو عثرات',
    subtitleEn: 'Notable errors of judgment outweighing sporadic merits.',
    subtitleAr: 'أخطاء واضحة ومواقف متعثرة طغت على جوانب الخير.',
    iconName: 'AlertCircle',
    logoSrc: '/images/alignments/flawed.jpg',
    logoAltEn: 'Controversial Flawed Logo',
    logoAltAr: 'شعار ذو العثرات',
    textColor: 'text-stone-900 dark:text-stone-200',
    bgLight: 'bg-stone-100 dark:bg-stone-800/70',
    borderColor: 'border-stone-400 dark:border-stone-500',
    barColor: 'bg-stone-600',
    badgeGradient: 'bg-gradient-to-r from-zinc-600 to-stone-700 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(120,113,108,0.35)]',
    logoRingClass: 'ring-2 ring-stone-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(168,162,158,0.65),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-stone-400/85 shadow-[0_0_18px_rgba(168,162,158,0.5),0_0_30px_rgba(168,162,158,0.22)] ring-1 ring-stone-300/35 text-stone-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_6px_rgba(214,211,209,0.8)]',
    presetButtonClass: 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-400 hover:bg-stone-300',
    iconColoredClass: 'text-stone-600 dark:text-stone-300',
    iconGlowClass: 'text-stone-300',
  },
  {
    key: 'errant',
    rank: 12,
    polarity: 'shadow',
    minScore: -449,
    maxScore: -300,
    presetScore: -370,
    nameEn: 'Errant / Reckless',
    nameAr: 'منحرف / متجاوز',
    subtitleEn: 'Persistent deviation from justice, truth, and measure.',
    subtitleAr: 'انحراف متكرر عن جادة العدل والانضباط.',
    iconName: 'Zap',
    logoSrc: '/images/alignments/errant.jpg',
    logoAltEn: 'Errant Reckless Logo',
    logoAltAr: 'شعار المتجاوز المنحرف',
    textColor: 'text-orange-900 dark:text-orange-200',
    bgLight: 'bg-orange-50 dark:bg-orange-950/50',
    borderColor: 'border-orange-400 dark:border-orange-500',
    barColor: 'bg-orange-500',
    badgeGradient: 'bg-gradient-to-r from-orange-500 to-amber-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_15px_rgba(249,115,22,0.35)]',
    logoRingClass: 'ring-2 ring-orange-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(249,115,22,0.75),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-orange-400/90 shadow-[0_0_20px_rgba(249,115,22,0.7),0_0_35px_rgba(249,115,22,0.3)] ring-1 ring-orange-300/40 text-orange-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.85)]',
    presetButtonClass: 'bg-orange-100 dark:bg-orange-900/50 text-orange-900 dark:text-orange-200 border-orange-300 hover:bg-orange-200',
    iconColoredClass: 'text-orange-600 dark:text-orange-400',
    iconGlowClass: 'text-orange-300',
  },
  {
    key: 'transgressor',
    rank: 13,
    polarity: 'shadow',
    minScore: -599,
    maxScore: -450,
    presetScore: -520,
    nameEn: 'Transgressor / Sower of Strife',
    nameAr: 'باغٍ / مثير للفتن',
    subtitleEn: 'Spreading division, deception, and willful transgression.',
    subtitleAr: 'نشر الشقاق والفتنة والتعدي المتعمد على الحدود.',
    iconName: 'TrendingDown',
    logoSrc: '/images/alignments/transgressor.jpg',
    logoAltEn: 'Transgressor Strife Logo',
    logoAltAr: 'شعار الباغي ومثير الفتن',
    textColor: 'text-red-900 dark:text-red-200',
    bgLight: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-400 dark:border-red-500',
    barColor: 'bg-gradient-to-r from-orange-600 to-red-600',
    badgeGradient: 'bg-gradient-to-r from-orange-600 to-red-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.38)]',
    logoRingClass: 'ring-2 ring-red-400',
    logoShadowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.75),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-red-400/90 shadow-[0_0_20px_rgba(239,68,68,0.72),0_0_38px_rgba(239,68,68,0.3)] ring-1 ring-red-300/40 text-red-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(248,113,113,0.9)]',
    presetButtonClass: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 hover:bg-red-200',
    iconColoredClass: 'text-red-600 dark:text-red-400',
    iconGlowClass: 'text-red-300',
  },
  {
    key: 'corrupt',
    rank: 14,
    polarity: 'shadow',
    minScore: -749,
    maxScore: -600,
    presetScore: -670,
    nameEn: 'Corrupt / Unjust',
    nameAr: 'فاسد / ظالم',
    subtitleEn: 'Abuse of authority, betrayal of trust, and systemic harm.',
    subtitleAr: 'استغلال السلطة وخيانة الأمانة وإلحاق الضرر بالعباد.',
    iconName: 'Swords',
    logoSrc: '/images/alignments/corrupt.jpg',
    logoAltEn: 'Corrupt Unjust Logo',
    logoAltAr: 'شعار الفاسد الظالم',
    textColor: 'text-rose-900 dark:text-rose-200',
    bgLight: 'bg-rose-50 dark:bg-rose-950/50',
    borderColor: 'border-rose-400 dark:border-rose-500',
    barColor: 'bg-rose-600',
    badgeGradient: 'bg-gradient-to-r from-rose-600 to-red-700 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_16px_rgba(225,29,72,0.4)]',
    logoRingClass: 'ring-2 ring-rose-500',
    logoShadowClass: 'shadow-[0_0_16px_rgba(225,29,72,0.8),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-rose-500/90 shadow-[0_0_22px_rgba(225,29,72,0.75),0_0_40px_rgba(225,29,72,0.32)] ring-1 ring-rose-400/40 text-rose-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(251,113,133,0.9)]',
    presetButtonClass: 'bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 border-rose-300 hover:bg-rose-200',
    iconColoredClass: 'text-rose-600 dark:text-rose-400',
    iconGlowClass: 'text-rose-300',
  },
  {
    key: 'oppressive',
    rank: 15,
    polarity: 'shadow',
    minScore: -899,
    maxScore: -750,
    presetScore: -820,
    nameEn: 'Oppressive / Ruthless',
    nameAr: 'جائر / مستبد',
    subtitleEn: 'Cruel tyranny, bloodshed, and willful suppression of truth.',
    subtitleAr: 'بطش شديد وطغيان سافر وسحق للحقوق.',
    iconName: 'Flame',
    logoSrc: '/images/alignments/oppressive.jpg',
    logoAltEn: 'Oppressive Ruthless Logo',
    logoAltAr: 'شعار الجائر المستبد',
    textColor: 'text-fuchsia-950 dark:text-rose-200',
    bgLight: 'bg-rose-100/80 dark:bg-rose-950/60',
    borderColor: 'border-rose-500 dark:border-rose-600',
    barColor: 'bg-gradient-to-r from-red-700 to-rose-800',
    badgeGradient: 'bg-gradient-to-r from-red-700 via-rose-800 to-fuchsia-900 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_18px_rgba(190,18,60,0.45)]',
    logoRingClass: 'ring-2 ring-red-500',
    logoShadowClass: 'shadow-[0_0_18px_rgba(220,38,38,0.85),0_4px_12px_rgba(0,0,0,0.8)]',
    scoreContainerClass:
      'bg-slate-950/95 border border-red-500/95 shadow-[0_0_24px_rgba(220,38,38,0.8),0_0_46px_rgba(190,18,60,0.4)] ring-1 ring-red-400/50 text-rose-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_9px_rgba(244,63,94,0.95)]',
    presetButtonClass: 'bg-rose-200 dark:bg-rose-900/60 text-rose-950 dark:text-rose-100 border-rose-400 hover:bg-rose-300',
    iconColoredClass: 'text-red-700 dark:text-rose-400',
    iconGlowClass: 'text-rose-400',
  },
  {
    key: 'devil',
    rank: 16,
    polarity: 'shadow',
    minScore: -1000,
    maxScore: -900,
    presetScore: -950,
    nameEn: 'Arch-Tyrant / Demonic',
    nameAr: 'طاغية عاتٍ / شيطاني',
    subtitleEn: 'Absolute abyss of cruelty, arrogance, and historical infamy.',
    subtitleAr: 'أقصى درجات العتو والاستكبار والإفساد في التاريخ.',
    iconName: 'Skull',
    logoSrc: '/images/alignments/devil.jpg',
    logoAltEn: 'Arch-Tyrant Demonic Logo',
    logoAltAr: 'شعار الطاغية العاتي',
    textColor: 'text-purple-950 dark:text-purple-200',
    bgLight: 'bg-purple-100 dark:bg-purple-950/60',
    borderColor: 'border-purple-400 dark:border-purple-500',
    barColor: 'bg-gradient-to-r from-purple-700 to-indigo-950',
    badgeGradient: 'bg-gradient-to-r from-purple-700 via-fuchsia-900 to-slate-950 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_22px_rgba(147,51,234,0.5)]',
    logoRingClass: 'ring-2 ring-purple-400',
    logoShadowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.9),0_4px_14px_rgba(0,0,0,0.85)]',
    scoreContainerClass:
      'bg-slate-950/95 border border-purple-500/95 shadow-[0_0_26px_rgba(168,85,247,0.88),0_0_55px_rgba(168,85,247,0.45)] ring-1 ring-purple-400/55 text-purple-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_10px_rgba(192,132,252,1)]',
    presetButtonClass: 'bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-200 border-purple-300 hover:bg-purple-200',
    iconColoredClass: 'text-purple-700 dark:text-purple-400',
    iconGlowClass: 'text-purple-300',
  },
] as const;

export const RATING_TIERS_MAP: Record<RatingTierKey, RatingTierInfo> = RATING_TIERS.reduce(
  (acc, tier) => {
    acc[tier.key] = tier;
    return acc;
  },
  {} as Record<RatingTierKey, RatingTierInfo>
);

/**
 * Maps moral alignment score (-1000 to +1000) into one of the 16 Alignment Tiers.
 */
export function getRatingTier(rating: number = 0): RatingTierInfo {
  const r = Math.max(-1000, Math.min(1000, Number(rating) || 0));
  for (const tier of RATING_TIERS) {
    if (r >= tier.minScore) {
      return tier;
    }
  }
  return RATING_TIERS[RATING_TIERS.length - 1];
}

export function getRatingTierByKey(key: RatingTierKey): RatingTierInfo {
  return RATING_TIERS_MAP[key] || RATING_TIERS[8];
}

export function formatTierRange(tier: RatingTierInfo, isAr: boolean = false): string {
  const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  return isAr
    ? `من ${fmt(tier.minScore)} إلى ${fmt(tier.maxScore)}`
    : `${fmt(tier.minScore)} to ${fmt(tier.maxScore)}`;
}

/**
 * Renders the crisp Lucide thematic icon unique to each of the 16 alignment tiers.
 */
export function TierIcon({
  tierKey,
  className = 'w-4 h-4',
  tone = 'colored',
}: {
  tierKey: RatingTierKey;
  className?: string;
  tone?: 'colored' | 'on-badge' | 'glow';
}) {
  const tier = getRatingTierByKey(tierKey);
  const colorClass =
    tone === 'on-badge'
      ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]'
      : tone === 'glow'
        ? tier.iconGlowClass
        : tier.iconColoredClass;

  const combined = `${className} ${colorClass}`;

  switch (tierKey) {
    case 'angel':
      return <Crown className={combined} />;
    case 'luminary':
      return <Sparkles className={combined} />;
    case 'reviver':
      return <Sun className={combined} />;
    case 'virtuous':
      return <ShieldCheck className={combined} />;
    case 'sage':
      return <BookOpen className={combined} />;
    case 'guardian':
      return <Shield className={combined} />;
    case 'honorable':
      return <Award className={combined} />;
    case 'commendable':
      return <CheckCircle2 className={combined} />;
    case 'neutral':
      return <Scale className={combined} />;
    case 'disputed':
      return <Compass className={combined} />;
    case 'flawed':
      return <AlertCircle className={combined} />;
    case 'errant':
      return <Zap className={combined} />;
    case 'transgressor':
      return <TrendingDown className={combined} />;
    case 'corrupt':
      return <Swords className={combined} />;
    case 'oppressive':
      return <Flame className={combined} />;
    case 'devil':
      return <Skull className={combined} />;
    default:
      return <Crown className={combined} />;
  }
}
