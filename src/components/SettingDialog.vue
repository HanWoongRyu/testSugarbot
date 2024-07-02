<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import SettingSleepPanel from './SettingSleepPanel.vue'
import SettingMenuPanel from './SettingMenuPanel.vue'
import SettingGlucosePanel from './SettingGlucosePanel.vue'
import SettingMedicinePanel from './SettingMedicinePanel.vue'
import SettingTalkingBuddyPanel from './SettingTalkingBuddyPanel.vue'
import SettingVcallPanel from './SettingVcallPanel.vue'
import SettingSearchPanel from './SettingSearchPanel.vue'
import SettingSOSPanel from './SettingSOSPanel.vue'

const store = useStore()

const visible = computed(() => {
  return store.state.settingDialogVisible
})
</script>

<template>
  <el-dialog
    :class="$style.container"
      v-model="visible"
      fullscreen
      :show-close="false"
      :before-close="handleClose"
    >
    <template #header>
      <div style="display: flex;">
        <el-image style="display: inline-block; margin: 15px; width: 90px;" :src="`${require('@/assets/image/settings.png')}`"></el-image>
        <div style="display: inline-block; margin-left: 10px; margin-top: 10px; color: #3B3838">
          <div>
            <span style="font-size: 48px; font-weight: bolder;">설정을 하세요!</span>
          </div>
          <div>
            <span></span>
          </div>
        </div>
      </div>
      <div style="position: fixed; top: 20px; right: 30px;">
        <el-button size="large" @click="store.dispatch('hideSettingDialog')">닫기</el-button>
      </div>
    </template>
    <template #footer>
      <el-scrollbar style="height: 520px;">
        <SettingSleepPanel />
        <SettingMenuPanel />
        <SettingGlucosePanel />
        <SettingMedicinePanel />
        <SettingTalkingBuddyPanel />
        <SettingVcallPanel />
        <SettingSearchPanel />
        <SettingSOSPanel />
      </el-scrollbar>
    </template>
  </el-dialog>
</template>

<style module>
.container {
  width: 100%;
  height: 100vh;
  background-color: white;
  z-index: 1000;
}
</style>