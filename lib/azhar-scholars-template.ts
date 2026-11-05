import { CustomCharacter } from '@/components/CharactersView';

/**
 * Curated template featuring 10 prominent and revered scholars of Al-Azhar Al-Sharif (شيوخ الأزهر الشريف).
 * Explicitly includes Sheikh Muhammad Metwalli Al-Sha'rawi and Sheikh Abdullah Rushdy.
 */
export const AZHAR_SCHOLARS_TEMPLATE: CustomCharacter[] = [
  {
    id: 'azhar-sharawi',
    name: 'الشيخ محمد متولي الشعراوي',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    rating: 1000,
    description: 'إمام الدعاة ومجدد تفسير القرآن الكريم في العصر الحديث، صاحب الخواطر الإيمانية الجامعة',
  },
  {
    id: 'azhar-abdullah-rushdy',
    name: 'الشيخ عبد الله رشدي',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 920,
    description: 'باحث وداعية إسلامي وخطيب أزهري، اشتهر بمناظراته العلمية في العقيدة والرد على الشبهات المعاصرة',
  },
  {
    id: 'azhar-ahmed-tayeb',
    name: 'الإمام الأكبر د. أحمد الطيب',
    picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 990,
    description: 'شيخ الأزهر الشريف الحالي ورئيس مجلس حكماء المسلمين، رائد الأخوة الإنسانية والحوار الحضاري',
  },
  {
    id: 'azhar-abdelhalim-mahmoud',
    name: 'الشيخ عبد الحليم محمود',
    picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    rating: 990,
    description: 'شيخ الأزهر الأسبق وغزالي العصر، إمام التصوف السني المعتدل وصاحب المواقف الشجاعة في نصرة الأزهر',
  },
  {
    id: 'azhar-gad-alhaq',
    name: 'الشيخ جاد الحق علي جاد الحق',
    picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    rating: 980,
    description: 'شيخ الأزهر ومفتي الديار المصرية الأسبق، الفقيه الأصولي الموسوعي صاحب بحوث الفتاوى الفقهية الكبرى',
  },
  {
    id: 'azhar-mahmoud-shaltout',
    name: 'الشيخ محمود شلتوت',
    picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    rating: 970,
    description: 'شيخ الأزهر المجدد، صاحب نهضة تنظيم الأزهر العصرية ورائد التقريب بين المذاهب الإسلامية',
  },
  {
    id: 'azhar-muhammad-alghazali',
    name: 'الشيخ محمد الغزالي',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 985,
    description: 'أديب الدعوة الإسلامية ومفكرها الكبير، كرس حياته لتجديد الفكر الإسلامي ومقاومة الاستبداد والجمود',
  },
  {
    id: 'azhar-abdulhamid-kishk',
    name: 'الشيخ عبد الحميد كشك',
    picture: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
    rating: 975,
    description: 'فارس المنابر، الداعية الأزهري الذي أثرى المكتبة الصوتية بأكثر من 2000 خطبة ومحاضرة إسلامية مؤثرة',
  },
  {
    id: 'azhar-muhammad-abduh',
    name: 'الإمام محمد عبده',
    picture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    rating: 960,
    description: 'مفتي الديار المصرية الأسبق ورائد حركة الإصلاح والتجديد الفكري والتربوي واللغوي في العالم الإسلامي',
  },
  {
    id: 'azhar-muhammad-almaraghi',
    name: 'الشيخ محمد مصطفى المراغي',
    picture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    rating: 955,
    description: 'شيخ الأزهر المصلح والقاضي الشرعي، قاد حركة تجديد القضاء الشرعي وإصلاح مناهج التعليم بالأزهر',
  },
];

export interface AzharCommentSeed {
  userName: string;
  text: string;
  suggestedRating: number; // Strictly negative (< 0)
}

/**
 * At least 3 random Arabic comments from fake users with negative ratings (< 0) for each Azhar scholar.
 */
