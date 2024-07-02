'use strict'

import { ipcMain } from 'electron'

import { dbClient } from './dbclient'

import { ModuleName, MessageType, APIName } from '@/constant'

export default class DBService {
  constructor(emitter) {
    this.emitter = emitter // to communicate with each other

    this.ipcMain = ipcMain

    this.dbClient = dbClient

    this.setup()
  }

  setup() {
    this.ipcMain.handle(ModuleName.WEB_APPLICATION, async (sender, payload) => {
      sender

      if (payload.type !== MessageType.DB) {
        return "Unsupported Message Type"
      }

      if (payload.api === APIName.GET_TIMEZONE_OPTION) {
        return await this.getTimenameOption()

      } else if (payload.api === APIName.GET_INTAKE_OPTION) {
        return await this.getIntakeOption()

      } else if (payload.api === APIName.GET_DIRECTION_OPTION) {
        return await this.getDirectionOption()

      } else if (payload.api === APIName.GET_COMMON) {
        return await this.getCommon()

      } else if (payload.api === APIName.SET_COMMON) {
        return await this.setCommon(payload.param)

      } else if (payload.api === APIName.GET_VCALL_CONTACT) {
        return await this.getVcallContact()

      } else if (payload.api === APIName.SET_VCALL_CONTACT) {
        return await this.setVcallContact(payload.param)

      } else if (payload.api === APIName.GET_GLUCOSE_RESULT) {
        return await this.getGlucoseResult(payload.param)

      } else if (payload.api === APIName.SET_GLUCOSE_RESULT) {
        return await this.setGlucoseResult(payload.param)

      } else if (payload.api === APIName.GET_GLUCOSE_SCHEDULE) {
        return await this.getGlucoseSchedule()

      } else if (payload.api === APIName.SET_GLUCOSE_SCHEDULE) {
        return await this.setGlucoseSchedule(payload.param)

      } else if (payload.api === APIName.GET_GLUCOSE_AVERAGE) {
        return await this.getGlucoseAverage(payload.param)

      } else if (payload.api === APIName.GET_MEDICINE) {
        return await this.getMedicine()

      } else if (payload.api === APIName.SET_MEDICINE) {
        return await this.setMedicine(payload.param)

      } else if (payload.api === APIName.GET_MEDICINE_RESULT) {
        return await this.getMedicineResult(payload.param)

      } else if (payload.api === APIName.SET_MEDICINE_RESULT) {
        return await this.setMedicineResult(payload.param)

      } else if (payload.api === APIName.GET_MEDICINE_SCHEDULE) {
        return await this.getMedicineSchedule()

      } else if (payload.api === APIName.SET_MEDICINE_SCHEDULE) {
        return await this.setMedicineSchedule(payload.param)

      } else if (payload.api === APIName.GET_LOCATION) {
        return await this.getLocation()

      } else if (payload.api === APIName.SET_LOCATION) {
        return await this.setLocation(payload.param)

      } else if (payload.api === APIName.GET_SOS_CONTACT) {
        return await this.getSOSContact()

      } else if (payload.api === APIName.SET_SOS_CONTACT) {
        return await this.setSOSContact(payload.param)

      } else {
        // nothing.

      }

      return "Unsupported API Type"
    })
  }

  async getTimenameOption() {
    return await this.dbClient('timezone_option').select()
  }

  async getIntakeOption() {
    return await this.dbClient('intake_option').select()
  }

  async getDirectionOption() {
    return await this.dbClient('direction_option').select()
  }

  async getCommon() {
    return await this.dbClient('common').select()
  }

  async setCommon(data) {
    try {
      await this.dbClient.raw(
        this.dbClient.insert(data).into('common').toQuery() +
        this.dbClient.raw(`
          ON DUPLICATE KEY UPDATE
          -- key = VALUES(key),
          val = VALUES(val)
        `).toQuery())
      
      return true
    } catch (e) {
      // nothing.
    }
    
    return false
  }

  async getMedicine() {
    return await this.dbClient('medicine').select()
  }

