import {StyleSheet} from 'react-native';
import {colorForBG, sizeAdaptivity} from 'utils/helpers';
import {isRTL, PALETTE} from 'utils/constants';
import {defaultSystemFonts} from 'react-native-render-html';

export const getFonts = isRtl =>
  StyleSheet.create({
    regular: {
      fontFamily: !isRtl ? 'SFProText-Regular' : 'DINNextLTArabic-Regular', //400
    },
    medium: {
      fontFamily: !isRtl ? 'SFProText-Medium' : 'DINNextLTArabic-Medium', //500
    },
    semibold: {
      fontFamily: !isRtl ? 'SFProText-SemiBold' : 'DINNextLTArabic-Bold', //600
    },
    bold: {
      fontFamily: !isRtl ? 'SFProText-Bold' : 'DINNextLTArabic-Bold', //700
    },
    extrabold: {
      fontFamily: !isRtl ? 'SFProText-Heavy' : 'DINNextLTArabic-Heavy', //800
    },
  });

export const fonts = getFonts(isRTL);

const St = StyleSheet.create({
  title: {
    ...fonts.bold,
    fontSize: sizeAdaptivity(28),
    color: '#000',
    overflow: 'visible',
    paddingBottom: isRTL ? 2 : undefined,
    textAlignVertical: 'center',
  },
  smallTitle: {
    ...fonts.semibold,
    fontSize: sizeAdaptivity(16),
    color: '#000',
    overflow: 'visible',
    paddingBottom: isRTL ? 2 : undefined,
    textAlignVertical: 'center',
  },
  text: {
    ...fonts.medium,
    fontSize: sizeAdaptivity(14),
    color: '#000',
    overflow: 'visible',
    paddingBottom: isRTL ? 2 : undefined,
    textAlignVertical: 'center',
  },
  largeText: {
    ...fonts.medium,
    fontSize: sizeAdaptivity(15),
    color: '#000',
    overflow: 'visible',
    textAlignVertical: 'center',
  },
  smallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(13),
    color: '#000',
    overflow: 'visible',
    paddingBottom: isRTL ? 2 : undefined,
    textAlignVertical: 'center',
  },
  extraSmallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(12),
    color: '#000',
    overflow: 'visible',
    paddingBottom: isRTL ? 2 : undefined,
    textAlignVertical: 'center',
  },
  superSmallText: {
    ...fonts.regular,
    fontSize: sizeAdaptivity(10),
    color: '#000',
    overflow: 'visible',
    paddingBottom: isRTL ? 2 : undefined,
    textAlignVertical: 'center',
  },
});

export const systemFonts = [
  ...defaultSystemFonts,
  'SFProText-Regular',
  'DINNextLTArabic-Regular',
  'SFProText-Medium',
  'DINNextLTArabic-Medium',
  'SFProText-SemiBold',
  'DINNextLTArabic-Bold',
  'SFProText-Bold',
  'DINNextLTArabic-Bold',
  'SFProText-Heavy',
  'DINNextLTArabic-Heavy',
];

export const tagsStylesHTML = {
  p: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
  },
  a: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
  },
  li: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
  },
  strong: {
    fontFamily: !isRTL ? 'SFProText-Heavy' : 'DINNextLTArabic-Heavy',
    ...St.smallText,
  },
  div: {
    textAlign: 'left',
  },
};

export const tagsStylesHTMLWhite = {
  p: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
    color: PALETTE.WHITE,
  },
  a: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
    color: PALETTE.WHITE,
  },
  li: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
    color: PALETTE.WHITE,
  },
  strong: {
    fontFamily: !isRTL ? 'SFProText-Heavy' : 'DINNextLTArabic-Heavy',
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
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
    ...fonts.bold,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  a: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  li: {
    fontFamily: !isRTL ? 'SFProText-Regular' : 'DINNextLTArabic-Regular',
    textAlign: 'left',
    ...St.smallText,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  strong: {
    fontFamily: !isRTL ? 'SFProText-Heavy' : 'DINNextLTArabic-Heavy',
    ...St.smallText,
    lineHeight: isRTL ? sizeAdaptivity(24) : sizeAdaptivity(22),
  },
  div: {
    textAlign: 'left',
  },
};

export default St;
