'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Scale, Flame, Skull } from 'lucide-react';
import { getRatingTier } from '@/lib/ratingTiers';

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

  // Dynamic Glow and Aesthetic Configuration based on rating tier
  const getGlowConfig = () => {
    if (boundedRating >= 850) {
      return {
        containerClass:
          'bg-slate-950/90 border border-sky-400/90 shadow-[0_0_22px_rgba(56,189,248,0.75),0_0_45px_rgba(56,189,248,0.35)] ring-1 ring-sky-300/40 text-sky-300',
        icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 fill-sky-200/50 animate-pulse shrink-0" />,
        textGlow: 'drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]',
      };
    }
    if (boundedRating >= 500) {
      return {
        containerClass:
          'bg-slate-950/90 border border-emerald-400/90 shadow-[0_0_22px_rgba(16,185,129,0.75),0_0_45px_rgba(16,185,129,0.35)] ring-1 ring-emerald-300/40 text-emerald-300',
        icon: <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 fill-emerald-200/50 shrink-0" />,
        textGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]',
      };
    }
    if (boundedRating >= 0) {
      return {
        containerClass:
          'bg-slate-950/90 border border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.7),0_0_35px_rgba(245,158,11,0.3)] ring-1 ring-amber-300/40 text-amber-300',
        icon: <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />,
        textGlow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      };
    }
    if (boundedRating >= -500) {
      return {
        containerClass:
          'bg-slate-950/90 border border-rose-500/90 shadow-[0_0_22px_rgba(244,63,94,0.75),0_0_40px_rgba(244,63,94,0.35)] ring-1 ring-rose-400/40 text-rose-300',
        icon: <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 fill-rose-300/50 shrink-0" />,
        textGlow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]',
      };
    }
    // Demonic (-500 to -1000)
    return {
      containerClass:
        'bg-slate-950/90 border border-purple-500/95 shadow-[0_0_26px_rgba(168,85,247,0.85),0_0_55px_rgba(168,85,247,0.45)] ring-1 ring-purple-400/50 text-purple-300',
      icon: <Skull className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 fill-purple-200/50 shrink-0" />,
      textGlow: 'drop-shadow-[0_0_10px_rgba(168,85,247,1)]',
    };
  };

  const config = getGlowConfig();

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
        ? 'px-4 sm:px-5 py-2 text-sm sm:text-base gap-2 sm:gap-2.5'
        : 'px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm gap-1.5 sm:gap-2';

  const defaultPosition = className.includes('absolute') || className.includes('fixed') ? '' : 'relative';

  return (
    <div
      className={`${defaultPosition} inline-flex items-center justify-center font-mono font-black select-none rounded-full backdrop-blur-xl transition-all duration-300 group-hover:scale-105 ${config.containerClass} ${sizeClasses} ${className}`}
      title={`${tier.nameEn} (${formattedScore})`}
      aria-label={`Score: ${formattedScore}`}
    >
      {/* Tier Glowing Icon */}
      {config.icon}

      {/* Glowing Numeric Score */}
      <span className={`tracking-tight ${config.textGlow}`}>
        {formattedScore}
      </span>

      {/* Internal Glass Highlight */}
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 pointer-events-none" />
    </div>
  );
}