  async setMedicine(data) {
    try {
      if (data.del.length > 0 && data.ins.length > 0) {
        await this.dbClient.transaction(async trx => {
          await this.dbClient.delete().from('medicine').whereIn('id', data.del).transacting(trx)

          await this.dbClient.raw(
            this.dbClient.insert(data.ins).into('medicine').toQuery() +
            this.dbClient.raw(`
              ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              total = VALUES(total),
              duration = VALUES(duration)
            `).toQuery()
          ).transacting(trx)
        })

        return true
      } else if (data.del.length > 0 && data.ins.length === 0) {
        await this.dbClient.delete().from('medicine').whereIn('id', data.del)

        return true
      } else if (data.del.length === 0 && data.ins.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data.ins).into('medicine').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            total = VALUES(total),
            duration = VALUES(duration)
            `).toQuery()
        )

        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }

  async getGlucoseResult(data) {
    if (data === undefined) {
      return await this.dbClient('glucose_result').select()
    }

    return await this.dbClient('glucose_result')
        .select()
        .where(this.dbClient.raw(`DATE_FORMAT(tested, "%Y-%m-%d") >= '${data.start}'`))
        .andWhere(this.dbClient.raw(`DATE_FORMAT(tested, "%Y-%m-%d") <= '${data.end}'`))
  }

  async setGlucoseResult(data) {
    try {
      if (data.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data).into('glucose_result').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            timezone_name = VALUES(timezone_name),
            alarm_time = VALUES(alarm_time),
            intake_name = VALUES(intake_name),
            tested = VALUES(tested),
            level = VALUES(level),
            status = VALUES(status)
          `).toQuery()
        )
        
        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }

  async getGlucoseSchedule() {
    let result = await this.dbClient.raw(`
SELECT
	schedule.*,
	t_opt.val timezone,
	i_opt.val intake
FROM
	glucose_schedule schedule
LEFT JOIN
	timezone_option t_opt
	ON 1 = 1
		AND schedule.timezone_option_id = t_opt.id
LEFT JOIN
	intake_option i_opt
	ON 1 = 1
		AND schedule.intake_option_id = i_opt.id
    `)

    return result[0]
  }
  
  async setGlucoseSchedule(data) {
    try {
      if (data.del.length > 0 && data.ins.length > 0) {
        await this.dbClient.transaction(async trx => {
          await this.dbClient.delete().from('glucose_schedule').whereIn('id', data.del).transacting(trx)

          await this.dbClient.raw(
            this.dbClient.insert(data.ins).into('glucose_schedule').toQuery() +
            this.dbClient.raw(`
              ON DUPLICATE KEY UPDATE
              timezone_option_id = VALUES(timezone_option_id),
              alarm_time = VALUES(alarm_time),
              intake_option_id = VALUES(intake_option_id)
            `).toQuery()
          ).transacting(trx)
        })

        return true
      } else if (data.del.length > 0 && data.ins.length === 0) {
        await this.dbClient.delete().from('glucose_schedule').whereIn('id', data.del)

        return true
      } else if (data.del.length === 0 && data.ins.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data.ins).into('glucose_schedule').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            timezone_option_id = VALUES(timezone_option_id),
            alarm_time = VALUES(alarm_time),
            intake_option_id = VALUES(intake_option_id)
          `).toQuery()
        )

        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }
  
  async getGlucoseAverage(data) {
    if (data === undefined) {
      return await this.dbClient('glucose_result')
        .select(this.dbClient.raw('AVG(level) AS AVERAGE'))
        .where(this.dbClient.raw(`status='완료'`))
      }

    return await this.dbClient('glucose_result')
      .select(this.dbClient.raw('AVG(level) AS AVERAGE'))
      .where(this.dbClient.raw(`DATE_FORMAT(tested, "%Y-%m-%d") >= '${data.start}'`))
      .andWhere(this.dbClient.raw(`DATE_FORMAT(tested, "%Y-%m-%d") <= '${data.end}'`))
      .andWhere(this.dbClient.raw(`status='완료'`))
  }
 
  async getMedicineResult(data) {
    if (data === undefined) {
      return await this.dbClient('medicine_result').select()
    }

    return await this.dbClient('medicine_result')
        .select()
        .where(this.dbClient.raw(`DATE_FORMAT(taken, "%Y-%m-%d") >= '${data.start}'`))
        .andWhere(this.dbClient.raw(`DATE_FORMAT(taken, "%Y-%m-%d") <= '${data.end}'`))
  }

  async setMedicineResult(data) {
    try {
      if (data.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data).into('medicine_result').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            medicine_name = VALUES(medicine_name),
            timezone_name = VALUES(timezone_name),
            alarm_time = VALUES(alarm_time),
            intake_name = VALUES(intake_name),
            taken = VALUES(taken),
            status = VALUES(status)
          `).toQuery()
        )

        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }

  async getMedicineSchedule() {
    let result = await this.dbClient.raw(`
SELECT
	*
FROM
	(
	SELECT
		schedule.*,
		m_opt.name medicine,
		t_opt.val timezone,
		i_opt.val intake
	FROM
		medicine_schedule schedule
	LEFT JOIN
		(
			SELECT 
			   *
			FROM
				medicine
			WHERE 1 = 1
				AND DATE_FORMAT(NOW(), '%Y-%m-%d') >= SUBSTRING_INDEX(duration, ',', 1)
				AND DATE_FORMAT(NOW(), '%Y-%m-%d') <= SUBSTRING_INDEX(duration, ',', -1)
		) m_opt
		ON 1 = 1
			AND schedule.medicine_id = m_opt.id
	LEFT JOIN
		timezone_option t_opt
		ON 1 = 1
			AND schedule.timezone_option_id = t_opt.id
	LEFT JOIN
		intake_option i_opt
		ON 1 = 1
			AND schedule.intake_option_id = i_opt.id
	) data
WHERE 1 = 1
	AND data.medicine IS NOT NULL
    `)

    return result[0]
  }

  async setMedicineSchedule(data) {
    try {
      if (data.del.length > 0 && data.ins.length > 0) {
        await this.dbClient.transaction(async trx => {
          await this.dbClient.delete().from('medicine_schedule').whereIn('id', data.del).transacting(trx)

          await this.dbClient.raw(
            this.dbClient.insert(data.ins).into('medicine_schedule').toQuery() +
            this.dbClient.raw(`
              ON DUPLICATE KEY UPDATE
              medicine_id = VALUES(medicine_id),
              timezone_option_id = VALUES(timezone_option_id),
              alarm_time = VALUES(alarm_time),
              intake_option_id = VALUES(intake_option_id)
            `).toQuery()
          ).transacting(trx)
        })

        return true
      } else if (data.del.length > 0 && data.ins.length === 0) {
        await this.dbClient.delete().from('medicine_schedule').whereIn('id', data.del)

        return true
      } else if (data.del.length === 0 && data.ins.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data.ins).into('medicine_schedule').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            medicine_id = VALUES(medicine_id),
            timezone_option_id = VALUES(timezone_option_id),
            alarm_time = VALUES(alarm_time),
            intake_option_id = VALUES(intake_option_id)
          `).toQuery()
        )

        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }

  async getVcallContact() {
    return await this.dbClient('vcall_contact').select()
  }

  async setVcallContact(data) {
    try {
      if (data.del.length > 0 && data.ins.length > 0) {
        await this.dbClient.transaction(async trx => {
          await this.dbClient.delete().from('vcall_contact').whereIn('id', data.del).transacting(trx)

          await this.dbClient.raw(
            this.dbClient.insert(data.ins).into('vcall_contact').toQuery() +
            this.dbClient.raw(`
              ON DUPLICATE KEY UPDATE
              person = VALUES(person),
              room = VALUES(room)
            `).toQuery()
          ).transacting(trx)
        })

        return true
      } else if (data.del.length > 0 && data.ins.length === 0) {
        await this.dbClient.delete().from('vcall_contact').whereIn('id', data.del)

        return true
      } else if (data.del.length === 0 && data.ins.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data.ins).into('vcall_contact').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            person = VALUES(person),
            room = VALUES(room)
          `).toQuery()
        )

        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }

  async getLocation() {
    let result = await this.dbClient.raw(`
SELECT
	loc.*,
	d_opt.val direction
FROM
	location loc
LEFT JOIN
	direction_option d_opt
	ON 1 = 1
		AND loc.direction_option_id = d_opt.id
    `)

    return result[0]
  }

  async setLocation(data) {
    try {
      if (data.del.length > 0 && data.ins.length > 0) {
        await this.dbClient.transaction(async trx => {
          await this.dbClient.delete().from('location').whereIn('id', data.del).transacting(trx)

          await this.dbClient.raw(
            this.dbClient.insert(data.ins).into('location').toQuery() +
            this.dbClient.raw(`
              ON DUPLICATE KEY UPDATE
              position = VALUES(position),
              coordinates = VALUES(coordinates),
              direction_option_id = VALUES(direction_option_id)
            `).toQuery()
          ).transacting(trx)
        })

        return true
      } else if (data.del.length > 0 && data.ins.length === 0) {
        await this.dbClient.delete().from('location').whereIn('id', data.del)

        return true
      } else if (data.del.length === 0 && data.ins.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data.ins).into('location').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            position = VALUES(position),
            coordinates = VALUES(coordinates),
            direction_option_id = VALUES(direction_option_id)
          `).toQuery()
        )

        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }

  async getSOSContact() {
    return await this.dbClient('sos_contact').select()
  }

  async setSOSContact(data) {
    try {
      if (data.del.length > 0 && data.ins.length > 0) {
        await this.dbClient.transaction(async trx => {
          await this.dbClient.delete().from('sos_contact').whereIn('id', data.del).transacting(trx)

          await this.dbClient.raw(
            this.dbClient.insert(data.ins).into('sos_contact').toQuery() +
            this.dbClient.raw(`
              ON DUPLICATE KEY UPDATE
              person = VALUES(person),
              email = VALUES(email)
            `).toQuery()
          ).transacting(trx)
        })

        return true
      } else if (data.del.length > 0 && data.ins.length === 0) {
        await this.dbClient.delete().from('sos_contact').whereIn('id', data.del)

        return true
      } else if (data.del.length === 0 && data.ins.length > 0) {
        await this.dbClient.raw(
          this.dbClient.insert(data.ins).into('sos_contact').toQuery() +
          this.dbClient.raw(`
            ON DUPLICATE KEY UPDATE
            person = VALUES(person),
            email = VALUES(email)
          `).toQuery()
        )

        return true
      }
    } catch (e) {
      // nothing.
    }

    return false
  }
}
