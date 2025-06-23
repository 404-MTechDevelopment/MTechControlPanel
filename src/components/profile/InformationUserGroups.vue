<template>
    <div class="main-block">
        <div class="info-block">
            <i class="pi pi-shield" style="font-size: 2rem; color: #708090; border-radius: 10px"></i>
            <div class="id_id-text">
                <p class="id-text">Группы пользователя</p>
            </div>
        </div>
        <div class="global-groups server">
            <div class="info-block">
                <div class="id_id-text">
                    <i class="pi pi-user-edit ml-1 align-middle" style="font-size: 1rem"></i>
                    <span class="text-xl font-semibold">Глобальные группы: </span>

                    <Tag
                        v-for="(role, index) in globalRoles"
                        :key="index"
                        :icon="hoverStates[`g-${index}`] ? 'pi pi-times' : 'pi pi-user'"
                        :value="role"
                        class="text-sm px-2 py-1 align-middle mr-1 mb-1 cursor-pointer"
                        @mouseover="hoverStates[`g-${index}`] = true"
                        @mouseleave="hoverStates[`g-${index}`] = false"
                    />

                    <i class="pi pi-plus ml-1 align-middle cursor-pointer" style="font-size: 1rem"></i>
                </div>
            </div>
        </div>
        <div class="server-groups" v-for="(server, sIndex) in serverGroups" :key="sIndex">
            <div class="info-block server">
                <div class="id_id-text">
                    <i class="pi pi-server ml-1 align-middle" style="font-size: 1rem"></i>
                    <span class="text-xl font-semibold">{{ server.serverName }}: </span>
                    <Tag
                        v-for="(role, rIndex) in server.roles"
                        :key="rIndex"
                        :icon="hoverStates[`s${sIndex}-${rIndex}`] ? 'pi pi-times' : 'pi pi-user'"
                        :value="role"
                        class="text-sm px-2 py-1 align-middle mr-1 mb-1 cursor-pointer"
                        @mouseover="hoverStates[`s${sIndex}-${rIndex}`] = true"
                        @mouseleave="hoverStates[`s${sIndex}-${rIndex}`] = false"
                    />
                    <i class="pi pi-plus ml-1 align-middle cursor-pointer" style="font-size: 1rem"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const serverGroups = [
    { serverName: 'EnigmaRPG', roles: ['Админ', 'Куратор'] },
    { serverName: 'Omicron', roles: ['Модератор'] }
];
const globalRoles = ['Куратор', 'Админ', 'Модератор', 'Партнёр', 'Проверенный'];

const hoverStates = reactive<Record<string, boolean>>({});
</script>

<style scoped lang="sass">
.main-block, .server
    border: 1px solid #4c4c4c
    border-radius: 15px
    margin-top: 15px
    padding: 10px
    display: flex
    flex-direction: column

.global-groups
    display: flex
    flex-direction: column
    margin-top: 10px

.info-block
    display: flex
    flex-direction: row
    align-items: center

    i
        margin-right: 10px
        padding: 6px 6px 6px 6px
        background-color: #0e0e10
        border-radius: 10px

    .id-text
        margin: 0
        font-size: 25px
        font-weight: bold
</style>
