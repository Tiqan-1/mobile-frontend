import FireIcon from '@/theme/assets/icons/fire.svg';
import { useErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from '@/components/atoms/Text';

type Props = {
  onReset?: () => void;
};

function DefaultErrorScreen({ onReset = undefined }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { resetBoundary } = useErrorBoundary();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        padding: 16,
      }}>
      <FireIcon
        height={42}
        width={42}
        stroke={colors.red500}
      />
      <Text >
        {t('error_boundary.title')}
      </Text>
      <Text >
        {t('error_boundary.description')}
      </Text>

      {onReset && (
        <TouchableOpacity
          onPress={() => {
            resetBoundary();
            onReset?.();
          }}>
          <Text>
            {t('error_boundary.cta')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default DefaultErrorScreen;
