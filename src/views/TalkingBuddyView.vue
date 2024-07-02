<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { ipcRenderer } from 'electron'
import { ModuleName, Method, Type, ViewName } from '@/constant'
import TalkBox from "@/components/TalkBox.vue"
import OpenAI from "openai"

const store = useStore()
const openAI = ref(null)
const conversations = ref([])

const scrollbarRef = ref(null)

const postOfficeListener = (sender, payload) => {
  sender
  if (payload.type === Type.STT) {
    handleConversation(payload.data);
  }
};


onMounted(() => {
  const apiKey = store.state.common.find(entry => entry.key === '말벗 비밀번호')?.val;
  if (apiKey) {
    openAI.value = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  }

  ipcRenderer.on(ModuleName.POST_OFFICE, postOfficeListener)
});

onUnmounted(() => {
  ipcRenderer.off(ModuleName.POST_OFFICE, postOfficeListener)
});


async function useOpenApi(userConversation) {
  if (!openAI.value) {
    console.error('OpenAI API 초기화 실패');
    return null;
  }

  try {
    const completion = await openAI.value.chat.completions.create({
      messages: [{ "role": "user", "content": userConversation }],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('API 통신 error', error);
    return null;
  }
}

watch(conversations, () => {
  let scrollbar = document.getElementById('scrollbar');
  // scrollbar.scrollTop = scrollbar.scrollHeight
  scrollbarRef.value.setScrollTop(scrollbar.scrollHeight);
})

function addConversation(text, mine) {
  conversations.value.unshift({ text, mine });
  conversations.value = [...conversations.value];
}

async function handleConversation(userConversation) {
  addConversation(userConversation, true);
  const answered = await useOpenApi(userConversation);
  
  if (answered) {
    addConversation(answered, false);
    ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.GPT, data: answered });
  } else {
    const errorText = "환결설정이나 네트워크 환경을 확인해주세요!";
    addConversation(errorText, false);
    ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.GPT, data: errorText });
  }
}
</script>


<template>
  <div id="container" class="container">
    <div style="width: 100%; height: 606px; margin-top: 85px; margin-bottom: 4px;">
      <div style="position: relative; display: flex; width: 100%; height: 100%;">
        <div style="position: relative; width: 50%; margin-left: 20px; background-color: #84008E;">
          <div style="position: absolute; width: 100%; margin: 10px; font-size: 16px; z-index: 1;">
            <span style="font-size: 18px; color: #FBDA74; text-shadow: 1px 1px 2px gray;">장군이</span>
          </div>
        </div>
        <div style="width: 10px;"></div>
        <div style="position: relative; width: 50%; margin-right: 20px; background-color: #84008E;">
          <div style="position: absolute; width: 100%; margin: 10px; font-size: 16px; z-index: 1;">
            <span style="font-size: 18px; color: #FBDA74; text-shadow: 1px 1px 2px gray; float: right; margin-right: 20px;">사용자</span>
          </div>
        </div>
        <el-scrollbar id="scrollbar" ref="scrollbarRef"  style="position: absolute; left: 20px; top: 45px; right: 20px; height: 562px; background-color: #cccccc44;">
          <!-- <TalkBox v-for="(item, index) in 20" :key="index" :mine="index % 2 === 0" :text="item"></TalkBox> -->
          <TalkBox v-for="(conversation, index) in conversations.toReversed()" :key="index" :mine="conversation.mine" :text="conversation.text"></TalkBox>
        </el-scrollbar>
      </div>
    </div>
    <div style="width: 100%; flex-grow: 1;" />
  </div>

  <div class="header">
    <el-image style="display: inline-block; width: 42px;" :src="`${require('@/assets/image/voice.png')}`" fit="fit"></el-image>
    <span style="position: absolute; top: 5px; margin-left: 5px; color: white; font-size: 28px; font-weight: bolder;">말벗</span>
  </div>
  <div class="vertical-line" />

  <el-button style="position: fixed; right: 9px; bottom: 9px; color: #DCDFE6; background-color: #00000000" @click="ipcRenderer.send(ModuleName.WEB_APPLICATION, {method:Method.POST, type: Type.VIEW, data: ViewName.EXIT })">&lt;</el-button>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  
  width: 100%;
  height: 100vh;
  background-color: #8F009B;
}

.header {
  width: 100%;
  position: fixed;
  left: 20px;
  top: 10px;
}

.vertical-line {
  height: 100vh;
  position: fixed;
  left: calc(50% - 1px);
  top: 0;
  border: 1px solid #F6BB00;
}
</style>