const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

const errorMiddleware = require('./middleware/errors.middleware')

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const products = require('./routes/product.routes')
const auth = require('./routes/auth.routes');
const order = require('./routes/order.routes');

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);

// implement the middleware for handling errors
app.use(errorMiddleware)

module.exports = app;