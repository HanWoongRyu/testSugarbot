<script setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  marker: Object,
  isSelected: Boolean,
  isRecording: Boolean,
  rotationDegree: Number,
})

const { marker, isSelected, isRecording, rotationDegree } = toRefs(props)

const markerWrapperStyle = computed(() => {
  const [x, y] = marker.value.coordinates.split(',')
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: `translate(-50%, -50%) scale(${isSelected.value ? 1.5 : 1})`,
    transformOrigin: 'center center',
    border: isRecording.value
      ? '2px solid red'
      : isSelected.value
      ? '2px dotted red'
      : 'none',
    padding: '2px',
    borderRadius: '5px',
    transition: 'transform 0.5s ease, border 0.5s ease',
  }
})

const imageStyle = computed(() => ({
  transform: `rotate(${rotationDegree.value}deg)`,
}))

const labelStyle = computed(() => ({
  marginTop: '2px',
}))
</script>

<template>
  <div :style="markerWrapperStyle" class="marker-wrapper">
    <el-image
      :src="`${require('@/assets/image/map.png')}`"
      :style="imageStyle"
      class="marker-image"
    />
    <div :style="labelStyle" class="marker-label">{{ marker.position }}</div>
  </div>
</template>

<style scoped>
.marker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-image {
  width: 20px;
  height: 20px;
}

.marker-label {
  white-space: nowrap;
  font-size: 12px;
  border-radius: 3px;
  padding: 2px 5px;
  position: relative;
}
</style>
