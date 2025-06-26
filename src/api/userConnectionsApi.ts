import axios from 'axios';

export async function changeUser2FA(target: string, type: string, userId: string) {
    try {
        const { data } = await axios.post('/api/admin/user/2fa/change', { target, type, userId });
        return data?.success === true;
    } catch {
        return false;
    }
}

export async function unlinkUser2FA(target: string) {
    try {
        const { data } = await axios.post('/api/admin/user/2fa/unlink', { target });
        return data?.success === true;
    } catch {
        return false;
    }
}

export async function changeUserDiscord(username: string, discordId: string) {
    try {
        const { data } = await axios.post('/api/admin/user/discord/change', { username, discordId });
        return data?.success === true;
    } catch {
        return false;
    }
}

export async function unlinkUserDiscord(target: string) {
    try {
        const { data } = await axios.post('/api/admin/user/discord/unlink', { username: target });
        return data?.success === true;
    } catch {
        return false;
    }
}
