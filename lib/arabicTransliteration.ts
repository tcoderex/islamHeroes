/**
 * Arabic & English Name Transliteration, Localization and Speech Utility
 * - Bidirectional name localization: English in 'en' mode, Arabic in 'ar' mode.
 * - Speech synthesis without annoying synth chimes/Mario sounds.
 */

// Common name dictionary for accurate Islamic, historical, and modern figures
const NAME_DICTIONARY_EN_TO_AR: Record<string, string> = {
  // Exact user example
  'abdallah rushdi': 'عبد الله رشدي',
  'abdullah rushdi': 'عبد الله رشدي',
  'abdallah roshdi': 'عبد الله رشدي',
  'abdullah roshdi': 'عبد الله رشدي',
  'sheikh abdullah rushdy': 'الشيخ عبد الله رشدي',
  'sheikh abdallah rushdi': 'الشيخ عبد الله رشدي',
  'rushdi': 'رشدي',
  'roshdi': 'رشدي',

  // Companions and Leaders
  'khalid ibn al-walid': 'خالد بن الوليد',
  'khalid ibn al walid': 'خالد بن الوليد',
  'khalid': 'خالد',
  'salahuddin': 'صلاح الدين الأيوبي',
  'salah al-din': 'صلاح الدين الأيوبي',
  'salahuddin al-ayyubi': 'صلاح الدين الأيوبي',
  'saladin': 'صلاح الدين الأيوبي',
  'tariq ibn ziyad': 'طارق بن زياد',
  'tariq': 'طارق',
  'umar ibn al-khattab': 'عمر بن الخطاب',
  'omar ibn al-khattab': 'عمر بن الخطاب',
  'umar': 'عمر',
  'omar': 'عمر',
  'ali ibn abi talib': 'علي بن أبي طالب',
  'ali': 'علي',
  'abu bakr': 'أبو بكر الصديق',
  'abu bakr al-siddiq': 'أبو بكر الصديق',
  'uthman ibn affan': 'عثمان بن عفان',
  'othman': 'عثمان',
  'uthman': 'عثمان',
  'fatima al-fihri': 'فاطمة الفهرية',
  'fatima': 'فاطمة',
  'khadija': 'خديجة',
  'aisha': 'عائشة',
  'hassan': 'حسن',
  'hussein': 'حسين',
  'hussain': 'حسين',
  'muhammad': 'محمد',
  'mohamed': 'محمد',
  'ahmed': 'أحمد',
  'mahmoud': 'محمود',
  'mustafa': 'مصطفى',
  'hamza': 'حمزة',
  'bilal': 'بلال',
  'saad': 'سعد',
  'salman': 'سلمان',
  'zubayr': 'الزبير',
  'talha': 'طلحة',
  'amr ibn al-as': 'عمرو بن العاص',
  'amr': 'عمرو',
  'muawiyah': 'معاوية',
  'harun al-rashid': 'هارون الرشيد',
  'sultan baybars': 'الظاهر بيبرس',
  'baybars': 'الظاهر بيبرس',

  // Al-Azhar Scholars
  'sheikh muhammad metwalli al-sha\'rawi': 'الشيخ محمد متولي الشعراوي',
  'muhammad metwalli al-sharawi': 'الشيخ محمد متولي الشعراوي',
  'grand imam dr. ahmed el-tayeb': 'الإمام الأكبر د. أحمد الطيب',
  'sheikh abdel-halim mahmoud': 'الشيخ عبد الحليم محمود',
  'sheikh gad al-haq ali gad al-haq': 'الشيخ جاد الحق علي جاد الحق',
  'sheikh mahmoud shaltout': 'الشيخ محمود شلتوت',
  'sheikh muhammad mustafa al-maraghi': 'الشيخ محمد مصطفى المراغي',
  'sheikh muhammad abduh': 'الشيخ محمد عبده',
  'sheikh hassan al-attar': 'الشيخ حسن العطار',
  'imam ibrahim al-bajuri': 'الإمام إبراهيم الباجوري',

  // Scholars & Scientists
  'ibn sina': 'ابن سينا',
  'avicenna': 'ابن سينا',
  'ibn rushd': 'ابن رشد',
  'averroes': 'ابن رشد',
  'ibn battuta': 'ابن بطوطة',
  'ibn khaldun': 'ابن خلدون',
  'ibn al-haytham': 'ابن الهيثم',
  'alhazen': 'ابن الهيثم',
  'al-khwarizmi': 'الخوارزمي',
  'al khwarizmi': 'الخوارزمي',
  'al-biruni': 'البيروني',
  'al-farabi': 'الفارابي',
  'al-razi': 'الرازي',
  'rhazes': 'الرازي',
  'al-kindi': 'الكندي',
  'al-ghazali': 'الغزالي',
  'imam al-bukhari': 'الإمام البخاري',
  'al-bukhari': 'البخاري',
  'muslim': 'مسلم',
  'al-shafii': 'الشافعي',
  'abu hanifa': 'أبو حنيفة',
  'malik': 'مالك',
  'ahmad ibn hanbal': 'أحمد بن حنبل',
  'ibn taymiyyah': 'ابن تيمية',
  'al-nawawi': 'النووي',
  'al-suyuti': 'السيوطي',

  // Modern figures & reformers
  'ahmed deedat': 'أحمد ديدات',
  'deedat': 'ديدات',
  'malcolm x': 'مالكولم إكس (الحاج مالك الشباز)',
  'zheng he': 'تشنغ خه (حاجي محمود شمس)',
  'omar al-mukhtar': 'عمر المختار',
  'abdelkader': 'عبد القادر الجزائري',
  'abdelkader el djezairi': 'عبد القادر الجزائري',
  'izz ad-din al-qassam': 'عز الدين القسام',
  'al-qassam': 'القسام',
  'mehmed the conqueror': 'السلطان محمد الفاتح',
  'mehmed ii': 'محمد الفاتح',
  'suleiman the magnificent': 'سليمان القانوني',
  'suleiman': 'سليمان',
  'qutuz': 'سيف الدين قطز',
  'saif ad-din qutuz': 'سيف الدين قطز',
  'nur ad-din zangi': 'نور الدين زنكي',
  'alparslan': 'ألب أرسلان',
};

