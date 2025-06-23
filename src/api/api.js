import axios from 'axios';
import config from '@/config/config.json';

const api = axios.create({
    baseURL: config.baseURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
