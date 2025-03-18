import { useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  setBoldTextEnabled,
  setFontScale,
  setInvertColorsEnabled,
  setReduceMotionEnabled,
  setReduceTransparencyEnabled,
  setScreenReaderEnabled,
} from '@/store/slices/accessibilitySlice';

const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const useAccessibility = () => {
  const dispatch = useDispatch();
  const {
    fontScale,
    isBoldTextEnabled,
    isInvertColorsEnabled,
    isReduceMotionEnabled,
    isReduceTransparencyEnabled,
    isScreenReaderEnabled,
  } = useSelector((state: RootState) => state.accessibility);

  useEffect(() => {
    // Check initial values
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      dispatch(setScreenReaderEnabled(enabled));
    });
    
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isBoldTextEnabled().then((enabled) => {
        dispatch(setBoldTextEnabled(enabled));
      });
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        dispatch(setReduceMotionEnabled(enabled));
      });
      AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
        dispatch(setReduceTransparencyEnabled(enabled));
      });
      AccessibilityInfo.isInvertColorsEnabled?.().then((enabled) => {
        dispatch(setInvertColorsEnabled(enabled));
      });
    }

    // Set up listeners for changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => dispatch(setScreenReaderEnabled(enabled))
    );
    
    let boldTextListener: { remove: () => void } | undefined;
    let reduceMotionListener: { remove: () => void } | undefined;
    let reduceTransparencyListener: { remove: () => void } | undefined;
    let invertColorsListener: { remove: () => void } | undefined;

    if (Platform.OS === 'ios') {
      boldTextListener = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        (enabled) => dispatch(setBoldTextEnabled(enabled))
      );
      
      reduceMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (enabled) => dispatch(setReduceMotionEnabled(enabled))
      );
      
      reduceTransparencyListener = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        (enabled) => dispatch(setReduceTransparencyEnabled(enabled))
      );
      
      if (AccessibilityInfo.addEventListener) {
        invertColorsListener = AccessibilityInfo.addEventListener(
          'invertColorsChanged',
          (enabled) => dispatch(setInvertColorsEnabled(enabled))
        );
      }
    }

    // Clean up listeners
    return () => {
      screenReaderListener.remove();
      if (boldTextListener) {
        boldTextListener.remove();
      }
      if (reduceMotionListener) {
        reduceMotionListener.remove();
      }
      if (reduceTransparencyListener) {
        reduceTransparencyListener.remove();
      }
      if (invertColorsListener) {
        invertColorsListener.remove();
      }
    };
  }, [dispatch]);

  return {
    fontScale,
    isBoldTextEnabled,
    isInvertColorsEnabled,
    isReduceMotionEnabled,
    isReduceTransparencyEnabled,
    isScreenReaderEnabled,
    announceForAccessibility,
  };
}; 