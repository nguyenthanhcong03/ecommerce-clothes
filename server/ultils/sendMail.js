const nodemailer = require("nodemailer");

const sendMail = ({ email, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "maddison53@ethereal.email",
      pass: "jn7jnAPss4f63QBp6D",
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  async function main(email, html) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"FASALO SHOP" <no-reply@hihi.com>', // sender address
      to: email, // list of receivers
      subject: "Forgot password", // Subject line
      // text: "Hello world?", // plain text body
      html: html, // html body
    });

    return info;
  }
  main(email, html).catch(console.error);
};

module.exports = sendMail;
