// postoffice.js
'use strict'

import { ipcMain } from 'electron'
import ROSLIB from 'roslib'
import { ModuleName, ViewName, Type, Method } from "@/constant"

const SERVER_URL = 'ws://172.30.1.9:9090'
const ROS_TOPIC_NAME = 'ros/'
const APP_TOPIC_NAME = 'app/'
const MESSAGE_TYPE = 'std_msgs/String'

export default class PostOffice {
  constructor(window, emitter) {
    this.window = window
    this.emitter = emitter

    this.ipcMain = ipcMain

    this.cache = {
      currentView: ViewName.WAKEUP
    }
    
    this.viewManagerListener = (payload) => {
      console.log("viewManagerListener", payload)
      this.cache.currentView = payload.content.data
      console.log(this.cache.currentView)
      this.sendToROS(payload)
    }

    this.webApplicationListener = (sender, payload) => {
      sender
      this.sendToROS(payload);
    };

    this.initialize()
    this.setup()

  
    setTimeout(()=>{
      const testContent ={data : "장군아 탐색", error :false}
      this.handleCommand(testContent)
    },1000)

    setTimeout(()=>{
      const testContent ={data : "장군아 현관 탐색", error :false}
      this.handleCommand(testContent)
    },3000)

    // setTimeout(()=>{
    //   const testMessage={method:Method.GET,type:Type.SEARCH, content : {data :null, error :false}}
    //   this.handleMessage(JSON.stringify(testMessage))
    // }, 25000)


    // setTimeout(()=>{
    //   const testContent ={data : "장군아 영상 시작", error :false}
    //   this.handleCommand(testContent)
    // },20000)
    
    // setTimeout(()=>{
    //   const testContent ={data : "장군아 영상 정지", error :false}
    //   this.handleCommand(testContent)
    // },30000)

    // setTimeout(()=>{
    //   const testContent ={data : "장군아 영상 중지", error :false}
    //   this.handleCommand(testContent)
    // },40000)

    // setTimeout(()=>{
    //   const testContent ={data : "장군아 영상 종료", error :false}
    //   this.handleCommand(testContent)
    // },50000)




  }

  initialize() {
    this.emitter.off(ModuleName.VIEW_MANAGER, this.viewManagerListener)
    this.ipcMain.off(ModuleName.WEB_APPLICATION, this.webApplicationListener);

    this.server = null
    this.publisher = null
    this.subscriber = null
  }

  setup() {
    this.emitter.on(ModuleName.VIEW_MANAGER, this.viewManagerListener)
    this.ipcMain.on(ModuleName.WEB_APPLICATION, this.webApplicationListener)
    this.server = new ROSLIB.Ros({ url: SERVER_URL })

    this.server.on('connection', () => {
      this.handleConnection()
    })

    this.server.on('error', (error) => {
      this.handleError(error)
    })

    this.server.on('close', () => {
      this.handleClose()
    })
  }

  handleConnection() {
    console.log(`ROS 클라이언트 연결`)

    this.publisher = new ROSLIB.Topic({ ros: this.server, name: APP_TOPIC_NAME, messageType: MESSAGE_TYPE })
    
    this.subscriber = new ROSLIB.Topic({ ros: this.server, name: ROS_TOPIC_NAME, messageType: MESSAGE_TYPE })
    this.subscriber.subscribe((message) => {
      this.handleMessage(message.data)
    })
  }

  handleMessage(jsonMessage) {
    let message = JSON.parse(jsonMessage);
    if (typeof message === 'object' && message !== null) {
      if ('method' in message && 'type' in message && 'content' in message) {
        const { method, type, content } = message;
        
        if (content.error) {
          console.error(`Error received: ${content.error}`);
          //
        }
        
        switch (method) {
          case Method.POST:
            this.handlePostMethod(type, content);
            break;
          case Method.GET:
            this.handleGetMethod(type, content);
            break;
          case Method.RELEASE:
            this.handleReleaseMethod(type, content);
            break;
          case Method.SAVE:
            this.handleSaveMethod(type, content);
            break;
          default:
            console.error(`Unsupported METHOD: ${method}`);
        }
      } else {
        console.error("Invalid message format");
      }
    } else {
      console.error("Invalid message format");
    }
  }

