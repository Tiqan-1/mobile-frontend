import {PDFDocument} from 'types/pdf';

const FOLDER_ID = 'YOUR_PUBLIC_FOLDER_ID';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink: string;
}

export const fetchPDFsFromDrive = async (): Promise<PDFDocument[]> => {
  try {
    // Using public folder listing API
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType='application/pdf'&key=YOUR_API_KEY`,
    );

    const data = await response.json();
    
    return data.files.map((file: DriveFile) => ({
      id: file.id,
      title: file.name,
      url: file.webContentLink,
      lastReadPage: 1,
      totalPages: 0,
      language: detectLanguage(file.name),
    }));
  } catch (error) {
    console.error('Error fetching PDFs from Drive:', error);
    throw error;
  }
};

const detectLanguage = (fileName: string): 'en' | 'ar' => {
  return /[\u0600-\u06FF]/.test(fileName) ? 'ar' : 'en';
}; 