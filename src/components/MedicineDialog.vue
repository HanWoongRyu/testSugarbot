<script setup>
import { ipcRenderer } from 'electron'

import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'

import moment from 'moment'

import { ModuleName, MessageType, APIName } from '@/constant'

const store = useStore()

const resultList = ref([])
const resultToTake = ref({})
const resultSelected = ref(false)

const showTimeout = ref(0)
const showPeriod = ref(0)
const showTime = ref(0)
const condition = ref(0)

const timers = reactive({
  showTimeout: null,
  showPeriod: null
})

const retry = ref(0)

const currentMedicine = ref({})
const intaking = ref('')
const intakingRate = ref(0)
const remainingDays = ref(365)

async function skip() {
  done('취소')
}

async function complete() {
  done('완료')
}

async function done(status) {
  clearTimeout(timers.showTimeout)
  clearTimeout(timers.showPeriod)

  timers.showTimeout = null
  timers.showPeriod = null
  retry.value = 0

  let temp = resultList.value
      .filter(one => one.id === resultToTake.value.id)
      .map(one => {
        return {
          ...one,
          status: status
        }
      })

  let ret = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_MEDICINE_RESULT, param: temp })
  if (ret === true) {
    resultToTake.value.status = status
  }

  resultSelected.value = false

  store.dispatch('hideMedicineDialog')
}

async function readResult() {
  try {
    if (resultList.value.length > 0) {
      return
    }

    let results = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_MEDICINE_RESULT, param: { start: moment().format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') } })
    if (results.length == 0) {
      let schedule = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_MEDICINE_SCHEDULE })
      let temp = schedule.map(one => {
        return {
          id: 0,
          medicine_name: one.medicine,
          timezone_name: one.timezone,
          alarm_time: one.alarm_time,
          intake_name: one.intake,
          taken: moment().format('YYYY-MM-DD HH:mm:ss'),
          status: '대기'
        }
      })

      let ret = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_MEDICINE_RESULT, param: temp })
      if (ret === true) {
        resultList.value = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_MEDICINE_RESULT, param: { start: moment().format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') } })
      }
    } else {
      resultList.value = results.map(one => one)
    }
  } catch (e) {
    console.log(`read result error: ${e}`)
  }
}

async function selectResult() {
  try {
    if (resultSelected.value === true) {
      return
    }

    if (resultList.value.length > 0) {
      let temp = resultList.value.filter(one => one.status === '대기')
      temp.sort((a, b) => moment(a.alarm_time).format('HH:mm:ss').localeCompare(moment(b.alarm_time).format('HH:mm:ss')))

      resultToTake.value = temp[0]
      resultSelected.value = true
    }
  } catch (e) {
    console.log(`select result error: ${e}`)
  }
}

async function checkResult() {
  try {
    if (resultSelected.value === false) {
      return
    }

    if (store.state.medicine.length > 0) {
      currentMedicine.value = store.state.medicine.find(one => one.name === resultToTake.value.medicine_name)

      let results = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_MEDICINE_RESULT, param: { start: currentMedicine.value.duration[0].format('YYYY-MM-DD'), end: currentMedicine.value.duration[1].format('YYYY-MM-DD') } })
      results = results.filter(one => one.status === '완료')
      intaking.value = `${results.length} / ${currentMedicine.value.total}`
      intakingRate.value = (results.length / currentMedicine.value.total * 100).toFixed(0)
      
      remainingDays.value = currentMedicine.value.duration[1].diff(moment(), 'days')
    }

    if (moment().format('HH:mm:ss').localeCompare(moment(resultToTake.value.alarm_time).format('HH:mm:ss')) > -1) {
      if (timers.showTimeout === null && timers.showPeriod === null) {
        if (remainingDays.value >= 0) {
          store.dispatch('showMedicineDialog')
        }

        retry.value += 1

        timers.showTimeout = setTimeout(async () => {
          if (showTimeout.value > 0) {
            if (retry.value < showTime.value) {
              store.dispatch('hideMedicineDialog')

              timers.showPeriod = setTimeout(() => {
                timers.showTimeout = null
                timers.showPeriod = null
              }, 1000 * showPeriod.value)
            } else {
              await skip()
            }
          }
        }, 1000 * showTimeout.value)
      }
    }
  } catch (e) {
    console.log(`check result error: ${e} | ${typeof(resultToTake.value)}`)
  }
}

async function process() {
  if (store.state.common.length > 0) {
      let conditions = store.state.common.find(one => one.key === '약복용 알림주기')
      showTimeout.value = conditions.val.split(',')[0]
      showPeriod.value = conditions.val.split(',')[1]
      showTime.value = conditions.val.split(',')[2]

      condition.value = store.state.common.find(one => one.key === '재처방 알림조건').val

      await readResult()
      await selectResult()
      await checkResult()
    }
  
  setTimeout(process, 1000)
}

onMounted(() => {
  setTimeout(process)
})
</script>

<template>
  <el-dialog
    :class="$style.container"
      v-model="store.state.medicineDialogVisible"
      fullscreen
      :show-close="false"
      :before-close="handleClose"
    >
    <template #header>
      <div style="display: flex;">
        <el-image style="display: inline-block; margin: 15px; width: 90px;" :src="`${require('@/assets/image/glucose.png')}`"></el-image>
        <div style="display: inline-block; margin-left: 10px; margin-top: 10px; color: #3B3838">
          <div>
            <span style="font-size: 48px; font-weight: bolder;">{{ `${resultToTake.medicine_name}` }}을 챙기세요!</span>
          </div>
          <div>
            <span>{{ `${resultToTake.timezone_name} ${resultToTake.intake_name}` }} 복용시간{{ `(${moment(resultToTake.alarm_time).format('HH:mm')})` }}입니다.</span>
          </div>
        </div>
      </div>
      <div style="position: fixed; top: 20px; right: 30px;">
        <el-button size="large" @click="skip">복용 안 함</el-button>
      </div>
    </template>
    <template #footer>
      <div style="display: flex; flex-direction: column; margin-top: 10px; color: #3B3838; font-size: 92px; font-weight: bolder;">
        <div style="padding-left: 115px; text-align: left;">
          <span>복용하시고 완료를</span>
        </div>
        <div style="padding-left: 115px; text-align: left;">
          <span>눌러주세요!</span>
        </div>
        <div style="display: inline-block; width: 200px; margin-left: 52px;">
          <el-button color="#3B3838" size="large" style="padding: 30px 40px; font-size: 24px;" @click="complete">완료</el-button>
        </div>
      </div>
      <div style="position: fixed; right: 75px; bottom: 50px; font-size: 18px; color: #3B3838; font-weight: bolder;">
        <div style="margin-bottom: 10px; text-align: left;">
          <span>복용횟수</span>
        </div>
        <div style="width: 590px; margin-bottom: 10px;">
          <el-progress :text-inside="true" :stroke-width="40" :percentage="intakingRate">
            <span style="font-size: 16px;">{{ intaking }}</span>
          </el-progress>
        </div>
        <div style="display: flex; align-items: center;" v-show="condition > 0">
          <el-image style="display: inline-block; width: 32px;" :src="`${require('@/assets/image/medicine_bag.png')}`"></el-image>
          <span style="color: #FC4242; margin-left: 8px;">복용기간이 {{ remainingDays }}일 남았어요. 필요하시면 지금쯤 다시 처방을 받으세요!</span>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style module>
.container {
  width: 100%;
  height: 100vh;
  background-color: white;
}
</style>
