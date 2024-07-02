<script setup>
import { } from 'vue'

defineProps({
  HbA1c: {
    type: Number,
    default: 999
  },
  period: {
    type: Number,
    default: 3
  }
})
</script>

<template>
  <div :class="$style.container">
    <div>
        <el-image style="display: inline-block; width: 62px;" :src="`${require('@/assets/image/HbA1c.png')}`"></el-image>
    </div>
    <div style="flex-grow: 1; padding-left: 8px;">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <span>당화혈색소</span>
        </div>
        <div style="width: 80px; text-align: right; font-size: 50px; font-weight: bolder;">
          <span>{{ HbA1c }}</span>
        </div>
        <div style="display: flex; align-items: end; width: 45px;">
          <span>%</span>
        </div>
      </div>
    </div>
    <div style="position: absolute; left: 0px; bottom: 2px; width: 100%; text-align: center; font-size: 12px;">
      <span>* 최근 {{ period }}개월치 검사 결과로 산출한 예상값입니다.</span>
    </div>
  </div>
</template>

<style module>
.container {
  display: flex;
  align-items: center;
  justify-content: left;
  height: 86px;
  margin: 2.3px;
  padding: 5px 15px;
  background-color: #F57EA8;
  border-radius: 15px;
}

</style>
