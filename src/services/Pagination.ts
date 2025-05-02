/* eslint-disable perfectionist/sort-classes */
import { handleErrorMessage } from '@/components/atoms/FlashMessage';
import type { Dispatch, SetStateAction } from 'react';
import { GET } from './API';

export interface PaginationState<a> extends APISTATE<a> {
  cancelToken?: string;
  forceUpdate?: object;
  pagination?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
  params?: string;
  url: string;
}

interface LoadPageOptions {
  Append?: boolean;
  forceData?: unknown;
  showLoading?: boolean;
}

export class Pagination<T> {
  state: PaginationState<T>;
  setState: Dispatch<SetStateAction<PaginationState<T>>>;
  constructor(state: PaginationState<T>, setState: typeof this.setState) {
    this.setState = setState;
    this.state = {
      ...state,
      error: '',
      results: [],
      loading: false,
      pagination: { page: 1 }, //pageSize: 20, total: 0
    };
  }

  changeURL = (state: PaginationState<T>) => {
    this.state = {
      ...state,
      error: '',
      results: [],
      loading: false,
      pagination: { page: 1 },
    };
    this.setState(this.state);
    this.init();
  };
  //   setState: (state: PaginationState<T>) => SetStateAction<PaginationState<T>>;

  init = () => this.loadPage(1, { showLoading: true, Append: false }, this.state);

  loadPage = async (page: number, { showLoading = false, Append = false, forceData }: LoadPageOptions, st: PaginationState<T>) => {
    const url = st.params ? `${st.url}?page=${page}&${st.params}` : `${st.url}?page=${page}&`;
    return GET(url, {}, this.setState, {
      showLoading,
      usePagination: true,
      Append,
      forceData: forceData ? forceData : undefined,
      //   cancelToken: st.token,
    }).catch(error => handleErrorMessage(error));
  };

  next = (st: PaginationState<T>) => {
    const current_page = st?.pagination?.page || 0;
    const last_page = Math.round(st.pagination?.total ?? 1 / (st?.pagination?.pageSize ?? 20)) || 1;
    // console.log('Loading Next', current_page, last_page);
    if (last_page > current_page) {
      this.loadPage(current_page + 1, { showLoading: false, Append: true }, st);
    }
  };

  reload = (st: PaginationState<T>) => {
    this.state = st;
    this.loadPage(1, { showLoading: true, Append: false, forceData: { results: [], params: st.params, ...st.forceUpdate } }, st);
  };
}
