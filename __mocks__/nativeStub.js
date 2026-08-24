// Generic opaque-component stub for native libraries whose real
// implementation reaches for a native module that doesn't exist under
// Jest (no device/simulator). Used only where a smoke-test render needs
// the import to resolve to *something renderable* — never where the
// library's actual behavior is exercised by a test.
module.exports = 'NativeStub';
