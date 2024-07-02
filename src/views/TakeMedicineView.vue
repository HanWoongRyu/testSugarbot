<script setup>
import { ipcRenderer } from 'electron'

import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

import moment from 'moment'

import { ModuleName, Method, Type, ViewName, APIName } from '@/constant'

import MedicinePanel from '@/components/MedicinePanel.vue'

const store = useStore()

const datePicked = ref(moment())

const medicineBrief = ref([])

store.watch((state) => state.medicineResult, (newValue) => {
  medicineBrief.value = []

  let medicineNames = [...new Set(newValue.map(one => one.medicine_name))]
  medicineNames.forEach(medicineName => {
    let resultList = newValue.filter(one => one.medicine_name === medicineName)
    resultList.sort((a, b) => moment(a.alarm_time).format('HH:mm:ss').localeCompare(moment(b.alarm_time).format('HH:mm:ss')))

    medicineBrief.value.push({
      title: medicineName,
      brief: resultList.map(one => {
        return {
          timezone_name: one.timezone_name,
          alarm_time: moment(one.alarm_time).format('HH:mm'),
          intake_name: one.intake_name,
          taken: one.status === '완료'
        }
      })
    })
  })
})

function dispatchMedicineResult() {
  store.dispatch(APIName.GET_MEDICINE_RESULT, { start: moment(datePicked.value).format('YYYY-MM-DD'), end: moment(datePicked.value).format('YYYY-MM-DD') })
}

onMounted(() => {
  dispatchMedicineResult()
})
</script>

<template>
  <div id="container" class="container">
    <div style="width: 100%; height: 606px; margin-top: 85px; margin-bottom: 4px;">
      <div style="position: relative; display: flex; width: 100%; height: 100%;">
        <div style="position: relative; width: 70%; margin-left: 20px; background-color: #128F03;">
          <el-scrollbar height="100%">
            <div v-for="index in 45" :key="index" style="padding: 15px; font-size: 16px;">
              <span>{{ index }}.식품을 섭취할 때 각 식품마다 섭취하는 1회 분량이 다릅니다. 이를 보완하기 위해서 혈당의 증가 속도를 의미하는 GI뿐만 아니라 1회 식품 섭취 분량을 고려해서 만들어진 개념이 당부하 지수(GL)입니다.</span>
            </div>
          </el-scrollbar>
        </div>
        <div style="width: 10px;"></div>
        <div style="position: relative; width: 30%; margin-right: 20px; background-color: #FFFFFF; border-radius: 4px;">
          <div style="position: relative; top: -45px;">
            <el-date-picker v-model="datePicked" type="date" placeholder="" size="large" style="width: 100%; font-size: 18px;" @change="dispatchMedicineResult" />
          </div>
          <div style="height: 604px; margin-top: -40px;">
            <el-scrollbar height="100%">
              <MedicinePanel v-for="one in medicineBrief" :key="one.title" :title="one.title" :brief="one.brief" />
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <div style="width: 100%; flex-grow: 1;" />
  </div>

  <div class="header">
    <el-image style="display: inline-block; width: 42px;" :src="`${require('@/assets/image/medicine.png')}`" fit="fit"></el-image>
    <span style="position: absolute; top: 5px; margin-left: 5px; color: white; font-size: 28px; font-weight: bolder;">약복용</span>
  </div>
  <el-button style="position: fixed; right: 9px; bottom: 9px; color: #DCDFE6; background-color: #00000000" @click="ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content: { data: ViewName.EXIT, error: false } })">&lt;</el-button>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  
  width: 100%;
  height: 100vh;
  background-color: #128F03;
}

/* .container:deep(.el-input__wrapper) {
  background-color: #9BD9FE;
  box-shadow: none;
} */

.container:deep(.el-input__inner) {
  color: #3B3838;
  font-weight: bolder;
}

.header {
  width: 100%;
  position: fixed;
  left: 20px;
  top: 10px;
}
</style>