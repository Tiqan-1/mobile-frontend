import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Dimensions, Linking, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import External from '@/assets/svg/enroll.svg';
interface VideoModalProps {
  onClose: () => void;
  selectedVideo: Lesson | null;
}

const getYoutubeId = (url: string) => {
  if (!url) return undefined;
  if (url.includes('youtu.be')) {
    return url.split('youtu.be/')[1]?.split('?')[0];
  }
  return url.split('v=')[1]?.split('&')[0];
};

export const VideoModal: React.FC<VideoModalProps> = ({ selectedVideo, onClose }) => {
  const { colors } = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  const youtubeId = selectedVideo?.url ? getYoutubeId(selectedVideo.url) : undefined;
  const isPlaylist =
    selectedVideo?.url?.includes('list=') ||
    selectedVideo?.url?.includes('playlist=') ||
    selectedVideo?.url?.includes('p=') ||
    selectedVideo?.url?.includes('listType=') ||
    selectedVideo?.url?.includes('view_as=subscriber');
  const playlistId = selectedVideo?.url?.split('list=')[1]?.split('&')[0];

  // Listen for dimension changes (orientation changes)
  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width, height });
    };

    // Hide status bar when video is playing
    if (selectedVideo) {
      StatusBar.setHidden(true);
    }

    // Add event listener for dimension changes
    const dimensionsListener = Dimensions.addEventListener('change', updateDimensions);

    // Handle back button in full screen mode
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullScreen) {
        setIsFullScreen(false);
        return true;
      }
      return false;
    });

    return () => {
      // Clean up
      dimensionsListener.remove();
      backHandler.remove();
      StatusBar.setHidden(false);
    };
  }, [selectedVideo, isFullScreen]);

  const onFullScreenChange = useCallback((fullScreen: boolean) => {
    setIsFullScreen(fullScreen);
  }, []);

  const handleClose = () => {
    setIsFullScreen(false);
    onClose();
  };

  // Determine if we're in landscape mode based on dimensions
  const isLandscape = dimensions.width > dimensions.height;

  // Calculate player dimensions based on orientation and fullscreen state
  const getPlayerDimensions = () => {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (isFullScreen || isLandscape) {
      // In fullscreen or landscape, use the entire screen
      return {
        width: dimensions.width,
        height: dimensions.height,
      };
    } else {
      // In portrait and not fullscreen, use a reasonable height
      return {
        width: dimensions.width * 0.9, // 90% of screen width
        height: Math.min(240, dimensions.height * 0.4), // Either 240 or 40% of height, whichever is smaller
      };
    }
  };

  const playerDimensions = getPlayerDimensions();

  return (
    <Modal
      visible={!!selectedVideo}
      animationType="slide"
      transparent={!isFullScreen && !isLandscape}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      supportedOrientations={['portrait', 'landscape']}>
      {isFullScreen || isLandscape ? (
        <View style={styles.fullScreenContainer}>
          {!!selectedVideo && (playlistId || youtubeId) && (
            <YoutubePlayer
              height={playerDimensions.height}
              width={playerDimensions.width}
              playList={isPlaylist ? playlistId : undefined}
              videoId={isPlaylist ? undefined : youtubeId}
              webViewProps={{ androidLayerType: 'hardware' }}
              onFullScreenChange={onFullScreenChange}
              initialPlayerParams={{
                controls: true,
                showClosedCaptions: true,
                modestbranding: true,
                rel: 0,
              }}
            />
          )}
          {isLandscape && !isFullScreen && (
            <TouchableOpacity style={[styles.floatingCloseButton, { backgroundColor: colors.PRIMARY_COLOR }]} onPress={handleClose}>
              <Text style={{ color: colors.WHITE }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <TouchableOpacity style={[styles.floatingCloseButton, { backgroundColor: colors.PRIMARY_COLOR }]} onPress={handleClose}>
              <Text style={{ color: colors.WHITE }}>✕</Text>
            </TouchableOpacity>
            {selectedVideo?.url && (
              <TouchableOpacity
                style={[styles.floatingExternalButton, { backgroundColor: colors.PRIMARY_COLOR }]}
                onPress={() => Linking.openURL(selectedVideo.url)}>
                <External />
                {/* <FastImage source={require('assets/images/external.png')} style={{ width: 24, height: 24 }} /> */}
              </TouchableOpacity>
            )}
            <Text style={[styles.modalTitle, { color: colors.BLACK }]}>{selectedVideo?.title}</Text>
            {!!selectedVideo && (playlistId || youtubeId) && (
              <YoutubePlayer
                height={playerDimensions.height}
                width={playerDimensions.width}
                playList={isPlaylist ? playlistId : undefined}
                videoId={isPlaylist ? undefined : youtubeId}
                webViewProps={{ androidLayerType: 'hardware' }}
                onFullScreenChange={onFullScreenChange}
                initialPlayerParams={{
                  controls: true,
                  showClosedCaptions: true,
                  modestbranding: true,
                  rel: 0,
                }}
              />
            )}
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  floatingCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  floatingExternalButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
