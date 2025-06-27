import axios from 'axios';
import config from '@/config/config.json';
import { console } from 'vuedraggable/src/util/console';

export const LogsService = {
    async getUserLogs(username) {
        console.log('Getting Logs from', `${config.baseURL}/admin/eco-logs/get-all?username=${username}`);
        try {
            const res = await axios.get(`${config.baseURL}/admin/eco-logs/get-all?username=${username}`);
            console.log('Getting Logs response:', res);
            if (res.data?.success && Array.isArray(res.data.result)) {
                return res.data.result;
            } else {
                console.error('Getting Logs: unexpected response structure', res.data);
                return [];
            }
        } catch (err) {
            console.error('Getting Logs error:', err);
            throw err;
        }
    }
};
