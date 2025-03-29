import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AccessibilityState {
  fontScale: number;
  isBoldTextEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isScreenReaderEnabled: boolean;
}

const initialState: AccessibilityState = {
  fontScale: 1,
  isBoldTextEnabled: false,
  isInvertColorsEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isScreenReaderEnabled: false,
};

const accessibilitySlice = createSlice({
  name: 'accessibility',
  initialState,
  reducers: {
    setBoldTextEnabled: (state, action: PayloadAction<boolean>) => {
      state.isBoldTextEnabled = action.payload;
    },
    setFontScale: (state, action: PayloadAction<number>) => {
      state.fontScale = action.payload;
    },
    setInvertColorsEnabled: (state, action: PayloadAction<boolean>) => {
      state.isInvertColorsEnabled = action.payload;
    },
    setReduceMotionEnabled: (state, action: PayloadAction<boolean>) => {
      state.isReduceMotionEnabled = action.payload;
    },
    setReduceTransparencyEnabled: (state, action: PayloadAction<boolean>) => {
      state.isReduceTransparencyEnabled = action.payload;
    },
    setScreenReaderEnabled: (state, action: PayloadAction<boolean>) => {
      state.isScreenReaderEnabled = action.payload;
    },
  },
});

export const {
  setBoldTextEnabled,
  setFontScale,
  setInvertColorsEnabled,
  setReduceMotionEnabled,
  setReduceTransparencyEnabled,
  setScreenReaderEnabled,
} = accessibilitySlice.actions;

export default accessibilitySlice.reducer; 