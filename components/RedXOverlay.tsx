'use client';

import React from 'react';

export interface RedXOverlayProps {
  rating: number;
  hidden?: boolean;
  globalEnabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Returns true if the character rating qualifies for the Red X overlay (0 down to -1000).
 */
export function isRedXEligible(rating: number): boolean {
  if (typeof rating !== 'number' || Number.isNaN(rating)) return false;
  const clamped = Math.max(-1000, Math.min(1000, rating));
  return clamped <= 0 && clamped >= -1000;
}

/**
 * Computes normalized severity from 0 (rating === 0) to 1 (rating === -1000).
 * Worse ratings closer to -1000 return higher severity values.
 */
export function getRedXSeverity(rating: number): number {
  if (!isRedXEligible(rating)) return 0;
  const clampedNegative = Math.max(-1000, Math.min(0, rating));
  return Math.min(1, Math.max(0, Math.abs(clampedNegative) / 1000));
}

/**
 * Human-readable clarity percentage (25% at 0 up to 100% at -1000).
 */
export function getRedXClarityPercent(rating: number): number {
  if (!isRedXEligible(rating)) return 0;
  const severity = getRedXSeverity(rating);
  return Math.round(25 + severity * 75);
}

/**
 * Checks whether the overlay should render for a given character.
 */
export function shouldShowRedX(
  rating: number,
  hideRedX?: boolean,
  globalEnabled: boolean = true
): boolean {
  return Boolean(globalEnabled) && !hideRedX && isRedXEligible(rating);
}

/**
 * Visual red X layer placed over portrait pictures for ratings 0 to -1000.
 * Built with CSS diagonal beams (no custom SVG icons) so it scales smoothly across
 * thumbnails, grid cards, and preview modals while scaling clarity from 0 to -1000.
 */
export default function RedXOverlay({
  rating,
  hidden = false,
  globalEnabled = true,
  size = 'lg',
  className = '',
}: RedXOverlayProps) {
  if (!shouldShowRedX(rating, hidden, globalEnabled)) {
    return null;
  }

  const severity = getRedXSeverity(rating);

  // Opacity increases smoothly from subtle 0.28 at rating=0 to crisp 0.96 at rating=-1000
  const beamOpacity = Number((0.28 + severity * 0.68).toFixed(3));

  // Beam thickness & span grow as score gets worse toward -1000
  const thicknessPx =
    size === 'sm'
      ? Number((2.5 + severity * 3.5).toFixed(1))
      : size === 'md'
        ? Number((3.5 + severity * 6).toFixed(1))
        : Number((5 + severity * 10).toFixed(1));

  // Diagonal length relative to box width/height
  const spanPercent =
    size === 'sm'
      ? Math.round(92 + severity * 24)
      : size === 'md'
        ? Math.round(90 + severity * 26)
        : Math.round(88 + severity * 34);

  // Contrast dark halo + crimson glow intensifies near -1000 so X stays legible over light or dark photos
  const glowSpread = size === 'sm' ? 4 + severity * 8 : 8 + severity * 18;
  const crimsonAlpha = Number((0.25 + severity * 0.65).toFixed(2));
  const darkBackingAlpha = Number((0.18 + severity * 0.52).toFixed(2));
  const vignetteAlpha = Number((0.04 + severity * 0.34).toFixed(3));
  const ringBorderAlpha = Number((0.08 + severity * 0.45).toFixed(3));

  const beamGradient =
    severity >= 0.65
      ? 'linear-gradient(90deg, rgba(185,28,28,0.92) 0%, #ef4444 25%, #dc2626 50%, #ef4444 75%, rgba(185,28,28,0.92) 100%)'
      : 'linear-gradient(90deg, rgba(239,68,68,0.75) 0%, #ef4444 50%, rgba(239,68,68,0.75) 100%)';

  const beamShadow = `0 0 ${Math.round(glowSpread)}px rgba(220, 38, 38, ${crimsonAlpha}), 0 1px ${Math.round(
    2 + severity * 6
  )}px rgba(15, 23, 42, ${darkBackingAlpha})`;

  return (
    <div
      aria-hidden="true"
      data-testid="red-x-overlay"
      data-severity={severity.toFixed(2)}
      className={`absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Subtle crimson vignette intensifying toward -1000 */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, rgba(127, 29, 29, ${(vignetteAlpha * 0.45).toFixed(
            3
          )}) 0%, rgba(153, 27, 27, ${vignetteAlpha}) 100%)`,
          boxShadow: `inset 0 0 ${size === 'sm' ? 10 : 28}px rgba(220, 38, 38, ${ringBorderAlpha})`,
        }}
      />

      {/* Diagonal Beam 1 (\) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full transition-all duration-300"
        style={{
          width: `${spanPercent}%`,
          height: `${thicknessPx}px`,
          opacity: beamOpacity,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          background: beamGradient,
          boxShadow: beamShadow,
          border:
            severity >= 0.4
              ? `1px solid rgba(254, 202, 202, ${(0.18 + severity * 0.35).toFixed(2)})`
              : 'none',
        }}
      />

      {/* Diagonal Beam 2 (/) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full transition-all duration-300"
        style={{
          width: `${spanPercent}%`,
          height: `${thicknessPx}px`,
          opacity: beamOpacity,
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          background: beamGradient,
          boxShadow: beamShadow,
          border:
            severity >= 0.4
              ? `1px solid rgba(254, 202, 202, ${(0.18 + severity * 0.35).toFixed(2)})`
              : 'none',
        }}
      />
    </div>
  );
}
