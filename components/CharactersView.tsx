'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  X,
  Check,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Search,
  Database,
  Sparkles,
} from 'lucide-react';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';
import { AppTheme } from '@/lib/theme';
import HonorBadge from './HonorBadge';
import GlowingScoreBadge from './GlowingScoreBadge';

export interface CustomCharacter {
  id: string;
  name: string;
  picture: string;
  rating: number; // -1000 to 1000
  description?: string; // Optional small description
  updatedAt?: number;
}

interface CharactersViewProps {
  characters: CustomCharacter[];
  onAddCharacter: (character: Omit<CustomCharacter, 'id'>) => void;
  onUpdateCharacter?: (character: CustomCharacter) => void;
  onDeleteCharacter: (id: string) => void;
  onImportCharacters?: (characters: CustomCharacter[]) => void;
  onPreviewCharacter?: (character: CustomCharacter) => void;
  onShowToast?: (msg: string) => void;
  onExportCharacters?: () => void;
  theme?: AppTheme;
  isAr: boolean;
  isAdmin?: boolean;
  dbStatus?: {
    provider: 'supabase' | 'netlify-blobs' | 'local';
    supabaseConnected: boolean;
    supabaseTableReady: boolean;
    supabaseError?: string;
    url?: string;
  } | null;
}

export type SortOption = 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';

