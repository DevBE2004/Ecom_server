const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendMail = asyncHandler(async ({ email, html, subject }) => {
  // Tạo transporter cho dịch vụ email bạn muốn sử dụng
  let transporter = nodemailer.createTransport({
    service: "CuaHangDienTu@Gmail.com",
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  // Định nghĩa thông điệp email
  let info = await transporter.sendMail({
    from: "Store@gmail.com",
    to: email,
    subject: subject,
    html: html,
  });

  return info;
});

module.exports = sendMail;
