import axios from 'axios';

export const getUserInfo = async (username) => {
    try {
        const { data } = await axios.post('/api/admin/users/info', { username });
        if (data.success) return data.result;
        throw new Error(data.error || 'Unknown error');
    } catch (error) {
        console.error('Error in getUserInfo:', error);
        throw error;
    }
};

export async function checkAuthApi() {
    try {
        const { data } = await axios.get('/api/auth/check');
        return data?.username ? data : null;
    } catch (error) {
        console.error('Error in checkAuthApi:', error);
        return null;
    }
}
