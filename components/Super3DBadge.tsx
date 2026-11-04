'use client';

import React from 'react';
import {
  Star,
  Swords,
  BookOpen,
  Moon,
  Crown,
  Landmark,
  Scale,
  Feather,
  ShieldCheck,
  Compass,
  Flame,
  Heart,
  Sun,
  Award,
  Sparkles,
  Zap,
  Gem,
  TreePine,
  Eye,
  Key,
  Scroll,
  Anchor,
  Disc,
  Send,
  Activity,
  Boxes,
  Flag,
  Globe2,
  Navigation,
} from 'lucide-react';
import { getCharacterBadge, CharacterBadge } from '@/lib/characterBadges';

interface Super3DBadgeProps {
  badgeId?: string | null;
  badge?: CharacterBadge | null;
  isAr?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showTooltip?: boolean;
  isAdmin?: boolean;
}

export default function Super3DBadge({
  badgeId,
  badge: badgeProp,
  isAr = false,
  size = 'lg',
  className = '',
  onClick,
  showTooltip = true,
  isAdmin = false,
}: Super3DBadgeProps) {
  const badge = badgeProp || getCharacterBadge(badgeId);
  if (!badge) return null;

  // Icon Resolver
  const renderIcon = (sizeClass: string) => {
    const props = { className: `${sizeClass} ${badge.theme.iconColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]` };
    switch (badge.icon) {
      case 'star':
        return <Star {...props} />;
      case 'swords':
        return <Swords {...props} />;
      case 'book':
        return <BookOpen {...props} />;
      case 'moon':
        return <Moon {...props} />;
      case 'crown':
        return <Crown {...props} />;
      case 'landmark':
        return <Landmark {...props} />;
      case 'scale':
        return <Scale {...props} />;
      case 'feather':
        return <Feather {...props} />;
      case 'shield':
        return <ShieldCheck {...props} />;
      case 'compass':
        return <Compass {...props} />;
      case 'lamp':
        return <Flame {...props} />;
      case 'heart':
        return <Heart {...props} />;
      case 'flame':
        return <Flame {...props} />;
      case 'sun':
        return <Sun {...props} />;
      case 'badge-check':
        return <Award {...props} />;
      case 'sparkles':
        return <Sparkles {...props} />;
      case 'zap':
        return <Zap {...props} />;
      case 'gem':
        return <Gem {...props} />;
      case 'tree':
        return <TreePine {...props} />;
      case 'eye':
        return <Eye {...props} />;
      case 'key':
        return <Key {...props} />;
      case 'scroll':
        return <Scroll {...props} />;
      case 'anchor':
        return <Anchor {...props} />;
      case 'disc':
        return <Disc {...props} />;
      case 'send':
        return <Send {...props} />;
      case 'lighthouse':
        return <Navigation {...props} />;
      case 'activity':
        return <Activity {...props} />;
      case 'box':
        return <Boxes {...props} />;
      case 'flag':
        return <Flag {...props} />;
      case 'globe':
        return <Globe2 {...props} />;
      default:
        return <Star {...props} />;
    }
  };

  // Dimensions configuration for BIG, prominent display
  const dimensions =
    size === 'sm'
      ? {
          wrapper: 'w-8 h-8 sm:w-9 sm:h-9',
          icon: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
        }
      : size === 'md'
        ? {
            wrapper: 'w-10 h-10 sm:w-12 sm:h-12',
            icon: 'w-5 h-5 sm:w-6 sm:h-6',
          }
        : size === 'xl'
          ? {
              wrapper: 'w-16 h-16 sm:w-20 sm:h-20',
              icon: 'w-8 h-8 sm:w-10 sm:h-10',
            }
          : {
              // Default 'lg' - Big, 3D commanding presence
              wrapper: 'w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16',
              icon: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
            };

  const defaultPosition = className.includes('absolute') || className.includes('fixed') ? '' : 'relative';

  const titleText = isAr ? badge.nameAr : badge.nameEn;
  const meaningText = isAr ? badge.meaningAr : badge.meaningEn;

  return (
    <div
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`group/badge ${defaultPosition} select-none ${dimensions.wrapper} ${className} ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      }`}
      title={`${titleText}: ${meaningText}`}
      aria-label={titleText}
    >
      {/* 1. Deep 3D Outer Ambient Shadow & Jewel Glow */}
      <div
        className={`absolute inset-0 rounded-2xl transform scale-105 filter blur-[3px] opacity-80 group-hover/badge:opacity-100 transition-opacity duration-300 ${badge.theme.accentGlow}`}
      />

      {/* 2. Main 3D Medallion Body */}
      <div
        className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${badge.theme.bgGradient} ${badge.theme.bevelBorder} ${badge.theme.outerRing} ${badge.theme.glowShadow} flex items-center justify-center overflow-hidden transition-all duration-300 transform group-hover/badge:scale-110 group-hover/badge:-translate-y-1 group-hover/badge:rotate-2`}
      >
        {/* Subtle 3D Geometric Inset Pattern */}
        <div className="absolute inset-0.5 rounded-xl border border-white/40 pointer-events-none" />

        {/* 3. 3D Spherical/Specular Highlight on Upper Edge */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-t-xl pointer-events-none" />

        {/* 4. Animated Light Shimmer Beam sweeping across 3D edge */}
        <div
          className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent transform -rotate-45 pointer-events-none animate-[badge-shimmer_4.5s_infinite]"
        />

        {/* 5. Center Icon with Multi-depth Bevel */}
        <div className="relative z-10 flex items-center justify-center transform transition-transform duration-300 group-hover/badge:scale-115">
          {renderIcon(dimensions.icon)}
        </div>

        {/* 6. Admin quick-edit indicator cue */}
        {isAdmin && (
          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-white/90 shadow-xs ring-1 ring-black/40 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
        )}
      </div>

      {/* 7. Hover Interactive Floating Info Tooltip */}
      {showTooltip && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className={`pointer-events-none absolute bottom-full mb-2.5 ${
            isAr ? 'right-0' : 'left-0'
          } z-50 min-w-[190px] max-w-[240px] p-2.5 rounded-2xl bg-slate-950/95 text-white border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.8)] backdrop-blur-md opacity-0 group-hover/badge:opacity-100 group-hover/badge:translate-y-0 translate-y-1 transition-all duration-200`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300 border-b border-white/10 pb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="truncate">{titleText}</span>
          </div>
          <p className="text-[11px] leading-snug text-slate-200 mt-1.5 font-normal">
            {meaningText}
          </p>
          {onClick && !isAdmin && (
            <p className="text-[10px] text-amber-300 font-semibold mt-1 pt-1 border-t border-white/10 flex items-center gap-1">
              <span>{isAr ? 'انقر لعرض تفاصيل الوسام ℹ️' : 'Click to view badge details ℹ️'}</span>
            </p>
          )}
          {isAdmin && (
            <p className="text-[10px] text-emerald-400 font-semibold mt-1 pt-1 border-t border-white/10 flex items-center gap-1">
              <span>{isAr ? 'انقر لعرض أو تغيير الشارة (مشرف)' : 'Click to view or edit badge (Admin)'}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
