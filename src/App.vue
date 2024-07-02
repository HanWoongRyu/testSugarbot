<script setup>
import { ipcRenderer } from 'electron'

import { computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'

import { ModuleName, Type ,APIName, Method } from '@/constant'

import GlucoseDialog from '@/components/GlucoseDialog.vue'
import MedicineDialog from '@/components/MedicineDialog.vue'
import SettingDialog from '@/components/SettingDialog.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'

import WebRTC from '@/webrtcwrapper'

const router = useRouter()
const store = useStore()
const webrtc = new WebRTC()
webrtc

const glucoseDialogVisible = computed(() => {
  return store.state.glucoseDialogVisible
})

const medicineDialogVisible = computed(() => {
  return store.state.medicineDialogVisible
})

const settingDialogVisible = computed(() => {
  return store.state.settingDialogVisible
})

const errorDialogVisible = computed(() => {
  return store.state.settingDialogVisible
})

ipcRenderer.on(ModuleName.ELECTRON_BACKGROUND, async () => {
  await store.dispatch(APIName.GET_DIRECTION_OPTION)
  await store.dispatch(APIName.GET_INTAKE_OPTION)
  await store.dispatch(APIName.GET_TIMEZONE_OPTION)

  await store.dispatch(APIName.GET_COMMON)
  await store.dispatch(APIName.GET_GLUCOSE_SCHEDULE)
  await store.dispatch(APIName.GET_MEDICINE)
  await store.dispatch(APIName.GET_MEDICINE_SCHEDULE)
  await store.dispatch(APIName.GET_LOCATION)
  await store.dispatch(APIName.GET_VCALL_CONTACT)
  await store.dispatch(APIName.GET_SOS_CONTACT)

  ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content: { data: 'wakeup', error: false } })


})

ipcRenderer.on(ModuleName.VIEW_MANAGER, (sender, payload) => {
  sender

  if (payload.type !== Type.VIEW) {
    return
  }

  router.push({ name: payload.content.data })
})
</script>

<template>
  <router-view/>

  <GlucoseDialog :visible="glucoseDialogVisible" />
  <MedicineDialog :visible="medicineDialogVisible" />
  <SettingDialog :visible="settingDialogVisible" />
  <ErrorDialog :visible="errorDialogVisible" />

</template>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
} */
</style>