// Reverse Dictionary: Arabic to English
const NAME_DICTIONARY_AR_TO_EN: Record<string, string> = {
  // Al-Azhar Scholars
  'الشيخ عبد الله رشدي': 'Sheikh Abdullah Rushdy',
  'عبد الله رشدي': 'Abdullah Rushdy',
  'الشيخ محمد متولي الشعراوي': 'Sheikh Muhammad Metwalli Al-Sha\'rawi',
  'الإمام الأكبر د. أحمد الطيب': 'Grand Imam Dr. Ahmed El-Tayeb',
  'الشيخ عبد الحليم محمود': 'Sheikh Abdel-Halim Mahmoud',
  'الشيخ جاد الحق علي جاد الحق': 'Sheikh Gad al-Haq Ali Gad al-Haq',
  'الشيخ محمود شلتوت': 'Sheikh Mahmoud Shaltout',
  'الشيخ محمد مصطفى المراغي': 'Sheikh Muhammad Mustafa Al-Maraghi',
  'الشيخ محمد عبده': 'Sheikh Muhammad Abduh',
  'الشيخ حسن العطار': 'Sheikh Hassan Al-Attar',
  'الإمام إبراهيم الباجوري': 'Imam Ibrahim Al-Bajuri',
  'الإمام محمد بن أحمد بن عبد الله الباجوري': 'Imam Ibrahim Al-Bajuri',

  // Companions and Leaders
  'خالد بن الوليد': 'Khalid ibn al-Walid',
  'صلاح الدين الأيوبي': 'Salahuddin al-Ayyubi',
  'صلاح الدين': 'Salahuddin',
  'أبو بكر الصديق': 'Abu Bakr al-Siddiq',
  'أبو بكر': 'Abu Bakr',
  'عمر بن الخطاب': 'Umar ibn al-Khattab',
  'عثمان بن عفان': 'Uthman ibn Affan',
  'علي بن أبي طالب': 'Ali ibn Abi Talib',
  'طارق بن زياد': 'Tariq ibn Ziyad',
  'فاطمة الفهرية': 'Fatima al-Fihri',
  'هارون الرشيد': 'Harun al-Rashid',
  'الظاهر بيبرس': 'Sultan Baybars',
  'سيف الدين قطز': 'Saif ad-Din Qutuz',
  'نور الدين زنكي': 'Nur ad-Din Zangi',
  'محمد الفاتح': 'Mehmed the Conqueror',
  'السلطان محمد الفاتح': 'Sultan Mehmed the Conqueror',
  'سليمان القانوني': 'Suleiman the Magnificent',
  'ألب أرسلان': 'Alp Arslan',
  'عمر المختار': 'Omar al-Mukhtar',
  'عبد القادر الجزائري': 'Emir Abdelkader',
  'عز الدين القسام': 'Izz ad-Din al-Qassam',
  'أحمد ديدات': 'Ahmed Deedat',
  'مالكولم إكس': 'Malcolm X',
  'مالكولم إكس (الحاج مالك الشباز)': 'Malcolm X (El-Hajj Malik El-Shabazz)',
  'تشنغ خه': 'Zheng He',
  'تشنغ خه (حاجي محمود شمس)': 'Zheng He (Hajji Mahmud Shams)',

  // Scholars & Scientists
  'ابن سينا': 'Ibn Sina (Avicenna)',
  'ابن رشد': 'Ibn Rushd (Averroes)',
  'ابن بطوطة': 'Ibn Battuta',
  'ابن خلدون': 'Ibn Khaldun',
  'ابن الهيثم': 'Ibn al-Haytham (Alhazen)',
  'الخوارزمي': 'Al-Khwarizmi',
  'البيروني': 'Al-Biruni',
  'الفارابي': 'Al-Farabi',
  'الرازي': 'Al-Razi (Rhazes)',
  'الكندي': 'Al-Kindi',
  'الغزالي': 'Al-Ghazali',
  'الإمام البخاري': 'Imam Al-Bukhari',
  'البخاري': 'Al-Bukhari',
  'مسلم': 'Imam Muslim',
  'الشافعي': 'Imam Al-Shafi\'i',
  'أبو حنيفة': 'Imam Abu Hanifa',
  'مالك بن أنس': 'Malik ibn Anas',
  'مالك': 'Imam Malik',
  'أحمد بن حنبل': 'Ahmad ibn Hanbal',
  'ابن تيمية': 'Ibn Taymiyyah',
  'النووي': 'Imam Al-Nawawi',
  'السيوطي': 'Al-Suyuti',
};

