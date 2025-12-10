// // The data is now held in these local arrays *after* being fetched from the server.
// let products = [];
// let orders = []; 

// const BASE_URL = ''; // Use an empty string for relative paths (e.g., /api/products)

// // ------------------------------------------------------------------
// // HELPER: FETCH AND RENDER ALL DATA
// // ------------------------------------------------------------------
// async function fetchAndRenderAllData() {
//     try {
//         const productsResponse = await fetch(`${BASE_URL}/api/products`);
//         // Check if the response is actually OK before trying to parse JSON
//         if (!productsResponse.ok) {
//             console.error("API Error during product fetch:", productsResponse.status, productsResponse.statusText);
//             throw new Error(`Server returned status ${productsResponse.status}`);
//         }
//         products = await productsResponse.json(); 

//         const ordersResponse = await fetch(`${BASE_URL}/api/orders`);
//         if (!ordersResponse.ok) {
//             console.error("API Error during order fetch:", ordersResponse.status, ordersResponse.statusText);
//             throw new Error(`Server returned status ${ordersResponse.status}`);
//         }
//         orders = await ordersResponse.json(); 

//         renderProducts();
//         renderOrders();
        
//     } catch (error) {
//         console.error("Failed to fetch initial data:", error);
//         // You can add an alert here if you want to notify the user of the connection failure
//     }
// }


// // ------------------------------------------------------------------
// // HELPER: RENDER TABLES (UPDATED TO USE p._id)
// // ------------------------------------------------------------------
// function renderProducts() {
//     const tbody = document.querySelector("#prodTable tbody");
//     tbody.innerHTML = "";

//     products.forEach((p) => {
//         let tr = `<tr>
//             <td>${p.name}</td>
//             <td>${p.qty}</td>
//             <td>
//                 <button class="edit" onclick="editProduct('${p._id}', '${p.name}', ${p.qty})">Edit</button>
//                 <button class="delete" onclick="deleteProduct('${p._id}')">Delete</button>
//             </td>
//         </tr>`;
//         tbody.innerHTML += tr;
//     });

//     refreshProductDropdown();
// }

// function renderOrders() {
//     const tbody = document.querySelector("#orderTable tbody");
//     tbody.innerHTML = "";

//     orders.forEach((o) => {
//         let tr = `<tr>
//             <td>${o.product}</td>
//             <td>${o.type}</td>
//             <td>${o.qty}</td>
//             <td>${o.date}</td>
//             <td>
//                 <button class="edit" onclick="editOrder('${o._id}', ${o.qty}, '${o.date}')">Edit</button>
//                 <button class="delete" onclick="deleteOrder('${o._id}')">Delete</button>
//             </td>
//         </tr>`;
//         tbody.innerHTML += tr;
//     });
// }


// // ------------------------------------------------------------------
// // PRODUCT FUNCTIONS (UPDATED FOR API)
// // ------------------------------------------------------------------
// async function addProduct() {
//     const nameInput = document.getElementById("pname");
//     const qtyInput = document.getElementById("pqty");
    
//     const name = nameInput.value.trim();
//     const qty = Number(qtyInput.value);

//     if (!name || qty < 0) {
//         alert("Enter valid Product Name and Quantity.");
//         return;
//     }

//     try {
//         const response = await fetch(`${BASE_URL}/api/products`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name, qty })
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             alert(`Failed to add product: ${data.message}`);
//             return;
//         }

//         nameInput.value = "";
//         qtyInput.value = "";
//         await fetchAndRenderAllData(); 

//     } catch (error) {
//         console.error("Error adding product:", error);
//         alert("An error occurred while communicating with the server.");
//     }
// }

// async function editProduct(id, currentName, currentQty) {
//     const newName = prompt("Enter new product name:", currentName);
//     const newQtyStr = prompt("Enter new quantity:", currentQty); 

//     if (newName === null || newQtyStr === null || newName.trim() === "") return;

//     const newQty = Number(newQtyStr);

//     if (isNaN(newQty) || newQty < 0) {
//         alert("Invalid quantity entered.");
//         return;
//     }

//     try {
//         const response = await fetch(`${BASE_URL}/api/products/${id}`, { 
//             method: 'PATCH', 
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ name: newName, qty: newQty }) 
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             alert(`Failed to update product: ${data.message}`);
//             return;
//         }

//         await fetchAndRenderAllData();
//         alert(`Product ${newName} updated successfully!`);
//     } catch (error) {
//         console.error("Error editing product:", error);
//         alert("An error occurred while communicating with the server.");
//     }
// }


// async function deleteProduct(id) {
//     if (!confirm("Delete this product?")) return;

//     try {
//         const response = await fetch(`${BASE_URL}/api/products/${id}`, {
//             method: 'DELETE',
//         });

//         if (!response.ok) {
//             const data = await response.json();
//             alert(`Failed to delete product: ${data.message}`);
//             return;
//         }

//         await fetchAndRenderAllData();
//     } catch (error) {
//         console.error("Error deleting product:", error);
//         alert("An error occurred while communicating with the server.");
//     }
// }

