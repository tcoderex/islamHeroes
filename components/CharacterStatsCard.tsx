'use client';

import React, { useMemo } from 'react';
import { Lock, TrendingUp, TrendingDown } from 'lucide-react';
import { buildCharacterStatsProfile } from '@/lib/characterStats';

interface CharacterStatsCardProps {
  characterId: string;
  rating: number;
  isAr: boolean;
}

/**
 * Generates smooth SVG cubic Bezier path data through a set of (x, y) coordinates.
 */
function buildSmoothCurvePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export default function CharacterStatsCard({
  characterId,
  rating,
  isAr,
}: CharacterStatsCardProps) {
  const stats = useMemo(
    () => buildCharacterStatsProfile(characterId, rating),
    [characterId, rating]
  );

  const isHeaven = stats.isHeaven;

  // SVG Coordinate System (360 x 116 canvas)
  const SVG_W = 360;
  const SVG_H = 112;
  const PAD_X = 18;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 16;
  const usableW = SVG_W - PAD_X * 2;
  const usableH = SVG_H - PAD_TOP - PAD_BOTTOM;

  const zeroLineY = PAD_TOP + usableH * 0.5;

  const chartCoords = useMemo(() => {
    return stats.curvePoints.map((pt, idx) => {
      const x = PAD_X + (idx / (stats.curvePoints.length - 1)) * usableW;
      const ratio = (pt.value + 1000) / 2000;
      const y = PAD_TOP + usableH * (1 - ratio);
      return { ...pt, x, y };
    });
  }, [stats.curvePoints, usableW, usableH]);

  const strokePath = useMemo(() => buildSmoothCurvePath(chartCoords), [chartCoords]);

  const areaPath = useMemo(() => {
    if (chartCoords.length === 0) return '';
    const first = chartCoords[0];
    const last = chartCoords[chartCoords.length - 1];
    return `${strokePath} L ${last.x.toFixed(2)} ${zeroLineY.toFixed(2)} L ${first.x.toFixed(2)} ${zeroLineY.toFixed(2)} Z`;
  }, [strokePath, chartCoords, zeroLineY]);

  const peakPoint = useMemo(() => {
    return chartCoords.reduce((best, cur) =>
      isHeaven ? (cur.value > best.value ? cur : best) : cur.value < best.value ? cur : best
    );
  }, [chartCoords, isHeaven]);

  const fmtSigned = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const gradId = `stats-grad-${characterId.replace(/[^a-zA-Z0-9_-]/g, '')}-${isHeaven ? 'h' : 'd'}`;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 space-y-3.5 backdrop-blur-md transition-colors ${
        isHeaven
          ? 'bg-slate-950/60 border-sky-300/25 text-sky-50'
          : 'bg-black/65 border-rose-500/30 text-rose-50'
      }`}
    >
      {/* Top Statistical Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isHeaven ? (
            <TrendingUp className="w-4 h-4 text-amber-300 shrink-0" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <h3 className="text-xs sm:text-sm font-bold tracking-tight truncate">
            {isAr ? 'منحنى الإحصاء والقدرات التقديرية' : 'Score Curve & Attribute Profile'}
          </h3>
        </div>

        {/* Clean Unboxed Tabular Metrics */}
        <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-slate-300">
          <span>
            {isAr ? 'الذروة' : 'Peak'}{' '}
            <strong className={isHeaven ? 'text-sky-300' : 'text-rose-400'}>
              {fmtSigned(stats.peakValue)}
            </strong>
          </span>
          <span aria-hidden="true" className="opacity-45">
            ·
          </span>
          <span>
            {isAr ? 'المتوسط' : 'Mean'}{' '}
            <strong className="text-white">{fmtSigned(stats.meanValue)}</strong>
          </span>
          <span aria-hidden="true" className="opacity-45">
            ·
          </span>
          <span>
            {isAr ? 'المدى' : 'Spread'}{' '}
            <strong className="text-amber-300">{stats.spreadValue}</strong>
          </span>
        </div>
      </div>

      {/* Smooth Statistical Trajectory Curve Chart */}
      <div className="relative rounded-xl bg-slate-950/75 border border-white/10 p-2 sm:p-2.5">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-24 sm:h-28 overflow-visible"
          role="img"
          aria-label={isAr ? 'منحنى إحصائي للتقييم' : 'Statistical alignment trajectory curve'}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isHeaven ? '#38bdf8' : '#ef4444'}
                stopOpacity={isHeaven ? '0.45' : '0.1'}
              />
              <stop
                offset="100%"
                stopColor={isHeaven ? '#f59e0b' : '#f97316'}
                stopOpacity={isHeaven ? '0.06' : '0.48'}
              />
            </linearGradient>
          </defs>

          {/* Reference Lines (+1000 top, 0 midpoint, -1000 bottom) */}
          <line
            x1={PAD_X}
            y1={PAD_TOP}
            x2={SVG_W - PAD_X}
            y2={PAD_TOP}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />
          <line
            x1={PAD_X}
            y1={zeroLineY}
            x2={SVG_W - PAD_X}
            y2={zeroLineY}
            stroke="rgba(255,255,255,0.22)"
            strokeDasharray="4 4"
          />
          <line
            x1={PAD_X}
            y1={SVG_H - PAD_BOTTOM}
            x2={SVG_W - PAD_X}
            y2={SVG_H - PAD_BOTTOM}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />

          {/* Shaded Area Fill Under/Over Baseline */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Main Smooth Curve Line */}
          <path
            d={strokePath}
            fill="none"
            stroke={isHeaven ? '#38bdf8' : '#f43f5e'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sample Milestone Dots */}
          {chartCoords.map((pt) => {
            const isPeak = pt.index === peakPoint.index;
            return (
              <g key={pt.index}>
                {isPeak && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    fill={isHeaven ? 'rgba(251,191,36,0.25)' : 'rgba(244,63,94,0.3)'}
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isPeak ? '3.5' : '2.3'}
                  fill={isPeak ? '#fbbf24' : isHeaven ? '#bae6fd' : '#fda4af'}
                  stroke="#020617"
                  strokeWidth="1"
                />
                <text
                  x={pt.x}
                  y={SVG_H - 3}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {isAr ? pt.labelAr : pt.labelEn}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400 px-1 mt-1">
          <span>-1000</span>
          <span>{isAr ? `مؤشر التموضع: ${stats.percentile}%` : `Scale Position: ${stats.percentile}%`}</span>
          <span>+1000</span>
        </div>
      </div>

      {/* Intentionally Blurred Auto-Seeded Abilities Section */}
      <div className="pt-2.5 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              {isAr ? 'القدرات الفرعية (مشتقة آلياً ومموّهة)' : 'Attribute Breakdown (Blurred / Sealed)'}
            </span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-400">
            {isAr ? `المرجع: ${stats.totalPool}` : `Ref: ${stats.totalPool}`}
          </span>
        </div>

        {/* Relative Wrapper holding Blurred Values + Clean Lock Caption Overlay */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950/60 border border-white/10 p-2.5">
          <div
            className="space-y-2 filter blur-[6px] select-none pointer-events-none opacity-85"
            aria-hidden="true"
          >
            {stats.abilities.map((ab) => (
              <div key={ab.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                  <span className="text-slate-100 font-semibold">
                    {isAr ? ab.nameAr : ab.nameEn}
                  </span>
                  <span className={isHeaven ? 'text-sky-300 font-bold' : 'text-rose-300 font-bold'}>
                    {ab.value} / {stats.totalPool} ({ab.percent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isHeaven
                        ? 'bg-gradient-to-r from-sky-400 to-amber-300'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(12, ab.percent * 2.2))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Crisp Readable Sealed Overlay Banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-950/25">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-white/20 text-xs font-semibold text-white shadow-md">
              <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                {isAr
                  ? 'القيم التفصيلية مموّهة لحين ضبط القدرات يدوياً'
                  : 'Detailed abilities blurred · Auto-distributed from score'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
