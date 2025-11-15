// Admin authentication check
async function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
        window.location.href = '../../pages/login.html';
        return;
    }
    
    document.getElementById('adminWelcome').textContent = `Welcome, ${user.fullName}!`;
}

// Admin API calls
async function adminFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    
    if (response.status === 403) {
        alert('Admin access required');
        window.location.href = '../../pages/index.html';
        return;
    }
    
    return response;
}

// Dashboard data loading
async function loadDashboardData() {
    try {
        const [statsResponse, ordersResponse, inventoryResponse] = await Promise.all([
            adminFetch('/admin/stats'),
            adminFetch('/admin/orders/recent'),
            adminFetch('/admin/inventory/low-stock')
        ]);

        const stats = await statsResponse.json();
        const orders = await ordersResponse.json();
        const inventory = await inventoryResponse.json();

        if (stats.success) updateDashboardStats(stats.data);
        if (orders.success) updateRecentOrders(orders.orders);
        if (inventory.success) updateLowStock(inventory.products);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateDashboardStats(stats) {
    document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue}`;
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    
    document.getElementById('revenueChange').textContent = `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% from last month`;
    document.getElementById('ordersChange').textContent = `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange}% from last month`;
    document.getElementById('productsChange').textContent = `+${stats.newProducts} new this month`;
    document.getElementById('usersChange').textContent = `+${stats.newUsers} new this month`;
}

function updateRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    
    container.innerHTML = orders.map(order => `
        <div class="order-row">
            <div class="order-id">#${order._id.slice(-8)}</div>
            <div class="order-customer">${order.user?.fullName || 'Guest'}</div>
            <div class="order-amount">$${order.totalAmount}</div>
            <div class="order-status ${order.status}">${order.status}</div>
            <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
            <div class="order-actions">
                <button class="btn btn-small" onclick="viewOrder('${order._id}')">View</button>
            </div>
        </div>
    `).join('');
}

function updateLowStock(products) {
    const container = document.getElementById('lowStockItems');
    
    container.innerHTML = products.map(product => `
        <div class="stock-alert">
            <div class="product-info">
                <strong>${product.name}</strong>
                <span>Stock: ${product.stock}</span>
            </div>
            <button class="btn btn-small" onclick="restockProduct('${product._id}')">
                Restock
            </button>
        </div>
    `).join('');
}

// Product management
async function addProduct(productData) {
    try {
        const response = await adminFetch('/admin/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Product added successfully!');
            return data.product;
        } else {
            alert('Error adding product: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product');
    }
}

async function updateProduct(productId, updateData) {
    try {
        const response = await adminFetch(`/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Product updated successfully!');
            return data.product;
        } else {
            alert('Error updating product: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product');
    }
}