<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import FileUpload, { FileUploadUploadEvent } from 'primevue/fileupload'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Состояние для массива изображений
const images = ref<Array<{ authorName: string; _id: string }>>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(0)

// Модальное окно
const showModal = ref(false)
const selectedImageId = ref<string | null>(null)
const selectedAuthor = ref<string | null>(null)

// Функция загрузки списка изображений с пагинацией
async function loadImages() {
    if (loading.value || !hasMore.value) return
    loading.value = true

    try {
        const res = await axios.get(`/api/imgur/get?page=${page.value}`)
        if (res.data && res.data.success && Array.isArray(res.data.images)) {
            if (res.data.images.length === 0) {
                hasMore.value = false
            } else {
                images.value = [...images.value, ...res.data.images]
                page.value++
            }
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось получить список изображений',
            life: 5000
        })
    } finally {
        loading.value = false
    }
}

// Подгрузка при скролле
const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadImages()
    }
}

onMounted(() => {
    loadImages()
    window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})

// Обработка загрузки новых файлов
const onUpload = async (event: FileUploadUploadEvent): Promise<void> => {
    const files = event.files as File[]
    if (!files.length) return

    for (const file of files) {
        toast.add({
            severity: 'info',
            summary: 'Загрузка',
            detail: `Отправка файла ${file.name}`,
            life: 2000
        })

        const formData = new FormData()
        formData.append('demo[]', file, file.name)

        try {
            await axios.post('/api/imgur/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.add({
                severity: 'success',
                summary: 'Успех',
                detail: `Файл ${file.name} загружен`,
                life: 3000
            })

            // Сброс и обновление списка после успешной загрузки
            images.value = []
            page.value = 0
            hasMore.value = true
            await loadImages()
        } catch (err: any) {
            console.error(`❌ Ошибка при загрузке ${file.name}:`, err)
            toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: `Не удалось загрузить ${file.name}`,
                life: 5000
            })
        }
    }
}

// Открытие модалки
const openImageModal = (img: { authorName: string; _id: string }) => {
    selectedImageId.value = img._id
    selectedAuthor.value = img.authorName
    showModal.value = true
}

// Копирование ссылки в нужном формате
const copyLink = (ext: string) => {
    if (!selectedImageId.value || !selectedAuthor.value) return
    const url = `${window.location.origin}/img/${selectedAuthor.value}/${selectedImageId.value}.${ext}`
    navigator.clipboard.writeText(url).then(() => {
        toast.add({ severity: 'success', summary: 'Скопировано', detail: `.${ext} ссылка скопирована`, life: 3000 })
    })
}
</script>

<template>
    <div class="font-semibold text-xl mb-4">TabMenu</div>
    <Tabs value="0">
        <TabList>
            <Tab value="0">Типа категория I</Tab>
            <Tab value="1">Типа категория  II</Tab>
            <Tab value="2">Типа категория  III</Tab>
        </TabList>
    </Tabs>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Advanced</div>
        <FileUpload name="demo[]" @uploader="onUpload" :multiple="true" accept="image/*" :maxFileSize="10000000" customUpload />

        <div class="grid grid-cols-4 gap-4 mt-6 place-items-center">
            <img
                v-for="img in images"
                :key="img._id"
                :src="`/img/${img.authorName}/${img._id}?preview=true`"
                :alt="img._id"
                width="260"
                loading="lazy"
                class="h-auto object-cover cursor-pointer"
                style="border-radius: 15px"
                @click="openImageModal(img)"
            />
        </div>

        <div v-if="loading" class="text-center my-4">
            Загрузка...
        </div>
    </div>

    <!-- Модальное окно -->
    <Dialog v-model:visible="showModal" :style="{ width: '450px' }" header="Выберите формат и скопируйте ссылку" :modal="true">
        <div class="flex flex-col space-y-3">
            <Button label=".png" @click="copyLink('png')" />
            <Button label=".jpg" @click="copyLink('jpg')" />
            <Button label=".webp" @click="copyLink('webp')" />
            <Button label=".gif" @click="copyLink('gif')" />
        </div>
    </Dialog>
</template>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}
</style>
