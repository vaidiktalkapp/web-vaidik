// src/lib/imageUtils.ts

export const getImageUrl = (url?: string, name: string = 'Astrologer') => {
    if (!url || url.trim() === '') {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f0ebe3&color=7c6a4f&size=200&bold=true`;
    }

    if (url.startsWith('http')) {
        return url;
    }

    // Prepend backend URL if it's a relative path (e.g. /uploads/...)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    
    // Ensure we don't have double slashes
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
};
