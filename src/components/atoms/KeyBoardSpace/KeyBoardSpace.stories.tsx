import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Text } from '@/components/atoms/Text';

import KeyBoardSpace from './index';

// KeyBoardSpace renders an invisible spacer (height only, no keyboard is
// open under Storybook) — wrap it with a visible marker so the story shows
// something rather than a blank canvas.
const meta = {
  title: 'Atoms/KeyBoardSpace',
  component: KeyBoardSpace,
  decorators: [
    Story => (
      <View>
        <Text>قبل المساحة (before the spacer)</Text>
        <View style={{ backgroundColor: '#00000010' }}>
          <Story />
        </View>
        <Text>بعد المساحة (after the spacer)</Text>
      </View>
    ),
  ],
} satisfies Meta<typeof KeyBoardSpace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { height: 40 },
};

export const Plus: Story = {
  args: { isPlus: true },
};
