<script setup>
import { CustomerService } from '@/service/CustomerService';
import { ProductService } from '@/service/ProductService';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { onBeforeMount, reactive, ref } from 'vue';
import { LogsService } from '@/service/LogsService';

const logs = ref([]); // Добавляем переменную для хранения логов
const loading1 = ref(true); // Инициализируем loading1 как true
const filters1 = ref(null);
const expandedRows = ref([]);

onBeforeMount(() => {
    // Загружаем логи вместо данных о клиентах
    LogsService.getUserLogs("asd")
        .then((data) => {
            logs.value = data;
            loading1.value = false;
        })
        .catch((error) => {
            console.error('Failed to load logs:', error);
            loading1.value = false;
        });

    initFilters1();
});

function initFilters1() {
    filters1.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        operation: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        admin: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        player: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        server: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        description: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] }
    };
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('ru-ru', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

const getBalanceTypeName = (key) => {
    if(key === "money") {
        return "NahCoins"
    }
    else if(key === "fakeMoney") {
        return "Debit NahCoins"
    }
    else if(key === "freeMoney") {
        return "PohCoins"
    }
    else if(key === "freeCases") {
        return "Cases"
    }
}

</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Логи игрока</div>
        <DataTable
            :value="logs"
            :paginator="true"
            :rows="19"
            dataKey="id"
            :rowHover="true"
            v-model:filters="filters1"
            filterDisplay="menu"
            :loading="loading1"
            :filters="filters1"
            :globalFilterFields="['operation', 'admin', 'player', 'server', 'description']"
            showGridlines
        >
            <template #header>
                <div class="flex justify-between">
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="initFilters1()" />
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters1['global'].value" placeholder="Keyword Search" />
                    </IconField>
                </div>
            </template>
            <template #empty> No logs found.</template>
            <template #loading> Loading logs data. Please wait.</template>

            <Column field="operation" header="Операция" style="min-width: 5rem">
                <template #body="{ data }">
                    {{ data.type }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by operation" />
                </template>
            </Column>

            <Column field="adminName" header="Админ" style="min-width: 5rem">
                <template #body="{ data }">
                    {{ data.adminName }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by admin" />
                </template>
            </Column>

            <Column field="player" header="Игрок" style="min-width: 5rem">
                <template #body="{ data }">
                    {{ data.targetName }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by player" />
                </template>
            </Column>

            <Column field="server" header="Сервер" style="min-width: 5rem">
                <template #body="{ data }">
                    {{ data.server != null ? data.server : "Глобально" }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by server" />
                </template>
            </Column>

            <Column field="description" header="Описание" style="min-width: 30rem">
                <template #body="{ data }">
                    <span v-if="data.type === 'wealth'">
                        <span v-if="data.operationType === '+'">
                            Добавил {{data.value}} {{getBalanceTypeName(data.balanceType)}} (<del>{{data.oldValue}}</del>)
                        </span>
                        <span v-else-if="data.operationType === '-'">
                            Отнял {{data.value}} {{getBalanceTypeName(data.balanceType)}} (<del>{{data.oldValue}}</del>)
                        </span>
                        <span v-else-if="data.operationType === '='">
                            Установил {{data.value}} {{getBalanceTypeName(data.balanceType)}} (<del>{{data.oldValue}}</del>)
                        </span>
                    </span>

                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by description" />
                </template>
            </Column>

            <Column field="date" header="Дата" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ formatDate(data.timestamp) }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by date" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
