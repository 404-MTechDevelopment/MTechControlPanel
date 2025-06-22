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
        results.value = res.data.slice(0, 50)
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
                optionLabel="name"
                placeholder="Введите никнейм..."
                :loading="loading"
                panelClass="search-dropdown"
                class="search-input"
            >
                <template #item="{ item }">
                    <div class="search-item">
                        <i class="pi pi-user mr-2 text-gray-500" />
                        <span>{{ item.name }}</span>
                    </div>
                </template>
            </AutoComplete>
        </div>
    </div>
</template>

<style scoped>
.search-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 3rem 1rem 1rem;
    width: 100%;
}
.search-input {
    font-size: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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
    font-size: 1.1rem;
    border-bottom: 1px solid #eee;
    transition: background 0.2s ease;
}

.search-item:hover {
    background-color: #f5f5f5;
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
.search-input :deep(.p-inputtext) {
    width: 80%;
    margin: 0 auto;
}
.p-autocomplete {
    width: 100%;
}
h1 {
    text-align: center;
    margin-bottom: 1rem;
    font-size: 2rem;
}
.card {
    height: 82vh;
}
@media (max-width: 800px) {
    .search-input {
        width: 100%;
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
