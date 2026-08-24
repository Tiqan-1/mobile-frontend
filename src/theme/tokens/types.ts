/**
 * Token type definitions for the theme system.
 */

export type TokenColor =
  | 'APP_BACKGROUND'
  | 'BEST_BW'
  | 'BESTBW'
  | 'BG_PRIMARY_COLOR'
  | 'BG_SECONDARY_COLOR'
  | 'BG_TERTIARY_COLOR'
  | 'BG_WITH_LOGO'
  | 'BLACK'
  | 'BUTTON_MAIN_COLOR'
  | 'BUTTON_SECONDARY_COLOR'
  | 'DISABLED'
  | 'ERROR'
  | 'GREY_BORDER'
  | 'GREY'
  | 'INFO'
  | 'LINE'
  | 'LOGO_COLOR'
  | 'LOGOCOLOR'
  | 'ORANGE'
  | 'PRIMARY_COLOR'
  | 'PURPLE'
  | 'SUCCESS'
  | 'SURFACE'
  | 'TERTIARY_COLOR'
  | 'TRANSPARENT'
  | 'WARNING'
  | 'WHITE'
  | `gray${number}`
  | `purple${number}`;

export type TokenSpacing = 'lg' | 'md' | 'sm' | 'xl' | 'xs' | 'xxl';

export type TokenRadii = 'full' | 'lg' | 'md' | 'sm' | 'xl' | 'xs';

export type TokenShadow = 'input' | 'md' | 'sm';
