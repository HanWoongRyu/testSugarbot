<script setup>
import { ipcRenderer } from 'electron'

import { computed, reactive, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

import EmergencyEmail from '@/emergency-email'
import createP5 from '@/p5creator.js'

import { ModuleName, Method, Type, ViewName } from '@/constant'

const store = useStore()

const common = computed(() => {
  return store.state.common
})

const contactList = computed(() => {
  return store.state.sosContact
})

const CIRCLE_DIAMETER = 300

const drawer = reactive({
  divSize: {},
  p5: {},
  timer: {}
})

const receivers = reactive([])

function draw() {
  drawer.p5.clear()

  drawer.p5.noStroke()

  drawer.p5.fill('#FFFFFF11')
  drawer.p5.circle(drawer.divSize.width / 2, drawer.divSize.height / 2, CIRCLE_DIAMETER + (40 * 4))

  drawer.p5.fill('#FFFFFF66')
  drawer.p5.circle(drawer.divSize.width / 2, drawer.divSize.height / 2, CIRCLE_DIAMETER + (40 * 3))

  drawer.p5.fill('#FFFFFFAA')
  drawer.p5.circle(drawer.divSize.width / 2, drawer.divSize.height / 2, CIRCLE_DIAMETER + (40 * 2))

  drawer.p5.fill('#FFFFFFCC')
  drawer.p5.circle(drawer.divSize.width / 2, drawer.divSize.height / 2, CIRCLE_DIAMETER + (40 * 1))

  drawer.p5.fill('#FFFFFFFF')
  drawer.p5.circle(drawer.divSize.width / 2, drawer.divSize.height / 2, CIRCLE_DIAMETER + (40 * 0))

  drawer.p5.fill("#C82927")
  drawer.p5.textSize(64)
  drawer.p5.textStyle(drawer.p5.BOLD)
  drawer.p5.text('구조요청!', drawer.divSize.width / 2 - 140, drawer.divSize.height / 2 + 30)
}

onMounted(async () => {
  const container = document.getElementById("container")
  drawer.divSize = container.getBoundingClientRect()

  drawer.p5 = createP5('container', drawer.divSize.width, drawer.divSize.height, '#C82927')
  
  setTimeout(() => {
    draw()

    drawer.timer = setInterval(() => {
      draw()
    }, 1000)
  }, 100)

  let email = new EmergencyEmail(
    common.value.find(one => one.key === 'SOS 메일 서버').val,
    common.value.find(one => one.key === 'SOS 메일 사용자').val,
    common.value.find(one => one.key === 'SOS 메일 비밀번호').val,
  )
  contactList.value.forEach(async contact => {
    let result = await email.sendEmailTo(contact)
    if (result === true) {
      receivers.push(contact.person)
    }
  })
})

onUnmounted(() => {
  clearInterval(drawer.timer)
})
</script>

<template>
  <div id="container" class="container">
  </div>

  <div class="header">
    <el-image style="display: inline-block; width: 42px;" :src="`${require('@/assets/image/sos.png')}`"></el-image>
    <span style="position: absolute; top: 5px; margin-left: 5px; color: white; font-size: 28px; font-weight: bolder;">구조요청</span>
  </div>

  <div class="list-of-receiver">
    <div v-for="(receiver, index) in receivers" :key="index" style="padding: 4px; color: #EB9795; font-size: 20px; text-align: right;">
      {{ receiver }}에게 알림
    </div>
  </div>

  <el-button style="position: fixed; right: 9px; bottom: 9px; color: #DCDFE6; background-color: #00000000" @click="ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content: { data: ViewName.EXIT, error: false } })">&lt;</el-button>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 100%;
  height: 100vh;
  background-color: #C82927;
}

.header {
  width: 100%;
  position: fixed;
  left: 20px;
  top: 10px;
}

.list-of-receiver {
  position: fixed;
  right: 30px;
  top: 130px;
  padding: 15px;
  background-color: #C82927CC;
  /* border: 1px dashed white; */
}
</style>