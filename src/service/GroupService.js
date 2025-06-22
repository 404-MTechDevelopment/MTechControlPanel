import axios from 'axios';
import config from '@/config/config.json';

export const GroupService = {
    async getGroups() {
        console.log('Getting Groups from', config.baseURL + '/groups/get');
        try {
            const res = await axios.post(`${config.baseURL}/groups/get`);
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

    async saveGroup(group) {
        console.log('Saving Group:', group);
        try {
            // Ensure all required fields are present
            const groupData = {
                _id: group._id,
                title: group.title,
                priority: group.priority || 0,
                permissions: group.permissions || []
            };

            const res = await axios.post(`${config.baseURL}/groups/save`, { group: groupData });
            console.log('saveGroup response:', res);
            return res.data;
        } catch (err) {
            console.error('saveGroup error:', err);
            throw err;
        }
    },

    async deleteGroup(groupId) {
        console.log('Deleting Group:', groupId);
        try {
            const res = await axios.post(`${config.baseURL}/groups/delete`, { group: groupId });
            console.log('deleteGroup response:', res);
            if (res.data?.success) {
                return res.data;
            } else {
                console.error('deleteGroup: unexpected response structure', res.data);
                throw new Error('Failed to delete group');
            }
        } catch (err) {
            console.error('deleteGroup error:', err);
            throw err;
        }
    }
};

