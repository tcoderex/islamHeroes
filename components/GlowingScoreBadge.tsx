'use client';

import React from 'react';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';

interface GlowingScoreBadgeProps {
  rating: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GlowingScoreBadge({
  rating,
  className = '',
  size = 'md',
}: GlowingScoreBadgeProps) {
  const boundedRating = Math.max(-1000, Math.min(1000, Number(rating) || 0));
  const tier = getRatingTier(boundedRating);

  const formattedScore =
    boundedRating > 0
      ? `+${boundedRating}`
      : boundedRating === 0
        ? '0'
        : `${boundedRating}`;

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs gap-1.5'
      : size === 'lg'
        ? 'px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-sm sm:text-base font-black tracking-tight gap-2 sm:gap-2.5 shadow-lg'
        : 'px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm gap-1.5 sm:gap-2';

  const iconSizeClass =
    size === 'lg'
      ? 'w-4 h-4 sm:w-5 sm:h-5 shrink-0'
      : 'w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0';

  const defaultPosition =
    className.includes('absolute') || className.includes('fixed') ? '' : 'relative';

  return (
    <div
      className={`${defaultPosition} inline-flex items-center justify-center font-mono font-black select-none rounded-full backdrop-blur-xl transition-all duration-300 group-hover:scale-105 ${tier.scoreContainerClass} ${sizeClasses} ${className}`}
      title={`${tier.nameEn} · ${tier.nameAr} (${formattedScore})`}
      aria-label={`${tier.nameEn}: ${formattedScore}`}
    >
      <TierIcon tierKey={tier.key} tone="glow" className={iconSizeClass} />

      <span className={`tracking-tight ${tier.scoreTextGlowClass}`}>
        {formattedScore}
      </span>

      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 pointer-events-none" />
    </div>
  );
}
