const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, newPassword, currentPassword } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set new password' });
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update name
    user.name = name;

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

    res.json({
      message: 'Profile updated successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, updateProfile };
