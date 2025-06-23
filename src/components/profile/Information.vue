<template>
    <div class="main-blocks">
        <div class="main-block-1">
            <div class="identify">
                <div class="edit-all">
                    <i class="pi pi-pencil" @click="toggleAllEdit" />
                    <div v-if="allEditing" class="edit-actions">
                        <i class="pi pi-sync" @click="resetAll" title="Сбросить изменения" />
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-user" />
                    <div class="id_id-text">
                        <p class="id-text">Никнейм игрока:</p>
                        <p class="id">{{ nickname }}</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-key" />
                    <div class="id_id-text">
                        <p class="id-text">UUID игрока:</p>
                        <p class="id">{{ userInfo?.uuid }}</p>
                    </div>
                </div>
                <div class="separator"></div>
                <div class="money-block">
                    <div class="info-block editable" v-for="item in editableFields" :key="item.key">
                        <i :class="item.icon" />
                        <div class="id_id-text value-section">
                            <p class="id-text">{{ item.label }}</p>
                            <div class="value-wrapper">
                                <template v-if="allEditing">
                                    <input v-model="editValues[item.key]" type="number" class="edit-input" placeholder="..." />
                                    <div class="buttons">
                                        <i class="pi pi-download" title="Установить это значение" @click="setToValue(item.key)" />
                                        <i class="pi pi-plus" title="Добавить к значению" @click="addToValue(item.key)" />
                                        <i class="pi pi-minus" title="Вычесть из значения" @click="subtractFromValue(item.key)" />
                                        <i class="pi pi-upload" title="Взять из значения в поле" @click="fromCurrent(item.key)" />
                                    </div>
                                </template>
                                <template v-else>
                                    <p class="id">
                                        {{ hasFieldViewAccess(item.key) ? displayRawValue(item.key) : 'Нет доступа' }}
                                    </p>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="main-block-2">
            <div class="down-main-blocks">
                <div class="info-block">
                    <i class="pi pi-user-plus" />
                    <div class="id_id-text">
                        <p class="id-text">Приглашён:</p>
                        <p v-if="invitedBy != null">{{ invitedBy }}</p>
                        <p v-else class="id">-</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-calendar-plus" />
                    <div class="id_id-text">
                        <p class="id-text">Дата регистрации:</p>
                        <p>{{ registerDate }}</p>
                    </div>
                </div>
            </div>

            <div class="separator"></div>

            <div class="info-block">
                <i :class="twoFaConnectStatus ? 'pi pi-verified' : 'pi pi-times-circle'" />
                <div class="id_id-text">
                    <p class="id-text">Статус 2FA:</p>
                    <p class="id">{{ twoFaConnectStatus ? 'Подключено' : 'Не подключено' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-megaphone" />
                <div class="id_id-text">
                    <p class="id-text">Статус форума:</p>
                    <p class="id">{{ forumStatus ? 'Забанен' : 'Не забанен' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-telegram" />
                <div class="id_id-text">
                    <p class="id-text">Телеграмм:</p>
                    <p class="id">{{ twoFaConnectStatus ? 'ID: ' + telegramId : 'Не подключен' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-discord" />
                <div class="id_id-text">
                    <p class="id-text">Дискорд:</p>
                    <p class="id">{{ discordConnectStatus ? 'ID: ' + discordID : 'Не подключен' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-envelope" />
                <div class="id_id-text">
                    <p class="id-text">Email адрес:</p>
                    <p class="id">
                        {{ hasFieldViewAccess("email") ? userInfo.email.value : 'Нет доступа' }}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <InformationUserGroups />
    <UserHistory />
</template>

<script setup>
import { ref, reactive, watchEffect, computed } from 'vue';
import InformationUserGroups from '@/components/profile/InformationUserGroups.vue';
import UserHistory from '@/components/profile/UserHistory.vue';
import { useToast } from 'primevue/usetoast';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { getUserInfo } from '@/api/getUserInfo';
import config from '@/config/config.json';

const route = useRoute();
const toast = useToast();

const nickname = computed(() => route.params.nickname || '');
const userInfo = ref(null);

const data = reactive({
    depostit: 0,
    money: 0,
    fakeMoney: 0,
    freeMoney: 0,
    freeCases: 0
});

const editValues = reactive({
    depostit: '',
    money: '',
    fakeMoney: '',
    freeMoney: '',
    freeCases: ''
});
const allEditing = ref(false);

const editableFields = [
    { key: 'depostit', label: 'Пополнено', icon: 'pi pi-credit-card' },
    { key: 'money', label: 'Нахкоины', icon: 'pi pi-id-card' },
    { key: 'fakeMoney', label: 'Дебетовые Нахкоины', icon: 'pi pi-money-bill' },
    { key: 'freeMoney', label: 'Похкоины', icon: 'pi pi-pound' },
    { key: 'freeCases', label: 'Кейсы', icon: 'pi pi-briefcase' }
];

watchEffect(async () => {
    if (!nickname.value) {
        userInfo.value = null;
        resetDataToDefaults();
        return;
    }
    try {
        const info = await getUserInfo(nickname.value);
        userInfo.value = info;
        if (info && info.balance && info.balance.access && info.balance.value) {
            data.money = info.balance.value.money;
            data.fakeMoney = info.balance.value.fakeMoney;
            data.freeMoney = info.balance.value.freeMoney;
            data.freeCases = info.balance.value.freeCases;
        } else {
            data.money = 0;
            data.fakeMoney = 0;
            data.freeMoney = 0;
            data.freeCases = 0;
        }
        data.depostit = info?.depostit ?? 0;
    } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить данные пользователя' });
        userInfo.value = null;
        resetDataToDefaults();
    }
});

function resetDataToDefaults() {
    data.depostit = 0;
    data.money = 0;
    data.fakeMoney = 0;
    data.freeMoney = 0;
    data.cases = 0;
}

function formatTimestamp(ms) {
    if (!ms) return '-';
    const d = new Date(ms);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
const registerDate = computed(() => {
    return userInfo.value ? formatTimestamp(userInfo.value.registrationTimestamp) : '-';
});

const twoFaConnectStatus = true;
const discordConnectStatus = false;
const discordID = '2872177317829';
const forumStatus = false;
const telegramId = '12763781';
const invitedBy = 'User123';

function hasFieldViewAccess(key) {
    if (['money', 'fakeMoney', 'freeMoney', 'cases'].includes(key)) {
        return userInfo.value?.balance?.access === true;
    }
    if (key === 'email') {
        return userInfo.value?.email?.access === true;
    }
    return true;
}
function displayRawValue(key) {
    const val = data[key];
    return val != null ? val : '-';
}

// Общий вызов смены баланса на сервере
async function changeBalanceRemote(balanceType, operationType, value) {
    if (!userInfo.value?.uuid) {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Нет информации о пользователе' });
        return false;
    }
    try {
        const body = {
            target: nickname.value,
            type: balanceType,
            operation: operationType,
            value: value
        };
        const resp = await axios.post(`${config.baseURL}/admin/balance/change`, body);
        if (resp.status === 200 && resp.data?.success) {
            return true;
        } else {
            toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось изменить баланс' });
            return false;
        }
    } catch (err) {
        if (err.response && err.response.status === 403) {
            toast.add({ severity: 'error', summary: 'Нет прав', detail: 'Недостаточно прав для изменения баланса' });
        } else {
            console.error(err);
            toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Сетевая или серверная ошибка при изменении баланса' });
        }
        return false;
    }
}

function toggleAllEdit() {
    allEditing.value = !allEditing.value;
    if (!allEditing.value) {
        Object.keys(editValues).forEach(k => editValues[k] = '');
    }
}

async function setToValue(key) {
    const val = parseFloat(editValues[key]);
    if (isNaN(val)) {
        toast.add({ severity: 'warn', summary: 'Ошибка', detail: `Введите корректное число для "${key}"` });
        return;
    }
    const ok = await changeBalanceRemote(key, "=", val);
    if (ok) {
        data[key] = val;
        toast.add({ severity: 'success', summary: 'Успех', detail: `Значение "${key}" установлено` });
    }
}

async function addToValue(key) {
    const val = parseFloat(editValues[key]);
    if (isNaN(val)) {
        toast.add({ severity: 'warn', summary: 'Ошибка', detail: `Введите корректное число для "${key}"` });
        return;
    }
    const ok = await changeBalanceRemote(key, "+", val);
    if (ok) {
        data[key] += val;
        toast.add({ severity: 'success', summary: 'Успех', detail: `К "${key}" добавлено ${val}` });
    }
}

async function subtractFromValue(key) {
    const val = parseFloat(editValues[key]);
    if (isNaN(val)) {
        toast.add({ severity: 'warn', summary: 'Ошибка', detail: `Введите корректное число для "${key}"` });
        return;
    }
    const ok = await changeBalanceRemote(key, "-", val);
    if (ok) {
        data[key] -= val;
        toast.add({ severity: 'success', summary: 'Успех', detail: `Из "${key}" вычтено ${val}` });
    }
}

function fromCurrent(key) {
    editValues[key] = data[key];
    toast.add({ severity: 'info', summary: 'Скопировано', detail: `Текущее значение "${key}" вставлено в поле` });
}

function resetAll() {
    Object.keys(editValues).forEach(k => editValues[k] = '');
}

function saveAll() {
    // Сохраняем все через удалённые вызовы, если нужно:
    Object.keys(editValues).forEach(async (k) => {
        const val = parseFloat(editValues[k]);
        if (!isNaN(val)) {
            const ok = await changeBalanceRemote(k, "=", val);
            if (ok) data[k] = val;
        }
    });
    allEditing.value = false;
}
</script>

<style scoped lang="sass">
.separator
    height: 1px
    background-color: #4c4c4c
    margin: 15px 0

.main-blocks
    display: flex
    flex-direction: row
    justify-content: space-between
    width: 100%
    gap: 15px
    .main-block-1, .main-block-2
        width: 50%

.info-block
    display: flex
    flex-direction: row
    margin-bottom: 10px
    align-items: center
    position: relative

    i
        margin-right: 10px
        padding: 6px
        background-color: #0e0e10
        font-size: 2rem
        border-radius: 10px

    .id-text
        margin: 0
        font-size: 14px
        font-weight: bold

    .id
        margin: 0
        font-size: 18.1855px
        color: #cccccc

.main-block-1, .main-block-2
    border: 1px solid #4c4c4c
    border-radius: 15px
    margin-top: 15px
    padding: 10px
    position: relative

@media (max-width: 1120px)
    .down-main-blocks
        flex-direction: column
        gap: 15px
    .main-blocks
        flex-direction: column
        gap: 15px
        .main-block-1, .main-block-2
            width: 100%

.editable
    .value-section
        align-items: center
        gap: 8px

    .value-wrapper
        display: flex
        align-items: center
        gap: 8px
        min-width: 180px
        max-height: 27.28px

        .buttons
            display: flex
            gap: 4px

            i
                font-size: 1.1rem
                color: #aaa
                cursor: pointer
                transition: 0.2s
                &:hover
                    color: #fff

.edit-input
    background-color: #0e0e10
    border: 1px solid #555
    padding: 4px 6px
    font-size: 13px
    color: #fff
    width: 80px

.edit-actions
    display: flex
    justify-content: flex-end
    gap: 10px
    margin-top: 10px

    i
        font-size: 1.2rem
        color: #bbb
        cursor: pointer
        transition: 0.2s
        &:hover
            color: #fff

.edit-all
    position: absolute
    top: 10px
    right: 10px
    z-index: 1
    i
        font-size: 1.4rem
        color: #bbb
        cursor: pointer
        transition: 0.2s
        &:hover
            color: #fff
</style>
