import {PDFDocument} from '../types/pdf';

// Host this JSON file on GitHub or any static hosting
const PDF_LIST_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/pdfs.json';

interface PDFListItem {
  id: string;
  title: string;
  url: string;
  language: 'en' | 'ar';
}

export const fetchPDFsFromStatic = async (): Promise<PDFDocument[]> => {
  try {
    const response = await fetch(PDF_LIST_URL);
    const data: PDFListItem[] = await response.json();
    
    return data.map(item => ({
      ...item,
      lastReadPage: 1,
      totalPages: 0,
    }));
  } catch (error) {
    console.error('Error fetching PDFs from static source:', error);
    throw error;
  }
}; 