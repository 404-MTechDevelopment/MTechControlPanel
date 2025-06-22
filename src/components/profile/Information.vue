<template>
    <div class="main-blocks">
        <div class="main-block-1">
            <div class="identify">
                <div class="edit-all">
                    <i class="pi pi-pencil" @click="toggleAllEdit" />
                    <div v-if="allEditing" class="edit-actions">
                        <i class="pi pi-sync" @click="resetAll" title="Сбросить изменения" />
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-user" />
                    <div class="id_id-text">
                        <p class="id-text">Никнейм игрока:</p>
                        <p class="id">{{ nickname }}</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-key" />
                    <div class="id_id-text">
                        <p class="id-text">UUID игрока:</p>
                        <p class="id">{{ userInfo?.uuid }}</p>
                    </div>
                </div>
                <div class="separator"></div>
                <div class="money-block">
                    <div class="info-block editable" v-for="item in editableFields" :key="item.key">
                        <i :class="item.icon" />
                        <div class="id_id-text value-section">
                            <p class="id-text">{{ item.label }}</p>
                            <div class="value-wrapper">
                                <template v-if="allEditing">
                                    <input v-model="editValues[item.key]" type="number" class="edit-input" placeholder="..." />
                                    <div class="buttons">
                                        <i class="pi pi-download" title="Установить это значение" @click="setToValue(item.key)" />
                                        <i class="pi pi-plus" title="Добавить к значению" @click="addToValue(item.key)" />
                                        <i class="pi pi-minus" title="Вычесть из значения" @click="subtractFromValue(item.key)" />
                                        <i class="pi pi-upload" title="Взять из значения в поле" @click="fromCurrent(item.key)" />
                                    </div>
                                </template>
                                <template v-else>
                                    <p class="id">{{ data[item.key] }}</p>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="main-block-2">
            <div class="down-main-blocks">
                <div class="info-block">
                    <i class="pi pi-user-plus" />
                    <div class="id_id-text">
                        <p class="id-text">Приглашён:</p>
                        <p v-if="invitedBy != null">{{ invitedBy }}</p>
                        <p v-else class="id">-</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-calendar-plus" />
                    <div class="id_id-text">
                        <p class="id-text">Дата регистрации:</p>
                        <p>{{ registerDate }}</p>
                    </div>
                </div>
            </div>

            <div class="separator"></div>

            <div class="info-block">
                <i :class="twoFaConnectStatus ? 'pi pi-verified' : 'pi pi-times-circle'" />
                <div class="id_id-text">
                    <p class="id-text">Статус 2FA:</p>
                    <p class="id">{{ twoFaConnectStatus ? 'Подключено' : 'Не подключено' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-megaphone" />
                <div class="id_id-text">
                    <p class="id-text">Статус форума:</p>
                    <p class="id">{{ forumStatus ? 'Забанен' : 'Не забанен' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-telegram" />
                <div class="id_id-text">
                    <p class="id-text">Телеграмм:</p>
                    <p class="id">{{ twoFaConnectStatus ? 'ID: ' + telegramId : 'Не подключен' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-discord" />
                <div class="id_id-text">
                    <p class="id-text">Дискорд:</p>
                    <p class="id">{{ discordConnectStatus ? 'ID: ' + discordID : 'Не подключен' }}</p>
                </div>
            </div>

            <div class="info-block">
                <i class="pi pi-envelope" />
                <div class="id_id-text">
                    <p class="id-text">Email адрес:</p>
                    <p class="id">{{ userInfo?.email ?? '-' }}</p>
                </div>
            </div>
        </div>
    </div>

    <InformationUserGroups />
    <UserHistory />
</template>

<script setup>
import { ref, reactive, watchEffect } from 'vue';
import InformationUserGroups from '@/components/profile/InformationUserGroups.vue'
import UserHistory from '@/components/profile/UserHistory.vue'
import { useToast } from 'primevue/usetoast';
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getUserInfo } from '@/api/getUserInfo';

const route = useRoute()
const toast = useToast()

const nickname = computed(() => route.params.nickname || '')
const userInfo = ref(null)
watchEffect(async () => {
    if (!nickname.value) {
        userInfo.value = null
        return
    }
    try {
        userInfo.value = await getUserInfo(nickname.value)
    } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить данные пользователя' })
        userInfo.value = null
    }
})
function formatTimestamp(ms) {
    if (!ms) return '-'
    const d = new Date(ms)
    const pad = (n) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
const registerDate = computed(() => {
    return userInfo.value ? formatTimestamp(userInfo.value.registrationTimestamp) : '-'
})

const twoFaConnectStatus = true
const discordConnectStatus = false
const discordID = '2872177317829'
const forumStatus = false
const telegramId = '12763781'

const invitedBy = 'User123'

const data = reactive({
    depostit: -250,
    nahcoon_real: 350,
    nahcoin_fake: 1000,
    pohcoin: 420,
    cases: -7
})

const editValues = reactive({
    depostit: '',
    nahcoon_real: '',
    nahcoin_fake: '',
    pohcoin: '',
    cases: ''
})
const allEditing = ref(false)

const editableFields = [
    { key: 'depostit', label: 'Пополнено', icon: 'pi pi-credit-card' },
    { key: 'nahcoon_real', label: 'Нахкоины', icon: 'pi pi-id-card' },
    { key: 'nahcoin_fake', label: 'Дебетовые Нахкоины', icon: 'pi pi-money-bill' },
    { key: 'pohcoin', label: 'Похкоины', icon: 'pi pi-pound' },
    { key: 'cases', label: 'Кейсы', icon: 'pi pi-briefcase' }
]

function toggleAllEdit() {
    allEditing.value = !allEditing.value
    if (!allEditing.value) {
        Object.keys(editValues).forEach(k => editValues[k] = '')
    }
}

function setToValue(key) {
    const val = parseFloat(editValues[key])
    if (!isNaN(val)) {
        data[key] = val
        toast.add({ severity: 'success', summary: 'Установлено', detail: `Значение поля "${key}" установлено`, life: 3000 })
    } else {
        toast.add({ severity: 'warn', summary: 'Ошибка', detail: `Введите корректное число для "${key}"`, life: 3000 })
    }
}

function addToValue(key) {
    const val = parseFloat(editValues[key])
    if (!isNaN(val)) {
        data[key] += val
        toast.add({ severity: 'success', summary: 'Добавлено', detail: `К значению "${key}" добавлено ${val}`, life: 3000 })
    } else {
        toast.add({ severity: 'warn', summary: 'Ошибка', detail: `Введите корректное число для "${key}"`, life: 3000 })
    }
}

function subtractFromValue(key) {
    const val = parseFloat(editValues[key])
    if (!isNaN(val)) {
        data[key] -= val
        toast.add({ severity: 'success', summary: 'Вычтено', detail: `Из значения "${key}" вычтено ${val}`, life: 3000 })
    } else {
        toast.add({ severity: 'warn', summary: 'Ошибка', detail: `Введите корректное число для "${key}"`, life: 3000 })
    }
}

function fromCurrent(key) {
    editValues[key] = data[key]
    toast.add({ severity: 'info', summary: 'Скопировано', detail: `Текущее значение "${key}" вставлено в поле`, life: 3000 })
}

function clearField(key) {
    editValues[key] = ''
    toast.add({ severity: 'info', summary: 'Очищено', detail: `Поле "${key}" очищено`, life: 3000 })
}


function resetAll() {
    Object.keys(editValues).forEach(k => editValues[k] = '')
}

function saveAll() {
    Object.keys(editValues).forEach(k => {
        const val = parseFloat(editValues[k])
        if (!isNaN(val)) data[k] = val
    })
    allEditing.value = false
}
</script>

<style scoped lang="sass">
.separator
    height: 1px
    background-color: #4c4c4c
    margin: 15px 0

.main-blocks
    display: flex
    flex-direction: row
    justify-content: space-between
    width: 100%
    gap: 15px
    .main-block-1, .main-block-2
        width: 50%

.info-block
    display: flex
    flex-direction: row
    margin-bottom: 10px
    align-items: flex-start
    position: relative

    i
        margin-right: 10px
        padding: 6px
        background-color: #0e0e10
        font-size: 2rem
        border-radius: 10px

    .id-text
        margin: 0
        font-size: 14px
        font-weight: bold

    .id
        margin: 0
        font-size: 18.1855px
        color: #cccccc

.main-block-1, .main-block-2
    border: 1px solid #4c4c4c
    border-radius: 15px
    margin-top: 15px
    padding: 10px
    position: relative

@media (max-width: 1120px)
    .down-main-blocks
        flex-direction: column
        gap: 15px
    .main-blocks
        flex-direction: column
        gap: 15px
        .main-block-1, .main-block-2
            width: 100%

.editable
    .value-section
        align-items: center
        gap: 8px

    .value-wrapper
        display: flex
        align-items: center
        gap: 8px
        min-width: 180px
        max-height: 27.28px

        .buttons
            display: flex
            gap: 4px

            i
                font-size: 1.1rem
                color: #aaa
                cursor: pointer
                transition: 0.2s
                &:hover
                    color: #fff

.edit-input
    background-color: #0e0e10
    border: 1px solid #555
    padding: 4px 6px
    font-size: 13px
    color: #fff
    width: 80px

.edit-actions
    display: flex
    justify-content: flex-end
    gap: 10px
    margin-top: 10px

    i
        font-size: 1.2rem
        color: #bbb
        cursor: pointer
        transition: 0.2s
        &:hover
            color: #fff

.edit-all
    position: absolute
    top: 10px
    right: 10px
    z-index: 1
    i
        font-size: 1.4rem
        color: #bbb
        cursor: pointer
        transition: 0.2s
        &:hover
            color: #fff
</style>
