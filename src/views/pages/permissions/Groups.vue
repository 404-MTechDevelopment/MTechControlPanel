<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { GroupService } from '@/service/GroupService';

const toast = useToast();
const confirm = useConfirm();
const groups = ref([]);
const isDialogVisible = ref(false);
const editingGroup = ref({ _id: '', title: '', priority: 0, permissions: [] });

// Default sorting state
const sortField = ref('priority');
const sortOrder = ref(-1);

onMounted(async () => {
    try {
        const data = await GroupService.getGroups();
        // Сортировка по убыванию приоритета по умолчанию
        groups.value = data.sort((a, b) => b.priority - a.priority);
    } catch (err) {
        console.error('Error loading groups:', err);
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить группы' });
    }
});

async function saveOrder() {
    const total = groups.value.length;
    groups.value.forEach((group, idx) => {
        group.priority = total - idx;
    });
    try {
        await Promise.all(groups.value.map(g => GroupService.saveGroup(g)));
        toast.add({ severity: 'success', summary: 'Сохранено', detail: 'Порядок групп обновлён', life: 2000 });
    } catch (err) {
        console.error('Error saving order:', err);
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить порядок' });
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

function openEditDialog(group) {
    editingGroup.value = {
        _id: group._id,
        title: group.title,
        priority: group.priority || 0,
        permissions: group.permissions || []
    };
    isDialogVisible.value = true;
}

async function saveGroup() {
    try {
        await GroupService.saveGroup({ ...editingGroup.value });
        const idx = groups.value.findIndex(g => g._id === editingGroup.value._id);
        if (idx !== -1) {
            groups.value[idx].title = editingGroup.value.title;
            groups.value[idx].priority = editingGroup.value.priority;
            groups.value[idx].permissions = editingGroup.value.permissions;
        }
        toast.add({ severity: 'success', summary: 'Сохранено', detail: 'Группа обновлена', life: 2000 });
        isDialogVisible.value = false;
    } catch (err) {
        console.error('Error saving group:', err);
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить группу' });
    }
}

async function confirmDelete(event, group) {
    confirm.require({
        target: event.currentTarget,
        message: `Вы уверены, что хотите удалить группу "${group.title}"?`,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Отмена',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Удалить',
            severity: 'danger'
        },
        accept: async () => {
            try {
                await GroupService.deleteGroup(group._id);
                groups.value = groups.value.filter(g => g._id !== group._id);
                toast.add({ severity: 'success', summary: 'Успех', detail: 'Группа удалена', life: 2000 });
            } catch (err) {
                console.error('Error deleting group:', err);
                toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить группу' });
            }
        },
        reject: () => {
            toast.add({ severity: 'info', summary: 'Отмена', detail: 'Удаление отменено', life: 2000 });
        }
    });
}
</script>

<template>
    <div class="card p-fluid">
        <Toast />
        <ConfirmDialog />

        <DataTable
            :value="groups"
            dataKey="_id"
            :sortField="sortField"
            :sortOrder="sortOrder"
            sortMode="single"
            @row-reorder="onRowReorder"
            responsiveLayout="scroll"
            class="p-datatable-sm"
        >
            <Column rowReorder header="Порядок" headerStyle="width: 4rem; min-width: 4rem" bodyStyle="text-align:center">
                <template #body="{ data }">
                    <div
                        draggable="true"
                        @dragstart="handleDragStart($event, data)"
                        @dragover="handleDragOver"
                        class="drag-handle"
                    >
                        <i class="pi pi-bars"></i>
                    </div>
                </template>
            </Column>

            <Column field="priority" header="Приоритет" sortable headerStyle="width: 5rem" />
            <Column field="title" header="Название" sortable />
            <Column field="_id" header="ID" sortable />
            <Column header="Действия" bodyStyle="text-align:center; width: 8rem">
                <template #body="{ data }">
                    <Button
                        icon="pi pi-pencil"
                        class="p-button-rounded p-button-text p-button-sm mr-2"
                        @click="openEditDialog(data)"
                        v-tooltip.top="'Редактировать группу'"
                    />
                    <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-text p-button-danger p-button-sm"
                        @click="confirmDelete($event, data)"
                        v-tooltip.top="'Удалить группу'"
                    />
                </template>
            </Column>
        </DataTable>

        <Dialog
            v-model:visible="isDialogVisible"
            header="Редактировать группу"
            modal
            :style="{ width: '450px' }"
            :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
            class="p-fluid"
        >
            <div class="formgrid grid">
                <div class="field col-12">
                    <label for="group-id" class="font-semibold text-900">ID группы</label>
                    <InputText
                        id="group-id"
                        v-model="editingGroup._id"
                        disabled
                        class="mt-2"
                    />
                </div>

                <div class="field col-12">
                    <label for="group-title" class="font-semibold text-900">Название группы</label>
                    <InputText
                        id="group-title"
                        v-model="editingGroup.title"
                        placeholder="Введите название группы"
                        class="mt-2"
                    />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-content-end gap-2">
                    <Button
                        label="Отменить"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        @click="isDialogVisible = false"
                    />
                    <Button
                        label="Сохранить"
                        icon="pi pi-check"
                        severity="primary"
                        @click="saveGroup"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.drag-handle {
    cursor: grab;
    user-select: none;
    padding: 0.5rem;
    display: inline-block;
    color: #6c757d;
    transition: color 0.2s;
}

.drag-handle:hover {
    color: #495057;
}

.drag-handle:active {
    cursor: grabbing;
}

.p-datatable-tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.02);
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.75rem 1rem;
    font-weight: 600;
}

:deep(.p-dialog .p-dialog-header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 6px 6px 0 0;
}

:deep(.p-dialog .p-dialog-header .p-dialog-title) {
    font-weight: 600;
    font-size: 1.1rem;
}

:deep(.p-dialog .p-dialog-content) {
    padding: 2rem;
    background: #ffffff;
}

:deep(.p-dialog .p-dialog-footer) {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-radius: 0 0 6px 6px;
}

/* Стили для полей формы */
.field {
    margin-bottom: 1.5rem;
}

.field:last-child {
    margin-bottom: 0;
}

.field label {
    display: block;
    margin-bottom: 0;
    color: #374151;
    font-size: 0.875rem;
}

:deep(.p-inputtext) {
    border-radius: 6px;
    border: 1px solid #d1d5db;
    padding: 0.75rem;
    font-size: 0.875rem;
    transition: all 0.2s;
}

:deep(.p-inputtext:enabled:focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.p-inputtext:disabled) {
    color: #6b7280;
}

/* Стили для кнопок */
:deep(.p-button) {
    border-radius: 6px;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    transition: all 0.2s;
}

:deep(.p-button-sm) {
    padding: 0.5rem;
    font-size: 0.875rem;
}

:deep(.p-button:enabled:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Анимация для тостов */
:deep(.p-toast .p-toast-message) {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

