/**
 * @format
 */

import { registerRootComponent } from 'expo';
import App from './src/App';
import StorybookUIRoot from './.rnstorybook';
import { STORYBOOK_ENABLED } from './src/config';

// When the flag is off, metro.config.js's withStorybook(..., { enabled: false })
// resolves './.rnstorybook' to a tiny stub and empties every storybook/@storybook
// import — this static import stays cheap either way, so no dynamic require is
// needed (see .agents/T2c.md's Decisions log for how that was verified).
registerRootComponent(STORYBOOK_ENABLED ? StorybookUIRoot : App);
