import React, {useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {PDFDocument} from '../types/pdf';
import {useNavigation} from '@react-navigation/native';
import {fetchPDFsFromChannel} from '../services/telegramAPI';
import {usePDFDocument} from '../hooks/usePDFDocument';

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
  const [documents, setDocuments] = React.useState<PDFDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const {isDownloading, download} = usePDFDocument();

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await fetchPDFsFromChannel();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const renderItem = ({item}: {item: PDFDocument}) => {
    const handlePress = async () => {
      if (!item.localPath) {
        const path = await download(item);
        item.localPath = path;
      }
      navigation.navigate('PDFViewer', {document: item});
    };

    return (
      <TouchableOpacity style={styles.documentItem} onPress={handlePress}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.progress}>
          {t('currentPage')}: {item.lastReadPage}/{item.totalPages}
        </Text>
        {isDownloading && <ActivityIndicator style={styles.loader} />}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={loadDocuments}>
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
