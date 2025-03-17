import { StyleSheet } from 'react-native';
import { defaultSystemFonts } from 'react-native-render-html';

import { isRTL, PALETTE } from '@/utils/constants';

export const getFonts = () =>
  StyleSheet.create({
    regular: {
      fontFamily: 'Cairo-Light',
    },
    medium: {
      fontFamily: 'Cairo-Regular',
    },
    semibold: {
      fontFamily: 'Cairo-SemiBold',
    },
    bold: {
      fontFamily: 'Cairo-Bold',
    },
    extrabold: {
      fontFamily: 'Cairo-Black',
    },
  });

export const fonts = getFonts();

const sizeAdaptivity = (x: number) => x;

const St = StyleSheet.create({
  title: {
    ...fonts.bold,
    fontSize: sizeAdaptivity(28),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign:'left'
  },
  smallTitle: {
    ...fonts.semibold,
    fontSize: sizeAdaptivity(18),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign:'left'
  },
  text: {
    ...fonts.medium,
    fontSize: sizeAdaptivity(16),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign:'left'
  },
  largeText: {
    ...fonts.medium,
    fontSize: sizeAdaptivity(18),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign:'left'
  },
  smallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(13),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign:'left'
  },
  extraSmallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(12),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign:'left'
  },
  superSmallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(10),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign:'left'
  },
});

export const systemFonts = [
  ...defaultSystemFonts,
  'Cairo-Regular',
  'Cairo-Black',
  'Cairo-SemiBold',
  'Cairo-Bold',
  'Cairo-Heavy',
];

export const tagsStylesHTML = {
  p: {
    ...St.smallText,
  },
  a: {
    ...St.smallText,
  },
  li: {
    ...St.smallText,
  },
  strong: {
    ...St.smallText,
  },
  div: {
    textAlign: 'left',
  },
};

export const tagsStylesHTMLWhite = {
  p: {
    ...St.smallText,
    color: PALETTE.WHITE,
  },
  a: {
    ...St.smallText,
    color: PALETTE.WHITE,
  },
  li: {
    ...St.smallText,
    color: PALETTE.WHITE,
  },
  strong: {
    ...St.smallText,
    color: PALETTE.WHITE,
  },
  div: {
    textAlign: 'left',
    color: PALETTE.WHITE,
  },
};

export const tagsStylesHTMLBrand = {
  p: {
    ...St.smallText,
    ...fonts.bold,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  a: {
    ...St.smallText,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  li: {
    ...St.smallText,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  strong: {
    ...St.smallText,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  div: {
    textAlign: 'left',
  },
};

export default St;
