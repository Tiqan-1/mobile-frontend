import type { APISTATE as APISTATEType } from '@/services/API';
import type { PaginationState as PaginationStateType } from '@/services/Pagination';
import type { AppStates as AppStatesType } from '@/store/types.t';

declare global {
  type AppStates = AppStatesType;
  type APISTATE<a> = APISTATEType<a> | PaginationStateType<a>;
  type APISTATE = APISTATE<unknown>;
  type PaginationState<a> = PaginationStateType<a>;
  type PaginationState = PaginationStateType<unknown>;

  type APIResponseError = {
    [key: string]: unknown;
    data?: { [key: string]: unknown; errors: [] | Record<string, string[]>; message: string };
  };
}