// // ------------------------------------------------------------------
// // ORDERS FUNCTIONS (UPDATED FOR API)
// // ------------------------------------------------------------------
// function refreshProductDropdown() {
//     const dropdown = document.getElementById("oproduct");
//     dropdown.innerHTML = "";
//     products.forEach(p => {
//         dropdown.innerHTML += `<option value="${p.name}">${p.name}</option>`;
//     });
// }

// async function addOrder() {
//     const product = document.getElementById("oproduct").value;
//     const type = document.getElementById("otype").value;
//     const qtyInput = document.getElementById("oqty");
//     const dateInput = document.getElementById("odate");
    
//     const qty = Number(qtyInput.value);
//     const date = dateInput.value;

//     if (!qty || !date) {
//         alert("Enter valid Quantity and Date.");
//         return;
//     }

//     try {
//         const response = await fetch(`${BASE_URL}/api/orders`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ product, type, qty, date })
//         });

//         const data = await response.json();

//         if (!response.ok) {
//              alert(`Failed to add order: ${data.message}`);
//              return;
//         }
        
//         qtyInput.value = "";
//         dateInput.value = "";
//         await fetchAndRenderAllData();

//     } catch (error) {
//         console.error("Error adding order:", error);
//         alert("An error occurred while communicating with the server.");
//     }
// }

// function editOrder(id, currentQty, currentDate) {
//      alert("Edit Order is disabled. To implement this, we need a complex backend PATCH route that handles reverting the old stock and applying the new stock.");
// }

// async function deleteOrder(id) {
//     if (!confirm("Delete this order? This will revert the stock change.")) return;
    
//     try {
//         const response = await fetch(`${BASE_URL}/api/orders/${id}`, {
//             method: 'DELETE',
//         });

//         if (!response.ok) {
//             const data = await response.json();
//             alert(`Failed to delete order: ${data.message}`);
//             return;
//         }

//         await fetchAndRenderAllData();
//     } catch (error) {
//         console.error("Error deleting order:", error);
//         alert("An error occurred while communicating with the server.");
//     }
// }

// // ------------------------------------------------------------------
// // EXPORT FEATURES
// // ------------------------------------------------------------------
// function exportCSV(filename, rows) {
//     let csv = rows.map(row => row.join(",")).join("\n");
//     let blob = new Blob([csv], { type: "text/csv" });

//     let a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = filename;
//     a.click();
// }

// function exportProducts() {
//     let rows = [["Product", "Quantity"]];
//     products.forEach(p => rows.push([p.name, p.qty]));
//     exportCSV("products.csv", rows);
// }

// function exportOrders() {
//     let rows = [["Product", "Type", "Quantity", "Date"]];
//     orders.forEach(o => rows.push([o.product, o.type, o.qty, o.date]));
//     exportCSV("orders.csv", rows);
// }

// // Call this once the script loads
// fetchAndRenderAllData();





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

// We add a check here to ensure we only try to connect if the URI is present
if (mongoURI) {
    mongoose.connect(mongoURI)
        .then(() => console.log('MongoDB connection established successfully!'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.error('MONGO_URI is missing or empty. Database connection skipped.');
}


// ------------------------------------------------------------------
// 2. DATA MODELS (Schemas)
// ------------------------------------------------------------------
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    qty: { type: Number, required: true, default: 0 } 
});

const OrderSchema = new mongoose.Schema({
    product: { type: String, required: true }, 
    type: { type: String, required: true, enum: ['received', 'sent', 'defective'] },
    qty: { type: Number, required: true, min: 1 },
    date: { type: String, required: true }
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);


// ------------------------------------------------------------------
// 3. API ROUTES (No changes needed in logic)
// ------------------------------------------------------------------

// --- PRODUCTS ROUTES ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, qty } = req.body;
        const newProduct = new Product({ name, qty });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        if (err.code === 11000) { 
             return res.status(409).json({ message: 'Product name already exists.' });
        }
        res.status(400).json({ message: 'Error adding product.', error: err });
    }
});

app.patch('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, qty } = req.body;
    
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

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const productToDelete = await Product.findById(id);

        if (!productToDelete) {
            return res.status(404).json({ message: 'Product not found.' });
        }

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

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: '-1' }); 
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err });
    }
});

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

        const newOrder = new Order({ product, type, qty, date });
        await newOrder.save();

        await Product.updateOne({ name: product }, { qty: newQuantity });

        res.status(201).json({ order: newOrder, newProductQty: newQuantity });

    } catch (err) {
        res.status(400).json({ message: 'Error adding order.', error: err });
    }
});

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
        
        if (orderToDelete.type === 'received') {
            newQuantity -= orderToDelete.qty;
        } else if (orderToDelete.type === 'sent' || orderToDelete.type === 'defective') {
            newQuantity += orderToDelete.qty;
        }

        await Order.findByIdAndDelete(id);
        await Product.updateOne({ name: product.name }, { qty: newQuantity });

        res.status(200).json({ message: 'Order deleted and stock reverted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting order', error: err });
    }
});


// ------------------------------------------------------------------
// 4. SERVING THE FRONTEND (Fix for Vercel/PathError)
// ------------------------------------------------------------------

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


// Vercel's required export (runs the app as a serverless function)
module.exports = app;

// Local execution check (for running locally only)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}