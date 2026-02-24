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



/* ===========================
   CORS CONFIGURATION
=========================== */

// Allow all origins temporarily for testing
app.use(cors({
 origin: '*',
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());



/* ===========================
   DATABASE CONNECTION
=========================== */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));



/* ===========================
   SENDGRID CONFIGURATION
=========================== */
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');



/* ===========================
   REGISTER
=========================== */

app.post('/api/register', async (req, res) => {

 try {

  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists)
   return res.status(400).json({
    message: "User already exists"
   });


  const user = new User({

   name,

   email,

   password

  });

  await user.save();


  res.json({

   message: "Registered Successfully"

  });

 }

 catch {

  res.status(500).json({

   message: "Server error"

  });

 }

});



/* ===========================
   LOGIN
=========================== */

app.post('/api/login', async (req, res) => {

 try {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
   return res.status(400).json({
    message: "Invalid credentials"
   });


  const isMatch =
   await user.comparePassword(password);

  if (!isMatch)
   return res.status(400).json({
    message: "Invalid credentials"
   });


  const token = jwt.sign(

   { id: user._id },

   process.env.JWT_SECRET,

   { expiresIn: "1h" }

  );


  res.json({

   token,

   user

  });

 }

 catch {

  res.status(500).json({

   message: "Server error"

  });

 }

});



/* ===========================
   FORGOT PASSWORD
=========================== */

app.post('/api/forgot-password', async (req, res) => {

 try {

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
   return res.json({
    message: "If email exists, reset link sent"
   });


   const resetToken = crypto.randomBytes(32).toString('hex');

   user.resetPasswordToken = resetToken;
   user.resetPasswordExpires = Date.now() + 3600000;
   await user.save();

   const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
   const resetURL = `${frontend}/reset-password/${resetToken}`;

   const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM || process.env.SMTP_EMAIL || 'no-reply@example.com',
      subject: 'Password Reset',
      html: `
         <h3>Password Reset</h3>
         <p>Click below link:</p>
         <a href="${resetURL}">${resetURL}</a>
         <p>Expires in 1 hour</p>
      `,
   };

   try {
      await sgMail.send(msg);
   } catch (err) {
      console.error('SendGrid send error:', err);
      return res.status(500).json({ message: 'Email failed' });
   }



  res.json({

   message: "Reset email sent"

  });

 }

 catch (err) {

  console.log(err);

  res.status(500).json({

   message: "Email failed"

  });

 }

});



/* ===========================
   RESET PASSWORD
=========================== */

app.post('/api/reset-password/:token', async (req, res) => {

 try {

  const user = await User.findOne({

   resetPasswordToken: req.params.token,

   resetPasswordExpires: {

    $gt: Date.now()

   }

  });


  if (!user)
   return res.status(400).json({

    message: "Invalid or expired token"

   });


  user.password = req.body.password;

  user.resetPasswordToken = undefined;

  user.resetPasswordExpires = undefined;


  await user.save();



  res.json({

   message: "Password updated successfully"

  });

 }

 catch {

  res.status(500).json({

   message: "Server error"

  });

 }

});



/* ===========================
   SERVER START
=========================== */

const PORT =
 process.env.PORT || 3000;


app.listen(PORT, () =>
 console.log("Server running on port", PORT)
);