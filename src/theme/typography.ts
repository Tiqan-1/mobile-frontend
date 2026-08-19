import { isRTL } from '@/utils/constants';
import { StyleSheet } from 'react-native';
import { PALETTE } from './colors';

export const getFonts = () =>
  StyleSheet.create({
    regular: {
      fontFamily: 'Cairo-Regular',
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
    color: PALETTE.BLACK,
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign: 'left',
  },
  smallTitle: {
    ...fonts.semibold,
    fontSize: sizeAdaptivity(18),
    color: PALETTE.BLACK,
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign: 'left',
  },
  largeText: {
    ...fonts.medium,
    fontSize: sizeAdaptivity(17),
    color: PALETTE.BLACK,
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign: 'left',
  },
  text: {
    ...fonts.medium,
    fontSize: sizeAdaptivity(15),
    color: PALETTE.BLACK,
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign: 'left',
  },
  smallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(14),
    color: PALETTE.BLACK,
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign: 'left',
  },
  extraSmallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(12),
    color: PALETTE.BLACK,
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign: 'left',
  },
  superSmallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(10),
    color: PALETTE.BLACK,
    overflow: 'visible',
    textAlignVertical: 'center',
    textAlign: 'left',
  },
});
export const bold = {...fonts.bold};

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
