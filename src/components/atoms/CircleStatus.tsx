import { useAppDispatch } from '@/hooks/useAppDispatch';
import { initStateAPIState } from '@/services/API';
import { useTheme } from '@/theme';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

function CircleStatus({ Dtstatus }: { Dtstatus: Date }) {
  const { isDark, colors, toggleTheme } = useTheme();
  // const { t, i18n } = useTranslation();
  // const dispatch = useAppDispatch();
  const dateStatus = moment(new Date(Dtstatus)).diff(moment().startOf('day'), 'days');
  const status: 'Passed' | 'Next' | 'Done' | 'Now' = dateStatus < 0 ? 'Passed' : dateStatus === 0 ? 'Now' : 'Next';

  const color =
    status === 'Passed'
      ? colors.ERROR
      : status === 'Next'
      ? colors.WARNING
      : status === 'Done'
      ? colors.SUCCESS
      : status === 'Now'
      ? colors.BUTTON_MAIN_COLOR
      : colors.GREY;
  return (
    <View
      style={{
        margin: 5,
        width: 15,
        height: 15,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderColor: color,
      }}>
      <View style={{ width: 8, height: 8, backgroundColor: color, borderRadius: 12, padding: 4 }} />
    </View>
  );
}
export default CircleStatus;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
