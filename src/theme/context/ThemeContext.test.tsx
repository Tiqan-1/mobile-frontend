import { renderHook } from '@testing-library/react-native';
import { ThemeProvider } from './ThemeContext';
import { useTheme } from './ThemeContext';

// Minimal MMKV mock compatible with the jest mock in __mocks__/react-native-mmkv.ts
const mockStorage = {
  getString: jest.fn(() => null),
  set: jest.fn(),
  deleteAll: jest.fn(),
};

describe('useTheme', () => {
  it('returns a referentially stable object when the theme has not changed', () => {
    const { result, rerender } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider storage={mockStorage as unknown as import('react-native-mmkv').MMKV}>
          {children}
        </ThemeProvider>
      ),
    });

    const first = result.current;

    // Re-render without changing isDark — the returned object should be the same reference.
    rerender(
      <ThemeProvider storage={mockStorage as unknown as import('react-native-mmkv').MMKV}>
        <>{null}</>
      </ThemeProvider>,
    );

    expect(result.current).toBe(first);
  });

  it('exposes isRTL from I18nManager', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider storage={mockStorage as unknown as import('react-native-mmkv').MMKV}>
          {children}
        </ThemeProvider>
      ),
    });

    expect(typeof result.current.isRTL).toBe('boolean');
  });

  it('exposes keyboardHeight', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider storage={mockStorage as unknown as import('react-native-mmkv').MMKV}>
          {children}
        </ThemeProvider>
      ),
    });

    expect(typeof result.current.keyboardHeight).toBe('number');
  });
});