  handlePostMethod(type, content) {
    switch (type) {
      case Type.COMMAND:
        this.handleCommand(content);
        break;
      case Type.STT:
      case Type.GPT:
      case Type.NAVIGATION:
      case Type.CAMERA_IMAGE:
      case Type.SEARCH:
        this.sendToWebApplication({method: Method.POST, type, content });
        break;
      default:
        console.error(`Unsupported POST type: ${type}`);
    }
  }

  handleGetMethod(type, content) {
    switch (type) {
      case Type.PERMISSION:
      case Type.MAPPING:
      case Type.MAPPED:
      case Type.SEARCH:
        console.log(`${type} 요청 처리: ${content.data}`);
        this.sendToWebApplication({ method: Method.GET, type, content });
        break;
      default:
        console.error(`Unsupported GET type: ${type}`);
    }
  }

  handleReleaseMethod(type, content) {
    // ros로 부터 받는 것은 정의 x 기본적으로 null 반환
    return null;
  }

  handleSaveMethod(type, content) {
    if (type === Type.MAPPED) {
      this.sendToWebApplication({ method: Method.SAVE, type, content });
    } else {
      console.error(`Unsupported SAVE type: ${type}`);
    }
  }

  stripCommandPrefix(command) {
    return command.replace(/^장군\S*\s*/, '').trim();
  }

  handleCommand(content) {
    let command = content.data.trim()
    console.log(`명령어 처리: ${command}`);
    
    if (command.startsWith("장군")) {
      command = this.stripCommandPrefix(command);
      if (this.isCallCommand(command)) {
        this.handleCallCommand(command);
      } else {
        this.handleViewCommand(command);
      }
    }
  }

 
  isCallCommand(command) {
    return (command.includes("전화") || command.includes("통화")) && 
          (command.includes("걸어") || command.includes("요청") || command.includes("거절") || command.includes("취소") || command.includes("종료") || command.includes("응답"));
  }

  handleCallCommand(command) {
    if (command.includes("거절")) {
      console.log("전화 거절 명령어 인식됨");
      this.rejectHandler();
    } else if (command.includes("취소")) {
      console.log("전화 취소 명령어 인식됨");
      this.cancelHandler();
    } else if (command.includes("종료")) {
      console.log("전화 종료 명령어 인식됨");
      this.endCallHandler();
    } else if (command.includes("응답")) {
      console.log("전화 응답 명령어 인식됨");
      this.answerHandler();
    } else {
      const targetName = this.extractTargetName(command);
      console.log(`타겟 이름 추출: ${targetName}`);
      
      if (targetName) {
        this.callHandler(targetName);
      }
    }
  }

