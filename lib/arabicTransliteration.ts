/**
 * Arabic Name Transliteration and Pronunciation Utility
 * Supports converting English/Latin names (e.g., "abdallah rushdi") to Arabic script,
 * and reading names aloud using browser SpeechSynthesis in Arabic.
 */

// Common name dictionary for accurate Islamic, historical, and modern figures
const NAME_DICTIONARY: Record<string, string> = {
  // Exact user example
  'abdallah rushdi': 'عبد الله رشدي',
  'abdullah rushdi': 'عبد الله رشدي',
  'abdallah roshdi': 'عبد الله رشدي',
  'abdullah roshdi': 'عبد الله رشدي',
  'rushdi': 'رشدي',
  'roshdi': 'رشدي',

  // Companions and Leaders
  'khalid ibn al-walid': 'خالد بن الوليد',
  'khalid ibn al walid': 'خالد بن الوليد',
  'khalid': 'خالد',
  'salahuddin': 'صلاح الدين الأيوبي',
  'salah al-din': 'صلاح الدين',
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
  'baybars': 'الظاهر بيبرس',
  'qutuz': 'سيف الدين قطز',
  'nur ad-din zangi': 'نور الدين زنكي',
  'alparslan': 'ألب أرسلان',
};

// Word-level components (Abdullah, Abdul-Rahman, Ibn, Abu, etc.)
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

// Common individual words
const WORD_MAP: Record<string, string> = {
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
 * Phonetic letter transliteration for unmatched terms
 */
function transliterateWord(word: string): string {
  const clean = word.toLowerCase().trim();
  if (!clean) return '';

  if (WORD_MAP[clean]) return WORD_MAP[clean];

  // Compound replacements:
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
    // If it's already an Arabic character
    if (/[\u0600-\u06FF]/.test(ch)) {
      res += ch;
    } else if (charMap[ch]) {
      // Avoid duplicate consecutive identical long vowels
      const converted = charMap[ch];
      if ((converted === 'ا' || converted === 'و' || converted === 'ي') && res.endsWith(converted)) {
        continue;
      }
      res += converted;
    }
  }

  // Final touches
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
 * Converts any name (English, Latin transliteration, compound name) to Arabic script.
 * e.g., "abdallah rushdi" -> "عبد الله رشدي"
 */
export function convertNameToArabic(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // If already predominantly Arabic, return cleaned
  if (hasArabicCharacters(trimmed)) {
    // If it has both english and arabic in parens like "عمر بن الخطاب (Umar)", extract the arabic
    const arMatch = trimmed.match(/[\u0600-\u06FF\s]+/g);
    if (arMatch) {
      const best = arMatch.join(' ').trim().replace(/\s+/g, ' ');
      if (best.length >= 2) return best;
    }
    return trimmed;
  }

  const normalized = trimmed.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');

  // 1. Exact match in dictionary
  if (NAME_DICTIONARY[normalized]) {
    return NAME_DICTIONARY[normalized];
  }

  // 2. Check compound prefixes (e.g., "abdallah rushdi", "abdel rahman", "ibn rushd")
  const words = normalized.split(' ');
  const arabicWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    // Check 2-word combinations like "abd allah", "ibn al", "abu bakr"
    if (i + 1 < words.length) {
      const twoWords = `${w} ${words[i + 1]}`;
      if (NAME_DICTIONARY[twoWords]) {
        arabicWords.push(NAME_DICTIONARY[twoWords]);
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
      // Special handle: "abdallah" -> "عبد الله"
      arabicWords.push(COMPOUND_PREFIXES[w]);
      continue;
    }

    if (NAME_DICTIONARY[w]) {
      arabicWords.push(NAME_DICTIONARY[w]);
      continue;
    }

    if (WORD_MAP[w]) {
      arabicWords.push(WORD_MAP[w]);
      continue;
    }

    // Transliterate phonetic word
    arabicWords.push(transliterateWord(w));
  }

  let finalResult = arabicWords.join(' ').trim();
  // Clean up "عبد الـ رحمن" -> "عبد الرحمن"
  finalResult = finalResult.replace(/عبد الـ\s*/g, 'عبد ال');
  finalResult = finalResult.replace(/الـ\s*/g, 'ال');

  return finalResult || trimmed;
}

// Active references to prevent Chrome garbage-collection cutting off audio
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;

/**
 * Universal Sound & Speech Reader (100% free forever, no AI/API key required).
 * Reads the name using a robust 3-tier system:
 * 1. Free high-clarity TTS audio stream (native pronunciation)
 * 2. Web Speech Synthesis (with Arabic voice if installed, or system/English voice if not)
 * 3. Web Audio synthesizer chime fallback if browser speech is muted/blocked
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

  // Determine Arabic and Latin/English text
  const isArabic = hasArabicCharacters(raw);
  const arabicText = isArabic ? raw : convertNameToArabic(raw);
  const textToRead = arabicText || raw;

  // Tier 1: Free Google Translate TTS stream via HTML5 Audio
  try {
    const langParam = isArabic || arabicText ? 'ar' : 'en';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langParam}&q=${encodeURIComponent(textToRead)}`;
    const audio = new Audio(ttsUrl);
    activeAudio = audio;

    let hasStarted = false;

    audio.onended = () => {
      activeAudio = null;
      safeEnd();
    };

    audio.onerror = () => {
      activeAudio = null;
      if (!hasStarted) {
        fallbackToSpeechSynthesis(raw, arabicText, safeEnd);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasStarted = true;
        })
        .catch(() => {
          activeAudio = null;
          fallbackToSpeechSynthesis(raw, arabicText, safeEnd);
        });
      return true;
    }
  } catch {
    // fallback
  }

  return fallbackToSpeechSynthesis(raw, arabicText, safeEnd);
}

function fallbackToSpeechSynthesis(
  rawText: string,
  arabicText: string,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    playChimeTone();
    onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const voices = window.speechSynthesis.getVoices();
    // Look for any Arabic voice
    const arabicVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('ar') ||
        v.name.toLowerCase().includes('arabic') ||
        v.name.toLowerCase().includes('maged') ||
        v.name.toLowerCase().includes('tarik')
    );

    // If no Arabic voice installed on the user's OS, use whatever voice is available!
    const textToSpeak = arabicVoice ? (arabicText || rawText) : rawText;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    activeUtterance = utterance;

    if (arabicVoice) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang || 'ar-SA';
    } else {
      // Fallback voice (English or default system voice)
      const defaultVoice = voices.find((v) => v.default) || voices[0];
      if (defaultVoice) {
        utterance.voice = defaultVoice;
        utterance.lang = defaultVoice.lang || 'en-US';
      }
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      activeUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      activeUtterance = null;
      playChimeTone();
      onEnd?.();
    };

    // Failsafe timeout in case browser never fires onend
    setTimeout(() => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        onEnd?.();
      }
    }, 6000);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    playChimeTone();
    onEnd?.();
    return false;
  }
}

// Gentle acoustic chime fallback via Web Audio API (100% free forever, no network)
function playChimeTone() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // ignore
  }
}
