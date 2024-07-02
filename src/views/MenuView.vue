<script setup>
import { ipcRenderer } from 'electron'

import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

import { ModuleName, Method, Type, ViewName } from '@/constant'

import MenuItem from '@/components/MenuItem.vue';

const store = useStore()

const common = computed(() => {
  return store.state.common
})

const switchingPeriod = ref(common.value.find(one => one.key === '메뉴 전환주기').val)

store.watch((state) => state.common, (newValue) => {
  switchingPeriod.value = newValue.find(one => one.key === '메뉴 전환주기').val

  rotateMenu()
})

const menus = ref([
  { 
    name: "혈당검사", 
    routeName: 'glucose',
    description: "혈당검사", 
    imageURL:require('@/assets/image/glucose.png'), 
    backgroundColor:'#10859B'
  },
  { name: "약복용", 
    routeName: 'medicine',
    description: "약복용", 
    imageURL:require('@/assets/image/medicine.png'), 
    backgroundColor:'#128F03'
  },
  { name: "말벗", 
    routeName: 'buddy', 
    description: "말벗",
    imageURL:require('@/assets/image/voice.png'), 
    backgroundColor:'#8F009B'
  },
  { 
    name: "영상 통화",
    routeName: 'call', 
    description: "영상통화", 
    imageURL:require('@/assets/image/video.png'),
    backgroundColor:'#1D6CED'
  },
  { name: "탐색", 
    routeName: 'search',
    description: "탐색",
    imageURL:require('@/assets/image/search.png'), 
    backgroundColor:'#F6BB00'
  },
  { name: "구조알림",
    routeName: 'sos', 
    description: "구조요청", 
    imageURL:require('@/assets/image/sos.png'),
    backgroundColor:'#C82927'
  }
])

const selectedIndex = ref(0)

onMounted(() => {
  rotateMenu()
})

function rotateMenu() {
  setInterval(() => {
    selectedIndex.value = (selectedIndex.value + 1) % menus.value.length;
  }, switchingPeriod.value * 1000);
}
</script>

<template>
  <div class="container">
    <el-image style="position: fixed; top: 6px; right: 6px; width: 48px;" :src="`${require('@/assets/image/settings.png')}`" @click="store.dispatch('showSettingDialog')"></el-image>
    <div class="content-container">
      <div class="menu-container">
        <MenuItem
          v-for="(menu, index) in menus"
          :key="index"
          :name="menu.name"
          :routeName="menu.routeName"
          :isHighlighted="selectedIndex === index"
          :imageUrl="menu.imageURL"
          :backgroundColor="menu.backgroundColor"
        >
        </MenuItem>
      </div>
      <div class="description-container" v-if="selectedIndex !== null">
        <div class="speech-bubble">
          <img src="@/assets/image/speech_bubble_quot.png" alt="Speech Bubble" class="bubble-image">
          <p class="bubble-text">장군아, <br/>{{ menus[selectedIndex].description }}!</p>
        </div>
        <p class="menu-selection-prompt">원하시는 메뉴를 선택하세요</p>
      </div>
    </div>
  </div>

  <el-button style="position: fixed; right: 9px; bottom: 9px; color: #DCDFE6; background-color: #00000000" @click="ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content: { data: ViewName.EXIT, error: false } })">&lt;</el-button>
</template>

<style>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width:100%;
  height:100vh;
  background-color: #1E1E1E;
}

.content-container {
  width: 1000px;
  height: 450px;
  display: flex;
  justify-content: space-between;
}

.menu-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-width: 65%;
}

.description-container {
  position: relative;
  flex-basis: 30%;
  max-width: 35%;
  padding-top: 50px;
}

.speech-bubble {
  position: relative;
  text-align: center;
}

.bubble-image {
  width: 80%;
  height: auto;
}

.bubble-text {
  position: absolute;
  top: 28%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 34px;
}

.menu-selection-prompt {
  color: white;
  text-align: center;
  margin-top: 70px;
  font-size: 18px;
  color: #BFBFBF;
}
</style>
