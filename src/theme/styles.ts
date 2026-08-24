/**
 * @deprecated Import from `@/theme/tokens/shadows` instead.
 *
 * Kept as re-exports for legacy consumers. `SHADOW` maps to `shadows.sm`;
 * `SHADOWINPUT` maps to `shadows.input`. Both are evaluated against the
 * light palette to preserve current appearance.
 */
import { PALETTELIGHT } from './tokens/colors';
import { getShadows } from './tokens/shadows';

const legacy = getShadows(PALETTELIGHT);

export const SHADOW = legacy.sm;
export const SHADOWINPUT = legacy.input;
