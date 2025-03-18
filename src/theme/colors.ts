
const colorsLight = {
  gray100: '#DFDFDF',
  gray200: '#A1A1A1',
  gray400: '#4D4D4D',
  gray50: '#EFEFEF',
  gray800: '#303030',
  gray900: '#111827',
  purple100: '#E1E1EF',
  purple50: '#1B1A23',
  purple500: '#44427D',
  red500: '#C13333',
  skeleton: '#A1A1A1',
} as const;

const colorsDark = {
  gray100: '#000000',
  gray200: '#BABABA',
  gray400: '#969696',
  gray50: '#EFEFEF',
  gray800: '#E0E0E0',
  gray900: '#111827',
  purple100: '#252732',
  purple50: '#1B1A23',
  purple500: '#A6A4F0',
  red500: '#C13333',
  skeleton: '#303030',
} as const;


export const PALETTELIGHT = {
  WHITE: colorsLight.gray50,
  BLACK: colorsLight.gray900,
  GREEN: '#059669',
  BLUE: '#2563EB',
  GREY: '#7C8995',
  RED: '#DC2626',
  YELLOW: '#D97706',
  PURPLE: '#B8AFF9',
  ORANGE: '#F15A29',
  GREY_BORDER: 'rgba(0, 0, 0, 0.5)',
  TRANSPARENT: 'transparent',
  PRIMARY_COLOR: '#F15A29',
  SECONDARY_COLOR: '#1b0c75',
  TERTIARY_COLOR: '#7C8995',
  BG_PRIMARY_COLOR: '#FB565A',
  BG_SECONDARY_COLOR: '#1b0c75',
  BG_TERTIARY_COLOR: '#c6c6c6',
  LINE: '#E5E7EB',
  BUTTON_MAIN_COLOR: '#2563EB',
  BUTTON_SECONDARY_COLOR: '#7C3AED',
  bestBW: '#120703',
  LOGOColor: '#1b0c75',
  BG_WITH_LOGO: '#F2F2F2',
  APP_BACKGROUND: colorsLight.gray50,
  SURFACE: colorsLight.gray100,

  ...colorsLight,
} as const;

export const PALETTEDARK = {
  WHITE: colorsDark.gray800,
  BLACK: colorsDark.gray50,
  GREEN: '#10B981',
  BLUE: '#3B82F6',
  GREY: '#969696',
  RED: '#EF4444',
  YELLOW: '#F59E0B',
  PURPLE: '#B8AFF9',
  ORANGE: '#F15A29',
  GREY_BORDER: 'rgba(0, 0, 0, 0.7)',
  TRANSPARENT: 'transparent',
  PRIMARY_COLOR: '#A6A4F0',
  SECONDARY_COLOR: '#A6A4F0',
  TERTIARY_COLOR: '#969696',
  BG_PRIMARY_COLOR: '#FB565A',
  BG_SECONDARY_COLOR: '#252732',
  BG_TERTIARY_COLOR: '#303030',
  LINE: '#374151',
  BUTTON_MAIN_COLOR: '#3B82F6',
  BUTTON_SECONDARY_COLOR: '#8B5CF6',
  bestBW: '#FFFFFF',
  LOGOColor: '#A6A4F0',
  BG_WITH_LOGO: '#252732',
  APP_BACKGROUND: colorsDark.gray200,
  SURFACE: colorsLight.gray800,
  ...colorsDark,
} as const;


// eslint-disable-next-line no-var
export var PALETTE = {...PALETTELIGHT};

const toDark = () => {
  PALETTE = {...PALETTEDARK};
}

const toLight = () => {
  PALETTE = {...PALETTELIGHT};
}

export const usePALETTE = () => {
  return { PALETTE, toDark, toLight };
};