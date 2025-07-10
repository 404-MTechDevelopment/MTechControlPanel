import {reactive} from 'vue'
import api from '@/api/api'

export interface User {
    id?: string
    username: string
    email?: string
    discord?: string
}

export const authStore = reactive<{
    user: User | null | undefined
    logout: () => Promise<void>
}>({
    user: undefined,

    async logout() {
        try {
            await api.post('auth/logout')
        } catch (e) {
            console.error('Error during logout:', e)
        } finally {
            this.user = null
        }
    },
})

export async function checkAuth() {
    try {
        const { data } = await api.get('auth/check')
        authStore.user = data?.username ? data : null
        console.log(authStore.user)
    } catch (e) {
        console.error('Error checking auth:', e)
        authStore.user = null
    }
}