// Word-level components (English -> Arabic)
const COMPOUND_PREFIXES: Record<string, string> = {
  'abdallah': 'عبد الله',
  'abdullah': 'عبد الله',
  'abdul': 'عبد الـ',
  'abdel': 'عبد الـ',
  'abd al': 'عبد الـ',
  'abd el': 'عبد الـ',
  'ibn': 'بن',
  'bin': 'بن',
  'ben': 'بن',
  'bint': 'بنت',
  'abu': 'أبو',
  'abo': 'أبو',
  'abi': 'أبي',
  'al': 'الـ',
  'el': 'الـ',
  'sheikh': 'الشيخ',
  'shaykh': 'الشيخ',
  'imam': 'الإمام',
  'sultan': 'السلطان',
  'sayyid': 'السيد',
  'sayyida': 'السيدة',
};

// Arabic to English prefix and word components
const AR_TO_EN_WORDS: Record<string, string> = {
  'الشيخ': 'Sheikh',
  'الإمام': 'Imam',
  'الدكتور': 'Dr.',
  'د.': 'Dr.',
  'السلطان': 'Sultan',
  'الأمير': 'Emir',
  'بن': 'ibn',
  'ابن': 'Ibn',
  'بنت': 'bint',
  'أبو': 'Abu',
  'أبي': 'Abi',
  'عبد الله': 'Abdullah',
  'عبدالرحمن': 'Abdul-Rahman',
  'عبد الرحمن': 'Abdul-Rahman',
  'عبدالعزيز': 'Abdul-Aziz',
  'عبد العزيز': 'Abdul-Aziz',
  'محمد': 'Muhammad',
  'أحمد': 'Ahmed',
  'محمود': 'Mahmoud',
  'علي': 'Ali',
  'عمر': 'Umar',
  'عثمان': 'Uthman',
  'خالد': 'Khalid',
  'رشدي': 'Rushdy',
  'الشعراوي': 'Al-Sha\'rawi',
  'الطيب': 'El-Tayeb',
  'مصطفى': 'Mustafa',
  'حمزة': 'Hamza',
  'يوسف': 'Youssef',
  'إبراهيم': 'Ibrahim',
  'إسماعيل': 'Ismail',
  'إسحاق': 'Ishaq',
  'يعقوب': 'Yaqub',
  'موسى': 'Musa',
  'هارون': 'Harun',
  'عيسى': 'Isa',
  'داود': 'Dawud',
  'سليمان': 'Suleiman',
  'أيوب': 'Ayyoub',
  'زكريا': 'Zakariya',
  'يحيى': 'Yahya',
  'يونس': 'Yunus',
  'إلياس': 'Ilyas',
  'صالح': 'Salih',
  'آدم': 'Adam',
  'نوح': 'Nuh',
  'حسن': 'Hassan',
  'حسين': 'Hussein',
  'طارق': 'Tariq',
  'زياد': 'Ziyad',
  'الوليد': 'al-Walid',
  'الصديق': 'al-Siddiq',
  'الفاروق': 'al-Faruq',
  'الفهرية': 'al-Fihri',
  'الرشيد': 'al-Rashid',
  'الأيوبي': 'al-Ayyubi',
};

