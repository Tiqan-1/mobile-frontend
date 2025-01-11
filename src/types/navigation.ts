import { PDFDocument } from './pdf';

export type RootStackParamList = {
  Library: undefined;
  PDFViewer: {
    document: PDFDocument;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 