<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import Tree from 'primevue/tree';
import { GroupService } from '@/service/GroupService';

const toast = useToast();
const confirm = useConfirm();

const groups = ref([]);
const isDialogVisible = ref(false);
const isCreateMode = ref(false);
const editingGroup = reactive({
    _id: '',
    title: '',
    priority: 0,
    permissions: []
});
const permissionsTree = ref([]);
const permissionSelection = ref({});
const sortField = ref('priority');
const sortOrder = ref(-1);

const notify = (severity, summary, detail) => {
    toast.add({ severity, summary, detail, life: 2000 });
};

// Рекурсивно мапим дерево прав из API в формат для PrimeVue Tree
function mapPermissionNodes(nodes) {
    return nodes.map((n) => ({
        key: n.key,
        label: n.displayName,
        children: n.children ? mapPermissionNodes(n.children) : []
    }));
}

// Собрать все ключи узлов дерева (для инициализации selection)
function flattenKeys(nodes) {
    let keys = [];
    for (let node of nodes) {
        keys.push(node.key);
        if (node.children && node.children.length) {
            keys = keys.concat(flattenKeys(node.children));
        }
    }
    return keys;
}

// Проверяет, выбрано ли право по маске (parent.*) для конкретного ключа
function hasParentNode(permissions, nodeKey) {
    return permissions.some(p => p.node === nodeKey ||
        (p.node.endsWith('.*') && nodeKey.startsWith(p.node.replace('.*', ''))));
}

// Устанавливает частичные флаги (для дерева)
function setPartialChecksFromTree(nodes) {
    for (const node of nodes) {
        const children = node.children || [];
        if (children.length > 0) {
            setPartialChecksFromTree(children);
            const childKeys = flattenKeys(children);
            const checked = childKeys.filter(k => permissionSelection.value[k]?.checked);
            if (checked.length > 0 && checked.length < childKeys.length) {
                // Некоторые дети выбраны
                permissionSelection.value[node.key].partialChecked = true;
            } else if (checked.length === childKeys.length) {
                // Все дети выбраны → отмечаем родителя
                permissionSelection.value[node.key].checked = true;
                permissionSelection.value[node.key].partialChecked = false;
            }
        }
    }
}

// Открыть диалог редактирования существующей группы
function openEditDialog(group) {
    isCreateMode.value = false;
    Object.assign(editingGroup, {
        _id: group._id,
        title: group.title,
        priority: group.priority,
        permissions: group.permissions || []
    });

    // Инициализируем дерево selection пустыми значениями
    permissionSelection.value = {};
    const allNodes = flattenKeys(permissionsTree.value);
    const permNodes = editingGroup.permissions.map(p => p.node);

    if (permNodes.includes('*')) {
        // Если есть глобальный доступ
        allNodes.forEach(nodeKey => {
            permissionSelection.value[nodeKey] = { checked: true, partialChecked: false };
        });
    } else {
        // Инициализируем checked по существующим правам
        allNodes.forEach(nodeKey => {
            const isSelected = hasParentNode(editingGroup.permissions, nodeKey);
            permissionSelection.value[nodeKey] = { checked: isSelected, partialChecked: false };
        });
        setPartialChecksFromTree(permissionsTree.value);
    }

    isDialogVisible.value = true;
}

// Открыть диалог создания новой группы
function openCreateDialog() {
    isCreateMode.value = true;
    // Сброс полей
    Object.assign(editingGroup, {
        _id: '',
        title: '',
        priority: 0,
        permissions: []
    });
    permissionSelection.value = {};
    // Инициализируем пустую selection: все права по умолчанию не выбраны
    const allNodes = flattenKeys(permissionsTree.value);
    allNodes.forEach(nodeKey => {
        permissionSelection.value[nodeKey] = { checked: false, partialChecked: false };
    });
    isDialogVisible.value = true;
}

// Обработчик изменения выбора в дереве прав
function onPermissionChange(event) {
    permissionSelection.value = event.selectionKeys;
}

