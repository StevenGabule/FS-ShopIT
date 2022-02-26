const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      maxLength: [30, 'Your name cannot exceed 30 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email.'],
      unique: true,
      validate: [validator.isEmail, 'Please enter valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [6, 'Your password must be longer than 6 characters'],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// hash the password before saving it on the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 10)
})

// compare the input password to store password in the db
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
}


// return JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({
    id: this._id
  }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

userSchema.methods.getResetPasswordToken = function () {
  // generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // set token expire  time
  this.resetPasswordExpire = `${Date.now() + 30 * 60 * 1000}`;

  // hash and set to resetPassword
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');



  return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
