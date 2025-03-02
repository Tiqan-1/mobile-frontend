import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {PDFDocument} from 'types/pdf';

export const fetchPDFsFromFirebase = async (): Promise<PDFDocument[]> => {
  try {
    const snapshot = await firestore().collection('pdfs').get();

    const pdfs = await Promise.all(
      snapshot.docs.map(async doc => {
        const data = doc.data();
        const url = await storage().ref(data.path).getDownloadURL();

        return {
          id: doc.id,
          title: data.title,
          url,
          lastReadPage: 1,
          totalPages: 0,
          language: data.language,
        };
      }),
    );

    return pdfs;
  } catch (error) {
    console.error('Error fetching PDFs from Firebase:', error);
    throw error;
  }
};
