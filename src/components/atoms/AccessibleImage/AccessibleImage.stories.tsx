import type { Meta, StoryObj } from '@storybook/react-native';

import AccessibleImage from './index';

const meta = {
  title: 'Atoms/AccessibleImage',
  component: AccessibleImage,
  args: {
    source: require('@/assets/images/noImage.png'),
    style: { width: 120, height: 120 },
  },
} satisfies Meta<typeof AccessibleImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accessibilityDescription: 'شعار البرنامج التعليمي',
  },
};

export const Decorative: Story = {
  args: {
    accessibilityDescription: 'خلفية زخرفية',
    isDecorative: true,
  },
};

export const WithHint: Story = {
  args: {
    accessibilityDescription: 'صورة الملف الشخصي للطالب',
    accessibilityHint: 'اضغط مرتين لعرض الصورة بالحجم الكامل',
  },
};
