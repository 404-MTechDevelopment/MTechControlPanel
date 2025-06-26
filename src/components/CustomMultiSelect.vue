<template>
    <div ref="trigger" class="w-full text-white">
        <div
            @click="toggleDropdown"
            class="flex flex-wrap items-center justify-start rounded px-4 py-2 bg-black/60 cursor-pointer transition-all duration-300 ease-in-out"
            :style="{ minHeight: '40px' }"
        >
      <span v-if="selectedLabels.length" class="flex flex-wrap gap-2 max-w-full">
        <span
            v-for="(label, index) in selectedLabels"
            :key="index"
            class="bg-purple-600 text-white px-3 py-1 rounded-lg truncate max-w-[200px] text-sm"
        >
          {{ label }}
        </span>
      </span>
            <span v-else class="truncate">{{ placeholder }}</span>

            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

        <teleport to="body">
            <transition name="fade" style="margin-top: 6px">
                <div
                    v-if="dropdownOpen"
                    class="fixed z-[9999] bg-black/100 rounded-lg shadow-xl max-h-60 overflow-y-auto transition-all duration-300 ease-in-out"
                    :style="{
                        width: dropdownWidth + 'px',
                        top: dropdownTop + 'px',
                        left: dropdownLeft + 'px'
                      }"
                >
                    <div class="p-2">
                        <input
                            v-model="search"
                            placeholder="Поиск..."
                            class="w-full px-2 py-1 rounded bg-black/40 border border-gray-600 text-sm focus:outline-none"
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
                            />
                            <span>{{ option[optionLabel] }}</span>
                        </label>
                    </div>
                </div>
            </transition>
        </teleport>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    modelValue: Array,
    options: Array,
    optionLabel: String,
    optionValue: String,
    placeholder: { type: String, default: 'Выберите' }
})
const emit = defineEmits(['update:modelValue'])

const trigger = ref(null)
const dropdownOpen = ref(false)
const dropdownWidth = ref(0)
const dropdownTop = ref(0)
const dropdownLeft = ref(0)
const search = ref('')
const localValue = ref([...props.modelValue || []])

const toggleDropdown = async () => {
    dropdownOpen.value = !dropdownOpen.value
    if (dropdownOpen.value) {
        await nextTick(() => setDropdownPosition())
    }
}

const setDropdownPosition = () => {
    const el = trigger.value
    const rect = el.getBoundingClientRect()
    dropdownWidth.value = rect.width
    dropdownTop.value = rect.top + rect.height
    dropdownLeft.value = rect.left
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
.fade-enter-active, .fade-leave-active
    transition: opacity 0.3s ease-in-out

.fade-enter-from, .fade-leave-to
    opacity: 0
</style>
