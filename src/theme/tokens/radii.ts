/**
 * Radius scale derived from actual usage across the codebase.
 * Values observed: 2, 4, 5, 6, 7, 8, 10, 12, 15, 16, 20, 28, 100.
 */
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export type RadiiToken = keyof typeof radii;
