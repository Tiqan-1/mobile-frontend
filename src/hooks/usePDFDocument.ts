import { useState, useCallback } from 'react';
import { downloadPDF, deletePDF } from '../utils/pdfManager';
import { PDFDocument } from '../types/pdf';

export const usePDFDocument = (document: PDFDocument) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    try {
      setIsDownloading(true);
      setError(null);
      const localPath = await downloadPDF(document);
      return localPath;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, [document]);

  const remove = useCallback(async () => {
    if (document.localPath) {
      await deletePDF(document.localPath);
    }
  }, [document]);

  return {
    isDownloading,
    error,
    download,
    remove,
  };
}; 