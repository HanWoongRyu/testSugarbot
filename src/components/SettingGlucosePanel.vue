<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

import moment from 'moment'

import { APIName } from '@/constant'

const store = useStore()

const intakeOption = computed(() => {
  return store.state.intakeOption
})

const timezoneOption = computed(() => {
  return store.state.timezoneOption
})

const scheduleTable = computed(() => {
  return store.state.glucoseSchedule
})

const common = computed(() => {
  return store.state.common
})

const alarmCondition = ref(common.value.find(one => one.key === '혈당검사 알림주기'))
const HbA1cRange = ref(common.value.find(one => one.key === '당화혈색소 적용기간'))

const alarmConditionReactive = ref(alarmCondition.value.val.split(','))

let idListToDelete = []

store.watch((state) => state.common, (newValue) => {
  alarmCondition.value = newValue.find(one => one.key === '혈당검사 알림주기')
  HbA1cRange.value = newValue.find(one => one.key === '당화혈색소 적용기간')

  alarmConditionReactive.value = alarmCondition.value.val.split(',')
})

function read() {
  store.dispatch(APIName.GET_GLUCOSE_SCHEDULE)

  store.dispatch(APIName.GET_COMMON)
}

function add() {
  scheduleTable.value.push({
    id: moment().milliseconds(),
    timezone_option_id: timezoneOption.value[0].id,
    alarm_time: moment(),
    intake_option_id: intakeOption.value[0].id,
    timezone: timezoneOption.value[0].val,
    intake: intakeOption.value[0].val
  });
}

function remove(row, column) {
  if (column.no === 3) {
    for (let i = 0; i < scheduleTable.value.length; i++) {
      if (scheduleTable.value[i].id === row.id) {
        scheduleTable.value.splice(i, 1)
        
        idListToDelete.push(row.id);
      }
    }
  }
}

function save() {
  let temp = scheduleTable.value.map(one => {
    return {
      id: one.id,
      timezone_option_id: one.timezone_option_id,
      alarm_time: moment(one.alarm_time).format('YYYY-MM-DD HH:mm:ss'),
      intake_option_id: one.intake_option_id
    }
  })
  store.dispatch(APIName.SET_GLUCOSE_SCHEDULE, { ins: temp, del: idListToDelete })

  alarmCondition.value.val = alarmConditionReactive.value.join(',')
  temp = common.value.map(one => {
    return {
      ...one
    }
  })
  store.dispatch(APIName.SET_COMMON, temp)

  idListToDelete = []
}
</script>

<template>
  <div :class="$style.container">
    <div>
      <div style="display: flex; justify-content: space-between;">
        <span style="font-size: 24px; font-weight: bolder;">혈당검사</span>
        <el-button size="large" @click="read">읽어오기</el-button>
      </div>
      <div>
        <el-row :gutter="20" :align='bottom' :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 11px; text-align: right;">
            검사시간 :
          </el-col>
          <el-col :span="20">
            <el-table :data="scheduleTable" style="width: 100%" @cell-click="remove">
              <el-table-column label="시간대" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <el-select
                      v-model="scheduleTable[scope.$index].timezone"
                      placeholder=""
                      size="large"
                      style="width: 240px"
                      @change="(value) => scheduleTable[scope.$index].timezone_option_id = value"
                    >
                      <el-option
                        v-for="option in timezoneOption"
                        :key="option.id"
                        :label="option.val"
                        :value="option.id"
                      />
                    </el-select>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="검사시간" width="180">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-time-picker
                      v-model="scheduleTable[scope.$index].alarm_time"
                      arrow-control
                      placeholder=""
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="검사조건" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <el-select
                      v-model="scheduleTable[scope.$index].intake"
                      placeholder="식"
                      size="large"
                      style="width: 240px"
                      @change="(value) => scheduleTable[scope.$index].intake_option_id = value"
                    >
                      <el-option
                        v-for="option in intakeOption"
                        :key="option.id"
                        :label="option.val"
                        :value="option.id"
                      />
                    </el-select>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="">
                <template #header="">
                  <div style="display: flex; align-items: center">
                    <el-button @click="add">+</el-button>
                  </div>
                </template>
                <template #default="">
                  <div style="display: flex; align-items: center">
                    <el-button>-</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            검사 알림주기 :
          </el-col>
          <el-col :span="20">
            <el-input-number size="large" v-model="alarmConditionReactive[0]" :min="0" :max="60" />
            <el-text class="mx-1">&nbsp;초 동안 표시,&nbsp;</el-text>
            <el-input-number size="large" v-model="alarmConditionReactive[1]" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;초 간격으로&nbsp;</el-text>
            <el-input-number size="large" v-model="alarmConditionReactive[2]" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;번 알림</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            당화혈색소 :
          </el-col>
          <el-col :span="20">
            <el-input-number size="large" v-model="HbA1cRange.val" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;개월&nbsp;(지정일부터 지난 {{ HbA1cRange.val }}개월 검사결과 반영)</el-text>
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
