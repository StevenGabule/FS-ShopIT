const connectDatabase = require('../config/database');
const Product = require('../models/product.model');
const products = require('../data/product.json')

require('dotenv').config({ path: 'backend/config/config.env'})

connectDatabase();

const seedProducts = async() => {
    try {
        await Product.deleteMany()
        console.log('Products are deleted!');

        await Product.insertMany(products);
        console.log('All products are completely added!');
        
        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

seedProducts();