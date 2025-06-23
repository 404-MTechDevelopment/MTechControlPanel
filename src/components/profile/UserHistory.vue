<template>
    <div class="history-block">
        <div class="info-block">
            <i class="pi pi-book" />
            <div class="id_id-text">
                <p class="id-text">История пользователя</p>
            </div>
        </div>

        <div v-if="history.length" class="table-wrapper">
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Ник</th>
                        <th>Тип</th>
                        <th>Выдал</th>
                        <th>Дата</th>
                        <th>До</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(entry, index) in history" :key="index">
                        <td>{{ entry.nickname }}</td>
                        <td>
                            <span :class="['tag', entry.type]">{{ entry.type }}</span>
                        </td>
                        <td>{{ entry.issuedBy }}</td>
                        <td>{{ entry.date }}</td>
                        <td>{{ entry.expires }}</td>
                        <td>
                            <Button
                                label="Подробнее"
                                size="small"
                                outlined
                                @click="
                                    selected = entry;
                                    visible = true;
                                "
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="no-history">У пользователя нету записей</div>

        <Dialog v-model:visible="visible" modal header="Подробности записи" :style="{ width: '500px' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="dialog-body">
                <div class="dialog-row"><span>Ник:</span> {{ selected?.nickname }}</div>
                <div class="dialog-row">
                    <span>Тип:</span> <span :class="['tag', selected?.type]">{{ selected?.type }}</span>
                </div>
                <div class="dialog-row"><span>Выдал:</span> {{ selected?.issuedBy }}</div>
                <div class="dialog-row"><span>Дата:</span> {{ selected?.date }}</div>
                <div class="dialog-row"><span>До:</span> {{ selected?.expires }}</div>
                <div class="dialog-block">
                    <p class="block-title">Причина</p>
                    <div class="block-content">{{ selected?.reason }}</div>
                </div>
                <div class="dialog-block">
                    <p class="block-title">Комментарий</p>
                    <div class="block-content">{{ selected?.comment }}</div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const visible = ref(false);
const selected = ref(null);

const history = [
    {
        nickname: 'User123',
        type: 'чс',
        issuedBy: 'Админ',
        reason: 'Множественные нарушения',
        comment: 'Игрок грубил, нарушал правила сервера.',
        date: '2024-12-01',
        expires: '2025-12-01'
    },
    {
        nickname: 'User123',
        type: 'рекомендация',
        issuedBy: 'Модератор',
        reason: 'Помощь новичкам',
        comment: 'Отличное поведение и поддержка комьюнити.',
        date: '2025-02-20',
        expires: '—'
    },
    {
        nickname: 'User123',
        type: 'предупреждение',
        issuedBy: 'ОДМЕН111101',
        reason: 'хуй',
        comment: 'большой хуй',
        date: '2025-02-20',
        expires: '—'
    }
];
</script>

<style scoped lang="sass">
.history-block
    border: 1px solid #4c4c4c
    border-radius: 15px
    margin-top: 15px
    padding: 15px
    display: flex
    flex-direction: column

.info-block
    display: flex
    align-items: center
    margin-bottom: 15px

    i
        font-size: 2rem
        color: #708090
        background: #0e0e10
        border-radius: 10px
        padding: 6px
        margin-right: 10px

    .id-text
        font-size: 16px
        font-weight: bold
        margin: 0

.table-wrapper
    border-radius: 10px
    overflow-x: auto

.history-table
    width: 100%
    border-collapse: collapse
    min-width: 600px
    background-color: #1e1e1e

    th, td
        padding: 12px 14px
        text-align: left
        border-bottom: 1px solid #333

    th
        font-weight: 600
        color: #ddd
        background-color: #272727

    tr:hover
        background-color: #2d2d2d

    td
        min-width: 100px

.tag
    display: inline-block
    padding: 4px 10px
    font-size: 12px
    border-radius: 20px
    font-weight: 600
    text-transform: uppercase

    &.чс
        background: #a22020
        color: white

    &.предупреждение
        background: #d0931d
        color: white

    &.рекомендация
        background: #1da09c
        color: white

.no-history
    text-align: center
    color: #999
    font-size: 14px
    padding: 20px

.dialog-body
    display: flex
    flex-direction: column
    gap: 12px

.dialog-row
    font-size: 14px

    span
        font-weight: bold
        color: #bbb

.dialog-block
    background: #272727
    border: 1px solid #333
    border-radius: 10px
    padding: 10px

    .block-title
        font-size: 13px
        font-weight: bold
        color: #bbb
        margin-bottom: 4px

    .block-content
        font-size: 13px
        color: #ccc

@media (max-width: 768px)
    .history-table
        font-size: 12px

        th, td
            padding: 10px

@media (max-width: 480px)
    .history-table
        font-size: 11px

        th, td
            padding: 8px
</style>
