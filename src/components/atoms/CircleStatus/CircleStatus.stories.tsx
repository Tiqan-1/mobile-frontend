import type { Meta, StoryObj } from '@storybook/react-native';

import CircleStatus from './index';

const meta = {
  title: 'Atoms/CircleStatus',
  component: CircleStatus,
} satisfies Meta<typeof CircleStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

const daysFromToday = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const Passed: Story = {
  args: { Dtstatus: daysFromToday(-3) },
};

export const Now: Story = {
  args: { Dtstatus: daysFromToday(0) },
};

export const Next: Story = {
  args: { Dtstatus: daysFromToday(3) },
};
