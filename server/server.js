// // server.js
// // Load environment variables (like your database URL) from .env file
// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');

// const app = express();

// // Middleware
// app.use(express.json()); 
// app.use(cors()); 

// // ------------------------------------------------------------------
// // 1. DATABASE CONNECTION
// // ------------------------------------------------------------------
// const mongoURI = process.env.MONGO_URI; 

// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB connection established successfully!'))
//     .catch(err => console.error('MongoDB connection error:', err));


// // ------------------------------------------------------------------
// // 2. DATA MODELS (Schemas)
// // ------------------------------------------------------------------
// const ProductSchema = new mongoose.Schema({
//     // MongoDB automatically adds the unique _id
//     name: { type: String, required: true, unique: true },
//     qty: { type: Number, required: true, default: 0 } // Default to 0 stock
// });

// const OrderSchema = new mongoose.Schema({
//     product: { type: String, required: true }, // The name of the product
//     type: { type: String, required: true, enum: ['received', 'sent', 'defective'] },
//     qty: { type: Number, required: true, min: 1 },
//     date: { type: String, required: true }
// });

// const Product = mongoose.model('Product', ProductSchema);
// const Order = mongoose.model('Order', OrderSchema);


// // ------------------------------------------------------------------
// // 3. API ROUTES
// // ------------------------------------------------------------------

// // --- PRODUCTS ROUTES ---

// // GET all Products
// app.get('/api/products', async (req, res) => {
//     try {
//         const products = await Product.find();
//         res.status(200).json(products);
//     } catch (err) {
//         res.status(500).json({ message: 'Error fetching products', error: err });
//     }
// });

// // POST (Add) a new Product
// app.post('/api/products', async (req, res) => {
//     try {
//         const { name, qty } = req.body;
//         const newProduct = new Product({ name, qty });
//         await newProduct.save();
//         res.status(201).json(newProduct);
//     } catch (err) {
//         // Handle case where product name already exists (unique: true)
//         if (err.code === 11000) { 
//              return res.status(409).json({ message: 'Product name already exists.' });
//         }
//         res.status(400).json({ message: 'Error adding product.', error: err });
//     }
// });

// // PUT/PATCH (Update) a Product
// app.patch('/api/products/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, qty } = req.body;
    
//     // Create an update object with only the fields provided in the request body
//     const updateFields = {};
//     if (name) updateFields.name = name;
//     if (qty !== undefined) updateFields.qty = Number(qty); 

//     if (Object.keys(updateFields).length === 0) {
//         return res.status(400).json({ message: 'No fields provided for update.' });
//     }

//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(
//             id, 
//             { $set: updateFields }, 
//             { new: true, runValidators: true } 
//         );

//         if (!updatedProduct) {
//             return res.status(404).json({ message: 'Product not found.' });
//         }

//         res.status(200).json(updatedProduct);

//     } catch (err) {
//         if (err.code === 11000) { 
//              return res.status(409).json({ message: 'Product name already exists.' });
//         }
//         res.status(500).json({ message: 'Error updating product.', error: err });
//     }
// });

// // DELETE a Product
// app.delete('/api/products/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const productToDelete = await Product.findById(id);

//         if (!productToDelete) {
//             return res.status(404).json({ message: 'Product not found.' });
//         }

//         // Optional: Warn about related orders (cannot strictly prevent deletion here)
//         const ordersCount = await Order.countDocuments({ product: productToDelete.name });
//         if (ordersCount > 0) {
//              console.warn(`Product ${productToDelete.name} deleted, but ${ordersCount} related orders exist.`);
//         }
        
//         await Product.findByIdAndDelete(id);
//         res.status(200).json({ message: 'Product deleted successfully' });
//     } catch (err) {
//         res.status(500).json({ message: 'Error deleting product', error: err });
//     }
// });


// // --- ORDERS ROUTES ---

// // GET all Orders
// app.get('/api/orders', async (req, res) => {
//     try {
//         // FIXED: Sort by date descending
//         const orders = await Order.find().sort({ date: -1 }); 
//         res.status(200).json(orders);
//     } catch (err) {
//         console.error("SERVER ERROR: Failed to fetch orders route:", err);
//         res.status(500).json({ message: 'Error fetching orders', error: err.message || err });
//     }
// });

// // POST (Add) a new Order (Includes Stock Update)
// app.post('/api/orders', async (req, res) => {
//     const { product, type, qty, date } = req.body;

//     try {
//         const prodToUpdate = await Product.findOne({ name: product });

//         if (!prodToUpdate) {
//              return res.status(404).json({ message: 'Product not found for stock update.' });
//         }

