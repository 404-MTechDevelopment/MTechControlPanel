<script setup>
import { ref } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { useDebounceFn } from '@vueuse/core'
import axios from 'axios'

const search = ref('')
const results = ref([])
const loading = ref(false)

const fetchSuggestions = useDebounceFn(async (query) => {
    if (!query) {
        results.value = []
        return
    }
    loading.value = true
    try {
        const res = await axios.post('https://test.nahon.top/api/users/search', {
            query: { query }
        })
        results.value = res.data.result
    } catch {
        results.value = []
    } finally {
        loading.value = false
    }
}, 300)

const onSearch = (event) => {
    fetchSuggestions(event.query)
}
</script>

<template>
    <div class="card">
        <h1>Поиск по нику пользователя</h1>
        <div class="search-wrapper">
            <AutoComplete
                v-model="search"
                :suggestions="results"
                @complete="onSearch"
                optionLabel="username"
                placeholder="Введите никнейм..."
                :loading="loading"
                panelClass="search-dropdown"
                class="search-input"
            >
                <template #item="{ item }">
                    <div class="search-item">
                        <i class="pi pi-user mr-2 text-gray-500" />
                        <div class="user-data">
                            <div class="username">{{ item.username }}</div>
                            <div class="email">{{ item.email }}</div>
                        </div>
                    </div>
                </template>
            </AutoComplete>
        </div>
    </div>
</template>

<style scoped>
.card {
    height: 82vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 2rem 1rem;
}
h1 {
    text-align: center;
    margin-bottom: 1rem;
    font-size: 2rem;
}
.search-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}
.search-input {
    width: 100%;
    max-width: 900px;
    font-size: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
.search-input :deep(.p-inputtext) {
    height: 60px;
    font-size: 1.3rem;
    padding: 0 1.5rem;
    border-radius: 12px;
}
.search-dropdown {
    max-height: 400px;
    overflow-y: auto;
    border-radius: 12px;
    animation: dropdownFade 0.2s ease-out;
    background: white;
}
.search-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    transition: background 0.2s ease;
}
.search-item:hover {
    background-color: #f5f5f5;
    cursor: pointer;
}
.user-data {
    display: flex;
    flex-direction: column;
}
.username {
    font-weight: 600;
    font-size: 1.1rem;
}
.email {
    font-size: 0.9rem;
    color: #888;
}
@keyframes dropdownFade {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@media (max-width: 800px) {
    .search-input {
        font-size: 1.2rem;
    }
    .search-dropdown {
        max-height: 300px;
    }
}
.p-autocomplete-loader {
    display: none !important;
}
</style>
