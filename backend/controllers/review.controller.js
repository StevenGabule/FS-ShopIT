const catchAsyncErrors = require('../middleware/catchAsyncErrors.middleware');
const Product = require('../models/product.model');

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const {rating, comment, productId} = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({validateBeforeSave: false});

  res.status(201).json({
    success: true,
  });
});


// get product reviews
exports.getProductReviews = catchAsyncErrors(async(req ,res, next) => {
  const product = await Product.findById(req.query.id);

  res.json({
    success: true,
    reviews: product.reviews
  })
})


// delete product reviews
exports.deleteProductReviews = catchAsyncErrors(async(req ,res, next) => {
  const product = await Product.findById(req.query.productId);
  const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
  const numOfReviews = reviews.length;
  const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;
  await Product.findByIdAndUpdate(req.query.productId, {reviews, ratings, numOfReviews}, {new: true,runValidators: true, useFindAndModify : false}); 
  res.json({success: true})
})