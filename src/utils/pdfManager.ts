import RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-blob-util';
import {PDFDocument} from 'types/pdf';

export const downloadPDF = async (document: PDFDocument): Promise<string> => {
  const localPath = `${RNFS.DocumentDirectoryPath}/${document.id}.pdf`;

  try {
    const response = await RNFetchBlob.config({
      fileCache: true,
      path: localPath,
    }).fetch('GET', document.url);

    return localPath;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

export const deletePDF = async (filePath: string): Promise<void> => {
  try {
    await RNFS.unlink(filePath);
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
};
