// Load environment variables (like your database URL) from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware: Allows the server to understand JSON data sent from the frontend
app.use(express.json()); 
// Middleware: Allows requests from different domains during development
app.use(cors()); 

// ------------------------------------------------------------------
// 1. DATABASE CONNECTION
// ------------------------------------------------------------------
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connection established successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));


// ------------------------------------------------------------------
// 2. DATA MODELS (Schemas)
// ------------------------------------------------------------------
// Define what a 'Product' looks like in the database
const ProductSchema = new mongoose.Schema({
    // We use Mongoose's ObjectId for a unique ID instead of array index
    name: { type: String, required: true, unique: true },
    qty: { type: Number, required: true, min: 0 }
});

// Define what an 'Order' looks like in the database
const OrderSchema = new mongoose.Schema({
    product: { type: String, required: true }, // The name of the product
    type: { type: String, required: true, enum: ['received', 'sent', 'defective'] },
    qty: { type: Number, required: true, min: 1 },
    date: { type: String, required: true }
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);


// ------------------------------------------------------------------
// 3. API ROUTES (Endpoints for the Frontend)
// ------------------------------------------------------------------

// Route 1: Get all Products (used for rendering the table and dropdown)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err });
    }
});

// Route 2: Add a new Product
app.post('/api/products', async (req, res) => {
    try {
        const { name, qty } = req.body;
        const newProduct = new Product({ name, qty });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: 'Error adding product. Name might exist.', error: err });
    }
});

// Route 3: Get all Orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err });
    }
});

// Route 4: Add a new Order (The most complex, as it updates stock)
app.post('/api/orders', async (req, res) => {
    const { product, type, qty, date } = req.body;

    try {
        const newOrder = new Order({ product, type, qty, date });
        await newOrder.save();

        // Stock Update Logic: Find the product and update its quantity
        const prodToUpdate = await Product.findOne({ name: product });

        if (!prodToUpdate) {
             return res.status(404).json({ message: 'Product not found for stock update.' });
        }

        let newQuantity = prodToUpdate.qty;
        if (type === 'received') {
            newQuantity += qty;
        } else if (type === 'sent' || type === 'defective') {
            newQuantity -= qty;
        }

        // Save the updated product quantity
        await Product.updateOne({ name: product }, { qty: newQuantity });

        // Send back the created order and updated product info
        res.status(201).json({ order: newOrder, newProductQty: newQuantity });

    } catch (err) {
        res.status(400).json({ message: 'Error adding order.', error: err });
    }
});

// We need more routes for Update (PUT/PATCH) and Delete (DELETE) for both Products and Orders,
// but let's focus on GET and POST for now to get a minimal working app.

// ------------------------------------------------------------------
// 4. SERVING THE FRONTEND (For Vercel Deployment)
// ------------------------------------------------------------------

// This tells the server to look in the 'public' folder for static files (index.html, script.js)
app.use(express.static(path.join(__dirname, '..', 'public')));

// // Any request that isn't an API route will be redirected to index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
// });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});