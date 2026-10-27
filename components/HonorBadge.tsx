'use client';

import React from 'react';
import { Sparkles, Award } from 'lucide-react';

export type HonorTier = 'angel' | 'islamic-leader' | null;

/**
 * Determines honor tier based on character rating:
 * - rating > 750: 'angel' (Best Trusted People)
 * - rating > 500 && rating <= 750: 'islamic-leader' (Islamic Leader Gift Badge)
 * - rating <= 500: null
 */
export function getHonorTier(rating: number = 0): HonorTier {
  if (rating > 750) return 'angel';
  if (rating > 500 && rating <= 750) return 'islamic-leader';
  return null;
}

interface HonorBadgeProps {
  rating: number;
  isAr?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders ONLY the icon on the top-left (no visible text), with rich tooltips and accessible labels.
 */
export default function HonorBadge({
  rating,
  isAr = false,
  className = '',
  size = 'md',
}: HonorBadgeProps) {
  const honor = getHonorTier(rating);
  if (!honor) return null;

  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'lg'
        ? 'w-9 h-9 md:w-10 md:h-10'
        : 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9';

  const iconSizes =
    size === 'sm'
      ? 'w-3.5 h-3.5'
      : size === 'lg'
        ? 'w-5 h-5'
        : 'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5';

  if (honor === 'angel') {
    return (
      <div
        className={`relative group/honor flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-sky-500/35 border border-sky-200/90 ring-2 ring-sky-300/40 backdrop-blur-md select-none shrink-0 transition-transform duration-200 hover:scale-110 ${sizeClasses} ${className}`}
        title={
          isAr
            ? 'أهل الثقة والأمانة (رتبة ملائكية نورانية +750)'
            : 'Best Trusted People (Angelic Tier 750+)'
        }
        aria-label={
          isAr
            ? 'وسام أهل الثقة والأمانة الملائكي'
            : 'Angelic Best Trusted People Badge'
        }
      >
        {/* Angelic Radiant Halo effect above icon */}
        <span className="absolute -top-1 w-3.5 md:w-4 h-1 rounded-full border border-sky-200 bg-sky-200/70 shadow-[0_0_8px_rgba(186,230,253,0.8)] pointer-events-none" />
        <Sparkles className={`${iconSizes} text-sky-100 fill-sky-200/50 drop-shadow-xs`} />
      </div>
    );
  }

  // Islamic Leader Honor Gift Badge (501 to 750)
  return (
    <div
      className={`relative group/honor flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-600/35 border border-amber-300/90 ring-2 ring-amber-400/40 backdrop-blur-md select-none shrink-0 transition-transform duration-200 hover:scale-110 ${sizeClasses} ${className}`}
      title={
        isAr
          ? 'قائد إسلامي (وسام وهدية شرف +500 إلى 750)'
          : 'Islamic Leader Honor Gift Badge (500 to 750)'
      }
      aria-label={
        isAr ? 'وسام قائد إسلامي' : 'Islamic Leader Honor Badge'
      }
    >
      <Award className={`${iconSizes} text-amber-200 fill-amber-300/40 drop-shadow-xs`} />
    </div>
  );
}
