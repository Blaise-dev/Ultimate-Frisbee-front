const DEFAULT_API_URL = 'http://localhost:3000/api';

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
export const API_BASE_URL = API_URL.replace(/\/api$/, '');

export const getAssetUrl = (assetPath?: string | null) => {
  if (!assetPath) {
    return '';
  }

  let normalizedPath = assetPath.trim();

  if (
    (normalizedPath.startsWith('"') && normalizedPath.endsWith('"')) ||
    (normalizedPath.startsWith("'") && normalizedPath.endsWith("'"))
  ) {
    normalizedPath = normalizedPath.slice(1, -1).trim();
  }

  if (normalizedPath.startsWith('//')) {
    normalizedPath = `https:${normalizedPath}`;
  }

  if (normalizedPath.startsWith('http://') && normalizedPath.includes('res.cloudinary.com')) {
    normalizedPath = normalizedPath.replace('http://', 'https://');
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

export const getDefaultSessionImageUrl = (sessionType: string) => (
  `${API_BASE_URL}/uploads/sessions/default-${sessionType.toLowerCase()}.svg`
);