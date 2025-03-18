import type { APISTATE } from './API';
import type { PDFDocument } from '@/types/pdf';

import { fetchPDFsFromNotion } from './notionAPI';
import { fetchPDFsFromChannel, getFileUrl } from './telegramAPI';

export type DocumentSource = 'drive' | 'firebase' | 'notion' | 'telegram';

interface PaginationParams {
  limit?: number;
  page?: number;
  usePagination?: boolean;
}

interface DocumentServiceConfig {
  pagination?: PaginationParams;
  setState: (state: APISTATE) => void;
  source: DocumentSource;
  sourceConfig?: Record<string, unknown>;
}

interface DocumentResponse {
  error?: string;
  pagination?: {
    current_page: number;
    has_next: boolean;
    has_previous: boolean;
    total_items: number;
    total_pages: number;
  };
  results: PDFDocument[];
}

class DocumentService {
  private pagination?: PaginationParams;
  private setState: (state: APISTATE) => void;
  private source: DocumentSource;
  private sourceConfig?: Record<string, unknown>;

  constructor(config: DocumentServiceConfig) {
    this.source = config.source;
    this.sourceConfig = config.sourceConfig;
    this.pagination = config.pagination;
    this.setState = config.setState;
  }

  private async fetchFromDrive(): Promise<APISTATE> {
    // TODO: Implement Google Drive API integration
    throw new Error('Google Drive API integration not implemented');
  }

  private async fetchFromFirebase(): Promise<APISTATE> {
    // TODO: Implement Firebase API integration
    throw new Error('Firebase API integration not implemented');
  }

  private async fetchFromNotion(): Promise<void> {
    try {
      const { page = 1, limit = 10 } = this.pagination || {};
      const response = await fetchPDFsFromNotion({
        pageSize: limit,
        cursor: page > 1 ? String(page) : '',
      });

      const results = response.results as PDFDocument[];

      // If pagination is enabled, handle it
      if (this.pagination?.usePagination) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = results.slice(startIndex, endIndex);

        const newState: APISTATE = {
          error: '',
          loading: false,
          isRequesting: false,
          results: paginatedData,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(results.length / limit),
            total_items: results.length,
            has_next: endIndex < results.length,
            has_previous: page > 1,
          },
        };

        this.setState((state: APISTATE) => ({ ...state, ...newState }));
      } else {
        const newState: APISTATE = {
          error: '',
          loading: false,
          isRequesting: false,
          results,
        };
        this.setState((state: APISTATE) => ({ ...state, ...newState }));
      }
    } catch (error) {
      const newState: APISTATE = {
        results: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch documents from Notion',
        loading: false,
        isRequesting: false,
      };
      this.setState((state: APISTATE) => ({ ...state, ...newState }));
    }
  }

  private async fetchFromTelegram(): Promise<DocumentResponse> {
    try {
      const documents = await fetchPDFsFromChannel();

      // If pagination is enabled, handle it
      if (this.pagination?.usePagination) {
        const { page = 1, limit = 10 } = this.pagination;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = documents.slice(startIndex, endIndex);

        return {
          results: paginatedData,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(documents.length / limit),
            total_items: documents.length,
            has_next: endIndex < documents.length,
            has_previous: page > 1,
          },
        };
      }

      return { results: documents };
    } catch (error) {
      return {
        results: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch documents from Telegram',
      };
    }
  }

  async fetchDocuments(): Promise<DocumentResponse> {
    try {
      switch (this.source) {
        case 'drive':
          return this.fetchFromDrive() as Promise<DocumentResponse>;
        case 'firebase':
          return this.fetchFromFirebase() as Promise<DocumentResponse>;
        case 'notion':
          await this.fetchFromNotion();
          return { results: [] };
        case 'telegram':
          return this.fetchFromTelegram();
        default:
          throw new Error(`Unsupported document source: ${this.source}`);
      }
    } catch (error) {
      return {
        results: [],
        error:
          error instanceof Error ? error.message : 'Failed to fetch documents',
      };
    }
  }

  async getDocumentUrl(document: PDFDocument): Promise<string> {
    return getFileUrl(document);
  }
}

// Factory function to create document service instance
export const createDocumentService = (
  config: DocumentServiceConfig
): DocumentService => {
  return new DocumentService(config);
};

// Example usage:
// const documentService = createDocumentService({
//   source: 'telegram',
//   pagination: { usePagination: true, page: 1, limit: 10 },
//   setState: (state) => console.log(state)
// });
// const { results, pagination, error } = await documentService.fetchDocuments();
