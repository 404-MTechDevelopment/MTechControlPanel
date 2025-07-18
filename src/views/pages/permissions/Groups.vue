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
import Dropdown from 'primevue/dropdown';
import { GroupService } from '@/service/GroupService';
import { ForumGroupService } from '@/service/ForumGroupService';
import { DiscordRolesService } from '@/service/DiscordRolesService';
import CustomMultiSelect from '@/components/CustomMultiSelect.vue';

const toast = useToast();
const confirm = useConfirm();

const groups = ref([]);
const isDialogVisible = ref(false);
const isCreateMode = ref(false);
const editingGroup = reactive({
    _id: '',
    title: '',
    type: 'server',
    priority: 0,
    permissions: [],
    forumGroupsLinked: [],
    discordGroupsLinked: [],
    displayOnSite: false,
});
const permissionsTree = ref([]);
const permissionSelection = ref({});
const sortField = ref('priority');
const sortOrder = ref(-1);
const forumGroupOptions = ref([]);
const discordRolesOptions = ref([]);

const typeOptions = [
    { label: 'Server', value: 'server' },
    { label: 'Global', value: 'global' }
];

const notify = (severity, summary, detail) => {
    toast.add({ severity, summary, detail, life: 2000 });
};

function mapPermissionNodes(nodes) {
    return nodes.map(n => ({
        key: n.key,
        label: n.displayName,
        children: n.children ? mapPermissionNodes(n.children) : []
    }));
}

function flattenKeys(nodes) {
    let keys = [];
    for (const node of nodes) {
        keys.push(node.key);
        if (node.children?.length) keys = keys.concat(flattenKeys(node.children));
    }
    return keys;
}

function hasParentNode(permissions, nodeKey) {
    return permissions.some(p =>
        p.node === nodeKey ||
        (p.node.endsWith('.*') && nodeKey.startsWith(p.node.replace('.*', '')))
    );
}

function setPartialChecksFromTree(nodes) {
    for (const node of nodes) {
        const children = node.children || [];
        if (children.length) {
            setPartialChecksFromTree(children);
            const childKeys = flattenKeys(children);
            const checked = childKeys.filter(k => permissionSelection.value[k]?.checked);
            if (checked.length && checked.length < childKeys.length) {
                permissionSelection.value[node.key].partialChecked = true;
            } else if (checked.length === childKeys.length) {
                permissionSelection.value[node.key].checked = true;
                permissionSelection.value[node.key].partialChecked = false;
            }
        }
    }
}

async function loadGroups() {
    try {
        const data = await GroupService.getGroups();
        groups.value = data.sort((a, b) => b.priority - a.priority);
    } catch {
        notify('error', 'Ошибка', 'Не удалось загрузить группы');
    }
}

async function loadPermissionsTree() {
    try {
        const tree = await GroupService.getPermissionsTree();
        permissionsTree.value = mapPermissionNodes([tree]);
    } catch {
        notify('error', 'Ошибка', 'Не удалось загрузить список прав');
    }
}

async function loadForumGroups() {
    try {
        const list = await ForumGroupService.getGroups();
        if (Array.isArray(list)) forumGroupOptions.value = list.sort((a, b) => b.priority - a.priority);
    } catch {
        notify('error', 'Ошибка', 'Не удалось загрузить список форумных групп');
    }
}

async function loadDiscordGroups() {
    try {
        const list = await DiscordRolesService.getRoles();
        if (Array.isArray(list)) {
            discordRolesOptions.value = list.filter(i => i.syncable).sort((a, b) => b.priority - a.priority);
        }
    } catch {
        notify('error', 'Ошибка', 'Не удалось загрузить список discord ролей');
    }
}

function openEditDialog(group) {
    isCreateMode.value = false;
    Object.assign(editingGroup, {
        _id: group._id,
        title: group.title,
        type: group.type || 'server',
        priority: group.priority,
        permissions: group.permissions || [],
        forumGroupsLinked: group.forumGroupsLinked || [],
        discordGroupsLinked: group.discordGroupsLinked || [],
        displayOnSite: group.displayOnSite || false,
    });
    permissionSelection.value = {};
    const allNodes = flattenKeys(permissionsTree.value);
    const permNodes = editingGroup.permissions.map(p => p.node);

    if (permNodes.includes('*')) {
        allNodes.forEach(k => (permissionSelection.value[k] = { checked: true, partialChecked: false }));
    } else {
        allNodes.forEach(k => {
            const isSelected = hasParentNode(editingGroup.permissions, k);
            permissionSelection.value[k] = { checked: isSelected, partialChecked: false };
        });
        setPartialChecksFromTree(permissionsTree.value);
    }

    editingGroup.forumGroupsLinked.forEach(id => {
        if (!forumGroupOptions.value.find(o => o._id === id)) forumGroupOptions.value.push({ _id: id, title: `Неизвестная (${id})`, priority: 0 });
    });
    editingGroup.discordGroupsLinked.forEach(id => {
        if (!discordRolesOptions.value.find(o => o._id === id)) discordRolesOptions.value.push({ _id: id, name: id, priority: 0 });
    });
    isDialogVisible.value = true;
}