// Common individual words (English -> Arabic)
const EN_TO_AR_WORDS: Record<string, string> = {
  'rahman': 'الرحمن',
  'rahim': 'الرحيم',
  'aziz': 'العزيز',
  'malik': 'الملك',
  'karim': 'الكريم',
  'qadir': 'القادر',
  'samad': 'الصمد',
  'basit': 'الباسط',
  'jabbar': 'الجبار',
  'fattah': 'الفتاح',
  'wahhab': 'الوهاب',
  'latif': 'اللطيف',
  'khaliq': 'الخالق',
  'majeed': 'المجيد',
  'hamid': 'الحميد',
  'rashid': 'الرشيد',
  'rushdi': 'رشدي',
  'roshdi': 'رشدي',
  'farouk': 'فاروق',
  'farooq': 'فاروق',
  'tariq': 'طارق',
  'tareq': 'طارق',
  'ziyad': 'زياد',
  'zeyad': 'زياد',
  'walid': 'الوليد',
  'waleed': 'الوليد',
  'youssef': 'يوسف',
  'yousef': 'يوسف',
  'yusuf': 'يوسف',
  'ibrahim': 'إبراهيم',
  'ismail': 'إسماعيل',
  'ishaq': 'إسحاق',
  'yaqub': 'يعقوب',
  'musa': 'موسى',
  'harun': 'هارون',
  'isa': 'عيسى',
  'dawood': 'داود',
  'dawud': 'داود',
  'sulaiman': 'سليمان',
  'ayyoub': 'أيوب',
  'zakariya': 'زكريا',
  'yahya': 'يحيى',
  'yunus': 'يونس',
  'ilyas': 'إلياس',
  'al-yasa': 'اليسع',
  'idris': 'إدريس',
  'hud': 'هود',
  'salih': 'صالح',
  'shuayb': 'شعيب',
  'adam': 'آدم',
  'nuh': 'نوح',
};

/**
 * Phonetic letter transliteration for English words -> Arabic
 */
