const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log(`[Auth] Registration attempt for email: ${email}`);

  try {
    if (!name || !email || !password) {
      console.warn(`[Auth] Registration failed: Missing fields for ${email}`);
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.warn(`[Auth] Registration failed: Email ${email} already exists`);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: role === 'admin' ? 'admin' : 'student' 
    });

    console.log(`[Auth] Registration successful for: ${email} (ID: ${user._id})`);
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(`[Auth] Registration Error for ${email}:`, err);
    res.status(500).json({ message: 'Internal Server Error during registration', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[Auth] Login attempt for email: ${email}`);

  try {
    if (!email || !password) {
      console.warn(`[Auth] Login failed: Missing credentials`);
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[Auth] Login failed: User not found with email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[Auth] User found: ${user.email}. Comparing passwords...`);
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.warn(`[Auth] Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[Auth] Login successful for: ${email}`);
    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(`[Auth] Login Error for ${email}:`, err);
    res.status(500).json({ message: 'Internal Server Error during login', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    console.log(`[Auth] Fetching profile for User ID: ${req.user.id}`);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.warn(`[Auth] GetMe failed: User ID ${req.user.id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(`[Auth] GetMe Error:`, err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe };
