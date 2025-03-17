import type {AppStates as AppStatesType} from '@/store/types.t';
import type {APISTATE as APISTATEType} from '@/services/API';
declare global {
  type AppStates = AppStatesType;
  type APISTATE = APISTATEType;
  type APIResponseError = {
    [key: string]: any;
    data?: {[key: string]: any; errors: [] | Record<string, string[]>; message: string};
  };
}
