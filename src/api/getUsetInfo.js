import axios from 'axios'

export const getUserInfo = async (username) => {
    const { data } = await axios.post('/api/admin/users/info', { username })
    if (data.success) return data.result
    throw new Error(data.error || 'Unknown error')
}
