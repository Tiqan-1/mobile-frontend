import { useTheme } from '@/theme';
import { View } from 'react-native';
import { forwardRef, memo } from 'react';
import type { Ref } from 'react';

import { Text } from '@/components/atoms/Text';

import { getStyles } from './style';

interface RadioButtonProps {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
}

const RadioButton = forwardRef<View, RadioButtonProps>((props, ref: Ref<View>) => {
  const { disabled = false, label, onPress, selected } = props;
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View ref={ref} style={styles.container}>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.inner} />}
      </View>
      <Text style={[styles.label, disabled && styles.disabledText]} onPress={onPress}>
        {label}
      </Text>
    </View>
  );
});
RadioButton.displayName = 'RadioButton';

export default memo(RadioButton);
export type { RadioButtonProps };