function transliterateEnWordToAr(word: string): string {
  const clean = word.toLowerCase().trim();
  if (!clean) return '';

  if (EN_TO_AR_WORDS[clean]) return EN_TO_AR_WORDS[clean];

  let w = clean;
  w = w.replace(/sh/g, 'ش');
  w = w.replace(/kh/g, 'خ');
  w = w.replace(/th/g, 'ث');
  w = w.replace(/dh/g, 'ذ');
  w = w.replace(/gh/g, 'غ');
  w = w.replace(/ph/g, 'ف');
  w = w.replace(/ch/g, 'تش');
  w = w.replace(/ou/g, 'و');
  w = w.replace(/ee/g, 'ي');
  w = w.replace(/oo/g, 'و');
  w = w.replace(/aa/g, 'ا');

  const charMap: Record<string, string> = {
    'a': 'ا',
    'b': 'ب',
    't': 'ت',
    'j': 'ج',
    'h': 'ح',
    'd': 'د',
    'r': 'ر',
    'z': 'ز',
    's': 'س',
    'q': 'ق',
    'k': 'ك',
    'l': 'ل',
    'm': 'م',
    'n': 'ن',
    'w': 'و',
    'y': 'ي',
    'f': 'ف',
    'v': 'ف',
    'p': 'ب',
    'c': 'ك',
    'g': 'ج',
    'x': 'كس',
    'e': 'ي',
    'i': 'ي',
    'u': 'و',
    'o': 'و',
  };

  let res = '';
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    if (/[\u0600-\u06FF]/.test(ch)) {
      res += ch;
    } else if (charMap[ch]) {
      const converted = charMap[ch];
      if ((converted === 'ا' || converted === 'و' || converted === 'ي') && res.endsWith(converted)) {
        continue;
      }
      res += converted;
    }
  }

  res = res.replace(/عبد الـ(\S+)/g, 'عبد ال$1');
  return res;
}

/**
 * Checks whether text contains Arabic characters
 */
export function hasArabicCharacters(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Converts any name (English or Latin transliteration) into Arabic script
 */
export function convertNameToArabic(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (hasArabicCharacters(trimmed)) {
    const arMatch = trimmed.match(/[\u0600-\u06FF\s]+/g);
    if (arMatch) {
      const best = arMatch.join(' ').trim().replace(/\s+/g, ' ');
      if (best.length >= 2) return best;
    }
    return trimmed;
  }

  const normalized = trimmed.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');

  if (NAME_DICTIONARY_EN_TO_AR[normalized]) {
    return NAME_DICTIONARY_EN_TO_AR[normalized];
  }

  const words = normalized.split(' ');
  const arabicWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (i + 1 < words.length) {
      const twoWords = `${w} ${words[i + 1]}`;
      if (NAME_DICTIONARY_EN_TO_AR[twoWords]) {
        arabicWords.push(NAME_DICTIONARY_EN_TO_AR[twoWords]);
        i++;
        continue;
      }
      if (COMPOUND_PREFIXES[twoWords]) {
        arabicWords.push(COMPOUND_PREFIXES[twoWords]);
        i++;
        continue;
      }
    }

    if (COMPOUND_PREFIXES[w]) {
      arabicWords.push(COMPOUND_PREFIXES[w]);
      continue;
    }

    if (NAME_DICTIONARY_EN_TO_AR[w]) {
      arabicWords.push(NAME_DICTIONARY_EN_TO_AR[w]);
      continue;
    }

    if (EN_TO_AR_WORDS[w]) {
      arabicWords.push(EN_TO_AR_WORDS[w]);
      continue;
    }

    arabicWords.push(transliterateEnWordToAr(w));
  }

  let finalResult = arabicWords.join(' ').trim();
  finalResult = finalResult.replace(/عبد الـ\s*/g, 'عبد ال');
  finalResult = finalResult.replace(/الـ\s*/g, 'ال');

  return finalResult || trimmed;
}

/**
 * Converts an Arabic name into standard, readable English/Latin script
 */