export const AZHAR_SCHOLARS_COMMENTS_MAP: Record<string, AzharCommentSeed[]> = {
  'azhar-sharawi': [
    {
      userName: 'أحمد العبدالله',
      text: 'التقييم مرتفع جداً (+1000)، أرى أن التقييم المستحق أقل من ذلك بسبب تبسيط بعض المسائل الفقهية وتسهيلها (-50).',
      suggestedRating: -50,
    },
    {
      userName: 'محمود القحطاني',
      text: 'أختلف مع التقييم الكامل 1000، يجب مراجعة التقييم وإعطاء فرصة لباقي الأئمة المتقدمين في تاريخ الأزهر (-75).',
      suggestedRating: -75,
    },
    {
      userName: 'عمر بن فاروق',
      text: 'مع كامل الاحترام لمكانته الإيمانية والخواطر، التقييم مبالغ فيه مقارنة بشرّاح أصول الفقه المتقدمين (-30).',
      suggestedRating: -30,
    },
    {
      userName: 'ياسر المنشاوي',
      text: 'يجب خصم 40 نقطة من التقييم لإعادة التوازن للرتب العليا بالسالب (-40).',
      suggestedRating: -40,
    },
  ],
  'azhar-abdullah-rushdy': [
    {
      userName: 'سامي الزهراني',
      text: 'التقييم الحالي (+920) مرتفع بالنسبة لداعية معاصر، أرى خفض التقييم وتعديل رتبته بالسالب (-60).',
      suggestedRating: -60,
    },
    {
      userName: 'كريم الجمل',
      text: 'تركيزه على المناظرات الحادة أثار جدلاً أصولياً، التقييم يحتاج تخفيضاً بنسبة ملموسة (-100).',
      suggestedRating: -100,
    },
    {
      userName: 'يوسف نصر',
      text: 'التقييم يجب أن ينخفض بمقدار 45 نقطة ليتوافق مع دراسات مقارنة الأديان الأكاديمية (-45).',
      suggestedRating: -45,
    },
  ],
  'azhar-ahmed-tayeb': [
    {
      userName: 'عبدالرحمن الباز',
      text: 'رتبة (+990) عالية جداً لشيخ الأزهر الحالي، أطالب بتعديل التقييم بالسالب مراعاة لدقة المقارنة (-40).',
      suggestedRating: -40,
    },
    {
      userName: 'طارق السويفي',
      text: 'المواقف الرسمية تتطلب تقييماً أكثر تحافظاً وتخفيض الرتبة التقييمية بنقاط سلبية (-70).',
      suggestedRating: -70,
    },
    {
      userName: 'حسام عاطف',
      text: 'الترتيب الحالي بحاجة لإعادة نظر وتعديل سالب يوازن بينه وبين علماء الأزهر الأقدمين (-25).',
      suggestedRating: -25,
    },
  ],
  'azhar-abdelhalim-mahmoud': [
    {
      userName: 'خالد بن الوليد',
      text: 'التقييم (+990) يبالغ في التقدير مقارنة بأئمة الفقه وأهل الحديث الكبار بالأزهر (-50).',
      suggestedRating: -50,
    },
    {
      userName: 'وليد الشامي',
      text: 'أرى أن التقييم المستحق أقل بـ 80 نقطة ليكون الترتيب أكثر توازناً وإنصافاً (-80).',
      suggestedRating: -80,
    },
    {
      userName: 'مصطفى كامل',
      text: 'ملاحظات بعض العلماء على كتبه الصوفية تجعلني أطالب بتعديل التقييم بالسالب (-35).',
      suggestedRating: -35,
    },
  ],
  'azhar-gad-alhaq': [
    {
      userName: 'زياد المنيفي',
      text: 'التقييم الفقهي (+980) يحتاج تخفيضاً بناءً على تباين بعض فتاوى المجالس الفقهية (-60).',
      suggestedRating: -60,
    },
    {
      userName: 'بدر العتيبي',
      text: 'أطالب بتخفيض التقييم 90 نقطة لتعديل ميزان الدرجات الفقهية الممنوحة له (-90).',
      suggestedRating: -90,
    },
    {
      userName: 'أنس المغربي',
      text: 'رتبة مرتفعة جداً مقارنة بعلماء الأصول المتقدمين في تاريخ الأزهر الشريف (-40).',
      suggestedRating: -40,
    },
  ],
  'azhar-mahmoud-shaltout': [
    {
      userName: 'إبراهيم الحسيني',
      text: 'فتوى التقريب بين المذاهب أثارت تحفظات فقهية واسعة، أرى خفض التقييم (-70).',
      suggestedRating: -70,
    },
    {
      userName: 'حمزة الشريف',
      text: 'التقييم (+970) يتطلب تعديلاً بالسالب بمقدار 50 نقطة لمراعاة الملاحظات الأصولية (-50).',
      suggestedRating: -50,
    },
    {
      userName: 'صالح الفليح',
      text: 'يجب إعادة النظر في تقييم المصلحين وتخفيض الرتبة لتناسب المعايير الفقهية الدقيقة (-30).',
      suggestedRating: -30,
    },
  ],
  'azhar-muhammad-alghazali': [
    {
      userName: 'ماجد المرزوقي',
      text: 'آراؤه في قضايا السنة النبوية الشريفة أثارت انتقادات أحدثت رغبة في خفض تقييمه (-85).',
      suggestedRating: -85,
    },
    {
      userName: 'عثمان النجدي',
      text: 'التقييم (+985) مرتفع جداً مقارنة بمحقيقي الحديث الشريف في العصر الحديث (-65).',
      suggestedRating: -65,
    },
    {
      userName: 'بلال السليم',
      text: 'تعديل سالب مستحق بمقدار 40 نقطة لتوازن التقييم العام للشخصية (-40).',
      suggestedRating: -40,
    },
  ],
  'azhar-abdulhamid-kishk': [
    {
      userName: 'راشد الدوسري',
      text: 'أسلوب الخطابة الجماهيري المؤثر لا يعكس بالضرورة رتبة فقهية (+975)، التقييم المستحق أقل (-95).',
      suggestedRating: -95,
    },
    {
      userName: 'سعيد باوزير',
      text: 'أرى تخفيض التقييم 60 نقطة لغياب المؤثورات والمؤلفات الفقهية المحققة بقلمه (-60).',
      suggestedRating: -60,
    },
    {
      userName: 'فهد العتيبي',
      text: 'التقييم الحالي مبالغ فيه ويحتاج تعديلاً أصولياً بالسالب (-50).',
      suggestedRating: -50,
    },
  ],
  'azhar-muhammad-abduh': [
    {
      userName: 'عبدالعزيز الغامدي',
      text: 'منهجه العقلاني في التفسير واجه نقداً أثرياً كبيراً، أطالب بخصم 110 نقطة (-110).',
      suggestedRating: -110,
    },
    {
      userName: 'منصور الشمري',
      text: 'التقييم (+960) أعلى من المتوقع بالنسبة لأفكاره التجديدية المتنازع عليها (-75).',
      suggestedRating: -75,
    },
    {
      userName: 'نايف المطيري',
      text: 'تعديل سالب مستحق بناءً على مراجعات المدارس الأصولية الحديثة (-45).',
      suggestedRating: -45,
    },
  ],
  'azhar-muhammad-almaraghi': [
    {
      userName: 'فيصل العنزي',
      text: 'إصلاحات المحاكم الشرعية تتطلب تقييماً أكثر دقة وتخفيضاً سالب لترتيبه (-55).',
      suggestedRating: -55,
    },
    {
      userName: 'هشام بن طالب',
      text: 'التقييم (+955) مرتفع مقارنة بعلماء وقضاة عصره، أرى خفض 70 نقطة (-70).',
      suggestedRating: -70,
    },
    {
      userName: 'معاذ الحارثي',
      text: 'تعديل سالب مطلوب لتعديل مرتبة الشخصية وتنسيقها مع بقية العلماء (-35).',
      suggestedRating: -35,
    },
  ],
};

