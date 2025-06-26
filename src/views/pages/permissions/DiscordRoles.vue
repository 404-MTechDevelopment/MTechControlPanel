<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { DiscordRolesService } from '@/service/DiscordRolesService';

const toast = useToast();

const groups = ref([]);
const sortField = ref('');
const sortOrder = ref(-1);

const notify = (severity, summary, detail) => {
    toast.add({ severity, summary, detail, life: 2000 });
};

async function loadGroups() {
    try {
        const data = await DiscordRolesService.getRoles();
        groups.value = data.sort((a, b) => b.priority - a.priority);
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось загрузить группы');
    }
}

onMounted(async () => {
    await Promise.all([loadGroups()]);
});

</script>

<template>
    <div class="card p-fluid">
        <Toast />
        <ConfirmDialog />

        <DataTable :value="groups" dataKey="_id" :sortField="sortField" :sortOrder="sortOrder" sortMode="single" @row-reorder="onRowReorder" responsiveLayout="scroll" class="p-datatable-sm">

            <Column field="_id" header="ID" />
            <Column field="name" header="Название" />
            <Column field="priority" header="Приоритет" sortable />

            <Column header="Синхронизация" bodyStyle="text-align:center; width:10rem">
                <template #body="{ data }">
                    <ToggleSwitch v-model="switchValue" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
</style>
