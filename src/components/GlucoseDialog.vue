<script setup>
import { ipcRenderer } from 'electron'

import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

import moment from 'moment'

import Glumeter from '@/glumeter'

import { ModuleName, MessageType, APIName } from '@/constant'

import GlucoseGaugePanel from '@/components/GlucoseGaugePanel.vue'
import HbA1cGaugePanel from '@/components/HbA1cGaugePanel.vue'
import GlucoseBarPanel from '@/components/GlucoseBarPanel.vue'

import IMAGE_SUNRISE from '@/assets/image/sunrise.png'
import IMAGE_BOWL from '@/assets/image/bowl.png'
import IMAGE_BOWL_EMPTY from '@/assets/image/bowl_empty.png'
import IMAGE_ZZZ from '@/assets/image/zzz.png'

const store = useStore()

const resultList = ref([])
const resultToCheck = ref()
const resultSelected = ref(false)

const showTimeout = ref(0)
const showPeriod = ref(0)
const showTime = ref(0)
const HbA1cRange = ref(0)
const HbA1c = ref(0)

const timers = reactive({
  showTimeout: null,
  showPeriod: null
})

const retry = ref(0)

const isGlumeterReading = ref(false)
const bloodSugar = ref(0)

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
      .filter(one => one.id === resultToCheck.value.id)
      .map(one => {
        return {
          ...one,
          level: bloodSugar.value,
          status: status
        }
      })

  let ret = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_GLUCOSE_RESULT, param: temp })
  if (ret === true) {
    bloodSugar.value = 0
    resultToCheck.value.status = status
  }

  resultSelected.value = false

  store.dispatch('hideGlucoseDialog')
}

