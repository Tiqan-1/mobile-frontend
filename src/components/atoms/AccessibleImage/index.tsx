import React from 'react';
import { ImageProps, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

interface AccessibleImageProps extends ImageProps {
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
    <FastImage
      {...rest}
      style={style}
      accessible={!isDecorative}
      accessibilityLabel={isDecorative ? undefined : accessibilityDescription}
      accessibilityHint={isDecorative ? undefined : accessibilityHint}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors={true}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'contain',
  },
});

export default AccessibleImage;