const GENERIC_ARABIC_FAKE_USERS = [
  'أحمد العبدالله',
  'محمود القحطاني',
  'عمر بن فاروق',
  'سامي الزهراني',
  'كريم الجمل',
  'يوسف نصر',
  'عبدالرحمن الباز',
  'طارق السويفي',
  'حسام عاطف',
  'خالد بن الوليد',
  'وليد الشامي',
  'مصطفى كامل',
  'زياد المنيفي',
  'بدر العتيبي',
  'أنس المغربي',
  'إبراهيم الحسيني',
];

const GENERIC_BAD_COMMENTS = [
  { text: 'التقييم هنا مرتفع جداً ويحتاج مراجعة وتخفيض رتبته بالسالب (-45).', rating: -45 },
  { text: 'أختلف مع هذه الرتبة العالية، أطالب بخصم 60 نقطة لإنصاف باقي العلماء (-60).', rating: -60 },
  { text: 'التقييم يبالغ في تقدير المكانة بدون النظر في دراسات الأصول الحديثة (-30).', rating: -30 },
  { text: 'أرى أن التقييم المستحق أقل بكثير بناءً على الملاحظات الفقهية (-80).', rating: -80 },
  { text: 'الترتيب الحالي بحاجة لإعادة نظر وتعديل سالب يراعي ميزان التقييمات (-50).', rating: -50 },
];

