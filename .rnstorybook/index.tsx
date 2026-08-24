import { view } from './storybook.requires';

// No `storage` option passed — that would need @react-native-async-storage/
// async-storage, a dependency this repo doesn't otherwise have. Without it,
// Storybook just doesn't remember the last-viewed story across reloads;
// `shouldPersistSelection: false` silences the on-device warning for that.
const StorybookUIRoot = view.getStorybookUI({ shouldPersistSelection: false });

export default StorybookUIRoot;
