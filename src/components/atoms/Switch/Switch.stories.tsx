import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import Switch from './index';

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: { label: 'تفعيل الإشعارات', value: false, onValueChange: () => {} },
  render: args => {
    const [value, setValue] = useState(args.value);
    return <Switch {...args} value={value} onValueChange={setValue} />;
  },
};

export const On: Story = {
  ...Off,
  args: { ...Off.args, value: true },
};

export const Disabled: Story = {
  args: { label: 'غير قابل للتعديل', value: true, disabled: true, onValueChange: () => {} },
};

export const WithoutLabel: Story = {
  ...Off,
  args: { value: false, onValueChange: () => {} },
};
