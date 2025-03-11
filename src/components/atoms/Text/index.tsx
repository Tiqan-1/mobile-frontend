import React from 'react';
import type { TextProps} from 'react-native';
import { Text as RNTXT } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { isRTL } from '@/utils/helpers';

export type TextTypes = 'extraSmallText' | 'smallText' | 'smallTitle' | 'superSmallText' | 'text' | 'title' | undefined;

interface Txt extends TextProps {
  dotted: boolean | undefined;
  type: TextTypes  | undefined;
}
export type Ref = React.LegacyRef<any> | undefined;

const TextBlock = React.forwardRef<Ref, Txt>(
  ({ children, type = FONT_SIZES.SMALL_TITLE, dotted = false, style, onPress, numberOfLines, ...rest }, ref) => {
    const { locale, showToast } = useTheme();
    const textContent = () => {
      if (Array.isArray(children)) {
        //map over children and check if react element
        children = children.map((child, index) => {
          return React.isValidElement(child) ? child : child?.toString();
        });
        return children;
      } else if (typeof children === 'object') {
        try {
          if (React.isValidElement(children)) {
            return children;
          }
          if (children?.[locale]) {
            return children?.[locale];
          }
          return JSON.stringify(children)?.toString();
        } catch (error) {
          console.log('error', error, children);
          return children;
        }
      }


      return isRTL ? '\u2067' : '' + children?.toString() + isRTL ? '\u2069' : '';
    };

    const styleArray = Array.isArray(style) ? style : [style];
    const override = styleArray.reduce((result, style) => {
      return { ...result, ...style };
    }, {});

    return (
      <RNTXT
        ellipsizeMode={dotted ? 'tail' : undefined}
        numberOfLines={numberOfLines ? numberOfLines : dotted ? 1 : undefined}
        onPress={onPress}
        ref={ref}
        {...rest}
        style={style}>
        {textContent()}
      </RNTXT>
    );
  },
);
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
