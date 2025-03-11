import Config from 'react-native-config';

import type { ApiResponse} from 'apisauce';
import { create } from 'apisauce';

import type { Dispatch, SetStateAction } from 'react';
import { IsIOS } from '@/utils/helpers';

// import * as DataBase from './AsyncStorage';
// import {isTestAPI} from './constants';
export const baseURLProd = Config.API_URL; 

export type PARAMS = {
  Append?: boolean;
  cancelToken?: any;
  debounce?: boolean;
  forceData?: any;
  header?: object;
  headerP?: Record<string, string>;
  isForm?: boolean;
  retry?: number;
  showLoading?: boolean;
  silentCall?: any;
  usePagination?: boolean;
};

export type APISTATE = {
  error: string;
  isRequesting?: boolean;
  loading: boolean;
  message?: string;
  pagination?: object;
  results: any;
  token?: any;
};
export const initStateAPIState: APISTATE = { results: [], error: '', loading: false, isRequesting: false };

export type PROTO = {
  body: object;
  param: PARAMS;
  setState?: Dispatch<SetStateAction<{ error: string; loading: boolean; params: string; results: never[]; url: string }>> | undefined;
  url: string;
};


export const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

// define the api
const api = create({
  baseURL: baseURLProd,
  headers,
  // httpsAgent: new https.Agent({
  //   //public CER
  //   ca: 'cer-file.cer',
  // }),
});


const handeResponse = (
  response: ApiResponse<any>,
): [string, { [key: string]: any; current_page?: number; data?: { [key: string]: any; message?: string } }] => {
  let error = '';
  let results = {};
  if (!response) {
    return [error, results];
  }
  if (response.problem === 'NETWORK_ERROR') {
    error = 'No Internet Connection, Please Check';
    results = {};
    console.log('NETWORK_ERROR');
  } else if (response.problem === 'TIMEOUT_ERROR') {
    error = 'No Internet Connection, Please Check';
    results = {};
    console.log('TIMEOUT_ERROR');
  } else if (response?.status && response?.status >= 200 && response?.status < 400) {
    results = response.data;
  } else if (response?.status && response.status >= 400 && response.status < 500) {
    if (response.status === 402 || response.status === 401 || response.status === 403) {
      error = response.data?.message;
    } else if (response.status === 404) {
      error = 'Page Not Found';
    } else {
      if (typeof response.data === 'string' && !Array.isArray(response.data)) {
        console.log('string');
        error = response.data;
      } else if ('exception' in response.data) {
        error = 'Some Thing went Wrong';
      } else if ('errors' in response.data && 'message' in response.data) {
        error = response.data;
      } else if ('errors' in response.data) {
        error = response.data.errors;
      } else if ('message' in response.data) {
        error = response.data.message;
      } else {
        error = 'Some Thing went Wrong';
      }
    }
    if (response.status === 402 || response.status === 401 || response.status === 403) {
      error = response.data?.message || response.data;
    }
    console.log('Server Replied with errors', error);
  } else if (response.status && response.status >= 500) {
    error = 'Server Error';
  }
  return [error, results];
};

export const ConvertToForm = (item: { [x: string]: any } | null | undefined): {} | undefined => {
  const data = new FormData();
  try {
    if (item) {
      Object.keys(item).forEach(keyName => {
        if (keyName === 'file' || keyName === 'image') {
          data.append(
            'file',
            {
              name: item?.[keyName]?.fileName,
              type: item?.[keyName]?.type,
              size: item?.[keyName]?.fileSize,
              uri: IsIOS ? item?.[keyName]?.uri.replace('file://', '') : item?.[keyName]?.uri,
            },
            item?.[keyName]?.fileName,
          );
        } else if (item[keyName] !== undefined) {
          data.append(keyName, item[keyName]);
        }
      });
      console.log('formData', data);
    }
    return data;
  } catch (error) {
    console.log('Form', error);
    if (item) {
      return item;
    }
    return {};
  }
};

const DefaultParams = {
  showLoading: true,
  usePagination: false,
  Append: false,
  isForm: false,
  header: undefined, // Headers
  headerP: undefined, //Header Parameter
  debounce: true,
  retry: 1,
};
/**
 * @async
 * @function POST
 * @param {string} url
 * @param {} body
 * @param {*} setState
 * @param {<PROTO.param>} params
 * @returns {Promise}
 */
