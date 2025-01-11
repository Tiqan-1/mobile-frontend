import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import { useRoute } from '@react-navigation/native';
import { PDFDocument } from '../types/pdf';
import { saveReadingProgress } from '../utils/storage';

const PDFViewerScreen = () => {
  const route = useRoute();
  const { document } = route.params as { document: PDFDocument };
  
  const onPageChanged = (page: number) => {
    saveReadingProgress({
      documentId: document.id,
      currentPage: page,
      lastReadDate: new Date().toISOString(),
      bookmarks: [], // Maintain existing bookmarks
    });
  };

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: document.localPath || document.url }}
        style={styles.pdf}
        page={document.lastReadPage}
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
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});

export default PDFViewerScreen; 