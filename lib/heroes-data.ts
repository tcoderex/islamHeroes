export interface BilingualHero {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  title: {
    en: string;
    ar: string;
  };
  era: {
    en: string;
    ar: string;
  };
  summary: {
    en: string;
    ar: string;
  };
  picture?: string;
  rating?: number; // -1000 to 1000
}

export const HEROES: BilingualHero[] = [
  {
    id: 'khalid-ibn-walid',
    name: {
      en: 'Khalid ibn al-Walid',
      ar: 'خالد بن الوليد',
    },
    title: {
      en: 'Sayf Allah al-Maslul (The Drawn Sword of Allah)',
      ar: 'سيف الله المسلول',
    },
    era: {
      en: '592 – 642 CE',
      ar: '٥٩٢ – ٦٤٢ م',
    },
    summary: {
      en: 'Legendary military commander undefeated in over fifty battles, famed for his strategic brilliance and profound humility.',
      ar: 'قائد عسكري أسطوري لم يُهزم في أكثر من خمسين معركة، عُرف بعبقريته التكتيكية وتواضعه وإخلاصه.',
    },
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    rating: 1000,
  },
  {
    id: 'salahuddin-ayyubi',
    name: {
      en: 'Salahuddin al-Ayyubi (Saladin)',
      ar: 'صلاح الدين الأيوبي',
    },
    title: {
      en: 'The Liberator of Jerusalem',
      ar: 'محرر القدس ومؤسس الدولة الأيوبية',
    },
    era: {
      en: '1137 – 1193 CE',
      ar: '١١٣٧ – ١١٩٣ م',
    },
    summary: {
      en: 'Sultan of Egypt and Syria whose chivalry, justice, and mercy in victory won the reverence of both East and West.',
      ar: 'سلطان مصر والشام، اشتُهر بفروسيته وعدله وعفوه عند المقدرة وإنسانيته في التعامل مع الجميع.',
    },
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    rating: 1000,
  },
  {
    id: 'abu-bakr-siddiq',
    name: {
      en: 'Abu Bakr al-Siddiq',
      ar: 'أبو بكر الصديق',
    },
    title: {
      en: 'Al-Siddiq (The Truthful Witness) · 1st Caliph',
      ar: 'الصديق · الخليفة الراشد الأول',
    },
    era: {
      en: '573 – 634 CE',
      ar: '٥٧٣ – ٦٣٤ م',
    },
    summary: {
      en: 'Closest companion of Prophet Muhammad (PBUH), distinguished by absolute sincerity, steadfastness, and boundless charity.',
      ar: 'أقرب صحابة رسول الله ﷺ، عُرف بصدقه المطلق وثباته العظيم وإنفاقه كل ماله في سبيل الله.',
    },
    picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    rating: 1000,
  },
  {
    id: 'umar-ibn-khattab',
    name: {
      en: 'Umar ibn al-Khattab',
      ar: 'عمر بن الخطاب',
    },
    title: {
      en: 'Al-Faruq (The Distinguisher of Truth) · 2nd Caliph',
      ar: 'الفاروق · الخليفة الراشد الثاني',
    },
    era: {
      en: '584 – 644 CE',
      ar: '٥٨٤ – ٦٤٤ م',
    },
    summary: {
      en: 'Pillar of justice and institutional governance who established public welfare, courts, and the Hijri calendar.',
      ar: 'رمز العدالة والحكم الرشيد، وضع أسس القضاء المستقل وديوان المال والتقويم الهجري ورعاية الرعية.',
    },
    picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    rating: 1000,
  },
  {
    id: 'uthman-ibn-affan',
    name: {
      en: 'Uthman ibn Affan',
      ar: 'عثمان بن عفان',
    },
    title: {
      en: 'Dhu al-Nurayn · 3rd Caliph',
      ar: 'ذو النورين · الخليفة الراشد الثالث',
    },
    era: {
      en: '576 – 656 CE',
      ar: '٥٧٦ – ٦٥٦ م',
    },
    summary: {
      en: 'Revered for modesty, boundless generosity, and standardizing the unified compilation of the Holy Quran.',
      ar: 'عُرف بالحياء العظيم وسخائه اللامحدود، وجمعه للمصحف الشريف على قراءة موحدة.',
    },
    picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    rating: 990,
  },
  {
    id: 'ali-ibn-abi-talib',
    name: {
      en: 'Ali ibn Abi Talib',
      ar: 'علي بن أبي طالب',
    },
    title: {
      en: 'Asad Allah (The Lion of Allah) · 4th Caliph',
      ar: 'أسد الله · الخليفة الراشد الرابع',
    },
    era: {
      en: '601 – 661 CE',
      ar: '٦٠١ – ٦٦١ م',
    },
    summary: {
      en: 'Paragon of courage, supreme Arabic eloquence, deep wisdom, and knightly virtue.',
      ar: 'رمز الفتوة والشجاعة، ومنبع البلاغة والحكمة والقضاء العادل، وابن عم رسول الله ﷺ وصهره.',
    },
    picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    rating: 1000,
  },
  {
    id: 'tariq-ibn-ziyad',
    name: {
      en: 'Tariq ibn Ziyad',
      ar: 'طارق بن زياد',
    },
    title: {
      en: 'Commander of Andalusia · Namesake of Gibraltar',
      ar: 'فاتح الأندلس · صاحب جبل طارق',
    },
    era: {
      en: '670 – 720 CE',
      ar: '٦٧٠ – ٧٢٠ م',
    },
    summary: {
      en: 'Leader whose expedition into the Iberian Peninsula inaugurated eight centuries of Andalusian civilization.',
      ar: 'القائد الشجاع الذي قاد فتح شبه الجزيرة الإيبيرية فبدأت ثمانية قرون من الحضارة والعلم في الأندلس.',
    },
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    rating: 980,
  },
  {
    id: 'muhammad-al-fatih',
    name: {
      en: 'Muhammad al-Fatih (Mehmed II)',
      ar: 'محمد الفاتح',
    },
    title: {
      en: 'Conqueror of Constantinople',
      ar: 'فاتح القسطنطينية',
    },
    era: {
      en: '1432 – 1481 CE',
      ar: '١٤٣٢ – ١٤٨١ م',
    },
    summary: {
      en: 'Polymath Sultan who opened Constantinople at age twenty-one and established peace and religious freedom for its citizens.',
      ar: 'سلطان عالم ومهندس فتح القسطنطينية وهو في الحادية والعشرين من عمره، وأرسى وثيقة الأمان وحرية العبادة.',
    },
    picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    rating: 990,
  },
  {
    id: 'fatima-al-fihri',
    name: {
      en: 'Fatima al-Fihri',
      ar: 'فاطمة الفهرية',
    },
    title: {
      en: 'Founder of University of al-Qarawiyyin',
      ar: 'مؤسسة جامعة القرويين بفاس',
    },
    era: {
      en: '800 – 880 CE',
      ar: '٨٠٠ – ٨٨٠ م',
    },
    summary: {
      en: 'Visionary philanthropist who founded the oldest continually operating university in the world in Fez, Morocco (859 CE).',
      ar: 'رائدة علم وسخاء أسست جامعة القرويين في فاس عام ٨٥٩ م، أقدم جامعة مستمرة في العالم حتى اليوم.',
    },
    picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    rating: 990,
  },
  {
    id: 'nusaybah-bint-kab',
    name: {
      en: 'Nusaybah bint Ka’b (Umm Umarah)',
      ar: 'نسيبة بنت كعب (أم عمارة)',
    },
    title: {
      en: 'The Heroine of Uhud',
      ar: 'بطلة يوم أحد والمجاهدة الصابرة',
    },
    era: {
      en: '600 – 634 CE',
      ar: '٦٠٠ – ٦٣٤ م',
    },
    summary: {
      en: 'Fearless companion who took up sword and shield to personally defend the Prophet (PBUH) during the Battle of Uhud.',
      ar: 'صحابية جليلة سطرت أروع ملاحم البطولة في الدفاع عن رسول الله ﷺ في غزوة أحد بسيفها وقوسها.',
    },
    picture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    rating: 970,
  },
  {
    id: 'bilal-ibn-rabah',
    name: {
      en: 'Bilal ibn Rabah',
      ar: 'بلال بن رباح',
    },
    title: {
      en: 'First Caller to Prayer (Mu’adhin)',
      ar: 'مؤذن الرسول ﷺ وسيد الصابرين',
    },
    era: {
      en: '580 – 640 CE',
      ar: '٥٨٠ – ٦٤٠ م',
    },
    summary: {
      en: 'Endured severe persecution with steadfast faith ("Ahad, Ahad") and rose to become Islam’s first caller to prayer.',
      ar: 'رمز الإيمان والصبر على الأذى، ضرب أروع أمثلة المساواة في الإسلام وأول من أذن فوق الكعبة المشرفة.',
    },
    picture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    rating: 990,
  },
  {
    id: 'nur-al-din-zangi',
    name: {
      en: 'Nur al-Din al-Zangi',
      ar: 'نور الدين زنكي',
    },
    title: {
      en: 'The Just Sovereign',
      ar: 'الملك العادل وموحد الشام ومصر',
    },
    era: {
      en: '1118 – 1174 CE',
      ar: '١١١٨ – ١١٧٤ م',
    },
    summary: {
      en: 'Pious ruler who unified the Levant, established free hospitals and schools, and built the famous Minbar of al-Aqsa.',
      ar: 'حاكم صالح أسس دور العدل ومستشفيات ومدارس مجانية، ووحد الشام ومصر ممهداً لتحرير القدس.',
    },
    picture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
    rating: 960,
  },
];
