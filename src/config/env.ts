const DEFAULT_API_URL = 'http://localhost:3000/api';

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
export const API_BASE_URL = API_URL.replace(/\/api$/, '');

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

export const getAssetUrl = (assetPath?: string | null) => {
  if (!assetPath) {
    return '';
  }

  let normalizedPath = assetPath.trim().replace(/\\/g, '/');

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
    try {
      const parsedUrl = new URL(normalizedPath);

      if (LOCAL_HOSTNAMES.has(parsedUrl.hostname)) {
        const normalizedRelativePath = parsedUrl.pathname.startsWith('/api/')
          ? parsedUrl.pathname.slice(4)
          : parsedUrl.pathname;

        return `${API_BASE_URL}${normalizedRelativePath}${parsedUrl.search}${parsedUrl.hash}`;
      }

      if (parsedUrl.protocol === 'http:' && parsedUrl.hostname === 'res.cloudinary.com') {
        parsedUrl.protocol = 'https:';
      }

      return parsedUrl.toString();
    } catch {
      return normalizedPath;
    }
  }

  const cleanedRelativePath = normalizedPath.startsWith('/api/')
    ? normalizedPath.slice(4)
    : normalizedPath;

  const relativePathWithSlash = cleanedRelativePath.startsWith('/')
    ? cleanedRelativePath
    : `/${cleanedRelativePath}`;

  return `${API_BASE_URL}${relativePathWithSlash}`;
};

export const getDefaultSessionImageUrl = (sessionType: string) => (
  `${API_BASE_URL}/uploads/sessions/default-${sessionType.toLowerCase()}.svg`
);