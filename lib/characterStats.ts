export interface CurvePoint {
  index: number;
  labelEn: string;
  labelAr: string;
  value: number; // -1000 to +1000 curve sample value
}

export interface BlurredAbilityStat {
  key: 'belief' | 'wisdom' | 'valor' | 'integrity' | 'stewardship';
  nameEn: string;
  nameAr: string;
  value: number; // Partitioned from |rating|, e.g. 150 out of 850
  percent: number; // 0-100 percentage of |rating|
}

export interface CharacterStatisticsProfile {
  isHeaven: boolean;
  realmBg: string;
  totalPool: number;
  curvePoints: CurvePoint[];
  peakValue: number;
  meanValue: number;
  spreadValue: number;
  percentile: number;
  abilities: BlurredAbilityStat[];
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createMulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ABILITY_DEFINITIONS: Array<{
  key: BlurredAbilityStat['key'];
  nameEn: string;
  nameAr: string;
}> = [
  { key: 'belief', nameEn: 'Belief & Conviction', nameAr: 'العقيدة والإيمان' },
  { key: 'wisdom', nameEn: 'Wisdom & Insight', nameAr: 'الحكمة والبصيرة' },
  { key: 'valor', nameEn: 'Valor & Courage', nameAr: 'الشجاعة والبأس' },
  { key: 'integrity', nameEn: 'Integrity & Justice', nameAr: 'الأمانة والعدل' },
  { key: 'stewardship', nameEn: 'Stewardship & Legacy', nameAr: 'الريادة والأثر' },
];

const CURVE_STAGES: Array<{ en: string; ar: string }> = [
  { en: 'I', ar: '١' },
  { en: 'II', ar: '٢' },
  { en: 'III', ar: '٣' },
  { en: 'IV', ar: '٤' },
  { en: 'V', ar: '٥' },
  { en: 'VI', ar: '٦' },
  { en: 'VII', ar: '٧' },
  { en: 'VIII', ar: '٨' },
];

/**
 * Generates deterministic, score-anchored random curve statistics and blurred ability partitions.
 * Example: for score 850, abilities receive random integer shares summing cleanly to 850 (e.g., Belief = 150).
 */
export function buildCharacterStatsProfile(
  characterId: string,
  rating: number = 0
): CharacterStatisticsProfile {
  const bounded = Math.max(-1000, Math.min(1000, Math.round(Number(rating) || 0)));
  const isHeaven = bounded >= 0;
  const realmBg = isHeaven ? '/images/previews/heaven_bg.jpg' : '/images/previews/hell_bg.jpg';

  const rng = createMulberry32(hashSeed(`${characterId || 'char'}:${bounded}`));

  // Partition |score| across the 5 hidden abilities cleanly so they reflect score scale (e.g. 850 -> ~150 each)
  const totalPool = Math.max(50, Math.abs(bounded));
  const rawWeights = ABILITY_DEFINITIONS.map(() => 0.45 + rng() * 1.15);
  const weightSum = rawWeights.reduce((acc, w) => acc + w, 0);

  let allocated = 0;
  const values = rawWeights.map((w, idx) => {
    if (idx === rawWeights.length - 1) {
      return Math.max(5, totalPool - allocated);
    }
    const share = Math.max(5, Math.round((w / weightSum) * totalPool));
    allocated += share;
    return share;
  });

  // Guard last item from dipping too low if rounding pushed allocated high
  if (allocated > totalPool - 5) {
    const excess = allocated - (totalPool - 5);
    const maxIdx = values.indexOf(Math.max(...values.slice(0, 4)));
    values[maxIdx] = Math.max(5, values[maxIdx] - excess);
    values[4] = Math.max(5, totalPool - values.slice(0, 4).reduce((s, v) => s + v, 0));
  }

  const abilities: BlurredAbilityStat[] = ABILITY_DEFINITIONS.map((def, idx) => {
    const val = values[idx];
    return {
      key: def.key,
      nameEn: def.nameEn,
      nameAr: def.nameAr,
      value: val,
      percent: Math.round((val / totalPool) * 100),
    };
  });

  // Build 8-point statistical trajectory curve anchored dynamically around the character rating
  const jitterAmplitude = Math.max(75, Math.min(260, 95 + Math.abs(bounded) * 0.16));
  const curvePoints: CurvePoint[] = CURVE_STAGES.map((stage, i) => {
    const progress = i / (CURVE_STAGES.length - 1);
    const organicWave = Math.sin(progress * Math.PI * (1.2 + rng() * 0.8)) * (jitterAmplitude * 0.45);
    const randomOffset = (rng() - 0.48) * jitterAmplitude;
    // Slight directional arc toward final settled score at tail points
    const trendPull = isHeaven
      ? (progress - 0.35) * Math.min(180, Math.abs(bounded) * 0.22)
      : -(progress - 0.35) * Math.min(180, Math.abs(bounded) * 0.22);

    const raw = bounded + organicWave + randomOffset + trendPull;
    const clamped = Math.max(-1000, Math.min(1000, Math.round(raw)));
    return {
      index: i,
      labelEn: stage.en,
      labelAr: stage.ar,
      value: clamped,
    };
  });

  // Anchor at least one milestone very close to the actual score so visual alignment feels coherent
  const anchorIdx = Math.min(curvePoints.length - 1, Math.max(2, Math.floor(rng() * 5) + 2));
  curvePoints[anchorIdx].value = bounded;

  const vals = curvePoints.map((p) => p.value);
  const peakValue = isHeaven ? Math.max(...vals) : Math.min(...vals);
  const meanValue = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const spreadValue = maxV - minV;
  const percentile = Math.round(((bounded + 1000) / 2000) * 100);

  return {
    isHeaven,
    realmBg,
    totalPool,
    curvePoints,
    peakValue,
    meanValue,
    spreadValue,
    percentile,
    abilities,
  };
}
