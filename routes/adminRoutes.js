const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const router = express.Router();

// Register admin
router.post('/register', async (req, res) => {
    try {
      const { email, username, password } = req.body;
  
      let admin = await Admin.findOne({ $or: [{ email }, { username }] });
      if (admin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }

      admin = new Admin({ email, username, password });

      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
  
      await admin.save();
  
      res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });