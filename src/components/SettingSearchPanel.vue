<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import { APIName, ModuleName, Method, Type } from '@/constant'
const { ipcRenderer } = require('electron')

const store = useStore()

const directionOption = computed(() => store.state.directionOption)
const common = computed(() => store.state.common)
const locationTable = computed(() => store.state.location)

const position = ref('')
const coordinates = ref({ raw: '0,0', display: '0,0' })
const direction = ref('0°(360°)')
const isMapping = ref(false)
const isLoading = ref(false) 
const mapImage = ref('')
const imagePath = require('@/assets/image/isol_map.jpg') // 이미지 경로

const recordingTime = ref(common.value.find(one => one.key === '탐색 녹화시간'))

let idListToDelete = []

store.watch((state) => state.common, (newValue) => {
  recordingTime.value = newValue.find(one => one.key === '탐색 녹화시간')
})

function read() {
  store.dispatch(APIName.GET_LOCATION)
  store.dispatch(APIName.GET_COMMON)
}

function add() {
  if (isMapping.value || isLoading.value) {
    alert("탐지 중에는 설정을 변경할 수 없습니다.")
    return
  }
  const existingMarker = locationTable.value.find(marker => 
    marker.position === position.value || marker.coordinates.raw === coordinates.value.raw
  )
  if (existingMarker) {
    alert("이미 존재하는 좌표 혹은 이름을 가진 장소입니다!")
    return
  }
  locationTable.value.push({
    id: moment().milliseconds(),
    position: position.value,
    coordinates: coordinates.value.raw,
    direction: direction.value
  })
  // 초기화
  position.value = ''
  coordinates.value = { raw: '0,0', display: '0,0' }
  direction.value = directionOption.value[0].val 
}

function remove(row, column) {
  if (isMapping.value || isLoading.value) {
    alert("탐지 중에는 설정을 변경할 수 없습니다.")
    return
  }
  if (column.no === 3) {
    for (let i = 0; i < locationTable.value.length; i++) {
      if (locationTable.value[i].id === row.id) {
        locationTable.value.splice(i, 1)
        idListToDelete.push(row.id)
      }
    }
  }
}

function save() {
  let temp = locationTable.value.map(one => {
    return {
      id: one.id,
      position: one.position,
      coordinates: one.coordinates,
      direction_option_id: directionOption.value.find(option => option.val === one.direction).id
    }
  })
  store.dispatch(APIName.SET_LOCATION, { ins: temp, del: idListToDelete })

  temp = common.value.map(one => ({ ...one }))
  store.dispatch(APIName.SET_COMMON, temp)

  idListToDelete = []

  ipcRenderer.send(ModuleName.WEB_APPLICATION, {method: Method.SAVE, type: Type.MAPPED, content: {data: null, error: false} })
}

function handleMapClick(event) {
  if (isMapping.value || isLoading.value) {
    alert("탐지 중에는 설정을 변경할 수 없습니다.")
    return
  }
  const rect = event.target.getBoundingClientRect()
  const x = (event.clientX - rect.left)
  const y = (event.clientY - rect.top)
  coordinates.value.raw = `${x},${y}`
  coordinates.value.display = `${x},${y}`
}

function getMarkerStyle(marker) {
  const [x, y] = marker.coordinates.split(',')
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)'
  }
}

function calculateMarkerRotation(marker) {
  const directionOptionItem = directionOption.value.find(option => option.val === marker.direction)
  const degree = directionOptionItem ? parseInt(directionOptionItem.val) : 0
  return {
    transform: `rotate(${degree}deg)`
  }
}

function startMapping() {
  isMapping.value = true
  isLoading.value = true
  ipcRenderer.send(ModuleName.WEB_APPLICATION, {method: Method.GET, type: Type.MAPPING, content: {data: null, error: null} })
}

function stopMapping() {
  isMapping.value = false
  isLoading.value = true 
  ipcRenderer.send(ModuleName.WEB_APPLICATION, {method: Method.GET, type: Type.MAPPED, content: {data: null, error: null} })
}

const handlePostOfficeMessage = (sender, payload) => {
  if (payload.method === Method.GET && payload.type === Type.MAPPING && isMapping.value) {
    isLoading.value = false
    if (payload.content.error) {
      store.dispatch('showErrorDialog',{message:"맵 시작 중 일부 에러 발생 다시 시도 해주세요",duration: 3000})
      isMapping.value =false
      isLoading.value =false
      return
    } 
    mapImage.value = `data:image/png;base64,${payload.content.data}`
  } 
  else if (payload.method === Method.GET && payload.type === Type.MAPPED) {
    isLoading.value = false
    if (payload.content.error) {
      store.dispatch('showErrorDialog',{message:"완료된 맵 이미지를 받지 못했습니다. 다시 탐지해 주세요",duration: 3000})
      isMapping.value =false
      isLoading.value =false
      return
    } 
    mapImage.value = `data:image/png;base64,${payload.content.data}`
  }  
  else if (payload.method === Method.SAVE && payload.type ===Type.MAPPED) {
    if (payload.content.error) {
      store.dispatch('showErrorDialog',{message:"저장 중 오류 발생! 다시 시도해주세요",duration: 3000})
      isMapping.value =false
      isLoading.value =false
    }
  }
}

