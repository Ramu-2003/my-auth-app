const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const app = express();

// CORS CONFIGURATION
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', time: new Date().toISOString() });
});

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// SENDGRID CONFIGURATION
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.json({ message: "Registered Successfully" });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: "User not found. Please register first" });
    }

    console.log('User found:', user.email);
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: "Incorrect password" });
    }

    console.log('Password matched for:', email);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log('Login successful:', email);
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// FORGOT PASSWORD
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If email exists, reset link sent" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const frontend = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetURL = `${frontend}/reset-password/${resetToken}`;

    // Always return reset link - email is optional
    const response = { 
      message: "Reset link generated",
      resetLink: resetURL
    };

    // Try to send email if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const msg = {
          to: user.email,
          from: process.env.EMAIL_FROM || 'techinmystyle@gmail.com',
          subject: 'Password Reset',
          html: `
            <h3>Password Reset</h3>
            <p>Click below link:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>Expires in 1 hour</p>
          `,
        };
        await sgMail.send(msg);
        response.message = "Reset email sent";
      } catch (emailErr) {
        console.error('SendGrid error:', emailErr.message);
        response.message = "Email failed, use the link below";
      }
    } else {
      response.message = "Use this link to reset your password";
    }

    res.json(response);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// RESET PASSWORD
app.post('/api/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