// export async function POST<T=unknown>(url = '', body: T , setState = () => {}, param: PARAMS) {
export const POST = async (url = '', body = {}, setState: any | undefined = undefined, param?: PARAMS) => {
  const params = { ...DefaultParams, ...param };
  return REQUESTING('POST', url, body, setState, params);
};

export const DELETE = async (url = '', body = {}, setState = undefined, param?: PARAMS) => {
  const params = { ...DefaultParams, ...param };
  return REQUESTING('DELETE', url, body, setState, params);
};

export const GET = async (url = '', body = {}, setState: any | undefined = undefined, param?: PARAMS) => {
  const params = { ...DefaultParams, ...param };
  return REQUESTING('GET', url, body, setState, params);
};

export const PUT = async (url = '', body = {}, setState = undefined, param?: PARAMS) => {
  const params: PARAMS = { ...DefaultParams, ...param };
  return REQUESTING('PUT', url, body, setState, params);
};

const requestMap = new Map<string, boolean>();

export const REQUESTING = async (
  method = 'POST',
  url = '',
  body: Record<string, string> | undefined = undefined,
  setState: React.Dispatch<React.SetStateAction<any | APISTATE>> | undefined = undefined,
  params: PARAMS,
): Promise<any | APIResponseError | APISTATE> => {
  const { showLoading, usePagination, Append, forceData, isForm, header, headerP, debounce, cancelToken, retry } = params;
  if (debounce && requestMap.get(url) && (retry ?? 1) < 2) {
    return; // Exit if a request for this URL is already in progress
  }
  requestMap.set(url, true); // Mark the URL as in progress

  const H = api.headers;
  api.setHeaders({ ...H });

  let CONFIG = headerP ? { ...H, ...headerP } : {};
  CONFIG = header ? { ...header } : CONFIG;
  CONFIG = cancelToken ? { ...CONFIG, cancelToken } : CONFIG;

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (showLoading) {
          setState?.((state: APISTATE) => ({ ...state, error: '', loading: true, isRequesting: true, ...forceData }));
        } else {
          setState?.((state: APISTATE) => ({ ...state, error: '', loading: false, isRequesting: true, ...forceData }));
        }
        let response;
        const bodyModified = isForm ? ConvertToForm(body) : body;
        switch (method) {
          case 'DELETE':
            response = await api.delete(url, bodyModified, { ...CONFIG });
            break;
          case 'POST':
            response = await api.post(url, bodyModified, { ...CONFIG });
            break;
          case 'PUT':
            response = await api.put(url, bodyModified, { ...CONFIG });
            break;
          default:
            response = await api.get(url, bodyModified, { ...CONFIG });
        }
        console.log('URL=======', url, api.getBaseURL(), response);
        if (response && response.problem === 'CANCEL_ERROR') {
          console.log('URL======= API CANCELED ==> ', url);
          return;
        }
        const [error, results] = handeResponse(response);
        if (response.problem === 'TIMEOUT_ERROR' && (retry || 1) < 3) {
          console.log('Retry ######', retry);
          return await REQUESTING(method, url, body, setState, { ...params, retry: (retry || 1) + 1 })
            .then(res => resolve(res))
            .catch(error_ => reject(error_));
        } else if (error) {
          setState?.((state: APISTATE) => ({
            ...state,
            error,
            loading: false,
            isRequesting: false,
          }));
        } else if (usePagination && !!results?.current_page && Array.isArray(results?.data)) {
          const { data, ...rest } = results || {};
          if (Append && data) {
            setState?.((state: APISTATE) => ({
              ...state,
              results: [...state.results, ...(data || [])],
              error,
              loading: false,
              isRequesting: false,
              pagination: rest,
            }));
          } else {
            setState?.((state: APISTATE) => ({
              ...state,
              results: data ? data : undefined,
              error,
              loading: false,
              isRequesting: false,
              pagination: rest,
            }));
          }
        } else {
          setState?.((state: APISTATE) => ({ ...state, results, error, loading: false, isRequesting: false }));
        }
        if (error) {
          reject(response);
        } else {
          resolve(results);
        }
      } catch (error) {
        console.log('APIerr ', error);
        setState?.((state: APISTATE) => ({
          ...state,
          error: 'Some Thing went Wrong',
          loading: false,
          isRequesting: false,
        }));
        reject(error);
      } finally {
        requestMap.delete(url); // Remove the URL from the map
      }
    })();
  });
};

export default api;
