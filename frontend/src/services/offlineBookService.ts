import localforage from 'localforage';

const store = localforage.createInstance({
    name: 'libradesk_books'
});

export const offlineBookService = {
    saveBook: async (bookId: number, pdfBlob: Blob, metadata?: any) => {
        try {
            await store.setItem(`book_${bookId}`, pdfBlob);
            if (metadata) {
                const books = (await store.getItem<any[]>('offline_books_list')) || [];
                const existingIndex = books.findIndex(b => b.id === bookId);
                if (existingIndex >= 0) {
                    books[existingIndex] = metadata;
                } else {
                    books.push(metadata);
                }
                await store.setItem('offline_books_list', books);
            }
            return true;
        } catch (error) {
            console.error('Error saving book offline:', error);
            return false;
        }
    },

    getBook: async (bookId: number): Promise<Blob | null> => {
        try {
            return await store.getItem<Blob>(`book_${bookId}`);
        } catch (error) {
            console.error('Error retrieving offline book:', error);
            return null;
        }
    },

    removeBook: async (bookId: number) => {
        try {
            await store.removeItem(`book_${bookId}`);

            // Remove from metadata list
            const books = (await store.getItem<any[]>('offline_books_list')) || [];
            const newBooks = books.filter(b => b.id !== bookId);
            await store.setItem('offline_books_list', newBooks);

            return true;
        } catch (error) {
            console.error('Error removing offline book:', error);
            return false;
        }
    },

    isBookDownloaded: async (bookId: number): Promise<boolean> => {
        try {
            const item = await store.getItem(`book_${bookId}`);
            return !!item;
        } catch (error) {
            return false;
        }
    },

    getOfflineBooks: async (): Promise<any[]> => {
        try {
            return (await store.getItem<any[]>('offline_books_list')) || [];
        } catch (error) {
            console.error('Error getting offline books list:', error);
            return [];
        }
    },

    clearAll: async () => {
        await store.clear();
    }
};
