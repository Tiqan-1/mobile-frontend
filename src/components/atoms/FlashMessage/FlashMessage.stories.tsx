import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import RNFlashMessage from 'react-native-flash-message';

import { Button } from '@/components/atoms';

import showFlashMessage, { handleErrorMessage, handleSuccessMessage, handleWarningMessage } from './index';

// showFlashMessage/handleXMessage are imperative (they call the
// react-native-flash-message singleton) rather than a renderable component,
// so the story mounts the real on-screen renderer and a few triggers for it.
function FlashMessageDemo() {
  return (
    <View style={{ gap: 12 }}>
      <Button title="نجاح" onPress={() => handleSuccessMessage('تم حفظ التقدم بنجاح')} />
      <Button title="تحذير" onPress={() => handleWarningMessage('لم يتبق سوى يوم واحد على انتهاء الاشتراك')} />
      <Button title="خطأ" onPress={() => handleErrorMessage('تعذر تحميل الدرس، يرجى المحاولة مرة أخرى')} />
      <Button
        title="رسالة مخصصة (نص عربي طويل)"
        onPress={() =>
          showFlashMessage({
            message: 'تعذر إتمام العملية',
            description: 'حدث خطأ غير متوقع أثناء رفع الملف. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
            type: 'danger',
          })
        }
      />
      <RNFlashMessage position="top" />
    </View>
  );
}

const meta = {
  title: 'Atoms/FlashMessage',
  component: FlashMessageDemo,
} satisfies Meta<typeof FlashMessageDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Triggers: Story = {};
