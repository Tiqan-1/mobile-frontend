/**
 * Single source of truth for whether Storybook is included in this bundle.
 *
 * Read by metro.config.js at build time (to strip Storybook out of the
 * bundle entirely when disabled — see @storybook/react-native's
 * withStorybook `enabled` option) and by src/config/index.ts's
 * STORYBOOK_ENABLED for app code.
 *
 * EXPO_PUBLIC_* so it's inlined by babel-preset-expo like every other
 * build-time flag in this repo (CLAUDE.md §0.3) — not a secret.
 */
function isStorybookEnabled() {
  return process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';
}

module.exports = { isStorybookEnabled };
