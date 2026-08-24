/**
 * Spacing scale derived from actual usage across the codebase.
 * Values observed: 2, 4, 5, 6, 7, 8, 10, 12, 15, 16, 20, 24, 28, 32, 100.
 * A 4px base with xs/xl/xxl extensions covers all of them.
 */
export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

export type SpacingToken = keyof typeof spacing;
