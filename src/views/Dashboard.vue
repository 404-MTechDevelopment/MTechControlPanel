<script setup>
import { computed, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core'
import axios from 'axios'
import router from '@/router';
import { getHeadLink } from '@/api/getHeadLink';


const query = ref('')
const results = ref([])
const loading = ref(false)
const isFocused = ref(false)
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
        const res = await axios.post('/api/users/search', { query: query.value })
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
function openUserProfile(nickname) {
    console.log('Opening profile for user:', nickname)
    router.push(`/profile/${nickname}`)
}
</script>

<template>
    <div class="card">
        <h1>Поиск игроков</h1>
        <div class="card-group">
            <input
                v-model="query"
                @focus="isFocused = true"
                @blur="isFocused = false"
                @input="fetchResults"
                type="text"
                placeholder="Поиск игроков..."
                class="search-input"
                autocomplete="off"
                spellcheck="false"
            />
            <transition-group name="list-fade" tag="ul" v-if="showDropdown && results.length" class="results-dropdown">
                <li v-for="user in results" :key="user.uuid" class="result-item" @click="openUserProfile(user.username)">
                    <img style="border-radius: 25%" :src="getHeadLink(user.username)" alt="User Avatar" class="user-avatar" />
                    <span class="username">{{ user.username }}</span>
                    <span class="email">{{ user.email }}</span>
                </li>

            </transition-group>
            <transition-group name="list-fade" tag="ul" v-else class="results-dropdown" v-if="!loading && query.length !== 0 && isFocused">
                <li class="result-item">
                    <span class="not-found">Не найдено</span>
                </li>
            </transition-group>
        </div>
    </div>
</template>

<style scoped>
.card-group {
    position: relative;
    border-radius: 12px;
    width: 70%;
    margin: auto;
}
.card {
    height: 82vh;
}
.search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #575757;
    border-radius: 8px;
    transition: border 0.3s;
}
.search-input:focus {
    outline: none;
    border-color: #575757;
}
.results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.5rem;
    max-height: 550px;
    overflow-y: auto;
    background: #09090B;
    border: 1px solid #575757;
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    z-index: 10;
    padding: 0;
    list-style: none;
}
h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    color: #fff;
    text-align: center;
}
.result-item {
    display: flex;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid #575757;
    transition: background 0.2s;
    align-items: center;
    font-size: 1.5rem;
    .username {
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }
}
.result-item:last-child {
    border-bottom: none;
}
.result-item:hover {
    background: #575757;
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
@media (max-width: 992px) {
    .card-group {
        width: 100%;
    }
}
</style>
