<script setup>
import { } from 'vue'

import IMAGE_MEDICINE_TAKE from '@/assets/image/medicine_take.png'
import IMAGE_MEDICINE_NOT_TAKE from '@/assets/image/medicine_not_take.png'

defineProps({
  title: {
    type: String,
    default: ""
  },

  brief: {
    type: Array,
    default: () => {
      return []
    }
  }
})
</script>

<template>
  <div :class="$style.container">
    <div style="margin: 5px 5px; font-size: 22px; font-weight: bolder;">
      <span>{{ title }}</span>
    </div>
    <div v-for="(one, index) in brief" :key="index" style="display: flex; justify-content: left; margin-left: 30px; margin-bottom: 5px; font-weight: normal;">
      <el-image style="width: 32px; margin-right: 10px;" :src="one.taken === true ? IMAGE_MEDICINE_TAKE : IMAGE_MEDICINE_NOT_TAKE"></el-image>
      <div style="display: flex; align-items: center;">
        <span>{{ `${one.timezone_name} ${one.intake_name} (복용시간 ${one.alarm_time})` }}</span>
    </div>
    </div>
  </div>
</template>

<style module>
.container {
  display: flex;
  align-items: left;
  justify-content: center;
  flex-direction: column;
  padding: 10px;
}

</style>
