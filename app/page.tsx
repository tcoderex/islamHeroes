'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Users,
  Settings,
  Moon,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Database,
} from 'lucide-react';
import AdminPasswordModal from '@/components/AdminPasswordModal';
import AdminSettingsModal from '@/components/AdminSettingsModal';
import CharactersView, { CustomCharacter } from '@/components/CharactersView';
import CharacterPreviewModal, { PreviewableCharacter } from '@/components/CharacterPreviewModal';
import HonorBadge from '@/components/HonorBadge';
import GlowingScoreBadge from '@/components/GlowingScoreBadge';
import { getRatingTier } from '@/lib/ratingTiers';
import { AppTheme, THEMES } from '@/lib/theme';
import { DEFAULT_CHARACTERS } from '@/lib/defaultCharacters';

export type SortOption = 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';

export default function HomePage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('tgis');
  const [activeTab, setActiveTab] = useState<'search' | 'characters'>('search');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewCharacter, setPreviewCharacter] = useState<PreviewableCharacter | null>(null);

  // Search view state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [searchPage, setSearchPage] = useState<number>(1);
  const SEARCH_ITEMS_PER_PAGE = 6;
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isAr = lang === 'ar';

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [characters, setCharacters] = useState<CustomCharacter[]>(DEFAULT_CHARACTERS);
  const [dbStatus, setDbStatus] = useState<{
    provider: 'supabase' | 'netlify-blobs' | 'local';
    supabaseConnected: boolean;
    supabaseTableReady: boolean;
    supabaseError?: string;
    url?: string;
  } | null>(null);

  const quickPicks = isAr
    ? ['خالد بن الوليد', 'صلاح الدين', 'عمر بن الخطاب', 'فاطمة الفهرية', 'علي بن أبي طالب', 'طارق بن زياد']
    : ['Khalid ibn al-Walid', 'Salahuddin', 'Umar ibn al-Khattab', 'Fatima al-Fihri', 'Ali ibn Abi Talib', 'Tariq ibn Ziyad'];

  // Load shared character database from server API (Supabase / Netlify Blobs / Shared Server Store)
  const fetchSharedCharacters = async () => {
    try {
      const res = await fetch('/api/characters');
      const data = await res.json();
      if (data.success && Array.isArray(data.characters) && data.characters.length > 0) {
        setCharacters(data.characters);
        try {
          localStorage.setItem('heroes_custom_characters', JSON.stringify(data.characters));
        } catch {
          // ignore
        }
      }
      if (data.dbStatus) {
        setDbStatus(data.dbStatus);
      }
    } catch {
      // Fallback to localStorage if offline
    }
  };

  // Restore client-persisted state safely post-hydration and sync with shared server API
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedAdmin = localStorage.getItem('heroes_admin_active');
        if (savedAdmin === 'true') {
          setIsAdmin(true);
        }
        const savedTheme = localStorage.getItem('heroes_app_theme');
        if (savedTheme === 'tgis' || savedTheme === 'ramadan') {
          setTheme(savedTheme);
        }
        const savedChars = localStorage.getItem('heroes_custom_characters');
        if (savedChars) {
          const parsed = JSON.parse(savedChars);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCharacters(parsed);
          }
        }
      } catch {
        // ignore localStorage access errors
      }

      fetchSharedCharacters();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Toggle Admin on/off when passcode 0001 is entered
  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setActiveTab('search');
      try {
        localStorage.setItem('heroes_admin_active', 'false');
      } catch {
        // ignore
      }
      showToast(isAr ? 'تم تعطيل وضع الإدارة بنجاح' : 'Admin mode disabled successfully');
    } else {
      setIsAdmin(true);
      setActiveTab('characters');
      try {
        localStorage.setItem('heroes_admin_active', 'true');
      } catch {
        // ignore
      }
      showToast(isAr ? 'تم تفعيل وضع الإدارة بنجاح' : 'Admin mode unlocked successfully');
    }
  };

  // Clicking the logo opens the passcode modal (0001)
  const handleLogoClick = () => {
    setIsAdminModalOpen(true);
  };

  const handleAddCharacter = async (newChar: Omit<CustomCharacter, 'id'>) => {
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChar),
      });
      const data = await res.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        try {
          localStorage.setItem('heroes_custom_characters', JSON.stringify(data.characters));
        } catch {
          // ignore
        }
        showToast(
          isAr
            ? 'تمت إضافة الشخصية بنجاح إلى قاعدة بيانات Supabase'
            : 'Character added to shared Supabase database'
        );
        return;
      }
    } catch {
      // ignore, fallback local
    }

    const created: CustomCharacter = {
      ...newChar,
      id: `char-${Date.now()}`,
    };
    const updated = [created, ...characters];
    setCharacters(updated);
    try {
      localStorage.setItem('heroes_custom_characters', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(isAr ? 'تمت إضافة الشخصية بنجاح' : 'Character added successfully');
  };

  const handleUpdateCharacter = async (updatedChar: CustomCharacter) => {
    try {
      const res = await fetch('/api/characters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedChar),
      });
      const data = await res.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        try {
          localStorage.setItem('heroes_custom_characters', JSON.stringify(data.characters));
        } catch {
          // ignore
        }
        showToast(isAr ? 'تم حفظ التعديلات في قاعدة بيانات Supabase' : 'Changes saved to Supabase');
        return;
      }
    } catch {
      // ignore, fallback local
    }

    const updated = characters.map((c) => (c.id === updatedChar.id ? updatedChar : c));
    setCharacters(updated);
    try {
      localStorage.setItem('heroes_custom_characters', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(isAr ? 'تم حفظ التعديلات بنجاح' : 'Character updated successfully');
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      const res = await fetch(`/api/characters?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        try {
          localStorage.setItem('heroes_custom_characters', JSON.stringify(data.characters));
        } catch {
          // ignore
        }
        showToast(isAr ? 'تم حذف الشخصية من Supabase' : 'Character removed from Supabase');
        return;
      }
    } catch {
      // ignore, fallback local
    }

    const updated = characters.filter((c) => c.id !== id);
    setCharacters(updated);
    try {
      localStorage.setItem('heroes_custom_characters', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(isAr ? 'تم حذف الشخصية' : 'Character removed');
  };

  const handleImportCharacters = async (imported: CustomCharacter[]) => {
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characters: imported }),
      });
      const data = await res.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        try {
          localStorage.setItem('heroes_custom_characters', JSON.stringify(data.characters));
        } catch {
          // ignore
        }
        showToast(
          isAr
            ? `تمت استعادة ${data.characters.length} شخصية في قاعدة بيانات Supabase`
            : `Restored ${data.characters.length} figures in Supabase`
        );
        return;
      }
    } catch {
      // ignore, fallback local
    }

    setCharacters(imported);
    try {
      localStorage.setItem('heroes_custom_characters', JSON.stringify(imported));
    } catch {
      // ignore
    }
    showToast(
      isAr
        ? `تمت استعادة ${imported.length} شخصية بنجاح`
        : `Successfully restored ${imported.length} characters`
    );
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('heroes_app_theme', newTheme);
    } catch {
      // ignore
    }
    showToast(
      isAr
        ? `تم تفعيل ${THEMES[newTheme].nameAr}`
        : `Activated ${THEMES[newTheme].nameEn} theme`
    );
  };

  const handleAppendCharacters = async (newChars: CustomCharacter[]) => {
    const freshWithUniqueIds = newChars.map((c, i) => ({
      ...c,
      id: `azhar-${Date.now()}-${i}`,
    }));
    const updated = [...freshWithUniqueIds, ...characters];

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characters: updated }),
      });
      const data = await res.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        try {
          localStorage.setItem('heroes_custom_characters', JSON.stringify(data.characters));
        } catch {
          // ignore
        }
        return;
      }
    } catch {
      // ignore
    }

    setCharacters(updated);
    try {
      localStorage.setItem('heroes_custom_characters', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleReplaceCharacters = async (newChars: CustomCharacter[]) => {
    const freshWithUniqueIds = newChars.map((c, i) => ({
      ...c,
      id: `azhar-${Date.now()}-${i}`,
    }));

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characters: freshWithUniqueIds }),
      });
      const data = await res.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        try {
          localStorage.setItem('heroes_custom_characters', JSON.stringify(data.characters));
        } catch {
          // ignore
        }
        return;
      }
    } catch {
      // ignore
    }

    setCharacters(freshWithUniqueIds);
    try {
      localStorage.setItem('heroes_custom_characters', JSON.stringify(freshWithUniqueIds));
    } catch {
      // ignore
    }
  };

  const handleExportJSON = () => {
    if (characters.length === 0) {
      showToast(isAr ? 'لا توجد شخصيات لتصديرها' : 'No characters to export');
      return;
    }

    try {
      const jsonString = JSON.stringify(characters, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `heroes-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(isAr ? 'تم تصدير النسخة الاحتياطية بنجاح' : 'Exported backup JSON file successfully');
    } catch {
      showToast(isAr ? 'فشل تصدير النسخة الاحتياطية' : 'Failed to export backup file');
    }
  };

  // Open preview modal for character
  const handlePreviewCustomCharacter = (char: CustomCharacter) => {
    setPreviewCharacter({
      id: char.id,
      name: char.name,
      picture: char.picture,
      rating: char.rating,
      summary: char.description || undefined,
    });
  };

  // Filter and sort for the public Search tab
  const filteredSearchCharacters = useMemo(() => {
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

  const totalSearchPages = Math.max(1, Math.ceil(filteredSearchCharacters.length / SEARCH_ITEMS_PER_PAGE));
  const safeSearchPage = Math.min(Math.max(1, searchPage), totalSearchPages);
  const searchStartIndex = (safeSearchPage - 1) * SEARCH_ITEMS_PER_PAGE;
  const searchEndIndex = Math.min(searchStartIndex + SEARCH_ITEMS_PER_PAGE, filteredSearchCharacters.length);
  const paginatedSearchCharacters = filteredSearchCharacters.slice(searchStartIndex, searchEndIndex);

  const isRamadan = theme === 'ramadan';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      lang={lang}
      className={`min-h-screen flex flex-col justify-between antialiased transition-colors duration-300 ${
        isRamadan
          ? 'bg-[#08121d] text-amber-50 selection:bg-amber-400/25 selection:text-amber-300'
          : 'bg-[#f3f7fd] text-slate-800 selection:bg-[#0067c0]/15 selection:text-[#0067c0]'
      }`}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {isRamadan ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 filter blur-[1px] transition-opacity duration-700"
              style={{ backgroundImage: `url('/images/ramadan_fawanis_bg.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#08121d]/90 via-[#08121d]/80 to-[#08121d]" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[500px] rounded-full bg-gradient-to-b from-amber-500/25 via-yellow-600/15 to-transparent blur-3xl opacity-90" />
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-emerald-600/20 via-teal-900/10 to-transparent blur-3xl opacity-70" />
            <div className="absolute bottom-10 left-10 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-600/20 to-transparent blur-3xl opacity-60" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-b from-blue-200/40 via-sky-100/30 to-transparent blur-3xl opacity-75" />
            <div className="absolute bottom-10 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-sky-200/30 to-transparent blur-3xl opacity-60" />
          </>
        )}
      </div>

      {/* Top Header */}
      <header
        className={`relative z-20 w-full px-4 sm:px-6 lg:px-8 py-3.5 border-b backdrop-blur-xl transition-colors duration-200 ${
          isRamadan
            ? 'border-amber-500/25 bg-[#0b1622]/85 text-amber-50'
            : 'border-slate-200/60 bg-white/70 text-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with Admin Toggle Trigger */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5 text-left cursor-pointer transition-transform active:scale-95"
            title={
              isAdmin
                ? isAr
                  ? 'وضع الإدارة مفعل - اضغط للقفل'
                  : 'Admin active - click to lock'
                : isAr
                  ? 'اضغط للدخول كمسؤول'
                  : 'Click to unlock Admin'
            }
          >
            <div
              className={`relative w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-all ${
                isRamadan
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-amber-500/30 group-hover:scale-105'
                  : 'bg-[#0067c0] text-white shadow-blue-500/25 group-hover:bg-[#005fb8]'
              }`}
            >
              {isRamadan ? '🌙' : isAr ? 'إ' : 'HI'}
              {isAdmin && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              )}
            </div>
            <div className="flex flex-col">
              <span
                className={`text-sm font-bold tracking-tight leading-none transition-colors ${
                  isRamadan
                    ? 'text-amber-200 group-hover:text-amber-300'
                    : 'text-slate-900 group-hover:text-[#0067c0]'
                }`}
              >
                {isAr ? 'أبطال الإسلام' : 'Heroes of the Islam'}
              </span>
              {isAdmin ? (
                <span
                  className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
                    isRamadan ? 'text-amber-400' : 'text-emerald-600'
                  }`}
                >
                  {isAr ? 'مشرف مفعل (انقر للقفل)' : 'Admin Active (Click to lock)'}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {dbStatus?.supabaseConnected ? 'Supabase Live' : 'Global Database'}
                </span>
              )}
            </div>
          </button>

          {/* Center festive badge for Ramadan Theme */}
          {isRamadan && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-xs animate-in fade-in duration-300">
              <Moon className="w-3.5 h-3.5 fill-amber-300" />
              <span>{isAr ? 'رمضان كريم · شهر البركات' : 'Ramadan Mubarak'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
          )}

          {/* Right side: Language Toggle */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center p-0.5 rounded-xl border shadow-2xs ${
                isRamadan
                  ? 'bg-[#0f1d2b] border-amber-500/30'
                  : 'bg-white/95 border-slate-200/80'
              }`}
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  !isAr
                    ? isRamadan
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-[#0067c0] text-white shadow-xs'
                    : isRamadan
                      ? 'text-amber-200/70 hover:text-amber-100'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isAr
                    ? isRamadan
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-[#0067c0] text-white shadow-xs'
                    : isRamadan
                      ? 'text-amber-200/70 hover:text-amber-100'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                عربي
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ADMIN NAVIGATION TABS: Appears when Admin mode is unlocked */}
      {isAdmin && (
        <div className="relative z-10 w-full max-w-lg mx-auto pt-4 px-4 flex justify-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center p-1.5 backdrop-blur-xl border rounded-2xl shadow-md w-full gap-1.5 ${
              isRamadan
                ? 'bg-[#0b1723]/95 border-amber-500/40 shadow-amber-500/10'
                : 'bg-white/95 border-slate-200 shadow-slate-200/50'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'search'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm'
                    : 'bg-[#0067c0] text-white shadow-sm'
                  : isRamadan
                    ? 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isAr ? 'البحث' : 'Search'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('characters')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'characters'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm'
                    : 'bg-[#0067c0] text-white shadow-sm'
                  : isRamadan
                    ? 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'إدارة الشخصيات' : 'Characters'}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'characters'
                    ? isRamadan
                      ? 'bg-black/25 text-inherit'
                      : 'bg-white/20'
                    : isRamadan
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-slate-200 text-slate-700'
                }`}
              >
                {characters.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isRamadan
                  ? 'text-amber-300 hover:bg-amber-400/10'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title={isAr ? 'فتح إعدادات المشرف وقاعدة البيانات' : 'Open Admin Settings & Database'}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'الإعدادات' : 'Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-7xl mx-auto">
        {/* If Admin is in Character Studio Mode */}
        {isAdmin && activeTab === 'characters' ? (
          <CharactersView
            characters={characters}
            onAddCharacter={handleAddCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onImportCharacters={handleImportCharacters}
            onPreviewCharacter={handlePreviewCustomCharacter}
            onShowToast={showToast}
            onExportCharacters={handleExportJSON}
            theme={theme}
            isAr={isAr}
            isAdmin={isAdmin}
            dbStatus={dbStatus}
          />
        ) : (
          /* Public Search & Explore View */
          <div className="w-full space-y-6">
            {/* Title Header */}
            <div className="text-center mb-6 w-full max-w-3xl mx-auto">
              {isRamadan && (
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-full max-w-md h-24 sm:h-28 rounded-2xl overflow-hidden border border-amber-500/40 shadow-[0_8px_25px_rgba(245,158,11,0.2)] mb-3 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/ramadan_fawanis_frame.jpg"
                      alt="Ramadan Fawanis Lanterns"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-110 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08121d] via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-sm">
                    <span>🌙</span>
                    <span>{isAr ? 'نفحات رمضانية مباركة · فانوس الخير والبركات' : 'Ramadan Mubarak · Fawanis Edition'}</span>
                    <span>✨</span>
                  </div>
                </div>
              )}

              <h1
                className={`text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 ${
                  isRamadan
                    ? 'bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent'
                    : 'text-slate-900'
                }`}
              >
                {isAr ? 'أبطال الإسلام' : 'Heroes of the Islam'}
              </h1>
              <p
                className={`text-xs sm:text-sm lg:text-base max-w-xl mx-auto leading-relaxed ${
                  isRamadan ? 'text-amber-200/70' : 'text-slate-500'
                }`}
              >
                {isAr
                  ? 'سير وأمجاد عظماء التاريخ الإسلامي مع ميزان الشخصية النوراني والشيطاني'
                  : 'Explore historical figures with angelic and demonic alignment ratings synced with Supabase'}
              </p>
            </div>

            {/* Prominent Search Bar */}
            <div className="w-full max-w-3xl mx-auto">
              <div className="relative group">
                <div
                  className={`relative flex items-center w-full rounded-2xl border transition-all ${
                    isRamadan
                      ? 'bg-[#0c1825]/95 border-amber-500/35 shadow-[0_8px_30px_rgba(245,158,11,0.1)] focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20'
                      : 'bg-white/95 border-slate-200/90 shadow-[0_8px_30px_rgba(0,103,192,0.07),_0_2px_8px_rgba(0,0,0,0.03)] focus-within:border-[#0067c0] focus-within:ring-4 focus-within:ring-[#0067c0]/15'
                  }`}
                >
                  <div
                    className={`px-3.5 sm:px-4 flex items-center justify-center pointer-events-none ${
                      isRamadan ? 'text-amber-400' : 'text-[#0067c0]'
                    }`}
                  >
                    <Search className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchPage(1);
                    }}
                    placeholder={
                      isAr
                        ? 'ابحث في شخصيات وأبطال الإسلام...'
                        : 'Search figures by name, title, or bio...'
                    }
                    className={`w-full h-12 sm:h-14 py-2 bg-transparent text-sm sm:text-base outline-none font-normal ${
                      isRamadan
                        ? 'text-amber-100 placeholder:text-amber-200/40'
                        : 'text-slate-900 placeholder:text-slate-400'
                    }`}
                    autoComplete="off"
                    spellCheck="false"
                  />

                  {searchQuery && (
                    <div className="px-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchPage(1);
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

              {/* Suggestions */}
              {!searchQuery && (
                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
                  <span
                    className={`text-[11px] sm:text-xs font-medium ${
                      isRamadan ? 'text-amber-300/60' : 'text-slate-400'
                    }`}
                  >
                    {isAr ? 'اقتراحات سريعة:' : 'Suggestions:'}
                  </span>
                  {quickPicks.map((pick) => (
                    <button
                      key={pick}
                      type="button"
                      onClick={() => {
                        setSearchQuery(pick);
                        setSearchPage(1);
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

            {/* Results Status & Sorting Bar */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl backdrop-blur-xl border transition-all ${
                isRamadan
                  ? 'bg-[#0c1825]/95 border-amber-500/30 text-amber-50 shadow-[0_8px_30px_rgba(245,158,11,0.08)]'
                  : 'bg-white/90 border-slate-200/80 shadow-[0_4px_20px_rgba(0,103,192,0.06)]'
              } flex flex-col sm:flex-row items-center justify-between gap-3 text-xs`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm">
                  {searchQuery
                    ? isAr
                      ? `نتائج البحث (${filteredSearchCharacters.length} شخصية)`
                      : `Search Results (${filteredSearchCharacters.length} figures)`
                    : isAr
                      ? `جميع الشخصيات (${characters.length})`
                      : `All Figures (${characters.length})`}
                </span>

                {dbStatus?.supabaseConnected && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Database className="w-3 h-3" />
                    <span>Supabase Live</span>
                  </div>
                )}
              </div>

              {/* Sort pills */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium mr-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#0067c0]" />
                  <span>{isAr ? 'ترتيب:' : 'Sort:'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('rating-desc');
                    setSearchPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    sortBy === 'rating-desc'
                      ? isRamadan
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                      : isRamadan
                        ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'الأعلى تقييماً ↓' : 'Highest ↓'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('rating-asc');
                    setSearchPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    sortBy === 'rating-asc'
                      ? isRamadan
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                      : isRamadan
                        ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'الأقل تقييماً ↑' : 'Lowest ↑'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('name-asc');
                    setSearchPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    sortBy === 'name-asc'
                      ? isRamadan
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-[#0067c0] text-white shadow-2xs font-semibold'
                      : isRamadan
                        ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'أ - ي' : 'A - Z'}
                </button>
              </div>
            </div>

            {/* Character Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
              {filteredSearchCharacters.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white/70 dark:bg-black/30 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6">
                  <p className="text-xs sm:text-sm text-slate-500 mb-3">
                    {searchQuery
                      ? isAr
                        ? `لم يتم العثور على نتائج مطابقة لـ "${searchQuery}"`
                        : `No figures found matching "${searchQuery}"`
                      : isAr
                        ? 'لا توجد شخصيات حتى الآن'
                        : 'No figures found.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchPage(1);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-[#0067c0] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                    >
                      {isAr ? 'عرض جميع الشخصيات' : 'Show All Figures'}
                    </button>
                  )}
                </div>
              ) : (
                paginatedSearchCharacters.map((char) => {
                  const charTier = getRatingTier(char.rating);

                  return (
                    <div
                      key={char.id}
                      onClick={() => handlePreviewCustomCharacter(char)}
                      className={`relative flex flex-col rounded-2xl md:rounded-3xl border overflow-hidden backdrop-blur-xl transition-all duration-300 group cursor-pointer active:scale-[0.99] hover:-translate-y-1.5 ${
                        isRamadan
                          ? 'bg-[#0f1e2c]/95 border-amber-500/25 shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:border-amber-400/60 hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)]'
                          : 'bg-white/95 border-slate-200/90 shadow-[0_8px_25px_rgba(0,103,192,0.06)] hover:border-blue-300 hover:shadow-[0_16px_40px_rgba(0,103,192,0.14)]'
                      }`}
                    >
                      {/* Full-bleed Picture Frame */}
                      <div className="relative w-full h-60 sm:h-68 md:h-76 lg:h-84 overflow-hidden shrink-0 select-none bg-slate-100">
                        {char.picture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={char.picture}
                            alt={char.name}
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

                        {/* Top-left: Honor Badge */}
                        <HonorBadge
                          rating={char.rating}
                          isAr={isAr}
                          size="md"
                          className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-20"
                        />

                        {/* Top-center: Glowing Score Badge */}
                        <GlowingScoreBadge
                          rating={char.rating}
                          size="md"
                          className="absolute top-3 sm:top-3.5 left-1/2 -translate-x-1/2 z-20"
                        />
                      </div>

                      {/* Card Content */}
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

                        {/* Bottom Status */}
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

            {/* Pagination Controls */}
            {filteredSearchCharacters.length > SEARCH_ITEMS_PER_PAGE && (
              <div className="bg-white/95 dark:bg-[#0c1825]/95 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/30 p-3 sm:p-3.5 rounded-2xl shadow-[0_4px_16px_rgba(0,103,192,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 dark:text-amber-200/70 font-medium text-[11px] sm:text-xs">
                  {isAr
                    ? `عرض ${searchStartIndex + 1} - ${searchEndIndex} من أصل ${filteredSearchCharacters.length} شخصية`
                    : `Showing ${searchStartIndex + 1} - ${searchEndIndex} of ${filteredSearchCharacters.length} figures`}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                    disabled={safeSearchPage <= 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer font-medium text-xs shadow-2xs"
                  >
                    <ChevronLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    <span className="hidden sm:inline">{isAr ? 'السابق' : 'Prev'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalSearchPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === safeSearchPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setSearchPage(pageNum)}
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
                    onClick={() => setSearchPage((p) => Math.min(totalSearchPages, p + 1))}
                    disabled={safeSearchPage >= totalSearchPages}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer font-medium text-xs shadow-2xs"
                  >
                    <span className="hidden sm:inline">{isAr ? 'التالي' : 'Next'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 text-xs font-medium rounded-xl shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            isRamadan
              ? 'bg-[#0b1723]/95 text-amber-200 border border-amber-400/40 shadow-amber-500/20'
              : 'bg-slate-900/90 text-white'
          }`}
        >
          {toastMessage}
        </div>
      )}

      {/* Clean Minimalist Footer */}
      <footer
        className={`relative z-10 py-4 text-center text-[11px] sm:text-xs border-t transition-colors ${
          isRamadan
            ? 'border-amber-500/20 text-amber-300/50'
            : 'border-slate-200/60 text-slate-400'
        }`}
      >
        <p>
          {isAr
            ? isRamadan
              ? 'أبطال الإسلام · نفحات رمضانية وسير وأمجاد الخالدين'
              : 'أبطال الإسلام · سير وأمجاد'
            : isRamadan
              ? 'Heroes of the Islam · Ramadan Mubarak Edition'
              : 'Heroes of the Islam'}
        </p>
      </footer>

      {/* Admin Passcode Modal (Toggle with 0001) */}
      <AdminPasswordModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminToggle}
        isAr={isAr}
        isAdmin={isAdmin}
      />

      {/* Unified Admin Settings Modal (All settings strictly inside this modal) */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        characters={characters}
        onAppendCharacters={handleAppendCharacters}
        onReplaceCharacters={handleReplaceCharacters}
        onImportCharacters={handleImportCharacters}
        onExportCharacters={handleExportJSON}
        onShowToast={showToast}
        isAr={isAr}
      />

      {/* Character Preview Modal */}
      <CharacterPreviewModal
        character={previewCharacter}
        onClose={() => setPreviewCharacter(null)}
        isAr={isAr}
      />
    </div>
  );
}
