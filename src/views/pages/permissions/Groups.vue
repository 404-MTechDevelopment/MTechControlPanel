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
const editingGroup = reactive({ _id: '', title: '', priority: 0, permissions: [] });
const permissionsTree = ref([]);
const permissionSelection = ref({});
const sortField = ref('priority');
const sortOrder = ref(-1);

const notify = (severity, summary, detail) => {
    toast.add({ severity, summary, detail, life: 2000 });
};

function mapPermissionNodes(nodes) {
    return nodes.map((n) => ({
        key: n.key,
        label: n.displayName,
        children: n.children ? mapPermissionNodes(n.children) : []
    }));
}

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

function hasParentNode(permissions, nodeKey) {
    return permissions.some(p => p.node === nodeKey ||
        (p.node.endsWith('.*') && nodeKey.startsWith(p.node.replace('.*', ''))));
}

async function loadGroups() {
    try {
        const data = await GroupService.getGroups();
        groups.value = data.sort((a, b) => b.priority - a.priority);
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось загрузить группы');
    }
}

async function loadPermissionsTree() {
    try {
        const tree = await GroupService.getPermissionsTree();
        permissionsTree.value = mapPermissionNodes([tree]);
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось загрузить список прав');
    }
}

async function saveOrder() {
    const total = groups.value.length;
    groups.value.forEach((g, i) => (g.priority = total - i));
    try {
        await Promise.all(groups.value.map(GroupService.saveGroup));
        notify('success', 'Сохранено', 'Порядок групп обновлён');
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

function markPartialChecks() {
    for (const key in permissionSelection.value) {
        if (permissionSelection.value[key].checked) continue;
        const childKeys = Object.keys(permissionSelection.value).filter(k => k.startsWith(key + '.'));
        const checkedChildren = childKeys.filter(k => permissionSelection.value[k]?.checked);
        if (checkedChildren.length > 0) {
            permissionSelection.value[key].partialChecked = true;
        }
    }
}

function setPartialChecksFromTree(nodes) {
    for (const node of nodes) {
        const children = node.children || [];

        if (children.length > 0) {
            setPartialChecksFromTree(children);

            const childKeys = flattenKeys(children);
            const checked = childKeys.filter(k => permissionSelection.value[k]?.checked);
            if (checked.length > 0 && checked.length < childKeys.length) {
                permissionSelection.value[node.key].partialChecked = true;
            } else if (checked.length === childKeys.length) {
                permissionSelection.value[node.key].checked = true;
                permissionSelection.value[node.key].partialChecked = false;
            }
        }
    }
}

function openEditDialog(group) {
    Object.assign(editingGroup, {
        _id: group._id,
        title: group.title,
        priority: group.priority,
        permissions: group.permissions || []
    });

    permissionSelection.value = {};

    const allNodes = flattenKeys(permissionsTree.value);
    const permNodes = editingGroup.permissions.map(p => p.node);

    if (permNodes.includes('*')) {
        allNodes.forEach(nodeKey => {
            permissionSelection.value[nodeKey] = { checked: true, partialChecked: false };
        });
    } else {
        allNodes.forEach(nodeKey => {
            const isSelected = hasParentNode(editingGroup.permissions, nodeKey);
            permissionSelection.value[nodeKey] = { checked: isSelected, partialChecked: false };
        });
        setPartialChecksFromTree(permissionsTree.value);
    }

    isDialogVisible.value = true;
}

function onPermissionChange(event) {
    permissionSelection.value = event.selectionKeys;
}

async function saveGroup() {
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
        await GroupService.saveGroup({ ...editingGroup });
        const idx = groups.value.findIndex((g) => g._id === editingGroup._id);
        if (idx > -1) {
            Object.assign(groups.value[idx], editingGroup);
        }
        notify('success', 'Сохранено', 'Группа обновлена');
        isDialogVisible.value = false;
    } catch (err) {
        console.error(err);
        notify('error', 'Ошибка', 'Не удалось сохранить группу');
    }
}

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

onMounted(async () => {
    await Promise.all([loadGroups(), loadPermissionsTree()]);
});
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

            <Column header="Действия" bodyStyle="text-align:center; width:8rem">
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
            header="Редактировать группу"
            modal
            :style="{ width: '450px' }"
            :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
            class="p-fluid"
        >
            <div class="formgrid grid">
                <div class="field col-12">
                    <label>ID группы</label>
                    <InputText v-model="editingGroup._id" disabled class="mt-2" />
                </div>
                <div class="field col-12">
                    <label>Название группы</label>
                    <InputText v-model="editingGroup.title" placeholder="Введите название" class="mt-2" />
                </div>
                <div class="field col-12">
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
                    label="Сохранить"
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
    border-radius: 50%;
}
</style>