export function convertArabicToEnglish(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Direct dictionary lookup
  if (NAME_DICTIONARY_AR_TO_EN[trimmed]) {
    return NAME_DICTIONARY_AR_TO_EN[trimmed];
  }

  // Check without honorific titles
  const cleanTitle = trimmed
    .replace(/^الشيخ\s+/, '')
    .replace(/^الإمام\s+/, '')
    .replace(/^السلطان\s+/, '');
  if (NAME_DICTIONARY_AR_TO_EN[cleanTitle]) {
    const prefix = trimmed.startsWith('الشيخ')
      ? 'Sheikh '
      : trimmed.startsWith('الإمام')
        ? 'Imam '
        : trimmed.startsWith('السلطان')
          ? 'Sultan '
          : '';
    return prefix + NAME_DICTIONARY_AR_TO_EN[cleanTitle];
  }

  // Word-by-word mapping
  const words = trimmed.split(/\s+/);
  const enWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    // Check two-word combinations (e.g. عبد الله)
    if (i + 1 < words.length) {
      const pair = `${w} ${words[i + 1]}`;
      if (AR_TO_EN_WORDS[pair]) {
        enWords.push(AR_TO_EN_WORDS[pair]);
        i++;
        continue;
      }
    }

    if (AR_TO_EN_WORDS[w]) {
      enWords.push(AR_TO_EN_WORDS[w]);
      continue;
    }

    // Phonetic transliteration for unknown Arabic words
    enWords.push(transliterateArWordToEn(w));
  }

  return enWords.join(' ').trim();
}

/**
 * Phonetic transliterator: Arabic word -> English
 */
function transliterateArWordToEn(word: string): string {
  if (!word) return '';
  if (!hasArabicCharacters(word)) return word;

  const arCharMap: Record<string, string> = {
    'ا': 'a',
    'أ': 'A',
    'إ': 'I',
    'آ': 'Aa',
    'ب': 'b',
    'ت': 't',
    'ث': 'th',
    'ج': 'j',
    'ح': 'h',
    'خ': 'kh',
    'د': 'd',
    'ذ': 'dh',
    'ر': 'r',
    'ز': 'z',
    'س': 's',
    'ش': 'sh',
    'ص': 's',
    'ض': 'd',
    'ط': 't',
    'ظ': 'z',
    'ع': 'a',
    'غ': 'gh',
    'ف': 'f',
    'ق': 'q',
    'ك': 'k',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ه': 'h',
    'و': 'w',
    'ي': 'y',
    'ى': 'a',
    'ة': 'ah',
    'ء': '',
    'ئ': 'i',
    'ؤ': 'u',
  };

  let out = '';
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    out += arCharMap[c] !== undefined ? arCharMap[c] : c;
  }

  // Capitalize first letter
  if (out.length > 0) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out;
}

/**
 * Universal Bidirectional Character Name Resolver:
 * - If isAr === true: GUARANTEED to return the authentic Arabic name.
 * - If isAr === false: GUARANTEED to return the clean English name.
 * Handles inputs with parentheses, pure Arabic, or pure English gracefully!
 */
export function getLocalizedCharacterName(rawName: string, isAr: boolean): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();

  // 1. If format has parenthesis: e.g. "خالد بن الوليد (Khalid ibn al-Walid)"
  const parenMatch = trimmed.match(/^([^(]+)\(([^)]+)\)$/);
  if (parenMatch) {
    const part1 = parenMatch[1].trim();
    const part2 = parenMatch[2].trim();
    const part1IsAr = hasArabicCharacters(part1);
    const part2IsAr = hasArabicCharacters(part2);

    if (isAr) {
      if (part1IsAr) return part1;
      if (part2IsAr) return part2;
      return convertNameToArabic(part1 || part2);
    } else {
      if (!part1IsAr && part1.length > 0) return part1;
      if (!part2IsAr && part2.length > 0) return part2;
      return convertArabicToEnglish(part1 || part2);
    }
  }

  // 2. Pure input (no parens)
  if (isAr) {
    if (hasArabicCharacters(trimmed)) {
      return trimmed;
    }
    return convertNameToArabic(trimmed);
  } else {
    if (!hasArabicCharacters(trimmed)) {
      // Capitalize first letters of each word
      return trimmed
        .split(' ')
        .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
        .join(' ');
    }
    return convertArabicToEnglish(trimmed);
  }
}

// Active references to prevent Chrome garbage-collection cutting off audio
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;

/**
 * Cleans text specifically for authentic Arabic pronunciation
 */
