<script setup>
import { computed } from 'vue'

const props = defineProps({
  dateTime: {
    type: Date,
    default: new Date()
  }
})

const hourDegree = computed(() => {
  let hours = props.dateTime.getHours()
  if (hours > 12) {
    hours = hours - 12
  }
  return (hours / 12 * 360) + (props.dateTime.getMinutes() / 60 * (360 / 12))
})

const minuteDegree = computed(() => {
  return props.dateTime.getMinutes() / 60 * 360
})
</script>

<template>
  <div class="container">
    <div id="circle-outer" class="circle-outer">
      <div id="circle-inner" class="circle-inner">
      </div>
      <div id="hour-hand" class="hour-hand" :style="`transform: rotate(${hourDegree}deg)`">
      </div>
      <div id="minute-hand" class="minute-hand" :style="`transform: rotate(${minuteDegree}deg)`">
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background-color: #00000000;
}

.circle-outer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 4px solid #0E110F;
  border-radius: 50%;
}

.circle-inner {
  width: 8%;
  height: 8%;
  border: 4px solid #0E110F;
  border-radius: 50%;
}

.hour-hand {
  position: absolute;
  bottom: calc(50%);
  left: calc(50% - 2.5px);
  width: 5px;
  height: 20px;
  background-color: #0E110F;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  transform: rotate(45deg);
  transform-origin: bottom;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0) 5px, rgba(14, 17, 15, 1) 5px);
}

.minute-hand {
  position: absolute;
  bottom: calc(50%);
  left: calc(50% - 2.5px);
  width: 5px;
  height: 26px;
  background-color: #0E110F;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  transform: rotate(317deg);
  transform-origin: bottom;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0) 5px, rgba(14, 17, 15, 1) 5px);
}
</style>
