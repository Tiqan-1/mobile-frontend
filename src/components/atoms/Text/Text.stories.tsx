import type { Meta, StoryObj } from '@storybook/react-native';

import Text, { SmallText, SmallTitle, SuSmallText, Title } from './index';

const LONG_ARABIC =
  'هذا نص عربي طويل يستخدم لاختبار التفاف الأسطر وارتفاع السطر والمحاذاة في الاتجاه من اليمين إلى اليسار عندما يتجاوز عرض الحاوية المتاح.';

const meta = {
  title: 'Atoms/Text',
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'نص عادي' },
};

export const Bold: Story = {
  args: { children: 'نص عريض', isBold: true },
};

export const Dotted: Story = {
  args: { children: LONG_ARABIC, dotted: true },
};

export const LongArabicOverflow: Story = {
  args: { children: LONG_ARABIC },
};

export const TitleVariant: Story = {
  render: () => <Title>عنوان البرنامج</Title>,
};

export const SmallTitleVariant: Story = {
  render: () => <SmallTitle>عنوان فرعي</SmallTitle>,
};

export const SmallTextVariant: Story = {
  render: () => <SmallText>{LONG_ARABIC}</SmallText>,
};

export const SuperSmallTextVariant: Story = {
  render: () => <SuSmallText>ملاحظة صغيرة</SuSmallText>,
};
