<script setup lang="ts">
// ничего не нужно импортировать
</script>

<template>
    <h1>MTechImgur</h1>

    <div class="grid grid-cols-4 gap-4">
        <!-- если <Image> — это сторонний компонент, убедитесь, что он пробрасывает атрибут loading в реальный <img> -->
        <img v-for="i in 10000" :key="i" src="https://mtechlab.dev/imgur/3XgR9LChJy/" alt="Image" width="250" loading="lazy" class="w-60 h-auto object-cover" />
    </div>
</template>

<style scoped>
/* опционально: быстро показать сетку, а картинки подгружаются по мере скролла */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}
</style>
