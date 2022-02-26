const Product = require('../models/product.model');
const ErrorHandler = require('../errors/handler.error');
const catchAsyncErrors = require('../middleware/catchAsyncErrors.middleware');
const APIFeatures = require('../utils/apiFeatures.util');

exports.index = catchAsyncErrors(async (req, res, next) => {
  
  // return next(new ErrorHandler('my error', 400));

  const resPerPage = 3;
  const productsCount = await Product.countDocuments();

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeatures.query;
  let filteredProductCount = products.length;

  apiFeatures.paginate(resPerPage);

  res.json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductCount,
    products,
  });
});

exports.store = async (req, res) => {
  try {
    req.body.user = req.user._id;
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error.stack);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.retrieve = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  res.json({success: true, product});
});

exports.update = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );
  res.status(201).json({success: true, updatedProduct});
});

exports.destroy = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  product.remove();
  res.status(200).json({success: true});
});