export default function CharactersView({
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onImportCharacters,
  onPreviewCharacter,
  onShowToast,
  onExportCharacters,
  theme = 'tgis',
  isAr,
  isAdmin = true,
  dbStatus,
}: CharactersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [picture, setPicture] = useState('');
  const [rating, setRating] = useState<number>(850);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const currentTier = getRatingTier(rating);

  const dynamicSuggestions = useMemo(() => {
    if (!characters || characters.length === 0) return [];
    return characters
      .map((c) => {
        const fullName = c.name.trim();
        if (isAr) {
          const arPart = fullName.split('(')[0].trim();
          return arPart || fullName;
        } else {
          const match = fullName.match(/\(([^)]+)\)/);
          return match ? match[1].trim() : fullName;
        }
      })
      .filter((val, idx, arr) => val.length > 0 && arr.indexOf(val) === idx)
      .slice(0, 6);
  }, [characters, isAr]);

  const samplePictures = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  ];

  // Start adding a new character
  const handleStartAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPicture('');
    setRating(850);
    setIsAdding(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  // Start editing an existing character
  const handleStartEdit = (char: CustomCharacter) => {
    setEditingId(char.id);
    setName(char.name);
    setDescription(char.description || '');
    setPicture(char.picture || '');
    setRating(char.rating);
    setIsAdding(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPicture('');
    setRating(850);
    setIsAdding(false);
  };

  // Handle local file upload and compress via canvas for optimal localStorage/Supabase storage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPicture(compressedDataUrl);
        }
        setIsUploading(false);
      };
      img.onerror = () => setIsUploading(false);
      img.src = event.target?.result as string;
    };

    reader.onerror = () => setIsUploading(false);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const boundedRating = Math.max(-1000, Math.min(1000, Number(rating) || 0));

    if (editingId) {
      onUpdateCharacter?.({
        id: editingId,
        name: name.trim(),
        description: description.trim() || undefined,
        picture: picture.trim(),
        rating: boundedRating,
      });
    } else {
      onAddCharacter({
        name: name.trim(),
        description: description.trim() || undefined,
        picture: picture.trim(),
        rating: boundedRating,
      });
    }

    handleCancel();
  };

  const handleImageError = (id: string) => {
    setImgErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  // Filter and sort unified characters list from Supabase
  const filteredAndSortedCharacters = useMemo(() => {
    let list = [...characters];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const descMatch = c.description ? c.description.toLowerCase().includes(q) : false;
        return nameMatch || descMatch;
      });
    }

    return list.sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'rating-asc') return a.rating - b.rating;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, isAr ? 'ar' : 'en');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, isAr ? 'ar' : 'en');
      return 0;
    });
  }, [characters, searchQuery, sortBy, isAr]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCharacters.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedCharacters.length);
  const paginatedCharacters = filteredAndSortedCharacters.slice(startIndex, endIndex);

  const isRamadan = theme === 'ramadan';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* 1. UNIFIED PROMINENT SEARCH BAR */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="relative group">
          <div
            className={`relative flex items-center w-full rounded-2xl border transition-all ${
              isRamadan
                ? 'bg-[#0c1825]/95 border-amber-500/35 shadow-[0_8px_30px_rgba(245,158,11,0.1)] focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20'
                : 'bg-white/95 border-slate-200/90 shadow-[0_8px_30px_rgba(0,103,192,0.07),_0_2px_8px_rgba(0,0,0,0.03)] focus-within:border-[#0067c0] focus-within:ring-4 focus-within:ring-[#0067c0]/15'
            }`}
          >
            {/* Search Icon */}
            <div
              className={`px-3.5 sm:px-4 flex items-center justify-center pointer-events-none ${
                isRamadan ? 'text-amber-400' : 'text-[#0067c0]'
              }`}
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث في شخصيات وأبطال الإسلام المتزامنة مع Supabase...'
                  : 'Search Supabase characters by name, title, or bio...'
              }
              className={`w-full h-12 sm:h-14 py-2 bg-transparent text-sm sm:text-base outline-none font-normal ${
                isRamadan
                  ? 'text-amber-100 placeholder:text-amber-200/40'
                  : 'text-slate-900 placeholder:text-slate-400'
              }`}
              autoComplete="off"
              spellCheck="false"
            />

            {/* Clear Button */}
            {searchQuery && (
              <div className="px-3 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleQueryChange('');
                    searchInputRef.current?.focus();
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isRamadan
                      ? 'text-amber-300/60 hover:text-amber-200 hover:bg-white/10'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isAr ? 'مسح' : 'Clear'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        {!searchQuery && dynamicSuggestions.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
            <span
              className={`text-[11px] sm:text-xs font-medium ${
                isRamadan ? 'text-amber-300/60' : 'text-slate-400'
              }`}
            >
              {isAr ? 'اقتراحات الشخصيات:' : 'Character Suggestions:'}
            </span>
            {dynamicSuggestions.map((pick) => (
              <button
                key={pick}
                type="button"
                onClick={() => {
                  handleQueryChange(pick);
                  searchInputRef.current?.focus();
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs transition-colors cursor-pointer shadow-2xs ${
                  isRamadan
                    ? 'bg-[#0f2130] hover:bg-[#152e42] text-amber-200 hover:text-amber-100 border border-amber-500/30'
                    : 'bg-white/80 hover:bg-blue-50 text-slate-700 hover:text-[#0067c0] border border-slate-200/70'
                }`}
              >
                {pick}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. TOP ACTION & DATABASE STATUS TOOLBAR */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-xl border transition-all ${
          isRamadan
            ? 'bg-[#0c1825]/95 border-amber-500/30 text-amber-50 shadow-[0_8px_30px_rgba(245,158,11,0.08)]'
            : 'bg-white/90 border-slate-200/80 shadow-[0_4px_20px_rgba(0,103,192,0.06)]'
        } space-y-3`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: Heading + Supabase Badge */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                className={`text-sm sm:text-base font-bold ${
                  isRamadan ? 'text-amber-300' : 'text-slate-900'
                }`}
              >
                {isAr ? 'أبطال وشخصيات الإسلام' : 'Heroes of Islam Figures'}
              </h2>

              {/* Supabase Status Pill - Only shown when admin is active */}
              {isAdmin && dbStatus?.supabaseConnected && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                  title="Connected to Supabase PostgreSQL database"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Database className="w-3 h-3" />
                  <span>Supabase Live</span>
                </div>
              )}
            </div>

            <p
              className={`text-[11px] sm:text-xs ${
                isRamadan ? 'text-amber-200/60' : 'text-slate-500'
              }`}
            >
              {searchQuery
                ? isAr
                  ? `نتائج البحث عن "${searchQuery}" (${filteredAndSortedCharacters.length} شخصية)`
                  : `Search results for "${searchQuery}" (${filteredAndSortedCharacters.length} figures)`
                : isAr
                  ? `قاعدة بيانات مشتركة تضم ${characters.length} شخصية مع ميزان التقييم النوراني والشيطاني`
                  : `Shared database of ${characters.length} figures with moral alignment ratings`}
            </p>
          </div>

          {/* Right Action: Add Character */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartAdd}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98] ${
                isRamadan
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-amber-500/20'
                  : 'bg-[#0067c0] hover:bg-[#005fb8] text-white shadow-blue-500/20'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? 'إضافة شخصية' : 'Add Character'}</span>
            </button>
          </div>
        </div>

        {/* Sorting Controls */}
        <div
          className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
            isRamadan ? 'border-amber-500/20' : 'border-slate-100'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 font-medium text-[11px] sm:text-xs ${
              isRamadan ? 'text-amber-200/70' : 'text-slate-500'
            }`}
          >
            <ArrowUpDown className={`w-3.5 h-3.5 ${isRamadan ? 'text-amber-400' : 'text-[#0067c0]'}`} />
            <span>{isAr ? 'ترتيب حسب:' : 'Sort by:'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => handleSortChange('rating-desc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'rating-desc'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : isRamadan
                    ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'الأعلى تقييماً (ملائكي ↓)' : 'Rating (High ↓)'}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('rating-asc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'rating-asc'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : isRamadan
                    ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'الأقل تقييماً (شيطاني ↑)' : 'Rating (Low ↑)'}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('name-asc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'name-asc'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : isRamadan
                    ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'الاسم (أ - ي)' : 'Name (A - Z)'}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('name-desc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'name-desc'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : isRamadan
                    ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? 'الاسم (ي - أ)' : 'Name (Z - A)'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. ADD / EDIT CHARACTER FORM MODAL */}
      {isAdding && (
        <div
          ref={formRef}
          className={`backdrop-blur-xl border rounded-2xl p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            isRamadan
              ? 'bg-[#0c1825]/95 border-amber-500/40 text-amber-50 shadow-[0_12px_40px_rgba(245,158,11,0.15)]'
              : 'bg-white/95 border-blue-200/90 shadow-[0_12px_36px_rgba(0,103,192,0.1)]'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b mb-4 ${
              isRamadan ? 'border-amber-500/20' : 'border-slate-100'
            }`}
          >
            <h3
              className={`text-sm font-bold flex items-center gap-2 ${
                isRamadan ? 'text-amber-300' : 'text-slate-900'
              }`}
            >
              {editingId ? (
                <>
                  <Pencil className="w-4 h-4 text-[#0067c0]" />
                  <span>{isAr ? 'تعديل بيانات الشخصية' : 'Edit Character'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#0067c0]" />
                  <span>{isAr ? 'إضافة شخصية جديدة' : 'Add New Character'}</span>
                </>
              )}
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name and Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-amber-200 mb-1">
                  {isAr ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'اسم الشخصية...' : 'Character name...'}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 focus:bg-white focus:border-[#0067c0] focus:ring-3 focus:ring-[#0067c0]/15 outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-amber-200">
                    {isAr ? 'الوصف' : 'Description'}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? '(اختياري)' : '(Optional)'}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={140}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: قائد عسكري بارز، مؤرخ، عالم...'
                      : 'e.g. Commander of Syria, scholar in Cairo...'
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 focus:bg-white focus:border-[#0067c0] focus:ring-3 focus:ring-[#0067c0]/15 outline-none transition-all"
                />
              </div>
            </div>

            {/* Photo Upload + URL */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-amber-200 mb-1.5">
                {isAr ? 'الصورة (رفع من الجهاز أو رابط)' : 'Picture (Upload or URL)'}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0067c0] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isUploading
                      ? isAr
                        ? 'جارِ التحميل...'
                        : 'Uploading...'
                      : isAr
                        ? 'رفع صورة من الجهاز'
                        : 'Upload Photo from Device'}
                  </span>
                </button>

                {picture && (
                  <button
                    type="button"
                    onClick={() => setPicture('')}
                    className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 rounded cursor-pointer"
                  >
                    {isAr ? 'إزالة الصورة' : 'Remove Photo'}
                  </button>
                )}
              </div>

              {picture && (
                <div className="mb-2 flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200/80 dark:border-white/10">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={picture}
                      alt="preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {isAr ? 'تم تحديد الصورة' : 'Photo ready'}
                  </span>
                </div>
              )}

              <input
                type="url"
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
                placeholder={isAr ? 'أو أدخل رابط الصورة...' : 'Or enter image URL...'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 focus:bg-white focus:border-[#0067c0] focus:ring-3 focus:ring-[#0067c0]/15 outline-none transition-all font-mono"
              />

              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-400">
                  {isAr ? 'أمثلة سريعة:' : 'Presets:'}
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {samplePictures.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPicture(src)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        picture === src ? 'border-[#0067c0] scale-105' : 'border-slate-200 hover:border-slate-400'
                      }`}
                      title={`Preset ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt="preset"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating Slider (-1000 to +1000) */}
            <div className={`p-3.5 rounded-xl border ${currentTier.borderColor} ${currentTier.bgLight} transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TierIcon tierKey={currentTier.key} className="w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-800">
                    {isAr ? currentTier.nameAr : currentTier.nameEn}
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${currentTier.badgeGradient}`}
                >
                  {rating > 0 ? `+${rating}` : rating}
                </span>
              </div>

              <input
                type="range"
                min={-1000}
                max={1000}
                step={10}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-[#0067c0] cursor-pointer"
              />

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                <span className="text-purple-600 font-bold" title="-1000 to -500: Devil">
                  😈 -1000
                </span>
                <span className="text-rose-500 font-medium">-500</span>
                <input
                  type="number"
                  min={-1000}
                  max={1000}
                  value={rating}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRating(isNaN(val) ? 0 : Math.max(-1000, Math.min(1000, val)));
                  }}
                  className="w-16 px-1.5 py-0.5 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#0067c0]"
                />
                <span className="text-emerald-600 font-medium">+500</span>
                <span className="text-sky-500 font-bold" title="850 to 1000: Angel">
                  😇 +1000
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#0067c0] hover:bg-[#005fb8] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {editingId
                  ? isAr
                    ? 'حفظ التعديلات في Supabase'
                    : 'Save Changes to Supabase'
                  : isAr
                    ? 'حفظ الشخصية في Supabase'
                    : 'Save Character to Supabase'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. UNIFIED CHARACTERS GRID (CONNECTED TO SUPABASE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
        {filteredAndSortedCharacters.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/70 dark:bg-black/30 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6">
            <p className="text-xs sm:text-sm text-slate-500 mb-3">
              {searchQuery
                ? isAr
                  ? `لم يتم العثور على شخصيات تطابق "${searchQuery}"`
                  : `No figures found matching "${searchQuery}"`
                : isAr
                  ? 'لا توجد شخصيات حتى الآن'
                  : 'No characters in database yet.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#0067c0] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                >
                  {isAr ? 'عرض جميع الشخصيات' : 'Show All Figures'}
                </button>
              )}
              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0067c0] hover:bg-[#005fb8] rounded-xl transition-colors cursor-pointer"
              >
                {isAr ? 'إضافة شخصية جديدة' : 'Add First Character'}
              </button>
            </div>
          </div>
        ) : (
          paginatedCharacters.map((char) => {
            const hasError = imgErrorMap[char.id];
            const charTier = getRatingTier(char.rating);

            return (
              <div
                key={char.id}
                onClick={() => onPreviewCharacter?.(char)}
                className={`relative flex flex-col rounded-2xl md:rounded-3xl border overflow-hidden backdrop-blur-xl transition-all duration-300 group cursor-pointer active:scale-[0.99] hover:-translate-y-1.5 ${
                  isRamadan
                    ? 'bg-[#0f1e2c]/95 border-amber-500/25 shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-400/60 hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)]'
                    : 'bg-white/95 border-slate-200/90 shadow-[0_8px_25px_rgba(0,103,192,0.06)] hover:border-blue-300 hover:shadow-[0_16px_40px_rgba(0,103,192,0.14)]'
                }`}
              >
                {/* Full-bleed Picture Frame: Picture covers the entire frame starting at the very top edge with ZERO black gap */}
                <div className="relative w-full h-60 sm:h-68 md:h-76 lg:h-84 overflow-hidden shrink-0 select-none bg-slate-100">
                  {char.picture && !hasError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={char.picture}
                      alt={char.name}
                      onError={() => handleImageError(char.id)}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center font-bold text-3xl sm:text-5xl select-none ${
                        isRamadan
                          ? 'bg-gradient-to-br from-[#122637] to-[#1a384f] text-amber-300'
                          : 'bg-gradient-to-br from-slate-100 to-sky-100 text-sky-500'
                      }`}
                    >
                      <span>{char.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}

                  {/* 1. ON PICTURE TOP-LEFT: Honor Badge */}
                  <HonorBadge
                    rating={char.rating}
                    isAr={isAr}
                    size="md"
                    className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-20"
                  />

                  {/* 2. ON PICTURE MIDDLE-TOP: Glowing Score Badge */}
                  <GlowingScoreBadge
                    rating={char.rating}
                    size="md"
                    className="absolute top-3 sm:top-3.5 left-1/2 -translate-x-1/2 z-20"
                  />

                  {/* 3. ON PICTURE TOP-RIGHT: Admin Actions (Edit & Delete) */}
                  <div
                    className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 flex items-center gap-1 z-20 bg-slate-950/75 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-white/20 text-white shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleStartEdit(char)}
                      className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                      title={isAr ? 'تعديل بيانات الشخصية' : 'Edit character'}
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCharacter(char.id)}
                      className="p-1 sm:p-1.5 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-500/30 transition-all cursor-pointer"
                      title={isAr ? 'حذف الشخصية' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Character Details: Name, Description, and Tier */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3
                      className={`text-base sm:text-lg md:text-xl font-bold transition-colors truncate ${
                        isRamadan
                          ? 'text-amber-100 group-hover:text-amber-300'
                          : 'text-slate-900 group-hover:text-[#0067c0]'
                      }`}
                    >
                      {char.name}
                    </h3>

                    {char.description ? (
                      <p
                        className={`text-xs sm:text-sm line-clamp-2 mt-1.5 leading-relaxed ${
                          isRamadan ? 'text-amber-200/70' : 'text-slate-600'
                        }`}
                      >
                        {char.description}
                      </p>
                    ) : (
                      <p
                        className={`text-xs mt-1.5 ${
                          isRamadan ? 'text-amber-200/40' : 'text-slate-400'
                        }`}
                      >
                        {isAr ? 'انقر لعرض تفاصيل الشخصية' : 'Click to view full preview'}
                      </p>
                    )}
                  </div>

                  {/* Bottom Status & Preview Hint */}
                  <div
                    className={`flex items-center justify-between pt-3 mt-4 border-t w-full text-xs ${
                      isRamadan
                        ? 'border-amber-500/20 text-amber-200/80'
                        : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-[11px] text-slate-400">
                        {isAr ? 'المرتبة:' : 'Tier:'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${charTier.bgLight} ${charTier.textColor} border ${charTier.borderColor}`}
                      >
                        {isAr ? charTier.nameAr : charTier.nameEn}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs group-hover:underline ${
                        isRamadan ? 'text-amber-300' : 'text-[#0067c0]'
                      }`}
                    >
                      <span>{isAr ? 'معاينة' : 'Preview'}</span>
                      <span className={isAr ? 'rotate-180' : ''}>→</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. PAGINATION CONTROLS */}
      {filteredAndSortedCharacters.length > ITEMS_PER_PAGE && (
        <div className="bg-white/95 dark:bg-[#0c1825]/95 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/30 p-3 sm:p-3.5 rounded-2xl shadow-[0_4px_16px_rgba(0,103,192,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-amber-200/70 font-medium text-[11px] sm:text-xs">
            {isAr
              ? `عرض ${startIndex + 1} - ${endIndex} من أصل ${filteredAndSortedCharacters.length} شخصية`
              : `Showing ${startIndex + 1} - ${endIndex} of ${filteredAndSortedCharacters.length} figures`}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer font-medium text-xs shadow-2xs"
            >
              <ChevronLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline">{isAr ? 'السابق' : 'Prev'}</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === safeCurrentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? isRamadan
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-[#0067c0] text-white shadow-xs'
                        : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer font-medium text-xs shadow-2xs"
            >
              <span className="hidden sm:inline">{isAr ? 'التالي' : 'Next'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
