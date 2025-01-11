import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from '../types/pdf';
import { useNavigation } from '@react-navigation/native';

const LibraryScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [documents, setDocuments] = React.useState<PDFDocument[]>([]);

  const renderItem = ({ item }: { item: PDFDocument }) => (
    <TouchableOpacity
      style={styles.documentItem}
      onPress={() => navigation.navigate('PDFViewer', { document: item })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.progress}>
        {t('currentPage')}: {item.lastReadPage}/{item.totalPages}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>{t('noDocuments')}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  documentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
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
});

export default LibraryScreen; 