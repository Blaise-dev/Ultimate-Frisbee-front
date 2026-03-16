const DEFAULT_API_URL = 'http://localhost:3000/api';

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
export const API_BASE_URL = API_URL.replace(/\/api$/, '');

export const getAssetUrl = (assetPath?: string | null) => {
  if (!assetPath) {
    return '';
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  return `${API_BASE_URL}${assetPath}`;
};

export const getDefaultSessionImageUrl = (sessionType: string) => (
  `${API_BASE_URL}/uploads/sessions/default-${sessionType.toLowerCase()}.svg`
);