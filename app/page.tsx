'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ArrowUpDown, ChevronLeft, ChevronRight, Settings, Moon, Sparkles } from 'lucide-react';
import { HEROES, BilingualHero } from '@/lib/heroes-data';
import AdminPasswordModal from '@/components/AdminPasswordModal';
import AdminSettingsModal from '@/components/AdminSettingsModal';
import CharactersView, { CustomCharacter, SortOption } from '@/components/CharactersView';
import CharacterPreviewModal, { PreviewableCharacter } from '@/components/CharacterPreviewModal';
import HonorBadge from '@/components/HonorBadge';
import GlowingScoreBadge from '@/components/GlowingScoreBadge';
import { getRatingTier, TierIcon } from '@/lib/ratingTiers';
import { AppTheme, THEMES } from '@/lib/theme';

const DEFAULT_CHARACTERS: CustomCharacter[] = [
  {
    id: 'char-1',
    name: 'Khalid ibn al-Walid',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    rating: 1000,
    description: 'Sayf Allah al-Maslul (The Drawn Sword of Allah)',
  },
  {
    id: 'char-2',
    name: 'Salahuddin al-Ayyubi',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 980,
    description: 'The Liberator of Jerusalem',
  },
  {
    id: 'char-3',
    name: 'Umar ibn al-Khattab',
    picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 990,
    description: 'Al-Faruq (The Distinguisher of Truth)',
  },
];

