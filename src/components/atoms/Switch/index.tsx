import { useTheme } from '@/theme';
import { View } from 'react-native';
import { forwardRef, memo } from 'react';
import type { Ref } from 'react';
import { Switch as RNSwitch } from 'react-native';

import { Text } from '@/components/atoms/Text';

import { getStyles } from './style';

interface SwitchProps {
  disabled?: boolean;
  label?: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

const Switch = forwardRef<View, SwitchProps>((props, ref: Ref<View>) => {
  const { disabled = false, label, onValueChange, value } = props;
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View ref={ref} style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNSwitch
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor={theme.colors.APP_BACKGROUND}
        trackColor={{ false: theme.colors.gray200, true: theme.colors.BUTTON_MAIN_COLOR }}
        value={value}
      />
    </View>
  );
});
Switch.displayName = 'Switch';

export default memo(Switch);
export type { SwitchProps };
