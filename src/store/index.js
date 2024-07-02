import { ipcRenderer } from 'electron'

import { createStore } from 'vuex'

import moment from 'moment'

import { ModuleName, MessageType, APIName } from '@/constant'

export default createStore({
  state: {
    directionOption: [],
    intakeOption: [],
    timezoneOption: [],
    medicineOption: [],

    common: [],
    glucoseResult: [],
    glucoseSchedule: [],
    medicine: [],
    medicineResult: [],
    medicineSchedule: [],
    location: [],
    vcallContact: [],
    sosContact: [],

    currentView: 'Wakeup',

    glucoseDialogVisible: false,
    medicineDialogVisible: false,
    settingDialogVisible: false,
    errorDialogVisible:false,
    errorMessage :"",
    
    arrowColor: '#000000aa',
  },

  getters: {
  },

  mutations: {
    [APIName.SET_DIRECTION_OPTION]: (state, payload) => {
      state.directionOption = payload
    },

    [APIName.SET_INTAKE_OPTION]: (state, payload) => {
      state.intakeOption = payload
    },

    [APIName.SET_TIMEZONE_OPTION]: (state, payload) => {
      state.timezoneOption = payload
    },

    [APIName.SET_COMMON]: (state, payload) => {
      state.common = payload
    },

    [APIName.SET_GLUCOSE_RESULT]: (state, payload) => {
      state.glucoseResult = payload
    },

    [APIName.SET_GLUCOSE_SCHEDULE]: (state, payload) => {
      state.glucoseSchedule = payload.map(one => {
        return {
          ...one,
          timezone: state.timezoneOption.find(option => option.id === one.timezone_option_id).val,
          intake: state.intakeOption.find(option => option.id === one.intake_option_id).val
        }
      })
    },

    [APIName.SET_MEDICINE]: (state, payload) => {
      state.medicine = payload.map(one => {
        return {
          ...one,
          duration: [moment(one.duration.split(',')[0], 'YYYY-MM-DD'), moment(one.duration.split(',')[1], 'YYYY-MM-DD')]
        }
      })

      state.medicineOption = payload.map(one => {
        return {
          id: one.id,
          val: one.name
        }
      })
    },

    [APIName.SET_MEDICINE_RESULT]: (state, payload) => {
      state.medicineResult = payload
    },

    [APIName.SET_MEDICINE_SCHEDULE]: (state, payload) => {
      state.medicineSchedule = payload.map(one => {
        return {
          ...one,
          medicine: state.medicineOption.find(option => option.id === one.medicine_id).val,
          timezone: state.timezoneOption.find(option => option.id === one.timezone_option_id).val,
          intake: state.intakeOption.find(option => option.id === one.intake_option_id).val
        }
      })
    },

    [APIName.SET_LOCATION]: (state, payload) => {
      state.location = payload.map(one => {
        return {
          ...one,
          direction: state.directionOption.find(option => option.id === one.direction_option_id).val
        }
      })
    },

    [APIName.SET_VCALL_CONTACT]: (state, payload) => {
      state.vcallContact = payload
    },

    [APIName.SET_SOS_CONTACT]: (state, payload) => {
      state.sosContact = payload
    },

    SET_CURRENT_VIEW(state, view) {
      state.currentView = view
    },

    SET_GLUCOSE_DIALOG_VISIBLE(state, visible) {
      state.glucoseDialogVisible = visible
    },

    SET_MEDICINE_DIALOG_VISIBLE(state, visible) {
      state.medicineDialogVisible = visible
    },

    SET_SETTING_DIALOG_VISIBLE(state, visible) {
      state.settingDialogVisible = visible
    },

    SET_ERROR_DIALOG_VISIBLE(state, { visible, message }) {
      state.errorDialogVisible = visible;
      state.errorMessage = message;
    },
  },

  actions: {
    [APIName.GET_DIRECTION_OPTION]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_DIRECTION_OPTION })

      commit(APIName.SET_DIRECTION_OPTION, result)
    },

    [APIName.GET_INTAKE_OPTION]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_INTAKE_OPTION })

      commit(APIName.SET_INTAKE_OPTION, result)
    },

    [APIName.GET_TIMEZONE_OPTION]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_TIMEZONE_OPTION })

      commit(APIName.SET_TIMEZONE_OPTION, result)
    },

    [APIName.GET_COMMON]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_COMMON })

      // let common = {
      //   sleepModePeriod: result.find(one => one.key === '수면모드 적용시간').val,
      //   sleepModeTimeout: result.find(one => one.key === '수면모드 타임아웃').val,
      //   menuSwitchingPeriod: result.find(one => one.key === '메뉴 전환주기').val,
      //   glucoseAlarmCondition: result.find(one => one.key === '혈당검사 알림주기').val,
      //   glucoseHbA1cRange: result.find(one => one.key === '당화혈색소 적용기간').val,
      //   medicineAlarmCondition: result.find(one => one.key === '약복용 알림주기').val,
      //   medicineTherapyCondition: result.find(one => one.key === '재처방 알림조건').val,
      //   talkUsername: result.find(one => one.key === '말벗 사용자').val,
      //   talkPassword: result.find(one => one.key === '말벗 비밀번호').val,
      //   vcallSignalServer: result.find(one => one.key === '시그널 서버').val,
      //   vcallSignalUsername: result.find(one => one.key === '시그널 사용자').val,
      //   vcallSignalPassword: result.find(one => one.key === '시그널 비밀번호').val,
      //   vcallStunServer: result.find(one => one.key === 'STUN 서버').val,
      //   vcallTurnServer: result.find(one => one.key === 'TURN 서버').val,
      //   searchMapPath: result.find(one => one.key === '탐색 지도 경로').val,
      //   searchRecordingTime: result.find(one => one.key === '탐색 녹화시간').val,
      //   sosEmailServer: result.find(one => one.key === 'SOS 메일 서버').val,
      //   sosEmailUsername: result.find(one => one.key === 'SOS 메일 사용자').val,
      //   sosEmailPassword: result.find(one => one.key === 'SOS 메일 비밀번호').val
      // }

      commit(APIName.SET_COMMON, result)
    },

    [APIName.SET_COMMON]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_COMMON, param: payload })
      if (result === true) {
        commit(APIName.SET_COMMON, payload)
      }
    },

    [APIName.GET_GLUCOSE_RESULT]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_GLUCOSE_RESULT, param: payload })

      commit(APIName.SET_GLUCOSE_RESULT, result)
    },

    [APIName.SET_GLUCOSE_RESULT]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_GLUCOSE_RESULT, param: payload })
      if (result === true) {
        commit(APIName.SET_GLUCOSE_RESULT, payload)
      }
    },

    [APIName.GET_GLUCOSE_SCHEDULE]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_GLUCOSE_SCHEDULE })

      commit(APIName.SET_GLUCOSE_SCHEDULE, result)
    },

    [APIName.SET_GLUCOSE_SCHEDULE]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_GLUCOSE_SCHEDULE, param: payload })
      if (result === true) {
        commit(APIName.SET_GLUCOSE_SCHEDULE, payload.ins)
      }
    },

    [APIName.GET_MEDICINE]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_MEDICINE })

      commit(APIName.SET_MEDICINE, result)
    },

    [APIName.SET_MEDICINE]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_MEDICINE, param: payload })
      if (result === true) {
        commit(APIName.SET_MEDICINE, payload.ins)
      }
    },

    [APIName.GET_MEDICINE_RESULT]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_MEDICINE_RESULT, param: payload })

      commit(APIName.SET_MEDICINE_RESULT, result)
    },

    [APIName.SET_MEDICINE_RESULT]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_MEDICINE_RESULT, param: payload })
      if (result === true) {
        commit(APIName.SET_MEDICINE_RESULT, payload)
      }
    },

    [APIName.GET_MEDICINE_SCHEDULE]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_MEDICINE_SCHEDULE })

      commit(APIName.SET_MEDICINE_SCHEDULE, result)
    },

    [APIName.SET_MEDICINE_SCHEDULE]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_MEDICINE_SCHEDULE, param: payload })
      if (result === true) {
        commit(APIName.SET_MEDICINE_SCHEDULE, payload.ins)
      }
    },
    
    [APIName.GET_LOCATION]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_LOCATION })

      commit(APIName.SET_LOCATION, result)
    },

    [APIName.SET_LOCATION]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_LOCATION, param: payload })
      if (result === true) {
        commit(APIName.SET_LOCATION, payload.ins)
      }
    },

    [APIName.GET_VCALL_CONTACT]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_VCALL_CONTACT })

      commit(APIName.SET_VCALL_CONTACT, result)
    },

    [APIName.SET_VCALL_CONTACT]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_VCALL_CONTACT, param: payload })
      if (result === true) {
        commit(APIName.SET_VCALL_CONTACT, payload.ins)
      }
    },

    [APIName.GET_SOS_CONTACT]: async ({ commit }) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.GET_SOS_CONTACT })

      commit(APIName.SET_SOS_CONTACT, result)
    },

    [APIName.SET_SOS_CONTACT]: async ({ commit }, payload) => {
      let result = await ipcRenderer.invoke(ModuleName.WEB_APPLICATION, { type: MessageType.DB, api: APIName.SET_SOS_CONTACT, param: payload })
      if (result === true) {
        commit(APIName.SET_SOS_CONTACT, payload.ins)
      }
    },

    changeCurrentView({ commit }, payload) {
      commit('SET_CURRENT_VIEW', payload.view)
    },

    hideGlucoseDialog({ commit }) {
      commit('SET_GLUCOSE_DIALOG_VISIBLE', false)
    },

    showGlucoseDialog({ commit }) {
      commit('SET_GLUCOSE_DIALOG_VISIBLE', true)
    },

    hideMedicineDialog({ commit }) {
      commit('SET_MEDICINE_DIALOG_VISIBLE', false)
    },

    showMedicineDialog({ commit }) {
      commit('SET_MEDICINE_DIALOG_VISIBLE', true)
    },

    hideSettingDialog({ commit }) {
      commit('SET_SETTING_DIALOG_VISIBLE', false)
    },

    showSettingDialog({ commit }) {
      commit('SET_SETTING_DIALOG_VISIBLE', true)
    },

    showErrorDialog({ commit }, { message, duration = 30000 }) {
      commit('SET_ERROR_DIALOG_VISIBLE', { visible: true, message });
      setTimeout(() => {
        commit('SET_ERROR_DIALOG_VISIBLE', { visible: false, message: '' });
      }, duration);
    },
  },

  modules: {
  }
})
