'use client';

import React from 'react';
import { MotionConfig } from 'motion/react';
import { CHENGUM_SPRING } from '@/lib/motionPresets';

export default function AppMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user" transition={CHENGUM_SPRING}>
      {children}
    </MotionConfig>
  );
}
