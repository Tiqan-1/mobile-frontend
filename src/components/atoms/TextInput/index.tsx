import Clear from '@/assets/svg/input-clear.svg';
import Text, { ExSmallText } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { DEVICE_WIDTH, isRTL } from '@/utils/constants';
import { sizeY } from '@/utils/helpers';
import _debounce from 'lodash/debounce';
import React, { forwardRef, memo, useMemo, useState } from 'react';
import type { TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { Platform, Pressable, View } from 'react-native';
import { TextInput as TextInputReact } from 'react-native';

import { getStyles } from './style';

const isIOS = Platform.OS === 'ios';

// Define a type for the icon components
type IconComponentProps = {
  style?: unknown;
};

// Define types for the component props
export interface TI extends TextInputProps {
  closeIconStyle?: TextStyle;
  containerStyle?: ViewStyle;
  debounce?: number;
  enablePlaceHolder?: boolean;
  errors?: string | string[] | undefined;
  Icon?: React.ComponentType;
  IconLeft?: React.ComponentType<IconComponentProps>;
  IconLeftStyle?: ViewStyle;
  IconStyle?: ViewStyle;
  onPressIcon?: () => void;
  placeholderUpper?: string;
  shadow?: boolean;
  style?: TextStyle;
  testID?: string;
  validation?: (val: string) => boolean | string | undefined;
  value?: string;
  withClearIcon?: boolean;
}

const TextInput = forwardRef<TextInputReact, TI>((props, ref) => {
  const {
    value = '',
    closeIconStyle = {},
    validation,
    textContentType = 'none',
    placeholder = '',
    placeholderUpper = '',
    placeholderTextColor = undefined,
    autoCapitalize = 'none',
    autoFocus = false,
    editable = true,
    multiline = false,
    numberOfLines = 1,
    debounce = 0,
    style = {},
    containerStyle = {},
    onChangeText = () => {},
    onBlur = () => {},
    onSubmitEditing = () => {},
    secureTextEntry,
    keyboardType,
    returnKeyType,
    testID,
    errors,
    shadow,
    onPressIcon = () => {},
    Icon,
    IconStyle = {},
    IconLeft,
    IconLeftStyle = {},
    autoCorrect = false,
    enablePlaceHolder = false,
    withClearIcon = true,
    ...rest
  } = props;

  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [Height] = useState(0);


  const _renderError = () => {
    if (Array.isArray(errors)) {
      return (
        <View style={styles.error}>
          {errors.map((error, index) => (
            <ExSmallText key={index} style={styles.errorText}>
              {error}
            </ExSmallText>
          ))}
        </View>
      );
    } else if (errors) {
      return (
        <View style={styles.error}>
          <ExSmallText style={styles.errorText}>{errors}</ExSmallText>
        </View>
      );
    }
    return null;
  };

  // Calculate width properly with type safety
  const containerWidth = typeof containerStyle.width === 'number' ? containerStyle.width : DEVICE_WIDTH - 40;
  const width = containerWidth + 3;

  return (
    <>
      <View style={{ width }}>
        <>
          <View
            style={[
              styles.phoneContainer,
              multiline
                ? {
                    height: sizeY(numberOfLines < 2 ? numberOfLines * 60 : numberOfLines * 50),
                  }
                : {},
              shadow ? theme.shadows.input : {},
              containerStyle,
            ]}>
            {!!value && enablePlaceHolder ? (
              <View style={styles.placeholder}>
                <Text style={{ color: '#C5C5C5' }} type="extraSmallText">
                  {placeholderUpper ? placeholderUpper : placeholder}
                </Text>
              </View>
            ) : null}
            {IconLeft && (
              <View style={styles.iconContainer}>
                {/* @ts-ignore - Ignoring style type issues */}
                <IconLeft style={styles.icon} />
              </View>
            )}
            <TextInputReact
              ref={ref}
              returnKeyType={returnKeyType ? returnKeyType : undefined}
              secureTextEntry={secureTextEntry}
              testID={testID}
              textContentType={textContentType}
              value={value ? value : undefined}
              {...rest}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              autoFocus={autoFocus}
              // clearButtonMode="while-editing"
              dataDetectorTypes={['phoneNumber', 'address']}
              editable={editable}
              keyboardType={keyboardType}
              multiline={secureTextEntry ? false : multiline}
              numberOfLines={numberOfLines}
              onBlur={onBlur}
              onChangeText={debounce > 0 ? _debounce(onChangeText, debounce) : onChangeText}
              onSubmitEditing={onSubmitEditing}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor ? placeholderTextColor : theme.colors.GREY}
              spellCheck={autoCorrect}
              style={[
                // Use a type-safe approach for typography
                theme.typography.text,
                style,
                styles.textInput,
                !!value && enablePlaceHolder ? { paddingTop: isIOS ? 15 : 15 } : {},
              ]}
              textAlign={isRTL ? 'right' : 'left'}
            />
            {!!value && withClearIcon ? (
              <Pressable
                onPress={() => {
                  onChangeText('');
                }}
                style={styles.iconButton}>
                <Clear style={[styles.iconClose, closeIconStyle]} />
              </Pressable>
            ) : null}
            {Icon && (
              <Pressable onPress={onPressIcon} style={styles.iconButton}>
                {/* @ts-ignore - Ignoring style type issues */}
                <Icon style={styles.icon} />
              </Pressable>
            )}
          </View>
          {_renderError()}
        </>
      </View>
      <View style={Height > 20 ? { height: Height - 20 + 4 } : {}} />
    </>
  );
});

TextInput.displayName = 'TextInput';

export default memo(TextInput);
