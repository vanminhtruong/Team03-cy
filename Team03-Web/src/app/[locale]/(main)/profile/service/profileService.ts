import { GET, PUT } from '@/src/config/ApiService';

export const getUserData = async (userId: string) => {
    try {
        const response = await GET(`/v1/api/user/${userId}`);
        return response.data.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error fetching user data');
    }
};

export const updateUserProfileWithFormData = async (
    name: string,
    phone: string | undefined,
    gender: number | null,
    profilePicture: File | null
) => {
    const formData = new FormData();
    formData.append('name', name);
    if (phone) {
        formData.append('phone', phone);
    }
    formData.append('gender', gender?.toString() || '');
    if (profilePicture) {
        formData.append('profilePicture', profilePicture);
    }

    try {
        const response = await PUT('/v1/api/user/update-profile', formData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error updating profile');
    }
};

