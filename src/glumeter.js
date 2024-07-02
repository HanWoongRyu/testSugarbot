'use strict'

import { createBluetooth } from 'node-ble'

const { bluetooth } = createBluetooth()

import { sleep } from '@/utils'

export default class Glumeter {
  static SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
  static RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  static TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

  constructor(address) {
    this.address = address
  }

  async read() {
    const adapter = await bluetooth.defaultAdapter()
    if (! await adapter.isDiscovering()) {
      await adapter.startDiscovery()
    }

    const device = await adapter.waitDevice(this.address)

    await device.connect()

    const gattServer = await device.gatt()

    const service = await gattServer.getPrimaryService(Glumeter.SERVICE_UUID)

    const tx_characteristic = await service.getCharacteristic(Glumeter.TX_UUID)

    let result = 0
    for (let i = 0; i < 60; i++) {
      const buffer = await tx_characteristic.readValue()

      if (buffer.length > 0) {
        result = buffer.readUInt8(4)
        break
      }

      await sleep(1000)
    }

    await device.disconnect()

    return result
  }
}
