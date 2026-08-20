import type { DimensionValue, ViewProps } from 'react-native';
import { forwardRef, memo } from 'react';
import type { Ref } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';
import type { Theme } from '@/theme';

import { getStyles } from './style';

export type SkeletonProps = {
  height?: DimensionValue;
  loading?: boolean;
  width?: DimensionValue;
} & ViewProps;

const FROM = 0.2;
const TO = 1;

const SkeletonLoader = forwardRef<View, SkeletonProps>((props, ref: Ref<View>) => {
  const { children, height = 24, loading = false, width = '100%', ...rest } = props;
  const { colors, radii } = useTheme();
  const styles = getStyles({ colors, radii } as Theme);

  const opacity = useSharedValue(FROM);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!loading) {
      return;
    }
    opacity.value = withRepeat(withTiming(TO, { duration: 800 }), -1, true);
  }, [loading, opacity]);

  return (
    <View
      ref={ref}
      {...rest}
      style={[styles.container, rest.style]}
    >
      {loading ? (
        <Animated.View
          style={[
            animatedStyles,
            styles.skeleton,
            { height, width },
          ]}
          testID="skeleton-loader"
        />
      ) : (
        children
      )}
    </View>
  );
});
SkeletonLoader.displayName = 'Skeleton';

export default memo(SkeletonLoader);
