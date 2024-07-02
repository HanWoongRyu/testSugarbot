<script setup>
import { ipcRenderer } from 'electron';
import { reactive, onMounted, onUnmounted, computed } from 'vue';
import WebRTCWrapper from '@/webrtcwrapper';
import { ModuleName, Type, Method, ViewName } from '@/constant';
import { useStore } from 'vuex';

const store = useStore();
const webRTCWrapper = WebRTCWrapper.getInstance();
const arrowColor = computed(() => store.state.arrowColor);

const state = reactive({
  selectedContactId: null,
  localStream: null,
  remoteStream: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  call: null,
  isCalling: false,
  isCaller: false,
});

const vcallContact = computed(() => store.state.vcallContact.map(contact => ({ person: contact.person, id: contact.room })));

async function initializeMedia() {
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.localStream = audioStream;

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.getVideoTracks().forEach(track => state.localStream.addTrack(track));
    } catch (videoError) {
      console.error('Error accessing video devices, adding an empty video track.', videoError);
      const emptyVideoTrack = createEmptyVideoTrack();
      state.localStream.addTrack(emptyVideoTrack);
    }

    document.getElementById('local-video').srcObject = state.localStream;
  } catch (audioError) {
    console.error('Error accessing audio devices.', audioError);
  }
}

function createEmptyVideoTrack() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const context = canvas.getContext('2d');

  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const stream = canvas.captureStream();
  return stream.getVideoTracks()[0];
}

function callHandler(targetName = null) {
  if (targetName) {
    const targetContact = vcallContact.value.find(contact => contact.person === targetName);
    if (targetContact) {
      state.selectedContactId = targetContact.id;
    } else {
      console.error(`전화번호부에 ${targetName} 이(가) 없습니다.`);
      return;
    }
  }
  if (state.selectedContactId) {
    webRTCWrapper.makeCall(state.selectedContactId, state.localStream);
  }
}

function answerHandler() {
  webRTCWrapper.answerCall(state.localStream);
}

function rejectHandler() {
  webRTCWrapper.rejectCall();
}

function cancelHandler() {
  webRTCWrapper.cancelCall();
}

function endCallHandler() {
  webRTCWrapper.endCall();
}

function toggleSound() {
  state.isAudioEnabled = !state.isAudioEnabled;
  if (state.localStream) {
    state.localStream.getAudioTracks().forEach(track => (track.enabled = state.isAudioEnabled));
  }
}

function toggleScreen() {
  state.isVideoEnabled = !state.isVideoEnabled;
  if (state.localStream) {
    state.localStream.getVideoTracks().forEach(track => (track.enabled = state.isVideoEnabled));
  }
}

const handlePostOfficeMessage = (sender, payload) => {
  const { method, type, content } = payload;

  if (method === Method.POST) {
    switch (type) {
      case Type.CALL:
        handleCallAction(content.data);
        break;
      default:
        console.error(`Unsupported POST type: ${type}`);
    }
  } else if (method === Method.GET) {
    switch (type) {
      case Type.PERMISSION:
        if (content.error) {
          store.dispatch('showErrorDialog',{message:"카메라 동작 오류",duration: 3000})
          return
        }
        initializeMedia()
        break;
      default:
        console.error(`Unsupported POST type: ${type}`);
    }
  } else if (method === Method.RELEASE) {
    // Handle RELEASE methods if needed
  } else {
    console.error(`Unsupported METHOD: ${method}`);
  }
};

function handleCallAction(actionData) {
  switch (actionData.action) {
    case 'make':
      callHandler(actionData.targetName);
      break;
    case 'answer':
      answerHandler();
      break;
    case 'reject':
      rejectHandler();
      break;
    case 'cancel':
      cancelHandler();
      break;
    case 'end':
      endCallHandler();
      break;
    default:
      console.error(`Unsupported CALL action: ${actionData.action}`);
  }
}

onMounted(async () => {
  ipcRenderer.send(ModuleName.WEB_APPLICATION, { method: Method.GET, type: Type.PERMISSION, content: { data:  'camera', error: false } });

  state.call = webRTCWrapper.call;

  webRTCWrapper.on('call-received', call => {
    state.call = call;
  });

  webRTCWrapper.on('remote-stream', remoteStream => {
    state.remoteStream = remoteStream;
    document.getElementById('remote-video').srcObject = remoteStream;
    state.isCalling = true;
  });

  webRTCWrapper.on('call-reset', () => {
    resetCallState();
  });

  webRTCWrapper.on('peer-error', error => {
    handleError('PeerJS error:', error);
  });

  webRTCWrapper.on('peer-unavailable', () => {
    handleError('서버에 존재하지 않는 ID입니다.');
  });

  webRTCWrapper.on('network-error', () => {
    handleError('네트워크 혹은 클라우드 서버 에러');
  });

  webRTCWrapper.on('call-made', call => {
    state.call = call;
    state.isCaller = true;
  });

  webRTCWrapper.on('call-error', error => {
    handleError('Call error:', error);
  });

  webRTCWrapper.on('call-ing', calling => {
    state.isCalling = calling;
  });

  webRTCWrapper.on('call-close', () => {
    ipcRenderer.send(ModuleName.WEB_APPLICATION, { method: Method.POST, type: Type.VIEW, content: { data: ViewName.EXIT, error: false } });
  });

  ipcRenderer.on(ModuleName.POST_OFFICE, handlePostOfficeMessage);
});

function resetCallState() {
  state.call = null;
  state.isCalling = false;
  state.isCaller = false;
  state.remoteStream = null;
}

