const ErrorHandler = require('../errors/handler.error');
const catchAsyncErrors = require('../middleware/catchAsyncErrors.middleware');
const User = require('../models/user.model');
const sendToken = require('../utils/jwtToken.util');
const sendEmail = require('../utils/sendEmail.util');
const crypto = require('crypto');

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const {name, email, password} = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: 'avatars/213a1231a13555',
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    },
  });

  sendToken(user, 200, res);
});

exports.loginUser = async (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: 'Please enter email and password',
    });
  }

  const user = await User.findOne({email}).select('+password');
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found or exists!',
    });
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.json({
      success: false,
      message: 'Invalid password',
    });
  }
  sendToken(user, 200, res);
};

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out!',
  });
});

// forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({email: req.body.email});

    if (!user) {
      return next(new ErrorHandler('User not found with this email', 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    // create reset password url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'ShopIT Password Recovery',
        message,
      });
      return res.json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({validateBeforeSave: false});
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    console.log(error.stack);
    return res.json({
      message: 'Something goes wrong',
      err: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // hash url token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now()},
  });

  if (!user) {
    return next(
      new ErrorHandler('Password reset token is invalid or expired!', 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400));
  }

  // setup new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// get currently logged in user details => api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user
  })
});

// change password
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  // check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler('Old password is incorrect', 400))
  }

  user.password = req.body.password;
  await user.save();
  sendToken(user, 200, res);

});

// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = { name: req.body.name, email: req.body.email };
  // TODO: Update avatar

  await User.findByIdAndUpdate(req.user._id, newUserData, {new: true,runValidators: true});
  res.status(200).json({
    success: true
  })
})

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.json({
    success: true,
    users
  })
});

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.json({
    success: true,
    user
  })
});

// wipe out data or reset the users table
exports.resetTableUser = async (req, res) => {
  const deletedUser = await User.deleteMany();
  if (deletedUser) {
    return res.json({message: 'Users information wipe out!'});
  }
  return res.json({message: 'Something goes wrong!'});
};


// update user profile => /api/v1/admin/user/:id
exports.updateProfileByAdmin = catchAsyncErrors(async (req, res, next) => {
  const newUserData = { name: req.body.name, email: req.body.email, role: req.body.role };
  // TODO: Update avatar

  await User.findByIdAndUpdate(req.params.id, newUserData, {new: true,runValidators: true});
  res.status(200).json({
    success: true
  })
})


// update user profile => /api/v1/admin/user/:id
exports.deleteProfileByAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler('User does not found with that id', 400));
  }

  await user.remove();

  // TODO: Update avatar
  res.status(200).json({
    success: true
  })
})