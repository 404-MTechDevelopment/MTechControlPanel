<template>
    <div class="p-4 space-y-4">
        <!-- Успешность ответа -->
        <Card title="Результат">
            <p><strong>Success:</strong> {{ data.success }}</p>
        </Card>

        <!-- ID записи -->
        <Card title="System Info ID">
            <p>{{ data.system_info?._id }}</p>
        </Card>

        <!-- Операционная система -->
        <Panel header="Операционная система">
            <p><strong>Имя и версия:</strong> {{ data.system_info?.operatingSystem?.nameAndVersion }}</p>
            <p><strong>Версия:</strong> {{ data.system_info?.operatingSystem?.versionInfo }}</p>
        </Panel>

        <!-- Процессор -->
        <Panel header="Процессор">
            <p><strong>Модель:</strong> {{ data.system_info?.cpu?.model }}</p>
            <p><strong>Частота (Hz):</strong> {{ data.system_info?.cpu?.vendorFreq }}</p>
            <p><strong>Физ. ядра:</strong> {{ data.system_info?.cpu?.physicalCores }}</p>
            <p><strong>Лог. потоки:</strong> {{ data.system_info?.cpu?.logicalProcessors }}</p>
        </Panel>

        <!-- Память -->
        <Panel header="Память">
            <p><strong>Всего:</strong> {{ data.system_info?.memory?.total }}</p>
            <p><strong>Доступно:</strong> {{ data.system_info?.memory?.available }}</p>
            <p><strong>Swap всего:</strong> {{ data.system_info?.memory?.swapTotal }}</p>
            <p><strong>Swap занято:</strong> {{ data.system_info?.memory?.swapUsed }}</p>
        </Panel>

        <!-- Диски -->
        <Panel header="Диски">
            <div v-for="(disk, idx) in data.system_info?.disks || []" :key="idx" class="mb-3 border p-3 rounded-md">
                <p><strong>Модель:</strong> {{ disk.model }}</p>
                <p><strong>Размер:</strong> {{ disk.size }}</p>
                <div class="ml-4">
                    <p class="font-semibold">Разделы:</p>
                    <ul class="list-disc list-inside">
                        <li v-for="(part, pidx) in disk.partitions" :key="pidx">
                            <span><strong>Идентификация:</strong> {{ part.identification }}</span
                            ><br />
                            <span><strong>Имя:</strong> {{ part.name }}</span
                            ><br />
                            <span><strong>Размер:</strong> {{ part.size }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Panel>

        <!-- Источники питания -->
        <Panel header="Источники питания">
            <ul class="list-disc list-inside">
                <li v-for="(ps, idx) in data.system_info?.powerSources || []" :key="idx">
                    {{ ps.name }}
                </li>
            </ul>
        </Panel>

        <!-- Сетевые интерфейсы -->
        <Panel header="Сетевые интерфейсы">
            <div v-for="(net, idx) in data.system_info?.networkInterfaces || []" :key="idx" class="mb-3 border p-3 rounded-md">
                <p><strong>Имя:</strong> {{ net.name }}</p>
                <p><strong>Отображаемое имя:</strong> {{ net.displayName }}</p>
                <p><strong>MAC:</strong> {{ net.mac }}</p>
                <p>
                    <strong>IPv4:</strong>
                    <span v-if="(net.ipv4 || []).length === 0">—</span>
                    <span v-else>{{ net.ipv4.join(', ') }}</span>
                </p>
                <p>
                    <strong>IPv6:</strong>
                    <span v-if="(net.ipv6 || []).length === 0">—</span>
                    <span v-else>{{ net.ipv6.join(', ') }}</span>
                </p>
                <p><strong>Скорость:</strong> {{ net.speed }} bps</p>
            </div>
        </Panel>

        <!-- Дисплеи -->
        <Panel header="Дисплеи">
            <ul class="list-disc list-inside">
                <li v-for="(d, idx) in data.system_info?.displays || []" :key="idx"><strong>EDID Hash:</strong> {{ d.edidHash }}</li>
            </ul>
        </Panel>

        <!-- Звуковые карты -->
        <Panel header="Звуковые карты">
            <div v-for="(sc, idx) in data.system_info?.soundCards || []" :key="idx" class="mb-3 border p-3 rounded-md">
                <p><strong>Имя:</strong> {{ sc.name }}</p>
                <p><strong>Модель:</strong> {{ sc.model }}</p>
                <p><strong>Версия драйвера:</strong> {{ sc.driverVersion }}</p>
            </div>
        </Panel>

        <!-- USB-устройства -->
        <Panel header="USB-устройства">
            <ul class="list-disc list-inside">
                <li v-for="(dev, idx) in data.system_info?.usbDevices || []" :key="idx">
                    <USBDeviceTree :device="dev" />
                </li>
            </ul>
        </Panel>

        <!-- Процессы -->
        <Panel header="Процессы (ID / Имя)">
            <ul class="list-disc list-inside max-h-64 overflow-auto">
                <li v-for="(proc, idx) in data.system_info?.processes || []" :key="idx">{{ proc.processID }} / {{ proc.name }}</li>
            </ul>
        </Panel>

        <!-- Сетевые параметры -->
        <Panel header="Сетевые параметры">
            <p><strong>Hostname:</strong> {{ data.system_info?.networkParams?.hostname }}</p>
            <p><strong>Domain:</strong> {{ data.system_info?.networkParams?.domain }}</p>
            <p>
                <strong>DNS Servers:</strong>
                <span v-if="(data.system_info?.networkParams?.dnsServers || []).length === 0">—</span>
                <span v-else>{{ data.system_info.networkParams.dnsServers.join(', ') }}</span>
            </p>
        </Panel>

        <!-- Файловые хранилища -->
        <Panel header="Файловые хранилища">
            <div v-for="(fs, idx) in data.system_info?.fileStores || []" :key="idx" class="mb-3 border p-3 rounded-md">
                <p><strong>Имя:</strong> {{ fs.name }}</p>
                <p><strong>Точка монтирования:</strong> {{ fs.mount }}</p>
                <p><strong>Тип:</strong> {{ fs.type }}</p>
                <p><strong>Всего места:</strong> {{ fs.totalSpace }}</p>
                <p><strong>Доступно:</strong> {{ fs.usableSpace }}</p>
            </div>
        </Panel>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import api from '@/api/api';
import Panel from 'primevue/panel';
import Card from 'primevue/card';

// Рекурсивный компонент для отображения вложенных USB-устройств
const USBDeviceTree = {
    name: 'USBDeviceTree',
    props: {
        device: { type: Object, required: true }
    },
    template: `
    <div>
      <p><strong>Имя:</strong> {{ device.name }} / <strong>Производитель:</strong> {{ device.vendor }}</p>
      <ul v-if="device.connectedDevices?.length" class="list-disc list-inside ml-4">
        <li v-for="(child, idx) in device.connectedDevices" :key="idx">
          <USBDeviceTree :device="child" />
        </li>
      </ul>
    </div>
  `,
    components: {
        USBDeviceTree: null // будет переопределён в mounted родителя
    },
    mounted() {
        // Устанавливаем ссылку на себя, чтобы рекурсия работала
        this.$options.components.USBDeviceTree = USBDeviceTree;
    }
};

export default {
    name: 'SupportStats',
    components: {
        Panel,
        Card,
        USBDeviceTree
    },
    setup() {
        const data = ref({});

        onMounted(async () => {
            const uuid = location.pathname.split('/').pop();
            const res = await api.get(`/support/get-system-info`, { params: { uuid } });
            data.value = res.data;
        });

        return { data };
    }
};
</script>

<style scoped>
.p-4 {
    padding: 1rem;
}

.space-y-4 > * + * {
    margin-top: 1rem;
}

.max-h-64 {
    max-height: 16rem;
}

.overflow-auto {
    overflow: auto;
}

.ml-4 {
    margin-left: 1rem;
}

.list-disc {
    list-style-type: disc;
}

.list-inside {
    list-style-position: inside;
}

.border {
    border: 1px solid #ddd;
}

.p-3 {
    padding: 0.75rem;
}

.rounded-md {
    border-radius: 0.375rem;
}

.mt-3 {
    margin-top: 0.75rem;
}
</style>
