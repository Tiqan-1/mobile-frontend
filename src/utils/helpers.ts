import { I18nManager, PixelRatio, Platform } from "react-native";
import { DEVICE_HEIGHT, DEVICE_WIDTH, IsIOS, PALETTE } from "./constants";


const IPHONE11_DEVICE_WIDTH = 375;
const IPHONE11_DEVICE_HEIGHT = 812;

const SizeScale = 1.085;
const MAxScale = 1.3;
const IPHONE15_DEVICE_WIDTH = 430;
const IPHONE15_DEVICE_HEIGHT = 932;

const xscale = 1 + ((SizeScale - 1) / (IPHONE15_DEVICE_WIDTH - IPHONE11_DEVICE_WIDTH)) * (DEVICE_WIDTH - IPHONE11_DEVICE_WIDTH);
const scaleWidth = Math.min(MAxScale, xscale);

const yscale = 1 + ((SizeScale - 1) / (IPHONE15_DEVICE_HEIGHT - IPHONE11_DEVICE_HEIGHT)) * (DEVICE_HEIGHT - IPHONE11_DEVICE_HEIGHT);
const scaleHeight = Math.min(MAxScale, yscale);

// console.log("Scale###",scale1,scale);
export function sizeAdaptivity(size: number) {
  const FontSizeScale = 1.1;
  const FontMAxScale = 1.3;
  const fscale = 1 + ((FontSizeScale - 1) / (IPHONE15_DEVICE_WIDTH - IPHONE11_DEVICE_WIDTH)) * (DEVICE_WIDTH - IPHONE11_DEVICE_WIDTH);
  const newSize = Math.min(FontMAxScale, fscale) * size;
  return IsIOS ? Math.round(PixelRatio.roundToNearestPixel(newSize)) : Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}

export const sizeX = (width: number) => PixelRatio.roundToNearestPixel(scaleWidth * width);

export const sizeY = (height: number) => PixelRatio.roundToNearestPixel(scaleHeight * height);


export const Brightness = (color: string): number => {
  const hexRegex = /^#([A-Fa-f0-9]{6})$/;
  if (hexRegex.test(color)) {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness;
  }
  //handle if color is in rgb() format
  const rgbRegex = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/;
  if (rgbRegex.test(color)) {
    const rgb = color.replace('rgb(', '').replace(')', '').split(',');
    const c_r = parseInt(rgb[0]);
    const c_g = parseInt(rgb[1]);
    const c_b = parseInt(rgb[2]);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness;
  }

  //handle if color is 3 digit hex
  const threeHexRegex = /^#([A-Fa-f0-9]{3})$/;
  if (threeHexRegex.test(color)) {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    const c_g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    const c_b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness;
  }
  return 0;
};

/**
 * this function to check the color if it's light or dark
 * @param {*} color for the color to check
 * @param {*} th change the comparing value
 * @returns bool
 */

export const isLight = (color, th = 155) => {
  return Brightness(color) > th;
};

export const bestButtonColor = (bg: string) => {
  const Pr = PALETTE.BUTTON_MAIN_COLOR;
  const Sec = PALETTE.BUTTON_SECONDARY_COLOR;
  if (bg == Pr) {
    return Sec;
  }
  return Pr;
};