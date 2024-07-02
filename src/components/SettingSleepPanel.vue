<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

import moment from 'moment'

import { APIName } from '@/constant'

const store = useStore()

const common = computed(() => {
  return store.state.common
})

const modePeriod = ref(common.value.find(one => one.key === '수면모드 적용시간'))
const modeTimeout = ref(common.value.find(one => one.key === '수면모드 타임아웃'))

const sleepTimezoneReactive = ref(modePeriod.value.val.split(',').map(one => moment(one, 'HH:mm:ss')))

store.watch((state) => state.common, (newValue) => {
  modePeriod.value = newValue.find(one => one.key === '수면모드 적용시간')
  modeTimeout.value = newValue.find(one => one.key === '수면모드 타임아웃')
})

function read() {
  store.dispatch(APIName.GET_COMMON)
}

function save() {
  modePeriod.value.val = sleepTimezoneReactive.value.map(time => moment(time).format('HH:mm:ss')).join(',')

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
        <span style="font-size: 24px; font-weight: bolder;">수면모드</span>
        <el-button @click="read" size="large">읽어오기</el-button>
      </div>
      <div>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            적용시간 :
          </el-col>
          <el-col :span="20">
            <el-time-picker
              v-model="sleepTimezoneReactive[0]"
              :picker-options="{ selectableRange: '00:00:00 - 23:59:59' }"
              arrow-control
              size="large"
            />
            <span style="color: #606266; font-size: 14px;">&nbsp;To&nbsp;</span>
            <el-time-picker
              v-model="sleepTimezoneReactive[1]"
              :picker-options="{ selectableRange: '00:00:00 - 23:59:59' }"
              arrow-control
              size="large"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            타임아웃 :
          </el-col>
          <el-col :span="20">
            <el-input-number size="large" v-model="modeTimeout.val" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;초</el-text>
          </el-col>
        </el-row>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span></span>
        <el-button @click="save" size="large" style="color: white; background-color: #3B3838;">저장하기</el-button>
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
