const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = (toEmail, verificationCode) => {
  const verificationUrl = `http://localhost:${process.env.PORT || 5000}/api/verify-email?email=${toEmail}&code=${verificationCode}`;

  const mailOptions = {
    from: `"NestHaul" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Please verify your email for NestHaul',
    html: `
      <h3>Welcome to NestHaul!</h3>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
