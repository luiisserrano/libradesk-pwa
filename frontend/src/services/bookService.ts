import api from './api';
import db from './db';

export const getBooks = async () => {
    const response = await api.get('/books');
    return response.data;
};

export const getUserLibrary = async () => {
    const response = await api.get('/library');
    return response.data;
};

export const addBookToLibrary = async (bookId: number) => {
    const response = await api.post('/library', { book_id: bookId });
    return response.data;
};

export const removeBookFromLibrary = async (bookId: number) => {
    const response = await api.delete(`/library/${bookId}`);
    return response.data;
};

export const updateReadingProgress = async (bookId: number, page: number) => {
    const response = await api.put(`/library/${bookId}`, { current_page: page });
    return response.data;
};

export const getBookCover = async (bookId: number): Promise<Blob> => {
    const response = await api.get(`/books/${bookId}/cover`, {
        responseType: 'blob'
    });
    return response.data;
};

export const downloadBook = async (bookId: number) => {
    const response = await api.get(`/books/${bookId}/download`, {
        responseType: 'blob',
    });
    const blob = response.data;
    await db.setItem(`book_${bookId}`, blob);
    return blob;
};

export const getLocalBook = async (bookId: number) => {
    return await db.getItem(`book_${bookId}`);
};

export const uploadBook = async (formData: FormData) => {
    const response = await api.post('/books', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getBookPdf = async (bookId: number): Promise<Blob> => {
    const response = await api.get(`/books/${bookId}/pdf`, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf'
        }
    });
    return response.data;
};
