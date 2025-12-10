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
//         products = await productsResponse.json(); 

//         const ordersResponse = await fetch(`${BASE_URL}/api/orders`);
//         orders = await ordersResponse.json(); 

//         renderProducts();
//         renderOrders();
        
//     } catch (error) {
//         console.error("Failed to fetch initial data:", error);
//         // alert("Could not connect to the server/database. Check the server console.");
//     }
// }


// // ------------------------------------------------------------------
// // HELPER: RENDER TABLES (UPDATED TO USE p._id)
// // ------------------------------------------------------------------
// function renderProducts() {
//     const tbody = document.querySelector("#prodTable tbody");
//     tbody.innerHTML = "";

//     products.forEach((p) => {
//         // Use p._id (MongoDB's unique ID) for actions
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
//         // Use o._id (MongoDB's unique ID) for actions
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

// // EDIT function is fully implemented
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












// The data is now held in these local arrays *after* being fetched from the server.
let products = [];
let orders = []; 

// *** CRUCIAL CHANGE: UPDATE THIS AFTER BACKEND DEPLOYMENT ***
// Example: const API_DOMAIN = 'https://inventory-backend-xyz.vercel.app';
const API_DOMAIN = ''; 

// BASE_URL is the full domain (e.g., https://api-domain.vercel.app)
const BASE_URL = `${API_DOMAIN}`; 

// ------------------------------------------------------------------
// HELPER: FETCH AND RENDER ALL DATA
// ------------------------------------------------------------------
async function fetchAndRenderAllData() {
    try {
        // CORRECT PATH: BASE_URL + /api/products
        const productsResponse = await fetch(`${BASE_URL}/api/products`); 
        products = await productsResponse.json(); 

        // CORRECT PATH: BASE_URL + /api/orders
        const ordersResponse = await fetch(`${BASE_URL}/api/orders`);
        orders = await ordersResponse.json(); 

        renderProducts();
        renderOrders();
        
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        // alert("Could not connect to the server/database. Check the server console.");
    }
}


// ------------------------------------------------------------------
// HELPER: RENDER TABLES (UPDATED TO USE p._id)
// ------------------------------------------------------------------
function renderProducts() {
    const tbody = document.querySelector("#prodTable tbody");
    tbody.innerHTML = "";

    products.forEach((p) => {
        // Use p._id (MongoDB's unique ID) for actions
        let tr = `<tr>
            <td>${p.name}</td>
            <td>${p.qty}</td>
            <td>
                <button class="edit" onclick="editProduct('${p._id}', '${p.name}', ${p.qty})">Edit</button>
                <button class="delete" onclick="deleteProduct('${p._id}')">Delete</button>
            </td>
        </tr>`;
        tbody.innerHTML += tr;
    });

    refreshProductDropdown();
}

function renderOrders() {
    const tbody = document.querySelector("#orderTable tbody");
    tbody.innerHTML = "";

    orders.forEach((o) => {
        // Use o._id (MongoDB's unique ID) for actions
        let tr = `<tr>
            <td>${o.product}</td>
            <td>${o.type}</td>
            <td>${o.qty}</td>
            <td>${o.date}</td>
            <td>
                <button class="edit" onclick="editOrder('${o._id}', ${o.qty}, '${o.date}')">Edit</button>
                <button class="delete" onclick="deleteOrder('${o._id}')">Delete</button>
            </td>
        </tr>`;
        tbody.innerHTML += tr;
    });
}


// ------------------------------------------------------------------
// PRODUCT FUNCTIONS (UPDATED FOR API)
// ------------------------------------------------------------------
async function addProduct() {
    const nameInput = document.getElementById("pname");
    const qtyInput = document.getElementById("pqty");
    
    const name = nameInput.value.trim();
    const qty = Number(qtyInput.value);

    if (!name || qty < 0) {
        alert("Enter valid Product Name and Quantity.");
        return;
    }

    try {
        // CORRECT PATH: BASE_URL + /api/products
        const response = await fetch(`${BASE_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, qty })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Failed to add product: ${data.message}`);
            return;
        }

        nameInput.value = "";
        qtyInput.value = "";
        await fetchAndRenderAllData(); 

    } catch (error) {
        console.error("Error adding product:", error);
        alert("An error occurred while communicating with the server.");
    }
}