export default function HomePage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [query, setQuery] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('tgis');
  const [activeTab, setActiveTab] = useState<'search' | 'characters'>('search');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewCharacter, setPreviewCharacter] = useState<PreviewableCharacter | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [searchPage, setSearchPage] = useState<number>(1);
  const SEARCH_ITEMS_PER_PAGE = 6;

  const isAr = lang === 'ar';
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [characters, setCharacters] = useState<CustomCharacter[]>(DEFAULT_CHARACTERS);

  // Load shared character database from server API (Netlify Blobs / Shared Server Store)
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

  // Clicking the logo always repeats the same popup method
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
            ? 'تمت إضافة الشخصية بنجاح إلى قاعدة البيانات المشتركة'
            : 'Character added to shared database'
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
        showToast(isAr ? 'تم حفظ التعديلات بنجاح في قاعدة البيانات المشتركة' : 'Changes saved to shared database');
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
        showToast(isAr ? 'تم حذف الشخصية من قاعدة البيانات المشتركة' : 'Character removed from shared database');
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
            ? `تمت استعادة ${data.characters.length} شخصية في قاعدة البيانات المشتركة`
            : `Restored ${data.characters.length} characters in shared database`
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

  // Open preview modal for built-in hero
  const handlePreviewHero = (hero: BilingualHero) => {
    setPreviewCharacter({
      id: hero.id,
      name: isAr ? hero.name.ar : hero.name.en,
      secondaryName: isAr ? hero.name.en : hero.name.ar,
      title: isAr ? hero.title.ar : hero.title.en,
      era: isAr ? hero.era.ar : hero.era.en,
      summary: isAr ? hero.summary.ar : hero.summary.en,
      picture: hero.picture,
      rating: hero.rating ?? 1000,
    });
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

  // Filter heroes and characters based on query (returns all items when query is empty)
  const filteredHeroes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HEROES;

    return HEROES.filter((hero) => {
      const nameEn = hero.name.en.toLowerCase();
      const nameAr = hero.name.ar;
      const titleEn = hero.title.en.toLowerCase();
      const titleAr = hero.title.ar;
      const summaryEn = hero.summary.en.toLowerCase();
      const summaryAr = hero.summary.ar;

      return (
        nameEn.includes(q) ||
        nameAr.includes(q) ||
        titleEn.includes(q) ||
        titleAr.includes(q) ||
        summaryEn.includes(q) ||
        summaryAr.includes(q)
      );
    });
  }, [query]);

  const filteredCustomCharacters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ? c.description.toLowerCase().includes(q) : false)
    );
  }, [query, characters]);

  // Unified search results combining both historical heroes and custom characters
  const combinedSearchResults = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'custom' | 'hero';
      name: string;
      subtitle?: string;
      description?: string;
      picture?: string;
      rating: number;
      rawHero?: BilingualHero;
      rawCustom?: CustomCharacter;
    }> = [];

    filteredCustomCharacters.forEach((c) => {
      items.push({
        id: `custom-${c.id}`,
        type: 'custom',
        name: c.name,
        description: c.description,
        picture: c.picture,
        rating: c.rating,
        rawCustom: c,
      });
    });

    filteredHeroes.forEach((h) => {
      items.push({
        id: `hero-${h.id}`,
        type: 'hero',
        name: isAr ? h.name.ar : h.name.en,
        subtitle: isAr ? `${h.title.ar} • ${h.era.ar}` : `${h.title.en} • ${h.era.en}`,
        description: isAr ? h.summary.ar : h.summary.en,
        picture: h.picture,
        rating: h.rating ?? 1000,
        rawHero: h,
      });
    });

    return items.sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'rating-asc') return a.rating - b.rating;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, isAr ? 'ar' : 'en');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, isAr ? 'ar' : 'en');
      return 0;
    });
  }, [filteredCustomCharacters, filteredHeroes, sortBy, isAr]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSearchPage(1);
  };

  const handleSortChange = (val: SortOption) => {
    setSortBy(val);
    setSearchPage(1);
  };

  const totalSearchPages = Math.max(1, Math.ceil(combinedSearchResults.length / SEARCH_ITEMS_PER_PAGE));
  const safeSearchPage = Math.min(Math.max(1, searchPage), totalSearchPages);
  const searchStartIndex = (safeSearchPage - 1) * SEARCH_ITEMS_PER_PAGE;
  const searchEndIndex = Math.min(searchStartIndex + SEARCH_ITEMS_PER_PAGE, combinedSearchResults.length);
  const paginatedSearchResults = combinedSearchResults.slice(searchStartIndex, searchEndIndex);



  const isRamadan = theme === 'ramadan';

  const quickPicks = isAr
    ? ['خالد بن الوليد', 'صلاح الدين الأيوبي', 'عمر بن الخطاب', 'فاطمة الفهرية', 'الشعراوي']
    : ['Khalid ibn al-Walid', 'Salahuddin al-Ayyubi', 'Umar ibn al-Khattab', 'Fatima al-Fihri', "Al-Sha'rawi"];

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
      {/* Ambient decorative background glow & AI Generated Ramadan Fawanis visuals */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {isRamadan ? (
          <>
            {/* AI Generated Ramadan Fawanis background image with dark overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 filter blur-[1px] transition-opacity duration-700"
              style={{ backgroundImage: `url('/images/ramadan_fawanis_bg.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#08121d]/90 via-[#08121d]/80 to-[#08121d]" />

            {/* Glowing Fawanis Lantern Ambient Light Spheres */}
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

      {/* Top Header: Logo with Admin Toggle Trigger & Language Switcher */}
      <header
        className={`relative z-20 w-full px-4 sm:px-6 lg:px-8 py-3.5 border-b backdrop-blur-xl transition-colors duration-200 ${
          isRamadan
            ? 'border-amber-500/25 bg-[#0b1622]/85 text-amber-50'
            : 'border-slate-200/60 bg-white/70 text-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* LOGO: Clicking always opens popup to toggle Admin (Activate or Disable with 0001) */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5 text-left cursor-pointer transition-transform active:scale-95"
            title={
              isAdmin
                ? isAr
                  ? 'وضع الإدارة مفعل - اضغط للتعطيل'
                  : 'Admin active - click to disable'
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
              {isAdmin && (
                <span
                  className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
                    isRamadan ? 'text-amber-400' : 'text-emerald-600'
                  }`}
                >
                  {isAr ? 'مشرف مفعل (انقر للقفل)' : 'Admin Active (Click to lock)'}
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

          {/* Right side: Admin Settings Button (when active) & Language Toggle */}
          <div className="flex items-center gap-2">
            {/* Admin Settings Button in Header */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-amber-500/20'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                title={isAr ? 'إعدادات المشرف (السمات، النماذج، النسخ الاحتياطي)' : 'Admin Settings (Theme, Templates, Backup)'}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'الإعدادات' : 'Settings'}</span>
              </button>
            )}

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

      {/* Admin Tabs: Appears when Admin is unlocked */}
      {isAdmin && (
        <div className="relative z-10 w-full max-w-lg mx-auto pt-4 px-4 flex justify-center">
          <div
            className={`flex items-center p-1 backdrop-blur-xl border rounded-2xl shadow-sm w-full gap-1 ${
              isRamadan
                ? 'bg-[#0b1723]/90 border-amber-500/30'
                : 'bg-white/90 border-slate-200/90'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'search'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                    : 'bg-[#0067c0] text-white shadow-xs'
                  : isRamadan
                    ? 'text-amber-200/70 hover:text-amber-100'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isAr ? 'البحث' : 'Search'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('characters')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'characters'
                  ? isRamadan
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                    : 'bg-[#0067c0] text-white shadow-xs'
                  : isRamadan
                    ? 'text-amber-200/70 hover:text-amber-100'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{isAr ? 'الشخصيات' : 'Characters'}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isRamadan ? 'bg-black/25 text-inherit' : 'bg-white/20'
                }`}
              >
                {characters.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isRamadan
                  ? 'text-amber-300 hover:bg-amber-400/10'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title={isAr ? 'فتح إعدادات المشرف' : 'Open Admin Settings'}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'الإعدادات' : 'Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Expands gracefully up to max-w-7xl on widescreen/laptops */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 w-full max-w-7xl mx-auto">
        {activeTab === 'characters' && isAdmin ? (
          /* Characters View (Photo Upload, Name, and 5-tier Rating from +1000 to -1000 + Sort) */
          <CharactersView
            characters={characters}
            onAddCharacter={handleAddCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onImportCharacters={handleImportCharacters}
            onPreviewCharacter={handlePreviewCustomCharacter}
            onShowToast={showToast}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onExportCharacters={handleExportJSON}
            theme={theme}
            isAr={isAr}
          />
        ) : (
          /* Clean Search View */
          <>
            {/* Title - Centered & Ergonomic */}
            <div className="text-center mb-6 sm:mb-8 w-full max-w-3xl mx-auto">
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
                  : 'Explore historical figures with angelic and demonic alignment ratings'}
              </p>
            </div>

            {/* The Search Input - Centered for comfortable typing on desktop */}
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

                  {/* Text Input - comfortable touch target for mobile (min 48px height) */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder={
                      isAr
                        ? 'ابحث عن بطل، لقب، أو معركة...'
                        : 'Search heroes by name, title, or era...'
                    }
                    className={`w-full h-12 sm:h-14 py-2 bg-transparent text-sm sm:text-base outline-none font-normal ${
                      isRamadan
                        ? 'text-amber-100 placeholder:text-amber-200/40'
                        : 'text-slate-900 placeholder:text-slate-400'
                    }`}
                    autoComplete="off"
                    spellCheck="false"
                  />

                  {/* Clear button */}
                  {query && (
                    <div className="px-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          handleQueryChange('');
                          inputRef.current?.focus();
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

              {/* Quick Suggestions when search is empty */}
              {!query && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
                  <span
                    className={`text-[11px] sm:text-xs font-medium ${
                      isRamadan ? 'text-amber-300/60' : 'text-slate-400'
                    }`}
                  >
                    {isAr ? 'أمثلة:' : 'Suggestions:'}
                  </span>
                  {quickPicks.map((pick) => (
                    <button
                      key={pick}
                      type="button"
                      onClick={() => {
                        handleQueryChange(pick);
                        inputRef.current?.focus();
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

            {/* Cards Display with 5-Tier Moral Rating System - Full Width Container */}
            <div
              className={`mt-6 w-full backdrop-blur-xl border rounded-2xl p-3.5 sm:p-5 lg:p-6 space-y-4 transition-colors ${
                isRamadan
                  ? 'bg-[#0a1521]/95 border-amber-500/30 shadow-[0_16px_50px_rgba(245,158,11,0.08)] text-amber-50'
                  : 'bg-white/95 border-slate-200/90 shadow-[0_12px_36px_rgba(0,103,192,0.08)]'
              }`}
            >
                {/* Sort Controls & Section Header */}
                <div
                  className={`pb-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
                    isRamadan ? 'border-amber-500/20' : 'border-slate-100'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 font-medium text-[11px] sm:text-xs ${
                      isRamadan ? 'text-amber-200/80' : 'text-slate-500'
                    }`}
                  >
                    <ArrowUpDown className={`w-3.5 h-3.5 ${isRamadan ? 'text-amber-400' : 'text-[#0067c0]'}`} />
                    <span>
                      {query
                        ? isAr
                          ? `النتائج (${combinedSearchResults.length}):`
                          : `Results (${combinedSearchResults.length}):`
                        : isAr
                          ? `أبطال وشخصيات الإسلام (${combinedSearchResults.length}):`
                          : `Heroes of Islam Figures (${combinedSearchResults.length}):`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSortChange('rating-desc')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        sortBy === 'rating-desc'
                          ? isRamadan
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                            : 'bg-[#0067c0] text-white font-semibold'
                          : isRamadan
                            ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isAr ? 'الأعلى (ملائكي ↓)' : 'Rating (High)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange('rating-asc')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        sortBy === 'rating-asc'
                          ? isRamadan
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                            : 'bg-[#0067c0] text-white font-semibold'
                          : isRamadan
                            ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isAr ? 'الأقل (شيطاني ↑)' : 'Rating (Low)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange('name-asc')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        sortBy === 'name-asc'
                          ? isRamadan
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                            : 'bg-[#0067c0] text-white font-semibold'
                          : isRamadan
                            ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isAr ? 'الاسم (أ-ي)' : 'Name (A-Z)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange('name-desc')}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        sortBy === 'name-desc'
                          ? isRamadan
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-2xs'
                            : 'bg-[#0067c0] text-white font-semibold'
                          : isRamadan
                            ? 'bg-[#122436] text-amber-200/70 hover:bg-[#172d42]'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isAr ? 'الاسم (ي-أ)' : 'Name (Z-A)'}
                    </button>
                  </div>
                </div>

                {combinedSearchResults.length === 0 ? (
                  <div className="py-8 text-center text-xs sm:text-sm text-slate-500">
                    <p>
                      {isAr
                        ? `لم يتم العثور على نتائج تطابق "${query}"`
                        : `No heroes found matching "${query}"`}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleQueryChange('')}
                      className="mt-2 text-xs text-[#0067c0] hover:underline cursor-pointer"
                    >
                      {isAr ? 'عرض جميع الشخصيات' : 'Show all figures'}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Cards Display Grid: Normal compact on mobile, large & prominent on PC/laptop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-6">
                      {paginatedSearchResults.map((item) => {
                        const tier = getRatingTier(item.rating);
                        const isHero = item.type === 'hero';

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (isHero && item.rawHero) {
                                handlePreviewHero(item.rawHero);
                              } else if (item.rawCustom) {
                                handlePreviewCustomCharacter(item.rawCustom);
                              }
                            }}
                            className={`relative flex flex-col rounded-2xl md:rounded-3xl border overflow-hidden backdrop-blur-xl transition-all duration-300 active:scale-[0.99] group cursor-pointer hover:-translate-y-1.5 ${
                              isRamadan
                                ? 'bg-[#0f1f2d]/90 hover:bg-[#142838] border-amber-500/25 hover:border-amber-400/60 text-amber-50 shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)]'
                                : 'bg-white/95 hover:bg-white border-slate-200/90 hover:border-blue-300 text-slate-900 shadow-[0_8px_25px_rgba(0,103,192,0.06)] hover:shadow-[0_16px_40px_rgba(0,103,192,0.14)]'
                            }`}
                          >
                            {/* Full-bleed Picture Frame: Picture covers the entire frame starting at the very top edge */}
                            <div
                              className="relative w-full h-60 sm:h-68 md:h-76 lg:h-84 overflow-hidden shrink-0 select-none bg-slate-100"
                            >
                              {/* 1. Main Picture: Absolute inset-0 ensures 100% full coverage from top to bottom with NO black gaps */}
                              {item.picture ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.picture}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div
                                  className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center font-bold text-3xl sm:text-5xl select-none ${
                                    isRamadan
                                      ? 'text-amber-300 bg-gradient-to-br from-[#122637] to-[#1a384f]'
                                      : 'text-sky-500 bg-gradient-to-br from-slate-100 to-sky-100'
                                  }`}
                                >
                                  <span>{item.name.charAt(0)}</span>
                                </div>
                              )}

                              {/* 2. ON PICTURE TOP-LEFT: Honor Badge (Only Icon, No Text) */}
                              <HonorBadge
                                rating={item.rating}
                                isAr={isAr}
                                size="md"
                                className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-20"
                              />

                              {/* 3. ON PICTURE MIDDLE-TOP: Glowing Score Badge */}
                              <GlowingScoreBadge
                                rating={item.rating}
                                size="md"
                                className="absolute top-3 sm:top-3.5 left-1/2 -translate-x-1/2 z-20"
                              />

                              {/* 4. ON PICTURE TOP-RIGHT: Era / Category pill */}
                              {item.rawHero?.era && (
                                <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-slate-950/75 backdrop-blur-md text-amber-200/90 border border-white/15 shadow-sm max-w-[130px] truncate">
                                  {isAr ? item.rawHero.era.ar : item.rawHero.era.en}
                                </div>
                              )}
                            </div>

                            {/* Card Body: Details, Subtitle, Description, and Tier */}
                            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                              <div>
                                <h3
                                  className={`text-base sm:text-lg md:text-xl font-bold transition-colors leading-snug truncate ${
                                    isRamadan
                                      ? 'text-amber-100 group-hover:text-amber-300'
                                      : 'text-slate-900 group-hover:text-[#0067c0]'
                                  }`}
                                >
                                  {item.name}
                                </h3>

                                {item.subtitle && (
                                  <p
                                    className={`text-xs sm:text-sm font-semibold truncate mt-0.5 ${
                                      isRamadan ? 'text-amber-400' : 'text-[#0067c0]'
                                    }`}
                                  >
                                    {item.subtitle}
                                  </p>
                                )}

                                {item.description ? (
                                  <p
                                    className={`text-xs sm:text-sm line-clamp-2 mt-1.5 leading-relaxed ${
                                      isRamadan ? 'text-amber-200/70' : 'text-slate-600'
                                    }`}
                                  >
                                    {item.description}
                                  </p>
                                ) : (
                                  <span
                                    className={`text-xs block mt-1.5 ${
                                      isRamadan ? 'text-amber-200/50' : 'text-slate-400'
                                    }`}
                                  >
                                    {isAr ? 'اضغط لعرض تفاصيل الشخصية' : 'Click to preview details'}
                                  </span>
                                )}
                              </div>

                              {/* Bottom Info / Status Bar */}
                              <div
                                className={`flex items-center justify-between pt-3 mt-4 border-t w-full text-xs ${
                                  isRamadan ? 'border-amber-500/20 text-amber-200/80' : 'border-slate-100 text-slate-500'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <span className="text-[11px] text-slate-400">
                                    {isAr ? 'المرتبة:' : 'Tier:'}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${tier.bgLight} ${tier.textColor} border ${tier.borderColor}`}
                                  >
                                    {isAr ? tier.nameAr : tier.nameEn}
                                  </span>
                                </div>

                                <span
                                  className={`inline-flex items-center gap-1 font-bold text-xs group-hover:underline ${
                                    isRamadan ? 'text-amber-300' : 'text-[#0067c0]'
                                  }`}
                                >
                                  <span>{isAr ? 'عرض التفاصيل' : 'View Details'}</span>
                                  <span className={isAr ? 'rotate-180' : ''}>→</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Bar for Search Tab */}
                    {combinedSearchResults.length > SEARCH_ITEMS_PER_PAGE && (
                      <div
                        className={`pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ${
                          isRamadan ? 'border-amber-500/20' : 'border-slate-100'
                        }`}
                      >
                        {/* Summary Counter */}
                        <span
                          className={`font-medium text-[11px] sm:text-xs ${
                            isRamadan ? 'text-amber-200/70' : 'text-slate-500'
                          }`}
                        >
                          {isAr
                            ? `عرض ${searchStartIndex + 1} - ${searchEndIndex} من أصل ${combinedSearchResults.length} شخصية`
                            : `Showing ${searchStartIndex + 1} - ${searchEndIndex} of ${combinedSearchResults.length} figures`}
                        </span>

                        {/* Page Buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Previous Button */}
                          <button
                            type="button"
                            onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                            disabled={safeSearchPage <= 1}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer font-medium text-xs shadow-2xs ${
                              isRamadan
                                ? 'border-amber-500/30 bg-[#0f2130] hover:bg-[#152e42] text-amber-200'
                                : 'border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                            title={isAr ? 'الصفحة السابقة' : 'Previous page'}
                          >
                            <ChevronLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                            <span className="hidden sm:inline">{isAr ? 'السابق' : 'Prev'}</span>
                          </button>

                          {/* Numeric Buttons */}
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
                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-xs'
                                        : 'bg-[#0067c0] text-white shadow-xs'
                                      : isRamadan
                                        ? 'bg-[#0f2130] border border-amber-500/30 text-amber-200 hover:bg-[#152e42] shadow-2xs'
                                        : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          {/* Next Button */}
                          <button
                            type="button"
                            onClick={() => setSearchPage((p) => Math.min(totalSearchPages, p + 1))}
                            disabled={safeSearchPage >= totalSearchPages}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer font-medium text-xs shadow-2xs ${
                              isRamadan
                                ? 'border-amber-500/30 bg-[#0f2130] hover:bg-[#152e42] text-amber-200'
                                : 'border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                            title={isAr ? 'الصفحة التالية' : 'Next page'}
                          >
                            <span className="hidden sm:inline">{isAr ? 'التالي' : 'Next'}</span>
                            <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
          </>
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

      {/* Admin Settings Modal (Theme, Azhar Template, Export & Backup) */}
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

      {/* Rich Character Preview Modal (Picture, Name & Multi-Tier Rating) */}
      <CharacterPreviewModal
        character={previewCharacter}
        onClose={() => setPreviewCharacter(null)}
        isAr={isAr}
      />
    </div>
  );
}
