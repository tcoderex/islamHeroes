export type AppTheme = 'tgis' | 'ramadan';

export interface ThemeConfig {
  id: AppTheme;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  tgis: {
    id: 'tgis',
    nameEn: 'TGIS (Default Blue)',
    nameAr: 'الافتراضي (الأزرق السماوي)',
    descriptionEn: 'Modern celestial blue and slate minimalist aesthetic',
    descriptionAr: 'المظهر العصري الهادئ بدرجات الأزرق والسماوي',
  },
  ramadan: {
    id: 'ramadan',
    nameEn: 'Ramadan Mubarak (Gold & Night)',
    nameAr: 'رمضان مبارك (الذهبي والليل الروحاني)',
    descriptionEn: 'Festive Islamic night sky with warm gold lanterns and emerald glow',
    descriptionAr: 'أجواء رمضانية روحانية ببريق الذهب وزرقة الليل الهادئة',
  },
};