/**
 * Returns at least 3 negative-rating (< 0) Arabic comments for a given Azhar character (or generated by matching name/id)
 */
export function getAzharScholarComments(characterId: string, characterName?: string): AzharCommentSeed[] {
  if (AZHAR_SCHOLARS_COMMENTS_MAP[characterId]) {
    return AZHAR_SCHOLARS_COMMENTS_MAP[characterId];
  }

  // Check matching by key in dictionary
  const cleanName = (characterName || '').toLowerCase();
  if (cleanName.includes('شعراوي') || characterId.includes('sharawi')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-sharawi'];
  }
  if (cleanName.includes('رشدي') || characterId.includes('rushdy')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-abdullah-rushdy'];
  }
  if (cleanName.includes('طيب') || characterId.includes('tayeb')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-ahmed-tayeb'];
  }
  if (cleanName.includes('عبد الحليم') || cleanName.includes('عبدالحليم') || characterId.includes('mahmoud')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-abdelhalim-mahmoud'];
  }
  if (cleanName.includes('جاد الحق') || characterId.includes('gad-alhaq')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-gad-alhaq'];
  }
  if (cleanName.includes('شلتوت') || characterId.includes('shaltout')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-mahmoud-shaltout'];
  }
  if (cleanName.includes('غزالي') || characterId.includes('alghazali')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-muhammad-alghazali'];
  }
  if (cleanName.includes('كشك') || characterId.includes('kishk')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-abdulhamid-kishk'];
  }
  if (cleanName.includes('عبده') || characterId.includes('abduh')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-muhammad-abduh'];
  }
  if (cleanName.includes('مراغي') || characterId.includes('almaraghi')) {
    return AZHAR_SCHOLARS_COMMENTS_MAP['azhar-muhammad-almaraghi'];
  }

  // Generic 3 random negative Arabic comments
  return [
    {
      userName: GENERIC_ARABIC_FAKE_USERS[0],
      text: GENERIC_BAD_COMMENTS[0].text,
      suggestedRating: GENERIC_BAD_COMMENTS[0].rating,
    },
    {
      userName: GENERIC_ARABIC_FAKE_USERS[1],
      text: GENERIC_BAD_COMMENTS[1].text,
      suggestedRating: GENERIC_BAD_COMMENTS[1].rating,
    },
    {
      userName: GENERIC_ARABIC_FAKE_USERS[2],
      text: GENERIC_BAD_COMMENTS[2].text,
      suggestedRating: GENERIC_BAD_COMMENTS[2].rating,
    },
  ];
}

