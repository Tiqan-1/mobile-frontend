import type { ColorTokens } from './colors';

/**
 * Theme-aware shadows. Elevation values are kept constant; the color adapts
 * to the active palette so cards remain visible in both light and dark modes.
 *
 * Moved from `src/theme/styles.ts` (SHADOW / SHADOWINPUT).
 */
export const getShadows = (colors: ColorTokens) => ({
  sm: {
    shadowColor: colors.GREY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    boxShadow: '0px 5px 20px 0px #00000014',
  },
  md: {
    shadowColor: colors.GREY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  input: {
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
});

export type ShadowToken = keyof ReturnType<typeof getShadows>;
