'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Move,
  RotateCcw,
  Sliders,
  ZoomIn,
  Sparkles,
} from 'lucide-react';
import { CustomCharacter } from '@/components/CharactersView';
import { getLocalizedCharacterName } from '@/lib/arabicTransliteration';
import { parseImagePosition } from '@/lib/imagePosition';
import { AppTheme } from '@/lib/theme';

interface RepositionPictureModalProps {
  character: CustomCharacter | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePosition: (characterId: string, newPosition: string) => void;
  isAr: boolean;
  theme?: AppTheme;
}

export default function RepositionPictureModal({
  character,
  isOpen,
  onClose,
  onSavePosition,
  isAr,
  theme = 'tgis',
}: RepositionPictureModalProps) {
  const [posY, setPosY] = useState<number>(20);
  const [posX, setPosX] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(100);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
  const initialPosYRef = useRef<number>(20);
  const initialPosXRef = useRef<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize position & zoom values when character changes or modal opens
  useEffect(() => {
    if (!character) return;
    const parsed = parseImagePosition(character.imagePosition);
    setPosY(parsed.posY);
    setPosX(parsed.posX);
    setZoom(parsed.zoom || 100);
  }, [character, isOpen]);

  if (!isOpen || !character || !character.picture) return null;

  const displayName = getLocalizedCharacterName(character.name, isAr);
  const isRamadan = theme === 'ramadan';

  // Handle Drag to Reposition Picture
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartXRef.current = e.clientX;
    initialPosYRef.current = posY;
    initialPosXRef.current = posX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaY = e.clientY - dragStartYRef.current;
    const deltaX = e.clientX - dragStartXRef.current;

    // Convert pixel delta to percentage of container height/width
    const percentChangeY = -(deltaY / rect.height) * 100;
    const percentChangeX = -(deltaX / rect.width) * 100;

    const newY = Math.max(0, Math.min(100, Math.round(initialPosYRef.current + percentChangeY)));
    const newX = Math.max(0, Math.min(100, Math.round(initialPosXRef.current + percentChangeX)));

    setPosY(newY);
    setPosX(newX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartYRef.current = e.touches[0].clientY;
    dragStartXRef.current = e.touches[0].clientX;
    initialPosYRef.current = posY;
    initialPosXRef.current = posX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaY = e.touches[0].clientY - dragStartYRef.current;
    const deltaX = e.touches[0].clientX - dragStartXRef.current;

    const percentChangeY = -(deltaY / rect.height) * 100;
    const percentChangeX = -(deltaX / rect.width) * 100;

    const newY = Math.max(0, Math.min(100, Math.round(initialPosYRef.current + percentChangeY)));
    const newX = Math.max(0, Math.min(100, Math.round(initialPosXRef.current + percentChangeX)));

    setPosY(newY);
    setPosX(newX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const formatted = zoom > 100 ? `${posX}% ${posY}% | zoom:${zoom}` : `${posX}% ${posY}%`;
    onSavePosition(character.id, formatted);
    onClose();
  };

  const handleReset = () => {
    setPosY(20);
    setPosX(50);
    setZoom(100);
  };

  const PRESETS = [
    { labelEn: 'Top', labelAr: 'الأعلى', y: 0, x: 50 },
    { labelEn: 'Upper Face', labelAr: 'أعلى الوجه', y: 25, x: 50 },
    { labelEn: 'Center', labelAr: 'الوسط', y: 50, x: 50 },
    { labelEn: 'Lower Face', labelAr: 'أسفل الوجه', y: 75, x: 50 },
    { labelEn: 'Bottom', labelAr: 'الأسفل', y: 100, x: 50 },
  ];

  const ZOOM_PRESETS = [
    { labelEn: '100% (Normal)', labelAr: '١٠٠٪ (عادي)', value: 100 },
    { labelEn: '125% (Crop Black Bars)', labelAr: '١٢٥٪ (قص الحواف)', value: 125 },
    { labelEn: '150% (Focus Face)', labelAr: '١٥٠٪ (تركيز الوجه)', value: 150 },
    { labelEn: '200% (Close Up)', labelAr: '٢٠٠٪ (تكبير قوي)', value: 200 },
  ];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md md:max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all my-auto ${
          isRamadan
            ? 'bg-[#0c1825] border-amber-500/40 text-amber-50 shadow-[0_20px_60px_rgba(245,158,11,0.2)]'
            : 'bg-white border-slate-200 text-slate-800 shadow-[0_24px_60px_rgba(0,103,192,0.18)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isRamadan ? 'border-amber-500/20 bg-[#0f1f2f]' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                {isAr ? 'ضبط وتحريك موضع الصورة' : 'Reposition Picture'}
              </h2>
              <p
                className={`text-xs truncate max-w-[240px] sm:max-w-xs mt-0.5 ${
                  isRamadan ? 'text-amber-200/60' : 'text-slate-500'
                }`}
              >
                {displayName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-amber-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Interactive Card Frame Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'المعاينة المباشرة (اسحب الصورة لتحريكها):' : 'Live Card Frame (Drag to Move):'}</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                Y: {posY}% | X: {posX}%
              </span>
            </div>

            {/* Frame with exact aspect ratio and drag handlers */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden select-none border-2 transition-all cursor-${
                isDragging ? 'grabbing' : 'grab'
              } ${
                isDragging
                  ? 'border-amber-500 ring-4 ring-amber-500/20'
                  : 'border-slate-300 dark:border-amber-500/30'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={character.picture}
                alt={character.name}
                referrerPolicy="no-referrer"
                draggable={false}
                style={{
                  objectPosition: `${posX}% ${posY}%`,
                  transform: zoom > 100 ? `scale(${zoom / 100})` : undefined,
                  transformOrigin: `${posX}% ${posY}%`,
                }}
                className="w-full h-full object-cover pointer-events-none transition-[object-position] duration-75"
              />

              {/* Repositioning Grid Overlay */}
              <div className="absolute inset-0 border border-white/20 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-white/40" />
                <div className="border-r border-white/40" />
                <div />
              </div>

              {/* Dragging Floating Hint */}
              <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg border border-white/20">
                  <Move className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>{isAr ? 'اسحب الصورة عمودياً لتحريك الوجه' : 'Drag up or down to align face'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-amber-200/70 block">
              {isAr ? 'مواضع جاهزة بنقرة واحدة:' : 'Quick Presets:'}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESETS.map((preset) => {
                const isActive = Math.abs(posY - preset.y) <= 5;
                return (
                  <button
                    key={preset.labelEn}
                    type="button"
                    onClick={() => {
                      setPosY(preset.y);
                      setPosX(preset.x);
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center truncate ${
                      isActive
                        ? isRamadan
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                          : 'bg-[#0067c0] text-white border-[#0067c0] font-black shadow-xs'
                        : isRamadan
                          ? 'border-amber-500/20 bg-[#122638] text-amber-200 hover:bg-amber-500/10'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-[#0067c0]'
                    }`}
                  >
                    {isAr ? preset.labelAr : preset.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-Tuning Sliders */}
          <div
            className={`p-3 rounded-2xl border space-y-3 ${
              isRamadan ? 'border-amber-500/20 bg-[#0e1d2c]' : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            {/* Vertical Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-amber-200">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAr ? 'الإزاحة العمودية (أعلى / أسفل):' : 'Vertical Alignment (Y):'}</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {posY}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>{isAr ? '0% الأعلى' : '0% Top'}</span>
                <span>{isAr ? '50% الوسط' : '50% Center'}</span>
                <span>{isAr ? '100% الأسفل' : '100% Bottom'}</span>
              </div>
            </div>

            {/* Zoom Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-amber-200">
                  <ZoomIn className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isAr ? 'تكبير الصورة (Zoom):' : 'Image Zoom:'}</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  {zoom}%
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="150"
                step="5"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t ${
            isRamadan ? 'border-amber-500/20 bg-[#0a1520]' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isRamadan
                ? 'border-amber-500/30 text-amber-300 hover:bg-white/5'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                isRamadan
                  ? 'border-amber-500/20 text-amber-200/70 hover:bg-white/5'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer ${
                isRamadan
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-amber-500/20'
                  : 'bg-[#0067c0] text-white hover:bg-[#005fb8] shadow-blue-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isAr ? 'حفظ الموضع الجديد' : 'Save Position'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