//         let newQuantity = prodToUpdate.qty;
//         if (type === 'received') {
//             newQuantity += qty;
//         } else if (type === 'sent' || type === 'defective') {
//             newQuantity -= qty;
//         }

//         if (newQuantity < 0) {
//             return res.status(400).json({ message: 'Cannot create order: Stock would become negative.' });
//         }

//         // 1. Create the order
//         const newOrder = new Order({ product, type, qty, date });
//         await newOrder.save();

//         // 2. Update product quantity
//         const finalProduct = await Product.updateOne({ name: product }, { qty: newQuantity });

//         res.status(201).json({ order: newOrder, newProductQty: newQuantity });

//     } catch (err) {
//         res.status(400).json({ message: 'Error adding order.', error: err });
//     }
// });

// // **NEW ROUTE**: PATCH (Update) an Order (Includes Stock Reversion & Re-application)
// app.patch('/api/orders/:id', async (req, res) => {
//     const { id } = req.params;
//     const { newQty, newDate } = req.body;

//     try {
//         const oldOrder = await Order.findById(id);
//         if (!oldOrder) {
//             return res.status(404).json({ message: 'Order not found.' });
//         }
        
//         // Product is the name of the product associated with the order
//         const product = await Product.findOne({ name: oldOrder.product }); 
//         if (!product) {
//             return res.status(404).json({ message: 'Product related to order not found.' });
//         }
        
//         let currentStock = product.qty;
        
//         // --- 1. REVERSE OLD STOCK CHANGE ---
//         // If old order was 'received', subtract old qty; if 'sent' or 'defective', add old qty.
//         const modifier = (oldOrder.type === 'received') ? -1 : 1;
//         currentStock += modifier * oldOrder.qty; 
        
//         // --- 2. APPLY NEW STOCK CHANGE ---
//         // If old order type was 'received', add new qty; if 'sent' or 'defective', subtract new qty.
//         const newModifier = (oldOrder.type === 'received') ? 1 : -1;
//         let newStock = currentStock + newModifier * newQty;
        
//         if (newStock < 0) {
//             return res.status(400).json({ message: `Cannot update order: Stock for ${product.name} would become negative (${newStock}).` });
//         }
        
//         // --- 3. UPDATE DATABASE ---

//         // Update the Product stock
//         await Product.updateOne({ name: product.name }, { qty: newStock });

//         // Update the Order document itself
//         const updatedOrder = await Order.findByIdAndUpdate(
//             id, 
//             { qty: newQty, date: newDate }, 
//             { new: true, runValidators: true }
//         );

//         res.status(200).json({ message: 'Order updated successfully', newProductQty: newStock, order: updatedOrder });

//     } catch (err) {
//         console.error("SERVER ERROR: Failed to patch orders route:", err);
//         res.status(500).json({ message: 'Error updating order.', error: err.message || err });
//     }
// });


// // DELETE an Order (Includes Stock Reversion)
// app.delete('/api/orders/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const orderToDelete = await Order.findById(id);

//         if (!orderToDelete) {
//             return res.status(404).json({ message: 'Order not found.' });
//         }

//         const product = await Product.findOne({ name: orderToDelete.product });

//         if (!product) {
//              return res.status(404).json({ message: 'Product related to order not found.' });
//         }

//         let newQuantity = product.qty;
        
//         // Revert stock: If it was received, subtract; if it was sent/defective, add back.
//         if (orderToDelete.type === 'received') {
//             newQuantity -= orderToDelete.qty;
//         } else if (orderToDelete.type === 'sent' || orderToDelete.type === 'defective') {
//             newQuantity += orderToDelete.qty;
//         }

//         // 1. Delete the order
//         await Order.findByIdAndDelete(id);

//         // 2. Revert product quantity
//         await Product.updateOne({ name: product.name }, { qty: newQuantity });

//         res.status(200).json({ message: 'Order deleted and stock reverted successfully' });
//     } catch (err) {
//         res.status(500).json({ message: 'Error deleting order', error: err });
//     }
// });


// // ------------------------------------------------------------------
// // 4. SERVING THE FRONTEND (Fix for PathError)
// // ------------------------------------------------------------------

// // This correctly serves all static files (index.html, script.js, css)
// app.use(express.static(path.join(__dirname, '..', 'public')));

// // This handles any non-API route by redirecting to index.html (Simple Catch-All)
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
// });


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });


















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
// app.delete('/api/products/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const productToDelete = await Product.findById(id);

//         if (!productToDelete) {
//             return res.status(404).json({ message: 'Product not found.' });
//         }

