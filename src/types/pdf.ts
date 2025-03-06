export type MediaType = 'pdf' | 'youtube';

export interface BaseDocument {
  id: string;
  language: string;
  title: string;
  type: MediaType;
  url: string;
}

export interface PDFDocument extends BaseDocument {
  currentPage?: number;
  language: 'ar' | 'en';
  localPath?: string;
  totalPages?: number;
  type: 'pdf';
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
