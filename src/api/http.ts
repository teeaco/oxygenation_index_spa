import axios, { AxiosHeaders } from 'axios';
import { getStoredToken } from './authStorage';
import { appRuntime } from '../config/runtime';

export const http = axios.create({
  baseURL: appRuntime.apiBaseUrl,
  timeout: 8000,
  headers: {
    Accept: 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (!token) return config;

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  if (config.headers instanceof AxiosHeaders) {
    if (!config.headers.get('Authorization')) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  }

  const headers = config.headers as Record<string, string>;
  if (!headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
