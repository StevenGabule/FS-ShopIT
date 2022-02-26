const router = require('express').Router();
const { registerUser, resetTableUser, loginUser, logout, forgotPassword, resetPassword, getUserProfile, changePassword, updateProfile, allUsers, getUserDetails, updateProfileByAdmin, deleteProfileByAdmin } = require('../controllers/auth.controller');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/me').get(isAuthenticatedUser,getUserProfile);
router.route('/change-password').put(isAuthenticatedUser, changePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);
router.route('/clean-user-data').delete(resetTableUser);


// admin routes
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);
router.route('/admin/user/:id')
.get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
.put(isAuthenticatedUser, authorizeRoles('admin'), updateProfileByAdmin)
.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProfileByAdmin);


module.exports = router;
 
