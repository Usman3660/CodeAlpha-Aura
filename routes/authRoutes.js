const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../models/dataStore');
const User = require('../models/User');
const { isConnected } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'aura_super_secret_jwt_key_2026_999';

// Middleware to authenticate JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    if (isConnected()) {
      user = await User.findById(decoded.id).select('-password');
    }
    if (!user) {
      user = store.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User session invalid' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};

// Middleware to enforce Admin role authorization
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check if exists
    let existingUser;
    if (isConnected()) {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    }
    if (!existingUser) {
      existingUser = store.findUserByEmail(email);
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (isConnected()) {
      const created = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address: address || {}
      });
      newUser = created.toObject();
    } else {
      newUser = store.addUser({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address: address || {}
      });
    }

    const token = jwt.sign({ id: newUser.id || newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        address: newUser.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user;
    if (isConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
    }
    if (!user) {
      user = store.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id || user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Current User Profile
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id || req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address || {}
    }
  });
});

// Update Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, address } = req.body;
    let updated;

    if (isConnected()) {
      updated = await User.findByIdAndUpdate(req.user._id, { name, address }, { new: true });
    } else {
      updated = store.updateUser(req.user.id, { name, address });
    }

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: updated.id || updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        address: updated.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { router, protect, adminOnly };

