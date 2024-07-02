<script setup>
import { ipcRenderer } from 'electron'

import { ModuleName, Method, Type, ViewName } from '@/constant'

function moveToWakeup() {
  ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content: {data: ViewName.WAKEUP, error:false} })
}
</script>

<template>
  <div class="container" @click="moveToWakeup">
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 100%;
  height: 100vh;
  background-color: black;
}
</style>