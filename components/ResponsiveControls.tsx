'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  Grid3x3,
  List,
  Layers,
  Sun,
  Flame,
  Award,
  Ban,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
} from 'lucide-react';
import { AppTheme } from '@/lib/theme';
import {
  ViewLayoutMode,
  QuickCategoryFilter,
  PageSizeOption,
  CHENGUM_BOUNCE,
  CHENGUM_SPRING,
  getCondensedPageNumbers,
} from '@/lib/motionPresets';

export interface QuickCategoryCounts {
  all: number;
  heaven: number;
  hell: number;
  badged: number;
  redx: number;
}

interface QuickOrganizeBarProps {
  idPrefix: string;
  categoryFilter: QuickCategoryFilter;
  onCategoryChange: (cat: QuickCategoryFilter) => void;
  counts: QuickCategoryCounts;
  viewMode: ViewLayoutMode;
  onViewModeChange: (mode: ViewLayoutMode) => void;
  pageSize: PageSizeOption;
  onPageSizeChange: (size: PageSizeOption) => void;
  isAr: boolean;
  theme?: AppTheme;
}

export function QuickOrganizeBar({
  idPrefix,
  categoryFilter,
  onCategoryChange,
  counts,
  viewMode,
  onViewModeChange,
  pageSize,
  onPageSizeChange,
  isAr,
  theme = 'tgis',
}: QuickOrganizeBarProps) {
  const isRamadan = theme === 'ramadan';

  const categories: {
    id: QuickCategoryFilter;
    labelAr: string;
    labelEn: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    accentText?: string;
  }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', count: counts.all, icon: Layers },
    {
      id: 'heaven',
      labelAr: 'أفق النور',
      labelEn: 'Heaven',
      count: counts.heaven,
      icon: Sun,
      accentText: 'text-sky-500 dark:text-sky-400',
    },
    {
      id: 'hell',
      labelAr: 'أفق الجحيم',
      labelEn: 'Hell',
      count: counts.hell,
      icon: Flame,
      accentText: 'text-rose-500 dark:text-rose-400',
    },
    {
      id: 'badged',
      labelAr: 'أوسمة',
      labelEn: 'Badged',
      count: counts.badged,
      icon: Award,
      accentText: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      id: 'redx',
      labelAr: 'علامة X',
      labelEn: 'Red X',
      count: counts.redx,
      icon: Ban,
      accentText: 'text-rose-500',
    },
  ];

  const layouts: {
    id: ViewLayoutMode;
    labelAr: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'grid', labelAr: 'شبكة', labelEn: 'Grid', icon: LayoutGrid },
    { id: 'compact', labelAr: 'مدمج', labelEn: 'Compact', icon: Grid3x3 },
    { id: 'list', labelAr: 'قائمة', labelEn: 'List', icon: List },
  ];

  const pageSizes: PageSizeOption[] = [6, 12, 24, 'all'];

  return (
    <div
      className={`pt-2.5 border-t flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs ${
        isRamadan ? 'border-amber-500/20' : 'border-slate-100'
      }`}
    >
      {/* Left: Elastic Horizontally Scrollable Category Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-0.5 px-0.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = categoryFilter === cat.id;
          return (
            <motion.button
              key={cat.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              transition={CHENGUM_BOUNCE}
              onClick={() => onCategoryChange(cat.id)}
              className={`relative shrink-0 min-h-[38px] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors select-none ${
                active
                  ? isRamadan
                    ? 'text-slate-950'
                    : 'text-white'
                  : isRamadan
                    ? 'bg-[#122436] text-amber-200/80 hover:bg-[#183047]'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`${idPrefix}-cat-pill`}
                  transition={CHENGUM_BOUNCE}
                  className={`absolute inset-0 rounded-xl shadow-xs ${
                    isRamadan
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                      : 'bg-[#0067c0]'
                  }`}
                />
              )}
              <Icon
                className={`relative z-10 w-3.5 h-3.5 shrink-0 ${
                  active ? 'text-current' : cat.accentText || ''
                }`}
              />
              <span className="relative z-10 whitespace-nowrap">
                {isAr ? cat.labelAr : cat.labelEn}
              </span>
              <span
                className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums ${
                  active
                    ? isRamadan
                      ? 'bg-black/20 text-slate-950'
                      : 'bg-white/20 text-white'
                    : isRamadan
                      ? 'bg-black/30 text-amber-300/80'
                      : 'bg-white text-slate-500'
                }`}
              >
                {cat.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Right: View Mode Switcher + Cards-Per-Page Density */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
        {/* View Mode Switcher */}
        <div
          className={`inline-flex items-center p-1 rounded-xl border gap-0.5 ${
            isRamadan
              ? 'bg-[#091522] border-amber-500/25'
              : 'bg-slate-100/90 border-slate-200/70'
          }`}
          role="group"
          aria-label={isAr ? 'طريقة العرض' : 'View layout'}
        >
          {layouts.map((mode) => {
            const Icon = mode.icon;
            const active = viewMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                type="button"
                whileTap={{ scale: 0.93 }}
                transition={CHENGUM_BOUNCE}
                onClick={() => onViewModeChange(mode.id)}
                className={`relative min-h-[34px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  active
                    ? isRamadan
                      ? 'text-slate-950 font-bold'
                      : 'text-white'
                    : isRamadan
                      ? 'text-amber-200/70 hover:text-amber-100'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isAr ? mode.labelAr : mode.labelEn}
              >
                {active && (
                  <motion.span
                    layoutId={`${idPrefix}-view-pill`}
                    transition={CHENGUM_BOUNCE}
                    className={`absolute inset-0 rounded-lg shadow-xs ${
                      isRamadan
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                        : 'bg-[#0067c0]'
                    }`}
                  />
                )}
                <Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />
                <span className="relative z-10 hidden sm:inline whitespace-nowrap">
                  {isAr ? mode.labelAr : mode.labelEn}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Page Size Selector */}
        <div
          className={`inline-flex items-center p-1 rounded-xl border gap-0.5 ${
            isRamadan
              ? 'bg-[#091522] border-amber-500/25'
              : 'bg-slate-100/90 border-slate-200/70'
          }`}
          role="group"
          aria-label={isAr ? 'عدد البطاقات في الصفحة' : 'Cards per page'}
        >
          {pageSizes.map((sz) => {
            const active = pageSize === sz;
            const label = sz === 'all' ? (isAr ? 'الكل' : 'All') : String(sz);
            return (
              <motion.button
                key={String(sz)}
                type="button"
                whileTap={{ scale: 0.93 }}
                transition={CHENGUM_BOUNCE}
                onClick={() => onPageSizeChange(sz)}
                className={`relative min-h-[34px] px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                  active
                    ? isRamadan
                      ? 'text-slate-950'
                      : 'text-white'
                    : isRamadan
                      ? 'text-amber-200/70 hover:text-amber-100'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                title={
                  sz === 'all'
                    ? isAr
                      ? 'عرض كل النتائج'
                      : 'Show all results'
                    : isAr
                      ? `${sz} في الصفحة`
                      : `${sz} per page`
                }
              >
                {active && (
                  <motion.span
                    layoutId={`${idPrefix}-size-pill`}
                    transition={CHENGUM_BOUNCE}
                    className={`absolute inset-0 rounded-lg shadow-xs ${
                      isRamadan
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                        : 'bg-[#0067c0]'
                    }`}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CondensedPaginationBarProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isAr: boolean;
  theme?: AppTheme;
}

export function CondensedPaginationBar({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalCount,
  onPageChange,
  isAr,
  theme = 'tgis',
}: CondensedPaginationBarProps) {
  const isRamadan = theme === 'ramadan';
  const pageTokens = getCondensedPageNumbers(currentPage, totalPages);

  return (
    <div
      className={`backdrop-blur-xl border p-3 sm:p-3.5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isRamadan
          ? 'bg-[#0c1825]/95 border-amber-500/30 text-amber-200/80'
          : 'bg-white/95 border-slate-200/90 text-slate-600'
      }`}
    >
      <div className="font-medium text-[11px] sm:text-xs font-mono tabular-nums">
        {isAr
          ? `عرض ${startIndex + 1} - ${endIndex} من أصل ${totalCount} شخصية`
          : `Showing ${startIndex + 1} - ${endIndex} of ${totalCount} figures`}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          transition={CHENGUM_BOUNCE}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={`min-h-[38px] flex items-center gap-1 px-3 py-1.5 rounded-xl border disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer font-semibold text-xs shadow-2xs ${
            isRamadan
              ? 'bg-[#122436] border-amber-500/30 text-amber-200 hover:bg-[#183047]'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          <span className="hidden xs:inline">{isAr ? 'السابق' : 'Prev'}</span>
        </motion.button>

        <div className="flex items-center gap-1">
          {pageTokens.map((token, idx) => {
            if (typeof token !== 'number') {
              return (
                <span
                  key={`${token}-${idx}`}
                  className={`px-1.5 text-xs select-none ${
                    isRamadan ? 'text-amber-300/50' : 'text-slate-400'
                  }`}
                >
                  …
                </span>
              );
            }

            const isActive = token === currentPage;
            return (
              <motion.button
                key={token}
                type="button"
                whileTap={{ scale: 0.9 }}
                transition={CHENGUM_BOUNCE}
                onClick={() => onPageChange(token)}
                className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer font-mono tabular-nums ${
                  isActive
                    ? isRamadan
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                      : 'bg-[#0067c0] text-white shadow-xs'
                    : isRamadan
                      ? 'bg-[#122436] border border-amber-500/20 text-amber-200/80 hover:bg-[#183047]'
                      : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                {token}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          transition={CHENGUM_BOUNCE}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={`min-h-[38px] flex items-center gap-1 px-3 py-1.5 rounded-xl border disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer font-semibold text-xs shadow-2xs ${
            isRamadan
              ? 'bg-[#122436] border-amber-500/30 text-amber-200 hover:bg-[#183047]'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="hidden xs:inline">{isAr ? 'التالي' : 'Next'}</span>
          <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>
    </div>
  );
}

export function ScrollToTopButton({
  isAr,
  theme = 'tgis',
}: {
  isAr: boolean;
  theme?: AppTheme;
}) {
  const [visible, setVisible] = useState(false);
  const isRamadan = theme === 'ramadan';

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.9 }}
          transition={CHENGUM_SPRING}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-5 z-30 w-11 h-11 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center justify-center cursor-pointer ${
            isAr ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
          } ${
            isRamadan
              ? 'bg-[#0f2130]/90 border-amber-400/45 text-amber-300 shadow-amber-500/20'
              : 'bg-white/95 border-slate-200 text-[#0067c0] shadow-blue-500/15'
          }`}
          title={isAr ? 'العودة للأعلى' : 'Back to top'}
          aria-label={isAr ? 'العودة للأعلى' : 'Back to top'}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