//         // Optional: Warn about related orders (cannot strictly prevent deletion here)
//         const ordersCount = await Order.countDocuments({ product: productToDelete.name });
//         if (ordersCount > 0) {
//              console.warn(`Product ${productToDelete.name} deleted, but ${ordersCount} related orders exist.`);
//         }
        
//         await Product.findByIdAndDelete(id);
//         res.status(200).json({ message: 'Product deleted successfully' });
//     } catch (err) {
//         res.status(500).json({ message: 'Error deleting product', error: err });
//     }
// });

// DELETE a Product
app.get('/api/products/:id/check-orders', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        
        const ordersCount = await Order.countDocuments({ product: product.name });
        res.status(200).json({ hasOrders: ordersCount > 0, count: ordersCount });
    } catch (err) {
        res.status(500).json({ message: 'Error checking orders', error: err });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const productToDelete = await Product.findById(id);
        if (!productToDelete) return res.status(404).json({ message: 'Product not found.' });

        // BLOCK deletion if orders exist
        const ordersCount = await Order.countDocuments({ product: productToDelete.name });
        if (ordersCount > 0) {
             return res.status(400).json({ 
                 message: `Cannot delete: There are ${ordersCount} orders linked to this product. Please delete the orders first.` 
             });
        }
        
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err });
    }
});

// --- ORDERS ROUTES ---

// GET all Orders
// app.get('/api/orders', async (req, res) => {
//     try {
//         // FIXED: Sort by date descending
//         const orders = await Order.find().sort({ date: -1 }); 
//         res.status(200).json(orders);
//     } catch (err) {
//         console.error("SERVER ERROR: Failed to fetch orders route:", err);
//         res.status(500).json({ message: 'Error fetching orders', error: err.message || err });
//     }
// });
app.get('/api/orders', async (req, res) => {
    try {
        // .limit(200) ensures the server only sends the 200 most recent items.
        // This makes the internet transfer much faster.
        const orders = await Order.find().sort({ date: -1 }).limit(200); 
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
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
        const finalProduct = await Product.updateOne({ name: product }, { qty: newQuantity });

        res.status(201).json({ order: newOrder, newProductQty: newQuantity });

    } catch (err) {
        res.status(400).json({ message: 'Error adding order.', error: err });
    }
});

// PATCH (Update) an Order (Includes Stock Reversion & Re-application)
app.patch('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { newQty, newDate } = req.body;

    try {
        const oldOrder = await Order.findById(id);
        if (!oldOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        // Product is the name of the product associated with the order
        const product = await Product.findOne({ name: oldOrder.product }); 
        if (!product) {
            return res.status(404).json({ message: 'Product related to order not found.' });
        }
        
        let currentStock = product.qty;
        
        // --- 1. REVERSE OLD STOCK CHANGE ---
        // If old order was 'received', subtract old qty; if 'sent' or 'defective', add old qty.
        const modifier = (oldOrder.type === 'received') ? -1 : 1;
        currentStock += modifier * oldOrder.qty; 
        
        // --- 2. APPLY NEW STOCK CHANGE ---
        // If old order type was 'received', add new qty; if 'sent' or 'defective', subtract new qty.
        const newModifier = (oldOrder.type === 'received') ? 1 : -1;
        let newStock = currentStock + newModifier * newQty;
        
        if (newStock < 0) {
            return res.status(400).json({ message: `Cannot update order: Stock for ${product.name} would become negative (${newStock}).` });
        }
        
        // --- 3. UPDATE DATABASE ---

        // Update the Product stock
        await Product.updateOne({ name: product.name }, { qty: newStock });

        // Update the Order document itself
        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { qty: newQty, date: newDate }, 
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Order updated successfully', newProductQty: newStock, order: updatedOrder });

    } catch (err) {
        console.error("SERVER ERROR: Failed to patch orders route:", err);
        res.status(500).json({ message: 'Error updating order.', error: err.message || err });
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
// 4. SERVING THE FRONTEND (For Local Testing/Vercel Routing)
// ------------------------------------------------------------------

// This correctly serves all static files (index.html, script.js, css)
app.use(express.static(path.join(__dirname, '..', 'public')));

// This handles any non-API route by redirecting to index.html (Simple Catch-All)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


// ------------------------------------------------------------------
// 5. VERCEL DEPLOYMENT CONFIGURATION
// ------------------------------------------------------------------
// IMPORTANT: For Vercel, we export the app instead of calling app.listen().
module.exports = app;

// For local development, you can uncomment the listener below if preferred, 
// but Vercel requires the module.exports line above.
/*
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
*/