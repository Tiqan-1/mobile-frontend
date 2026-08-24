import { Dimensions, PixelRatio } from 'react-native';

/**
 * Layout scaling: linear from iPhone 11 (375×812) = 1.0 to iPhone 15 Pro Max
 * (430×932) = 1.085, clamped to [0.9, 1.3], then rounded to the nearest pixel.
 */
const LAYOUT_BASE_WIDTH = 375;
const LAYOUT_BASE_HEIGHT = 812;
const LAYOUT_MAX_WIDTH = 430;
const LAYOUT_MAX_HEIGHT = 932;
const LAYOUT_SCALE_AT_MAX = 1.085;
const MIN_LAYOUT_SCALE = 0.9;
const MAX_LAYOUT_SCALE = 1.3;

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function linearLayoutScale(
  dimension: number,
  baseDimension: number,
  maxDimension: number,
  scaleAtMax: number,
): number {
  const range = maxDimension - baseDimension;
  if (range <= 0) {
    return 1;
  }
  const rawScale = 1 + ((scaleAtMax - 1) / range) * (dimension - baseDimension);
  return clampNumber(rawScale, MIN_LAYOUT_SCALE, MAX_LAYOUT_SCALE);
}

function getLayoutScaleWidth(): number {
  const { width } = Dimensions.get('window');
  return linearLayoutScale(width, LAYOUT_BASE_WIDTH, LAYOUT_MAX_WIDTH, LAYOUT_SCALE_AT_MAX);
}

function getLayoutScaleHeight(): number {
  const { height } = Dimensions.get('window');
  return linearLayoutScale(height, LAYOUT_BASE_HEIGHT, LAYOUT_MAX_HEIGHT, LAYOUT_SCALE_AT_MAX);
}

export const sizeX = (width: number) => PixelRatio.roundToNearestPixel(getLayoutScaleWidth() * width);

export const sizeY = (height: number) => PixelRatio.roundToNearestPixel(getLayoutScaleHeight() * height);

/**
 * Typography scaling. Baseline iPhone 13 (390×844), takes min(widthScale, heightScale),
 * damped by 0.7, clamped to [0.9, 1.3], then rounds to the nearest pixel.
 */
const ADAPTIVITY_BASE_WIDTH = 390;
const ADAPTIVITY_BASE_HEIGHT = 844;
const ADAPTIVITY_MIN_SCALE = 0.9;
const ADAPTIVITY_MAX_SCALE = 1.3;
const ADAPTIVITY_SCALE_FACTOR = 0.7;

export function sizeAdaptivity(size: number) {
  const { width, height } = Dimensions.get('window');
  const widthScale = width / ADAPTIVITY_BASE_WIDTH;
  const heightScale = height / ADAPTIVITY_BASE_HEIGHT;
  const baseScale = Math.min(widthScale, heightScale);

  const effectiveScale = clampNumber(
    1 + (baseScale - 1) * ADAPTIVITY_SCALE_FACTOR,
    ADAPTIVITY_MIN_SCALE,
    ADAPTIVITY_MAX_SCALE,
  );
  return Math.round(PixelRatio.roundToNearestPixel(effectiveScale * size));
}

/**
 * Luminance test: returns true when `color` is perceptually light enough to
 * place dark text on top of it.
 */
export const isLight = (color: string, threshold = 155): boolean => {
  const hexRegex = /^#([\dA-Fa-f]{6})$/;
  if (hexRegex.test(color)) {
    const hex = color.slice(1);
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > threshold;
  }
  return false;
};
