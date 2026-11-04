'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Award,
  Search,
  Check,
  Trash2,
  Sparkles,
  Shield,
  BookOpen,
  Compass,
  Heart,
} from 'lucide-react';
import { CHARACTER_BADGES, CharacterBadge } from '@/lib/characterBadges';
import Super3DBadge from './Super3DBadge';
import { CustomCharacter } from './CharactersView';
import { getLocalizedCharacterName } from '@/lib/arabicTransliteration';
import { parseImagePosition } from '@/lib/imagePosition';

interface BadgePickerModalProps {
  character: CustomCharacter | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBadge: (characterId: string, badgeId: string | null) => void;
  isAr: boolean;
}

export default function BadgePickerModal({
  character,
  isOpen,
  onClose,
  onSelectBadge,
  isAr = false,
}: BadgePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const charName = character ? getLocalizedCharacterName(character.name, isAr) : '';
  const currentBadgeId = character?.badgeId || null;

  // Filtered badges based on search & category
  const filteredBadges = useMemo(() => {
    let list = CHARACTER_BADGES;

    if (activeCategory !== 'all') {
      list = list.filter((b) => b.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.nameAr.toLowerCase().includes(q) ||
          b.nameEn.toLowerCase().includes(q) ||
          b.meaningAr.toLowerCase().includes(q) ||
          b.meaningEn.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  if (!isOpen || !character) return null;

  const handleChoose = (badgeId: string | null) => {
    onSelectBadge(character.id, badgeId);
    onClose();
  };

  const categories = [
    { id: 'all', labelAr: 'الكل (30)', labelEn: 'All (30)', icon: Sparkles },
    { id: 'knowledge', labelAr: 'العلم والفقه (6)', labelEn: 'Knowledge & Fiqh', icon: BookOpen },
    { id: 'valor', labelAr: 'الشجاعة والقيادة (8)', labelEn: 'Valor & Leadership', icon: Shield },
    { id: 'guidance', labelAr: 'الهدى والروحانية (9)', labelEn: 'Guidance & Spirit', icon: Heart },
    { id: 'civilization', labelAr: 'الحضارة والعلوم (7)', labelEn: 'Civilization & Science', icon: Compass },
  ];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Character Mini Portrait & Close */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Character Thumbnail */}
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/70 bg-slate-950 shrink-0 shadow-md">
              {character.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={character.picture}
                  alt={charName}
                  style={parseImagePosition(character.imagePosition || '50% 20%')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-sky-400">
                  {charName.charAt(0)}
                </div>
              )}
              {/* Badge Overlay Preview on the thumbnail bottom-left */}
              {currentBadgeId && (
                <div className="absolute bottom-0 left-0">
                  <Super3DBadge badgeId={currentBadgeId} size="sm" showTooltip={false} />
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {isAr ? 'اختيار شارة التميز الإسلامية' : 'Select Islamic Honor Badge'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {isAr
                  ? `الشخصية المختارة: ${charName} (30 شارة فريدة بتقنية 3D)`
                  : `Selected: ${charName} (30 unique 3D badges available)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Clear Badge Action Row */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute top-3 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث باسم الشارة أو معناها (مثال: نجم، سيف، فقه، حكمة)...'
                  : 'Search by badge name or meaning (e.g. Star, Sword, Fiqh)...'
              }
              className={`w-full py-2 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-all ${
                isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          {/* Remove/Clear current badge if any */}
          {currentBadgeId && (
            <button
              type="button"
              onClick={() => handleChoose(null)}
              className="px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'إزالة الشارة الحالية' : 'Remove Current Badge'}</span>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Badges Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[280px]">
          {filteredBadges.map((b) => {
            const isSelected = currentBadgeId === b.id;
            const title = isAr ? b.nameAr : b.nameEn;
            const meaning = isAr ? b.meaningAr : b.meaningEn;

            return (
              <div
                key={b.id}
                onClick={() => handleChoose(b.id)}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group select-none ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950/50 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                {/* Big 3D Badge on Left */}
                <div className="shrink-0">
                  <Super3DBadge badge={b} size="md" showTooltip={false} />
                </div>

                {/* Badge Info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isSelected ? 'text-emerald-300' : 'text-slate-100 group-hover:text-amber-300'
                      }`}
                    >
                      {title}
                    </h4>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-snug text-slate-400 line-clamp-2 mt-1">
                    {meaning}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredBadges.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              {isAr ? 'لم يتم العثور على شارات مطابقة لبحثك' : 'No badges found matching your search'}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>
            {isAr
              ? '💡 ستظهر الشارة بحجم كبير وثلاثي الأبعاد (3D) في أسفل يسار صورة الشخصية مع حركة بريق.'
              : '💡 The badge will appear prominently in the bottom-left of the portrait with 3D bevels and animated gleam.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
