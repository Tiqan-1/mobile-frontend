import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { VideoView, useVideoPlayer, type VideoPlayerStatus } from 'expo-video';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTranslation } from 'react-i18next';
import type { Lesson } from '@/types/program';

export interface FocusPlayerProps {
  lesson: Lesson | null;
  onClose: () => void;
}

function getYoutubeId(url: string): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.includes('youtu.be')) {
    return url.split('youtu.be/')[1]?.split('?')[0];
  }
  if (url.includes('youtube.com')) {
    const match = url.match(/[&?]v=([^&]+)/);
    if (match) {
      return match[1];
    }
    const embedMatch = url.match(/embed\/([^&?]+)/);
    if (embedMatch) {
      return embedMatch[1];
    }
  }
  return undefined;
}

function isYoutubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export const FocusPlayer: React.FC<FocusPlayerProps> = ({ lesson, onClose }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });
  const [hostedVideoStatus, setHostedVideoStatus] = useState<null | VideoPlayerStatus>(null);
  const [hostedVideoError, setHostedVideoError] = useState<null | string>(null);

  const youtubeId = lesson?.url ? getYoutubeId(lesson.url) : undefined;
  const isYoutube = lesson?.url ? isYoutubeUrl(lesson.url) : false;

  // startSec/endSec clipping. `Lesson` (src/types/program.ts) has no `source`
  // field today — the Family feature's `LessonSource` union (kind: hosted/youtube/…)
  // has not landed on the type yet. Read it defensively so clipping works the day
  // it does; until then these are `undefined` and clipping is a no-op (AC6 deferred).
  const lessonSource = lesson ? (lesson as Lesson & { source?: { startSec?: number; endSec?: number } }).source : undefined;
  const startSec = lessonSource?.startSec ?? 0;
  const endSec = lessonSource?.endSec;

  const hostedPlayer = useVideoPlayer(isYoutube ? null : (lesson?.url ?? null), player => {
    player.loop = false;
    player.timeUpdateEventInterval = 0.5;
  });

  // Determine if we're in landscape mode based on dimensions
  const isLandscape = dimensions.width > dimensions.height;

  // Calculate player dimensions based on orientation and fullscreen state
  const getPlayerDimensions = () => {
    return isFullScreen || isLandscape
      ? { width: dimensions.width, height: dimensions.height }
      : {
          width: dimensions.width * 0.9,
          height: Math.min(240, dimensions.height * 0.4),
        };
  };

  const playerDimensions = getPlayerDimensions();

  const handleClose = useCallback(() => {
    setIsFullScreen(false);
    hostedPlayer.pause();
    onClose();
  }, [onClose, hostedPlayer]);

  // Handle back button - close player on Android back press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullScreen) {
        setIsFullScreen(false);
        return true;
      }
      handleClose();
      return true;
    });
    return () => backHandler.remove();
  }, [isFullScreen, handleClose]);

  // Track hosted player status via the player's statusChange event
  useEffect(() => {
    const statusSub = hostedPlayer.addListener('statusChange', ({ status }) => {
      setHostedVideoStatus(status);
      if (status === 'error') {
        setHostedVideoError(t('common:error'));
      }
    });
    return () => statusSub.remove();
  }, [hostedPlayer, t]);

  // Keep the screen awake only while a lesson is actually playing, and release
  // the lock when the player closes (or the lesson clears).
  useEffect(() => {
    if (!lesson) {
      return;
    }
    let cancelled = false;
    void activateKeepAwakeAsync().then(() => {
      // If the player closed before activation resolved, release the lock
      // that was (just) acquired — cleanup below already ran and can't cover it.
      if (cancelled) {
        void deactivateKeepAwake();
      }
    });
    return () => {
      cancelled = true;
      void deactivateKeepAwake();
    };
  }, [lesson]);

  // Handle startSec/endSec clipping via the player's timeUpdate event
  useEffect(() => {
    // Seek to startSec once the source has loaded
    if (!isYoutube && startSec > 0) {
      hostedPlayer.currentTime = startSec;
    }
    const sub = hostedPlayer.addListener('timeUpdate', ({ currentTime }) => {
      if (!isYoutube && endSec && currentTime >= endSec) {
        hostedPlayer.pause();
      }
    });
    return () => sub.remove();
  }, [hostedPlayer, isYoutube, startSec, endSec]);

  // Listen for dimension changes (orientation changes)
  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width, height });
    };

    // Hide status bar when video is playing
    if (lesson) {
      StatusBar.setHidden(true);
    }

    const dimensionsListener = Dimensions.addEventListener('change', updateDimensions);

    return () => {
      dimensionsListener.remove();
      StatusBar.setHidden(false);
    };
  }, [lesson]);

  const onFullScreenChange = useCallback((fullScreen: boolean) => {
    setIsFullScreen(fullScreen);
  }, []);

  if (!lesson) {
    return null;
  }

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={!isFullScreen && !isLandscape}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      supportedOrientations={['portrait', 'landscape']}>
      {isFullScreen || isLandscape ? (
        <View style={[styles.fullScreenContainer, { backgroundColor: colors.BLACK }]}>
          {isYoutube && youtubeId ? (
            <YoutubePlayer
              height={playerDimensions.height}
              width={playerDimensions.width}
              videoId={youtubeId}
              webViewProps={{
                androidLayerType: 'hardware',
                onShouldStartLoadWithRequest: (request: any) => {
                  // Navigation interception: block all navigation outside the embed
                  const url = request.url || request;
                  if (typeof url === 'string') {
                    // Allow youtube-nocookie.com and google.com (for captions, etc.)
                    const allowedDomains = ['youtube-nocookie.com', 'www.youtube-nocookie.com', 'google.com', 'www.google.com'];
                    const isAllowed = allowedDomains.some(domain => url.includes(domain));
                    if (!isAllowed && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                      return false; // Block navigation to youtube.com
                    }
                  }
                  return true;
                },
                setSupportMultipleWindows: false,
                allowsFullscreenVideo: false,
              }}
              onFullScreenChange={onFullScreenChange}
              initialPlayerParams={{
                controls: true,
                showClosedCaptions: true,
                modestbranding: true,
                rel: 0,
                start: startSec,
                end: endSec,
              }}
            />
          ) : !isYoutube ? (
            <VideoView player={hostedPlayer} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls />
          ) : null}
          {hostedVideoStatus === 'loading' && !isYoutube && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.WHITE} />
            </View>
          )}
          {hostedVideoError && !isYoutube && (
            <View style={styles.errorOverlay}>
              <Text style={[styles.errorText, { color: colors.WHITE }]}>{hostedVideoError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => hostedPlayer.play()}>
                <Text style={{ color: colors.PRIMARY_COLOR }}>{t('common:retry')}</Text>
              </TouchableOpacity>
            </View>
          )}
          {(isLandscape && !isFullScreen) || isFullScreen ? (
            <TouchableOpacity style={[styles.floatingCloseButton, { backgroundColor: colors.PRIMARY_COLOR }]} onPress={handleClose}>
              <Text style={{ color: colors.WHITE }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <TouchableOpacity style={[styles.floatingCloseButton, { backgroundColor: colors.PRIMARY_COLOR }]} onPress={handleClose}>
              <Text style={{ color: colors.WHITE }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.BLACK }]}>{lesson.title}</Text>
            {isYoutube && youtubeId ? (
              <YoutubePlayer
                height={playerDimensions.height}
                width={playerDimensions.width}
                videoId={youtubeId}
                webViewProps={{
                  androidLayerType: 'hardware',
                  onShouldStartLoadWithRequest: (request: any) => {
                    const url = request.url || request;
                    if (typeof url === 'string') {
                      const allowedDomains = ['youtube-nocookie.com', 'www.youtube-nocookie.com', 'google.com', 'www.google.com'];
                      const isAllowed = allowedDomains.some(domain => url.includes(domain));
                      if (!isAllowed && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                        return false;
                      }
                    }
                    return true;
                  },
                  setSupportMultipleWindows: false,
                  allowsFullscreenVideo: false,
                }}
                onFullScreenChange={onFullScreenChange}
                initialPlayerParams={{
                  controls: true,
                  showClosedCaptions: true,
                  modestbranding: true,
                  rel: 0,
                  start: startSec,
                  end: endSec,
                }}
              />
            ) : !isYoutube ? (
              <VideoView
                player={hostedPlayer}
                style={{ width: playerDimensions.width, height: playerDimensions.height }}
                contentFit="contain"
                nativeControls
              />
            ) : (
              <View style={styles.unsupportedContainer}>
                <Text style={[styles.unsupportedText, { color: colors.GREY }]}>{t('common:error')}</Text>
              </View>
            )}
            {hostedVideoStatus === 'loading' && !isYoutube && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
              </View>
            )}
            {hostedVideoError && !isYoutube && (
              <View style={[styles.errorOverlay, { backgroundColor: colors.SURFACE }]}>
                <Text style={[styles.errorText, { color: colors.ERROR }]}>{hostedVideoError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => hostedPlayer.play()}>
                  <Text style={{ color: colors.PRIMARY_COLOR }}>{t('common:retry')}</Text>
                </TouchableOpacity>
              </View>
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
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    textAlign: 'center',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  unsupportedContainer: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedText: {
    textAlign: 'center',
  },
});

FocusPlayer.displayName = 'FocusPlayer';
