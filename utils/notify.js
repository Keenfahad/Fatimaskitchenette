/**
 * utils/notify.js
 *
 * Helper functions to send SMS via Twilio and Email via nodemailer.
 *
 * ENV:
 *  TWILIO_SID
 *  TWILIO_TOKEN
 *  TWILIO_FROM
 *  SMTP_HOST
 *  SMTP_PORT
 *  SMTP_USER
 *  SMTP_PASS
 */

const twilioSid = process.env.TWILIO_SID;
const twilioToken = process.env.TWILIO_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;
const nodemailer = require('nodemailer');

let twilioClient = null;
if (twilioSid && twilioToken) {
  const twilio = require('twilio');
  twilioClient = twilio(twilioSid, twilioToken);
}

const transporter = (process.env.SMTP_HOST && process.env.SMTP_USER) ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null;

async function sendSmsAndEmailOnSuccess(order) {
  // order: { id, total, customer: { name, phone, email }, items }
  const toPhone = order.customer?.phone;
  const toEmail = order.customer?.email;

  const smsPromise = (twilioClient && toPhone) ? twilioClient.messages.create({
    from: twilioFrom,
    to: toPhone,
    body: `Your order ${order.id} is confirmed. Total: Rs ${order.total}. Thank you!`
  }) : Promise.resolve();

  const emailPromise = (transporter && toEmail) ? transporter.sendMail({
    from: process.env.SMTP_USER,
    to: toEmail,
    subject: `Order Confirmed — ${order.id}`,
    text: `Dear ${order.customer?.name || 'Customer'},\n\nYour order ${order.id} has been confirmed. Total: Rs ${order.total}.\n\nThank you,\nFatima's Kitchen`
  }) : Promise.resolve();

  return Promise.all([smsPromise, emailPromise]);
}

module.exports = sendSmsAndEmailOnSuccess;
