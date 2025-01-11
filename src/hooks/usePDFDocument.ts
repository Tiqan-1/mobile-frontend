import { useState, useCallback } from 'react';
import { downloadPDF, deletePDF } from '../utils/pdfManager';
import { PDFDocument } from '../types/pdf';

export const usePDFDocument = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (document: PDFDocument) => {
    setIsDownloading(true);
    try {
      // Your download logic here
      // Return the local path
    } finally {
      setIsDownloading(false);
    }
  };

  return {isDownloading, download};
}; 