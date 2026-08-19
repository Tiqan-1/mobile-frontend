import { StyleSheet } from 'react-native';
import type { ColorTokens } from './colors';

/**
 * Font family map. Cairo-Medium does not ship with the app — weights.medium
 * falls back to Cairo-Regular (matches current behaviour).
 *
 * Files: Cairo-Regular, Cairo-SemiBold, Cairo-Bold, Cairo-Black.
 */
export const fonts = {
  regular: { fontFamily: 'Cairo-Regular' },
  medium: { fontFamily: 'Cairo-Regular' },
  semibold: { fontFamily: 'Cairo-SemiBold' },
  bold: { fontFamily: 'Cairo-Bold' },
  extrabold: { fontFamily: 'Cairo-Black' },
} as const;

/** Bold style — kept as a standalone export for legacy consumers. */
export const bold = fonts.bold;

/**
 * Typography style factory. Pass the active color tokens to get a StyleSheet
 * with all semantic text styles. Color is driven by the theme rather than
 * baked in at module load time.
 */
export const getTypographyStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    title: {
      ...fonts.bold,
      fontSize: 28,
      color: colors.BLACK,
      overflow: 'visible',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
    smallTitle: {
      ...fonts.semibold,
      fontSize: 18,
      color: colors.BLACK,
      overflow: 'visible',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
    largeText: {
      ...fonts.medium,
      fontSize: 17,
      color: colors.BLACK,
      overflow: 'visible',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
    text: {
      ...fonts.medium,
      fontSize: 15,
      color: colors.BLACK,
      overflow: 'visible',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
    smallText: {
      ...fonts.regular,
      fontSize: 14,
      color: colors.BLACK,
      overflow: 'visible',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
    extraSmallText: {
      ...fonts.regular,
      fontSize: 12,
      color: colors.BLACK,
      overflow: 'visible',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
    superSmallText: {
      ...fonts.regular,
      fontSize: 10,
      color: colors.BLACK,
      overflow: 'visible',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
  });

/**
 * HTML tag styles for react-native-render-html.
 * Made into a factory so colors follow the theme.
 */
export const getTagsStylesHTML = (colors: ColorTokens) => ({
  p: { ...getTypographyStyles(colors).smallText },
  a: { ...getTypographyStyles(colors).smallText },
  li: { ...getTypographyStyles(colors).smallText },
  strong: { ...getTypographyStyles(colors).smallText },
  div: { textAlign: 'left' },
});

export const getTagsStylesHTMLBrand = (colors: ColorTokens, isRTL: boolean) => ({
  p: {
    ...getTypographyStyles(colors).smallText,
    ...fonts.bold,
    lineHeight: isRTL ? 24 : 22,
  },
  a: {
    ...getTypographyStyles(colors).smallText,
    lineHeight: isRTL ? 24 : 22,
  },
  li: {
    ...getTypographyStyles(colors).smallText,
    lineHeight: isRTL ? 24 : 22,
  },
  strong: {
    ...getTypographyStyles(colors).smallText,
    ...fonts.bold,
    lineHeight: isRTL ? 24 : 22,
  },
  div: { textAlign: 'left' },
});

export const getTagsStylesHTMLWhite = (colors: ColorTokens) => ({
  p: { ...getTypographyStyles(colors).smallText, color: colors.WHITE },
  a: { ...getTypographyStyles(colors).smallText, color: colors.WHITE },
  li: { ...getTypographyStyles(colors).smallText, color: colors.WHITE },
  strong: { ...getTypographyStyles(colors).smallText, color: colors.WHITE },
  div: { textAlign: 'left', color: colors.WHITE },
});
