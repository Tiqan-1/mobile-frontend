import { Text } from '@/components/atoms/Text';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const renderItem = ({ item }: { item: Lesson }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();


  if (item.type === 'pdf') {
    const pdfDoc = { ...item, ...store.progressData[item.id] };
    const handlePress = async () => {
      if (!pdfDoc.localPath) {
        // await dispatch(downloadDocument(pdfDoc));
      }
      navigation.navigate('PDFViewer', { document: pdfDoc });
    };

    const isDownloading = currentDownloading === pdfDoc.id;

    return (
      <TouchableOpacity style={styles.documentItem} onPress={handlePress}>
        <Text style={styles.title}>{pdfDoc.title}</Text>
        <Text style={styles.progress}>
          {t('currentPage')}: {pdfDoc.currentPage}/{pdfDoc.totalPages}
        </Text>
        {isDownloading && <ActivityIndicator style={styles.loader} />}
      </TouchableOpacity>
    );
  }
  if (type === 'youtube') {
    // YouTube video rendering
    const youtubeId = item.url.split('v=')[1]?.split('&')[0];
    const isPlaylist =
      item.url.includes('list=') ||
      item.url.includes('playlist=') ||
      item.url.includes('p=') ||
      item.url.includes('listType=') ||
      item.url.includes('view_as=subscriber');
    const playlistId = item.url.split('list=')[1]?.split('&')[0];
    return (
      <View style={styles.documentItem}>
        <Text style={styles.title}>{item.title}</Text>
        <YoutubePlayer
          height={250}
          playList={isPlaylist ? playlistId : undefined}
          videoId={isPlaylist ? undefined : youtubeId}
          webViewProps={{
            androidLayerType: 'hardware',
          }}
          onChangeState={state => console.log({ state })}
        />

        {/* <YouTube
            videoId={youtubeId}
            play // control playback of video with true/false
            fullscreen // control whether the video should play in fullscreen or inline
            loop // control whether the video should loop when ended
            onReady={() => console.log('ready')}
            onChangeState={e => console.log({status: e.state})}
            onChangeQuality={e => console.log({quality: e.quality})}
            onError={e => console.log({error: e.error})}
            style={{alignSelf: 'stretch', height: 300}}
          /> */}
      </View>
    );
  }
  return (
    <TouchableOpacity style={styles.unkownItem} onPress={() => {}}>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unkownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fee',
    backgroundColor: '#fee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  progress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  retry: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  loader: {
    marginLeft: 10,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
