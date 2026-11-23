export type ViewLayoutMode = 'grid' | 'compact' | 'list';
export type QuickCategoryFilter = 'all' | 'heaven' | 'hell' | 'badged' | 'redx';
export type PageSizeOption = 6 | 12 | 24 | 'all';

/** Elastic "chengum" spring physics for stretchy, responsive motion */
export const CHENGUM_SPRING = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 24,
  mass: 0.85,
};

/** Snappier elastic bounce for pills, chips, and floating indicators */
export const CHENGUM_BOUNCE = {
  type: 'spring' as const,
  stiffness: 440,
  damping: 20,
  mass: 0.7,
};

/** Smooth spring for bottom sheets & modal dialogs */
export const CHENGUM_SHEET = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 28,
  mass: 0.9,
};

export type PaginationToken = number | 'ellipsis-left' | 'ellipsis-right';

/**
 * Generates condensed pagination numbers so mobile & desktop viewports
 * never suffer horizontal overflow even with dozens of pages.
 */
export function getCondensedPageNumbers(
  currentPage: number,
  totalPages: number
): PaginationToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const tokens: PaginationToken[] = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) {
    tokens.push('ellipsis-left');
  }

  for (let p = windowStart; p <= windowEnd; p++) {
    tokens.push(p);
  }

  if (windowEnd < totalPages - 1) {
    tokens.push('ellipsis-right');
  }

  tokens.push(totalPages);
  return tokens;
}
