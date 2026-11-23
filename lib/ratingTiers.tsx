import React from 'react';
import {
  Crown,
  SunMedium,
  Sparkles,
  Sunrise,
  Sun,
  Trophy,
  ShieldCheck,
  Landmark,
  BookOpen,
  ScrollText,
  Shield,
  Medal,
  Award,
  HeartHandshake,
  CheckCircle2,
  Leaf,
  Hourglass,
  Scale,
  Compass,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Zap,
  CloudLightning,
  TrendingDown,
  GitCompare,
  Swords,
  Ban,
  Flame,
  ShieldAlert,
  Ghost,
  Skull,
} from 'lucide-react';

export type RatingTierKey =
  | 'angel'
  | 'seraphic'
  | 'luminary'
  | 'mujaddid'
  | 'reviver'
  | 'vanguard'
  | 'virtuous'
  | 'statesman'
  | 'sage'
  | 'jurist'
  | 'guardian'
  | 'defender'
  | 'honorable'
  | 'benevolent'
  | 'commendable'
  | 'upright'
  | 'equable'
  | 'neutral'
  | 'disputed'
  | 'uncertain'
  | 'flawed'
  | 'negligent'
  | 'errant'
  | 'deceptive'
  | 'transgressor'
  | 'factious'
  | 'corrupt'
  | 'venal'
  | 'oppressive'
  | 'tyrannical'
  | 'malicious'
  | 'devil';

export type TierPolarity = 'light' | 'neutral' | 'shadow';

