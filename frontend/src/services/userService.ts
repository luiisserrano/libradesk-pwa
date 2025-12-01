import api from './api';

export const updateProfile = async (profileData: FormData) => {
    // Laravel requires _method field for PUT with FormData
    profileData.append('_method', 'PUT');
    const response = await api.post('/user/profile', profileData);
    return response.data;
};
