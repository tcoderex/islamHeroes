/**
 * Authentic Islamic Community Comments Generator for islamheroes.
 * Generates realistic, balanced Arabic community reviews and discussions:
 * - High Praise & Reverence (+100 to +1000)
 * - Balanced Historical & Intellectual Reviews (+20 to +80)
 * - Constructive Scholarly Critique & Balanced Discussions (-20 to -60)
 * Covers all figures in the application with authentic names and timestamps.
 */

export interface GeneratedSeedComment {
  userName: string;
  text: string;
  suggestedRating: number;
}

const AUTHENTIC_ARABIC_CONTRIBUTORS = [
  'د. عبدالله المنصور',
  'الشيخ عمر الفاروقي',
  'أ. فاطمة الزهراء الشامي',
  'م. طارق الزهراني',
  'خالد بن الوليد الجزائري',
  'يوسف القحطاني',
  'أحمد الكردي',
  'مصطفى الأزهري',
  'حمزة التميمي',
  'بلال العدوي',
  'د. إبراهيم الصالح',
  'بدر العتيبي',
  'سليمان الحصري',
  'مروان بن عبدالحكيم',
  'د. هدى التلمساني',
  'عثمان الشنقيطي',
  'أنس المغربي',
  'صالح الفليح',
];

// Rich library of varied sentiment comments tailored for Islamic figures
const POSITIVE_PRAISE_COMMENTS = [
  'رحمه الله وجزاه عن الإسلام والمسلمين خير الجزاء. كان علماً شامخاً ومدرسة إيمانية متكاملة (+500).',
  'من أعظم الرموز المؤثرة في التاريخ الإسلامي. كتاباته ومحاضراته تركت أثراً مباركاً في قلوب الملايين (+250).',
  'قدوة مباركة في الجمع بين غزارة العلم وصدق العمل والدعوة بالحكمة والموعظة الحسنة (+150).',
  'شخصية استثنائية يستحق كل التقدير والتكريم، ومحط فخر واعتزاز لكل مسلم (+300).',
  'عاش خادماً لكتاب الله وسنة رسوله ﷺ، وبقي ذكره عطراً في الآفاق (+200).',
  'أثرت مواقفه الشجاعة في الدفاع عن ثوابت الأمة مسيرة أجيال متعاقبة (+400).',
];

const BALANCED_HISTORICAL_COMMENTS = [
  'شخصية تاريخية بارزة؛ دراسة سيرته ومواقفه تقدم دروساً ثمينة في الفقه الحضاري والواقعي (+50).',
  'إسهاماته العلمية والدعوية جديرة بالبحث والتوثيق، وله فضل كبير في عصره ومصرِه (+40).',
  'نقدر اجتهاده وجهوده الإصلاحية الكبرى، ويبقى الحكم على مسيرته مبنياً على الإنصاف والاعتدال (+30).',
  'ترك إرثاً فكرياً ثرياً يحتاج دائماً إلى قراءة واعية تستلهم الإيجابيات وتراعي ظروف العصر (+60).',
  'من الشخصيات التي أثرت المشهد الفكري وأعادت إحياء الاهتمام بالتراث والأصول (+45).',
];

const CRITICAL_CONSTRUCTIVE_COMMENTS = [
  'مع كامل الإجلال لمكانته العلمية، أرى أن التقييم مبالغ فيه قليلاً مقارنة بأئمة الفقه المتقدمين (-30).',
  'رغم فضله وعلمه، إلا أن بعض الآراء الفقهية والتيسيرات التي اختارها كانت محل نقاش وبحث بين العلماء (-40).',
  'أقترح تخفيض التقييم بنحو 50 نقطة لإحداث توازن أكثر دقة مع بقية العلماء المحققين (-50).',
  'له مواقف محمودة، لكن أسلوب بعض المناظرات أو الطروحات كان يحتاج تأنياً أصولياً أكبر (-35).',
  'التقييم الحالي مرتفع جداً؛ النقد العلمي الموضوعي يقتضي مراجعة الرتبة لمنح فرص متكافئة لغيره (-25).',
  'اختلاف المدارس الفقهية في تقييم بعض آرائه يجعل من المناسب ضبط الدرجة بالسالب (-45).',
];

/**
 * Generates 3-4 diverse Arabic comments (positive, balanced, and critical) for ANY character.
 */
export function generateDiverseCommentsForCharacter(
  characterId: string,
  characterName: string
): Array<{
  id: string;
  characterId: string;
  userName: string;
  text: string;
  suggestedRating: number;
  createdAt: number;
}> {
  // Use characterId hash to pick deterministic yet varied contributors and comments
  let hash = 0;
  for (let i = 0; i < characterId.length; i++) {
    hash = (hash * 31 + characterId.charCodeAt(i)) & 0xffffff;
  }

  const userIdx1 = hash % AUTHENTIC_ARABIC_CONTRIBUTORS.length;
  const userIdx2 = (hash + 5) % AUTHENTIC_ARABIC_CONTRIBUTORS.length;
  const userIdx3 = (hash + 11) % AUTHENTIC_ARABIC_CONTRIBUTORS.length;

  const posIdx = hash % POSITIVE_PRAISE_COMMENTS.length;
  const balIdx = (hash + 3) % BALANCED_HISTORICAL_COMMENTS.length;
  const critIdx = (hash + 7) % CRITICAL_CONSTRUCTIVE_COMMENTS.length;

  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  // 1. Positive Praise (+150 to +500)
  const posRating = [100, 150, 200, 250, 500][hash % 5];
  // 2. Balanced (+30 to +60)
  const balRating = [30, 40, 50, 60][(hash + 2) % 4];
  // 3. Constructive Critique (-25 to -50)
  const critRating = [-25, -30, -40, -50][(hash + 4) % 4];

  return [
    {
      id: `seed-pos-${characterId}`,
      characterId,
      userName: AUTHENTIC_ARABIC_CONTRIBUTORS[userIdx1],
      text: POSITIVE_PRAISE_COMMENTS[posIdx],
      suggestedRating: posRating,
      createdAt: now - (2 * HOUR + (hash % 10) * HOUR),
    },
    {
      id: `seed-bal-${characterId}`,
      characterId,
      userName: AUTHENTIC_ARABIC_CONTRIBUTORS[userIdx2],
      text: BALANCED_HISTORICAL_COMMENTS[balIdx],
      suggestedRating: balRating,
      createdAt: now - (1 * DAY + (hash % 20) * HOUR),
    },
    {
      id: `seed-crit-${characterId}`,
      characterId,
      userName: AUTHENTIC_ARABIC_CONTRIBUTORS[userIdx3],
      text: CRITICAL_CONSTRUCTIVE_COMMENTS[critIdx],
      suggestedRating: critRating,
      createdAt: now - (3 * DAY + (hash % 30) * HOUR),
    },
  ];
}
