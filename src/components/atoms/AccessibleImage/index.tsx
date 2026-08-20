import { type StyleProp, type ImageStyle } from 'react-native';
import { forwardRef, memo } from 'react';
import { Image, type ImageProps as ExpoImageProps } from 'expo-image';

interface AccessibleImageProps extends Omit<ExpoImageProps, 'tintColor'> {
  /**
   * Description of the image for screen readers
   */
  accessibilityDescription: string;
  /**
   * Additional context about the image for screen readers
   */
  accessibilityHint?: string;
  /**
   * Whether the image is decorative (not important for understanding the content)
   */
  isDecorative?: boolean;
  style?: StyleProp<ImageStyle>;
}

const AccessibleImage = forwardRef<Image, AccessibleImageProps>(
  ({ accessibilityDescription, accessibilityHint, isDecorative = false, style, ...rest }, ref) => {
    return (
      <Image
        ref={ref}
        {...rest}
        style={style}
        accessible={!isDecorative}
        accessibilityLabel={isDecorative ? undefined : accessibilityDescription}
        accessibilityHint={isDecorative ? undefined : accessibilityHint}
        accessibilityRole="image"
        accessibilityIgnoresInvertColors
      />
    );
  },
);

AccessibleImage.displayName = 'AccessibleImage';

export default memo(AccessibleImage);
