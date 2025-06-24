const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill out all fields.' });
  }

  try {
    // Configure transporter for Gmail SMTP
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // your gmail address
        pass: process.env.EMAIL_PASS,  // your gmail app password or real password (2FA requires app password)
      },
    });

    // Email options
    const mailOptions = {
      from: `"${name}" <${email}>`,  // sender name & email
      to: 'nesthaul@gmail.com',      // your email to receive messages
      subject: `New Contact Form Message from ${name}`,
      text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      replyTo: email,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
