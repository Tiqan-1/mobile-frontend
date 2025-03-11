import React, { forwardRef, useState } from 'react';
import type { TextInputProps} from 'react-native';
import { Image, Platform, StyleSheet, TextInput as TextInputReact, View } from 'react-native';

export interface TI extends TextInputProps {

}
// export type Ref = React.RefObject;
const TextInput = forwardRef<any, TI>((props, ref) => {

  const {
    value = '',
    ...rest
  } = props;

  const [inputWidth, setInputWidth] = useState('99%');
  const [Height, setHeight] = useState(0);

  React.useMemo(() => {
    setInputWidth('100%');
  }, []);

  const checkNestedArray = el => {
    if (Array.isArray(el) && el.length > 0) {
      const flatted = el.flat(1);
      return flatted.some((error, index) => {
        return typeof error === 'string' && !!el;
      });
    } else {
      return typeof el === 'string' && !!el;
    }
  };
  const haveError = checkNestedArray(errors);

  const _renderErrorFlat = () => {
    const errrorFlat =
      Array.isArray(errors) && errors.length > 0
        ? errors
          .flat(1)
          .filter(el => !!el)
          .join(' ')
        : errors;

    if (typeof errrorFlat === 'string' && !!errrorFlat) {
      return (
        <View
          onLayout={event => {
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


  return (
    <>
      <View style={{ width }}>
            <View
              style={[
                styles.phoneContainer,
              ]}>
              <TextInputReact
                ref={ref}
                value={value ? value : undefined}
                {...rest}

              />
            </View>
            {_renderErrorFlat()}
      </View>
      <View style={Height > 20 ? { height: Height - 20 + 4 } : {}} />
    </>
  );
});

const styles = StyleSheet.create({
  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: sizeY(60),
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
export default TextInput;
