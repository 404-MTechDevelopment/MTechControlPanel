<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { FilterMatchMode } from '@primevue/core/api';
import { getUserInfo } from '@/api/getUserInfo';
import { changeUser2FA, unlinkUser2FA, changeUserDiscord, unlinkUserDiscord } from '@/api/userConnectionsApi';

const toast = useToast();
const route = useRoute();
const nickname = computed(() => route.params.nickname || '');

const id = ref('');
const twoFaConnectStatus = ref(false);
const twoFaAccess = ref(false);

const discordId = ref('');
const discordConnectStatus = ref(false);
const discordAccess = ref(false);

const visible = ref(false);
const editField = ref<'telegram' | 'discord'>('telegram');
const editedId = ref('');
const error = ref('');

const history = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    maker: { value: null, matchMode: FilterMatchMode.CONTAINS },
    recipient: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.CONTAINS },
    value: { value: null, matchMode: FilterMatchMode.CONTAINS },
    date: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const target = typeof nickname.value === 'string' ? nickname.value : '';

onBeforeMount(async () => {
    history.value = [
        { date: '2025-06-20 12:34', maker: 'Admin1', recipient: target, type: 'Telegram', value: '127637', action: 'Привязан Телеграм ID "127637"' },
        { date: '2025-06-21 08:15', maker: 'Admin2', recipient: target, type: 'Telegram', value: '127637', action: 'Отвязали Телеграм ID "127637"' },
        { date: '2025-06-22 13:22', maker: 'Admin3', recipient: target, type: 'Telegram', value: '555888', action: 'Изменён Телеграм ID с "127637" на "555888"' },
        { date: '2025-06-20 14:00', maker: 'Admin4', recipient: target, type: 'Discord', value: '9988776655', action: 'Привязан Discord ID "9988776655"' }
    ];
    if (!target) return;
    try {
        const userInfo = await getUserInfo(target);
        if (userInfo.twoFa?.access) {
            twoFaAccess.value = true;
            if (userInfo.twoFa.value?.userId) {
                id.value = userInfo.twoFa.value.userId;
                twoFaConnectStatus.value = true;
            } else {
                id.value = '';
                twoFaConnectStatus.value = false;
            }
        } else {
            twoFaAccess.value = false;
            id.value = '';
            twoFaConnectStatus.value = false;
        }
        if (userInfo.discord?.access) {
            discordAccess.value = true;
            if (userInfo.discord?.value) {
                discordId.value = userInfo.discord?.value;
                discordConnectStatus.value = true;
            } else {
                discordId.value = '';
                discordConnectStatus.value = false;
            }
        } else {
            discordAccess.value = false;
            discordId.value = '';
            discordConnectStatus.value = false;
        }
    } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные пользователя', life: 3000 });
    }
});

function clearFilter() {
    Object.keys(filters.value).forEach(k => {
        filters.value[k].value = null;
    });
}

async function untie(field: 'telegram' | 'discord') {
    if ((field === 'telegram' && !id.value) || (field === 'discord' && !discordId.value)) {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: `Ошибка при отвязке ${field === 'telegram' ? 'Телеграм ID' : 'Discord ID'}`, life: 3000 });
        return;
    }
    try {
        const success = field === 'telegram' ? await unlinkUser2FA(target) : await unlinkUserDiscord(target);
        if (!success) {
            toast.add({ severity: 'error', summary: 'Ошибка', detail: `Не удалось отвязать ${field === 'telegram' ? 'Телеграм ID' : 'Discord ID'}`, life: 3000 });
            return;
        }
        addHistory({
            maker: 'CurrentAdmin',
            recipient: target,
            type: field === 'telegram' ? 'Telegram' : 'Discord',
            value: field === 'telegram' ? id.value : discordId.value,
            action: `Отвязали ${field === 'telegram' ? 'Телеграм' : 'Discord'} ID "${field === 'telegram' ? id.value : discordId.value}"`
        });
        toast.add({ severity: 'success', summary: 'Успешно', detail: `${field === 'telegram' ? 'Телеграм' : 'Discord'} ID успешно отвязан`, life: 3000 });
        if (field === 'telegram') {
            id.value = '';
            twoFaConnectStatus.value = false;
        } else {
            discordId.value = '';
            discordConnectStatus.value = false;
        }
    } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Неизвестная ошибка при отвязке', life: 3000 });
    }
}

function openEdit(field: 'telegram' | 'discord') {
    editField.value = field;
    editedId.value = field === 'telegram' ? id.value : discordId.value;
    error.value = '';
    visible.value = true;
}

