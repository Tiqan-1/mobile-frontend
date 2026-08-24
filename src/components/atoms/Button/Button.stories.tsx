import type { Meta, StoryObj } from '@storybook/react-native';

import Button from './index';

const meta = {
  title: 'Atoms/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: { title: 'متابعة', type: 'main' },
};

export const Outline: Story = {
  args: { title: 'إلغاء', type: 'outline' },
};

export const Underline: Story = {
  args: { title: 'هل نسيت كلمة المرور؟', type: 'underline' },
};

export const Icon: Story = {
  args: { title: 'مشاركة', type: 'icon' },
};

export const Disabled: Story = {
  args: { title: 'غير متاح', disabled: true },
};

export const Loading: Story = {
  args: { title: 'جارٍ الإرسال', isLoading: true },
};

export const LongArabicText: Story = {
  args: {
    title: 'التسجيل في برنامج تعليم اللغة العربية للمبتدئين والمستوى المتقدم معًا',
  },
};
