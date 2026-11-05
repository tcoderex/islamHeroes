'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Bell,
  Sparkles,
  Award,
  Users,
  MessageSquare,
  CheckCheck,
  Trash2,
  Search,
  ExternalLink,
  ChevronRight,
  Radio,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import {
  AppNotificationItem,
  NotificationCategory,
  getSavedNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from '@/lib/notifications';
import Super3DBadge from './Super3DBadge';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  onExploreCharacter?: (identifier: string) => void;
  onExploreBadge?: (characterIdentifier: string, badgeId?: string) => void;
  onExploreComment?: (characterIdentifier: string) => void;
  isRamadan?: boolean;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  isAr,
  onExploreCharacter,
  onExploreBadge,
  onExploreComment,
  isRamadan = false,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Load notifications and subscribe to live changes
  useEffect(() => {
    const load = () => {
      setNotifications(getSavedNotifications());
    };
    load();

    const handler = () => load();
    window.addEventListener('islamheroes_notifications_change', handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('islamheroes_notifications_change', handler);
      window.removeEventListener('storage', handler);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      badge: notifications.filter((n) => n.category === 'badge').length,
      character: notifications.filter((n) => n.category === 'character').length,
      message: notifications.filter((n) => n.category === 'message').length,
      news: notifications.filter((n) => n.category === 'news').length,
      unread: notifications.filter((n) => !n.read).length,
    };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab !== 'all' && n.category !== activeTab) return false;
      if (unreadOnly && n.read) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = `${n.titleAr} ${n.titleEn} ${n.messageAr} ${n.messageEn} ${n.characterName || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [notifications, activeTab, unreadOnly, searchQuery]);

  if (!isOpen) return null;

  const handleItemClick = (n: AppNotificationItem) => {
    markNotificationAsRead(n.id);
    setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));

    onClose();

    if (n.category === 'badge' && n.characterId) {
      if (onExploreBadge) {
        onExploreBadge(n.characterId || n.characterName || '', n.badgeId);
      } else if (onExploreCharacter) {
        onExploreCharacter(n.characterId || n.characterName || '');
      }
    } else if (n.category === 'message' && n.characterId && onExploreComment) {
      onExploreComment(n.characterId || n.characterName || '');
    } else if (n.characterId && onExploreCharacter) {
      onExploreCharacter(n.characterId || n.characterName || '');
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  const formatTime = (ts: number) => {
    const diffMin = Math.round((Date.now() - ts) / (1000 * 60));
    if (diffMin < 1) return isAr ? 'الآن' : 'Just now';
    if (diffMin < 60) return isAr ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden font-sans animate-in zoom-in-95 duration-200 ${
          isRamadan
            ? 'bg-gradient-to-b from-slate-900 via-[#0a1827] to-slate-950 border-amber-500/30 text-white shadow-amber-500/10'
            : 'bg-white dark:bg-[#0c1825] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0 ${
            isRamadan
              ? 'border-amber-500/20 bg-amber-500/5'
              : 'border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#09131d]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isRamadan
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-[#0067c0] dark:text-blue-400 border border-blue-200 dark:border-blue-900'
              }`}
            >
              <Bell className="w-5 h-5 animate-[bell-swing_2s_ease-in-out_infinite]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  {isAr ? 'مركز الأخبار والأنشطة' : 'News & Activity Center'}
                </h2>
                {counts.unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-xs">
                    {counts.unread} {isAr ? 'جديد' : 'new'}
                  </span>
                )}
              </div>
              <p
                className={`text-xs ${
                  isRamadan ? 'text-amber-200/70' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isAr
                  ? 'كل جديد في islamheroes: أوسمة، شخصيات، ورسائل المجتمع'
                  : 'Latest updates in islamheroes: badges, figures & messages'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isRamadan
                    ? 'text-amber-300 hover:bg-white/10'
                    : 'text-slate-500 hover:text-[#0067c0] hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
                title={isAr ? 'تعيين الكل كمقروء' : 'Mark all as read'}
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{isAr ? 'قراءة الكل' : 'Mark all'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isRamadan
                  ? 'text-amber-200 hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div
          className={`p-3 sm:px-5 border-b space-y-2.5 shrink-0 ${
            isRamadan
              ? 'border-amber-500/15 bg-slate-950/40'
              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c1825]'
          }`}
        >
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`py-1.5 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? isRamadan
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0067c0] text-white font-bold shadow-xs'
                  : isRamadan
                    ? 'text-amber-200/80 hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'الكل' : 'All'}</span>
              <span className="opacity-75 text-[10px]">({counts.all})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('badge')}
              className={`py-1.5 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'badge'
                  ? isRamadan
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0067c0] text-white font-bold shadow-xs'
                  : isRamadan
                    ? 'text-amber-200/80 hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأوسمة' : 'Badges'}</span>
              <span className="opacity-75 text-[10px]">({counts.badge})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('character')}
              className={`py-1.5 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'character'
                  ? isRamadan
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0067c0] text-white font-bold shadow-xs'
                  : isRamadan
                    ? 'text-amber-200/80 hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'الشخصيات' : 'Figures'}</span>
              <span className="opacity-75 text-[10px]">({counts.character})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('message')}
              className={`py-1.5 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'message'
                  ? isRamadan
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0067c0] text-white font-bold shadow-xs'
                  : isRamadan
                    ? 'text-amber-200/80 hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isAr ? 'الرسائل' : 'Messages'}</span>
              <span className="opacity-75 text-[10px]">({counts.message})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`py-1.5 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'news'
                  ? isRamadan
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0067c0] text-white font-bold shadow-xs'
                  : isRamadan
                    ? 'text-amber-200/80 hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isAr ? 'أخبار المنصة' : 'News'}</span>
              <span className="opacity-75 text-[10px]">({counts.news})</span>
            </button>
          </div>

          {/* Search & Unread toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في التنبيهات والأخبار...' : 'Filter news & updates...'}
                className={`w-full py-1.5 pl-3 pr-8 rounded-xl text-xs focus:outline-hidden transition-all ${
                  isRamadan
                    ? 'bg-slate-900 border border-amber-500/30 text-white placeholder-amber-200/40 focus:ring-1 focus:ring-amber-400'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                unreadOnly
                  ? isRamadan
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-[#0067c0] dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isAr ? 'غير المقروء فقط' : 'Unread only'}
            </button>
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
              <Bell className="w-10 h-10 stroke-[1.5] opacity-40" />
              <p className="text-sm font-semibold">
                {isAr ? 'لا توجد إشعارات مطابقة' : 'No notifications found'}
              </p>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'سيتم إشعارك فور إضافة أوسمة جديدة أو شخصيات أو رسائل'
                  : 'You will be notified when new badges, figures or messages arrive'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const title = isAr ? n.titleAr : n.titleEn;
              const msg = isAr ? n.messageAr : n.messageEn;

              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col sm:flex-row items-start justify-between gap-3 ${
                    !n.read
                      ? isRamadan
                        ? 'bg-amber-500/10 border-amber-400/40 hover:bg-amber-500/15'
                        : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-50'
                      : isRamadan
                        ? 'bg-slate-900/60 border-white/10 hover:bg-slate-900'
                        : 'bg-white dark:bg-[#0c1825] border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {/* Category icon / Visual badge */}
                  <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
                    <div className="shrink-0 mt-0.5">
                      {n.badgeId ? (
                        <div className="scale-75 -m-2">
                          <Super3DBadge badgeId={n.badgeId} size="sm" showTooltip={false} />
                        </div>
                      ) : n.category === 'character' ? (
                        <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-400 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                      ) : n.category === 'message' ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                          <Radio className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#0067c0] dark:group-hover:text-blue-400 transition-colors">
                          {title}
                        </span>

                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                        )}
                      </div>

                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isRamadan ? 'text-amber-100/80' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {msg}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[10.5px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatTime(n.timestamp)}</span>
                        </span>

                        {n.characterName && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[150px]">
                            {n.characterName}
                          </span>
                        )}

                        {n.authorName && (
                          <span className="text-emerald-500 font-semibold truncate">
                            {n.authorName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Explore Action Button */}
                  <div className="self-end sm:self-center shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs group-hover:scale-105 ${
                        isRamadan
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-[#0067c0] dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <span>
                        {n.category === 'badge'
                          ? isAr
                            ? 'عرض الوسام'
                            : 'View Badge'
                          : n.category === 'message'
                            ? isAr
                              ? 'عرض التعليق'
                              : 'View Message'
                            : isAr
                              ? 'استكشاف'
                              : 'Explore'}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Actions */}
        {notifications.length > 0 && (
          <div
            className={`p-3 px-5 border-t flex items-center justify-between text-xs shrink-0 ${
              isRamadan
                ? 'border-amber-500/15 bg-slate-950'
                : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#09131d]'
            }`}
          >
            <span className="text-slate-400 text-[11px]">
              {isAr
                ? `إجمالي الإشعارات: ${notifications.length}`
                : `Total items: ${notifications.length}`}
            </span>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'مسح كافة الإشعارات' : 'Clear all notifications'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
