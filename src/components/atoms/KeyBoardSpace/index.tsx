import {View, Text} from 'react-native';
import React from 'react';
import { useTheme } from '@/theme';

export default function KeyBoardSpace({height = 0, isPlus = false}) {
  const {keyboardHeight} = useTheme();

  const diffHeight = isPlus ? keyboardHeight : height - keyboardHeight;
  const nHeight = diffHeight > 0 ? diffHeight : 0;
  return <View style={{height: nHeight}} />;
}
