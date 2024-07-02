<script setup>
import { ipcRenderer } from 'electron'

import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

import moment from 'moment'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

import { ModuleName, MessageType, Method, Type, ViewName, APIName } from '@/constant'

import GlucosePanel from '@/components/GlucosePanel.vue'
import HbA1cPanel from '@/components/HbA1cPanel.vue'

const store = useStore()

const datePicked = ref(moment())

const plugins = ref([
  {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
      const {ctx} = chart
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = options.color || '#10859B'
      ctx.fillRect(0, 0, chart.width, chart.height)
      ctx.restore()
    }
  }
])

const options = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    customCanvasBackgroundColor: {
      color: '#00000000',
    }
  },
  scales: {
    x: {
      display: true,
      ticks: {
        display: false
      },
      border: {
        display: false
      },
      grid: {
        display: false
      }
    },
    y: {
      display: true,
      ticks: {
        display: false,
      },
      min: 0,
      max: 200,
      border: {
        display: false
      },
      grid: {
        display: false
      }
    }
  }
})

const data = ref({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Data One',
      backgroundColor: '#f87979',
      data: [40, 39, 10, 40, 39, 80, 40]
    }
  ]
})

const glucoseBrief = ref([
  { timezone_name: '기상', time: moment(), before_meal: -1, after_meal: -1, appointed: 89, custom_background_color: '', used: true },
  { timezone_name: '아침', time: moment(), before_meal: 86, after_meal: 132, appointed: -1, custom_background_color: '', used: true },
  { timezone_name: '점심', time: moment(), before_meal: 92, after_meal: 129, appointed: -1, custom_background_color: '', used: true },
  { timezone_name: '저녁', time: moment(), before_meal: 79, after_meal: 141, appointed: -1, custom_background_color: '', used: true },
  { timezone_name: '취침', time: moment(), before_meal: -1, after_meal: -1, appointed: 76, custom_background_color: '', used: true },
])

const HbA1cRange = ref(0)
const HbA1c = ref(0)

store.watch((state) => state.glucoseResult, (newValue) => {
  glucoseBrief.value = []

  let temp = newValue.filter(one => one.timezone_name === '기상' && one.intake_name === '정시')
  if (temp.length >= 1) {
    glucoseBrief.value.push({
      timezone_name: temp[0].timezone_name,
      alarm_time: moment(temp[0].alarm_time).format('HH:mm'),
      before_meal: -1,
      after_meal: -1,
      appointed: temp[0].level,
      custom_background_color: '1CAAE4'
    })
  }

  temp = newValue.filter(one => one.timezone_name === '아침')
  if (temp.length >= 1) {
    glucoseBrief.value.push({
      timezone_name: temp[0].timezone_name,
      alarm_time: moment(temp[0].alarm_time).format('HH:mm'),
      before_meal: temp[0].level,
      after_meal: temp[1].level,
      appointed: -1,
      custom_background_color: 'C7E7E2'
    })
  }

  temp = newValue.filter(one => one.timezone_name === '점심')
  if (temp.length >= 1) {
    glucoseBrief.value.push({
      timezone_name: temp[0].timezone_name,
      alarm_time: moment(temp[0].alarm_time).format('HH:mm'),
      before_meal: temp[0].level,
      after_meal: temp[1].level,
      appointed: -1,
      custom_background_color: '85CFC6'
    })
  }

  temp = newValue.filter(one => one.timezone_name === '저녁')
  if (temp.length >= 1) {
    glucoseBrief.value.push({
      timezone_name: temp[0].timezone_name,
      alarm_time: moment(temp[0].alarm_time).format('HH:mm'),
      before_meal: temp[0].level,
      after_meal: temp[1].level,
      appointed: -1,
      custom_background_color: 'F7AE5F'
    })
  }

  temp = newValue.filter(one => one.timezone_name === '취침' && one.intake_name === '정시')
  if (temp.length >= 1) {
    glucoseBrief.value.push({
      timezone_name: temp[0].timezone_name,
      alarm_time: moment(temp[0].alarm_time).format('HH:mm'),
      before_meal: -1,
      after_meal: -1,
      appointed: temp[0].level,
      custom_background_color: '8A95CC'
    })
  }
})

async function dispatchGlucoseResult() {
  store.dispatch(APIName.GET_GLUCOSE_RESULT, { start: moment(datePicked.value).format('YYYY-MM-DD'), end: moment(datePicked.value).format('YYYY-MM-DD') })

  HbA1cRange.value = store.state.common.find(one => one.key === '당화혈색소 적용기간').val

  let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_GLUCOSE_AVERAGE, param: { start: moment().subtract(HbA1cRange.value, 'months').format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') } })
  HbA1c.value = result[0].AVERAGE > 0 ? ((result[0].AVERAGE + 46.7) / 28.7).toFixed(1) : 0
}

onMounted(() => {
  dispatchGlucoseResult()
})
</script>

<template>
  <div id="container" class="container">
    <div style="width: 100%; height: 606px; margin-top: 85px; margin-bottom: 4px;">
      <div style="position: relative; display: flex; width: 100%; height: 100%;">
        <div style="position: relative; width: 70%; margin-left: 20px;">
          <div style="position: absolute; left: 0; top: 0; right: 0; bottom: 0;">
            <Line :data="data" :options="options" :plugins="plugins" />
          </div>
          <el-scrollbar height="45%">
            <div v-for="index in 45" :key="index" style="padding: 15px; font-size: 16px;">
              <span>{{ index }}.식품을 섭취할 때 각 식품마다 섭취하는 1회 분량이 다릅니다. 이를 보완하기 위해서 혈당의 증가 속도를 의미하는 GI뿐만 아니라 1회 식품 섭취 분량을 고려해서 만들어진 개념이 당부하 지수(GL)입니다.</span>
            </div>
          </el-scrollbar>
        </div>
        <div style="width: 10px;"></div>
        <div style="position: relative; width: 30%; margin-right: 20px; background-color: #FFFFFF; border-radius: 4px;">
          <div style="position: relative; top: -45px;">
            <el-date-picker v-model="datePicked" type="date" placeholder="" size="large" style="width: 100%; font-size: 18px;" @change="dispatchGlucoseResult" />
          </div>
          <div style="height: 506px; margin-top: -40px;">
            <el-scrollbar height="100%">
              <GlucosePanel v-for="(one, index) in glucoseBrief" :key="index"
                :timezone_name="one.timezone_name"
                :before_meal="one.before_meal"
                :after_meal="one.after_meal"
                :appointed="one.appointed"
                :custom_background_color="one.custom_background_color"
              />
            </el-scrollbar>
            <HbA1cPanel :HbA1c="HbA1c" :period="HbA1cRange" />
          </div>
        </div>
      </div>
    </div>
    <div style="width: 100%; flex-grow: 1;" />
  </div>

  <div class="header">
    <el-image style="display: inline-block; width: 42px;" :src="`${require('@/assets/image/glucose.png')}`" fit="fit"></el-image>
    <span style="position: absolute; top: 5px; margin-left: 5px; color: white; font-size: 28px; font-weight: bolder;">혈당검사</span>
  </div>

  <el-button style="position: fixed; right: 9px; bottom: 9px; color: #DCDFE6; background-color: #000000aa" @click="ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, content:{data: ViewName.EXIT, error:false}})">&lt;</el-button>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  
  width: 100%;
  height: 100vh;
  background-color: #10859B;
}

/* .containe:deep(.el-input__wrapper) {
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