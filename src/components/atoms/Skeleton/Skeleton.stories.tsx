import type { Meta, StoryObj } from '@storybook/react-native';

import { Text } from '@/components/atoms/Text';

import Skeleton from './index';

const meta = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { loading: true, height: 24, width: '100%' },
};

export const LoadingBlock: Story = {
  args: { loading: true, height: 120, width: 200 },
};

export const LoadedContent: Story = {
  args: { loading: false },
  render: args => (
    <Skeleton {...args}>
      <Text>تم تحميل المحتوى بنجاح</Text>
    </Skeleton>
  ),
};