export interface RatingTierInfo {
  key: RatingTierKey;
  rank: number; // 1 (highest +1000) to 32 (lowest -1000)
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
 * 32 finely graduated historical & moral alignment tiers spanning -1000 to +1000.
 * Ordered from highest pinnacle Exemplar (+1000) down to Arch-Tyrant (-1000) with zero score gaps.
 */
export const RATING_TIERS: readonly RatingTierInfo[] = [
  // ============================================================================
  // LIGHT & VIRTUE (Ranks 1–16: +50 to +1000)
  // ============================================================================
  {
    key: 'angel',
    rank: 1,
    polarity: 'light',
    minScore: 970,
    maxScore: 1000,
    presetScore: 985,
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
    key: 'seraphic',
    rank: 2,
    polarity: 'light',
    minScore: 930,
    maxScore: 969,
    presetScore: 950,
    nameEn: 'Seraphic Pillar',
    nameAr: 'قدوة ربانية / ركيزة نور',
    subtitleEn: 'Transcendent spiritual devotion guiding entire generations.',
    subtitleAr: 'مثال رفيع للخشية والإخلاص والقدوة الصادقة للأجيال.',
    iconName: 'SunMedium',
    logoSrc: '/images/alignments/seraphic.jpg',
    logoAltEn: 'Seraphic Pillar Logo',
    logoAltAr: 'شعار القدوة الربانية',
    textColor: 'text-sky-900 dark:text-sky-200',
    bgLight: 'bg-sky-50/90 dark:bg-sky-950/45',
    borderColor: 'border-sky-300 dark:border-cyan-500',
    barColor: 'bg-gradient-to-r from-cyan-400 to-sky-500',
    badgeGradient: 'bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_17px_rgba(14,165,233,0.48)]',
    logoRingClass: 'ring-2 ring-cyan-300',
    logoShadowClass: 'shadow-[0_0_17px_rgba(14,165,233,0.82),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-cyan-400/95 shadow-[0_0_23px_rgba(14,165,233,0.78),0_0_44px_rgba(14,165,233,0.32)] ring-1 ring-cyan-300/45 text-cyan-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.92)]',
    presetButtonClass: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border-cyan-300 hover:bg-cyan-200',
    iconColoredClass: 'text-cyan-600 dark:text-cyan-400',
    iconGlowClass: 'text-cyan-300',
  },
  {
    key: 'luminary',
    rank: 3,
    polarity: 'light',
    minScore: 890,
    maxScore: 929,
    presetScore: 910,
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
    key: 'mujaddid',
    rank: 4,
    polarity: 'light',
    minScore: 840,
    maxScore: 889,
    presetScore: 865,
    nameEn: 'Supreme Mujaddid',
    nameAr: 'مجدد عظيم / رافع راية التجديد',
    subtitleEn: 'Century-defining renovator restoring prophetic orthodoxy and vitality.',
    subtitleAr: 'مجدد رأس المائة الذي أعاد للأمة صفاء منهجها ونهضتها.',
    iconName: 'Sunrise',
    logoSrc: '/images/alignments/mujaddid.jpg',
    logoAltEn: 'Supreme Mujaddid Logo',
    logoAltAr: 'شعار المجدد العظيم',
    textColor: 'text-violet-900 dark:text-violet-200',
    bgLight: 'bg-violet-50 dark:bg-violet-950/50',
    borderColor: 'border-violet-300 dark:border-violet-500',
    barColor: 'bg-gradient-to-r from-violet-500 to-indigo-500',
    badgeGradient: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_16px_rgba(139,92,246,0.45)]',
    logoRingClass: 'ring-2 ring-violet-300',
    logoShadowClass: 'shadow-[0_0_16px_rgba(139,92,246,0.8),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-violet-400/90 shadow-[0_0_22px_rgba(139,92,246,0.75),0_0_40px_rgba(139,92,246,0.3)] ring-1 ring-violet-300/40 text-violet-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(167,139,250,0.9)]',
    presetButtonClass: 'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 border-violet-300 hover:bg-violet-200',
    iconColoredClass: 'text-violet-600 dark:text-violet-400',
    iconGlowClass: 'text-violet-300',
  },
  {
    key: 'reviver',
    rank: 5,
    polarity: 'light',
    minScore: 790,
    maxScore: 839,
    presetScore: 815,
    nameEn: 'Great Reviver',
    nameAr: 'إمام مصلح / راعي النهضة',
    subtitleEn: 'Visionary reformer reviving faith, scholarship, and society.',
    subtitleAr: 'إمام مصلح أحيا معالم العلم والنهضة والعدل في الأمة.',
    iconName: 'Sun',
    logoSrc: '/images/alignments/reviver.jpg',
    logoAltEn: 'Great Reviver Logo',
    logoAltAr: 'شعار الإمام المصلح',
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
    key: 'vanguard',
    rank: 6,
    polarity: 'light',
    minScore: 740,
    maxScore: 789,
    presetScore: 765,
    nameEn: 'Noble Vanguard',
    nameAr: 'طليعة نيرة / سابق للخيرات',
    subtitleEn: 'Pioneering banner-bearer leading generations with courage and clarity.',
    subtitleAr: 'رائد سبّاق حمل مشاعل الحق والفضيلة في طليعة الأمة.',
    iconName: 'Trophy',
    logoSrc: '/images/alignments/vanguard.jpg',
    logoAltEn: 'Noble Vanguard Logo',
    logoAltAr: 'شعار الطليعة النيرة',
    textColor: 'text-yellow-900 dark:text-yellow-200',
    bgLight: 'bg-yellow-50 dark:bg-yellow-950/40',
    borderColor: 'border-yellow-400 dark:border-yellow-500',
    barColor: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    badgeGradient: 'bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-700 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_16px_rgba(234,179,8,0.42)]',
    logoRingClass: 'ring-2 ring-yellow-300',
    logoShadowClass: 'shadow-[0_0_16px_rgba(234,179,8,0.78),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-yellow-400/90 shadow-[0_0_21px_rgba(234,179,8,0.72),0_0_38px_rgba(234,179,8,0.28)] ring-1 ring-yellow-300/40 text-yellow-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]',
    presetButtonClass: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 border-yellow-300 hover:bg-yellow-200',
    iconColoredClass: 'text-yellow-600 dark:text-yellow-400',
    iconGlowClass: 'text-yellow-300',
  },
  {
    key: 'virtuous',
    rank: 7,
    polarity: 'light',
    minScore: 685,
    maxScore: 739,
    presetScore: 710,
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
    key: 'statesman',
    rank: 8,
    polarity: 'light',
    minScore: 625,
    maxScore: 684,
    presetScore: 655,
    nameEn: 'Grand Statesman',
    nameAr: 'رجل دولة حكيم / إداري عادل',
    subtitleEn: 'Builder of institutions, civic peace, and dignified governance.',
    subtitleAr: 'باني المؤسسات والعدل الإداري وسياسة الرعية بالرحمة.',
    iconName: 'Landmark',
    logoSrc: '/images/alignments/statesman.jpg',
    logoAltEn: 'Grand Statesman Logo',
    logoAltAr: 'شعار رجل الدولة الحكيم',
    textColor: 'text-emerald-900 dark:text-emerald-200',
    bgLight: 'bg-emerald-50/80 dark:bg-emerald-950/45',
    borderColor: 'border-emerald-300 dark:border-teal-500',
    barColor: 'bg-gradient-to-r from-teal-500 to-emerald-500',
    badgeGradient: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_15px_rgba(20,184,166,0.38)]',
    logoRingClass: 'ring-2 ring-teal-300',
    logoShadowClass: 'shadow-[0_0_15px_rgba(20,184,166,0.75),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-teal-400/90 shadow-[0_0_20px_rgba(20,184,166,0.7),0_0_36px_rgba(20,184,166,0.28)] ring-1 ring-teal-300/40 text-teal-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(45,212,191,0.88)]',
    presetButtonClass: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-teal-300 hover:bg-teal-200',
    iconColoredClass: 'text-teal-600 dark:text-teal-400',
    iconGlowClass: 'text-teal-300',
  },
  {
    key: 'sage',
    rank: 9,
    polarity: 'light',
    minScore: 565,
    maxScore: 624,
    presetScore: 595,
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
    key: 'jurist',
    rank: 10,
    polarity: 'light',
    minScore: 500,
    maxScore: 564,
    presetScore: 530,
    nameEn: 'Master Jurist',
    nameAr: 'فقيه راسخ / عالم حجة',
    subtitleEn: 'Trustworthy authority in sacred law, verification, and guidance.',
    subtitleAr: 'حجة في الفقه والأصول وتحرير المسائل ونصح الخاصة والعامة.',
    iconName: 'ScrollText',
    logoSrc: '/images/alignments/jurist.jpg',
    logoAltEn: 'Master Jurist Logo',
    logoAltAr: 'شعار الفقيه الراسخ',
    textColor: 'text-green-900 dark:text-green-200',
    bgLight: 'bg-green-50/90 dark:bg-green-950/45',
    borderColor: 'border-green-300 dark:border-lime-500',
    barColor: 'bg-gradient-to-r from-lime-500 to-green-600',
    badgeGradient: 'bg-gradient-to-r from-lime-600 to-green-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_15px_rgba(132,204,22,0.35)]',
    logoRingClass: 'ring-2 ring-lime-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(132,204,22,0.7),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-lime-400/90 shadow-[0_0_19px_rgba(132,204,22,0.68),0_0_34px_rgba(132,204,22,0.26)] ring-1 ring-lime-300/40 text-lime-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(163,230,53,0.85)]',
    presetButtonClass: 'bg-lime-100 dark:bg-lime-900/50 text-lime-900 dark:text-lime-200 border-lime-300 hover:bg-lime-200',
    iconColoredClass: 'text-lime-700 dark:text-lime-400',
    iconGlowClass: 'text-lime-300',
  },
  {
    key: 'guardian',
    rank: 11,
    polarity: 'light',
    minScore: 435,
    maxScore: 499,
    presetScore: 465,
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
    key: 'defender',
    rank: 12,
    polarity: 'light',
    minScore: 370,
    maxScore: 434,
    presetScore: 400,
    nameEn: 'Chivalrous Defender',
    nameAr: 'فارس مقدام / مناصر للحق',
    subtitleEn: 'Gallant protector defending the vulnerable with honor and bravery.',
    subtitleAr: 'فارس شهم ذاد عن المظلومين ورفع لواء المروءة والنجدة.',
    iconName: 'Medal',
    logoSrc: '/images/alignments/defender.jpg',
    logoAltEn: 'Chivalrous Defender Logo',
    logoAltAr: 'شعار الفارس المقدام',
    textColor: 'text-cyan-900 dark:text-cyan-200',
    bgLight: 'bg-cyan-50/85 dark:bg-cyan-950/45',
    borderColor: 'border-cyan-300 dark:border-cyan-500',
    barColor: 'bg-gradient-to-r from-cyan-500 to-teal-500',
    badgeGradient: 'bg-gradient-to-r from-sky-600 to-teal-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(6,182,212,0.35)]',
    logoRingClass: 'ring-2 ring-cyan-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(6,182,212,0.72),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-sky-400/90 shadow-[0_0_19px_rgba(56,189,248,0.68),0_0_34px_rgba(56,189,248,0.26)] ring-1 ring-sky-300/40 text-sky-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(56,189,248,0.85)]',
    presetButtonClass: 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 border-sky-300 hover:bg-sky-200',
    iconColoredClass: 'text-sky-600 dark:text-sky-400',
    iconGlowClass: 'text-sky-300',
  },
  {
    key: 'honorable',
    rank: 13,
    polarity: 'light',
    minScore: 300,
    maxScore: 369,
    presetScore: 335,
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
    key: 'benevolent',
    rank: 14,
    polarity: 'light',
    minScore: 225,
    maxScore: 299,
    presetScore: 260,
    nameEn: 'Benevolent Patron',
    nameAr: 'محسن كريم / سخي الأيادي',
    subtitleEn: 'Generous supporter of charity, learning, and community uplift.',
    subtitleAr: 'محسن سخي وقف جهده وماله لنفع الناس وإغاثة الملهوف.',
    iconName: 'HeartHandshake',
    logoSrc: '/images/alignments/benevolent.jpg',
    logoAltEn: 'Benevolent Patron Logo',
    logoAltAr: 'شعار المحسن الكريم',
    textColor: 'text-blue-900 dark:text-blue-200',
    bgLight: 'bg-blue-50/90 dark:bg-blue-950/45',
    borderColor: 'border-blue-300 dark:border-blue-500',
    barColor: 'bg-gradient-to-r from-sky-500 to-blue-500',
    badgeGradient: 'bg-gradient-to-r from-sky-600 to-blue-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(59,130,246,0.32)]',
    logoRingClass: 'ring-2 ring-sky-400',
    logoShadowClass: 'shadow-[0_0_14px_rgba(56,189,248,0.68),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-blue-400/90 shadow-[0_0_18px_rgba(59,130,246,0.68),0_0_32px_rgba(59,130,246,0.26)] ring-1 ring-blue-300/40 text-blue-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.85)]',
    presetButtonClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 hover:bg-blue-200',
    iconColoredClass: 'text-blue-600 dark:text-blue-400',
    iconGlowClass: 'text-blue-300',
  },
  {
    key: 'commendable',
    rank: 15,
    polarity: 'light',
    minScore: 140,
    maxScore: 224,
    presetScore: 180,
    nameEn: 'Commendable',
    nameAr: 'محمود / حميد السيرة',
    subtitleEn: 'Respectable conduct with positive community impact.',
    subtitleAr: 'سيرة محمودة وحضور إيجابي مؤثر.',
    iconName: 'CheckCircle2',
    logoSrc: '/images/alignments/commendable.jpg',
    logoAltEn: 'Commendable Logo',
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
    key: 'upright',
    rank: 16,
    polarity: 'light',
    minScore: 50,
    maxScore: 139,
    presetScore: 95,
    nameEn: 'Well-Regarded / Upright',
    nameAr: 'حسن الأثر / مستقيم',
    subtitleEn: 'Sincere endeavor with honorable intentions and worthy contributions.',
    subtitleAr: 'مساعٍ طيبة وأثر حسن مع استقامة محمودة بين الناس.',
    iconName: 'Leaf',
    logoSrc: '/images/alignments/upright.jpg',
    logoAltEn: 'Well-Regarded Upright Logo',
    logoAltAr: 'شعار حسن الأثر',
    textColor: 'text-emerald-900 dark:text-emerald-200',
    bgLight: 'bg-emerald-50/70 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-300 dark:border-emerald-600',
    barColor: 'bg-gradient-to-r from-emerald-400 to-green-500',
    badgeGradient: 'bg-gradient-to-r from-emerald-500 to-green-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_13px_rgba(16,185,129,0.28)]',
    logoRingClass: 'ring-2 ring-emerald-300',
    logoShadowClass: 'shadow-[0_0_13px_rgba(16,185,129,0.65),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-emerald-400/85 shadow-[0_0_17px_rgba(16,185,129,0.65),0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-emerald-300/35 text-emerald-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_7px_rgba(52,211,153,0.85)]',
    presetButtonClass: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 hover:bg-emerald-200',
    iconColoredClass: 'text-emerald-600 dark:text-emerald-400',
    iconGlowClass: 'text-emerald-300',
  },

  // ============================================================================
  // BALANCED & MODERATE (Ranks 17–18: -49 to +49)
  // ============================================================================
  {
    key: 'equable',
    rank: 17,
    polarity: 'neutral',
    minScore: 1,
    maxScore: 49,
    presetScore: 25,
    nameEn: 'Equable / Benign',
    nameAr: 'حسن الظن / مائل للخير',
    subtitleEn: 'Calm temperament with gentle positive tilt awaiting fuller scrutiny.',
    subtitleAr: 'طبع هادئ وميل لطيف نحو الخير والإنصاف.',
    iconName: 'Hourglass',
    logoSrc: '/images/alignments/equable.jpg',
    logoAltEn: 'Equable Benign Logo',
    logoAltAr: 'شعار حسن الظن',
    textColor: 'text-amber-900 dark:text-amber-100',
    bgLight: 'bg-amber-50/80 dark:bg-amber-950/40',
    borderColor: 'border-amber-300 dark:border-amber-500',
    barColor: 'bg-gradient-to-r from-amber-400 to-lime-500',
    badgeGradient: 'bg-gradient-to-r from-amber-500 to-lime-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_13px_rgba(245,158,11,0.28)]',
    logoRingClass: 'ring-2 ring-amber-300',
    logoShadowClass: 'shadow-[0_0_13px_rgba(245,158,11,0.65),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-amber-400/85 shadow-[0_0_17px_rgba(245,158,11,0.62),0_0_30px_rgba(245,158,11,0.24)] ring-1 ring-amber-300/35 text-amber-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_7px_rgba(251,191,36,0.82)]',
    presetButtonClass: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-300 hover:bg-amber-200',
    iconColoredClass: 'text-amber-600 dark:text-amber-400',
    iconGlowClass: 'text-amber-300',
  },
  {
    key: 'neutral',
    rank: 18,
    polarity: 'neutral',
    minScore: -49,
    maxScore: 0,
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

  // ============================================================================
  // DISPUTED & TYRANNY (Ranks 19–32: -1000 to -50)
  // ============================================================================
  {
    key: 'disputed',
    rank: 19,
    polarity: 'shadow',
    minScore: -109,
    maxScore: -50,
    presetScore: -80,
    nameEn: 'Debated / Ambiguous',
    nameAr: 'مختلف فيه / موضع نظر',
    subtitleEn: 'Mixed record sparking scholarly debate and critical scrutiny.',
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
    key: 'uncertain',
    rank: 20,
    polarity: 'shadow',
    minScore: -179,
    maxScore: -110,
    presetScore: -145,
    nameEn: 'Uncertain / Cloudy',
    nameAr: 'ملتبس السيرة / ضبابي الموقف',
    subtitleEn: 'Veiled motives and inconsistent stances clouding historical clarity.',
    subtitleAr: 'مواقف متقلبة والتباس في الرؤية يغلب عليه الغموض.',
    iconName: 'HelpCircle',
    logoSrc: '/images/alignments/uncertain.jpg',
    logoAltEn: 'Uncertain Cloudy Logo',
    logoAltAr: 'شعار ملتبس السيرة',
    textColor: 'text-slate-900 dark:text-slate-200',
    bgLight: 'bg-slate-100/90 dark:bg-slate-800/75',
    borderColor: 'border-slate-400 dark:border-zinc-500',
    barColor: 'bg-zinc-500',
    badgeGradient: 'bg-gradient-to-r from-slate-600 to-zinc-700 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(113,113,122,0.32)]',
    logoRingClass: 'ring-2 ring-zinc-300',
    logoShadowClass: 'shadow-[0_0_14px_rgba(161,161,170,0.62),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-zinc-400/85 shadow-[0_0_18px_rgba(161,161,170,0.5),0_0_30px_rgba(161,161,170,0.2)] ring-1 ring-zinc-300/35 text-zinc-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_6px_rgba(212,212,216,0.8)]',
    presetButtonClass: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 hover:bg-zinc-300',
    iconColoredClass: 'text-zinc-600 dark:text-zinc-300',
    iconGlowClass: 'text-zinc-300',
  },
  {
    key: 'flawed',
    rank: 21,
    polarity: 'shadow',
    minScore: -249,
    maxScore: -180,
    presetScore: -215,
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
    key: 'negligent',
    rank: 22,
    polarity: 'shadow',
    minScore: -319,
    maxScore: -250,
    presetScore: -285,
    nameEn: 'Negligent / Slack',
    nameAr: 'مقصّر / متهاون بالواجب',
    subtitleEn: 'Repeated neglect of duty and missed stewardship in critical moments.',
    subtitleAr: 'تفريط متكرر في الأمانة وتهاون عند المواقف المفصلية.',
    iconName: 'AlertTriangle',
    logoSrc: '/images/alignments/negligent.jpg',
    logoAltEn: 'Negligent Slack Logo',
    logoAltAr: 'شعار المقصر المتهاون',
    textColor: 'text-amber-950 dark:text-amber-200',
    bgLight: 'bg-amber-100/70 dark:bg-amber-950/50',
    borderColor: 'border-amber-400 dark:border-amber-600',
    barColor: 'bg-gradient-to-r from-stone-600 to-amber-600',
    badgeGradient: 'bg-gradient-to-r from-stone-600 to-amber-700 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_14px_rgba(217,119,6,0.34)]',
    logoRingClass: 'ring-2 ring-amber-500',
    logoShadowClass: 'shadow-[0_0_14px_rgba(217,119,6,0.7),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-amber-500/85 shadow-[0_0_18px_rgba(217,119,6,0.6),0_0_32px_rgba(217,119,6,0.24)] ring-1 ring-amber-400/35 text-amber-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_7px_rgba(245,158,11,0.8)]',
    presetButtonClass: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-400 hover:bg-amber-200',
    iconColoredClass: 'text-amber-700 dark:text-amber-400',
    iconGlowClass: 'text-amber-400',
  },
  {
    key: 'errant',
    rank: 23,
    polarity: 'shadow',
    minScore: -399,
    maxScore: -320,
    presetScore: -360,
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
    key: 'deceptive',
    rank: 24,
    polarity: 'shadow',
    minScore: -479,
    maxScore: -400,
    presetScore: -440,
    nameEn: 'Deceptive / Sophist',
    nameAr: 'مخادع مضلل / ملبّس للحق',
    subtitleEn: 'Masking falsehood in gilded rhetoric to mislead ordinary minds.',
    subtitleAr: 'تلبيس الباطل بثوب الحق وترويج الشبهات بين العوام.',
    iconName: 'CloudLightning',
    logoSrc: '/images/alignments/deceptive.jpg',
    logoAltEn: 'Deceptive Sophist Logo',
    logoAltAr: 'شعار المخادع المضلل',
    textColor: 'text-orange-950 dark:text-orange-200',
    bgLight: 'bg-orange-100/75 dark:bg-orange-950/55',
    borderColor: 'border-orange-500 dark:border-orange-600',
    barColor: 'bg-gradient-to-r from-orange-600 to-orange-700',
    badgeGradient: 'bg-gradient-to-r from-orange-600 to-red-500 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_15px_rgba(234,88,12,0.38)]',
    logoRingClass: 'ring-2 ring-orange-500',
    logoShadowClass: 'shadow-[0_0_15px_rgba(234,88,12,0.76),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-orange-500/90 shadow-[0_0_20px_rgba(234,88,12,0.72),0_0_36px_rgba(234,88,12,0.3)] ring-1 ring-orange-400/40 text-orange-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.88)]',
    presetButtonClass: 'bg-orange-100 dark:bg-orange-900/60 text-orange-900 dark:text-orange-200 border-orange-400 hover:bg-orange-200',
    iconColoredClass: 'text-orange-700 dark:text-orange-400',
    iconGlowClass: 'text-orange-300',
  },
  {
    key: 'transgressor',
    rank: 25,
    polarity: 'shadow',
    minScore: -559,
    maxScore: -480,
    presetScore: -520,
    nameEn: 'Transgressor',
    nameAr: 'باغٍ متجاوز / مثير شقاق',
    subtitleEn: 'Spreading division, deception, and willful transgression.',
    subtitleAr: 'نشر الشقاق والفتنة والتعدي المتعمد على الحدود.',
    iconName: 'TrendingDown',
    logoSrc: '/images/alignments/transgressor.jpg',
    logoAltEn: 'Transgressor Logo',
    logoAltAr: 'شعار الباغي المتجاوز',
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
    key: 'factious',
    rank: 26,
    polarity: 'shadow',
    minScore: -639,
    maxScore: -560,
    presetScore: -600,
    nameEn: 'Factious / Demagogue',
    nameAr: 'مثير للفتن / داعية فرقة',
    subtitleEn: 'Polarizing agitator fracturing unity for personal ambition.',
    subtitleAr: 'تحريض مستمر يمزق وحدة الصف لصالح الأهواء والمكاسب.',
    iconName: 'GitCompare',
    logoSrc: '/images/alignments/factious.jpg',
    logoAltEn: 'Factious Demagogue Logo',
    logoAltAr: 'شعار مثير الفتن',
    textColor: 'text-red-950 dark:text-red-200',
    bgLight: 'bg-red-100/70 dark:bg-red-950/45',
    borderColor: 'border-red-400 dark:border-red-600',
    barColor: 'bg-gradient-to-r from-red-500 to-rose-600',
    badgeGradient: 'bg-gradient-to-r from-red-600 to-rose-600 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_16px_rgba(220,38,38,0.4)]',
    logoRingClass: 'ring-2 ring-red-400',
    logoShadowClass: 'shadow-[0_0_16px_rgba(220,38,38,0.78),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/90 border border-red-500/90 shadow-[0_0_21px_rgba(220,38,38,0.74),0_0_38px_rgba(220,38,38,0.3)] ring-1 ring-red-400/40 text-red-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(248,113,113,0.9)]',
    presetButtonClass: 'bg-red-100 dark:bg-red-900/55 text-red-900 dark:text-red-200 border-red-400 hover:bg-red-200',
    iconColoredClass: 'text-red-600 dark:text-red-400',
    iconGlowClass: 'text-red-300',
  },
  {
    key: 'corrupt',
    rank: 27,
    polarity: 'shadow',
    minScore: -719,
    maxScore: -640,
    presetScore: -680,
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
    key: 'venal',
    rank: 28,
    polarity: 'shadow',
    minScore: -799,
    maxScore: -720,
    presetScore: -760,
    nameEn: 'Venal / Treacherous',
    nameAr: 'خائن للأمانة / بائع ضمير',
    subtitleEn: 'Selling sacred trust and public welfare for corrupt gain.',
    subtitleAr: 'بيع الذمم والأمانات والتواطؤ على حساب الدين والوطن.',
    iconName: 'Ban',
    logoSrc: '/images/alignments/venal.jpg',
    logoAltEn: 'Venal Treacherous Logo',
    logoAltAr: 'شعار خائن الأمانة',
    textColor: 'text-rose-950 dark:text-rose-200',
    bgLight: 'bg-rose-100/75 dark:bg-rose-950/55',
    borderColor: 'border-rose-500 dark:border-rose-600',
    barColor: 'bg-gradient-to-r from-rose-600 to-pink-700',
    badgeGradient: 'bg-gradient-to-r from-rose-700 to-pink-800 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_17px_rgba(190,18,60,0.42)]',
    logoRingClass: 'ring-2 ring-pink-500',
    logoShadowClass: 'shadow-[0_0_17px_rgba(219,39,119,0.8),0_4px_12px_rgba(0,0,0,0.75)]',
    scoreContainerClass:
      'bg-slate-950/92 border border-pink-500/90 shadow-[0_0_22px_rgba(219,39,119,0.76),0_0_40px_rgba(219,39,119,0.32)] ring-1 ring-pink-400/40 text-pink-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_8px_rgba(244,114,182,0.9)]',
    presetButtonClass: 'bg-pink-100 dark:bg-pink-900/50 text-pink-950 dark:text-pink-200 border-pink-300 hover:bg-pink-200',
    iconColoredClass: 'text-pink-700 dark:text-pink-400',
    iconGlowClass: 'text-pink-300',
  },
  {
    key: 'oppressive',
    rank: 29,
    polarity: 'shadow',
    minScore: -859,
    maxScore: -800,
    presetScore: -830,
    nameEn: 'Oppressive / Despot',
    nameAr: 'جائر / مستبد',
    subtitleEn: 'Cruel tyranny, bloodshed, and willful suppression of truth.',
    subtitleAr: 'بطش شديد وطغيان سافر وسحق للحقوق.',
    iconName: 'Flame',
    logoSrc: '/images/alignments/oppressive.jpg',
    logoAltEn: 'Oppressive Despot Logo',
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
    key: 'tyrannical',
    rank: 30,
    polarity: 'shadow',
    minScore: -909,
    maxScore: -860,
    presetScore: -885,
    nameEn: 'Ruthless Tyrant',
    nameAr: 'غاشم باطش / عدو العدالة',
    subtitleEn: 'Relentless iron-fisted oppression crushing dissent and conscience.',
    subtitleAr: 'جبروت غاشم وإرهاب للنفوس ومصادرة كاملة للكرامة.',
    iconName: 'ShieldAlert',
    logoSrc: '/images/alignments/tyrannical.jpg',
    logoAltEn: 'Ruthless Tyrant Logo',
    logoAltAr: 'شعار الغاشم الباطش',
    textColor: 'text-fuchsia-950 dark:text-fuchsia-200',
    bgLight: 'bg-fuchsia-100/75 dark:bg-fuchsia-950/55',
    borderColor: 'border-fuchsia-500 dark:border-fuchsia-600',
    barColor: 'bg-gradient-to-r from-rose-800 to-fuchsia-900',
    badgeGradient: 'bg-gradient-to-r from-rose-800 via-fuchsia-800 to-purple-900 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_19px_rgba(162,28,175,0.46)]',
    logoRingClass: 'ring-2 ring-fuchsia-500',
    logoShadowClass: 'shadow-[0_0_18px_rgba(192,38,211,0.85),0_4px_12px_rgba(0,0,0,0.82)]',
    scoreContainerClass:
      'bg-slate-950/95 border border-fuchsia-500/95 shadow-[0_0_24px_rgba(192,38,211,0.82),0_0_48px_rgba(162,28,175,0.4)] ring-1 ring-fuchsia-400/50 text-fuchsia-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_9px_rgba(232,121,249,0.95)]',
    presetButtonClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/55 text-fuchsia-950 dark:text-fuchsia-200 border-fuchsia-400 hover:bg-fuchsia-200',
    iconColoredClass: 'text-fuchsia-700 dark:text-fuchsia-400',
    iconGlowClass: 'text-fuchsia-300',
  },
  {
    key: 'malicious',
    rank: 31,
    polarity: 'shadow',
    minScore: -959,
    maxScore: -910,
    presetScore: -935,
    nameEn: 'Abyssal Destructive',
    nameAr: 'مفسد غادر / خبيث الطوية',
    subtitleEn: 'Deliberate malice seeking ruin of faith, morality, and societies.',
    subtitleAr: 'سعي خبيث لتقويض القيم وهدم بنيان المجتمعات وإشاعة الشر.',
    iconName: 'Ghost',
    logoSrc: '/images/alignments/malicious.jpg',
    logoAltEn: 'Abyssal Destructive Logo',
    logoAltAr: 'شعار المفسد الغادر',
    textColor: 'text-purple-950 dark:text-purple-200',
    bgLight: 'bg-purple-100/85 dark:bg-purple-950/55',
    borderColor: 'border-purple-500 dark:border-purple-500',
    barColor: 'bg-gradient-to-r from-fuchsia-800 to-purple-900',
    badgeGradient: 'bg-gradient-to-r from-fuchsia-900 via-purple-800 to-indigo-950 !text-white font-bold shadow-xs',
    glowColor: 'shadow-[0_0_20px_rgba(126,34,206,0.48)]',
    logoRingClass: 'ring-2 ring-purple-400',
    logoShadowClass: 'shadow-[0_0_19px_rgba(147,51,234,0.88),0_4px_13px_rgba(0,0,0,0.84)]',
    scoreContainerClass:
      'bg-slate-950/95 border border-purple-500/95 shadow-[0_0_25px_rgba(147,51,234,0.85),0_0_50px_rgba(147,51,234,0.42)] ring-1 ring-purple-400/50 text-purple-200',
    scoreTextGlowClass: 'drop-shadow-[0_0_9px_rgba(192,132,252,0.95)]',
    presetButtonClass: 'bg-purple-100 dark:bg-purple-900/55 text-purple-900 dark:text-purple-200 border-purple-400 hover:bg-purple-200',
    iconColoredClass: 'text-purple-700 dark:text-purple-400',
    iconGlowClass: 'text-purple-300',
  },
  {
    key: 'devil',
    rank: 32,
    polarity: 'shadow',
    minScore: -1000,
    maxScore: -960,
    presetScore: -980,
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
 * Maps moral alignment score (-1000 to +1000) into one of the 32 Alignment Tiers.
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
  return RATING_TIERS_MAP[key] || RATING_TIERS[17]; // 'neutral' index 17
}

export function formatTierRange(tier: RatingTierInfo, isAr: boolean = false): string {
  const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  return isAr
    ? `من ${fmt(tier.minScore)} إلى ${fmt(tier.maxScore)}`
    : `${fmt(tier.minScore)} to ${fmt(tier.maxScore)}`;
}

/**
 * Renders the crisp Lucide thematic icon unique to each of the 32 alignment tiers.
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
    case 'seraphic':
      return <SunMedium className={combined} />;
    case 'luminary':
      return <Sparkles className={combined} />;
    case 'mujaddid':
      return <Sunrise className={combined} />;
    case 'reviver':
      return <Sun className={combined} />;
    case 'vanguard':
      return <Trophy className={combined} />;
    case 'virtuous':
      return <ShieldCheck className={combined} />;
    case 'statesman':
      return <Landmark className={combined} />;
    case 'sage':
      return <BookOpen className={combined} />;
    case 'jurist':
      return <ScrollText className={combined} />;
    case 'guardian':
      return <Shield className={combined} />;
    case 'defender':
      return <Medal className={combined} />;
    case 'honorable':
      return <Award className={combined} />;
    case 'benevolent':
      return <HeartHandshake className={combined} />;
    case 'commendable':
      return <CheckCircle2 className={combined} />;
    case 'upright':
      return <Leaf className={combined} />;
    case 'equable':
      return <Hourglass className={combined} />;
    case 'neutral':
      return <Scale className={combined} />;
    case 'disputed':
      return <Compass className={combined} />;
    case 'uncertain':
      return <HelpCircle className={combined} />;
    case 'flawed':
      return <AlertCircle className={combined} />;
    case 'negligent':
      return <AlertTriangle className={combined} />;
    case 'errant':
      return <Zap className={combined} />;
    case 'deceptive':
      return <CloudLightning className={combined} />;
    case 'transgressor':
      return <TrendingDown className={combined} />;
    case 'factious':
      return <GitCompare className={combined} />;
    case 'corrupt':
      return <Swords className={combined} />;
    case 'venal':
      return <Ban className={combined} />;
    case 'oppressive':
      return <Flame className={combined} />;
    case 'tyrannical':
      return <ShieldAlert className={combined} />;
    case 'malicious':
      return <Ghost className={combined} />;
    case 'devil':
      return <Skull className={combined} />;
    default:
      return <Crown className={combined} />;
  }
}
