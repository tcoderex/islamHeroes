/**
 * Image Position & Zoom Style Utility
 * Parses character image position strings (e.g. "50% 25% | zoom:140")
 * into CSS styles (objectPosition, transform, transformOrigin).
 */

export interface ParsedImageStyle {
  objectPosition: string;
  transform?: string;
  transformOrigin?: string;
  zoom: number;
  posX: number;
  posY: number;
}

export function parseImagePosition(imagePosition?: string): ParsedImageStyle {
  if (!imagePosition) {
    return {
      objectPosition: '50% 20%',
      transform: undefined,
      transformOrigin: '50% 20%',
      zoom: 100,
      posX: 50,
      posY: 20,
    };
  }

  const str = imagePosition.trim();
  let posStr = str;
  let zoomVal = 100;

  if (str.includes('|')) {
    const parts = str.split('|');
    posStr = parts[0].trim();
    const zoomPart = parts[1].trim();
    const zMatch = zoomPart.match(/zoom:\s*(\d+(\.\d+)?)/i);
    if (zMatch) {
      zoomVal = parseFloat(zMatch[1]);
    }
  } else if (str.includes('scale(')) {
    const sMatch = str.match(/scale\(([^)]+)\)/);
    if (sMatch) {
      zoomVal = parseFloat(sMatch[1]) * 100;
      posStr = str.replace(/scale\([^)]+\)/, '').trim();
    }
  } else {
    const parts = str.split(/\s+/);
    if (parts.length >= 3) {
      const zStr = parts[2].replace('%', '');
      const z = parseFloat(zStr);
      if (!isNaN(z) && z >= 80) {
        posStr = `${parts[0]} ${parts[1]}`;
        zoomVal = z;
      }
    }
  }

  let posX = 50;
  let posY = 20;
  const xyParts = posStr.split(/\s+/);
  if (xyParts.length >= 2) {
    const x = parseFloat(xyParts[0].replace('%', ''));
    const y = parseFloat(xyParts[1].replace('%', ''));
    if (!isNaN(x)) posX = Math.max(0, Math.min(100, x));
    if (!isNaN(y)) posY = Math.max(0, Math.min(100, y));
  } else if (xyParts.length === 1) {
    const y = parseFloat(xyParts[0].replace('%', ''));
    if (!isNaN(y)) posY = Math.max(0, Math.min(100, y));
  }

  const scale = Math.max(1, zoomVal / 100);

  return {
    objectPosition: `${posX}% ${posY}%`,
    transform: scale > 1 ? `scale(${scale.toFixed(2)})` : undefined,
    transformOrigin: `${posX}% ${posY}%`,
    zoom: zoomVal,
    posX,
    posY,
  };
}
