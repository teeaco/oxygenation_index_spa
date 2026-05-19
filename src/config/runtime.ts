const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const deployTarget = import.meta.env.VITE_DEPLOY_TARGET ?? 'web';
const backendUrlRaw = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';
const imageBackendUrlRaw = import.meta.env.VITE_IMAGE_BACKEND_URL ?? backendUrlRaw;

const backendUrl = trimTrailingSlash(backendUrlRaw);
const imageBackendUrl = trimTrailingSlash(imageBackendUrlRaw);

const toAbsoluteByBase = (base: string, path: string): string => {
  if (!path.startsWith('/')) return path;
  return `${base}${path}`;
};

export const appRuntime = {
  deployTarget,
  backendUrl,
  imageBackendUrl,
  isTauriGuest: deployTarget === 'tauri',
  apiBaseUrl: deployTarget === 'tauri' ? backendUrl : '/api',
};

export const resolveMediaUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  if (/^(https?:)?\/\//i.test(rawUrl) || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }

  if (!appRuntime.isTauriGuest) {
    return rawUrl;
  }

  if (rawUrl.startsWith('/img-proxy/')) {
    return toAbsoluteByBase(imageBackendUrl, rawUrl.replace('/img-proxy', ''));
  }

  if (rawUrl.startsWith('/api/')) {
    return toAbsoluteByBase(backendUrl, rawUrl.replace('/api', ''));
  }

  if (rawUrl.startsWith('/')) {
    return toAbsoluteByBase(backendUrl, rawUrl);
  }

  return rawUrl;
};
