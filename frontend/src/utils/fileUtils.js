/**
 * Fixes old Cloudinary PDF URLs stored as /image/upload/ → /raw/upload/
 */
export const getFileUrl = (url) => {
    if (!url) return url;
    if (url.includes('/image/upload/') && url.toLowerCase().endsWith('.pdf')) {
        return url.replace('/image/upload/', '/raw/upload/');
    }
    return url;
};

/**
 * Detect PDF by mimeType (reliable) or URL extension (fallback).
 */
export const isPdf = (url, mimeType) => {
    if (mimeType) return mimeType === 'application/pdf';
    return url?.toLowerCase().includes('.pdf');
};

export const isImage = (url, mimeType) => {
    if (mimeType) return mimeType.startsWith('image/');
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url || '');
};

/**
 * Backend proxy URL with JWT token as query param.
 * Iframes cannot send Authorization headers, so we pass the token in the URL.
 * The backend verifies it and streams the file inline.
 */
export const getProxyUrl = (recordId) => {
    const token = localStorage.getItem('token');
    return `/api/records/proxy/${recordId}?token=${token}`;
};
