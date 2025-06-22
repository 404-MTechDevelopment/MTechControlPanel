<script setup>
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import axios from 'axios'

const query = ref('')
const results = ref([])
const loading = ref(false)
const showDropdown = ref(false)

const fetchResults = useDebounceFn(async () => {
    if (!query.value) {
        results.value = []
        showDropdown.value = false
        return
    }
    loading.value = true
    try {
        const res = await axios.get(`https://test.nahon.top/api/users/search?q=${query.value}`)
        results.value = res.data.slice(0, 50)
        showDropdown.value = true
    } catch {
        results.value = []
        showDropdown.value = false
    }
    loading.value = false
}, 300)
</script>

<template>
    <div class="card">
        <input
            v-model="query"
            @input="fetchResults"
            type="text"
            placeholder="Поиск пользователей..."
            class="search-input"
        />
        <transition name="fade">
            <div v-if="showDropdown && results.length" class="results-dropdown">
                <ul>
                    <li v-for="user in results" :key="user.id" class="result-item">
                        <span class="username">{{ user.username }}</span>
                        <span class="email">{{ user.email }}</span>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.card {
    position: relative;
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    margin: auto;
}
.search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    transition: border 0.3s;
}
.search-input:focus {
    outline: none;
    border-color: #888;
}
.results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    z-index: 10;
}
.result-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
}
.result-item:hover {
    background: #f5f5f5;
}
.username {
    font-weight: 600;
}
.email {
    color: #666;
    font-size: 0.875rem;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
