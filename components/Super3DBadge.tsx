'use client';

import React, { useRef, useState } from 'react';
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
  GraduationCap,
  Library,
  BookMarked,
  ScrollText,
  Megaphone,
  Stamp,
  Brain,
  Lightbulb,
  Gavel,
  Trophy,
  Medal,
  Waves,
  Target,
  Mountain,
  MoonStar,
  Sunrise,
  HeartHandshake,
  Droplets,
  Sprout,
  Wind,
  Infinity as InfinityIcon,
  Orbit,
  Cpu,
  Coins,
  PenTool,
  Cog,
  Map,
  Clock,
  Leaf,
} from 'lucide-react';
import { getCharacterBadge, CharacterBadge } from '@/lib/characterBadges';
import FloatingBadgePortal from './FloatingBadgePortal';

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
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const badge = badgeProp || getCharacterBadge(badgeId);
  if (!badge) return null;

  // Icon Resolver for all 60 Islamic & Historical Honor Badges
  const renderIcon = (sizeClass: string) => {
    const props = {
      className: `${sizeClass} ${badge.theme.iconColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`,
    };
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
      case 'graduation':
        return <GraduationCap {...props} />;
      case 'library':
        return <Library {...props} />;
      case 'book-marked':
        return <BookMarked {...props} />;
      case 'scroll-text':
        return <ScrollText {...props} />;
      case 'shield-check':
        return <ShieldCheck {...props} />;
      case 'megaphone':
        return <Megaphone {...props} />;
      case 'stamp':
        return <Stamp {...props} />;
      case 'brain':
        return <Brain {...props} />;
      case 'lightbulb':
        return <Lightbulb {...props} />;
      case 'gavel':
        return <Gavel {...props} />;
      case 'trophy':
        return <Trophy {...props} />;
      case 'medal':
        return <Medal {...props} />;
      case 'waves':
        return <Waves {...props} />;
      case 'target':
        return <Target {...props} />;
      case 'mountain':
        return <Mountain {...props} />;
      case 'crescent-star':
        return <MoonStar {...props} />;
      case 'sunrise':
        return <Sunrise {...props} />;
      case 'handshake':
        return <HeartHandshake {...props} />;
      case 'droplets':
        return <Droplets {...props} />;
      case 'sprout':
        return <Sprout {...props} />;
      case 'wind':
        return <Wind {...props} />;
      case 'infinity':
        return <InfinityIcon {...props} />;
      case 'orbit':
        return <Orbit {...props} />;
      case 'cpu':
        return <Cpu {...props} />;
      case 'coins':
        return <Coins {...props} />;
      case 'pen-tool':
        return <PenTool {...props} />;
      case 'cog':
        return <Cog {...props} />;
      case 'map':
        return <Map {...props} />;
      case 'clock':
        return <Clock {...props} />;
      case 'leaf':
        return <Leaf {...props} />;
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
  const categoryText = isAr ? badge.categoryLabelAr : badge.categoryLabelEn;

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
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          setIsHovered(false);
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick || showTooltip ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setIsHovered(false);
                onClick();
              }
            }
          : undefined
      }
      className={`group/badge ${defaultPosition} select-none ${dimensions.wrapper} ${className} ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      }`}
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

      {/* 7. Viewport-Clamped Floating Portal Info Card (Escapes overflow-hidden & smooth fade in/out) */}
      {showTooltip && (
        <FloatingBadgePortal anchorRef={anchorRef} isOpen={isHovered} isAr={isAr} width={264}>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-2">
              <div
                className={`relative w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br ${badge.theme.bgGradient} ${badge.theme.bevelBorder} ring-1 ring-white/40 flex items-center justify-center overflow-hidden shadow-md`}
              >
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                {renderIcon('w-5 h-5 relative z-10')}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/90 block truncate">
                  {categoryText}
                </span>
                <p className="font-bold text-xs sm:text-sm text-amber-300 leading-tight truncate">
                  {titleText}
                </p>
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-slate-200 font-normal">
              {meaningText}
            </p>

            {onClick && (
              <p className="text-[10.5px] font-semibold pt-1.5 border-t border-white/10 text-amber-300/95">
                {isAdmin
                  ? isAr
                    ? 'انقر لتغيير أو عرض تفاصيل الشارة (مشرف)'
                    : 'Click to change or inspect badge (Admin)'
                  : isAr
                    ? 'انقر لعرض بطاقة تفاصيل الوسام'
                    : 'Click to view full badge details'}
              </p>
            )}
          </div>
        </FloatingBadgePortal>
      )}
    </div>
  );
}
