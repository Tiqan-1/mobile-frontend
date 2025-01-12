import React, {useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {PDFDocument} from '../types/pdf';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {fetchDocuments, downloadDocument} from '../store/documentsSlice';
import YoutubePlayer from 'react-native-youtube-iframe';
// import YouTube from 'react-native-youtube';

const items: Document[] = [
  {
    id: '1',
    title: 'Book Title 1',
    url: 'https://drive.google.com/file/d/1DWA132f8IVMEaF2wqNwc8jEVzlOCbZiZ/view?usp=drive_link',
    language: 'en',
    type: 'pdf',
  },
  {
    id: '2',
    title: 'عنوان الكتاب ٢',
    url: 'https://dn790007.ca.archive.org/0/items/FP126991/126991.pdf',
    language: 'ar',
    type: 'pdf',
  },
  {
    id: '3',
    title: 'Sample YouTube Video',
    url: 'https://www.youtube.com/watch?v=BkRtyclmPvo',
    language: 'en',
    type: 'youtube',
    // thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
];

const LibraryScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const {items: documents, status, error, currentDownloading} = useAppSelector(state => state.documents);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDocuments());
    }
  }, [dispatch, status]);
  const store = useAppSelector(state => state.documents);
  console.log('store', store);
  const renderItem = ({item}: {item: PDFDocument}) => {
    const fType = (url: string) => {
      if (!url) {
        return '';
      }
      if (url.includes('youtube')) {
        return 'youtube';
      }
      if (url.toLowerCase().includes('.pdf') || url.includes('drive.google')) {
        return 'pdf';
      }
      return '';
    };
    const type = fType(item.url);
    if (type === 'pdf') {
      const pdfDoc = {...item, ...store.progressData[item.id]};
      const handlePress = async () => {
        if (!pdfDoc.localPath) {
          await dispatch(downloadDocument(pdfDoc));
        }
        navigation.navigate('PDFViewer', {document: pdfDoc});
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
            onChangeState={state => console.log({state})}
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

  if (status === 'loading') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => dispatch(fetchDocuments())}>
          <Text style={styles.retry}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => <Text style={styles.emptyText}>{t('noDocuments')}</Text>}
      />
    </View>
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
});

export default LibraryScreen;
