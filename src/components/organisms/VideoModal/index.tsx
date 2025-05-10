import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Linking } from 'react-native';


interface VideoModalProps {
  onClose: () => void;
  selectedVideo: Lesson | null;
}

const getYoutubeId = (url: string) => {
  if (url.includes('youtu.be')) {
    return url.split('youtu.be/')[1]?.split('?')[0];
  }
  return url.split('v=')[1]?.split('&')[0];
};

export const VideoModal: React.FC<VideoModalProps> = ({ selectedVideo, onClose }) => {
  const { colors } = useTheme();

  const youtubeId = selectedVideo?.url ? getYoutubeId(selectedVideo.url) : undefined;
  const isPlaylist =
    selectedVideo?.url.includes('list=') ||
    selectedVideo?.url.includes('playlist=') ||
    selectedVideo?.url.includes('p=') ||
    selectedVideo?.url.includes('listType=') ||
    selectedVideo?.url.includes('view_as=subscriber');
  const playlistId = selectedVideo?.url.split('list=')[1]?.split('&')[0];

  return (
    <Modal visible={!!selectedVideo} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.PRIMARY_COLOR }]}
            onPress={onClose}>
            <Text style={{ color: colors.WHITE }}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.BLACK }]}>{selectedVideo?.title}</Text>
          {!!selectedVideo && (playlistId || youtubeId) && (
            <YoutubePlayer
              height={200}
              width={'100%'}
              playList={isPlaylist ? playlistId : undefined}
              videoId={isPlaylist ? undefined : youtubeId}
              webViewProps={{ androidLayerType: 'hardware' }}
            />
          )}
          {selectedVideo?.url && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.PRIMARY_COLOR }]}
              onPress={() => Linking.openURL(selectedVideo.url)}>
              <Text style={{ color: colors.WHITE }}>Open External</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
}); 