<script setup>
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import axios from 'axios'

const query = ref('')
const results = ref([])
const loading = ref(false)
const showDropdown = ref(false)

const fetchResults = useDebounceFn(async () => {
    console.log('fetchResults triggered, query:', query.value)
    if (!query.value.trim()) {
        results.value = []
        showDropdown.value = false
        return
    }
    loading.value = true
    try {
        const res = await axios.post('https://test.nahon.top/api/users/search', { query: query.value })
        console.log('Response data:', res.data)
        if (res.data.success && Array.isArray(res.data.result)) {
            results.value = res.data.result.slice(0, 50)
            showDropdown.value = results.value.length > 0
            console.log('Results updated:', results.value.length)
        } else {
            results.value = []
            showDropdown.value = false
        }
    } catch (error) {
        console.error('API request failed:', error)
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
            autocomplete="off"
            spellcheck="false"
        />
        <transition-group name="list-fade" tag="ul" v-if="showDropdown && results.length" class="results-dropdown">
            <li v-for="user in results" :key="user.uuid" class="result-item">
                <span class="username">{{ user.username }}</span>
                <span class="email">{{ user.email }}</span>
            </li>
        </transition-group>
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
    padding: 0;
    list-style: none;
}
.result-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    transition: background 0.2s;
}
.result-item:last-child {
    border-bottom: none;
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
.list-fade-enter-active, .list-fade-leave-active {
    transition: all 0.3s ease;
}
.list-fade-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}
.list-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
