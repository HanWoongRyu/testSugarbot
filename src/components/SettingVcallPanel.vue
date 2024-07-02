<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { v4 as uuidv4 } from 'uuid'

import { APIName } from '@/constant'

const store = useStore()

const common = computed(() => {
  return store.state.common
})

const contactTable = computed(() => {
  return store.state.vcallContact
})

const signalServer = ref(common.value.find(one => one.key === '시그널 서버'))
const signalUsername = ref(common.value.find(one => one.key === '시그널 사용자'))
const signalPassword = ref(common.value.find(one => one.key === '시그널 비밀번호'))
const stunServer = ref(common.value.find(one => one.key === 'STUN 서버'))
const turnServer = ref(common.value.find(one => one.key === 'TURN 서버'))
const phoneNumber = ref(common.value.find(one => one.key === '전화번호'))

let idListToDelete = []

store.watch((state) => state.common, (newValue) => {
  signalServer.value = newValue.find(one => one.key === '시그널 서버')
  signalUsername.value = newValue.find(one => one.key === '시그널 사용자')
  signalPassword.value = newValue.find(one => one.key === '시그널 비밀번호')
  stunServer.value = newValue.find(one => one.key === 'STUN 서버')
  turnServer.value = newValue.find(one => one.key === 'TURN 서버')
  phoneNumber.value = newValue.find(one => one.key === '전화번호')
})

function read() {
  store.dispatch(APIName.GET_COMMON)
  store.dispatch(APIName.GET_VCALL_CONTACT)
}

function add() {
  contactTable.value.push({ id: uuidv4(), person: "", room: "" })
}

function remove(row, column) {
  if (column.no === 2) {
    for (let i = 0; i < contactTable.value.length; i++) {
      if (contactTable.value[i].id === row.id) {
        contactTable.value.splice(i, 1)
        idListToDelete.push(row.id)
      }
    }
  }
}

function save() {
  let temp = common.value.map(one => {
    return {
      ...one
    }
  })
  store.dispatch(APIName.SET_COMMON, temp)

  temp = contactTable.value.map(one => {
    return {
      ...one
    }
  })
  store.dispatch(APIName.SET_VCALL_CONTACT, { ins: temp, del: idListToDelete })

  idListToDelete = []
}
</script>

<template>
  <div :class="$style.container">
    <div>
      <div style="display: flex; justify-content: space-between;">
        <span style="font-size: 24px; font-weight: bolder;">영상통화</span>
        <el-button size="large" @click="read">읽어오기</el-button>
      </div>
      <div>
        <el-row :gutter="20" :class="$style['el-row']" v-if="false"> <!-- 숨김 -->
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            시그널 서버 :
          </el-col>
          <el-col :span="20">
            <el-input size="large" v-model="signalServer.val" style="width: 270px;" />
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']" v-if="false">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            사용자 :
          </el-col>
          <el-col :span="20">
            <el-input size="large" v-model="signalUsername.val" style="width: 270px;" />
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            전화번호 :
          </el-col>
          <el-col :span="20">
            <el-input size="large" v-model="phoneNumber.val" style="width: 270px;" />
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']" v-if="false"> <!-- 숨김 -->
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            비밀번호 :
          </el-col>
          <el-col :span="20">
            <el-input size="large" type="password" v-model="signalPassword.val" style="width: 270px;" />
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']" v-if="false"> <!-- 숨김 -->
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            STUN 서버 :
          </el-col>
          <el-col :span="20">
            <el-input size="large" v-model="stunServer.val" style="width: 270px;" />
          </el-col>
        </el-row>
        <el-row :gutter="20" :class="$style['el-row']" v-if="false"> <!-- 숨김 -->
          <el-col :span="4" style="padding-top: 8px; text-align: right;">
            TURN 서버 :
          </el-col>
          <el-col :span="20">
            <el-input size="large" v-model="turnServer.val" style="width: 270px;" />
          </el-col>
        </el-row>
        <el-row :gutter="20" :align='bottom' :class="$style['el-row']">
          <el-col :span="4" style="padding-top: 11px; text-align: right;">
            연결상대 :
          </el-col>
          <el-col :span="20">
            <el-table :data="contactTable" style="width: 100%" @cell-click="remove">
              <el-table-column label="이름" width="150">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-input size="large" v-model="contactTable[scope.$index].person" placeholder="" />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="대화방" width="270">
                <template #default="scope">
                  <div style="display: flex; align-items: center;">
                    <el-input size="large" v-model="contactTable[scope.$index].room" placeholder="" />
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