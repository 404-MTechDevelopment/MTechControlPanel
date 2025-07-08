<template>
    <div class="card">
        <div class="info-block">
            <i class="pi pi-users" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
            <div class="id_id-text">
                <p class="id-text">Назначение пользователей</p>
            </div>
        </div>

        <div class="search-server-section">
            <div class="search-container">
                <div class="search-input-wrapper">
                    <i class="pi pi-search search-icon"></i>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Поиск пользователей..."
                        class="search-input"
                        :disabled="!selectedServer"
                        @input="searchUsers"
                        @focus="isFocused = true"
                        @blur="handleBlur"
                    />
                    <div v-if="showSearchDropdown && searchResults.length" class="search-results-dropdown">
                        <div v-for="user in searchResults" :key="user.uuid" class="search-result-item" @click="selectUserForAssignment(user)">
                            <div class="user-info">
                                <div class="user-avatar">
                                    <img style="border-radius: 25%" :src="getHeadLink(user.username)" alt="User Avatar" class="user-avatar" />
                                </div>
                                <div class="user-details">
                                    <span class="user-name">{{ user.username }}</span>
                                    <span class="user-email">{{ user.email }}</span>
                                </div>
                            </div>
                            <i class="pi pi-plus-circle assign-icon"></i>
                        </div>
                    </div>
                    <div v-else-if="!searchLoading && searchQuery.length !== 0 && isFocused" class="search-results-dropdown">
                        <div class="search-result-item no-results">
                            <i class="pi pi-exclamation-triangle"></i>
                            <span class="not-found">Пользователи не найдены</span>
                        </div>
                    </div>
                    <div v-if="searchLoading" class="search-loading">
                        <i class="pi pi-spin pi-spinner"></i>
                        <span>Поиск...</span>
                    </div>
                </div>
            </div>

            <div class="server-selection">
                <select
                    v-model="selectedServer"
                    class="server-dropdown"
                    @change="onServerChange"
                >
                    <option disabled value="">Выберите сервер</option>
                    <option value="global">Глобально</option>
                    <option v-for="server in servers" :key="server.id || server.value" :value="server.id || server.value">
                        {{ server.name }}
                    </option>
                </select>
            </div>
        </div>

        <div v-if="serverUsersLoading" class="loading-state">
            <div class="loading-spinner">
                <i class="pi pi-spin pi-spinner"></i>
            </div>
            <span>Загрузка пользователей сервера...</span>
        </div>

        <div v-else-if="selectedServer && selectedServer !== 'global'" class="server-users">
            <div class="section-header">
                <div class="section-title">
                    <i class="pi pi-users"></i>
                    <span>Пользователи сервера {{ getServerName(selectedServer) }}</span>
                </div>
                <div class="users-count">{{ serverUsers.length }} пользователей</div>
            </div>

            <div v-if="serverUsers.length > 0" class="user-cards">
                <div
                    v-for="user in serverUsers"
                    :key="user.name"
                    class="user-card"
                >
                    <div class="user-header">
                        <div class="user-avatar">
                            <img style="border-radius: 25%" :src="getHeadLink(user.name)" alt="User Avatar" class="user-avatar" />
                        </div>
                        <div class="user-info">
                            <span class="user-name">{{ user.name }}</span>
                            <span class="user-status">
                                <i class="pi pi-shield"></i>
                                {{ user.groups?.length || 0 }} ролей
                            </span>
                        </div>
                        <button class="add-role-btn-header" @click="addRoleToUser(user)" title="Добавить роль">
                            <i class="pi pi-plus"></i>
                        </button>
                    </div>
                    <div class="user-roles-container">
                        <div v-if="user.groups && user.groups.length > 0" class="user-roles">
                            <span
                                v-for="(group, index) in user.groups"
                                :key="index"
                                class="role-tag"
                                @mouseover="hoverStates[`${user.name}-${index}`] = true"
                                @mouseleave="hoverStates[`${user.name}-${index}`] = false"
                                @click="removeRole(user.name, group.node)"
                                :title="`Приоритет: ${group.priority}`"
                            >
                                <i :class="hoverStates[`${user.name}-${index}`] ? 'pi pi-times' : 'pi pi-shield'"></i>
                                {{ group.node }}
                            </span>
                        </div>
                        <div v-else class="no-roles">
                            <i class="pi pi-info-circle"></i>
                            <span>Нет назначенных ролей</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="empty-state">
                <div class="empty-icon">
                    <i class="pi pi-users"></i>
                </div>
                <h3>Нет пользователей в составе</h3>
                <p>На сервере {{ getServerName(selectedServer) }} пока нет пользователей с назначенными ролями</p>
            </div>
        </div>

        <div v-else-if="!selectedServer" class="select-server-state">
            <div class="select-icon">
                <i class="pi pi-server"></i>
            </div>
            <h3>Выберите сервер</h3>
            <p>Для начала работы выберите сервер из списка выше</p>
        </div>

        <div v-else-if="selectedServer === 'global'" class="global-mode-state">
            <div class="global-icon">
                <i class="pi pi-globe"></i>
            </div>
            <h3>Глобальный режим</h3>
            <p>Используйте поиск для назначения глобальных ролей пользователям</p>
        </div>

        <div v-if="showAssignDialog" class="modal-overlay" @click="closeAssignDialog">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="pi pi-plus-circle"></i>
                        Назначить роль
                    </h3>
                    <button @click="closeAssignDialog" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
                <div class="assign-form">
                    <div class="form-group">
                        <label>Пользователь:</label>
                        <div class="selected-user">
                            <i class="pi pi-user"></i>
                            <span>{{ selectedUser?.username || selectedUser?.name }}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Роль:</label>
                        <select v-model="selectedRole" class="role-dropdown">
                            <option disabled value="">Выберите роль</option>
                            <option v-for="role in filteredAvailableRoles" :key="role.id" :value="role.id">
                                {{ role.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Причина:</label>
                        <textarea
                            v-model="assignReason"
                            rows="3"
                            placeholder="Укажите причину назначения..."
                            class="reason-textarea"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeAssignDialog" class="btn-secondary">
                        <i class="pi pi-times"></i>
                        Отмена
                    </button>
                    <button @click="assignRole" :disabled="!selectedRole || assignLoading" class="btn-primary">
                        <i v-if="assignLoading" class="pi pi-spin pi-spinner"></i>
                        <i v-else class="pi pi-check"></i>
                        Назначить
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showRemoveDialog" class="modal-overlay" @click="closeRemoveDialog">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="pi pi-minus-circle"></i>
                        Снять роль
                    </h3>
                    <button @click="closeRemoveDialog" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
                <div class="remove-form">
                    <div class="form-group">
                        <label>Пользователь:</label>
                        <div class="selected-user">
                            <i class="pi pi-user"></i>
                            <span>{{ removeData.userName }}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Роль:</label>
                        <div class="selected-role">
                            <i class="pi pi-shield"></i>
                            <span>{{ removeData.roleName }}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Причина:</label>
                        <textarea
                            v-model="removeReason"
                            rows="3"
                            placeholder="Укажите причину снятия роли..."
                            class="reason-textarea"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeRemoveDialog" class="btn-secondary">
                        <i class="pi pi-times"></i>
                        Отмена
                    </button>
                    <button @click="confirmRemoveRole" :disabled="removeLoading" class="btn-danger">
                        <i v-if="removeLoading" class="pi pi-spin pi-spinner"></i>
                        <i v-else class="pi pi-trash"></i>
                        Снять
                    </button>
                </div>
            </div>
        </div>

        <div class="toast-container">
            <div
                v-for="toast in toasts"
                :key="toast.id"
                :class="['toast', `toast-${toast.type}`]"
                @click="removeToast(toast.id)"
            >
                <i :class="getToastIcon(toast.type)"></i>
                <span>{{ toast.message }}</span>
                <i class="pi pi-times toast-close"></i>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';
import { getHeadLink } from '@/api/getHeadLink';

interface Server {
    id?: string;
    name?: string;
    value?: string;
}

interface User {
    name?: string;
    username?: string;
    uuid?: string;
    email?: string;
    groups?: Group[];
}

interface Group {
    node: string;
    context: string;
    priority: number;
}

interface Role {
    id: string;
    name: string;
}

interface Toast {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

const servers = ref<Server[]>([]);
const selectedServer = ref<string>('');
const searchQuery = ref<string>('');
const searchResults = ref<User[]>([]);
const serverUsers = ref<User[]>([]);
const availableRoles = ref<Role[]>([]);
const hoverStates = reactive<Record<string, boolean>>({});
const searchLoading = ref<boolean>(false);
const serverUsersLoading = ref<boolean>(false);
const assignLoading = ref<boolean>(false);
const removeLoading = ref<boolean>(false);
const isFocused = ref<boolean>(false);
const showSearchDropdown = ref<boolean>(false);
const toasts = ref<Toast[]>([]);
let toastId = 0;

const showAssignDialog = ref<boolean>(false);
const showRemoveDialog = ref<boolean>(false);
const selectedUser = ref<User | null>(null);
const selectedRole = ref<string>('');
const assignReason = ref<string>('');
const removeReason = ref<string>('');
const removeData = reactive({
    userName: '',
    roleName: ''
});

const filteredAvailableRoles = computed(() => {
    if (!selectedUser.value || !selectedUser.value.groups) {
        return availableRoles.value;
    }

    const userRoleIds = selectedUser.value.groups.map(group => group.node);
    return availableRoles.value.filter(role => !userRoleIds.includes(role.id));
});

const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const toast: Toast = {
        id: ++toastId,
        type,
        message
    };
    toasts.value.push(toast);

    setTimeout(() => {
        removeToast(toast.id);
    }, 5000);
};

const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
        toasts.value.splice(index, 1);
    }
};

