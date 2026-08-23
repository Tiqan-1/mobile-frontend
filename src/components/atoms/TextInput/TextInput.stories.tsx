import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import TextInput from './index';

const meta = {
  title: 'Atoms/TextInput',
  component: TextInput,
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'أدخل بريدك الإلكتروني' },
  render: args => {
    const [value, setValue] = useState('');
    return <TextInput {...args} value={value} onChangeText={setValue} />;
  },
};

export const WithValue: Story = {
  ...Default,
  args: { ...Default.args, placeholder: 'الاسم الكامل' },
  render: args => {
    const [value, setValue] = useState('محمد عبد الله الشريف الحسيني');
    return <TextInput {...args} value={value} onChangeText={setValue} />;
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'كلمة المرور',
    errors: 'كلمة المرور مطلوبة',
  },
  render: args => {
    const [value, setValue] = useState('');
    return <TextInput {...args} value={value} onChangeText={setValue} />;
  },
};

export const Multiline: Story = {
  args: {
    placeholder: 'اكتب ملاحظاتك هنا...',
    multiline: true,
    numberOfLines: 4,
  },
  render: args => {
    const [value, setValue] = useState('');
    return <TextInput {...args} value={value} onChangeText={setValue} />;
  },
};
