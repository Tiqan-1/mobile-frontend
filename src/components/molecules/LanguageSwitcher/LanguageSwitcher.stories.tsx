import type { Meta, StoryObj } from '@storybook/react-native';

import { LanguageSwitcher } from './index';

const meta = {
  title: 'Molecules/LanguageSwitcher',
  component: LanguageSwitcher,
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