function openCreateDialog() {
    isCreateMode.value = true;
    Object.assign(editingGroup, {
        _id: '',
        title: '',
        type: 'server',
        priority: 0,
        permissions: [],
        forumGroupsLinked: [],
        discordGroupsLinked: [],
        displayOnSite: false,
    });
    permissionSelection.value = {};
    flattenKeys(permissionsTree.value).forEach(k => (permissionSelection.value[k] = { checked: false, partialChecked: false }));
    isDialogVisible.value = true;
}

function onPermissionChange(event) {
    permissionSelection.value = event.selectionKeys;
}

async function saveGroup() {
    const optimizedPermissions = [];
    const allSelectedKeys = Object.entries(permissionSelection.value).filter(([_, v]) => v.checked).map(([k]) => k);
    if (allSelectedKeys.includes('*')) {
        optimizedPermissions.push({ node: '*', context: '.*' });
    } else {
        const parentNodes = new Set();
        allSelectedKeys.forEach(key => {
            let covered = false;
            for (const p of parentNodes) if (key.startsWith(p.replace('.*', ''))) covered = true;
            if (!covered) {
                const isParent = allSelectedKeys.some(k => k !== key && k.startsWith(key.replace('.*', '')));
                parentNodes.add(isParent ? (key.endsWith('.*') ? key : key + '.*') : key);
            }
        });
        parentNodes.forEach(node => optimizedPermissions.push({ node, context: '.*' }));
    }
    editingGroup.permissions = optimizedPermissions;
    if (!editingGroup._id || !editingGroup.title) {
        notify('warn', 'Внимание', 'Нужно указать ID и название группы');
        return;
    }
    try {
        if (isCreateMode.value) await GroupService.createGroup({ group: editingGroup._id, title: editingGroup.title });
        await GroupService.saveGroup({
            _id: editingGroup._id,
            title: editingGroup.title,
            type: editingGroup.type,
            priority: editingGroup.priority,
            permissions: editingGroup.permissions,
            forumGroupsLinked: editingGroup.forumGroupsLinked,
            discordGroupsLinked: editingGroup.discordGroupsLinked,
            displayOnSite: editingGroup.displayOnSite,
        });
        notify('success', 'Сохранено', isCreateMode.value ? 'Группа создана' : 'Группа обновлена');
        isDialogVisible.value = false;
        await loadGroups();
    } catch {
        notify('error', 'Ошибка', isCreateMode.value ? 'Не удалось создать группу' : 'Не удалось сохранить группу');
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
                groups.value = groups.value.filter(g => g._id !== group._id);
                notify('success', 'Успех', 'Группа удалена');
            } catch {
                notify('error', 'Ошибка', 'Не удалось удалить группу');
            }
        }
    });
}

