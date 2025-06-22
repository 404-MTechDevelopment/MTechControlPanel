<template>
    <div class="card">
        <div class="player-info">
            <img src="https://mcskill.net/MineCraft/?name=Sashaiolh&mode=5&fx=43&fy=43" alt="head">
            <h1 class="nickname">{{ nickname }}</h1>
        </div>
        <div class="separator"></div>
        <section class="navigation">
            <button
                :class="{ active: show === 'info' }"
                @click="show = 'info'"
            >Информация</button>
            <button
                :class="{ active: show === 'logs' }"
                @click="show = 'logs'"
            >Логи</button>
            <button
                :class="{ active: show === 'relations' }"
                @click="show = 'relations'"
            >Связи</button>
            <button
                :class="{ active: show === 'refs' }"
                @click="show = 'refs'"
            >Рефералы</button>
            <button
                :class="{ active: show === 'cart' }"
                @click="show = 'cart'"
            >Корзина</button>
            <button
                :class="{ active: show === 'vote' }"
                @click="show = 'vote'"
            >Голосование</button>
            <button
                :class="{ active: show === 'jira' }"
                @click="show = 'jira'"
            >Jira</button>
            <button
                :class="{ active: show === '2fa' }"
                @click="show = '2fa'"
            >2FA</button>
        </section>

        <Information v-if="show === 'info'" />
        <Voting v-if="show === 'vote'" />
        <Jira v-if="show === 'jira'" />
        <TwoFactorAuth v-if="show === '2fa'" />
        <Logs v-if="show === 'logs'" />
        <Cart v-if="show === 'cart'" />
        <Referrals v-if="show === 'refs'" />
        <Referrals v-if="show === 'relations'" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Information from '@/components/profile/Information.vue'
import Voting from '@/components/profile/Voting.vue'
import Jira from '@/components/profile/Jira.vue'
import TwoFactorAuth from '@/components/profile/2FA.vue'
import Logs from '@/components/profile/Logs.vue'
import Cart from '@/components/profile/Cart.vue'
import Referrals from '@/components/profile/Referal.vue'

const nickname = 'Sashaiolh'
const show = ref('info')
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
        background-color: #4a4a6a

    button.active
        color: #fff
        background-color: #5a5a8a

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


</style>
