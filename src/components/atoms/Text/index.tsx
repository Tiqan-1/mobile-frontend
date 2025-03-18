import type { StyleProp, TextProps, TextStyle } from 'react-native';
import type { Text as RNText } from 'react-native';

import React from 'react';
import { Text as RNTXT } from 'react-native';
import { useTranslation } from 'react-i18next';

import typography from '@/theme/typography';

import { isRTL } from '@/utils/constants';

export type TextTypes =
  | 'extraSmallText'
  | 'smallText'
  | 'smallTitle'
  | 'superSmallText'
  | 'text'
  | 'title'
  | undefined;

interface Txt extends TextProps {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'adjustable' | 'button' | 'header' | 'image' | 'imagebutton' | 'keyboardkey' | 'link' | 'none' | 'search' | 'summary' | 'text';
  accessibilityState?: {
    busy?: boolean;
    checked?: 'mixed' | boolean;
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
  };
  accessible?: boolean;
  dotted?: boolean;
  style?: StyleProp<TextStyle>;
  type?: TextTypes;
}

const TextBlock = React.forwardRef<RNText, Txt>(
  (
    {
      children,
      type = 'text',
      style,
      onPress,
      numberOfLines,
      dotted = false,
      accessible = true,
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole,
      accessibilityState,
      ...rest
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    
    const textContent = () => {
      if (Array.isArray(children)) {
        children = children.map((child) => {
          return React.isValidElement(child) ? child : child?.toString();
        });
        return children;
      } else if (typeof children === 'object') {
        try {
          if (React.isValidElement(children)) {
            return children;
          }
          if (children && typeof children === 'object' && i18n.language in children) {
            return children[i18n.language as keyof typeof children];
          }
          return JSON.stringify(children)?.toString().trim();
        } catch {
          return children?.toString()?.trim() || '';
        }
      }
      return children?.toString()?.trim() || '';
    };

    const styleArray = Array.isArray(style) ? style : [style];
    const override = styleArray.reduce<TextStyle>((result, currentStyle) => {
      if (currentStyle) {
        return { ...result, ...(currentStyle as TextStyle) };
      }
      return result;
    }, {});

    // Set default accessibility role based on text type if not provided
    const defaultAccessibilityRole = !accessibilityRole && (type === 'title' || type === 'smallTitle') 
      ? 'header' 
      : accessibilityRole;

    return (
      <RNTXT
        ref={ref}
        ellipsizeMode={dotted ? 'tail' : undefined}
        numberOfLines={numberOfLines ? numberOfLines : dotted ? 1 : undefined}
        onPress={onPress}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={defaultAccessibilityRole}
        accessibilityState={accessibilityState}
        {...rest}
        style={[typography[type], override]}>
        {isRTL ? '\u2067' : ''}
        {textContent()}
        {isRTL ? '\u2069' : ''}
      </RNTXT>
    );
  }
);

TextBlock.defaultProps = {
  dotted: false,
  style: undefined,
  type: 'text',
};

export default TextBlock;

export function Title(params: Txt) {
  const { children, ...rest } = params;
  return (
    <TextBlock type="title" {...rest}>
      {children}
    </TextBlock>
  );
}
export function SmallTitle(params: Txt) {
  const { children, ...rest } = params;
  return (
    <TextBlock type="smallTitle" {...rest}>
      {children}
    </TextBlock>
  );
}
export function Text(params: Txt) {
  const { children, ...rest } = params;
  return (
    <TextBlock type="text" {...rest}>
      {children}
    </TextBlock>
  );
}
export function SmallText(params: Txt) {
  const { children, ...rest } = params;
  return (
    <TextBlock type="smallText" {...rest}>
      {children}
    </TextBlock>
  );
}
export function ExSmallText(params: Txt) {
  const { children, ...rest } = params;
  return (
    <TextBlock type="extraSmallText" {...rest}>
      {children}
    </TextBlock>
  );
}

export function SuSmallText(params: Txt) {
  const { children, ...rest } = params;
  return (
    <TextBlock type="superSmallText" {...rest}>
      {children}
    </TextBlock>
  );
}
