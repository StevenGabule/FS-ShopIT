const ErrorHandler = require('../errors/handler.error');
const catchAsyncErrors = require('../middleware/catchAsyncErrors.middleware');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });

  return res.status(201).json({
    success: true,
    order,
  });
});

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    return next(new ErrorHandler('No order found with this ID', 404));
  }

  return res.status(200).json({
    success: true,
    order,
  });
});

exports.myListOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({user: req.user._id});
  return res.status(200).json({success: true, orders});
});

exports.allOrders = catchAsyncErrors(async(req, res, next) => {
  const orders = await Order.find({});

  let totalAmount = 0;

  orders.forEach(order => totalAmount += order.totalPrice)

  return res.json({
    success: true,
    totalAmount,
    orders
  })
})


exports.processOrder = catchAsyncErrors(async(req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === 'Delivered') {
    return next(new ErrorHandler('You have already delivered this order', 400));
  }

  order.orderItems.forEach(async item => {
    await updateStock(item.product, item.quantity)
  });

  order.orderStatus = req.body.orderStatus;
  order.deliveredAt = Date.now()
  await order.save();

  return res.json({
    success: true
  })
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock = product.stock - quantity;
  await product.save({validateBeforeSave: false});
}

exports.deleteSingleOrder = catchAsyncErrors(async(req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new ErrorHandler('No order found with this ID', 404))
  }

  await order.remove();

  res.json({
    success: true
  })
});