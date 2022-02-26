const {
  index,
  store,
  retrieve,
  update,
  destroy,
} = require('../controllers/product.controller');
const { createProductReview, getProductReviews, deleteProductReviews } = require('../controllers/review.controller');
const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth.middleware');

const router = require('express').Router();

router.route('/products').get(index);
router.route('/product/:id').get(retrieve);
router.route('/review')
.post(isAuthenticatedUser, createProductReview)
.get(isAuthenticatedUser, getProductReviews)
.delete(isAuthenticatedUser, deleteProductReviews);

router.route('/admin/products').post(isAuthenticatedUser, authorizeRoles('admin'),store);
router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'),update)
  .delete(isAuthenticatedUser, authorizeRoles('admin'),destroy);

module.exports = router;
