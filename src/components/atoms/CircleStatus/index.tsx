import { useTheme } from '@/theme';
import moment from 'moment';
import { useMemo } from 'react';
import { View } from 'react-native';
import { forwardRef, memo } from 'react';
import type { Ref } from 'react';

import { getStyles } from './style';

export type CircleStatusProps = {
  Dtstatus: Date;
};

const CircleStatus = forwardRef<View, CircleStatusProps>((props, ref: Ref<View>) => {
  const { Dtstatus } = props;
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const dateStatus = moment(new Date(Dtstatus)).diff(moment().startOf('day'), 'days');
  const status: 'Passed' | 'Next' | 'Now' = dateStatus < 0 ? 'Passed' : dateStatus === 0 ? 'Now' : 'Next';

  const color =
    status === 'Passed'
      ? theme.colors.ERROR
      : status === 'Next'
      ? theme.colors.WARNING
      : theme.colors.BUTTON_MAIN_COLOR;

  return (
    <View ref={ref} style={[styles.container, { borderColor: color }]}>
      <View style={[styles.inner, { backgroundColor: color }]} />
    </View>
  );
});
CircleStatus.displayName = 'CircleStatus';

export default memo(CircleStatus);
