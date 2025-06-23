import axios from 'axios';

export async function changeUser2FA(target, type, userId) {
    try {
        const body = {
            target,
            type,
            userId
        };
        const { data } = await axios.post('/api/admin/user/2fa/change', body);
        return data?.success === true;
    } catch (error) {
        console.error('Error in changeUser2FA:', error);
        return false;
    }
}

export async function unlinkUser2FA(target) {
    try {
        const body = {
            target
        };
        const { data } = await axios.post('/api/admin/user/2fa/unlink', body);
        return data?.success === true;
    } catch (error) {
        console.error('Error in unlinkUser2FA:', error);
        return false;
    }
}
