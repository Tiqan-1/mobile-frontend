// expo-updates reaches for a native EventEmitter/NativeModule at import
// time that doesn't exist under Jest — same class of issue as
// __mocks__/nativeStub.js, but this one is a function API, not a component.
export const reloadAsync = async () => {};
