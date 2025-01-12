import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {PDFDocument} from '../types/pdf';
import {fetchPDFsFromChannel, getFileUrl} from '../services/telegramAPI';
import {ReadingProgress} from '../types/pdf';
import {REHYDRATE} from 'redux-persist';
import { fetchPDFsFromNotion } from '../services/notionAPI';

interface DocumentsState {
  items: PDFDocument[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentDownloading: string | null;
  progressData: {[key: string]: ReadingProgress};
  lastUpdated: number | null;
}

const initialState: DocumentsState = {
  items: [],
  status: 'idle',
  error: null,
  currentDownloading: null,
  progressData: {},
  lastUpdated: null,
};

// Add a function to check if we need to refresh the data
const shouldRefreshData = (lastUpdated: number | null): boolean => {
  if (!lastUpdated) return true;
  const ONE_HOUR = 60 * 60 * 1000; // in milliseconds
  return Date.now() - lastUpdated > ONE_HOUR;
};

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async (_, {getState}) => {
  const state = getState() as {documents: DocumentsState};
  if (!shouldRefreshData(state.documents.lastUpdated)) {
    return state.documents.items;
  }
  // const documents = await fetchPDFsFromChannel();
  const documents = await fetchPDFsFromNotion();
  return documents;
});

export const downloadDocument = createAsyncThunk('documents/downloadDocument', async (document: PDFDocument) => {
  const fileUrl = await getFileUrl(document.id);
  return {
    id: document.id,
    localPath: fileUrl,
  };
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    // set current page for current document
    setCurrentPage: (state, action) => {
      if (action.payload.documentId) {
        state.progressData[action.payload.documentId] = {
          ...state.progressData[action.payload.documentId],
          ...action.payload,
        };
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(REHYDRATE, (state, action) => {
        // Handle rehydration and check if we need to refresh data
        if (action.payload) {
          const documents = action.payload.documents;
          return {
            ...documents,
            status: shouldRefreshData(documents.lastUpdated) ? 'idle' : 'succeeded',
          };
        }
      })
      .addCase(fetchDocuments.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch documents';
      })
      .addCase(downloadDocument.pending, (state, action) => {
        state.currentDownloading = action.meta.arg.id;
      })
      .addCase(downloadDocument.fulfilled, (state, action) => {
        const index = state.items.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.items[index].localPath = action.payload.localPath;
        }
        state.currentDownloading = null;
      })
      .addCase(downloadDocument.rejected, state => {
        state.currentDownloading = null;
      });
  },
});

export default documentsSlice.reducer;

export const {setCurrentPage} = documentsSlice.actions;
