import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import RadioButton from './index';

const meta = {
  title: 'Atoms/RadioButton',
  component: RadioButton,
} satisfies Meta<typeof RadioButton>;

export default meta;

type Story = StoryObj<typeof meta>;

// RadioButton is fully controlled (selected/onPress) — a story-local render
// gives it somewhere to keep the toggled state.
export const Unselected: Story = {
  args: { label: 'المستوى الأول', selected: false, onPress: () => {} },
  render: args => {
    const [selected, setSelected] = useState(args.selected);
    return <RadioButton {...args} selected={selected} onPress={() => setSelected(s => !s)} />;
  },
};

export const Selected: Story = {
  ...Unselected,
  args: { ...Unselected.args, selected: true },
};

export const Disabled: Story = {
  args: { label: 'مستوى غير متاح حاليًا', disabled: true, selected: false, onPress: () => {} },
};

export const LongArabicLabel: Story = {
  ...Unselected,
  args: {
    ...Unselected.args,
    label: 'المستوى المتقدم لتعليم اللغة العربية للناطقين بغيرها مع شهادة معتمدة',
  },
};
