'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Compass, Sun, Scale, Flame, Layers, Check } from 'lucide-react';
import {
  RATING_TIERS,
  RatingTierInfo,
  RatingTierKey,
  TierIcon,
  formatTierRange,
  getRatingTier,
} from '@/lib/ratingTiers';
import HonorBadge from '@/components/HonorBadge';
import { AppTheme } from '@/lib/theme';

interface AlignmentTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  theme?: AppTheme;
  characters?: { rating: number }[];
  selectedTierKey?: RatingTierKey | 'all';
  onSelectTier?: (tierKey: RatingTierKey | 'all') => void;
  focusedRating?: number | null;
}

export default function AlignmentTiersModal({
  isOpen,
  onClose,
  isAr,
  theme = 'tgis',
  characters = [],
  selectedTierKey = 'all',
  onSelectTier,
  focusedRating = null,
}: AlignmentTiersModalProps) {
  const [polarityFilter, setPolarityFilter] = useState<'all' | 'light' | 'neutral' | 'shadow'>('all');
  const isRamadan = theme === 'ramadan';

  const focusedTierKey = useMemo(() => {
    if (typeof focusedRating !== 'number') return null;
    return getRatingTier(focusedRating).key;
  }, [focusedRating]);

  const tierCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of characters) {
      const t = getRatingTier(c.rating);
      map[t.key] = (map[t.key] || 0) + 1;
    }
    return map;
  }, [characters]);

  const filteredTiers = useMemo(() => {
    if (polarityFilter === 'all') return RATING_TIERS;
    return RATING_TIERS.filter((t) => t.polarity === polarityFilter);
  }, [polarityFilter]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTierAction = (tier: RatingTierInfo) => {
    if (onSelectTier) {
      onSelectTier(selectedTierKey === tier.key ? 'all' : tier.key);
      onClose();
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
          isRamadan
            ? 'bg-[#091522] border-amber-500/35 text-amber-50 shadow-[0_24px_70px_rgba(0,0,0,0.85)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-[0_24px_70px_rgba(0,103,192,0.2)]'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0 ${
            isRamadan
              ? 'border-amber-500/20 bg-[#0d1d2d]'
              : 'border-slate-100 bg-gradient-to-r from-blue-50/80 via-slate-50 to-sky-50/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isRamadan
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                  : 'bg-[#0067c0]/10 border-blue-200 text-[#0067c0]'
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">
                {isAr ? 'دليل المراتب والأيقونات والشعارات (16 مرتبة)' : 'Alignment Tiers, Icons & Logos (16 Tiers)'}
              </h2>
              <p className={`text-xs truncate ${isRamadan ? 'text-amber-200/70' : 'text-slate-500'}`}>
                {isAr
                  ? 'مقياس التقييم الأخلاقي والتاريخي الكامل من +1000 إلى -1000 مع أيقونة وشعار مستقل لكل مرتبة'
                  : 'Full moral spectrum from +1000 to -1000 — every rank has its own Lucide icon & crest logo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
              isRamadan
                ? 'text-amber-200 hover:bg-white/10'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Polarity Filter Bar */}
        <div
          className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${
            isRamadan ? 'border-amber-500/15 bg-[#0a1826]' : 'border-slate-100 bg-white'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPolarityFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                polarityFilter === 'all'
                  ? isRamadan
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-[#0067c0] text-white'
                  : isRamadan
                    ? 'bg-slate-800/70 text-amber-200/80 hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'جميع المراتب (16)' : 'All Tiers (16)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPolarityFilter('light')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                polarityFilter === 'light'
                  ? 'bg-emerald-600 text-white'
                  : isRamadan
                    ? 'bg-slate-800/70 text-emerald-300 hover:bg-slate-800'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{isAr ? 'مراتب النور والفضل (+50..+1000)' : 'Light & Virtue (8)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPolarityFilter('neutral')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                polarityFilter === 'neutral'
                  ? 'bg-amber-500 text-slate-950'
                  : isRamadan
                    ? 'bg-slate-800/70 text-amber-300 hover:bg-slate-800'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isAr ? 'الوسط المتوازن (-49..+49)' : 'Balanced (1)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPolarityFilter('shadow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                polarityFilter === 'shadow'
                  ? 'bg-rose-600 text-white'
                  : isRamadan
                    ? 'bg-slate-800/70 text-rose-300 hover:bg-slate-800'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{isAr ? 'مراتب الجدل والطغيان (-50..-1000)' : 'Disputed & Tyranny (7)'}</span>
            </button>
          </div>

          {onSelectTier && selectedTierKey !== 'all' && (
            <button
              type="button"
              onClick={() => {
                onSelectTier('all');
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              {isAr ? 'إلغاء التصفية' : 'Reset Filter'}
            </button>
          )}
        </div>

        {/* Tier Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTiers.map((tier) => {
            const count = tierCounts[tier.key] || 0;
            const isSelected = selectedTierKey === tier.key;
            const isFocused = focusedTierKey === tier.key;

            return (
              <div
                key={tier.key}
                onClick={onSelectTier ? () => handleTierAction(tier) : undefined}
                className={`relative p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  onSelectTier ? 'cursor-pointer hover:-translate-y-0.5' : ''
                } ${
                  isSelected
                    ? isRamadan
                      ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-blue-50 border-[#0067c0] ring-2 ring-[#0067c0]/30'
                    : isFocused
                      ? isRamadan
                        ? 'bg-slate-900 border-emerald-400 ring-1 ring-emerald-400/50'
                        : 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/50'
                      : isRamadan
                        ? 'bg-[#0d1c2c] border-amber-500/20 hover:border-amber-400/50'
                        : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {/* Alignment Crest Logo */}
                <HonorBadge rating={tier.presetScore} tier={tier} isAr={isAr} size="xl" />

                {/* Alignment Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${tier.badgeGradient}`}
                    >
                      <TierIcon tierKey={tier.key} tone="on-badge" className="w-3.5 h-3.5 shrink-0" />
                      <span>{isAr ? tier.nameAr : tier.nameEn}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                          isRamadan
                            ? 'bg-slate-950/70 border-white/10 text-amber-200'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {formatTierRange(tier, false)}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`text-xs leading-snug ${isRamadan ? 'text-slate-300' : 'text-slate-600'}`}>
                    {isAr ? tier.subtitleAr : tier.subtitleEn}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className={`font-mono ${isRamadan ? 'text-amber-300/80' : 'text-slate-500'}`}>
                      {isAr ? `الترتيب #${tier.rank}` : `Rank #${tier.rank}`}
                    </span>

                    {characters.length > 0 && (
                      <span
                        className={`font-semibold ${
                          count > 0
                            ? isRamadan
                              ? 'text-emerald-300'
                              : 'text-[#0067c0]'
                            : isRamadan
                              ? 'text-slate-500'
                              : 'text-slate-400'
                        }`}
                      >
                        {isAr ? `${count} شخصية` : `${count} figures`}
                        {onSelectTier ? (isAr ? ' · اضغط للتصفية' : ' · Filter') : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`px-4 sm:px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isRamadan ? 'border-amber-500/20 bg-[#0b1826]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <span className={isRamadan ? 'text-amber-200/70' : 'text-slate-500'}>
            {onSelectTier
              ? isAr
                ? 'اضغط على أي مرتبة لتصفية الشخصيات حسب شعارها وتصنيفها.'
                : 'Click any tier to filter figures by alignment & logo.'
              : isAr
                ? 'لكل مرتبة أيقونة مخصصة وشعار فريد يظهر على بطاقة الشخصية.'
                : 'Each alignment features its own unique Lucide icon and medallion crest logo.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
              isRamadan
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-[#0067c0] hover:bg-[#005fb8] text-white'
            }`}
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
