<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const id = ref('127637');
const twoFaConnectStatus = ref(true);
const visible = ref(false);
const editedId = ref(id.value);
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

onBeforeMount(() => {
    history.value = [
        {
            date: '2025-06-20 12:34',
            maker: 'Admin1',
            recipient: 'User123',
            type: 'Telegram',
            value: '127637',
            action: 'Привязан Телеграм ID "127637"'
        },
        {
            date: '2025-06-21 08:15',
            maker: 'Admin2',
            recipient: 'User123',
            type: 'Telegram',
            value: '127637',
            action: 'Отвязали Телеграм ID "127637"'
        },
        {
            date: '2025-06-22 13:22',
            maker: 'Admin3',
            recipient: 'User123',
            type: 'Telegram',
            value: '555888',
            action: 'Изменён Телеграм ID с "127637" на "555888"'
        }
    ];
    editedId.value = id.value;
});

function clearFilter() {
    filters.value.global.value = null;
    filters.value.maker.value = null;
    filters.value.recipient.value = null;
    filters.value.type.value = null;
    filters.value.value.value = null;
    filters.value.date.value = null;
}

function untie() {
    if (!id.value) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Ошибка при отвязке Телеграм ID',
            life: 3000
        });
        return;
    }
    addHistory({
        maker: 'CurrentAdmin',
        recipient: 'User123',
        type: 'Telegram',
        value: id.value,
        action: `Отвязали Телеграм ID "${id.value}"`
    });
    toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: `Телеграм ID успешно отвязан`,
        life: 3000
    });
    id.value = '';
    twoFaConnectStatus.value = false;
}

function openEdit() {
    editedId.value = id.value;
    error.value = '';
    visible.value = true;
}

function saveEdit() {
    if (!/^\d+$/.test(editedId.value)) {
        error.value = 'ID должен содержать только цифры';
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: error.value,
            life: 3000
        });
        return;
    }
    addHistory({
        maker: 'CurrentAdmin',
        recipient: 'User123',
        type: 'Telegram',
        value: editedId.value,
        action: `Изменён Телеграм ID с "${id.value}" на "${editedId.value}"`
    });
    toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: `Телеграм ID успешно изменён на "${editedId.value}"`,
        life: 3000
    });
    id.value = editedId.value;
    visible.value = false;
}

function addHistory(entry: { maker: string; recipient: string; type: string; value: string; action: string }) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace('T', ' ');
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
                        <p class="id">{{ id || 'Не привязан' }}</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-verified"></i>
                    <div class="id_id-text">
                        <p class="id-text">Статус 2FA:</p>
                        <p v-if="twoFaConnectStatus" class="id">Подключено</p>
                        <p v-else class="id">Не подключено</p>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button class="btn-edit" @click="openEdit">Редактировать</button>
                <button class="btn-untie" @click="untie">Отвязать</button>
            </div>
        </div>

        <Dialog v-model:visible="visible" modal header="Редактировать Телеграм ID" :style="{ width: '400px' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="dialog-body">
                <label for="telegramIdInput" class="label">Телеграм ID</label>
                <input id="telegramIdInput" v-model="editedId" type="text" class="input" autocomplete="off" maxlength="20" placeholder="Введите новый Телеграм ID" />
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
        <DataTable :value="history" :paginator="true" :rows="5" :filters="filters" filterDisplay="menu" :globalFilterFields="['maker', 'recipient', 'type', 'value', 'date']" responsiveLayout="scroll">
            <template #header>
                <div class="flex justify-between items-center gap-4">
                    <Button type="button" icon="pi pi-filter-slash" label="Очистить" outlined @click="clearFilter" />
                    <IconField>
                        <InputIcon><i class="pi pi-search" /></InputIcon>
                        <InputText v-model="filters.global.value" placeholder="Поиск по истории" />
                    </IconField>
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
                    <i v-if="data.type === 'Telegram'" class="pi pi-telegram" style="margin-right: 6px"></i>
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
    cursor: pointer
    user-select: none
    border: 1px solid
    transition: all 0.2s ease-in-out

.btn-edit
    border-color: #708090
    color: #708090

    &:hover:not(:disabled)
        background-color: #708090
        color: #1c1b3a

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
