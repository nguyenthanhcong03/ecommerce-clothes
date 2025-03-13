const transporter = require("../config/mailer");

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`📧 Email đã gửi thành công tới ${to}`);
  } catch (error) {
    console.error("❌ Lỗi khi gửi email:", error);
    throw new Error("Gửi email thất bại.");
  }
};

module.exports = { sendEmail };
