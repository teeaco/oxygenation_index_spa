import { Api } from './Api';
import { getStoredToken } from '../authStorage';
import { appRuntime } from '../../config/runtime';

export const requestsApi = new Api<string>({
  baseURL: appRuntime.apiBaseUrl,
  secure: true,
  securityWorker: (token) => {
    if (!token) return {};
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  },
});

export const syncRequestsApiSecurity = () => {
  requestsApi.setSecurityData(getStoredToken());
};
