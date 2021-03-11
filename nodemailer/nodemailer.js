"use strick"
const nodemailer = require('nodemailer');

mailer =  {
  sendEmail: async ({ to, subject, text }) => {
    // create transporter with environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
      }
    })
    /* Send the email */
    let info = await transporter.sendMail({
      from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_ADDRESS}>`,
      to,
      subject,
      html: text
    })
    /* Preview only available when sending through an Ethereal account */
    console.log(`Message preview URL: ${nodemailer.getTestMessageUrl(info)}`)
  }
}

module.exports = mailer;