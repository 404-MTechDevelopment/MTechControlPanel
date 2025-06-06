<template>
    <div>
        <h1>Просмотр статистики</h1>
        <p v-if="stats">UUID: {{ uuid }}</p>
        <pre v-if="stats">{{ stats }}</pre>
        <p v-else>Загрузка...</p>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from '@/api/api'; // или любой другой axios instance

const route = useRoute();
const uuid = route.params.uuid;
const stats = ref(null);

onMounted(async () => {
    try {
        const response = await axios.get(`/api/support/stats/${uuid}`);
        stats.value = response.data;
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
    }
});
</script>
