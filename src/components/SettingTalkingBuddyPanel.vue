<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

import { APIName } from '@/constant'

const store = useStore()

const common = computed(() => {
  return store.state.common
})

const username = ref(common.value.find(one => one.key === '말벗 사용자'))
const password = ref(common.value.find(one => one.key === '말벗 API KEY'))

store.watch((state) => state.common, (newValue) => {
  username.value = newValue.find(one => one.key === '말벗 사용자')
  password.value = newValue.find(one => one.key === '말벗 API KEY')
})

function read() {
  store.dispatch(APIName.GET_COMMON)
}

function save() {
  let temp = common.value.map(one => {
    return {
      ...one
    }
  })
  store.dispatch(APIName.SET_COMMON, temp)
}
</script>

<template>
  <div :class="$style.container">
    <div>
      <div style="display: flex; justify-content: space-between;">
        <span style="font-size: 24px; font-weight: bolder;">말벗</span>
        <el-button size="large" @click="read">읽어오기</el-button>
      </div>
      <div>
        <el-row :gutter="20" :class="$style['el-row']" v-if="false">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            사용자 :
          </el-col>
          <el-col :span="20">
            <el-input size="large" v-model="username.val" style="width: 270px;" />
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            API Key :
          </el-col>
          <el-col :span="20">
            <el-input size="large" type="password" v-model="password.val" style="width: 270px;" />
          </el-col>
        </el-row>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span></span>
        <el-button size="large" style="color: white; background-color: #3B3838;" @click="save">저장하기</el-button>
      </div>
    </div>
  </div>
</template>

<style module>
.container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 0 140px;
  padding-bottom: 95px;
  text-align: left;
  background-color: #00ff0000;
}

.el-row {
  margin: 15px 0;
}
</style>
