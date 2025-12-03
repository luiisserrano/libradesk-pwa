import localforage from 'localforage';

const bookStore = localforage.createInstance({
    name: 'libradesk',
    storeName: 'books'
});

const pdfStore = localforage.createInstance({
    name: 'libradesk',
    storeName: 'pdfs'
});

export interface OfflineBook {
    id: number;
    title: string;
    author: string;
    cover_image: string;
    description: string;
    downloadedAt: number;
}

export const offlineService = {
    async saveBook(book: any, pdfBlob: Blob) {
        try {
            // Guardar metadatos
            const offlineBook: OfflineBook = {
                id: book.id,
                title: book.title,
                author: book.author_name || book.author?.name || 'Desconocido',
                cover_image: book.cover_image,
                description: book.description,
                downloadedAt: Date.now()
            };
            await bookStore.setItem(String(book.id), offlineBook);

            // Guardar PDF
            await pdfStore.setItem(String(book.id), pdfBlob);
            return true;
        } catch (error) {
            console.error('Error saving book offline:', error);
            return false;
        }
    },

    async getBook(id: string) {
        try {
            const book = await bookStore.getItem<OfflineBook>(id);
            const pdf = await pdfStore.getItem<Blob>(id);
            return { book, pdf };
        } catch (error) {
            return { book: null, pdf: null };
        }
    },

    async getDownloadedBooks(): Promise<OfflineBook[]> {
        try {
            const books: OfflineBook[] = [];
            await bookStore.iterate((value: OfflineBook) => {
                books.push(value);
            });
            return books;
        } catch (error) {
            console.error('Error getting downloaded books:', error);
            return [];
        }
    },

    async removeBook(id: string) {
        try {
            await bookStore.removeItem(id);
            await pdfStore.removeItem(id);
            return true;
        } catch (error) {
            console.error('Error removing book:', error);
            return false;
        }
    },

    async isBookDownloaded(id: string): Promise<boolean> {
        try {
            const item = await bookStore.getItem(id);
            return !!item;
        } catch {
            return false;
        }
    }
};