async function saveEdit() {
    if (!/^\d+$/.test(editedId.value)) {
        error.value = 'ID должен содержать только цифры';
        toast.add({ severity: 'error', summary: 'Ошибка', detail: error.value, life: 3000 });
        return;
    }
    try {
        const success = editField.value === 'telegram'
            ? await changeUser2FA(target, 'telegram', editedId.value)
            : await changeUserDiscord(target, editedId.value);
        if (!success) {
            toast.add({ severity: 'error', summary: 'Ошибка', detail: `Не удалось изменить ${editField.value === 'telegram' ? 'Телеграм ID' : 'Discord ID'}`, life: 3000 });
            return;
        }
        addHistory({
            maker: 'CurrentAdmin',
            recipient: target,
            type: editField.value === 'telegram' ? 'Telegram' : 'Discord',
            value: editedId.value,
            action: `Изменён ${editField.value === 'telegram' ? 'Телеграм' : 'Discord'} ID с "${editField.value === 'telegram' ? id.value : discordId.value}" на "${editedId.value}"`
        });
        toast.add({ severity: 'success', summary: 'Успешно', detail: `${editField.value === 'telegram' ? 'Телеграм' : 'Discord'} ID успешно изменён на "${editedId.value}"`, life: 3000 });
        if (editField.value === 'telegram') {
            id.value = editedId.value;
            twoFaConnectStatus.value = true;
        } else {
            discordId.value = editedId.value;
            discordConnectStatus.value = true;
        }
        visible.value = false;
    } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Неизвестная ошибка', life: 3000 });
    }
}

function addHistory(entry: { maker: string; recipient: string; type: string; value: string; action: string }) {
    const dateStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    history.value.unshift({ date: dateStr, ...entry });
    if (history.value.length > 50) history.value.pop();
}
</script>

<template>
    <div class="main-block">
        <div class="id-block">
            <div class="text">
                <div class="info-block info-block-1">
                    <i class="pi pi-user"></i>
                    <div class="id_id-text">
                        <p class="id-text">Телеграм ID:</p>
                        <p class="id">{{ twoFaAccess ? (id || 'Не привязан') : 'Нет прав' }}</p>
                    </div>
                </div>
                <div class="info-block">
                    <i :class="twoFaConnectStatus ? 'pi pi-check-circle' : 'pi pi-times'"/>
                    <div class="id_id-text">
                        <p class="id-text">Статус 2FA:</p>
                        <p class="id">{{ twoFaAccess ? (twoFaConnectStatus ? 'Подключено' : 'Не подключено') : 'Нет прав' }}</p>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button :disabled="!twoFaAccess" class="btn-edit" @click="openEdit('telegram')">Редактировать</button>
                <button :disabled="!twoFaAccess" class="btn-untie" @click="untie('telegram')">Отвязать</button>
            </div>
        </div>

        <div class="id-block" style="margin-top: 20px;">
            <div class="text">
                <div class="info-block info-block-1">
                    <i class="pi pi-discord"></i>
                    <div class="id_id-text">
                        <p class="id-text">Discord ID:</p>
                        <p class="id">{{ discordAccess ? (discordId || 'Не привязан') : 'Нет прав' }}</p>
                    </div>
                </div>
                <div class="info-block">
                    <i :class="discordConnectStatus ? 'pi pi-check-circle' : 'pi pi-times'"/>
                    <div class="id_id-text">
                        <p class="id-text">Статус Discord:</p>
                        <p class="id">{{ discordAccess ? (discordConnectStatus ? 'Подключено' : 'Не подключено') : 'Нет прав' }}</p>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button :disabled="!discordAccess" class="btn-edit" @click="openEdit('discord')">Редактировать</button>
                <button :disabled="!discordAccess" class="btn-untie" @click="untie('discord')">Отвязать</button>
            </div>
        </div>

        <Dialog v-model:visible="visible" modal header="Редактировать ID" :style="{ width: '400px' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="dialog-body">
                <label for="idInput" class="label">ID</label>
                <input id="idInput" v-model="editedId" type="text" class="input" autocomplete="off" maxlength="20" placeholder="Введите новый ID" />
                <p v-if="error" class="error-text">{{ error }}</p>
                <div class="dialog-buttons">
                    <button class="btn primary" @click="saveEdit">Сохранить</button>
                    <button class="btn secondary" @click="() => (visible = false)">Отмена</button>
                </div>
            </div>
        </Dialog>
    </div>

    <div class="card mt-6">
        <h3 class="text-xl font-semibold mb-4">История изменений</h3>
        <DataTable
            :value="history"
            :paginator="true"
            :rows="5"
            :filters="filters"
            filterDisplay="menu"
            :globalFilterFields="['maker', 'recipient', 'type', 'value', 'date']"
            responsiveLayout="scroll"
        >
            <template #header>
                <div class="flex justify-between items-center gap-4">
                    <Button type="button" icon="pi pi-filter-slash" label="Очистить" outlined @click="clearFilter" />
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon"><i class="pi pi-search" /></span>
                        <InputText v-model="filters.global.value" style="margin-left: 10px" placeholder="Поиск по истории" />
                    </div>
                </div>
            </template>
            <template #empty>История пуста.</template>

            <Column field="maker" header="Кем сделано" sortable style="min-width: 150px">
                <template #body="{ data }">{{ data.maker }}</template>
            </Column>

            <Column field="recipient" header="Кому сделано" sortable style="min-width: 150px">
                <template #body="{ data }">{{ data.recipient }}</template>
            </Column>

            <Column field="type" header="Тип" sortable style="min-width: 120px">
                <template #body="{ data }">
                    <i v-if="data.type === 'Telegram'" class="pi pi-telegram" style="margin-right: 6px" />
                    <i v-else-if="data.type === 'Discord'" class="pi pi-discord" style="margin-right: 6px" />
                    {{ data.type }}
                </template>
            </Column>

            <Column field="value" header="Значение" sortable style="min-width: 150px">
                <template #body="{ data }">{{ data.value }}</template>
            </Column>

            <Column field="date" header="Дата" sortable style="min-width: 180px">
                <template #body="{ data }">{{ data.date }}</template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped lang="sass">
