<script setup>
import { onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';

const toast = useToast();

const passwordLength = ref(12);
const generatedPassword = ref('');
const copied = ref(false);

const options = ref([
    { id: 1, name: 'Заглавные буквы (A-Z)', enabled: true, type: 'include', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    { id: 2, name: 'Строчные буквы (a-z)', enabled: true, type: 'include', chars: 'abcdefghijklmnopqrstuvwxyz' },
    { id: 3, name: 'Цифры (0-9)', enabled: true, type: 'include', chars: '0123456789' },
    { id: 4, name: 'Символы (!@#$%^&*)', enabled: true, type: 'include', chars: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
    { id: 5, name: 'Исключить похожие (0,O,l,1,I)', enabled: true, type: 'exclude', chars: '0Ol1I' },
    { id: 6, name: 'Исключить неоднозначные', enabled: true, type: 'exclude', chars: '{}[]()/\\~,;.<>' }
]);

const notify = (severity, summary, detail) => {
    toast.add({ severity, summary, detail, life: 2000 });
};

const sync = async (data) => {
    generatePassword();
};

const generatePassword = () => {
    let charset = '';
    let excludeChars = '';

    console.log('Generating password with options:', options.value.map(o => ({ name: o.name, enabled: o.enabled })));

    options.value.forEach(option => {
        if (option.enabled && option.type === 'include') {
            charset += option.chars;
            console.log(`Added ${option.name}: ${option.chars}`);
        }
        if (option.enabled && option.type === 'exclude') {
            excludeChars += option.chars;
            console.log(`Excluding ${option.name}: ${option.chars}`);
        }
    });

    console.log('Initial charset:', charset);
    console.log('Exclude chars:', excludeChars);

    if (!charset) {
        generatedPassword.value = '';
        console.log('No charset available');
        return;
    }

    if (excludeChars) {
        const excludeSet = new Set(excludeChars);
        charset = charset.split('').filter(char => !excludeSet.has(char)).join('');
        console.log('Charset after exclusions:', charset);
    }

    if (!charset) {
        generatedPassword.value = '';
        console.log('No charset after exclusions');
        return;
    }

    let password = '';
    for (let i = 0; i < passwordLength.value; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }

    console.log('Generated password:', password);
    generatedPassword.value = password;
    copied.value = false;
};

const copyPassword = async () => {
    if (!generatedPassword.value) return;

    try {
        await navigator.clipboard.writeText(generatedPassword.value);
        copied.value = true;
        notify('success', 'Успех', 'Пароль скопирован в буфер обмена');
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch (err) {
        notify('error', 'Ошибка', 'Не удалось скопировать пароль');
    }
};

watch(passwordLength, () => {
    generatePassword();
});

watch(options, () => {
    generatePassword();
}, { deep: true });

onMounted(() => {
    generatePassword();
});
</script>

<template>
    <div class="card p-fluid">
        <Toast />

        <div class="password-controls">
            <div class="length-control">
                <label>Длина пароля:</label>
                <div class="length-inputs">
                    <Slider
                        v-model="passwordLength"
                        :min="4"
                        :max="50"
                        class="length-slider"
                    />
                    <InputNumber
                        v-model="passwordLength"
                        :min="4"
                        :max="50"
                        class="length-number"
                    />
                </div>
            </div>

            <div class="password-result" v-if="generatedPassword">
                <InputText
                    v-model="generatedPassword"
                    readonly
                    class="password-field"
                />
                <Button
                    @click="copyPassword"
                    :class="{ 'copied': copied }"
                    :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
                    :label="copied ? 'Скопировано' : 'Копировать'"
                    size="small"
                />
            </div>
        </div>

        <DataTable
            :value="options"
            dataKey="id"
            responsiveLayout="scroll"
            class="p-datatable-sm"
        >
            <Column field="name" header="Настройки генерации" />

            <Column header="Включено" bodyStyle="text-align:center; width:10rem">
                <template #body="{ data }">
                    <ToggleSwitch
                        v-model="data.enabled"
                        @change="() => sync(data)"
                    />
                </template>
            </Column>
        </DataTable>

        <div class="generate-section">
            <Button
                @click="generatePassword"
                icon="pi pi-refresh"
                label="Сгенерировать новый пароль"
                class="generate-btn"
            />
        </div>
    </div>
</template>

<style scoped>
.password-controls {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.length-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.length-control label {
    font-weight: 600;
}

.length-inputs {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.length-slider {
    flex: 1;
    max-width: 300px;
}

.length-number {
    width: 80px;
}

.password-result {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.password-field {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-size: 1.1rem;
}

.generate-section {
    margin-top: 1rem;
    text-align: center;
}

.generate-btn {
    padding: 0.75rem 2rem;
}

.copied {
    background-color: #22c55e !important;
    border-color: #22c55e !important;
}
</style>

