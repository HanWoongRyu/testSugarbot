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

const medicineTable = computed(() => {
  return store.state.medicine
})

const scheduleTable = computed(() => {
  return store.state.medicineSchedule
})

const medicineOption = computed(() => {
  return store.state.medicineOption
})

const common = computed(() => {
  return store.state.common
})

const alarmCondition = ref(common.value.find(one => one.key === '약복용 알림주기'))
const therapyCondition = ref(common.value.find(one => one.key === '재처방 알림조건'))

const alarmNotifyReactive = ref(alarmCondition.value.val.split(','))

let medicineIdListToDelete = []
let medicineScheduleIdListToDelete = []

store.watch((state) => state.common, (newValue) => {
  alarmCondition.value = newValue.find(one => one.key === '약복용 알림주기')
  therapyCondition.value = newValue.find(one => one.key === '재처방 알림조건')

  alarmNotifyReactive.value = alarmCondition.value.val.split(',')
})

function read() {
  store.dispatch(APIName.GET_MEDICINE)
  store.dispatch(APIName.GET_MEDICINE_SCHEDULE)

  store.dispatch(APIName.GET_COMMON)
}

function addMedicine() {
  medicineTable.value.push({
    id: moment().milliseconds(),
    name: "",
    total: 0,
    duration: [moment(), moment()]
  })
}

function removeMedicine(row, column) {
  if (column.no === 3) {
    for (let i = 0; i < medicineTable.value.length; i++) {
      if (medicineTable.value[i].id === row.id) {
        medicineTable.value.splice(i, 1)

        medicineIdListToDelete.push(row.id)
      }
    }
  }
}

function addMedicineSchedule() {
  if (medicineOption.value.length === 0) {
    return
  }
  
  scheduleTable.value.push({
    id: moment().milliseconds(),
    medicine_id: medicineOption.value[0].id,
    timezone_option_id: timezoneOption.value[0].id,
    alarm_time: moment(),
    intake_option_id:
    intakeOption.value[0].id,
    medicine: medicineOption.value[0].val,
    timezone: timezoneOption.value[0].val,
    intake: intakeOption.value[0].val
  })
}

function removeMedicineSchedule(row, column) {
  if (column.no === 4) {
    for (let i = 0; i < scheduleTable.value.length; i++) {
      if (scheduleTable.value[i].id === row.id) {
        scheduleTable.value.splice(i, 1)

        medicineScheduleIdListToDelete.push(row.id)
      }
    }
  }
}

function save() {
  let temp = medicineTable.value.map(one => {
    return {
      ...one,
      duration: `${moment(one.duration[0]).format('YYYY-MM-DD')},${moment(one.duration[1]).format('YYYY-MM-DD')}`
    }
  })
  store.dispatch(APIName.SET_MEDICINE, { ins: temp, del: medicineIdListToDelete })

  temp = scheduleTable.value.map(one => {
    return {
      id: one.id,
      medicine_id: one.medicine_id,
      timezone_option_id: one.timezone_option_id,
      alarm_time: moment(one.alarm_time).format('YYYY-MM-DD HH:mm:ss'),
      intake_option_id: one.intake_option_id
    }
  })
  store.dispatch(APIName.SET_MEDICINE_SCHEDULE, { ins: temp, del: medicineScheduleIdListToDelete })

  alarmCondition.value.val = alarmNotifyReactive.value.join(',')
  temp = common.value.map(one => {
    return {
      ...one
    }
  })
  store.dispatch(APIName.SET_COMMON, temp)

  medicineIdListToDelete = []
  medicineScheduleIdListToDelete = []
}
</script>

<template>
  <div :class="$style.container">
    <div>
      <div style="display: flex; justify-content: space-between;">
        <span style="font-size: 24px; font-weight: bolder;">약복용</span>
        <el-button size="large" @click="read">읽어오기</el-button>
      </div>
      <div>
        <el-row :gutter="20" :align='bottom' :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 11px; text-align: right;">
            약 :
          </el-col>
          <el-col :span="20">
            <el-table :data="medicineTable" style="width: 100%" @cell-click="removeMedicine">
              <el-table-column label="이름" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-input v-model="medicineTable[scope.$index].name" style="width: 240px" placeholder="" />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="처방횟수" width="180">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-input-number size="large" v-model="medicineTable[scope.$index].total" :min="0" :max="60" />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="복용기간" width="300">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-date-picker
                      v-model="medicineTable[scope.$index].duration"
                      type="daterange"
                      range-separator="To"
                      start-placeholder="Start date"
                      end-placeholder="End date"
                      :size="size"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="">
                <template #header="">
                  <div style="display: flex; align-items: center">
                    <el-button @click="addMedicine">+</el-button>
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
        <el-row :gutter="20" :align='bottom' :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 11px; text-align: right;">
            복용시간 :
          </el-col>
          <el-col :span="20">
            <el-table :data="scheduleTable" style="width: 100%" @cell-click="removeMedicineSchedule">
              <el-table-column label="약" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <el-select
                      v-model="scheduleTable[scope.$index].medicine"
                      placeholder=""
                      size="large"
                      style="width: 240px"
                      @change="(value) => scheduleTable[scope.$index].medicine_id = value"
                    >
                      <el-option
                        v-for="option in medicineOption"
                        :key="option.id"
                        :label="option.val"
                        :value="option.id"
                      />
                    </el-select>
                  </div>
                </template>
              </el-table-column>
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
              <el-table-column label="복용시간" width="180">
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
              <el-table-column label="복용조건" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <el-select
                      v-model="scheduleTable[scope.$index].intake"
                      placeholder=""
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
                    <el-button @click="addMedicineSchedule">+</el-button>
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
            복용 알림주기 :
          </el-col>
          <el-col :span="20">
            <el-input-number size="large" v-model="alarmNotifyReactive[0]" :min="0" :max="60" />
            <el-text class="mx-1">&nbsp;초 동안 표시,&nbsp;</el-text>
            <el-input-number size="large" v-model="alarmNotifyReactive[1]" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;초 간격으로&nbsp;</el-text>
            <el-input-number size="large" v-model="alarmNotifyReactive[2]" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;번 알림</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            재처방 알림조건 :
          </el-col>
          <el-col :span="20">
            <el-input-number size="large" v-model="therapyCondition.val" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;일 남았을 때부터</el-text>
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
