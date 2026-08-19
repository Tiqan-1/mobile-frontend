import React from 'react';
import { type StyleProp, type ImageStyle } from 'react-native';
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

/**
 * An accessible image component that provides proper accessibility attributes
 */
const AccessibleImage: React.FC<AccessibleImageProps> = ({
  accessibilityDescription,
  accessibilityHint,
  isDecorative = false,
  style,
  ...rest
}) => {
  return (
    <Image
      {...rest}
      style={style}
      accessible={!isDecorative}
      accessibilityLabel={isDecorative ? undefined : accessibilityDescription}
      accessibilityHint={isDecorative ? undefined : accessibilityHint}
      accessibilityRole="image"
    />
  );
};

export default AccessibleImage;