.main-block
    border: 1px solid #4c4c4c
    border-radius: 15px
    margin-top: 15px
    padding: 10px
    display: flex
    flex-direction: column
    gap: 15px
    max-width: 800px

.card
    border: 1px solid #4c4c4c
    border-radius: 15px
    padding: 20px
    color: #fff
    max-width: 800px
    margin-top: 20px

.info-block
    display: flex
    align-items: center
    gap: 15px

    i
        padding: 6px
        background-color: #0e0e10
        border-radius: 10px
        font-size: 2rem
        color: #708090

    .id-text
        margin: 0
        font-size: 14px
        font-weight: bold
        min-width: 90px

    .id
        margin: 0
        font-size: 13px
        color: #cccccc
        user-select: text

.buttons
    margin-left: auto
    display: flex
    gap: 10px

.btn-edit, .btn-untie
    background-color: transparent
    border-radius: 10px
    padding: 4px 10px
    font-weight: 600
    user-select: none
    border: 1px solid
    transition: all 0.2s ease-in-out

.btn-edit
    border-color: #708090
    color: #708090

    &:hover:not(:disabled)
        background-color: #708090
        color: #1c1b3a
    &:disabled
        opacity: 0.5
        cursor: default

.btn-untie
    border-color: #da1717
    color: #da1717

    &:hover:not(:disabled)
        background-color: #da2828
        color: #1c1b3a

    &:disabled
        opacity: 0.5
        cursor: default

.dialog-body
    display: flex
    flex-direction: column
    gap: 15px
    color: #ccc

.label
    font-weight: 700
    font-size: 14px

.input
    padding: 10px
    font-size: 16px
    border-radius: 10px
    border: 1px solid #444
    background-color: #1c1b3a
    color: #eee
    outline: none
    transition: border-color 0.2s ease-in-out

    &:focus
        border-color: #708090

.dialog-buttons
    display: flex
    justify-content: flex-end
    gap: 10px

.btn
    padding: 8px 15px
    border-radius: 10px
    border: none
    font-weight: 700
    cursor: pointer
    user-select: none
    transition: background-color 0.2s ease-in-out

    &.primary
        background-color: #3f51b5
        color: white

        &:hover
            background-color: #303f9f

    &.secondary
        background-color: #9e9e9e
        color: white

        &:hover
            background-color: #757575

.error-text
    color: #e53935
    font-size: 12px
    margin-top: -10px

.id-block
    display: flex

    .buttons
        display: flex
        flex-direction: column
        justify-items: center
        justify-content: center

.info-block-1
    margin-bottom: 10px

@media (max-width: 600px)
    .id-block
        flex-direction: column
        align-items: center

        .text
            .info-block
                .id_id-text
                    display: flex
                    gap: 10px

        .buttons
            margin-top: 10px
            margin-left: 0
            width: 90%

            .btn-edit, .btn-untie
                height: 40px
</style>