// Сохраняем (редактирование или создание)
async function saveGroup() {
    // Собираем оптимизированный список прав
    const optimizedPermissions = [];
    const allSelectedKeys = Object.entries(permissionSelection.value)
        .filter(([key, value]) => value.checked)
        .map(([key]) => key);

    if (allSelectedKeys.includes('*')) {
        optimizedPermissions.push({ node: '*', context: '.*' });
    } else {
        const parentNodes = new Set();
        allSelectedKeys.forEach(key => {
            let isCovered = false;
            for (const parent of parentNodes) {
                if (key.startsWith(parent.replace('.*', ''))) {
                    isCovered = true;
                    break;
                }
            }
            if (!isCovered) {
                const isParent = allSelectedKeys.some(k => k !== key && k.startsWith(key.replace('.*', '')));
                if (isParent) {
                    parentNodes.add(key.endsWith('.*') ? key : key + '.*');
                } else {
                    parentNodes.add(key);
                }
            }
        });
        parentNodes.forEach(node => {
            optimizedPermissions.push({ node, context: '.*' });
        });
    }
    editingGroup.permissions = optimizedPermissions;

    try {
        if (isCreateMode.value) {
            // Создаём новую группу: API ожидает body { group: <id>, title: <title> }
            // При желании можно создавать сразу с правами, но бэкенд create принимает только name/title.
            // Поэтому сначала создаём группу, затем при желании сразу правим её через save (если нужно).
            if (!editingGroup._id || !editingGroup.title) {
                notify('warn', 'Внимание', 'Нужно указать ID и название группы');
                return;
            }
            await GroupService.createGroup({
                group: editingGroup._id,
                title: editingGroup.title
            });
            await GroupService.saveGroup({
                _id: editingGroup._id,
                title: editingGroup.title,
                priority: editingGroup.priority,
                permissions: editingGroup.permissions
            });
            notify('success', 'Сохранено', 'Группа создана');
        } else {
            await GroupService.saveGroup({
                _id: editingGroup._id,
                title: editingGroup.title,
                priority: editingGroup.priority,
                permissions: editingGroup.permissions
            });
            // Обновляем локальный список
            const idx = groups.value.findIndex((g) => g._id === editingGroup._id);
            if (idx > -1) {
                Object.assign(groups.value[idx], {
                    _id: editingGroup._id,
                    title: editingGroup.title,
                    priority: editingGroup.priority,
                    permissions: editingGroup.permissions
                });
            }
            notify('success', 'Сохранено', 'Группа обновлена');
        }
        isDialogVisible.value = false;
        // Перезагрузить список групп, чтобы увидеть актуальные данные (приоритеты, новые элементы и т.п.)
        await loadGroups();
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', isCreateMode.value ? 'Не удалось создать группу' : 'Не удалось сохранить группу');
    }
}

