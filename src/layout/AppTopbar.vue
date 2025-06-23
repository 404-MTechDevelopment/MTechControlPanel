<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { checkAuthApi } from '@/api/getUserInfo';
import { onMounted, ref } from 'vue';
import { getHeadLink } from '@/api/getHeadLink';

const checkAuth = ref(null)

onMounted(async () => {
    checkAuth.value = await checkAuthApi()
})

const { toggleMenu } = useLayout();
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img src="/icon.png" alt="Logo" class="layout-topbar-logo-image" />

                <span>Nahon</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>


            <button type="button" class="layout-topbar-action">
                <img style="border-radius: 25%" v-if="checkAuth?.username" :src="getHeadLink(checkAuth.username)" alt="Head" class="layout-topbar-avatar" />
            </button>
        </div>
    </div>
</template>
