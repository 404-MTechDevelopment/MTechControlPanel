<template>
    <div ref="trigger" class="w-full text-white relative">
        <div
            @click="toggleDropdown"
            class="flex flex-wrap items-center justify-start rounded px-4 py-2 bg-black/60 cursor-pointer transition-all duration-300 ease-in-out"
            :style="{ minHeight: '40px' }"
        >
            <span v-if="selectedLabels.length" class="flex flex-wrap gap-2 max-w-full">
                <span
                    v-for="(label, index) in selectedLabels"
                    :key="index"
                    class="bg-purple-600 text-white px-3 py-1 rounded-lg truncate max-w-[200px] text-sm transition-all duration-300 ease-in-out"
                >
                    {{ label }}
                </span>
            </span>
            <span v-else class="truncate">{{ placeholder }}</span>

            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

        <transition name="fade">
            <div
                v-if="dropdownOpen"
                class="fixed z-[1000] bg-black/60 rounded-lg shadow-xl max-h-60 overflow-y-auto transition-all duration-300 ease-in-out"
                :style="{ width: dropdownWidth + 'px', top: '83%' }"
            >
                <div class="p-2">
                    <input
                        v-model="search"
                        placeholder="Поиск..."
                        class="w-full px-2 py-1 rounded bg-black/40 border border-gray-600 text-sm focus:outline-none transition-all duration-300 ease-in-out"
                    />
                </div>
                <div
                    v-for="option in filteredOptions"
                    :key="option[optionValue]"
                    class="px-4 py-2 hover:bg-purple-700/30 transition-all duration-200 ease-in-out"
                >
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            class="accent-purple-500 w-4 h-4"
                            :value="option[optionValue]"
                            v-model="localValue"
                            @change="emitValue"
                            :key="option[optionValue]"
                        />
                        <span>{{ option[optionLabel] }}</span>
                    </label>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    modelValue: Array,
    options: Array,
    optionLabel: String,
    optionValue: String,
    placeholder: { type: String, default: 'Выберите' },
})
const emit = defineEmits(['update:modelValue'])

const trigger = ref(null)
const dropdownOpen = ref(false)
const dropdownWidth = ref(0)
const search = ref('')
const localValue = ref([...props.modelValue || []])

const toggleDropdown = async () => {
    dropdownOpen.value = !dropdownOpen.value
    if (dropdownOpen.value) await nextTick(() => setDropdownPosition())
}

const setDropdownPosition = () => {
    const el = trigger.value
    const rect = el.getBoundingClientRect()
    dropdownWidth.value = rect.width
}

const filteredOptions = computed(() =>
    props.options.filter(opt =>
        opt[props.optionLabel].toLowerCase().includes(search.value.toLowerCase())
    )
)

const selectedLabels = computed(() =>
    props.options
        .filter(opt => localValue.value.includes(opt[props.optionValue]))
        .map(opt => opt[props.optionLabel])
)

const emitValue = () => emit('update:modelValue', [...localValue.value])
watch(() => props.modelValue, val => (localValue.value = [...val || []]))

const handleClickOutside = (e) => {
    if (!trigger.value?.contains(e.target)) dropdownOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped lang="sass">
.selected-items span
    background-color: #6b46c1
    color: white
    padding: 4px 12px
    border-radius: 12px
    max-width: 200px
    text-overflow: ellipsis
    overflow: hidden
    white-space: nowrap
    font-size: 14px

.truncate
    max-height: 24px

.fade-enter-active, .fade-leave-active
    transition: opacity 0.3s ease-in-out

.fade-enter-from, .fade-leave-to
    opacity: 0
</style>
