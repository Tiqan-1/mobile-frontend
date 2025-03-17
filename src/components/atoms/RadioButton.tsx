import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Text';
import { PALETTE } from '@/theme/colors';

interface RadioButtonProps {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({ disabled = false, label, onPress, selected }) => {

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.container, disabled && styles.disabled]}>
      <View style={[styles.radio, selected && styles.selected]}>
        {selected && <View style={[styles.inner, { backgroundColor: PALETTE.BUTTON_MAIN_COLOR }]} />}
      </View>
      <Text style={[styles.label, disabled && styles.disabledText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#A1A1A1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selected: {
    borderColor: PALETTE.BUTTON_MAIN_COLOR,
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
  },
  disabledText: {
    color: '#A1A1A1',
  },
});

export default RadioButton; 