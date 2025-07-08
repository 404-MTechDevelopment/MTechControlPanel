<script setup lang="ts">
import { ref } from 'vue'
import axios, { AxiosProgressEvent } from 'axios'
import FileUpload, { FileUploadUploadEvent } from 'primevue/fileupload'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const onUpload = async (event: FileUploadUploadEvent): Promise<void> => {
    const files = event.files as File[]
    if (!files.length) {
        return
    }

    for (const file of files) {
        // тост: начинаем этот файл
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
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e: AxiosProgressEvent) => {
                    if (e.total) {
                        const pct = Math.round((e.loaded / e.total) * 100)
                        console.log(`📊 ${file.name}: ${pct}%`)
                    }
                }
            })

            toast.add({
                severity: 'success',
                summary: 'Успех',
                detail: `Файл ${file.name} загружен`,
                life: 3000
            })
        }
        catch (err: any) {
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
</script>


<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Advanced</div>
        <FileUpload name="demo[]" @uploader="onUpload" :multiple="true" accept="image/*" :maxFileSize="10000000" customUpload />
    </div>

    <div class="grid grid-cols-4 gap-4">
        <img
            v-for="i in 10000"
            :key="i"
            src="https://mtechlab.dev/imgur/3XgR9LChJy/"
            alt="Image"
            width="250"
            loading="lazy"
            class="w-60 h-auto object-cover"
        />
    </div>
</template>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}
</style>
