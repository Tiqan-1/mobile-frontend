import type { Meta, StoryObj } from '@storybook/react-native';
import { ErrorBoundary } from 'react-error-boundary';

import DefaultErrorScreen from './DefaultError';

// DefaultErrorScreen calls useErrorBoundary() (react-error-boundary), which
// throws outside of an ErrorBoundary tree — wrap it here rather than in the
// component itself (T2c doesn't modify components).
const meta = {
  title: 'Molecules/DefaultError',
  component: DefaultErrorScreen,
  decorators: [
    Story => (
      <ErrorBoundary FallbackComponent={() => null}>
        <Story />
      </ErrorBoundary>
    ),
  ],
} satisfies Meta<typeof DefaultErrorScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithReset: Story = {
  args: { onReset: () => {} },
};
