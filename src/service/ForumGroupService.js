import axios from 'axios';
import config from '@/config/config.json';
import { console } from 'vuedraggable/src/util/console';

export const ForumGroupService = {
    async getGroups() {
        console.log('Getting Groups from', config.baseURL + '/forum/groups/get');
        try {
            const res = await axios.get(`${config.baseURL}/forum/groups/get`);
            console.log('getGroups response:', res);
            if (res.data?.success && Array.isArray(res.data.groups)) {
                return res.data.groups;
            } else {
                console.error('getGroups: unexpected response structure', res.data);
                return [];
            }
        } catch (err) {
            console.error('getGroups error:', err);
            throw err;
        }
    },


    async saveAll(groupsData) {
        console.log('Saving Groups:');
        console.log(groupsData)
        try {
            const res = await axios.post(`${config.baseURL}/forum/groups/save-all`, { groups: groupsData });
            console.log('saveGroup response:', res);
            if (res.data?.success) {
                return res.data;
            } else if (res.data?.error) {
                console.error('saveGroup: сервер вернул ошибку', res.data);
                throw new Error(res.data.error || 'Failed to save group');
            } else {
                console.warn('saveGroup: unexpected response structure', res.data);
                return res.data;
            }
        } catch (err) {
            console.error('saveGroup error:', err);
            throw err;
        }
    },
};
