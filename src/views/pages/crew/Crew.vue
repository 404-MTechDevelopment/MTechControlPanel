<script setup lang="ts">
import { reactive } from 'vue';

// hoverStates — реактивный объект: ключ «`${cardIndex}-${tagIndex}`», значение true/false
const hoverStates = reactive<Record<string, boolean>>({});
</script>

<template>
    <div class="flex flex-wrap gap-4">
        <Card v-for="(_, outerIndex) in 8" :key="outerIndex" style="width: 30rem; overflow: hidden">
            <template #content>
                <div class="flex">
                    <img
                        class="w-32 h-64 object-cover rounded-md mt-2 mr-4"
                        src="https://visage.surgeplay.com/full/384/iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABpElEQVR4nO2bMU+DQBiGPxoSTRqSJgwspFMnpk7Mjk76L1yc+CWdXNz6E/wHzrgzORmWDp0aE02M52Al2AIHHPCS8D7T9eh9fe/t3fdRcrVEg+/7SveeKtI0tUzG980MLQANDUALQEMD0ALQ0AC0AB2R65WW4aprdbFN67wOXfyq+4Q6E4xcT232u9b3GnbbgUMSuZ5azx0REVkc+57fD53EHrUB67mTTdj6ElE5tVdHQ0RENvtd688YbQ7YLldqkXut7F8TinharlpvY/gKSJKkUPzL9c1Zn6pQWxZHRy0D4jiWMAy1fW0IgqAwgW1z3+rd50EeL5x/10/7yuLosJpUgTiOs3YXkxeprgKnS/v++yNrP8wus/bt22vrKtDIgD6o83O5bI+bTPyPswAmdbvOeB2m8Zs+fxhtFRgKGoAWgAaeBPtGlxMmvwJoAFoAGhqAFoCGBqAFoKEBaAFoaABaACGEEEIIIYQQQsjQdH6Wv+/zBV3//2DyT4RoAFoAGuP9hD5fYJoTJr8CaABaABoagBaAhgagBaChAWgBaGgAWgCaHy3qbF4RlsK1AAAAAElFTkSuQmCC"
                        alt="User"
                    />

                    <div class="flex flex-col flex-grow mt-4">
                        <div class="text-xl font-semibold">
                            <i class="pi pi-user ml-1 align-middle" style="font-size: 1rem"></i> <b> mixa1234qwerfghj</b>
                        </div>
                        <div>
                            <i class="pi pi-user-edit ml-1 align-middle" style="font-size: 1rem"></i><span class="text-xl font-semibold"> Роли: </span>

                            <Tag
                                v-for="innerIndex in 2"
                                :key="innerIndex"
                                :icon=" hoverStates[`${outerIndex}-${innerIndex}`] ? 'pi pi-times' : 'pi pi-user' "
                                value="Куратор"
                                class="text-sm px-2 py-1 align-middle mr-1 mb-1 cursor-pointer"
                                @mouseover="hoverStates[`${outerIndex}-${innerIndex}`] = true"
                                @mouseleave="hoverStates[`${outerIndex}-${innerIndex}`] = false"
                            />


                            <i class="pi pi-plus ml-1 align-middle cursor-pointer" style="font-size: 1rem"></i>
                        </div>

                        <div class="text-xl font-semibold">
                            <i class="pi pi-money-bill ml-1 align-middle" style="font-size: 1rem"></i>
                            Баланс: 1000
                        </div>
                        <div class="text-xl font-semibold">
                            <i class="pi pi-discord ml-1 align-middle" style="font-size: 1rem"></i>
                            Discord: <b>mixa1234qwerfghj</b>
                        </div>
                        <div class="text-xl font-semibold">
                            <i class="pi pi-telegram ml-1 align-middle" style="font-size: 1rem"></i>
                            Telegram: <b>@sashaiolh</b>
                        </div>
                        <div class="text-xl font-semibold">
                            <i class="pi pi-ban ml-1 align-middle" style="font-size: 1rem"></i>
                            Выговоров: <b>0/3</b>
                        </div>

                        <div class="mt-3">
                            <Button label="Открыть профиль" severity="primary" />
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
