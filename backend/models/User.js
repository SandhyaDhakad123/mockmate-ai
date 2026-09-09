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

// HASH PASSWORD
// HASH PASSWORD
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) {
    return;
  }

  // Don't hash if it is already a bcrypt hash
  if (
    this.password &&
    this.password.startsWith('$2') &&
    this.password.length > 50
  ) {
    console.log(
      `[User Model] Password for ${this.email} already hashed, skipping.`
    );
    return;
  }

  console.log(`[User Model] Hashing password for: ${this.email}`);

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      console.error(`[User Model] No password hash found for user: ${this.email}`);
      return false;
    }
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error(`[User Model] Password Comparison Error for ${this.email}:`, error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);