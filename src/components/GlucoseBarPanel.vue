<script setup>
import { computed } from 'vue'

// const RANGE_MIN = 0
const RANGE_MAX = 350

const props = defineProps({
  size: {
    type: Number,
    default: 150
  },

  level: {
    type: Number,
    default: 80
  },

  icon: {
    type: String,
    default: ""
  }
})

const gaugeColor = computed(() => {
  let color = "EF1A25"

  if (props.level >= 204) color = "EF1A25"
  else if (props.level >= 187) color = "ED1B24"
  else if (props.level >= 170) color = "FF7E29"
  else if (props.level >= 153) color = "FEC80E"
  else if (props.level >= 135) color = "FEF101"
  else if (props.level >= 118) color = "E1E721"
  else if (props.level >= 100) color = "98CC00"
  else if (props.level >= 83) color = "23B04F"
  else if (props.level >= 65) color = "22B14C"
  else color = "22B14C"

  return color
})
</script>

<template>
  <div :class="$style.container" :style="`width: ${size * 0.2}px; height: ${size}px; border-radius: ${size * 0.04}px;`">
    <div class="bar" :style="`width: ${size * 0.2}px; height: ${level / RANGE_MAX * 100}%; background-color: #${gaugeColor}; border-radius: ${size * 0.04}px;`">
    </div>
  </div>
  <div :style="`width: ${size * 0.2}px; height: ${size * 0.2}px; margin-top: 12px;`">
    <el-image :src="icon" />
  </div>
</template>

<style module>
.container {
  display: flex;
  flex-direction: column-reverse;
  background-color: #AFAFAF;
}
</style>
