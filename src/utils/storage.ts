import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFDocument, ReadingProgress } from '../types/pdf';

export const StorageKeys = {
  READING_PROGRESS: 'reading_progress',
  DOWNLOADED_PDFS: 'downloaded_pdfs',
};

export const saveReadingProgress = async (progress: ReadingProgress) => {
  try {
    const existingProgress = await AsyncStorage.getItem(StorageKeys.READING_PROGRESS);
    const progressData = existingProgress ? JSON.parse(existingProgress) : {};
    progressData[progress.documentId] = progress;
    await AsyncStorage.setItem(StorageKeys.READING_PROGRESS, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error saving reading progress:', error);
  }
};

export const getReadingProgress = async (documentId: string): Promise<ReadingProgress | null> => {
  try {
    const existingProgress = await AsyncStorage.getItem(StorageKeys.READING_PROGRESS);
    if (existingProgress) {
      const progressData = JSON.parse(existingProgress);
      return progressData[documentId] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting reading progress:', error);
    return null;
  }
}; 