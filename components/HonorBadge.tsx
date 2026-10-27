'use client';

import React from 'react';
import Image from 'next/image';

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
 * Renders ONLY the authentic AI-generated icon on the top-left (no visible text),
 * with glowing rings and rich accessible tooltips.
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
      ? 'w-7 h-7 sm:w-8 sm:h-8'
      : size === 'lg'
        ? 'w-11 h-11 sm:w-12 sm:h-12'
        : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10';

  const defaultPosition = className.includes('absolute') || className.includes('fixed') ? '' : 'relative';

  if (honor === 'angel') {
    return (
      <div
        className={`${defaultPosition} group/honor rounded-full shrink-0 select-none transition-transform duration-200 hover:scale-115 ring-2 ring-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.8),0_4px_12px_rgba(0,0,0,0.7)] overflow-hidden bg-slate-950 ${sizeClasses} ${className}`}
        title={
          isAr
            ? 'وسام أهل الثقة والأمانة (رتبة ملائكية نورانية +750)'
            : 'Best Trusted People (Angelic Tier 750+)'
        }
        aria-label={
          isAr
            ? 'وسام أهل الثقة والأمانة الملائكي'
            : 'Angelic Best Trusted People Badge'
        }
      >
        <Image
          src="/images/angel_badge.jpg"
          alt="Angelic Badge"
          fill
          sizes="64px"
          referrerPolicy="no-referrer"
          className="object-cover"
        />
        {/* Subtle celestial shimmer overlay */}
        <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/60 pointer-events-none" />
      </div>
    );
  }

  // Islamic Leader Honor Gift Badge (501 to 750)
  return (
    <div
      className={`${defaultPosition} group/honor rounded-full shrink-0 select-none transition-transform duration-200 hover:scale-115 ring-2 ring-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.8),0_4px_12px_rgba(0,0,0,0.7)] overflow-hidden bg-slate-950 ${sizeClasses} ${className}`}
      title={
        isAr
          ? 'وسام قائد إسلامي (هدية شرفية +500 إلى 750)'
          : 'Islamic Leader Honor Gift Badge (500 to 750)'
      }
      aria-label={isAr ? 'وسام قائد إسلامي' : 'Islamic Leader Honor Badge'}
    >
      <Image
        src="/images/islamic_leader_badge.jpg"
        alt="Islamic Leader Badge"
        fill
        sizes="64px"
        referrerPolicy="no-referrer"
        className="object-cover"
      />
      {/* Subtle gold shimmer overlay */}
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-amber-200/60 pointer-events-none" />
    </div>
  );
}
