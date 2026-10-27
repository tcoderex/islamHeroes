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
  Download,
  FileUp,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';
import { AppTheme } from '@/lib/theme';

export interface CustomCharacter {
  id: string;
  name: string;
  picture: string;
  rating: number; // -1000 to 1000
  description?: string; // Optional small description
}

interface CharactersViewProps {
  characters: CustomCharacter[];
  onAddCharacter: (character: Omit<CustomCharacter, 'id'>) => void;
  onUpdateCharacter?: (character: CustomCharacter) => void;
  onDeleteCharacter: (id: string) => void;
  onImportCharacters?: (characters: CustomCharacter[]) => void;
  onPreviewCharacter?: (character: CustomCharacter) => void;
  onShowToast?: (msg: string) => void;
  onOpenSettings?: () => void;
  onExportCharacters?: () => void;
  theme?: AppTheme;
  isAr: boolean;
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
  onOpenSettings,
  onExportCharacters,
  theme = 'tgis',
  isAr,
}: CharactersViewProps) {
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
  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const currentTier = getRatingTier(rating);

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

  // Handle local file upload and compress via canvas for optimal localStorage storage
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

  // Export characters to a JSON file
  const handleExportJSON = () => {
    if (characters.length === 0) {
      onShowToast?.(isAr ? 'لا توجد شخصيات لتصديرها' : 'No characters to export');
      return;
    }

    try {
      const jsonString = JSON.stringify(characters, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `heroes-characters-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast?.(isAr ? 'تم تصدير ملف JSON بنجاح' : 'Exported characters to JSON file');
    } catch {
      onShowToast?.(isAr ? 'فشل تصدير الملف' : 'Failed to export JSON file');
    }
  };

  // Import characters from a JSON file to restore
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Imported JSON is not an array');
        }

        const validList: CustomCharacter[] = parsed
          .filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              typeof item.name === 'string' &&
              item.name.trim().length > 0
          )
          .map((item, idx) => ({
            id:
              typeof item.id === 'string' && item.id.trim()
                ? item.id
                : `imported-${Date.now()}-${idx}`,
            name: String(item.name).trim(),
            description:
              typeof item.description === 'string' && item.description.trim()
                ? item.description.trim()
                : undefined,
            picture: typeof item.picture === 'string' ? item.picture.trim() : '',
            rating:
              typeof item.rating === 'number' && !isNaN(item.rating)
                ? Math.max(-1000, Math.min(1000, item.rating))
                : 500,
          }));

        if (validList.length === 0) {
          onShowToast?.(
            isAr
              ? 'الملف لا يحتوي على بيانات شخصيات صالحة'
              : 'File does not contain valid character records'
          );
          return;
        }

        onImportCharacters?.(validList);
      } catch {
        onShowToast?.(
          isAr
            ? 'خطأ في معالجة ملف JSON'
            : 'Error reading JSON file. Please check format.'
        );
      }
    };

    reader.onerror = () => {
      onShowToast?.(isAr ? 'فشلت قراءة الملف' : 'Could not read the uploaded file');
    };

    reader.readAsText(file);
    e.target.value = '';
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

  // Sort characters by Rating or Names
  const sortedCharacters = useMemo(() => {
    return [...characters].sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'rating-asc') return a.rating - b.rating;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [characters, sortBy]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(sortedCharacters.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sortedCharacters.length);
  const paginatedCharacters = sortedCharacters.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* Hidden JSON file input for Import */}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJSON}
        className="hidden"
      />

      {/* Top Action Bar with Settings, Export, Import, Sort & Add */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-xl border transition-all ${
          theme === 'ramadan'
            ? 'bg-[#0c1825]/95 border-amber-500/30 text-amber-50 shadow-[0_8px_30px_rgba(245,158,11,0.08)]'
            : 'bg-white/90 border-slate-200/80 shadow-[0_4px_20px_rgba(0,103,192,0.06)]'
        } space-y-3`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2
              className={`text-sm sm:text-base font-bold ${
                theme === 'ramadan' ? 'text-amber-300' : 'text-slate-900'
              }`}
            >
              {isAr ? 'إدارة الشخصيات (لوحة المشرف)' : 'Character Manager (Admin)'}
            </h2>
            <p
              className={`text-[11px] sm:text-xs ${
                theme === 'ramadan' ? 'text-amber-200/60' : 'text-slate-500'
              }`}
            >
              {isAr
                ? 'إضافة وتعديل وتقييم الشخصيات من النوراني الملائكي (+1000) إلى الشيطاني (-1000)'
                : 'Manage and rank figures from Angelic (+1000) to Demonic (-1000)'}
            </p>
          </div>

          {/* Action Buttons: Settings (Theme/Template/Backup) and Add */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                  theme === 'ramadan'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 ring-1 ring-amber-400/50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                title={isAr ? 'إعدادات المشرف (السمات، النماذج، النسخ الاحتياطي)' : 'Admin Settings (Theme, Templates, Backup)'}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isAr ? 'الإعدادات والنسخ الاحتياطي' : 'Settings & Backup'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStartAdd}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98] ${
                theme === 'ramadan'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  : 'bg-[#0067c0] hover:bg-[#005fb8] text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة شخصية' : 'Add Character'}</span>
            </button>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] sm:text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#0067c0]" />
            <span>{isAr ? 'ترتيب حسب:' : 'Sort by:'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => handleSortChange('rating-desc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'rating-desc'
                  ? 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {isAr ? 'الأعلى تقييماً (ملائكي ↓)' : 'Rating (High ↓)'}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('rating-asc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'rating-asc'
                  ? 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {isAr ? 'الأقل تقييماً (شيطاني ↑)' : 'Rating (Low ↑)'}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('name-asc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'name-asc'
                  ? 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {isAr ? 'الاسم (أ - ي)' : 'Name (A - Z)'}
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('name-desc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'name-desc'
                  ? 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {isAr ? 'الاسم (ي - أ)' : 'Name (Z - A)'}
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Character Form Modal / Slide-down */}
      {isAdding && (
        <div
          ref={formRef}
          className="bg-white/95 backdrop-blur-xl border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(0,103,192,0.1)] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
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
            {/* Fields 1 & 2: Name and Optional Description in responsive 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isAr ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'اسم الشخصية...' : 'Character name...'}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0067c0] focus:ring-3 focus:ring-[#0067c0]/15 outline-none transition-all"
                />
              </div>

              {/* Field 2: Optional Small Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">
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
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0067c0] focus:ring-3 focus:ring-[#0067c0]/15 outline-none transition-all"
                />
              </div>
            </div>

            {/* Field 3: Photo Upload + URL */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
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
                <div className="mb-2 flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
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
                className="w-full px-3 py-2 text-xs bg-slate-50/80 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0067c0] focus:ring-3 focus:ring-[#0067c0]/15 outline-none transition-all font-mono"
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

            {/* Field 4: 5-Tier Rating Slider from -1000 to 1000 */}
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

              {/* Slider */}
              <input
                type="range"
                min={-1000}
                max={1000}
                step={10}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-[#0067c0] cursor-pointer"
              />

              {/* 5 Tier Legend & Numeric Input */}
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
                    ? 'حفظ التعديلات'
                    : 'Save Changes'
                  : isAr
                    ? 'حفظ الشخصية'
                    : 'Save Character'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Characters List: Normal compact on mobile, large & prominent on PC/laptop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
        {sortedCharacters.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/70 rounded-2xl border border-dashed border-slate-200 p-6">
            <p className="text-xs sm:text-sm text-slate-500 mb-3">
              {isAr ? 'لا توجد شخصيات حتى الآن' : 'No characters added yet.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#0067c0] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
              >
                {isAr ? 'أضف أول شخصية' : 'Add First Character'}
              </button>
              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {isAr ? 'استيراد من JSON' : 'Import from JSON'}
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
                className={`relative flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-4 p-3 md:p-5 backdrop-blur-xl border rounded-2xl md:rounded-3xl transition-all duration-200 group cursor-pointer active:scale-[0.99] md:hover:-translate-y-1.5 ${
                  theme === 'ramadan'
                    ? 'bg-[#0f1e2c]/95 border-amber-500/25 shadow-[0_4px_20px_rgba(245,158,11,0.06)] hover:border-amber-400/60 md:hover:shadow-2xl'
                    : 'bg-white/95 border-slate-200/90 shadow-[0_4px_16px_rgba(0,103,192,0.05)] hover:border-blue-300 md:hover:shadow-xl'
                }`}
              >
                {/* 1. Picture Frame: Compact on mobile, expansive artwork frame on PC */}
                <div
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-full md:h-60 lg:h-68 rounded-xl md:rounded-2xl overflow-hidden shrink-0 border shadow-2xs md:shadow-sm ${
                    theme === 'ramadan'
                      ? 'bg-[#14283b] border-amber-500/30'
                      : 'bg-slate-100 border-slate-200/70'
                  }`}
                >
                  {char.picture && !hasError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={char.picture}
                      alt={char.name}
                      onError={() => handleImageError(char.id)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center font-bold text-lg md:text-5xl select-none ${
                        theme === 'ramadan'
                          ? 'bg-gradient-to-br from-[#122637] to-[#1a384f] text-amber-300'
                          : 'bg-gradient-to-br from-blue-50 to-sky-100 text-[#0067c0]'
                      }`}
                    >
                      <span>{char.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}

                  {/* PC Only: Floating Moral Alignment Badge directly on photo */}
                  <div
                    className={`hidden md:flex absolute bottom-3 ${
                      isAr ? 'right-3' : 'left-3'
                    } items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border backdrop-blur-md shadow-md ${charTier.bgLight} ${charTier.borderColor} ${charTier.textColor}`}
                  >
                    <TierIcon tierKey={charTier.key} className="w-3.5 h-3.5" />
                    <span>{char.rating > 0 ? `+${char.rating}` : char.rating}</span>
                  </div>

                  {/* PC Only: Subtle shadow gradient at bottom of picture */}
                  <div className="hidden md:block absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                </div>

                {/* 2. Character Details: Name, Description, and Tier */}
                <div className="min-w-0 flex-1 pr-14 pl-2 md:p-0 md:flex-1 md:flex md:flex-col md:justify-between">
                  <div>
                    <h3
                      className={`text-sm sm:text-base md:text-xl lg:text-2xl font-bold md:font-extrabold transition-colors truncate md:line-clamp-1 ${
                        theme === 'ramadan'
                          ? 'text-amber-100 group-hover:text-amber-300'
                          : 'text-slate-900 group-hover:text-[#0067c0]'
                      }`}
                    >
                      {char.name}
                    </h3>

                    {char.description ? (
                      <p
                        className={`text-[11px] md:text-xs truncate md:line-clamp-2 md:whitespace-normal mt-0.5 md:mt-1.5 leading-relaxed ${
                          theme === 'ramadan' ? 'text-amber-200/60' : 'text-slate-500'
                        }`}
                      >
                        {char.description}
                      </p>
                    ) : (
                      <p
                        className={`text-[10px] md:text-xs mt-0.5 md:mt-1.5 ${
                          theme === 'ramadan' ? 'text-amber-200/40' : 'text-slate-400'
                        }`}
                      >
                        {isAr ? 'انقر لعرض تفاصيل الشخصية' : 'Click to view full preview'}
                      </p>
                    )}
                  </div>

                  {/* Mobile Only: Inline Rating Tier Pill */}
                  <div className="md:hidden mt-1.5 flex items-center gap-1.5">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${charTier.bgLight} ${charTier.borderColor} ${charTier.textColor}`}
                    >
                      <TierIcon tierKey={charTier.key} className="w-3.5 h-3.5" />
                      <span>{char.rating > 0 ? `+${char.rating}` : char.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isAr ? charTier.nameAr.split('/')[0] : charTier.nameEn.split('/')[0]}
                    </span>
                  </div>

                  {/* PC Only: Dedicated Bottom Status & Preview Hint */}
                  <div
                    className={`hidden md:flex items-center justify-between pt-3 mt-3 border-t w-full text-xs ${
                      theme === 'ramadan'
                        ? 'border-amber-500/20 text-amber-200/80'
                        : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-[11px] text-slate-400">
                        {isAr ? 'المرتبة:' : 'Tier:'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-xs ${charTier.bgLight} ${charTier.textColor} border ${charTier.borderColor}`}
                      >
                        {isAr ? charTier.nameAr : charTier.nameEn}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs group-hover:underline ${
                        theme === 'ramadan' ? 'text-amber-300' : 'text-[#0067c0]'
                      }`}
                    >
                      <span>{isAr ? 'معاينة' : 'Preview'}</span>
                      <span className={isAr ? 'rotate-180' : ''}>→</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Edit & Delete beside each other - elevated glass capsule on PC */}
                <div
                  className={`absolute top-2.5 md:top-3.5 ${
                    isAr ? 'left-2.5 md:left-3.5' : 'right-2.5 md:right-3.5'
                  } flex items-center gap-1 z-20 md:bg-white/95 md:dark:bg-slate-900/90 md:backdrop-blur-md md:p-1 md:rounded-xl md:shadow-md md:border md:border-slate-200/90 ${
                    theme === 'ramadan' ? 'md:bg-[#0c1825]/90 md:border-amber-500/40' : ''
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleStartEdit(char)}
                    className="p-1.5 md:p-2 rounded-lg text-slate-500 hover:text-[#0067c0] hover:bg-blue-50 dark:hover:bg-amber-500/20 opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                    title={isAr ? 'تعديل بيانات الشخصية' : 'Edit character'}
                  >
                    <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCharacter(char.id)}
                    className="p-1.5 md:p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                    title={isAr ? 'حذف الشخصية' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls for Characters Tab */}
      {sortedCharacters.length > ITEMS_PER_PAGE && (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl shadow-[0_4px_16px_rgba(0,103,192,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Summary */}
          <div className="text-slate-500 font-medium text-[11px] sm:text-xs">
            {isAr
              ? `عرض ${startIndex + 1} - ${endIndex} من أصل ${sortedCharacters.length} شخصية`
              : `Showing ${startIndex + 1} - ${endIndex} of ${sortedCharacters.length} characters`}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Previous Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer font-medium text-xs shadow-2xs"
              title={isAr ? 'الصفحة السابقة' : 'Previous page'}
            >
              <ChevronLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline">{isAr ? 'السابق' : 'Prev'}</span>
            </button>

            {/* Numeric Page Buttons */}
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
                        ? 'bg-[#0067c0] text-white shadow-xs'
                        : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer font-medium text-xs shadow-2xs"
              title={isAr ? 'الصفحة التالية' : 'Next page'}
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
