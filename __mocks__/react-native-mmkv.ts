// react-native-mmkv v4 is built on react-native-nitro-modules (a native
// Turbo Module) that doesn't exist under Jest. src/store/index.ts calls
// createMMKV() at module load, so an in-memory stand-in is needed rather
// than a component stub — see __mocks__/nativeStub.js for the difference.
const memoryStore = new Map<string, string>();

export const createMMKV = () => ({
  getString: (key: string) => memoryStore.get(key),
  set: (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  remove: (key: string) => {
    memoryStore.delete(key);
  },
});
