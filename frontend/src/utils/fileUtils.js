const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getFileUrl = (url) => {
    if (!url) return url;
    if (url.includes('/image/upload/') && url.toLowerCase().endsWith('.pdf')) {
        return url.replace('/image/upload/', '/raw/upload/');
    }
    return url;
};

export const isPdf = (url, mimeType) => {
    if (mimeType) return mimeType === 'application/pdf';
    return url?.toLowerCase().includes('.pdf');
};

export const isImage = (url, mimeType) => {
    if (mimeType) return mimeType.startsWith('image/');
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url || '');
};

export const getProxyUrl = (recordId) => {
    const token = localStorage.getItem('token');
    return `${API_BASE}/records/proxy/${recordId}?token=${token}`;
};
