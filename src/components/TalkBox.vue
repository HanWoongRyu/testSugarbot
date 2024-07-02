<script setup>

const state = defineProps({
  mine: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ""
  }
})

</script>

<template>
  <div :class="`${$style.container}`" :style="`justify-content: ${state.mine ? 'right' : 'left'}`">
    <div :class="`${$style.talkbox} talker: ${state.mine ? $style.iam : $style.another}`">
      {{ state.text }}
    </div>
  </div>
</template>

<style module>
.container {
  display: flex;
  width: 100%;
  color: white;
}

.talkbox {
  position: relative;
  max-width: 40%;
  margin: 10px 15px;
  padding: 10px;
  border-radius: 10px;
  font-size: 24px;
}

.iam {
  background-color: #00AD6A;
}

.iam::after {
  position: absolute;
  content: '';
  right: 5px;
  bottom: -14px;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  border-left: 15px solid transparent;
  border-right: 18px solid #00AD6A;
}

.another {
  background-color: #233BFF;
}

.another::after {
  position: absolute;
  content: '';
  left: 5px;
  bottom: -14px;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  border-left: 18px solid #233BFF;
  border-right: 15px solid transparent;
}
</style>
