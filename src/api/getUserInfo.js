import axios from 'axios'

export const getUserInfo = async (username) => {
    const { data } = await axios.post('/api/admin/users/info', { username })
    if (data.success) return data.result
    throw new Error(data.error || 'Unknown error')
}

export async function checkAuthApi() {
    try {
        const response = await axios.get('/api/auth/check');
        if (response.data && response.data.username) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error in checkAuthApi:', error);
        return null;
    }
}
