'use strict'

const nodemailer = require('nodemailer');

export default class EmergencyEmail {
  constructor(server, username, password) {
    this.server = server
    this.username = username
    this.password = password
  }

  async sendEmailTo(contact) {
    try {
      let transporter = nodemailer.createTransport({
        service: `${this.server}`,
        auth: {
            user: `${this.username}`,
            pass: `${this.password}`
        }
      });
  
      let mailOptions = {
        from: ``,
        to: `${contact.email}`,
        subject: `[구조알림]`,
        // text: ``,
        html: `<b>구조알림!</b>`,
      };
  
      await transporter.sendMail(mailOptions)
  
      return true
    } catch (e) {
      // nothing.
    }
  
    return false
  }
}
