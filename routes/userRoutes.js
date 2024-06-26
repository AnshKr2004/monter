const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

    await sendOTP(email, otp);

    user = new User({ email, username, password });

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

    const storedOTP = otpStore[email];
    if (!storedOTP || parseInt(otp) !== storedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let user = await User.findOneAndUpdate(
      { email },
      { $set: { isVerified: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    delete otpStore[email];

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

async function sendOTP(email, otp) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com", // Replace with your email
      pass: "your_password", // Replace with your password
    },
  });

  let mailOptions = {
    from: "your_email@gmail.com",
    to: email,
    subject: "OTP for Account Verification",
    text: `Your OTP for account verification is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

// Update user information
router.put("/update", async (req, res) => {
  const { location, age, work, dob, description } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = location;
    user.age = age;
    user.work = work;
    user.dob = dob;
    user.description = description;

    await user.save();

    res.json({ message: "User information updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login user and get JWT token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
