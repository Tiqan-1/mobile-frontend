import React, {useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {PDFDocument} from '../types/pdf';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {fetchDocuments, downloadDocument} from '../store/documentsSlice';

const pdfs: PDFDocument[] = [
  {
    id: '1',
    title: 'Book Title 1',
    url: 'https://drive.google.com/file/d/1DWA132f8IVMEaF2wqNwc8jEVzlOCbZiZ/view?usp=drive_link',
    language: 'en',
  },
  {
    id: '2',
    title: 'عنوان الكتاب ٢',
    url: 'https://dn790007.ca.archive.org/0/items/FP126991/126991.pdf',
    language: 'ar',
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
        data={pdfs}
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
    flexDirection: 'row',
    alignItems: 'center',
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