  handleViewCommand(command) {
    let viewName = null;
    let position = null;

    if (this.cache.currentView === "search" && command.includes("탐색")) {
        const match = command.match(/(.*?)\s*탐색/);
        position = match ? match[1].trim() : null;
        if (position) {
            this.sendToWebApplication({ method: Method.POST, type: Type.POSITION, content: { data: position, error: false } });
        }
    } else if (this.cache.currentView === "search" && command.includes("영상")) {
        let videoCommand = null;
        if (command.includes("시작")) videoCommand = "video_start";
        else if (command.includes("정지")) videoCommand = "video_pause";
        else if (command.includes("중지")) videoCommand = "video_stop";
        else if (command.includes("종료") || command.includes("나가기")) videoCommand = "video_stop";
        
        if (videoCommand) {
          this.sendToWebApplication({ method: Method.POST, type: Type.COMMAND, content: { data: videoCommand, error: false } });
        }
    } else {
        if (command.includes("구조")) viewName = "sos";
        else if ((command.includes("혈당") && command.includes("검사")) || command.includes("혈당검사")) viewName = "glucose";
        else if (command.includes("말벗")) viewName = "buddy";
        else if (command.includes("영상") || command.includes("통화")) viewName = "call";
        else if (command.includes("탐색")) viewName = "search";
        else if ((command.includes("약") && command.includes("복용")) || command.includes("약복용")) viewName = "medicine";
        else if (command.includes("메뉴") || command.includes("매뉴")) viewName = "menu";
        else if (command.includes("종료")) viewName = "";
        else if (command.includes("앞")) this.sendToROS({ method: Method.POST, type: Type.MANUAL, content: { data:  'forward' , error: false } });
        else if (command.includes("뒤")) this.sendToROS({ method: Method.POST, type: Type.MANUAL, content: { data: 'backward' , error: false } });
        else if (command.includes("왼쪽")) this.sendToROS({ method: Method.POST, type: Type.MANUAL, content: { data: 'left', error: false } });
        else if (command.includes("오른쪽")) this.sendToROS({ method: Method.POST, type: Type.MANUAL, content: { data: 'right', error: false } });
        else if (command.includes("멈춰")) this.sendToROS({ method: Method.POST, type: Type.MANUAL, content: { data: 'stop', error: false } });

        console.log(`뷰 변경: ${viewName}`);

        if (viewName) {
            this.emitter.emit(ModuleName.POST_OFFICE, { type: Type.VIEW, content: { data: viewName, error: false } });
        } 
        else if (viewName === ViewName.EXIT) {
            this.emitter.emit(ModuleName.POST_OFFICE, { type: Type.VIEW, content: { data: viewName, error: false } });
        }
        else if (this.cache.currentView === 'sleep') {
            this.emitter.emit(ModuleName.POST_OFFICE, { type: Type.VIEW, content: { data: "wakeup", error: false } });
        }
    }
  }


  extractTargetName(command) {
    const match = command.match(/(.+?)(?=\s*(전화|통화))/); 
    return match ? match[1].trim() : null;
  }

  callHandler(targetName) {
    console.log(`전화 걸기: ${targetName}`);
    this.window.webContents.send(ModuleName.POST_OFFICE, { type: Type.CALL, content: { data: {action: 'answer', targetName}, error: false } });
  }

  answerHandler() {
    console.log("전화 응답");
    this.window.webContents.send(ModuleName.POST_OFFICE, { type: Type.CALL, content: { data: {action: 'answer'}, error: false } });
  }

  rejectHandler() {
    console.log("전화 거절");
    this.window.webContents.send(ModuleName.POST_OFFICE, { type: Type.CALL, content: { data: {action: 'reject'}, error: false } });
  }

  cancelHandler() {
    console.log("전화 취소");
    this.window.webContents.send(ModuleName.POST_OFFICE, { type: Type.CALL, content: { data: {action: 'cancel'}, error: false } });
  }

  endCallHandler() {
    console.log("전화 종료");
    this.window.webContents.send(ModuleName.POST_OFFICE, { type: Type.CALL, content: { data: {action: 'end'}, error: false } });
  }

  handleError(error) {
    console.log(`ROS 클라이언트 에러: ${JSON.stringify(error)}`)
    this.server.close()
  }

  handleClose() {
    console.log(`ROS 클라이언트 연결 해제`)
    this.initialize()
    this.setup()
  }
  
  sendToWebApplication(payload) {
    this.window.webContents.send(ModuleName.POST_OFFICE, payload)
  }

  sendToROS(data) {
    console.log(data)
    if (this.publisher === null) {
      console.log(`ROS 발행인 없음`)
      return;
    }

    if (data === null) {
      console.error("sendToROS is null")
      return;
    }
    this.publisher.publish({ data: JSON.stringify(data) });
    console.log(`ROS 메시지 발행: ${JSON.stringify(data)}`);
  }
}
