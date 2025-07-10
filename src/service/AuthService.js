import axios from 'axios';
import config from '@/config/config.json';

const api = axios.create({
    baseURL: config.baseURL, // или нужный URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const AuthService = {

    async loginUser(data) {
        await api.post(`/auth/login`, data)
    }

};
