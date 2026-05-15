import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL;
const emailPass = process.env.PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  if (!emailUser || !emailPass) {
    throw new Error("Email credentials are missing");
  }

  await transporter.sendMail({
    from: `"RYDEX" <${emailUser}>`,
    to,
    subject,
    html,
  });
};
