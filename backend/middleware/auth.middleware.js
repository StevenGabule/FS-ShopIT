const jwt = require('jsonwebtoken');
const ErrorHandler = require('../errors/handler.error');
const User = require('../models/user.model');
const catchAsyncErrorsMiddleware = require('./catchAsyncErrors.middleware');

// check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrorsMiddleware(
  async (req, res, next) => {
    const {token} = req.cookies;

    if (!token) {
      return next(new ErrorHandler('Login first access this resource', 401));
    }

    const {id} = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    // console.log(token, req.user);
    next();
  }
);

// handling users roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403));
    }
    next();
  }
}
