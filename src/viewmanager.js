'use strict'

import { ipcMain } from 'electron'

import { ModuleName, Type, ViewName } from '@/constant'

export default class ViewManager {
  constructor(window, emitter) {
    this.window = window

    this.emitter = emitter // to communicate with each other

    this.ipcMain = ipcMain

    this.stack = []
    // this.stack.push('wakeup')

    this.setup()
  }

  setup() {

    this.ipcMain.on(ModuleName.WEB_APPLICATION, (sender, payload) => {
      if (payload.type !== Type.VIEW) {
        return
      }
      
      if (payload.content.data === ViewName.EXIT) {
        this.stack.pop()

        let currentView = this.stack[this.stack.length - 1]
        payload.content.data = currentView !== undefined ? currentView : ViewName.SLEEP
      } else {
        let currentView = this.stack[this.stack.length - 1]
        if (currentView !== ViewName.WAKEUP && currentView !== ViewName.MENU) {
          this.stack.pop()
        }

        this.stack.push(payload.content.data)
      }

      sender.reply(ModuleName.VIEW_MANAGER, payload)

      this.emitter.emit(ModuleName.VIEW_MANAGER, payload)
    })

    this.emitter.on(ModuleName.POST_OFFICE, (payload) => {
      if (payload.type !== Type.VIEW) {
        return
      }
      
      if (payload.content.data === ViewName.EXIT) {
        this.stack.pop()

        let currentView = this.stack[this.stack.length - 1]
        payload.content.data = currentView !== undefined ? currentView : ViewName.SLEEP
      } else {
        let currentView = this.stack[this.stack.length - 1]
        if (currentView !== ViewName.WAKEUP && currentView !== ViewName.MENU) {
          this.stack.pop()
        }

        this.stack.push(payload.content.data)
      }
      this.window.webContents.send(ModuleName.VIEW_MANAGER, payload)

      this.emitter.emit(ModuleName.VIEW_MANAGER, payload)

    })
  
  }


  handleViewChange(payload) {
    if (payload.type !== Type.VIEW) {
      return
    }
    
    if (payload.content.data === ViewName.EXIT) {
      this.stack.pop()

      let currentView = this.stack[this.stack.length - 1]
      payload.content.data = currentView !== undefined ? currentView : ViewName.SLEEP
    } else {
      let currentView = this.stack[this.stack.length - 1]
      if (currentView !== ViewName.WAKEUP && currentView !== ViewName.MENU) {
        this.stack.pop()
      }

      this.stack.push(payload.content.data)
    }
  }

}
