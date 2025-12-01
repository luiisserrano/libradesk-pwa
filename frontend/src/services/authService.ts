import api from './api';

export const login = async (credentials: any) => {
    const response = await api.post('/login', credentials);
    return response.data;
};

export const register = async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/logout');
    return response.data;
};

export const getUserPhoto = async (userId: number): Promise<Blob> => {
    const response = await api.get(`/users/${userId}/photo`, {
        responseType: 'blob'
    });
    return response.data;
};
