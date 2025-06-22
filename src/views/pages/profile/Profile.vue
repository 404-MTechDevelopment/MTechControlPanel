<template>
    <div class="card">
        <div v-if="loading" class="no-user">Загрузка...</div>
        <div v-else>
            <div v-if="userExists">
                <div class="player-info">
                    <img :src="headLink" alt="head" />
                    <h1 class="nickname">{{ nickname }}</h1>
                </div>

                <div class="separator"></div>

                <section class="navigation">
                    <button
                        :class="{ active: show === 'info' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: 'info' } })">
                        Информация
                    </button>
                    <button
                        :class="{ active: show === 'logs' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: 'logs' } })">
                        Логи
                    </button>
                    <button
                        :class="{ active: show === 'relations' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: 'relations' } })">
                        Связи
                    </button>
                    <button
                        :class="{ active: show === 'refs' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: 'refs' } })">
                        Рефералы
                    </button>
                    <button
                        :class="{ active: show === 'cart' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: 'cart' } })">
                        Корзина
                    </button>
                    <button
                        :class="{ active: show === 'vote' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: 'vote' } })">
                        Голосование
                    </button>
                    <button
                        :class="{ active: show === 'jira' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: 'jira' } })">
                        Jira
                    </button>
                    <button
                        :class="{ active: show === '2fa' }"
                        @click="$router.push({ name: 'profile', params: { nickname, tab: '2fa' } })">
                        2FA
                    </button>

                </section>

                <Information v-if="show === 'info'" />
                <Voting v-if="show === 'vote'" />
                <Jira v-if="show === 'jira'" />
                <TwoFactorAuth v-if="show === '2fa'" />
                <Logs v-if="show === 'logs'" />
                <Cart v-if="show === 'cart'" />
                <Referrals v-if="show === 'refs' || show === 'relations'" />
            </div>
            <div v-else class="no-user">Пользователь не найден</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import Information from '@/components/profile/Information.vue'
import Voting from '@/components/profile/Voting.vue'
import Jira from '@/components/profile/Jira.vue'
import TwoFactorAuth from '@/components/profile/2FA.vue'
import Logs from '@/components/profile/Logs.vue'
import Cart from '@/components/profile/Cart.vue'
import Referrals from '@/components/profile/Referal.vue'
import { getUserInfo } from '@/api/getUserInfo'
import { useToast } from 'primevue/usetoast'
import { getHeadLink } from '@/api/getHeadLink'
import { watch } from 'vue';

const route = useRoute()
const toast = useToast()

const nickname = computed(() => route.params.nickname || '')
const headLink = computed(() => getHeadLink(nickname.value))
const loading = ref(false)
const userExists = ref(false)
const userInfo = ref(null)

const show = ref(route.params.tab || 'info')

watch(() => route.params.tab, (newTab) => {
    show.value = newTab || 'info'
})

watchEffect(async () => {
    if (!nickname.value) {
        userExists.value = false
        userInfo.value = null
        loading.value = false
        return
    }
    loading.value = true
    try {
        const data = await getUserInfo(nickname.value)
        userInfo.value = data
        userExists.value = true
    } catch (e) {
        if (e.response?.data?.error === 'user not found') {
            toast.add({ severity: 'warn', summary: 'Пользователь не найден', detail: `Пользователь ${nickname.value} не найден` })
            userExists.value = false
            userInfo.value = null
        } else {
            toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось получить данные пользователя' })
            userExists.value = false
            userInfo.value = null
        }
    } finally {
        loading.value = false
    }
})
</script>

<style scoped lang="sass">
.card
    max-width: 100%
    padding: 10px
    box-sizing: border-box

.navigation
    display: flex
    flex-wrap: wrap
    gap: 8px
    background-color: #363639
    border-radius: 7px
    padding: 5px
    justify-content: center

    button
        flex: 1 1 auto
        min-width: 80px
        max-width: 140px
        padding: 8px 12px
        color: #afafaf
        background: transparent
        border: none
        cursor: pointer
        transition: color 0.3s, background-color 0.3s
        border-radius: 5px
        text-align: center

    button:hover
        color: #fff

    button.active
        color: #fff
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.78)
        background-color: #4c4c4c

    button.active:hover
        color: #fff
        background-color: #5c5c5c

.separator
    height: 2px
    background-color: #4c4c4c
    margin-bottom: 12px
    border-radius: 1px

@media (max-width: 600px)
    .navigation
        justify-content: center
        gap: 6px
    .navigation button
        flex: 1 1 45%
        min-width: auto
        max-width: none
        padding: 10px 0
        font-size: 0.9rem

.player-info
    display: flex
    align-items: center
    gap: 10px

    img
        border-radius: 25%

    .nickname
        font-size: 1.8rem
        word-break: break-word

.no-user
    font-size: 1.3rem
    color: #bbb
    height: 78vh
    display: flex
    align-items: center
    justify-content: center
    margin: 0 auto
</style>
