import axios from 'axios';
import config from '@/config/config.json';

export const GroupService = {
    // Получить все группы
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

    // Получить дерево прав
    async getPermissionsTree() {
        console.log('Fetching permissions tree from', `${config.baseURL}/permissions/tree`);
        try {
            const res = await axios.get(`${config.baseURL}/permissions/tree`);
            console.log('getPermissionsTree response:', res);
            return res.data;
        } catch (err) {
            console.error('getPermissionsTree error:', err);
            throw err;
        }
    },

    // Создать новую группу
    async createGroup(payload) {
        // payload: { group: 'id', title: 'Название' }
        console.log('Creating Group:', payload);
        try {
            const res = await axios.post(`${config.baseURL}/groups/create`, payload);
            console.log('createGroup response:', res);
            if (res.data?.success) {
                return res.data;
            } else if (res.data?.error) {
                // если бэкенд возвращает { error: ... }
                console.error('createGroup: сервер вернул ошибку', res.data);
                throw new Error(res.data.error || 'Unknown error on createGroup');
            } else {
                console.warn('createGroup: unexpected response structure', res.data);
                return res.data;
            }
        } catch (err) {
            console.error('createGroup error:', err);
            throw err;
        }
    },

    // Сохранить (редактировать) группу
    async saveGroup(group) {
        console.log('Saving Group:', group);
        try {
            const groupData = {
                _id: group._id,
                title: group.title,
                priority: group.priority || 0,
                permissions: group.permissions || [],
                forumGroupsLinked: group.forumGroupsLinked || [],
            };
            const res = await axios.post(`${config.baseURL}/groups/save`, { group: groupData });
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

    // Удалить группу
    async deleteGroup(groupId) {
        console.log('Deleting Group:', groupId);
        try {
            const res = await axios.post(`${config.baseURL}/groups/delete`, { group: groupId });
            console.log('deleteGroup response:', res);
            if (res.data?.success) {
                return res.data;
            } else if (res.data?.error) {
                console.error('deleteGroup: сервер вернул ошибку', res.data);
                throw new Error(res.data.error || 'Failed to delete group');
            } else {
                console.error('deleteGroup: unexpected response structure', res.data);
                throw new Error('Failed to delete group: unexpected response');
            }
        } catch (err) {
            console.error('deleteGroup error:', err);
            throw err;
        }
    }
};
