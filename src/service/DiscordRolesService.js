import axios from 'axios';
import config from '@/config/config.json';
import { console } from 'vuedraggable/src/util/console';

export const DiscordRolesService = {
    async getRoles() {
        console.log('Getting Groups from', config.baseURL + '/discord/roles/get');
        try {
            const res = await axios.get(`${config.baseURL}/discord/roles/get`);
            console.log('getRoles response:', res);
            if (res.data?.success && Array.isArray(res.data.roles)) {
                return res.data.roles;
            } else {
                console.error('getRoles: unexpected response structure', res.data);
                return [];
            }
        } catch (err) {
            console.error('getRoles error:', err);
            throw err;
        }
    },
    async setSyncable(role, state) {
        try {
            const res = await axios.get(`${config.baseURL}/discord/roles/set-syncable?role=${role}&state=${state}`);
            console.log('setSyncable response:', res);
            if (!res.data?.success) {
                console.error('getRoles: unexpected response structure', res.data);
                throw new Error('getRoles: unexpected response structure', res.data);
            }
        } catch (err) {
            console.error('getRoles error:', err);
            throw err;
        }
    }
};
