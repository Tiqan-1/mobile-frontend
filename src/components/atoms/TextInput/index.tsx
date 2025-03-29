import type { TextInputProps, TextStyle, ViewStyle } from 'react-native';

import _debounce from 'lodash/debounce';
import React, { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput as TextInputReact,
  View,
} from 'react-native';

import typography from '@/theme/typography';

import Text, { ExSmallText } from '@/components/atoms/Text';

import Clear from '@/assets/svg/input-clear.svg';
import {
  DEVICE_WIDTH,
  isRTL,
} from '@/utils/constants';
import { sizeY } from '@/utils/helpers';
import { PALETTE } from '@/theme/colors';
import { SHADOWINPUT } from '@/theme/styles';

const isIOS = Platform.OS === 'ios';

// Define a type for the icon components
type IconComponentProps = {
  style?: any; // Using any here to avoid complex style type issues
};

// Define types for the component props
export interface TI extends TextInputProps {
  closeIconStyle?: TextStyle;
  containerStyle?: ViewStyle;
  debounce?: number;
  enablePlaceHolder?: boolean;
  errors?: string | string[]| undefined| undefined[];
  Icon?: React.ComponentType<IconComponentProps>;
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

// Function to check nested arrays outside the component
const checkNestedArray = (el: unknown): boolean => {
  if (Array.isArray(el) && el.length > 0) {
    const flatted = el.flat(1);
    return flatted.some((error) => {
      return typeof error === 'string' && !!error;
    });
  } else {
    return typeof el === 'string' && !!el;
  }
};

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

  const [inputWidth, setInputWidth] = useState('99%');
  const [Height, setHeight] = useState(0);

  React.useMemo(() => {
    setInputWidth('100%');
  }, []);

  const haveError = checkNestedArray(errors);

  const _renderErrorFlat = () => {
    
    const errrorFlat =
      Array.isArray(errors) && errors.length > 0
        ? errors
            .flat(1)
            .filter((el) => !!el)
            .join(' ')
        : errors;

    if (typeof errrorFlat === 'string' && !!errrorFlat) {
      return (
        <View
          onLayout={(event) => {
            setHeight(event.nativeEvent.layout?.height);
          }}
          style={styles.error}>
          <ExSmallText style={styles.errorText}>{errrorFlat}</ExSmallText>
        </View>
      );
    }
    return <View />;
  };
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
  const containerWidth = 
    typeof containerStyle.width === 'number' 
      ? containerStyle.width 
      : DEVICE_WIDTH - 40;
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
                    height: sizeY(
                      numberOfLines < 2
                        ? numberOfLines * 60
                        : numberOfLines * 50
                    ),
                  }
                : {},
              shadow ? { ...SHADOWINPUT } : {},
              containerStyle,
            ]}>
            {!!value && enablePlaceHolder ? (
              <View style={styles.placeholder}>
                <Text
                  style={{ color: '#C5C5C5' }}
                  type="extraSmallText">
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
              onChangeText={
                debounce > 0 ? _debounce(onChangeText, debounce) : onChangeText
              }
              onSubmitEditing={onSubmitEditing}
              placeholder={placeholder}
              placeholderTextColor={
                placeholderTextColor ? placeholderTextColor : PALETTE.GREY
              }
              spellCheck={autoCorrect}
              style={[
                // Use a type-safe approach for typography
                typography['text'] || {},
                style,
                styles.textInput,
                !!value && enablePlaceHolder
                  ? { paddingTop: isIOS ? 15 : 15 }
                  : {},
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

const styles = StyleSheet.create({
  shadow: {
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: {
      width: 1,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  iconClose: {
    marginRight: 5,
    marginTop: 8,
    marginLeft: isRTL ? 5 : undefined,
    height: 40,
  },
  iconCloseRigh: {
    marginRight: isRTL ? undefined : 5,
    marginLeft: isRTL ? 5 : undefined,
    marginTop: 8,
    height: 40,
  },
  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: sizeY(40),
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  phoneInput: {
    flex: 7,
    writingDirection: 'ltr',
    textAlign: 'left',
    marginLeft: 20,
  },
  textInput: { flex: 7, padding: 0 },
  dropDownImage: {
    height: 14,
    width: 12,
    marginLeft: 11,
  },
  placeholder: {
    position: 'absolute',
    top: isRTL ? (isIOS ? 8 : 6) : isIOS ? 10 : 7,
    left: 20,
    color: '#C5C5C5',
  },
  icon: {
    width: 24,
    height: 24,
    color: PALETTE.BUTTON_MAIN_COLOR,
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  error: {
    position: 'absolute',
    top: '105%',
    // left: 10,
    // right: 10,
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 20,
    zIndex: 9999,
  },
  errorText: {
    writingDirection: isRTL ? 'rtl' : 'auto',
    color: PALETTE.ERROR,
    maxWidth: '95%',
  },
  iconButton: {
    // ...SHADOW,
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 100,
    // backgroundColor: PALETTE.WHITE,
    zIndex: 9999,
  },
});
export default TextInput;
