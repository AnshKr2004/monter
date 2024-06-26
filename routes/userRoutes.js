const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP (6-digit number)
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP in memory (you can use a database or cache for production)
    otpStore[email] = otp;

    // Send OTP via email (nodemailer setup required)
    await sendOTP(email, otp);

    // Create new user
    user = new User({ email, username, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Validate user account with OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists in store
    const storedOTP = otpStore[email];
    if (!storedOTP || parseInt(otp) !== storedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark user as verified in the database
    let user = await User.findOneAndUpdate(
      { email },
      { $set: { isVerified: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: Clear OTP from store after successful verification
    delete otpStore[email];

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

async function sendOTP(email, otp) {
  // Configure nodemailer (replace with your SMTP settings)
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com", // Replace with your email
      pass: "your_password", // Replace with your password
    },
  });

  // Email message options
  let mailOptions = {
    from: "your_email@gmail.com",
    to: email,
    subject: "OTP for Account Verification",
    text: `Your OTP for account verification is: ${otp}`,
  };

  // Send email
  await transporter.sendMail(mailOptions);
}

// Update user information
router.put('/update', async (req, res) => {
  const { location, age, work, dob, description } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.location = location;
    user.age = age;
    user.work = work;
    user.dob = dob;
    user.description = description;

    await user.save();

    res.json({ message: 'User information updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});