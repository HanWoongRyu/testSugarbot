'use strict'

export const ModuleName = {
  WEB_APPLICATION: 'WebApplication',
  ELECTRON_BACKGROUND: 'ElectronBackground',
  POST_OFFICE: 'PostOffice',
  VIEW_MANAGER: 'ViewManager',
  DB_SERVICE: 'DBService',
}

export const MessageType = {
  DB: 'DB',
}

export const Method = {
  GET : 'get',
  POST : 'post',
  RELEASE : 'release',
  SAVE: 'save'
}

export const Type = {
  VIEW : 'view',
  COMMAND : 'command',
  STT : 'stt',
  GPT : 'gpt',
  PERMISSION : 'permission',
  MAPPING : 'mapping',
  MAPPED : 'mapped',
  CALL : 'call',
  POSITION:"position",
  SEARCH:"search",
  NAVIGATION : 'navigation',
  CAMERA_IMAGE : 'camera_image',
  MANUAL : 'manual',
  FIND_HUMAN : 'find_human',
}


export const ViewName = {
  SLEEP: 'sleep',
  WAKEUP: 'wakeup',
  MENU: 'menu',
  GLUCOSE: 'glucose',
  MEDICINE: 'medicine',
  BUDDY: 'buddy',
  CALL: 'call',
  SEARCH: 'search',
  SOS: 'sos',
  EXIT: ''
}

export const APIName = {
  GET_DIRECTION_OPTION: 'GetDirectionOption',
  SET_DIRECTION_OPTION: 'SetDirectionOption',

  GET_INTAKE_OPTION: 'GetIntakeOption',
  SET_INTAKE_OPTION: 'SetIntakeOption',

  GET_TIMEZONE_OPTION: 'GetTimenameOption',
  SET_TIMEZONE_OPTION: 'SetTimenameOption',

  GET_COMMON: 'GetCommon',
  SET_COMMON: 'SetCommon',

  GET_MEDICINE: 'GetMedicine',
  SET_MEDICINE: 'SetMedicine',

  GET_MEDICINE_RESULT: 'GetMedicineResult',
  SET_MEDICINE_RESULT: 'SetMedicineResult',

  GET_MEDICINE_SCHEDULE: 'GetMedicineSchedule',
  SET_MEDICINE_SCHEDULE: 'SetMedicineSchedule',

  GET_VCALL_CONTACT: 'GetVcallContact',
  SET_VCALL_CONTACT: 'SetVcallContact',

  GET_LOCATION: 'GetLocation',
  SET_LOCATION: 'SetLocation',

  GET_SOS_CONTACT: 'GetSOSContact',
  SET_SOS_CONTACT: 'SetSOSContact',

  GET_GLUCOSE_RESULT:'GetGlucoseResult',
  SET_GLUCOSE_RESULT:'SetGlucoseResult',

  GET_GLUCOSE_SCHEDULE:'GetGlucoseSchedule',
  SET_GLUCOSE_SCHEDULE:'SetGlucoseSchedule'
}