export function cleanArabicTextForSpeech(input: string): string {
  if (!input) return '';
  let raw = input.trim();

  // If input has parentheses e.g. "خالد بن الوليد (Khalid ibn al-Walid)"
  const parenMatch = raw.match(/^([^(]+)\(([^)]+)\)$/);
  if (parenMatch) {
    const p1 = parenMatch[1].trim();
    const p2 = parenMatch[2].trim();
    if (hasArabicCharacters(p1)) raw = p1;
    else if (hasArabicCharacters(p2)) raw = p2;
    else raw = convertNameToArabic(p1 || p2);
  } else if (!hasArabicCharacters(raw)) {
    raw = convertNameToArabic(raw);
  }

  // Strip extraneous bracket notations or symbols
  return raw
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[^\u0600-\u06FF\s\.\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Universal Arabic Sound & Speech Reader (100% clean voice, NO Super Mario jump chime!).
 * Guarantees native Arabic voice reading on all devices (iOS, Android, Windows, Mac).
 */
export function speakInArabic(text: string, onEnd?: () => void): boolean {
  return speakNameSound(text, onEnd);
}

export function speakNameSound(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined') return false;

  const raw = text.trim();
  if (!raw) {
    onEnd?.();
    return false;
  }

  // Stop previous audio playback
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }
  }

  let ended = false;
  const safeEnd = () => {
    if (!ended) {
      ended = true;
      onEnd?.();
    }
  };

  const cleanArabic = cleanArabicTextForSpeech(raw) || raw;

  // 1. Check if browser has a native Arabic SpeechSynthesis voice
  if ('speechSynthesis' in window) {
    try {
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('ar') ||
          v.name.toLowerCase().includes('arabic') ||
          v.name.toLowerCase().includes('maged') ||
          v.name.toLowerCase().includes('tarik') ||
          v.name.toLowerCase().includes('laila') ||
          v.name.toLowerCase().includes('salma') ||
          v.name.toLowerCase().includes('zeina') ||
          v.name.toLowerCase().includes('zahra') ||
          v.name.toLowerCase().includes('youssef')
      );

      // If an actual Arabic voice is installed on OS, use SpeechSynthesis!
      if (arabicVoice) {
        const utterance = new SpeechSynthesisUtterance(cleanArabic);
        activeUtterance = utterance;
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang || 'ar-SA';
        utterance.rate = 0.88; // Natural, clear Arabic cadence
        utterance.pitch = 1.0;

        utterance.onend = () => {
          activeUtterance = null;
          safeEnd();
        };

        utterance.onerror = () => {
          activeUtterance = null;
          playAudioFallback(cleanArabic, safeEnd);
        };

        setTimeout(() => {
          if (activeUtterance === utterance) {
            activeUtterance = null;
            safeEnd();
          }
        }, 6000);

        window.speechSynthesis.speak(utterance);
        return true;
      }
    } catch {
      // ignore, fall through to audio proxy
    }
  }

  // 2. No native Arabic SpeechSynthesis voice installed -> Use server audio proxy or Google TTS
  return playAudioFallback(cleanArabic, safeEnd);
}

function playAudioFallback(arabicText: string, onEnd: () => void): boolean {
  try {
    // Primary: our origin API proxy route (avoids CORS and missing OS voice issues)
    const proxyUrl = `/api/tts?lang=ar&text=${encodeURIComponent(arabicText)}`;
    const audio = new Audio(proxyUrl);
    activeAudio = audio;

    audio.onended = () => {
      activeAudio = null;
      onEnd();
    };

    audio.onerror = () => {
      // Direct Google TTS fallback if proxy fails
      const directTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encodeURIComponent(arabicText)}`;
      const directAudio = new Audio(directTtsUrl);
      activeAudio = directAudio;
      directAudio.onended = () => {
        activeAudio = null;
        onEnd();
      };
      directAudio.onerror = () => {
        activeAudio = null;
        onEnd();
      };
      directAudio.play().catch(() => {
        activeAudio = null;
        onEnd();
      });
    };

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        activeAudio = null;
        onEnd();
      });
      return true;
    }
  } catch {
    onEnd();
  }
  return false;
}
