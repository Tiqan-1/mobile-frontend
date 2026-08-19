/**
 * @deprecated Import from `@/theme/tokens/typography` instead.
 *
 * Kept as a thin re-export so existing consumers (`Application.tsx`,
 * `BottomTabNavigation.tsx`, component style files) compile without changes.
 * Migrate to the factory API (`getTypographyStyles(theme)`) when you touch
 * these files in T2b/T2f.
 */
export {
  bold,
  fonts,
  getTagsStylesHTML,
  getTagsStylesHTMLBrand,
  getTagsStylesHTMLWhite,
  getTypographyStyles,
} from './tokens/typography';

// Legacy default export — a frozen StyleSheet created against the light
// palette. Consumers using `typography['text']` etc. get the same object
// they had before; it just won't update on theme toggle.
import { PALETTELIGHT } from './tokens/colors';
import { getTypographyStyles } from './tokens/typography';
export default getTypographyStyles(PALETTELIGHT);
