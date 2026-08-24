import React from 'react';
import { View } from 'react-native';

const VideoView = (props: Record<string, unknown>) =>
  React.createElement(View, props);

function useVideoPlayer() {
  return {
    currentTime: 0,
    play: () => {},
    pause: () => {},
    addListener: () => () => {},
    timeUpdateEventInterval: 0.5,
  };
}

export { VideoView, useVideoPlayer };