onMounted(() => {
  // 초기 이미지를 설정
  mapImage.value = imagePath
  ipcRenderer.on(ModuleName.POST_OFFICE, handlePostOfficeMessage)
})

onUnmounted(() => {
  ipcRenderer.off(ModuleName.POST_OFFICE, handlePostOfficeMessage)
})
</script>

<template>
  <div :class="$style.container">
    <div>
      <div style="display: flex; justify-content: space-between;">
        <span style="font-size: 24px; font-weight: bolder;">탐색</span>
        <el-button size="large" @click="read">읽어오기</el-button>
      </div>
      <div>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
          </el-col>
          <el-col :span="21">
            <el-row>
              <el-col>
                <el-button size="large" @click="startMapping" :disabled="isMapping || isLoading">탐지</el-button>
                <el-button size="large" @click="stopMapping" :disabled="!isMapping">종료</el-button>
              </el-col>
            </el-row>
            <el-row style="margin-top: 6px;">
              <el-col>
                <el-row>
                  <el-col :span="18">
                    <div style="position: relative;" v-loading="isLoading">
                      <div class="map-container">
                        <div class="map-image-container">
                          <img
                            v-if="mapImage"
                            :src="mapImage"
                            class="map-image"
                            @click="handleMapClick"
                          />
                          <div v-if="!isMapping && !isLoading">
                            <div v-for="(marker) in locationTable" :key="marker.id" :style="getMarkerStyle(marker)">
                              <img
                                src="@/assets/image/map.png"
                                style="width: 20px; height: 20px;"
                                :style="calculateMarkerRotation(marker)"
                              />
                              <div class="marker-label" style="position: absolute; transform: translateX(-25%); white-space: nowrap; font-size: 15px; background-color: white;">
                                {{ marker.position }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="6" style="padding-left: 18px; color: #606266;">
                    <el-row>
                      <el-col style="padding-top: 11px;">
                        <el-text :class="$style['el-text']" size="large">위치</el-text>
                      </el-col>
                      <el-col style="padding-top: 8px;">
                        <el-row justify="end">
                          <el-input size="large" v-model="position" style="width: 182px;" :disabled="isMapping || isLoading"/>
                        </el-row>
                      </el-col>
                      <el-col style="padding-top: 11px;">
                        <el-text :class="$style['el-text']" size="large">좌표</el-text>
                      </el-col>
                      <el-col style="padding-top: 8px;">
                        <el-row justify="end">
                          <el-input size="large" v-model="coordinates.display" style="width: 182px;" :disabled="isMapping || isLoading"/>
                        </el-row>
                      </el-col>
                      <el-col style="padding-top: 11px;">
                        <el-text :class="$style['el-text']" size="large">방향</el-text>
                      </el-col>
                      <el-col style="padding-top: 8px;">
                        <el-row justify="end">
                          <el-select
                            v-model="direction"
                            placeholder=""
                            size="large"
                            style="width: 182px;"
                            :disabled="isMapping || isLoading"
                          >
                            <el-option
                              v-for="option in directionOption"
                              :key="option.id"
                              :label="option.val"
                              :value="option.val"
                            />
                          </el-select>
                        </el-row>
                      </el-col>
                      <el-col style="padding-top: 22px;">
                        <el-row justify="end">
                          <el-button
                            size="large"
                            style="color: white; background-color: #3B3838;"
                            @click="add"
                            :disabled="isMapping || isLoading"
                          >
                            목적지 추가
                          </el-button>
                        </el-row>
                      </el-col>
                      <el-col style="padding-top: 25px;">
                        <pre style="font-size: 13px; line-height: 170%;">
먼저, 지도를 완성하세요.
위치를 입력하고
왼쪽 지도에서 좌표를 선택하고
방향을 지정한 후
목적지 추가 버튼을 선택하세요.
                        </pre>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row :gutter="20" :align="bottom" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 11px; text-align: right;">
            목적지 :
          </el-col>
          <el-col :span="20">
            <el-table :data="locationTable" style="width: 100%" @cell-click="remove">
              <el-table-column label="위치" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-text size="large" placeholder="">{{ locationTable[scope.$index].position }}</el-text>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="좌표" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-text size="large" placeholder="">{{ locationTable[scope.$index].coordinates.split(',').map(Number).map(Math.floor).join(',') }}</el-text>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="방향(8방위)" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-text size="large" placeholder="">{{ locationTable[scope.$index].direction }}</el-text>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="">
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
            녹화시간 :
          </el-col>
          <el-col :span="20">
            <el-input-number size="large" v-model="recordingTime.val" :min="1" :max="60" />
            <el-text class="mx-1">&nbsp;초</el-text>
          </el-col>
        </el-row>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span></span>
        <el-button size="large" style="color: white; background-color: #3B3838;" @click="save" :disabled="isMapping || isLoading">저장하기</el-button>
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

.el-text {
  color: #606266;
}

.map-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.map-image-container {
  position: relative;
  width: 650px;
  height: 434px;
  background-color: #d3d3d3; /* Gray background */
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-image {
  display: block;
}

.marker-label {
  background-color: white;
  font-size: 15px;
  transform: translateX(-25%);
  white-space: nowrap;
  position: absolute;
}

</style>
