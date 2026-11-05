export type NotificationCategory = 'all' | 'badge' | 'character' | 'message' | 'news';

export interface AppNotificationItem {
  id: string;
  category: 'badge' | 'character' | 'message' | 'news';
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  timestamp: number;
  read: boolean;
  characterId?: string;
  characterName?: string;
  badgeId?: string;
  badgeNameAr?: string;
  badgeNameEn?: string;
  authorName?: string;
  avatarUrl?: string;
}

const STORAGE_KEY = 'islamheroes_notifications_v1';

// Initial curated activity & news feed for islamheroes
export const INITIAL_NOTIFICATIONS: AppNotificationItem[] = [
  {
    id: 'notif-news-brand-1',
    category: 'news',
    titleAr: '📢 التسمية الرسمية: مرحباً بكم في islamheroes',
    titleEn: '📢 Official Launch: Welcome to islamheroes',
    messageAr: 'تم اعتماد اسم islamheroes رسمياً للمنصة لاستكشاف بطولات وإرث عظماء التاريخ الإسلامي بسهولة وسرعة.',
    messageEn: 'islamheroes is now the official home to explore the legacy and noble lives of the heroes of Islam.',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    read: false,
  },
  {
    id: 'notif-badge-deedat-1',
    category: 'badge',
    titleAr: '✨ وسام جديد: نجم العلماء والفقهاء',
    titleEn: '✨ New Badge: Luminous Scholar Assigned',
    messageAr: 'تم تقليد الشيخ أحمد ديدات وسام "نجم العلماء والفقهاء" تقديراً لمناظراته العلمية الرصينة ودفاعه عن الإسلام.',
    messageEn: 'The Luminous Scholar badge has been awarded to Ahmed Deedat in honor of his defense of Islamic thought.',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    characterId: 'char-ahmed-deedat',
    characterName: 'Ahmed Deedat',
    badgeId: 'star-scholar',
    badgeNameAr: 'نجم العلماء والفقهاء',
    badgeNameEn: 'Luminous Scholar',
    read: false,
  },
  {
    id: 'notif-char-khamis-1',
    category: 'character',
    titleAr: '👤 شخصية جديدة: خميس الماجري',
    titleEn: '👤 New Character: Khamis Mejri Added',
    messageAr: 'تمت إضافة الشيخ خميس الماجري برتبة (+850) إلى قائمة الشخصيات الإسلامية. استكشف سيرته الآن!',
    messageEn: 'Khamis Mejri (+850) has been added to the islamheroes roster. Explore his biography now!',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    characterId: 'char-1793391591244',
    characterName: 'Khamis Mejri',
    read: false,
  },
  {
    id: 'notif-msg-deedat-1',
    category: 'message',
    titleAr: '💬 رسالة جديدة على شخصية: أحمد ديدات',
    titleEn: '💬 New Message on Figure: Ahmed Deedat',
    messageAr: 'كتب Wasim dorboz: "رحم الله أسد المناظرات الإسلامية وفارس الحوار القرآني، قدوة في العلم والشجاعة."',
    messageEn: 'Wasim dorboz posted: "May Allah have mercy on the lion of Islamic debates and Quranic dialogue."',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    characterId: 'char-ahmed-deedat',
    characterName: 'Ahmed Deedat',
    authorName: 'Wasim dorboz',
    read: false,
  },
  {
    id: 'notif-badge-all-30',
    category: 'badge',
    titleAr: '🎖️ تدشين 30 وساماً إسلامياً ثلاثي الأبعاد',
    titleEn: '🎖️ 30 3D Islamic Badges Launched',
    messageAr: 'أصبح بإمكان المشرف والزوار استعراض 30 وساماً ثلاثي الأبعاد مع تفاصيل المعاني التاريخية والتأثيرات الحركية.',
    messageEn: 'All 30 3D Islamic honor badges are now live with animated effects and historical meanings.',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    read: false,
  },
  {
    id: 'notif-char-alfqy-1',
    category: 'character',
    titleAr: '👤 شخصية متميزة: رضا الفقي',
    titleEn: '👤 Featured Character: Rda Alfqy',
    messageAr: 'تم تحديث بطاقة رضا الفقي (+900) مع دعم النطق الصوتي العربي وتحديد موقع الصورة بدقة.',
    messageEn: 'Rda Alfqy (+900) updated with Arabic speech pronunciation and precision image centering.',
    timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    characterId: 'char-1793441493536',
    characterName: 'رضا الفقي',
    read: true,
  },
  {
    id: 'notif-news-connect-1',
    category: 'news',
    titleAr: '⚡ ربط حساب Google المباشر يعمل دائماً',
    titleEn: '⚡ Direct Google Connect Active',
    messageAr: 'تم تفعيل الربط المباشر الموثق لحساب Google لمشرف التطبيق (tcoderex@gmail.com) ولكل المستخدمين بدون انقطاع.',
    messageEn: 'Direct Google account verification is active for admin (tcoderex@gmail.com) and all users.',
    timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    read: true,
  },
  {
    id: 'notif-msg-general-1',
    category: 'message',
    titleAr: '💬 تعليقات المجتمع الإسلامي مفتوحة',
    titleEn: '💬 Community Discussions Open',
    messageAr: 'يمكنك الآن إضافة تعليقات ومقترحات التقييم على كل شخصية في islamheroes والمشاركة في تقييم الأثر.',
    messageEn: 'Share your thoughts and rating suggestions on any hero profile across the islamheroes community.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    read: true,
  },
];

/**
 * Loads notifications from localStorage or returns default seed list
 */
export function getSavedNotifications(): AppNotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_NOTIFICATIONS;
}

/**
 * Saves notifications list to localStorage
 */
export function saveNotifications(items: AppNotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('islamheroes_notifications_change'));
  } catch {
    // ignore
  }
}

/**
 * Prepend a new notification item (e.g. when badge, character, or message is added)
 */
export function pushNotification(item: Omit<AppNotificationItem, 'id' | 'timestamp' | 'read'>): AppNotificationItem {
  const current = getSavedNotifications();
  const newItem: AppNotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    read: false,
  };
  const updated = [newItem, ...current].slice(0, 50); // keep up to 50 items
  saveNotifications(updated);
  return newItem;
}

/**
 * Marks a notification as read
 */
export function markNotificationAsRead(id: string): void {
  const current = getSavedNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

/**
 * Marks all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  const current = getSavedNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

/**
 * Clears all notifications
 */
export function clearAllNotifications(): void {
  saveNotifications([]);
}
