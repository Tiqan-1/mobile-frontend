import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Document} from '../types/pdf';
import {REHYDRATE} from 'redux-persist';
import {fetchPDFsFromNotion} from '../services/notionAPI';

interface DocumentsState {
  items: Document[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentDownloading: string | null;
  progressData: Record<string, {currentPage?: number; totalPages?: number}>;
  nextCursor: string | undefined;
  hasMore: boolean;
  lastUpdated: number | null;
}

const initialState: DocumentsState = {
  items: [],
  status: 'idle',
  error: null,
  currentDownloading: null,
  progressData: {},
  nextCursor: undefined,
  hasMore: true,
  lastUpdated: null,
};

const PAGE_SIZE = 50;

// Add a function to check if we need to refresh the data
const shouldRefreshData = (lastUpdated: number | null): boolean => {
  if (!lastUpdated) return true;
  const ONE_HOUR = 60 * 60 * 1000; // in milliseconds
  return Date.now() - lastUpdated > ONE_HOUR;
};

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async ({forceRefresh = false}: {forceRefresh: boolean}, {getState}) => {
  const state = getState() as {documents: DocumentsState};  
  // If data is fresh enough, return current items
  if (!shouldRefreshData(state.documents.lastUpdated) && !forceRefresh) {
    return {
      items: state.documents.items,
      nextCursor: state.documents.nextCursor,
      hasMore: state.documents.hasMore,
    };
  }

  const response = await fetchPDFsFromNotion({
    pageSize: PAGE_SIZE,
    cursor: undefined,
  });

  return response;
});

export const loadMoreDocuments = createAsyncThunk('documents/loadMoreDocuments', async (_, {getState}) => {
  const state = getState() as {documents: DocumentsState};
  const {nextCursor} = state.documents;

  if (!nextCursor) return null;

  const response = await fetchPDFsFromNotion({
    pageSize: PAGE_SIZE,
    cursor: nextCursor,
  });
  console.log('loadMoreDocuments', response);
  return response;
});

export const downloadDocument = createAsyncThunk('documents/downloadDocument', async (document: Document) => {
  // Your existing download logic here
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
        if (action.payload?.documents) {
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
        console.log('fetchDocuments.fulfilled', action.payload);
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch documents';
      })
      .addCase(loadMoreDocuments.fulfilled, (state, action) => {
        console.log('loadMoreDocuments.fulfilled', action.payload);
        if (action.payload) {
          state.items = [...state.items, ...action.payload.items];
          state.nextCursor = action.payload.nextCursor;
          state.hasMore = action.payload.hasMore;
          state.lastUpdated = Date.now();
        }
      })
      .addCase(downloadDocument.pending, (state, action) => {
        state.currentDownloading = action.meta.arg.id;
      })
      .addCase(downloadDocument.fulfilled, (state, action) => {
        const index = state.items.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            localPath: action.payload.localPath,
          };
        }
        state.currentDownloading = null;
      })
      .addCase(downloadDocument.rejected, state => {
        state.currentDownloading = null;
      });
  },
});

export const {setCurrentPage} = documentsSlice.actions;
export default documentsSlice.reducer;