const getToastIcon = (type: string): string => {
    switch (type) {
        case 'success': return 'pi pi-check-circle';
        case 'error': return 'pi pi-times-circle';
        case 'info': return 'pi pi-info-circle';
        default: return 'pi pi-info-circle';
    }
};

const fetchServers = async () => {
    try {
        const response = await axios.get('/api/servers/get');

        if (response.data.success) {
            const serverData = response.data.servers || response.data.result || response.data.data || [];

            if (Array.isArray(serverData)) {
                servers.value = serverData.map(server => {
                    if (typeof server === 'string') {
                        return { id: server, name: server, value: server };
                    }
                    return {
                        id: server.id || server.value || server.name,
                        name: server.name || server.id || server.value,
                        value: server.id || server.value || server.name
                    };
                });
            } else if (typeof serverData === 'object') {
                servers.value = Object.keys(serverData).map(key => ({
                    id: key,
                    name: serverData[key].name || serverData[key] || key,
                    value: key
                }));
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки серверов:', error);
        showToast('error', 'Ошибка загрузки серверов');
    }
};

const fetchServerUsers = async (serverId: string) => {
    serverUsersLoading.value = true;
    try {
        const response = await axios.get(`/api/crew/get-server-users?server=${serverId}`);

        if (response.data.success) {
            serverUsers.value = response.data.users || [];
        } else {
            serverUsers.value = [];
        }
    } catch (error) {
        serverUsers.value = [];
        showToast('error', 'Ошибка загрузки пользователей сервера');
    } finally {
        serverUsersLoading.value = false;
    }
};

const fetchAvailableRoles = async (serverId?: string) => {
    try {
        let url = '/api/groups/get-available-for-assign';
        if (serverId && serverId !== 'global') {
            url += `?server=${serverId}`;
        }

        const response = await axios.get(url);
        if (response.data.success) {
            const groups = response.data.groups || response.data.roles || [];
            availableRoles.value = groups.map(group => ({
                id: group._id || group.id,
                name: group.title || group.name
            }));
        }
    } catch (error) {
        console.error('Ошибка загрузки доступных ролей:', error);
        showToast('error', 'Ошибка загрузки доступных ролей');
    }
};

const searchUsers = useDebounceFn(async () => {
    if (!searchQuery.value.trim() || !selectedServer.value) {
        searchResults.value = [];
        showSearchDropdown.value = false;
        return;
    }

    searchLoading.value = true;
    try {
        const response = await axios.post('/api/users/search', { query: searchQuery.value });
        if (response.data.success && Array.isArray(response.data.result)) {
            searchResults.value = response.data.result.slice(0, 50);
            showSearchDropdown.value = searchResults.value.length > 0;
        } else {
            searchResults.value = [];
            showSearchDropdown.value = false;
        }
    } catch (error) {
        searchResults.value = [];
        showSearchDropdown.value = false;
        showToast('error', 'Ошибка поиска пользователей');
    }
    searchLoading.value = false;
}, 300);

const handleBlur = () => {
    setTimeout(() => {
        isFocused.value = false;
        showSearchDropdown.value = false;
    }, 200);
};

const onServerChange = () => {
    searchQuery.value = '';
    searchResults.value = [];
    showSearchDropdown.value = false;

    fetchAvailableRoles(selectedServer.value);

    if (selectedServer.value && selectedServer.value !== 'global') {
        fetchServerUsers(selectedServer.value);
    } else {
        serverUsers.value = [];
    }
};

const selectUserForAssignment = async (user: User) => {
    try {
        if (selectedServer.value !== 'global') {
            const response = await axios.get(`/api/crew/get-server-users?server=${selectedServer.value}`);
            if (response.data.success) {
                const serverUser = response.data.users?.find(u => u.name === user.username);
                if (serverUser) {
                    selectedUser.value = { ...user, groups: serverUser.groups };
                } else {
                    selectedUser.value = { ...user, groups: [] };
                }
            } else {
                selectedUser.value = { ...user, groups: [] };
            }
        } else {
            selectedUser.value = { ...user, groups: [] };
        }
    } catch (error) {
        selectedUser.value = { ...user, groups: [] };
    }

    selectedRole.value = '';
    assignReason.value = '';
    showAssignDialog.value = true;
    showSearchDropdown.value = false;
};

const addRoleToUser = (user: User) => {
    selectedUser.value = { ...user, username: user.name };
    selectedRole.value = '';
    assignReason.value = '';
    showAssignDialog.value = true;
};

const removeRole = (userName: string, roleName: string) => {
    removeData.userName = userName;
    removeData.roleName = roleName;
    removeReason.value = '';
    showRemoveDialog.value = true;
};

const assignRole = async () => {
    if (!selectedUser.value || !selectedRole.value) return;

    assignLoading.value = true;
    try {
        const requestData: any = {
            action: 'assign',
            target: selectedUser.value.username || selectedUser.value.name,
            group: selectedRole.value,
            reason: assignReason.value
        };

        if (selectedServer.value === 'global') {
            requestData.serverKey = '*';
            console.log('Global assignment request:', requestData);
        } else {
            requestData.server = selectedServer.value;
        }

        const response = await axios.post('/api/crew/change-user-groups', requestData);

        if (response.data.success) {
            showToast('success', `Роль "${selectedRole.value}" успешно назначена пользователю ${selectedUser.value.username || selectedUser.value.name}`);
            closeAssignDialog();
            if (selectedServer.value !== 'global') {
                fetchServerUsers(selectedServer.value);
            }
        } else {
            showToast('error', 'Ошибка назначения роли');
        }
    } catch (error) {
        console.error('Ошибка назначения роли:', error);
        showToast('error', 'Ошибка назначения роли');
    } finally {
        assignLoading.value = false;
    }
};

const confirmRemoveRole = async () => {
    removeLoading.value = true;
    try {
        const requestData: any = {
            action: 'remove',
            target: removeData.userName,
            group: removeData.roleName,
            reason: removeReason.value
        };

        if (selectedServer.value === 'global') {
            requestData.serverKey = '*';
        } else {
            requestData.server = selectedServer.value;
        }

        const response = await axios.post('/api/crew/change-user-groups', requestData);

        if (response.data.success) {
            showToast('success', `Роль "${removeData.roleName}" успешно снята с пользователя ${removeData.userName}`);
            closeRemoveDialog();
            if (selectedServer.value !== 'global') {
                fetchServerUsers(selectedServer.value);
            }
        } else {
            showToast('error', 'Ошибка снятия роли');
        }
    } catch (error) {
        console.error('Ошибка снятия роли:', error);
        showToast('error', 'Ошибка снятия роли');
    } finally {
        removeLoading.value = false;
    }
};

const closeAssignDialog = () => {
    showAssignDialog.value = false;
    selectedUser.value = null;
    selectedRole.value = '';
    assignReason.value = '';
};

const closeRemoveDialog = () => {
    showRemoveDialog.value = false;
    removeData.userName = '';
    removeData.roleName = '';
    removeReason.value = '';
};

const getServerName = (serverId: string): string => {
    const server = servers.value.find(s => s.id === serverId || s.value === serverId);
    return server ? server.name || serverId : serverId;
};

onMounted(() => {
    fetchServers();
    fetchAvailableRoles();
});
</script>

<style scoped lang="sass">
.card
    border-radius: 15px
    margin-top: 15px
    padding: 20px
    display: flex
    flex-direction: column
    min-height: 81vh

.info-block
    display: flex
    flex-direction: row
    align-items: center
    margin-bottom: 20px

    i
        margin-right: 10px
        padding: 8px
        background: linear-gradient(135deg, #414a57 0%, #000000 100%)
        border-radius: 12px
        color: #ffffff

    .id-text
        margin: 0
        font-size: 25px
        font-weight: bold
        background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)
        -webkit-background-clip: text
        -webkit-text-fill-color: transparent
        background-clip: text

.search-server-section
    display: flex
    align-items: flex-start
    gap: 20px
    margin-bottom: 20px

    @media (max-width: 768px)
        flex-direction: column
        gap: 15px

.search-container
    flex: 1
    position: relative

.search-input-wrapper
    position: relative
    display: flex
    align-items: center

.search-icon
    position: absolute
    left: 12px
    color: #708090
    z-index: 1

.search-input
    width: 100%
    height: 48px
    padding: 12px 12px 12px 40px
    border: 1px solid #4c4c4c
    border-radius: 12px
    background: linear-gradient(135deg, #414a57 0%, #000000 100%)
    color: #ffffff
    font-size: 16px
    transition: all 0.3s ease

    &:focus
        outline: none
        border-color: #708090
        box-shadow: 0 0 0 3px rgba(112, 128, 144, 0.2), 0 0 20px rgba(112, 128, 144, 0.1)

    &:disabled
        opacity: 0.5
        cursor: not-allowed

.search-loading
    position: absolute
    top: 100%
    left: 0
    right: 0
    margin-top: 0.5rem
    padding: 1rem
    background: linear-gradient(135deg, #414a57 0%, #000000 100%)
    border: 1px solid #575757
    border-radius: 12px
    display: flex
    align-items: center
    gap: 10px
    color: #708090
    z-index: 10
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)

.search-results-dropdown
    overflow-x: hidden
    position: absolute
    top: 100%
    left: 0
    right: 0
    margin-top: 0.5rem
    max-height: 400px
    overflow-y: auto
    background: linear-gradient(135deg, #414a57 0%, #000000 100%)
    border: 1px solid #575757
    border-radius: 12px
    z-index: 10

.search-result-item
    display: flex
    padding: 0.75rem 1rem
    cursor: pointer
    border-bottom: 1px solid #575757
    transition: all 0.3s ease
    align-items: center
    justify-content: space-between

    &:last-child
        border-bottom: none

    &:hover:not(.no-results)
        transform: translateX(5px)

    &.no-results
        cursor: default
        color: #666
        justify-content: center
        gap: 10px

    .user-info
        display: flex
        align-items: center
        gap: 12px

    .user-avatar
        width: 40px
        height: 40px
        border-radius: 50%
        display: flex
        align-items: center
        justify-content: center
        color: #ffffff

    .user-details
        display: flex
        flex-direction: column

    .user-name
        font-weight: 600
        font-size: 16px

    .user-email
        color: #999
        font-size: 14px

    .assign-icon
        color: #4CAF50
        font-size: 20px
        transition: transform 0.2s

        &:hover
            transform: scale(1.2)

.server-selection
    min-width: 250px
    display: flex
    flex-direction: column

    @media (max-width: 768px)
        min-width: 100%

.server-dropdown
    height: 48px
    padding: 12px 16px
    border: 1px solid #4c4c4c
    border-radius: 12px
    background: linear-gradient(135deg, #414a57 0%, #000000 100%)
    color: #ffffff
    font-size: 16px
    transition: all 0.3s ease

    &:focus
        outline: none
        border-color: #708090
        box-shadow: 0 0 0 3px rgba(112, 128, 144, 0.2)

    option
        background-color: #1a1a1a
        color: #ffffff

.loading-state, .empty-state, .select-server-state, .global-mode-state
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    padding: 60px 20px
    text-align: center
    color: #708090

    .loading-spinner
        margin-bottom: 20px

        i
            font-size: 3rem
            color: #708090

    i
        font-size: 4rem
        margin-bottom: 20px
        opacity: 0.7

    h3
        font-size: 1.5rem
        margin-bottom: 10px
        color: #ffffff

    p
        font-size: 1rem
        opacity: 0.8
        max-width: 400px

.server-users
    border: 1px solid #4c4c4c
    border-radius: 15px
    padding: 20px
    margin-bottom: 20px

.section-header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 20px
    padding-bottom: 15px
    border-bottom: 1px solid #4c4c4c

.section-title
    display: flex
    align-items: center
    gap: 10px
    font-size: 18px
    font-weight: 600
    color: #ffffff

    i
        color: #708090

.users-count
    background: linear-gradient(135deg, #414a57 0%, #000000 100%)
    color: #ffffff
    padding: 6px 12px
    border-radius: 20px
    font-size: 14px
    font-weight: 500

.user-cards
    display: grid
    grid-template-columns: repeat(auto-fill, 320px)
    gap: 20px
    margin-top: 20px
    justify-content: center

    @media (max-width: 768px)
        grid-template-columns: 1fr
        gap: 15px

.user-card
    width: 320px
    height: 200px
    border: 1px solid #4c4c4c
    border-radius: 16px
    padding: 20px
    background: linear-gradient(135deg, #000000 0%, #000000 100%)
    transition: all 0.3s ease
    display: flex
    flex-direction: column
    position: relative
    overflow: hidden

    @media (max-width: 768px)
        width: 100%

    &::before
        content: ''
        position: absolute
        top: 0
        left: 0
        right: 0
        height: 3px
        background: linear-gradient(90deg, #708090, #4CAF50, #2196F3)
        opacity: 0
        transition: opacity 0.3s ease

    &:hover
        border-color: #708090
        transform: translateY(-5px)
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3)

        &::before
            opacity: 1

.user-header
    display: flex
    align-items: center
    gap: 15px
    margin-bottom: 15px

.user-avatar
    width: 50px
    height: 50px
    border-radius: 50%
    background: linear-gradient(135deg, #708090 0%, #5a6b7a 100%)
    display: flex
    align-items: center
    justify-content: center
    color: #ffffff
    flex-shrink: 0
    box-shadow: 0 4px 12px rgba(112, 128, 144, 0.3)

.user-info
    flex: 1

.user-name
    font-weight: 600
    font-size: 18px
    display: block
    margin-bottom: 4px
    color: #ffffff

.user-status
    color: #708090
    font-size: 14px
    display: flex
    align-items: center
    gap: 5px

.add-role-btn-header
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%)
    color: #ffffff
    border: none
    border-radius: 50%
    width: 32px
    height: 32px
    display: flex
    align-items: center
    justify-content: center
    cursor: pointer
    transition: all 0.3s ease
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3)

    &:hover
        transform: scale(1.1)
        box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4)

.user-roles-container
    flex: 1
    display: flex
    flex-direction: column

.user-roles
    display: flex
    flex-wrap: wrap
    gap: 8px
    flex: 1

.role-tag
    display: inline-flex
    align-items: center
    gap: 6px
    padding: 8px 14px
    border-radius: 20px
    font-size: 13px
    font-weight: 500
    cursor: pointer
    transition: all 0.3s ease
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)
    color: #000000
    border: 1px solid #e0e0e0
    white-space: nowrap
    height: 32px
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

    &:hover
        transform: scale(1.05) translateY(-2px)
        background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)

.no-roles
    display: flex
    align-items: center
    gap: 8px
    color: #666
    font-style: italic
    padding: 10px 0

.modal-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(0, 0, 0, 0.7)
    display: flex
    align-items: center
    justify-content: center
    z-index: 1000
    backdrop-filter: blur(5px)

.modal-content
    background: linear-gradient(135deg, #2f343e 0%, #000000 100%)
    border: 1px solid #4c4c4c
    border-radius: 16px
    width: 90%
    max-width: 500px
    max-height: 90vh
    overflow-y: auto
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5)

.modal-header
    display: flex
    justify-content: space-between
    align-items: center
    padding: 20px
    border-bottom: 1px solid #4c4c4c

    h3
        margin: 0
        color: #ffffff
        display: flex
        align-items: center
        gap: 10px

.close-btn
    background: none
    border: none
    color: #708090
    font-size: 18px
    cursor: pointer
    padding: 8px
    border-radius: 50%
    transition: all 0.3s ease

    &:hover
        color: #ffffff
        background-color: rgba(112, 128, 144, 0.2)

.assign-form, .remove-form
    padding: 20px
    display: flex
    flex-direction: column
    gap: 20px

.form-group
    display: flex
    flex-direction: column
    gap: 8px

    label
        font-weight: 600
        color: #ffffff
        font-size: 14px

.selected-user, .selected-role
    display: flex
    align-items: center
    gap: 10px
    padding: 12px 16px
    background: linear-gradient(135deg, #2b323a 0%, #000000 100%)
    border-radius: 10px
    border: 1px solid #4c4c4c
    font-weight: 500

.role-dropdown, .reason-textarea
    padding: 12px 16px
    background: linear-gradient(135deg, #2b323a 0%, #000000 100%)
    border: 1px solid #4c4c4c
    color: #ffffff
    border-radius: 10px
    font-size: 16px
    transition: all 0.3s ease

    &:focus
        outline: none
        border-color: #708090
        box-shadow: 0 0 0 3px rgba(112, 128, 144, 0.2)

    option
        background-color: #2a2a2a
        color: #ffffff

.reason-textarea
    resize: vertical
    min-height: 80px

.modal-footer
    display: flex
    justify-content: flex-end
    gap: 12px
    padding: 20px
    border-top: 1px solid #4c4c4c

.btn-primary, .btn-secondary, .btn-danger
    padding: 12px 20px
    border-radius: 10px
    font-weight: 600
    cursor: pointer
    transition: all 0.3s ease
    display: flex
    align-items: center
    gap: 8px
    border: none

    &:disabled
        opacity: 0.5
        cursor: not-allowed

.btn-primary
    background: linear-gradient(135deg, #708090 0%, #5a6b7a 100%)
    color: #ffffff
    box-shadow: 0 4px 12px rgba(112, 128, 144, 0.3)

    &:hover:not(:disabled)
        transform: translateY(-2px)
        box-shadow: 0 6px 16px rgba(112, 128, 144, 0.4)

.btn-secondary
    background: transparent
    color: #708090
    border: 1px solid #4c4c4c

    &:hover
        background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)

.btn-danger
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%)
    color: #ffffff
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3)

    &:hover:not(:disabled)
        transform: translateY(-2px)
        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4)

.toast-container
    position: fixed
    top: 20px
    right: 20px
    z-index: 2000
    display: flex
    flex-direction: column
    gap: 10px

.toast
    display: flex
    align-items: center
    gap: 12px
    padding: 16px 20px
    border-radius: 12px
    min-width: 300px
    cursor: pointer
    transition: all 0.3s ease
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)
    backdrop-filter: blur(10px)

    &:hover
        transform: translateX(-5px)

.toast-success
    background: linear-gradient(135deg, #10b981 0%, #059669 100%)
    color: #ffffff

.toast-error
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%)
    color: #ffffff

.toast-info
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
    color: #ffffff

.toast-close
    margin-left: auto
    opacity: 0.7
    transition: opacity 0.3s ease

    &:hover
        opacity: 1
</style>

