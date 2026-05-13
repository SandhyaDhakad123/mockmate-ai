const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// HASH PASSWORD BEFORE SAVE
userSchema.pre('save', async function(next) {

  if (!this.isModified('password')) {
    return next();
  }

  try {

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    next();

  } catch (error) {

    next(error);
  }
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function(candidatePassword) {

  return await bcrypt.compare(candidatePassword, this.password);

};

module.exports = mongoose.model('User', userSchema);