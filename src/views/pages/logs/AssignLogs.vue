<template>
    <div class="card">
        <div class="title">Логи назначений и снятий</div>
        <DataTable
            :value="logs"
            :paginator="true"
            :rows="15"
            dataKey="id"
            :rowHover="true"
            v-model:filters="filters"
            filterDisplay="menu"
            :loading="loading"
            :globalFilterFields="['admin', 'target', 'role', 'server', 'reason']"
            showGridlines
            class="custom-datatable"
        >
            <template #header>
                <div class="header-controls">
                    <IconField>
                        <InputIcon><i class="pi pi-search" /></InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Поиск по нику или роли" />
                    </IconField>
                    <Dropdown
                        v-model="filters.server.value"
                        :options="serverOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Фильтр по серверу"
                        class="server-dropdown"
                    />
                </div>
            </template>

            <template #empty>Нет логов.</template>
            <template #loading>Загрузка логов...</template>

            <Column field="timestamp" header="Время" style="width: 11rem">
                <template #body="{ data }">{{ formatDateOneLine(data.timestamp) }}</template>
            </Column>

            <Column field="type" header="Действие" style="min-width: 8rem">
                <template #body="{ data }">
                    <div
                        class="action-cell"
                        :class="data.type === 'assign' ? 'assign' : 'remove'"
                    >
                        <i :class="data.type === 'assign' ? 'pi pi-plus-circle' : 'pi pi-minus-circle'"></i>
                        {{ data.type === 'assign' ? 'Назначение' : 'Снятие' }}
                    </div>
                </template>
            </Column>

            <Column field="admin" header="Кто" style="min-width: 8rem">
                <template #body="{ data }">{{ data.admin }}</template>
            </Column>

            <Column field="target" header="Кому" style="min-width: 8rem">
                <template #body="{ data }">{{ data.target }}</template>
            </Column>

            <Column field="server" header="Сервер" style="min-width: 7rem">
                <template #body="{ data }">{{ data.server ?? 'Глобально' }}</template>
            </Column>

            <Column header="Что сделал" style="min-width: 28rem">
                <template #body="{ data }">
                    <div class="action-detail">
                        <div>
                            <span class="label">{{ data.type === 'assign' ? 'Выдал' : 'Снял' }} роль:</span>
                            <span class="role">{{ data.role }}</span>
                        </div>
                        <div>
                            <span class="label reason-label">Причина:</span>
                            <span class="reason">"{{ data.reason }}"</span>
                        </div>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'

const logs = ref([])
const loading = ref(true)

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    admin: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    target: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    server: { value: null, matchMode: FilterMatchMode.EQUALS }
})

const serverOptions = [
    { label: 'Все сервера', value: null },
    { label: 'Сервер 1', value: 'server1' },
    { label: 'Сервер 2', value: 'server2' },
    { label: 'Глобально', value: 'global' }
]

function resetFilters() {
    filters.value.global.value = null
    filters.value.admin.constraints[0].value = null
    filters.value.target.constraints[0].value = null
    filters.value.server.value = null
}

function formatDateOneLine(value) {
    const date = new Date(value)
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(',', '')
}

const testLogs = [
    {
        id: 1,
        timestamp: '2025-06-25T17:15:00Z',
        type: 'assign',
        admin: 'MrAdmin',
        target: 'PlayerOne',
        role: 'Модератор',
        server: 'server1',
        reason: 'Проявил активность и ответственность'
    },
    {
        id: 2,
        timestamp: '2025-06-24T12:40:00Z',
        type: 'remove',
        admin: 'SuperMod',
        target: 'ToxicGuy',
        role: 'Хелпер',
        server: 'server2',
        reason: 'Нарушение внутреннего регламента'
    },
    {
        id: 3,
        timestamp: '2025-06-23T20:00:00Z',
        type: 'assign',
        admin: 'Root',
        target: 'GoodAdmin',
        role: 'Администратор',
        server: null,
        reason: 'Переведен в глобальный состав'
    },
    {
        id: 4,
        timestamp: '2025-06-22T18:30:00Z',
        type: 'remove',
        admin: 'MrAdmin',
        target: 'LazyHelper',
        role: 'Хелпер',
        server: 'server1',
        reason: 'Плохая активность'
    },
    {
        id: 5,
        timestamp: '2025-06-21T10:10:00Z',
        type: 'assign',
        admin: 'MrAdmin',
        target: 'NewStaff',
        role: 'Хелпер',
        server: 'server2',
        reason: 'Прошел стажировку'
    }
]

onMounted(() => {
    logs.value = testLogs
    loading.value = false
})
</script>

<style scoped lang="scss">
.card {
    padding: 16px;
}

.title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.header-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.server-dropdown {
    width: 16rem;
}

.custom-datatable {
    font-size: 13.5px;
    line-height: 1.4;
}
:deep(.p-datatable) {
    table-layout: fixed;
    width: 100%;
}

:deep(.p-datatable-thead > tr > th),
:deep(.p-datatable-tbody > tr > td) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    line-height: 1.4rem;
}

.action-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
}

.action-cell.assign {
    color: #22c55e;
}

.action-cell.remove {
    color: #ef4444;
}

.action-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.label {
    font-weight: 600;
    margin-right: 4px;
}

.role {
    color: #6366f1;
    font-weight: 600;
}

.reason-label {
    color: #6b7280;
}

.reason {
    font-style: italic;
    color: #374151;
}
</style>
