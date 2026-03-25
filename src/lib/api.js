export const apiUrl = (path = '') => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  console.log('rawBaseUrl', rawBaseUrl);

  if (!rawBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to frontend/.env.local.');
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};