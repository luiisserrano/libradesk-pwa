import localforage from 'localforage';

const store = localforage.createInstance({
    name: 'libradesk_books'
});

export const offlineBookService = {
    saveBook: async (bookId: number, pdfBlob: Blob) => {
        try {
            await store.setItem(`book_${bookId}`, pdfBlob);
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

    clearAll: async () => {
        await store.clear();
    }
};
