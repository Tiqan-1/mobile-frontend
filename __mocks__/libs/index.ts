// @testing-library/react-native@12.4+ bundles its jest-native matchers into
// the main entry point — the `/extend-expect` subpath this used to import
// no longer exists in the installed version (13.3.3) and made this file
// (and every suite loading it) fail to run at all.
// LOCAL
import './react-native-reanimated';
import './react-native-safe-area-context';
