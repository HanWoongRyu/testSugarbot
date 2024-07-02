<script setup>
import { ipcRenderer } from 'electron'

import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

import moment from 'moment'

import createP5 from '@/p5creator.js'

import { ModuleName, Type, ViewName, Method } from '@/constant'

const store = useStore()

const drawer = reactive({
  divSize: {},
  p5: {},
  timer: {},
  sleepInterval: {}
})

const common = computed(() => {
  return store.state.common
})

function drawEyeLeft() {
  drawer.p5.noFill()
  drawer.p5.stroke('white')
  drawer.p5.strokeWeight(10)

  drawer.p5.circle(drawer.divSize.width / 2 - 175, drawer.divSize.height / 2, 160)
}

function drawEyeRight() {
  drawer.p5.noFill()
  drawer.p5.stroke('white')
  drawer.p5.strokeWeight(10)

  drawer.p5.circle(drawer.divSize.width / 2 + 175, drawer.divSize.height / 2, 160)
}

function draw() {
  drawer.p5.clear()
  
  drawEyeLeft()
  drawEyeRight()
}

function moveToSleep() {
  let range = common.value.find(one => one.key === '수면모드 적용시간').val.split(',')
  let now = moment().format('HH:mm:ss')

  if (now >= range[0] || now <= range[1]) {
    ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content: { data: 'sleep', error: false } })
  }
}

function moveToMenu() {
  ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content: { data: 'menu', error: false } })
}

onMounted(() => {
  const container = document.getElementById("container")
  drawer.divSize = container.getBoundingClientRect()

  drawer.p5 = createP5('container', drawer.divSize.width, drawer.divSize.height, '#1E1E1E')

  setTimeout(() => {
    draw()

    drawer.timer = setInterval(draw, 1000)

    drawer.sleepInterval = setInterval(moveToSleep, common.value.find(one => one.key === '수면모드 타임아웃').val * 1000)
  }, 100)
})

onUnmounted(() => {
  clearInterval(drawer.timer)
  clearInterval(drawer.sleepInterval)
})
</script>

<template>
  <div id="container" class="container" @click="moveToMenu">
  </div>

  <el-button style="position: fixed; right: 9px; bottom: 9px; color: #DCDFE6; background-color: #00000000" @click="ipcRenderer.send(ModuleName.WEB_APPLICATION, { method:Method.POST, type: Type.VIEW, content: { data: ViewName.EXIT, error: false } })">&lt;</el-button>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 100%;
  height: 100vh;
  background-color: #1E1E1E;
}
</style>
