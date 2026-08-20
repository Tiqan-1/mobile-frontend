import { useTheme } from '@/theme';
import { View } from 'react-native';
import { memo } from 'react';

interface KeyBoardSpaceProps {
  height?: number;
  isPlus?: boolean;
}

// No forwardRef needed — this is a layout spacer (no focusable element to attach a ref to).
export default memo(function KeyBoardSpace({ height = 0, isPlus = false }: KeyBoardSpaceProps) {
  const { keyboardHeight } = useTheme();

  const diffHeight = isPlus ? keyboardHeight : height - keyboardHeight;
  const nHeight = diffHeight > 0 ? diffHeight : 0;
  return <View style={{ height: nHeight }} />;
});
