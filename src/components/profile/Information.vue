<template>
    <div class="main-blocks">
        <div class="main-block-1">
            <div class="identify">
                <div class="edit-all">
                    <Button icon="pi pi-pencil" severity="secondary" label="Edit" @click="showDialog = true" rounded />
                </div>
                <div class="info-block" v-for="item in staticInfo" :key="item.label">
                    <i :class="item.icon" />
                    <div class="id_id-text">
                        <p class="id-text">{{ item.label }}</p>
                        <p class="id">{{ item.value }}</p>
                    </div>
                </div>
                <div class="separator"></div>
                <div class="money-block">
                    <div class="info-block" v-for="item in editableFields" :key="item.key">
                        <i :class="item.icon" />
                        <div class="id_id-text">
                            <p class="id-text">{{ item.label }}</p>
                            <p class="id">
                                {{ hasFieldViewAccess(item.key) ? displayRawValue(item.key) : 'Нет доступа' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="main-block-2" style="display: flex; flex-direction: column; position: relative;">
            <div class="sync-block" style="align-self: flex-end; position: absolute;">
                <Button
                    icon="pi pi-sync"
                    severity="secondary"
                    label="Sync"
                    rounded
                    @click="sendSyncRequest(nickname)"
                />
            </div>
            <div class="info-block" v-for="item in extraInfo" :key="item.label">
                <i :class="item.icon" />
                <div class="id_id-text">
                    <p class="id-text">{{ item.label }}</p>
                    <p class="id">{{ item.value }}</p>
                </div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="showDialog" modal header="Редактирование баланса" class="edit-dialog" :style="{ width: '700px' }">
        <div v-for="item in editableFields" :key="item.key" class="dialog-row">
            <div class="dialog-label">
                <i :class="item.icon" />
                <span>{{ item.label }}</span>
            </div>
            <div class="dialog-controls">
                <InputNumber v-model="editValues[item.key]" :min="0" class="w-20rem" />
                <Button icon="pi pi-upload" @click="fromCurrent(item.key)" severity="secondary" rounded text title="Вставить текущее значение" />
                <Button icon="pi pi-download" @click="setToValue(item.key)" severity="success" rounded title="Установить указанное значение" />
                <Button icon="pi pi-plus" @click="addToValue(item.key)" severity="info" rounded title="Прибавить указанное значение" />
                <Button icon="pi pi-minus" @click="subtractFromValue(item.key)" severity="warning" rounded title="Вычесть указанное значение" />
            </div>
        </div>
        <template #footer>
            <Button label="Сбросить" icon="pi pi-refresh" @click="resetAll" text title="Очистить все поля" />
        </template>
    </Dialog>
    <InformationUserGroups />
    <UserHistory />
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import { getUserInfo } from '@/api/getUserInfo'
import config from '@/config/config.json'
import axios from 'axios'
import UserHistory from '@/components/profile/UserHistory.vue'
import InformationUserGroups from '@/components/profile/InformationUserGroups.vue'

const route = useRoute()
const toast = useToast()
const showDialog = ref(false)
const nickname = computed(() => route.params.nickname || '')
const userInfo = ref(null)
const depositStatic = 100

const data = reactive({
    money: 0,
    fakeMoney: 0,
    freeMoney: 0,
    freeCases: 0
})
const editValues = reactive({
    money: '',
    fakeMoney: '',
    freeMoney: '',
    freeCases: ''
})

const editableFields = [
    { key: 'money', label: 'Нахкоины', icon: 'pi pi-id-card' },
    { key: 'fakeMoney', label: 'Дебетовые Нахкоины', icon: 'pi pi-money-bill' },
    { key: 'freeMoney', label: 'Похкоины', icon: 'pi pi-pound' },
    { key: 'freeCases', label: 'Кейсы', icon: 'pi pi-briefcase' }
]

const staticInfo = computed(() => [
    { label: 'Никнейм игрока:', value: nickname.value, icon: 'pi pi-user' },
    { label: 'UUID игрока:', value: userInfo.value?.uuid || '-', icon: 'pi pi-key' },
    { label: 'ID форума игрока:', value: userInfo.value?.forumId || '-', icon: 'pi pi-key' },
    { label: 'Пополнено:', value: depositStatic, icon: 'pi pi-credit-card' }
])

const extraInfo = computed(() => {
    const res = []
    res.push({ label: 'Дата регистрации:', value: registerDate.value, icon: 'pi pi-calendar-plus' })

    if (userInfo.value?.twoFa?.access) {
        res.push({
            label: 'Статус 2FA:',
            value: userInfo.value.twoFa?.value?.type ? 'Подключено' : 'Не подключено',
            icon: userInfo.value.twoFa?.value?.type ? 'pi pi-verified' : 'pi pi-times-circle'
        })
        res.push({
            label: 'Телеграмм:',
            value: userInfo.value.twoFa?.value?.userId || 'Не подключен',
            icon: 'pi pi-telegram'
        })
    } else {
        res.push({ label: 'Статус 2FA:', value: 'Нет доступа', icon: 'pi pi-times-circle' })
        res.push({ label: 'Телеграмм:', value: 'Нет доступа', icon: 'pi pi-telegram' })
    }

    if (userInfo.value?.discord?.access) {
        res.push({
            label: 'Дискорд:',
            value: userInfo.value.discord?.value || 'Не подключен',
            icon: 'pi pi-discord'
        })
    } else {
        res.push({ label: 'Дискорд:', value: 'Нет доступа', icon: 'pi pi-discord' })
    }

    if (userInfo.value?.invitedBy?.access) {
        res.push({
            label: 'Кем приглашён:',
            value: userInfo.value.invitedBy?.value || 'Неизвестно',
            icon: 'pi pi-users'
        })
    } else {
        res.push({ label: 'Кем приглашён:', value: 'Нет доступа', icon: 'pi pi-users' })
    }


    if (userInfo.value?.email?.access) {
        res.push({
            label: 'Email адрес:',
            value: userInfo.value.email?.value,
            icon: 'pi pi-envelope'
        })
    } else {
        res.push({ label: 'Email адрес:', value: 'Нет доступа', icon: 'pi pi-envelope' })
    }

    return res
})

watchEffect(async () => {
    if (!nickname.value) {
        userInfo.value = null
        resetDataToDefaults()
        return
    }
    try {
        const info = await getUserInfo(nickname.value)
        userInfo.value = info
        if (info?.balance?.access && info.balance.value) Object.assign(data, info.balance.value)
        else resetDataToDefaults()
    } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить данные пользователя' })
        userInfo.value = null
        resetDataToDefaults()
    }
})

async function sendSyncRequest(targetNickname) {
    try {
        const response = await axios.get(`${config.baseURL}/sync/sync-user?username=${targetNickname}`)
        console.log(`${config.baseURL}/sync-user?username=${targetNickname}`)
        console.log(response)
        if (response.data?.success) {
            toast.add({ severity: 'success', summary: 'Синхронизация', detail: 'Успешно выполнена' })
            return true
        } else {
            toast.add({ severity: 'warn', summary: 'Синхронизация', detail: 'Не удалось синхронизировать' })
            return false
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Ошибка при синхронизации' })
        return false
    }
}

function resetDataToDefaults() {
    data.money = 0
    data.fakeMoney = 0
    data.freeMoney = 0
    data.freeCases = 0
}

const fieldTranslations = {
    money: 'Нахкоины',
    fakeMoney: 'Дебетовые Нахкоины',
    freeMoney: 'Похкоины',
    freeCases: 'Кейсы'
}

const registerDate = computed(() => {
    if (!userInfo.value?.registrationTimestamp) return '-'
    const d = new Date(userInfo.value.registrationTimestamp)
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
})

function hasFieldViewAccess(key) {
    if (['money', 'fakeMoney', 'freeMoney', 'freeCases'].includes(key)) return userInfo.value?.balance?.access === true
    if (key === 'email') return userInfo.value?.email?.access === true
    return true
}

function displayRawValue(key) {
    return data[key] ?? '-'
}

async function changeBalanceRemote(type, op, value) {
    if (!userInfo.value?.uuid) {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Нет информации о пользователе' })
        return false
    }
    try {
        const body = { target: nickname.value, type, operation: op, value }
        const r = await axios.post(`${config.baseURL}/admin/balance/change`, body)
        return r.data?.success
    } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось изменить баланс' })
        return false
    }
}

async function setToValue(k) {
    const v = parseFloat(editValues[k])
    if (isNaN(v)) return toast.add({ severity: 'warn', summary: 'Ошибка', detail: 'Введите число' })
    if (await changeBalanceRemote(k, '=', v)) {
        data[k] = v
        toast.add({ severity: 'success', summary: 'Баланс обновлён', detail: `${fieldTranslations[k]} теперь ровно ${v}` })
    }
}

async function addToValue(k) {
    const v = parseFloat(editValues[k])
    if (isNaN(v)) return toast.add({ severity: 'warn', summary: 'Ошибка', detail: 'Введите число' })
    if (await changeBalanceRemote(k, '+', v)) {
        data[k] += v
        toast.add({ severity: 'success', summary: 'Баланс изменён', detail: `${fieldTranslations[k]} увеличены на ${v}` })
    }
}

async function subtractFromValue(k) {
    const v = parseFloat(editValues[k])
    if (isNaN(v)) return toast.add({ severity: 'warn', summary: 'Ошибка', detail: 'Введите число' })
    if (await changeBalanceRemote(k, '-', v)) {
        data[k] -= v
        toast.add({ severity: 'success', summary: 'Баланс изменён', detail: `${fieldTranslations[k]} уменьшены на ${v}` })
    }
}

function fromCurrent(k) {
    editValues[k] = data[k]
    toast.add({ severity: 'info', summary: 'Скопировано', detail: `Текущее значение вставлено` })
}

function resetAll() {
    Object.keys(editValues).forEach((k) => (editValues[k] = ''))
}

function saveAll() {
    Object.keys(editValues).forEach(async (k) => {
        const v = parseFloat(editValues[k])
        if (!isNaN(v)) {
            if (await changeBalanceRemote(k, '=', v)) data[k] = v
        }
    })
    showDialog.value = false
}
</script>


<style scoped lang="sass">
.main-blocks
    display: flex
    flex-wrap: wrap
    gap: 15px
    margin-top: 15px

.main-block-1, .main-block-2
    flex: 1 1 48%
    border: 1px solid #4c4c4c
    border-radius: 15px
    padding: 15px
    position: relative

.separator
    height: 1px
    background-color: #444
    margin: 10px 0

.edit-all
    position: absolute
    top: 10px
    right: 10px

.info-block
    display: flex
    align-items: center
    gap: 12px
    margin-bottom: 10px

.info-block i
    font-size: 1.5rem
    background: #111
    padding: 6px
    border-radius: 8px

.id-text
    font-weight: bold
    margin: 0

.id
    margin: 0
    color: #ccc

.dialog-row
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 1rem

.dialog-label
    display: flex
    align-items: center
    gap: 10px
    font-weight: 600
    width: 35%

.dialog-controls
    display: flex
    align-items: center
    gap: 8px
</style>
