const nodemailer = require('nodemailer');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const sendEmail = async options => { 
// 1) Create a transporter, service that sends email.
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
}
});
// 2) Defina the email options.
var mailOptions = {
  from: 'alikhan.innn@gmail.com',
  to: options.email, //options is comming as argument
  subject: options.subject,
  text: options.message
  // text: 'That was easy!'
};
// 3) Actually sending email
await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;