// Удаление группы
function confirmDelete(event, group) {
    confirm.require({
        target: event.currentTarget,
        message: `Вы уверены, что удалить «${group.title}»?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Удалить',
        rejectLabel: 'Отмена',
        acceptSeverity: 'danger',
        rejectSeverity: 'secondary',
        accept: async () => {
            try {
                await GroupService.deleteGroup(group._id);
                groups.value = groups.value.filter((g) => g._id !== group._id);
                notify('success', 'Успех', 'Группа удалена');
            } catch (err) {
                console.error(err);
                notify('error', 'Ошибка', 'Не удалось удалить группу');
            }
        }
    });
}

// Загрузка списка групп из API
async function loadGroups() {
    try {
        const data = await GroupService.getGroups();
        // Предполагаем, что API возвращает массив объектов вида { _id, title, priority, permissions }
        groups.value = data.sort((a, b) => b.priority - a.priority);
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось загрузить группы');
    }
}

// Загрузка дерева прав из API
async function loadPermissionsTree() {
    try {
        const tree = await GroupService.getPermissionsTree();
        // Предполагаем, что API возвращает объект-дерево: { key, displayName, children: [...] }
        permissionsTree.value = mapPermissionNodes([tree]);
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось загрузить список прав');
    }
}

// Сохранение порядка (при перетаскивании)
async function saveOrder() {
    const total = groups.value.length;
    groups.value.forEach((g, i) => (g.priority = total - i));
    try {
        // Сохраняем каждую группу
        await Promise.all(groups.value.map(g =>
            GroupService.saveGroup({
                _id: g._id,
                title: g.title,
                priority: g.priority,
                permissions: g.permissions || []
            })
        ));
        notify('success', 'Сохранено', 'Порядок групп обновлён');
        // Перезагрузить, чтобы убедиться, что всё согласовано с сервером
        await loadGroups();
    } catch (err) {
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
    await Promise.all([loadGroups(), loadPermissionsTree()]);
});
</script>

<template>
    <div class="card p-fluid">
        <Toast />
        <ConfirmDialog />

        <div class="mb-3" style="display: flex; justify-content: flex-end;">
            <Button
                label="Создать группу"
                icon="pi pi-plus"
                severity="success"
                @click="openCreateDialog"
            />
        </div>

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
            <Column rowReorder headerStyle="width:4rem" bodyStyle="text-align:center">
                <template #body="{ data }">
                    <div
                        draggable="true"
                        @dragstart="handleDragStart($event, data)"
                        @dragover="handleDragOver"
                        class="drag-handle"
                    >
                        <i class="pi pi-bars" title="Перетащите" />
                    </div>
                </template>
            </Column>

            <Column field="priority" header="Приоритет" sortable headerStyle="width:5rem" />
            <Column field="title" header="Название" sortable />
            <Column field="_id" header="ID" sortable />

            <Column header="Действия" bodyStyle="text-align:center; width:10rem">
                <template #body="{ data }">
                    <Button
                        icon="pi pi-pencil"
                        class="p-button-rounded p-button-text p-button-sm mr-2"
                        @click="openEditDialog(data)"
                    />
                    <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-text p-button-danger p-button-sm"
                        @click="confirmDelete($event, data)"
                    />
                </template>
            </Column>
        </DataTable>

        <Dialog
            v-model:visible="isDialogVisible"
            :header="isCreateMode ? 'Создать группу' : 'Редактировать группу'"
            modal
            :style="{ width: '450px' }"
            :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
            class="p-fluid"
        >
            <div class="formgrid grid">
                <div class="field col-12">
                    <div>
                        <label>ID</label>
                    </div>
                    <InputText
                        v-model="editingGroup._id"
                        :disabled="!isCreateMode"
                        placeholder="Название (напр. admins)"
                        class=""
                    />
                </div>
                <div class="field col-12 mt-5">
                    <div>
                        <label>Title</label>
                    </div>
                    <InputText
                        v-model="editingGroup.title"
                        placeholder="Введите название"
                        class=""
                    />
                </div>
                <div class="field col-12 mt-5 mb-5">
                    <label>Права</label>
                    <Tree
                        :value="permissionsTree"
                        dataKey="key"
                        selectionMode="checkbox"
                        v-model:selectionKeys="permissionSelection"
                        :propagateSelectionDown="true"
                        :propagateSelectionUp="true"
                        @selection-change="onPermissionChange"
                        class="permissions-tree"
                    />
                </div>
            </div>
            <template #footer>
                <Button
                    label="Отменить"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    @click="isDialogVisible = false"
                />
                <Button
                    :label="isCreateMode ? 'Создать' : 'Сохранить'"
                    icon="pi pi-check"
                    severity="primary"
                    @click="saveGroup"
                />
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
}
.drag-handle:hover {
    color: #495057;
}
.drag-handle:active {
    cursor: grabbing;
}

.permissions-tree {
    max-height: 300px;
    overflow: auto;
    margin-top: 0.5rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    padding: 0.75rem;
}

.permissions-tree .p-tree .p-treenode-children {
    margin-left: 1.5rem;
}

.permissions-tree .p-tree .p-treenode .p-treenode-content {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
}

.permissions-tree .p-tree .p-treenode-toggler {
    width: 1em;
    text-align: center;
    margin-right: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
}

.permissions-tree .p-tree .p-checkbox {
    margin-right: 0.5rem;
}

.permissions-tree .p-tree .p-treenode .p-treenode-content:hover {
    background: var(--surface-hover);
    border-radius: 4px;
}

:deep(.permissions-tree .p-tree .p-treenode .p-treenode-content.p-highlight) {
    background: var(--surface-card) !important;
}

:deep(.p-button) {
}

.mb-3 {
    margin-bottom: 1rem;
}
</style>
