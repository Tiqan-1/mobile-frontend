import { isStorybookEnabled } from '../../scripts/storybook-flag';

export const APP_LANGUTAGE = 'ar';

// Resolved by scripts/storybook-flag.js — the same check metro.config.js
// uses to strip Storybook out of bundles where it's off. See docs/tasks/T2c-storybook.md.
export const STORYBOOK_ENABLED = isStorybookEnabled();
