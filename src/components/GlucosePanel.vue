<script setup>
import { } from 'vue'

import ClockPanel from '@/components/ClockPanel.vue';

defineProps({
  timezone_name: {
    type: String,
    default: '아침'
  },
  before_meal: {
    type: Number,
    default: -1
  },
  after_meal: {
    type: Number,
    default: -1
  },
  appointed: {
    type: Number,
    default: -1
  },
  custom_background_color: {
    type: String,
    defalut: '00000000'
  }
})
</script>

<template>
  <div :class="$style.container" :style="`--background: #${custom_background_color};`">
    <div>
        <ClockPanel style="width: 64px; height: 64px;" />
        <div style="margin-top: 3px; text-align: center; font-size: 14px;">
            <span>{{ timezone_name }}</span>
        </div>
    </div>
    <div style="flex-grow: 1; padding-left: 8px;">
        <div :style="`display: flex; justify-content: space-between; visibility: ${before_meal >= 0 || appointed >= 0 ? 'visiable' : 'hidden'};`">
            <div>
                <span>{{ before_meal >= 0 ? '식전' : (appointed >= 0 ? '지정' : '') }}</span>
            </div>
            <div style="width: 140px; text-align: right; font-size: 32px; font-weight: bolder;">
                <span>{{ before_meal >= 0 ? before_meal : (appointed >= 0 ? appointed : 0) }}</span>
            </div>
            <div style="display: flex; align-self: end; width: 45px;">
                <span>mg/dl</span>
            </div>
        </div>
        <div :style="`display: flex; justify-content: space-between; visibility: ${after_meal >= 0 ? 'visiable' : 'hidden'};`">
            <div>
                <span>식후</span>
            </div>
            <div style="width: 140px; text-align: right; font-size: 32px; font-weight: bolder;">
                <span>{{ after_meal >= 0 ? after_meal : 0 }}</span>
            </div>
            <div style="display: flex; align-self: end; width: 45px;">
                <span>mg/dl</span>
            </div>
        </div>
    </div>
  </div>
</template>

<style module>
.container {
  display: flex;
  align-items: center;
  justify-content: left;
  height: 88.4px;
  margin: 2.4px;
  padding: 5px 15px;
  background-color: var(--background, #F57EA8);
  border-radius: 15px;
}

</style>
