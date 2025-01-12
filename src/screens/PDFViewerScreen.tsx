import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions, ActivityIndicator} from 'react-native';
import Pdf from 'react-native-pdf';
import {useRoute} from '@react-navigation/native';
import {PDFDocument} from '../types/pdf';
import {getFileUrl} from '../services/telegramAPI';
import {setCurrentPage} from '../store/documentsSlice';
import {useAppDispatch} from '../hooks/useAppDispatch';

const PDFViewerScreen = () => {
  const route = useRoute();
  const {document} = route.params as {document: PDFDocument};
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  console.log('document', document, fileUrl);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadFile = async () => {
      try {
        if (document.url.includes('drive.google.com')) {
          const fileId = document.url.match(/[-\w]{25,}/);
          if (fileId) {
            setFileUrl(`https://drive.google.com/uc?export=download&id=${fileId[0]}`);
          } else {
            setFileUrl(document.url);
          }
        } else if (document.localPath) {
          setFileUrl(document.localPath);
        } else {
          // const url = await getFileUrl(document.id);
          setFileUrl(document.url);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [document]);

  const onPageChanged = (page: number, numberOfPages: number) => {
    dispatch(
      setCurrentPage({
        documentId: document.id,
        currentPage: page,
        lastReadDate: new Date().toISOString(),
        totalPages: numberOfPages,
        bookmarks: [],
      }),
    );
  };

  if (loading || !fileUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        source={{uri: fileUrl}}
        style={styles.pdf}
        page={document.currentPage || 1}
        onPageChanged={onPageChanged}
        enablePaging={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});

export default PDFViewerScreen;
