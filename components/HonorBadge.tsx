'use client';

import React from 'react';
import Image from 'next/image';
import { getRatingTier, formatTierRange, RatingTierInfo, RatingTierKey } from '@/lib/ratingTiers';

export type HonorTier = RatingTierKey;

/**
 * Resolves alignment tier key for any moral rating (-1000 to +1000).
 */
export function getHonorTier(rating: number = 0): HonorTier {
  return getRatingTier(rating).key;
}

interface HonorBadgeProps {
  rating: number;
  tier?: RatingTierInfo;
  isAr?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: (tier: RatingTierInfo) => void;
}

/**
 * Renders the bespoke circular alignment medallion logo for EVERY alignment tier (-1000 to +1000),
 * with glowing metallic/gem rings and localized accessible tooltips.
 */
export default function HonorBadge({
  rating,
  tier: tierProp,
  isAr = false,
  className = '',
  size = 'md',
  onClick,
}: HonorBadgeProps) {
  const tier = tierProp || getRatingTier(rating);

  const sizeClasses =
    size === 'xs'
      ? 'w-5 h-5'
      : size === 'sm'
        ? 'w-7 h-7 sm:w-8 sm:h-8'
        : size === 'lg'
          ? 'w-11 h-11 sm:w-12 sm:h-12'
          : size === 'xl'
            ? 'w-14 h-14 sm:w-16 sm:h-16'
            : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10';

  const defaultPosition =
    className.includes('absolute') || className.includes('fixed') ? '' : 'relative';

  const tierTitle = isAr ? tier.nameAr : tier.nameEn;
  const tierSubtitle = isAr ? tier.subtitleAr : tier.subtitleEn;
  const rangeLabel = formatTierRange(tier, isAr);

  return (
    <div
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick(tier);
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onClick(tier);
              }
            }
          : undefined
      }
      className={`${defaultPosition} group/honor rounded-full shrink-0 select-none transition-transform duration-200 hover:scale-110 overflow-hidden bg-slate-950 ${
        tier.logoRingClass
      } ${tier.logoShadowClass} ${sizeClasses} ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      title={`${tierTitle} (${rangeLabel}) — ${tierSubtitle}`}
      aria-label={`${tierTitle} (${rangeLabel})`}
    >
      <Image
        src={tier.logoSrc}
        alt={isAr ? tier.logoAltAr : tier.logoAltEn}
        fill
        sizes={size === 'xl' ? '80px' : size === 'lg' ? '64px' : '48px'}
        referrerPolicy="no-referrer"
        className="object-cover scale-[1.09]"
      />
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/45 pointer-events-none" />
    </div>
  );
}
