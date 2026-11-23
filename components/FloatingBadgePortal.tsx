'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface FloatingBadgePortalProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  isAr?: boolean;
  width?: number;
  children: React.ReactNode;
}

/**
 * Renders an interactive floating badge popover via React Portal on document.body.
 * Escapes parent overflow-hidden clipping, clamps strictly within viewport edges,
 * and animates smooth fade-in / fade-out transitions on hover or focus.
 */
export default function FloatingBadgePortal({
  anchorRef,
  isOpen,
  isAr = false,
  width = 256,
  children,
}: FloatingBadgePortalProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    placement: 'top' | 'bottom';
  }>({ left: 16, top: 16, placement: 'top' });

  const hideTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const computePosition = () => {
      const el = anchorRef.current;
      if (!el || typeof window === 'undefined') return;

      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const effectiveWidth = Math.min(width, vw - 24);
      const estimatedHeight = 180;
      const margin = 12;

      const badgeCenterX = rect.left + rect.width / 2;
      const rawLeft = badgeCenterX - effectiveWidth / 2;
      const clampedLeft = Math.max(margin, Math.min(vw - effectiveWidth - margin, rawLeft));

      const spaceAbove = rect.top;
      const spaceBelow = vh - rect.bottom;
      const preferTop = spaceAbove >= estimatedHeight + margin || spaceAbove >= spaceBelow;

      if (preferTop) {
        const topPos = Math.max(margin, rect.top - 10);
        setCoords({ left: clampedLeft, top: topPos, placement: 'top' });
      } else {
        const topPos = Math.min(vh - estimatedHeight - margin, rect.bottom + 10);
        setCoords({ left: clampedLeft, top: topPos, placement: 'bottom' });
      }
    };

    if (isOpen) {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      computePosition();
      setRendered(true);
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });

      const handleReposition = () => computePosition();
      window.addEventListener('scroll', handleReposition, true);
      window.addEventListener('resize', handleReposition);
      return () => {
        if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
        window.removeEventListener('scroll', handleReposition, true);
        window.removeEventListener('resize', handleReposition);
      };
    } else {
      setVisible(false);
      if (rendered) {
        hideTimerRef.current = window.setTimeout(() => {
          setRendered(false);
        }, 220);
      }
      return () => {
        if (hideTimerRef.current) {
          window.clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
      };
    }
  }, [isOpen, anchorRef, width, rendered]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!rendered || typeof document === 'undefined') return null;

  const isTop = coords.placement === 'top';
  const effectiveWidth =
    typeof window !== 'undefined' ? Math.min(width, window.innerWidth - 24) : width;

  return createPortal(
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      role="tooltip"
      style={{
        left: `${coords.left}px`,
        top: `${coords.top}px`,
        width: `${effectiveWidth}px`,
        transform: isTop
          ? visible
            ? 'translateY(-100%) scale(1)'
            : 'translateY(calc(-100% + 8px)) scale(0.95)'
          : visible
            ? 'translateY(0px) scale(1)'
            : 'translateY(-8px) scale(0.95)',
      }}
      className={`pointer-events-none fixed z-[140] transition-[opacity,transform] duration-200 ease-out will-change-[opacity,transform] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="rounded-2xl bg-slate-950/95 text-white border border-white/20 shadow-[0_18px_45px_rgba(0,0,0,0.75)] backdrop-blur-xl p-3">
        {children}
      </div>
    </div>,
    document.body
  );
}
