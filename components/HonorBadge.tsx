'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  getRatingTier,
  formatTierRange,
  RatingTierInfo,
  RatingTierKey,
  TierIcon,
} from '@/lib/ratingTiers';
import FloatingBadgePortal from './FloatingBadgePortal';

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
  showTooltip?: boolean;
  onClick?: (tier: RatingTierInfo) => void;
}

/**
 * Renders the bespoke circular alignment medallion logo for EVERY alignment tier (-1000 to +1000),
 * with glowing metallic/gem rings and a smooth viewport-clamped floating hover preview.
 */
export default function HonorBadge({
  rating,
  tier: tierProp,
  isAr = false,
  className = '',
  size = 'md',
  showTooltip = true,
  onClick,
}: HonorBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

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
      ref={anchorRef}
      onMouseEnter={() => {
        if (showTooltip) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (showTooltip) setIsHovered(false);
      }}
      onFocus={() => {
        if (showTooltip) setIsHovered(true);
      }}
      onBlur={() => {
        if (showTooltip) setIsHovered(false);
      }}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              setIsHovered(false);
              onClick(tier);
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick || showTooltip ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setIsHovered(false);
                onClick(tier);
              }
            }
          : undefined
      }
      className={`${defaultPosition} group/honor rounded-full shrink-0 select-none transition-transform duration-200 hover:scale-110 overflow-hidden bg-slate-950 ${
        tier.logoRingClass
      } ${tier.logoShadowClass} ${sizeClasses} ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
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

      {showTooltip && (
        <FloatingBadgePortal anchorRef={anchorRef} isOpen={isHovered} isAr={isAr} width={264}>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-2">
              <div
                className={`relative w-11 h-11 rounded-full shrink-0 overflow-hidden bg-slate-950 ${tier.logoRingClass} ${tier.logoShadowClass}`}
              >
                <Image
                  src={tier.logoSrc}
                  alt={isAr ? tier.logoAltAr : tier.logoAltEn}
                  fill
                  sizes="56px"
                  referrerPolicy="no-referrer"
                  className="object-cover scale-[1.09]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300/90">
                  <span>{isAr ? `الرتبة #${tier.rank} من 32` : `Rank #${tier.rank} of 32`}</span>
                  <span>·</span>
                  <span>{formatTierRange(tier, false)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TierIcon tierKey={tier.key} tone="glow" className="w-3.5 h-3.5 shrink-0" />
                  <p className="font-bold text-xs sm:text-sm text-white truncate">{tierTitle}</p>
                </div>
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-slate-200">{tierSubtitle}</p>

            {onClick && (
              <p className="text-[10.5px] font-semibold pt-1.5 border-t border-white/10 text-amber-300/95">
                {isAr
                  ? 'انقر لاستعراض المراتب الـ32 وشعاراتها'
                  : 'Click to explore all 32 alignment tiers'}
              </p>
            )}
          </div>
        </FloatingBadgePortal>
      )}
    </div>
  );
}
