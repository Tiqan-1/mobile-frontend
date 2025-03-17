import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch as RNSwitch } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { PALETTE } from '@/utils/constants';

interface SwitchProps {
  disabled?: boolean;
  label?: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

const Switch: React.FC<SwitchProps> = ({ disabled = false, label, onValueChange, value }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNSwitch
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor={colors.APP_BG}
        trackColor={{ false: colors.gray200, true: colors.BUTTON_MAIN_COLOR }}
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    marginRight: 8,
  },
});

export default Switch; 