import { ipcRenderer } from 'electron';
import Peer from 'peerjs';
import { ModuleName, Type, ViewName } from '@/constant';
import { useStore } from 'vuex';

class WebRTCWrapper {
  static instance = null;

  constructor() {
    if (WebRTCWrapper.instance) {
      return WebRTCWrapper.instance;
    }
    this.callTimeout = null;
    this.peer = null;
    this.call = null;
    this.currentPeerId = null;
    this.listeners = {};
    this.isCalling = false;
    this.store = useStore();
    this.store.watch(
      (state) => state.common,
      (newCommonData) => {
        const peerId = newCommonData.find(item => item.key === '시그널 사용자')?.val;
        if (peerId && peerId !== this.currentPeerId) {
          this.currentPeerId = peerId;
          this.init("ryu123");
        }
      },
      { deep: true }
    );
    this.currentView = this.store.currentView;
    WebRTCWrapper.instance = this;
  }

  static getInstance() {
    if (!WebRTCWrapper.instance) {
      WebRTCWrapper.instance = new WebRTCWrapper();
    }
    return WebRTCWrapper.instance;
  }

  init(peerId) {
    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = peerId ? new Peer(peerId) : new Peer();

    this.peer.on('open', id => {
      console.log("peer id : ", id);
      this.notifyListeners('peer-open', id);
    });

    this.peer.on('call', call => {
      if (call.metadata.type !== "isollab") {
        return;
      }

      if (this.call) {
        console.log(`이미 통화 중입니다. 통화 요청을 거절합니다: ${call.peer}`);
        const conn = this.peer.connect(this.call.peer);
        conn.on('open', () => {
          conn.send('busy');
          setTimeout(() => {
            conn.close();
          }, 1000);
          this.resetCallState();
        });
        return;
      }
      this.call = call;
      console.log(`통화 요청을 받았습니다: ${call.peer}`);
      if (this.currentView !== ViewName.CALL) {
        ipcRenderer.send(ModuleName.WEB_APPLICATION, { type: Type.VIEW, view: ViewName.CALL });
      }
      this.notifyListeners('call-received', call);
    });

    this.peer.on('connection', conn => {
      conn.on('data', data => {
        console.log(`수신된 데이터: ${data}`);
        if (['busy', 'reject', 'cancel'].includes(data)) {
          this.resetCallState();
          this.notifyListeners('call-reset', data);
        }
      });
    });

    this.peer.on('error', error => {
      console.log(`Peer 에러 발생: ${error.type}`);
      this.notifyListeners('peer-error', error);
      if (error.type === 'peer-unavailable') {
        this.resetCallState();
        this.notifyListeners('peer-unavailable');
      } else {
        this.init(peerId);
        this.notifyListeners('network-error');
      }
    });
  }

  resetCallState() {
    console.log('통화 상태를 초기화합니다.');
    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
      this.callTimeout = null;
    }
    this.call = null;
    this.isCalling = false;
    this.notifyListeners('call-reset');
  }

  answerCall(stream) {
    if (this.call && !this.isCalling) {
      console.log("통화를 수락합니다.");
      this.call.answer(stream);
      this.call.on('stream', remoteStream => {
        console.log("원격 스트림을 수신했습니다.");
        this.notifyListeners('remote-stream', remoteStream);
        this.isCalling = true;
        this.notifyListeners('call-ing', this.isCalling);
      });
      this.call.on('close', () => {
        console.log("통화가 종료되었습니다.");
        this.resetCallState();
        this.notifyListeners('call-close');

      });
    }
  }

  async rejectCall() {
    if (this.call && !this.isCalling) {
      console.log(`통화를 거절합니다: ${this.call.peer}`);
      const conn = this.peer.connect(this.call.peer);
      conn.on('open', () => {
        conn.send('reject');
        setTimeout(() => {
          conn.close();
        }, 1000);
        this.resetCallState();
      });
    }
  }

  async makeCall(peerId, stream) {
    if (!this.peer) {
      console.error('Peer object is not initialized.');
      return;
    }
  
    console.log(`Starting a call with: ${peerId}`);
    const options = { metadata: { type: 'isollab', id: this.currentPeerId } };
  
    try {
      this.call = this.peer.call(peerId, stream, options);
      console.log(stream)
      if (!this.call) {
        console.error('Failed to make a call.');
        return;
      }
  
      this.notifyListeners('call-made', this.call);
  
      this.callTimeout = setTimeout(() => {
        if (!this.isCalling) {
          this.cancelCall();
        }
      }, 300000); // 30 seconds
  
      this.call.on('stream', remoteStream => {
        console.log('Received remote stream.');
        this.notifyListeners('remote-stream', remoteStream);
        this.isCalling = true;
        this.notifyListeners('call-ing', this.isCalling);
      });
  
      this.call.on('error', error => {
        console.error(`Error during call: ${error}`);
        this.clearCallTimeout();
        this.resetCallState();
        this.notifyListeners('call-error', error);
      });
  
      this.call.on('close', () => {
        console.log('Call has ended.');
        this.clearCallTimeout();
        this.resetCallState();
        this.notifyListeners('call-close');
      });
    } catch (error) {
      console.error('Error making call:', error);
      this.resetCallState();
    }
  }
  async cancelCall() {
    if (this.call && !this.isCalling) {
      console.log(`통화를 취소합니다: ${this.call.peer}`);
      const conn = this.peer.connect(this.call.peer);
      conn.on('open', () => {
        conn.send('cancel');
        setTimeout(() => {
          conn.close();
        }, 1000);
        this.resetCallState();
      });
    }
  }

  clearCallTimeout() {
    console.log('통화 타임아웃을 해제합니다.');
    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
      this.callTimeout = null;
    }
  }

  endCall() {
    if (this.call && this.isCalling) {
      console.log("통화를 종료합니다.");
      this.call.close();
      this.resetCallState();
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(listener => listener  === callback); 
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export default WebRTCWrapper;
