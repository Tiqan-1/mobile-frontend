export type MediaType = 'pdf' | 'youtube';

export interface BaseDocument {
  id: string;
  title: string;
  url: string;
  language: string;
  type: MediaType;
}

export interface PDFDocument extends BaseDocument {
  type: 'pdf';
  currentPage?: number;
  totalPages?: number;
  localPath?: string;
  language: 'en' | 'ar';
}

export interface ReadingProgress {
  documentId: string;
  currentPage: number;
  lastReadDate: string;
  bookmarks: number[];
}

export interface YouTubeDocument extends BaseDocument {
  type: 'youtube';
  thumbnailUrl?: string;
}

export type Document = PDFDocument | YouTubeDocument;
