import React from 'react';
import { View } from 'react-native';

const Image = (props: Record<string, unknown>) =>
  React.createElement(View, props);
Image.prefetch = async () => true;
Image.clearMemoryCache = async () => true;
Image.clearDiskCache = async () => true;

export default Image;