const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const User = require('./models/User');
// Load .env from the backend folder explicitly so running from workspace root works
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS configuration - allows all origins (TEMPORARY for testing)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Test endpoint to verify CORS is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined. Check backend/.env or environment variables.');
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB Connected"))
        .catch(err => console.log("MongoDB Connection Error:", err));
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Log the reset URL for debugging (since email is blocked on Render free tier)
        console.log('Password reset URL for', user.email, ':', resetUrl);

        // Try to send email, but don't fail if it doesn't work (Render blocks SMTP)
        try {
            const mailOptions = {
                to: user.email,
                from: process.env.SMTP_EMAIL,
                subject: 'Password Reset Request',
                text: `Click here to reset your password: ${resetUrl}`
            };
            await transporter.sendMail(mailOptions);
            res.json({ message: "Reset email sent successfully" });
        } catch (emailErr) {
            // Return the reset link in the response so user can still reset password
            res.json({ 
                message: "Email service unavailable. Use this link to reset:",
                resetLink: resetUrl
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Token is invalid or expired" });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
