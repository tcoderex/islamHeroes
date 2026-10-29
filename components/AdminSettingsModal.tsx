'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  Settings,
  Palette,
  Moon,
  Sun,
  BookOpen,
  Download,
  FileUp,
  Check,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Database,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AppTheme, THEMES } from '@/lib/theme';
import { AZHAR_SCHOLARS_TEMPLATE } from '@/lib/azhar-scholars-template';
import { CustomCharacter } from '@/components/CharactersView';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  characters: CustomCharacter[];
  onAppendCharacters: (newChars: CustomCharacter[]) => void;
  onReplaceCharacters: (newChars: CustomCharacter[]) => void;
  onImportCharacters: (imported: CustomCharacter[]) => void;
  onExportCharacters: () => void;
  onShowToast: (msg: string) => void;
  isAr: boolean;
}

export default function AdminSettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  characters,
  onAppendCharacters,
  onReplaceCharacters,
  onImportCharacters,
  onExportCharacters,
  onShowToast,
  isAr,
}: AdminSettingsModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'theme' | 'template' | 'backup' | 'supabase'>('theme');
  const [showConfirmReplace, setShowConfirmReplace] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const supabaseSqlSchema = `-- 1. Create characters table in public schema
CREATE TABLE IF NOT EXISTS public.characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  picture TEXT DEFAULT '',
  rating NUMERIC DEFAULT 0,
  description TEXT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- 3. Set open policies for shared characters app
CREATE POLICY "Public Read" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON public.characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.characters FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON public.characters FOR DELETE USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    onShowToast(isAr ? 'تم نسخ استعلام SQL إلى الحافظة' : 'SQL Schema copied to clipboard');
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const res = await fetch('/api/supabase/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onShowToast(
          isAr
            ? `تمت مزامنة ${data.count} شخصية مع Supabase بنجاح!`
            : `Synced ${data.count} figures with Supabase successfully!`
        );
      } else if (data.tableMissing) {
        onShowToast(
          isAr
            ? 'يرجى إنشاء جدول characters أولاً في محرر Supabase SQL'
            : 'Please run the SQL schema first in Supabase SQL editor'
        );
      } else {
        onShowToast(data.error || (isAr ? 'فشلت المزامنة' : 'Sync failed'));
      }
    } catch {
      onShowToast(isAr ? 'خطأ في الاتصال مع Supabase' : 'Connection error with Supabase');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  if (!isOpen) return null;

  const handleAppendTemplate = () => {
    onAppendCharacters(AZHAR_SCHOLARS_TEMPLATE);
    onShowToast(
      isAr
        ? 'تمت إضافة 10 من شيوخ الأزهر الشريف بنجاح إلى القائمة!'
        : 'Successfully added 10 Al-Azhar scholars to the list!'
    );
  };

  const handleReplaceTemplate = () => {
    onReplaceCharacters(AZHAR_SCHOLARS_TEMPLATE);
    setShowConfirmReplace(false);
    onShowToast(
      isAr
        ? 'تم تعيين نموذج شيوخ الأزهر الشريف (10 علماء) كقائمة رئيسية!'
        : 'Replaced character list with the 10 Al-Azhar scholars template!'
    );
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Not an array');
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
          onShowToast(
            isAr
              ? 'الملف لا يحتوي على بيانات شخصيات صالحة'
              : 'File does not contain valid character records'
          );
          return;
        }

        onImportCharacters(validList);
        onShowToast(
          isAr
            ? `تمت استعادة ${validList.length} شخصية بنجاح من النسخة الاحتياطية`
            : `Successfully restored ${validList.length} figures from backup`
        );
      } catch {
        onShowToast(
          isAr ? 'خطأ في معالجة ملف JSON' : 'Error reading JSON backup file'
        );
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const isRamadan = theme === 'ramadan';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        className="hidden"
      />

      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isRamadan
            ? 'bg-[#0c1824] border-amber-500/40 text-amber-50 shadow-[0_20px_60px_rgba(245,158,11,0.15)]'
            : 'bg-white border-slate-200 text-slate-800 shadow-[0_20px_60px_rgba(0,103,192,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Festive Ramadan top light beam if active */}
        {isRamadan && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        )}

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${
            isRamadan
              ? 'border-amber-500/20 bg-[#0f2130]'
              : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                isRamadan
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-[#0067c0] text-white shadow-md shadow-blue-500/25'
              }`}
            >
              <Settings className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                {isAr ? 'إعدادات لوحة المشرف' : 'Admin Settings'}
              </h2>
              <p
                className={`text-xs ${
                  isRamadan ? 'text-amber-200/70' : 'text-slate-500'
                }`}
              >
                {isAr
                  ? 'السمات، وتصدير النسخ الاحتياطية، ونماذج شيوخ الأزهر'
                  : 'Theme, Backup Export, and Al-Azhar Scholars Template'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isRamadan
                ? 'text-amber-200/70 hover:text-amber-100 hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs Navigation - Responsive scrollable bar */}
        <div
          className={`flex items-center gap-1.5 px-3 sm:px-6 pt-3 pb-2 border-b text-xs font-semibold overflow-x-auto scrollbar-none whitespace-nowrap ${
            isRamadan ? 'border-amber-500/20 bg-[#0a1520]' : 'border-slate-100 bg-slate-50/30'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveSubTab('theme')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'theme'
                ? isRamadan
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'bg-[#0067c0] text-white shadow-sm font-bold'
                : isRamadan
                  ? 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{isAr ? 'السمة (المظهر)' : 'Theme'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('template')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'template'
                ? isRamadan
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'bg-[#0067c0] text-white shadow-sm font-bold'
                : isRamadan
                  ? 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isAr ? 'نموذج شيوخ الأزهر' : 'Azhar Template'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'backup'
                ? isRamadan
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'bg-[#0067c0] text-white shadow-sm font-bold'
                : isRamadan
                  ? 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'النسخ الاحتياطي' : 'Export & Backup'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('supabase')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'supabase'
                ? isRamadan
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'bg-[#0067c0] text-white shadow-sm font-bold'
                : isRamadan
                  ? 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-500" />
            <span className="flex items-center gap-1.5">
              <span>Supabase</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: THEME SELECTOR (tgis vs ramadan) */}
          {activeSubTab === 'theme' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'اختيار سمة التطبيق (Theme)' : 'Select App Theme'}</span>
                </h3>
                <p
                  className={`text-xs mt-1 ${
                    isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                  }`}
                >
                  {isAr
                    ? 'اختر بين المظهر الافتراضي الهادئ (tgis) أو المظهر الرمضاني الفاخر ببريق الذهب وأجواء الشهر الفضيل'
                    : 'Switch between the default clean aesthetic (tgis) and the festive, golden Ramadan theme.'}
                </p>
              </div>

              {/* Theme Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. TGIS (Default) Theme */}
                <div
                  onClick={() => onThemeChange('tgis')}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    theme === 'tgis'
                      ? 'border-[#0067c0] bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                      : isRamadan
                        ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#0067c0] text-white flex items-center justify-center">
                          <Sun className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-900">
                          {THEMES.tgis.nameAr}
                        </span>
                      </div>
                      {theme === 'tgis' && (
                        <div className="w-5 h-5 rounded-full bg-[#0067c0] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      {isAr ? THEMES.tgis.descriptionAr : THEMES.tgis.descriptionEn}
                    </p>
                  </div>

                  {/* Visual Swatch */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#0067c0] border border-white shadow-xs" />
                    <span className="w-4 h-4 rounded-full bg-[#f3f7fd] border border-slate-300 shadow-xs" />
                    <span className="w-4 h-4 rounded-full bg-sky-400 border border-white shadow-xs" />
                    <span className="text-[11px] font-mono font-medium text-slate-500">
                      tgis (Default)
                    </span>
                  </div>
                </div>

                {/* 2. RAMADAN Theme */}
                <div
                  onClick={() => onThemeChange('ramadan')}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    theme === 'ramadan'
                      ? 'border-amber-400 bg-gradient-to-br from-[#0c1f2f] to-[#122b28] shadow-[0_8px_30px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/30'
                      : 'border-amber-500/30 bg-[#0d1b28]/80 hover:border-amber-400/60'
                  }`}
                >
                  {/* Decorative crescent sparkle */}
                  <div className="absolute top-2 left-2 text-amber-300 opacity-60">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-bold">
                          <Moon className="w-4 h-4 fill-slate-950" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                            <span>{isAr ? 'رمضان مبارك' : 'Ramadan Mubarak'}</span>
                            <span className="text-xs">🌙</span>
                          </span>
                        </div>
                      </div>
                      {theme === 'ramadan' && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-amber-100/70 mb-3">
                      {isAr ? THEMES.ramadan.descriptionAr : THEMES.ramadan.descriptionEn}
                    </p>
                  </div>

                  {/* Visual Swatch */}
                  <div className="pt-2 border-t border-amber-500/25 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-300 shadow-xs" />
                    <span className="w-4 h-4 rounded-full bg-[#08111a] border border-amber-500/40 shadow-xs" />
                    <span className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-400 shadow-xs" />
                    <span className="text-[11px] font-mono font-medium text-amber-300">
                      ramadan (Festive)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  isRamadan
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    : 'border-blue-200 bg-blue-50 text-blue-900'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {isAr
                    ? `السمة الحالية: ${THEMES[theme].nameAr}. يتم حفظ التفضيل تلقائياً في متصفحك.`
                    : `Active Theme: ${THEMES[theme].nameEn}. Preference is automatically saved.`}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: AZHAR SCHOLARS TEMPLATE */}
          {activeSubTab === 'template' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'نموذج شيوخ الأزهر الشريف (10 علماء أجلاء)' : 'Al-Azhar Scholars Template (10 Figures)'}</span>
                </h3>
                <p
                  className={`text-xs mt-1 ${
                    isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                  }`}
                >
                  {isAr
                    ? 'نموذج متكامل يضم 10 من أشهر وأجلّ شيوخ وعلماء الأزهر الشريف عبر التاريخ المعاصر (بما فيهم الشيخ محمد متولي الشعراوي والشيخ عبد الله رشدي).'
                    : 'A curated template featuring 10 revered Al-Azhar scholars, including Sheikh Muhammad Metwalli Al-Sha\'rawi and Sheikh Abdullah Rushdy.'}
                </p>
              </div>

              {/* Preview Grid of the 10 Scholars */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isRamadan
                    ? 'border-amber-500/25 bg-[#0e1d2c]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAr ? 'قائمة الشيوخ المضمنين (10):' : 'Included Scholars (10):'}</span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">
                    +10 Scholars
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {AZHAR_SCHOLARS_TEMPLATE.map((scholar, idx) => (
                    <div
                      key={scholar.id}
                      className={`p-2 rounded-xl border flex items-center gap-2.5 transition-colors ${
                        isRamadan
                          ? 'border-amber-500/20 bg-[#122638] text-amber-100'
                          : 'border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-300">
                        {scholar.picture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={scholar.picture}
                            alt={scholar.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-emerald-100 text-emerald-800">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">
                            {scholar.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1 rounded shrink-0">
                            +{scholar.rating}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] truncate ${
                            isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                          }`}
                        >
                          {scholar.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons to Add or Replace */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Append Button */}
                <button
                  type="button"
                  onClick={handleAppendTemplate}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isRamadan
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 shadow-md shadow-amber-500/20'
                      : 'bg-[#0067c0] text-white hover:bg-[#005fb8] shadow-md shadow-blue-500/20'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {isAr
                      ? 'إضافة شيوخ الأزهر إلى القائمة الحالية (+10)'
                      : 'Append 10 Scholars to Current List'}
                  </span>
                </button>

                {/* Replace Button with confirmation */}
                {!showConfirmReplace ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReplace(true)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isRamadan
                        ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استبدال القائمة بالنموذج' : 'Replace with Template'}</span>
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 p-1 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="text-[11px] text-rose-700 font-bold px-2">
                      {isAr ? 'هل أنت متأكد؟' : 'Are you sure?'}
                    </span>
                    <button
                      type="button"
                      onClick={handleReplaceTemplate}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isAr ? 'نعم، استبدل' : 'Yes, Replace'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReplace(false)}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 text-xs cursor-pointer"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT & BACKUP */}
          {activeSubTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#0067c0]" />
                  <span>{isAr ? 'النسخ الاحتياطي وتصدير البيانات' : 'Export & Data Backup'}</span>
                </h3>
                <p
                  className={`text-xs mt-1 ${
                    isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                  }`}
                >
                  {isAr
                    ? 'احفظ جميع الشخصيات والتقييمات في ملف JSON على جهازك، أو استعد نسخة سابقة في أي وقت.'
                    : 'Save all figures and ratings into a JSON file, or restore a previous backup anytime.'}
                </p>
              </div>

              {/* Status info */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isRamadan
                    ? 'border-amber-500/25 bg-[#0e1d2c]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-xs font-bold block">
                      {isAr ? 'عدد الشخصيات المسجلة حالياً' : 'Total Saved Figures'}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                      }`}
                    >
                      {isAr ? 'تشمل الشخصيات المخصصة والمستوردة' : 'Includes custom and template figures'}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-base font-bold px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                  {characters.length}
                </span>
              </div>

              {/* Backup Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Export Button */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isRamadan
                      ? 'border-amber-500/20 bg-[#122638]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <Download className="w-4 h-4 text-emerald-500" />
                      <span>{isAr ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup (JSON)'}</span>
                    </div>
                    <p
                      className={`text-[11px] mb-3 ${
                        isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                      }`}
                    >
                      {isAr
                        ? 'تنزيل ملف بصيغة JSON يحتوي على كامل الأسماء والصور والتقييمات.'
                        : 'Download a JSON file containing all characters, images, and ratings.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onExportCharacters}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isRamadan
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm'
                        : 'bg-[#0067c0] text-white hover:bg-[#005fb8] shadow-sm'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAr ? 'تنزيل ملف النسخة الاحتياطية' : 'Download Backup File'}</span>
                  </button>
                </div>

                {/* 2. Import Button */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isRamadan
                      ? 'border-amber-500/20 bg-[#122638]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <FileUp className="w-4 h-4 text-sky-500" />
                      <span>{isAr ? 'استعادة من ملف (JSON)' : 'Restore from Backup (JSON)'}</span>
                    </div>
                    <p
                      className={`text-[11px] mb-3 ${
                        isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                      }`}
                    >
                      {isAr
                        ? 'اختر ملف JSON محفوظ سابقاً لاستعادة جميع الشخصيات في ثوانٍ.'
                        : 'Select a previously saved JSON file to restore characters in seconds.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isRamadan
                        ? 'border-amber-500/30 text-amber-200 hover:bg-white/5'
                        : 'border-blue-200 bg-blue-50/70 text-[#0067c0] hover:bg-blue-100'
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    <span>{isAr ? 'رفع ملف النسخة الاحتياطية' : 'Upload Backup File'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPABASE DATABASE */}
          {activeSubTab === 'supabase' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'قاعدة بيانات Supabase السحابية' : 'Supabase Cloud Database'}</span>
                </h3>
                <p
                  className={`text-xs mt-1 ${
                    isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                  }`}
                >
                  {isAr
                    ? 'ربط مباشر مع قاعدة بيانات PostgreSQL على Supabase لمزامنة الشخصيات فورياً عبر جميع الأجهزة والمستخدمين.'
                    : 'Direct connection to your PostgreSQL database on Supabase for real-time figure sync across all users.'}
                </p>
              </div>

              {/* Connection Status Card */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isRamadan
                    ? 'border-emerald-500/30 bg-[#0c1f2b]'
                    : 'border-emerald-200 bg-emerald-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isAr ? 'تم الاتصال بمشروع Supabase بنجاح' : 'Connected to Supabase Project'}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-600/15 text-emerald-600 font-bold">
                    tcoderex
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200/60 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Project URL:</span>
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate block">
                      https://lezucbsacxcygxxhbjwk.supabase.co
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200/60 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Key Status:</span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Publishable Key Active</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingSupabase}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isRamadan
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-sm'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                    <span>
                      {isSyncingSupabase
                        ? isAr
                          ? 'جارِ المزامنة...'
                          : 'Syncing...'
                        : isAr
                          ? 'مزامنة الشخصيات مع Supabase'
                          : 'Sync Characters to Supabase'}
                    </span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/lezucbsacxcygxxhbjwk/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:bg-white/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>{isAr ? 'فتح محرر SQL' : 'Open SQL Editor'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* SQL Schema Creation Section */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isRamadan
                    ? 'border-amber-500/25 bg-[#0e1d2c]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-amber-200">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isAr ? 'إنشاء جدول characters (خطوة لمرة واحدة في Supabase):' : 'Create characters Table (One-time Setup):'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      copiedSql
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0067c0] text-white hover:bg-[#005fb8]'
                    }`}
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{isAr ? 'نسخ كود SQL' : 'Copy SQL'}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'قم بلصق الكود التالي في محرر SQL في لوحة تحكم Supabase واضغط Run لإنشاء الجدول وسياسات الأمان العامة.'
                    : 'Paste the following query into your Supabase SQL Editor and click Run to create the table and enable shared read/write policies.'}
                </p>

                <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed text-left" dir="ltr">
                  <code>{supabaseSqlSchema}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-end px-5 sm:px-6 py-3 border-t ${
            isRamadan ? 'border-amber-500/20 bg-[#0a1520]' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              isRamadan
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isAr ? 'إغلاق الإعدادات' : 'Close Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