async function readResult() {
  try {
    if (resultList.value.length > 0) {
      return
    }

    let results = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_GLUCOSE_RESULT, param: { start: moment().format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') } })
    if (results.length == 0) {
      let schedule = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_GLUCOSE_SCHEDULE })
      let temp = schedule.map(one => {
        return {
          id: 0,
          timezone_name: one.timezone,
          alarm_time: one.alarm_time,
          intake_name: one.intake,
          tested: moment().format('YYYY-MM-DD HH:mm:ss'),
          level: 0,
          status: '대기'
        }
      })

      let ret = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_GLUCOSE_RESULT, param: temp })
      if (ret === true) {
        resultList.value = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_GLUCOSE_RESULT, param: { start: moment().format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') } })
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

      resultToCheck.value = temp[0]
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

    if (moment().format('HH:mm:ss').localeCompare(moment(resultToCheck.value.alarm_time).format('HH:mm:ss')) > -1) {
      if (timers.showTimeout === null && timers.showPeriod === null) {
        store.dispatch('showGlucoseDialog')

        retry.value += 1

        timers.showTimeout = setTimeout(async () => {
          if (showTimeout.value > 0) {
            if (retry.value < showTime.value) {
              store.dispatch('hideGlucoseDialog')

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
    console.log(`check result error: ${e} | ${typeof(resultToCheck.value)}`)
  }
}

async function process() {
  if (store.state.common.length > 0) {
    let conditions = store.state.common.find(one => one.key === '혈당검사 알림주기')
    showTimeout.value = conditions.val.split(',')[0]
    showPeriod.value = conditions.val.split(',')[1]
    showTime.value = conditions.val.split(',')[2]

    HbA1cRange.value = store.state.common.find(one => one.key === '당화혈색소 적용기간').val

    let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_GLUCOSE_AVERAGE, param: { start: moment().subtract(HbA1cRange.value, 'months').format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') } })
    HbA1c.value = result[0].AVERAGE > 0 ? ((result[0].AVERAGE + 46.7) / 28.7).toFixed(1) : 0

    await readResult()
    await selectResult()
    await checkResult()
  }
  
  setTimeout(process, 1000)
}

function readGlumeter() {
  if (isGlumeterReading.value === true) {
    return
  }

  isGlumeterReading.value = true

  let address = store.state.common.find(one => one.key === '혈당검사기')
  const glumeter = new Glumeter(address.val)
  let func = async () => {
    bloodSugar.value = await glumeter.read()

    isGlumeterReading.value = false

    resultList.value.forEach(one => {
      if (one.id === resultToCheck.value.id) {
        one.level = bloodSugar.value
      }
    })
  }
  func()
}

const levelByIndex = computed(() => {
  return (index) => {
    if (resultList.value < 8) {
      return 0
    }

    resultList.value.sort((a, b) => moment(a.alarm_time).format('HH:mm:ss').localeCompare(moment(b.alarm_time).format('HH:mm:ss')))

    return resultList.value[index].level
  }
})

onMounted(() => {
  setTimeout(process)
})
</script>

<template>
  <el-dialog
    :class="$style.container"
      v-model="store.state.glucoseDialogVisible"
      fullscreen
      :show-close="false"
      :before-close="handleClose"
    >
    <template #header>
      <div style="display: flex;">
        <el-image style="display: inline-block; margin: 15px; width: 90px;" :src="`${require('@/assets/image/glucose.png')}`"></el-image>
        <div style="display: inline-block; margin-left: 10px; margin-top: 10px; color: #3B3838">
          <div>
            <span style="font-size: 48px; font-weight: bolder;">혈당을 검사하세요!</span>
          </div>
          <div>
            <span>{{ `${resultToCheck.timezone_name} ${resultToCheck.intake_name}` }} 검사시간{{ `(${moment(resultToCheck.alarm_time).format('HH:mm')})` }}입니다.</span>
          </div>
        </div>
      </div>
      <div style="position: fixed; top: 20px; right: 30px;">
        <el-button size="large" @click="skip">검사 안 함</el-button>
      </div>
      <div style="position: fixed; top: 20px; right: 145px;">
        <el-button color="#3B3838" size="large" style="width: 120px;" @click="complete">완료</el-button>
      </div>
    </template>
    <template #footer>
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 0px;">
        <div style="display: flex; width: 1200px; height: 500px;">
          <div style="width: 60%; height: 100%;">
            <div style="display: flex; align-items: center; justify-content: center; height: 50%;" v-loading="isGlumeterReading">
              <div>
                <span style="color: #3B3838; font-size: 250px; font-weight: bolder;" @click="readGlumeter">{{ bloodSugar > 0 ? bloodSugar : '...' }}</span>
              </div>
              <div style="display: flex; align-items: end; height: 100%;">
                <span style="color: #3B3838; font-size: 55px; font-weight: bolder;" v-if="bloodSugar > 0">mg/dl</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-evenly; height: 46%; background-color: #F2F2F2; margin: 20px; border-radius: 10px;">
              <div>
                <div>
                  <GlucoseBarPanel :icon="IMAGE_SUNRISE" :level="levelByIndex(0)" />
                </div>
                <div>
                  <span>기상</span>
                </div>
              </div>
              <div>
                <div>
                  <div style="display: inline-block; margin-right: 15px;">
                    <GlucoseBarPanel :icon="IMAGE_BOWL" :level="levelByIndex(1)" />
                  </div>
                  <div style="display: inline-block;">
                    <GlucoseBarPanel :icon="IMAGE_BOWL_EMPTY" :level="levelByIndex(2)" />
                  </div>
                </div>
                <div style="text-align: center;">
                  <span>아침</span>
                </div>
              </div>
              <div>
                <div>
                  <div style="display: inline-block; margin-right: 15px;">
                    <GlucoseBarPanel :icon="IMAGE_BOWL" :level="levelByIndex(3)" />
                  </div>
                  <div style="display: inline-block;">
                    <GlucoseBarPanel :icon="IMAGE_BOWL_EMPTY" :level="levelByIndex(4)" />
                  </div>
                </div>
                <div style="text-align: center;">
                  <span>점심</span>
                </div>
              </div>
              <div>
                <div>
                  <div style="display: inline-block; margin-right: 15px;">
                    <GlucoseBarPanel :icon="IMAGE_BOWL" :level="levelByIndex(5)" />
                  </div>
                  <div style="display: inline-block;">
                    <GlucoseBarPanel :icon="IMAGE_BOWL_EMPTY" :level="levelByIndex(6)" />
                  </div>
                </div>
                <div style="text-align: center;">
                  <span>저녁</span>
                </div>
              </div>
              <div>
                <div>
                  <GlucoseBarPanel :icon="IMAGE_ZZZ" :level="levelByIndex(7)" />
                </div>
                <div>
                  <span>취침</span>
                </div>
              </div>
            </div>
          </div>
          <div style="width: 40%; height: 100%;">
            <div style="display: flex; align-items: center; justify-content: center; height: 50%;">
              <div>
                <GlucoseGaugePanel size="360" :level="bloodSugar" />
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; height: 50%;">
              <div>
                <HbA1cGaugePanel size="360" :level="HbA1c" />
              </div>
            </div>
          </div>
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