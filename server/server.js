// Load environment variables (like your database URL) from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json()); 
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
const ProductSchema = new mongoose.Schema({
    // MongoDB automatically adds the unique _id
    name: { type: String, required: true, unique: true },
    qty: { type: Number, required: true, default: 0 } // Default to 0 stock
});

const OrderSchema = new mongoose.Schema({
    product: { type: String, required: true }, // The name of the product
    type: { type: String, required: true, enum: ['received', 'sent', 'defective'] },
    qty: { type: Number, required: true, min: 1 },
    date: { type: String, required: true }
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);


// ------------------------------------------------------------------
// 3. API ROUTES
// ------------------------------------------------------------------

// --- PRODUCTS ROUTES ---

// GET all Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err });
    }
});

// POST (Add) a new Product
app.post('/api/products', async (req, res) => {
    try {
        const { name, qty } = req.body;
        const newProduct = new Product({ name, qty });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        // Handle case where product name already exists (unique: true)
        if (err.code === 11000) { 
             return res.status(409).json({ message: 'Product name already exists.' });
        }
        res.status(400).json({ message: 'Error adding product.', error: err });
    }
});

// PUT/PATCH (Update) a Product
app.patch('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, qty } = req.body;
    
    // Create an update object with only the fields provided in the request body
    const updateFields = {};
    if (name) updateFields.name = name;
    if (qty !== undefined) updateFields.qty = Number(qty); 

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            { $set: updateFields }, 
            { new: true, runValidators: true } 
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json(updatedProduct);

    } catch (err) {
        if (err.code === 11000) { 
             return res.status(409).json({ message: 'Product name already exists.' });
        }
        res.status(500).json({ message: 'Error updating product.', error: err });
    }
});

// DELETE a Product
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const productToDelete = await Product.findById(id);

        if (!productToDelete) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Optional: Warn about related orders (cannot strictly prevent deletion here)
        const ordersCount = await Order.countDocuments({ product: productToDelete.name });
        if (ordersCount > 0) {
             console.warn(`Product ${productToDelete.name} deleted, but ${ordersCount} related orders exist.`);
        }
        
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err });
    }
});


// --- ORDERS ROUTES ---

// GET all Orders
app.get('/api/orders', async (req, res) => {
    try {
        // Sort by date descending
        const orders = await Order.find().sort({ date: '-1' }); 
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err });
    }
});

// POST (Add) a new Order (Includes Stock Update)
app.post('/api/orders', async (req, res) => {
    const { product, type, qty, date } = req.body;

    try {
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

        if (newQuantity < 0) {
            return res.status(400).json({ message: 'Cannot create order: Stock would become negative.' });
        }

        // 1. Create the order
        const newOrder = new Order({ product, type, qty, date });
        await newOrder.save();

        // 2. Update product quantity
        await Product.updateOne({ name: product }, { qty: newQuantity });

        res.status(201).json({ order: newOrder, newProductQty: newQuantity });

    } catch (err) {
        res.status(400).json({ message: 'Error adding order.', error: err });
    }
});

// DELETE an Order (Includes Stock Reversion)
app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const orderToDelete = await Order.findById(id);

        if (!orderToDelete) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const product = await Product.findOne({ name: orderToDelete.product });

        if (!product) {
             return res.status(404).json({ message: 'Product related to order not found.' });
        }

        let newQuantity = product.qty;
        
        // Revert stock: If it was received, subtract; if it was sent/defective, add back.
        if (orderToDelete.type === 'received') {
            newQuantity -= orderToDelete.qty;
        } else if (orderToDelete.type === 'sent' || orderToDelete.type === 'defective') {
            newQuantity += orderToDelete.qty;
        }

        // 1. Delete the order
        await Order.findByIdAndDelete(id);

        // 2. Revert product quantity
        await Product.updateOne({ name: product.name }, { qty: newQuantity });

        res.status(200).json({ message: 'Order deleted and stock reverted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting order', error: err });
    }
});


// ------------------------------------------------------------------
// 4. SERVING THE FRONTEND (Fix for PathError)
// ------------------------------------------------------------------

// This correctly serves all static files (index.html, script.js, css)
app.use(express.static(path.join(__dirname, '..', 'public')));

// This handles any non-API route by redirecting to index.html (Simple Catch-All)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});