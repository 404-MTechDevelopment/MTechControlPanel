<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { ForumGroupService } from '@/service/ForumGroupService';

const toast = useToast();

const groups = ref([]);
const sortField = ref('');
const sortOrder = ref(-1);

const notify = (severity, summary, detail) => {
    toast.add({ severity, summary, detail, life: 2000 });
};

async function loadGroups() {
    try {
        const data = await ForumGroupService.getGroups();
        groups.value = data.sort((a, b) => b.priority - a.priority);
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось загрузить группы');
    }
}

async function saveOrder() {
    const result = [];

    try {
        const total = groups.value.length;
        groups.value.forEach((g, i) => (g.priority = total - i));

        await Promise.all(
            groups.value.map((g) => {
                result.push(g);
            })
        );

        await ForumGroupService.saveAll(result);

        notify('success', 'Сохранено', 'Порядок групп обновлён');
        await loadGroups();
    }
    catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось сохранить порядок');
    }
}

function onRowReorder(event) {
    groups.value = event.value;
    saveOrder();
}

function handleDragStart(event, rowData) {
    event.dataTransfer.setData('text/plain', rowData._id);
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event) {
    event.preventDefault();
}

onMounted(async () => {
    await Promise.all([loadGroups()]);
});

const getEditGroupLink = (groupId) => `https://forum.nahon.top/admin/?app=core&module=members&controller=groups&do=form&id=${groupId}`
</script>

<template>
    <div class="card p-fluid">
        <Toast />
        <ConfirmDialog />

        <DataTable :value="groups" dataKey="_id" :sortField="sortField" :sortOrder="sortOrder" sortMode="single" @row-reorder="onRowReorder" responsiveLayout="scroll" class="p-datatable-sm">
            <Column rowReorder headerStyle="width:4rem" bodyStyle="text-align:center">
                <template #body="{ data }">
                    <div draggable="true" @dragstart="handleDragStart($event, data)" @dragover="handleDragOver" class="drag-handle">
                        <i class="pi pi-bars" title="Перетащите" />
                    </div>
                </template>
            </Column>

            <Column field="_id" header="ID" />
            <Column field="title" header="Название" />
            <Column field="priority" header="Приоритет" sortable />

            <Column header="Действия" bodyStyle="text-align:center; width:10rem">
                <template #body="{ data }">
                    <a target="_blank" :href="getEditGroupLink(data._id)"><Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm mr-2" /></a>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.drag-handle {
    cursor: grab;
    user-select: none;
    padding: 0.5rem;
    display: inline-block;
}
.drag-handle:hover {
    color: #495057;
}
.drag-handle:active {
    cursor: grabbing;
}
</style>
