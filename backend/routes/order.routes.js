const router = require('express').Router();
const { newOrder, myListOrders, getSingleOrder, allOrders, processOrder, deleteSingleOrder } = require('../controllers/order.controller');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/orders/me').get(isAuthenticatedUser, myListOrders);   

router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);   
router.route('/admin/order/:id')
.put(isAuthenticatedUser, authorizeRoles('admin'), processOrder)
.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteSingleOrder);   

module.exports = router;