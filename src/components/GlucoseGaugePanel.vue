<script setup>
import { computed } from 'vue'

const UNIT = "mg/dl"
// const RANGE_MIN = 0
const RANGE_MAX = 350

const props = defineProps({
  size: {
    type: Number,
    default: 400
  },

  level: {
    type: Number,
    default: 80
  },
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
  <div :class="$style.container">
    <div :class="$style.gauge" :style="`width: ${size}px; --rotation: ${level / RANGE_MAX * 180}deg; --color: #${gaugeColor}; --background: #e9ecef;`">
      <div :class="$style.percentage"></div>
      <div :class="$style.mask"></div>
      <span :class="$style.value"><span :style="`font-size: ${size * 0.155}px; font-weight: bolder; color: #3B3838;`">{{ level > 0 ? level : '...' }}</span><span :style="`font-size: ${size * 0.05}px; color: #3B3838;`">{{ level > 0 ? UNIT : '' }}</span></span>
    </div>
  </div>
  <div :class="$style.container">
    <span :class="$style.value" :style="`font-size: ${size * 0.06}px; color: #3B3838`">혈당</span>
  </div>
</template>

<style module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge {
  position: relative;
  border-radius: 50% / 100% 100% 0 0;
  background-color: var(--color, #a22);
  overflow: hidden;
}
.gauge:before{
  content: "";
  display: block;
  padding-top: 50%;
}

.gauge .chart {
  overflow: hidden;
}

.gauge .mask {
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 0;
  top: 40%;
  background-color: #fff;
  border-radius: 50% / 100% 100% 0 0;
}

.gauge .percentage {
  position: absolute;
  top: -1px;
  left: -1px;
  bottom: 0;
  right: -1px;
  background-color: var(--background, #aaa);
  transform: rotate(var(--rotation));
  transform-origin: bottom center;
  transition-duration: 600;
}

.gauge:hover {
  --rotation: 100deg;
}

.gauge .value {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
}

.gauge .min {
  position: absolute;
  bottom: 0;
  left: 5%;
}

.gauge .max {
  position: absolute;
  bottom: 0;
  right: 5%;
}
</style>