function handleError(message, error = null) {
  console.error(message, error);
  resetCallState();
}

onUnmounted(() => {
  if (state.localStream) {
    state.localStream.getTracks().forEach(track => {
      track.stop();
    });
    state.localStream = null;
  }

  ipcRenderer.send(ModuleName.WEB_APPLICATION, { method: Method.RELEASE, type: Type.PERMISSION, content: { data: 'camera' , error: false } });

  webRTCWrapper.off('call-received');
  webRTCWrapper.off('remote-stream');
  webRTCWrapper.off('call-reset');
  webRTCWrapper.off('peer-error');
  webRTCWrapper.off('peer-unavailable');
  webRTCWrapper.off('network-error');
  webRTCWrapper.off('call-made');
  webRTCWrapper.off('call-error');
  webRTCWrapper.off('call-ing');
  webRTCWrapper.off('call-close');

  ipcRenderer.off(ModuleName.POST_OFFICE, handlePostOfficeMessage);
});
</script>

<template>
  <div id="container" class="container">
    <div style="width: 100%; height: 32px; margin-top: 85px; margin-bottom: 4px;">
      <div style="position: relative;">
        <el-image style="display: inline-block; margin-left: 20px; width: 28px;" :src="`${require('@/assets/image/phonebook.png')}`" fit="fit"></el-image>
        <el-select
          v-model="state.selectedContactId"
          placeholder="통화상대 찾기"
          size="medium"
          style="position: absolute; width: 150px; margin-left: 10px; color: white; font-size: 20px; font-weight: bolder;"
        >
          <el-option
            v-for="item in vcallContact"
            :key="item.id"
            :label="item.person"
            :value="item.id"
          />
        </el-select>
      </div>
    </div>
    <div style="position: relative; width: 100%; height: 570px;">
      <div style="display: flex; width: 100%; height: 100%;">
        <div style="position: relative; width: 100%; background-color: #115DD9;">
          <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
            <video id="remote-video" style="width: 100%; height: 100%;" :srcObject="state.remoteStream" fit="fit" autoplay></video>
          </div>
          <div style="position: absolute; right: 20px; bottom: 0; width: 320px; height: 200px; border: 1px solid #FD9A01;">
            <video id="local-video" style="width: 100%; height: 100%; object-fit: cover;" autoplay muted></video>
          </div>
          <div style="position: absolute; right: 37%; bottom: 0; width: 320px; height: 40px;">
            <el-button v-if="!state.isCalling && !state.call" type="primary" style="background-color: #115DD9F0; border:none;" @click="() => callHandler(null)">
              <img src="@/assets/image/call.png" alt="call button image" class="button-image" />
            </el-button>
            <el-button v-if="state.call && !state.isCalling && !state.isCaller" type="primary" style="background-color: #115DD900; border:none;" @click="answerHandler">
              <img src="@/assets/image/call.png" alt="answer button image" class="button-image animation-image" />
            </el-button>
            <el-button v-if="state.call && !state.isCalling && !state.isCaller" type="primary" style="background-color: #115DD900; border:none;" @click="rejectHandler">
              <img src="@/assets/image/hangup.png" alt="reject button image" class="button-image animation-image" />
            </el-button>
            <el-button v-if="!state.isCalling && state.isCaller" type="primary" style="background-color: #115DD900; border:none;" @click="cancelHandler">
              <img src="@/assets/image/hangup.png" alt="cancel button image" class="button-image" />
            </el-button>
            <el-button v-if="state.isCalling" type="primary" style="background-color: #115DD900; border:none;" @click="endCallHandler">
              <img src="@/assets/image/hangup.png" alt="hangup button image" class="button-image" />
            </el-button>
            <el-button type="primary" style="background-color: #FFFFFF58; border:none;" @click="toggleSound">
              <img src="@/assets/image/lock_sound.png" alt="toggle sound button image" class="button-image" />
            </el-button>
            <el-button type="primary" style="background-color: #FFFFFF58; border:none;" @click="toggleScreen">
              <img src="@/assets/image/lock_screen.png" alt="toggle screen image" class="button-image" />
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div style="width: 100%; flex-grow: 1;" />
  </div>

  <div class="header">
    <el-image style="display: inline-block; width: 42px;" :src="`${require('@/assets/image/video.png')}`" fit="fit"></el-image>
    <span style="position: absolute; top: 5px; margin-left: 5px; color: white; font-size: 28px; font-weight: bolder;">영상통화</span>
  </div>

  <el-button :style="{ 'background-color': arrowColor }" style="position: fixed; right: 9px; bottom: 9px; color: #DCDFE6;" @click="ipcRenderer.send(ModuleName.WEB_APPLICATION, { method: Method.POST, type: Type.VIEW, content: { data: ViewName.EXIT, error: false } })">&lt;</el-button>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #1D6CED;
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
  border: 1px solid #5B9BD588;
}

.list-of-receiver {
  position: fixed;
  right: 20px;
  top: 120px;
  padding: 15px;
  background-color: #C82927CC;
}

.button-image {
  width: 30px;
  height: 30px;
  margin-right: 8px;
  background-color: #1D6CED00
}

.animation-image {
  animation: horizontal-shaking 0.6s infinite;
}

@keyframes horizontal-shaking {
  0% { transform: translateX(0) }
  25% { transform: translateX(5px) }
  50% { transform: translateX(-5px) }
  75% { transform: translateX(5px) }
  100% { transform: translateX(0) }
}
</style>