// EDIT function is fully implemented
async function editProduct(id, currentName, currentQty) {
    const newName = prompt("Enter new product name:", currentName);
    const newQtyStr = prompt("Enter new quantity:", currentQty); 

    if (newName === null || newQtyStr === null || newName.trim() === "") return;

    const newQty = Number(newQtyStr);

    if (isNaN(newQty) || newQty < 0) {
        alert("Invalid quantity entered.");
        return;
    }

    try {
        // CORRECT PATH: BASE_URL + /api/products/:id
        const response = await fetch(`${BASE_URL}/api/products/${id}`, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, qty: newQty }) 
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Failed to update product: ${data.message}`);
            return;
        }

        await fetchAndRenderAllData();
        alert(`Product ${newName} updated successfully!`);
    } catch (error) {
        console.error("Error editing product:", error);
        alert("An error occurred while communicating with the server.");
    }
}


async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    try {
        // CORRECT PATH: BASE_URL + /api/products/:id
        const response = await fetch(`${BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const data = await response.json();
            alert(`Failed to delete product: ${data.message}`);
            return;
        }

        await fetchAndRenderAllData();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("An error occurred while communicating with the server.");
    }
}

// ------------------------------------------------------------------
// ORDERS FUNCTIONS (UPDATED FOR API)
// ------------------------------------------------------------------
function refreshProductDropdown() {
    const dropdown = document.getElementById("oproduct");
    dropdown.innerHTML = "";
    products.forEach(p => {
        dropdown.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    });
}

async function addOrder() {
    const product = document.getElementById("oproduct").value;
    const type = document.getElementById("otype").value;
    const qtyInput = document.getElementById("oqty");
    const dateInput = document.getElementById("odate");
    
    const qty = Number(qtyInput.value);
    const date = dateInput.value;

    if (!qty || !date) {
        alert("Enter valid Quantity and Date.");
        return;
    }

    try {
        // CORRECT PATH: BASE_URL + /api/orders
        const response = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product, type, qty, date })
        });

        const data = await response.json();

        if (!response.ok) {
             alert(`Failed to add order: ${data.message}`);
             return;
        }
        
        qtyInput.value = "";
        dateInput.value = "";
        await fetchAndRenderAllData();

    } catch (error) {
        console.error("Error adding order:", error);
        alert("An error occurred while communicating with the server.");
    }
}

function editOrder(id, currentQty, currentDate) {
     alert("Edit Order is disabled. To implement this, we need a complex backend PATCH route that handles reverting the old stock and applying the new stock.");
}

async function deleteOrder(id) {
    if (!confirm("Delete this order? This will revert the stock change.")) return;
    
    try {
        // CORRECT PATH: BASE_URL + /api/orders/:id
        const response = await fetch(`${BASE_URL}/api/orders/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const data = await response.json();
            alert(`Failed to delete order: ${data.message}`);
            return;
        }

        await fetchAndRenderAllData();
    } catch (error) {
        console.error("Error deleting order:", error);
        alert("An error occurred while communicating with the server.");
    }
}

// ------------------------------------------------------------------
// EXPORT FEATURES
// ------------------------------------------------------------------
function exportCSV(filename, rows) {
    let csv = rows.map(row => row.join(",")).join("\n");
    let blob = new Blob([csv], { type: "text/csv" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function exportProducts() {
    let rows = [["Product", "Quantity"]];
    products.forEach(p => rows.push([p.name, p.qty]));
    exportCSV("products.csv", rows);
}

function exportOrders() {
    let rows = [["Product", "Type", "Quantity", "Date"]];
    orders.forEach(o => rows.push([o.product, o.type, o.qty, o.date]));
    exportCSV("orders.csv", rows);
}

// Call this once the script loads
fetchAndRenderAllData();