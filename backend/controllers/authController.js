const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
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
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No user with that email' });

        // generate token and expiry
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // create transporter (uses env vars)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            secure: (process.env.SMTP_SECURE === 'true') || false,
            auth: {
                user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
            },
        });

        // verify transporter to get clearer error if auth/conn fails
        try {
            await transporter.verify();
            console.log('SMTP verified');
        } catch (verifyErr) {
            console.error('SMTP verify failed:', verifyErr);
            return res.status(500).json({ message: 'SMTP configuration/connection error' });
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || (process.env.SMTP_USER || process.env.SMTP_EMAIL),
            to: user.email,
            subject: 'Password Reset',
            text: `Reset your password: ${resetUrl}`,
            html: `<p>Reset your password <a href="${resetUrl}">here</a>.</p>`,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Reset email sent:', info && info.response ? info.response : info);
            return res.json({ message: 'Password reset email sent' });
        } catch (sendErr) {
            console.error('sendMail error:', sendErr);
            return res.status(500).json({ message: 'Error sending email' });
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
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
};
