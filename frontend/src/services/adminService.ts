import api from './api';

export const adminService = {
    // Users
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateUserRole: async (id: number, roleId: number) => {
        const response = await api.put(`/admin/users/${id}`, { role_id: roleId });
        return response.data;
    },
    deleteUser: async (id: number) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    // Books
    updateBook: async (id: number, data: FormData) => {
        // Use _method: PUT for FormData with files in Laravel
        data.append('_method', 'PUT');
        const response = await api.post(`/admin/books/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteBook: async (id: number) => {
        const response = await api.delete(`/admin/books/${id}`);
        return response.data;
    },

    // Genres
    getGenres: async () => {
        const response = await api.get('/admin/genres');
        return response.data;
    },
    createGenre: async (name: string) => {
        const response = await api.post('/admin/genres', { name });
        return response.data;
    },
    updateGenre: async (id: number, name: string) => {
        const response = await api.put(`/admin/genres/${id}`, { name });
        return response.data;
    },
    deleteGenre: async (id: number) => {
        const response = await api.delete(`/admin/genres/${id}`);
        return response.data;
    },

    // Authors
    getAuthors: async () => {
        const response = await api.get('/admin/authors');
        return response.data;
    },
    createAuthor: async (name: string) => {
        const response = await api.post('/admin/authors', { name });
        return response.data;
    },
    updateAuthor: async (id: number, name: string) => {
        const response = await api.put(`/admin/authors/${id}`, { name });
        return response.data;
    },
    deleteAuthor: async (id: number) => {
        const response = await api.delete(`/admin/authors/${id}`);
        return response.data;
    }
};
