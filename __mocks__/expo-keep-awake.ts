// expo-keep-awake reaches for expo-modules-core's native EventEmitter at
// import time, which doesn't exist under Jest — same class of issue as
// __mocks__/expo-updates.ts. The screen-wake lock is a no-op in tests.
export const activateKeepAwakeAsync = async () => {};
export const deactivateKeepAwake = () => {};
export const activateKeepAwake = () => {};
export const useKeepAwake = () => {};
