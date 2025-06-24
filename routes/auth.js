const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const sendVerificationEmail = require('../utils/mailer');
const crypto = require('crypto');

// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, userType } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const verificationCode = crypto.randomBytes(20).toString('hex');

    const user = new User({ 
      name, 
      email, 
      password, 
      phone, 
      userType, 
      verificationCode 
    });

    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Login successful!', 
      token,
      user: payload
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected profile route
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Protected profile data', user: req.user });
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  const { email, code } = req.query;

  try {
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).send("Invalid or expired verification link.");
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.redirect("https://nesthaul.netlify.app/login.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error during verification.");
  }
});

module.exports = router;
