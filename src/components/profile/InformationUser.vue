<template>
    <div class="main-blocks">
        <div class="main-block-1">
            <div class="identify">
                <div class="info-block">
                    <i class="pi pi-user" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                    <div class="id_id-text">
                        <p class="id-text">ID пользователя:</p>
                        <p class="id">{{ id }}</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-key" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                    <div class="id_id-text">
                        <p class="id-text">UUID пользователя:</p>
                        <p class="id">{{ uuid }}</p>
                    </div>
                </div>
                <div class="separator"></div>
                <div class="money-block">
                    <div class="info-block">
                        <i class="pi pi-id-card" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                        <div class="id_id-text">
                            <p class="id-text">Нахкоины:</p>
                            <p class="id">{{ nahcoon_real }}</p>
                        </div>
                    </div>
                    <div class="info-block">
                        <i class="pi pi-money-bill" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                        <div class="id_id-text">
                            <p class="id-text">Фейковые Нахкоины:</p>
                            <p class="id">{{ nahcoin_fake }}</p>
                        </div>
                    </div>
                    <div class="info-block">
                        <i class="pi pi-pound" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                        <div class="id_id-text">
                            <p class="id-text">Похкоины:</p>
                            <p class="id">{{ pohcoin }}</p>
                        </div>
                    </div>
                    <div class="info-block">
                        <i class="pi pi-briefcase" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                        <div class="id_id-text">
                            <p class="id-text">Кейсы:</p>
                            <p class="id">{{ cases }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="main-block-2">
            <div class="info-block">
                <i class="pi pi-verified" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                <div class="id_id-text">
                    <p class="id-text">Статус 2FA:</p>
                    <p v-if="twoFaConnectStatus" class="id">Подключено</p>
                    <p v-else class="id">Не подключено</p>
                </div>
            </div>
            <div class="info-block">
                <i class="pi pi-megaphone" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                <div class="id_id-text">
                    <p class="id-text">Статус форума:</p>
                    <p v-if="forumStatus" class="id">Забанен</p>
                    <p v-else class="id">Не забанен</p>
                </div>
            </div>
            <div class="info-block">
                <i class="pi pi-megaphone" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                <div class="id_id-text">
                    <p class="id-text">Телеграмм:</p>
                    <div v-if="twoFaConnectStatus" class="2-fa-connected">
                        <p class="id">ID: {{ telegramId }}</p>
                    </div>
                    <div v-else class="2-fa-not-connected">
                        <p class="id">Не подключен</p>
                    </div>
                </div>
            </div>
            <div class="info-block">
                <i class="pi pi-discord" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                <div class="id_id-text">
                    <p class="id-text">Дискорд:</p>
                    <div v-if="discordConnectStatus" class="discord-connected">
                        <p class="id">ID: {{ discordID }}</p>
                    </div>
                    <div v-else class="discord-not-connected">
                        <p class="id">Не подключен</p>
                    </div>
                </div>
            </div>
            <div class="info-block">
                <i class="pi pi-envelope" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                <div class="id_id-text">
                    <p class="id-text">Email адрес:</p>
                    <p v-if="emailAddress != null">{{emailAddress}}</p>
                    <p v-else class="id">-</p>
                </div>
            </div>
            <div class="separator"></div>
            <div class="down-main-blocks">
                <div class="info-block">
                    <i class="pi pi-share-alt" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                    <div class="id_id-text">
                        <p class="id-text">Зарегистрирован на:</p>
                        <p v-if="registerIn != null">{{registerIn}}</p>
                        <p v-else class="id">-</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-user-plus" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                    <div class="id_id-text">
                        <p class="id-text">Приглашён:</p>
                        <p v-if="invitedBy != null">{{invitedBy}}</p>
                        <p v-else class="id">-</p>
                    </div>
                </div>
                <div class="info-block">
                    <i class="pi pi-calendar-plus" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
                    <div class="id_id-text">
                        <p class="id-text">Дата регистрации:</p>
                        <p>{{registerDate}}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <InformationUserGroups />
</template>

<script setup>
import InformationUserGroups from '@/components/profile/InformationUserGroups.vue';

const nickname = 'User123';
const id = 'User123';
const uuid = 'User123';
const popolneno = '1200₽';
const potracheno = '950₽';
const cases = '7';

const twoFaConnectStatus = true;
const discordConnectStatus = false;
const discordID = '2872177317829';
const forumStatus = false;
const telegramId = '12763781';
const emailAddress = 'awjnkdjkawnkj@sakjdnj.rds';

const registerIn = 'example.com';
const invitedBy = 'User123';
const registerDate = '2023-10-01 00:00:00';

const nahcoon_real = '350';
const nahcoin_fake = '1000';
const pohcoin = '420';
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

    i
        margin-right: 10px
        padding: 6px 6px 1px 6px
        background-color: #0e0e10

    .id-text
        margin: 0
        font-size: 14px
        font-weight: bold

    .id
        margin: 0
        font-size: 13px
        color: #cccccc
.main-block-1, .main-block-2
    border: 1px solid #4c4c4c
    border-radius: 15px
    margin-top: 15px
    padding: 10px
.down-main-blocks
    display: flex
    flex-direction: row
    justify-content: space-between
</style>
