<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Toast from 'primevue/toast';
import { checkAuth, authStore } from '@/api/authStore';

const router = useRouter();
const route = useRoute();

const isLoading = ref(true);

onMounted(async () => {
    await checkAuth();

    const isLoginPage = route.path.startsWith('/admin/login');

    if (!authStore.user && !isLoginPage) {
        await router.replace({
            path: '/admin/login',
            query: { redirect: route.fullPath }
        });
    }

    isLoading.value = false;
});
</script>

<template>
    <Toast />
    <router-view v-if="!isLoading" />
    <div v-else class="loading-spinner">Загрузка...</div>
</template>

<style scoped>
.loading-spinner {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
}
</style>
