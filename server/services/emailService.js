import transporter from "../config/mailer.js";

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`ðŸ“§ Email Ä‘Ã£ gá»­i thÃ nh cÃ´ng tá»›i ${to}`);
  } catch (error) {
    console.error("âŒ Lá»—i khi gá»­i email:", error);
    throw new Error("Gá»­i email tháº¥t báº¡i.");
  }
};

export default { sendEmail };