async function saveOrder() {
    const total = groups.value.length;
    groups.value.forEach((g, i) => (g.priority = total - i));
    try {
        await Promise.all(groups.value.map(g => GroupService.saveGroup({
            _id: g._id,
            title: g.title,
            priority: g.priority,
            permissions: g.permissions || [],
            forumGroupsLinked: g.forumGroupsLinked || [],
            discordGroupsLinked: g.discordGroupsLinked || [],
            displayOnSite: g.displayOnSite || false,
            type: g.type || 'server'
        })));
        notify('success', 'Сохранено', 'Порядок групп обновлён');
        await loadGroups();
    } catch {
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

onMounted(() => Promise.all([loadGroups(), loadPermissionsTree(), loadForumGroups(), loadDiscordGroups()]));
</script>

<template>
    <div class="card p-fluid">
        <ConfirmDialog />

        <div class="mb-3" style="display:flex;justify-content:flex-end">
            <Button label="Создать группу" icon="pi pi-plus" severity="primary" @click="openCreateDialog" />
        </div>

        <DataTable :value="groups" dataKey="_id" :sortField="sortField" :sortOrder="sortOrder" sortMode="single" @row-reorder="onRowReorder" responsiveLayout="scroll" class="p-datatable-sm">
            <Column rowReorder headerStyle="width:4rem" bodyStyle="text-align:center">
                <template #body="{ data }">
                    <div draggable="true" @dragstart="handleDragStart($event, data)" @dragover="handleDragOver" class="drag-handle">
                        <i class="pi pi-bars" title="Перетащите" />
                    </div>
                </template>
            </Column>

            <Column field="priority" header="Приоритет" sortable headerStyle="width:5rem" />
            <Column field="title" header="Название" />
            <Column field="_id" header="ID" />
            <Column field="type" header="Тип" />
            <Column field="displayOnSite" header="Display" />
            <Column header="Действия" bodyStyle="text-align:center; width:10rem">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm mr-2" @click="openEditDialog(data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="confirmDelete($event, data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog
            v-model:visible="isDialogVisible"
            :header="isCreateMode ? 'Создать группу' : 'Редактировать группу'"
            modal
            :style="{ width: '500px' }"
            :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
            class="p-fluid rounded-3xl shadow-2xl"
        >
            <div class="formgrid grid gap-4">
                <div class="field col-12">
                    <label class="text-lg font-semibold text-gray-400 mb-2 block">ID</label>
                    <InputText v-model="editingGroup._id" :disabled="!isCreateMode" placeholder="Название (напр. admins)" class="p-inputtext-lg w-full" />
                </div>

                <div class="field col-12">
                    <label class="text-lg font-semibold text-gray-400 mb-2 block">Название</label>
                    <InputText v-model="editingGroup.title" placeholder="Введите название" class="p-inputtext-lg w-full" />
                </div>

                <div class="field col-12">
                    <label class="text-lg font-semibold text-gray-400 mb-2 block">Тип</label>
                    <Dropdown
                        v-model="editingGroup.type"
                        :options="typeOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                        placeholder="Выберите тип"
                    />
                </div>

                <div class="field col-12">
                    <label class="text-lg font-semibold text-gray-400 mb-2 block">Отображать на сайте?</label>
                    <Checkbox binary id="checkOption1" name="option" value="true" v-model="editingGroup.displayOnSite" />
                </div>

                <div class="field col-12">
                    <label class="text-lg font-semibold text-gray-400 mb-2 block">Права</label>
                    <Tree
                        :value="permissionsTree"
                        dataKey="key"
                        selectionMode="checkbox"
                        v-model:selectionKeys="permissionSelection"
                        :propagateSelectionDown="true"
                        :propagateSelectionUp="true"
                        @selection-change="onPermissionChange"
                        class="permissions-tree border border-gray-300 rounded-xl shadow-sm p-2"
                    />
                </div>

                <div class="field col-12">
                    <label class="text-lg font-semibold text-gray-400 mb-2 block">Форумные группы</label>
                    <CustomMultiSelect
                        v-model="editingGroup.forumGroupsLinked"
                        :options="forumGroupOptions"
                        optionLabel="title"
                        optionValue="_id"
                        placeholder="Выберите группы для привязки"
                        class="mytop"
                    />
                </div>

                <div class="field col-12">
                    <label class="text-lg font-semibold text-gray-400 mb-2 block">Discord-роли</label>
                    <CustomMultiSelect
                        v-model="editingGroup.discordGroupsLinked"
                        :options="discordRolesOptions"
                        optionLabel="name"
                        optionValue="_id"
                        placeholder="Выберите роли для привязки"
                        class="mytop"
                    />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3 mt-4">
                    <Button label="Отменить" icon="pi pi-times" severity="secondary" outlined class="p-button-lg" @click="isDialogVisible = false" />
                    <Button :label="isCreateMode ? 'Создать' : 'Сохранить'" icon="pi pi-check" severity="primary" class="p-button-lg" @click="saveGroup" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped lang="sass">
.drag-handle
    cursor: grab
    user-select: none
    padding: 0.5rem
    display: inline-block
.drag-handle:hover
    color: #495057
.drag-handle:active
    cursor: grabbing
.permissions-tree
    max-height: 300px
    overflow: auto
    margin-top: 0.5rem
    background: var(--surface-card)
    border: 1px solid var(--surface-border)
    border-radius: 6px
    padding: 0.75rem
.permissions-tree .p-tree .p-treenode-children
    margin-left: 1.5rem
.permissions-tree .p-tree .p-treenode .p-treenode-content
    display: flex
    align-items: center
    padding: 0.25rem 0.5rem
.permissions-tree .p-tree .p-treenode-toggler
    width: 1em
    text-align: center
    margin-right: 0.5rem
    font-size: 0.9rem
    cursor: pointer
.permissions-tree .p-tree .p-checkbox
    margin-right: 0.5rem
.permissions-tree .p-tree .p-treenode .p-treenode-content:hover
    background: var(--surface-hover)
    border-radius: 4px
:deep(.permissions-tree .p-tree .p-treenode .p-treenode-content.p-highlight)
    background: var(--surface-card) !important
.mb-3
    margin-bottom: 1rem
.mytop
    border: 1px solid var(--p-inputtext-border-color)
    border-radius: 6px
</style>
