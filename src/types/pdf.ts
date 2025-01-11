export interface PDFDocument {
  id: string;
  title: string;
  url: string;
  localPath?: string;
  currentPage?: number;
  totalPages?: number;
  language: 'en' | 'ar';
}

export interface ReadingProgress {
  documentId: string;
  currentPage: number;
  lastReadDate: string;
  bookmarks: number[];
}
