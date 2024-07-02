<script setup>
import { ipcRenderer } from 'electron'

import { ModuleName, Type, Method } from '@/constant'

const props = defineProps({
  name: String,
  routeName: String,
  isHighlighted: Boolean, 
  imageUrl: String,
  backgroundColor: String
})

function handleClick() {
  ipcRenderer.send(ModuleName.WEB_APPLICATION, { method: Method.GET, type: Type.VIEW, content: { data: props.routeName, error: false } })
}
</script>

<template>
  <div class="menu-item" @click="handleClick" :class="{ 'highlight': isHighlighted }" :style="{ backgroundColor: backgroundColor }">
    <span style="font-size: 28px; font-weight: bolder; color: white;">{{ name }}</span>
    <img :src="imageUrl" :alt="name" /> <!-- 이미지를 표시하기 위한 태그 -->
  </div>
</template>

<style scoped>
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 텍스트를 왼쪽으로 정렬 */
  flex: 1 1 30%;
  max-width: 30%;
  margin: 8px;
  padding: 4px 8px;
  box-sizing: border-box;
  cursor: pointer; /* 마우스 오버 시 커서 변경 */
  position: relative; /* 이미지를 기준으로 위치시키기 위함 */
  border: 6px solid #ffffff00; /* 강조 테두리 변경 */
}

.highlight {
  border: 6px solid #ffffff; /* 강조 테두리 변경 */
}

.menu-item img {
  width: 120px; /* 이미지 너비 설정 */
  height: auto; /* 비율을 유지하며 높이 조절 */
  position: absolute; /* 절대 위치 */
  right: 0; /* 오른쪽 정렬 */
  bottom: 0; /* 아래 정렬 */
  margin: 8px; /* 이미지와 하단 사이의 마진 */
}
</style>
