class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    async init() {
        await this.loadCart();
        this.setupEventListeners();
    }

    async loadCart() {
        try {
            const response = await authFetch('/cart');
            const data = await response.json();
            
            if (data.success) {
                this.cart = data.cart.items || [];
                this.updateCartDisplay();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            // Fallback to local storage for guests
            this.loadGuestCart();
        }
    }

    loadGuestCart() {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
            this.cart = JSON.parse(guestCart);
            this.updateCartDisplay();
        }
    }

    setupEventListeners() {
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.proceedToCheckout());
        document.getElementById('clearCartBtn')?.addEventListener('click', () => this.clearCart());
    }

    updateCartDisplay() {
        this.updateCartItems();
        this.updateCartSummary();
        this.updateHeaderCartCount();
    }

    updateCartItems() {
        const container = document.getElementById('cartItemsList');
        const emptyMessage = document.getElementById('emptyCartMessage');

        if (this.cart.length === 0) {
            container.innerHTML = '';
            emptyMessage.style.display = 'block';
            return;
        }

        emptyMessage.style.display = 'none';
        
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.product._id}">
                <img src="${item.product.images[0] || '../images/placeholder.jpg'}" 
                     alt="${item.product.name}" class="item-image">
                
                <div class="item-details">
                    <h4>${item.product.name}</h4>
                    <p class="item-category">${item.product.category}</p>
                    <p class="item-brand">${item.product.brand}</p>
                </div>
                
                <div class="item-quantity">
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.product._id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.product._id}', ${item.quantity + 1})">+</button>
                </div>
                
                <div class="item-price">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <button class="remove-btn" onclick="cartManager.removeItem('${item.product._id}')">
                    ×
                </button>
            </div>
        `).join('');
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 9.99 : 0;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('summaryShipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;

        document.getElementById('checkoutBtn').disabled = this.cart.length === 0;
    }

    updateHeaderCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }

    async updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(productId);
            return;
        }

        try {
            const response = await authFetch('/cart/update', {
                method: 'PUT',
                body: JSON.stringify({ productId, quantity: newQuantity })
            });

            const data = await response.json();
            
            if (data.success) {
                await this.loadCart();
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    async removeItem(productId) {
        try {
            const response = await authFetch('/cart/remove', {
                method: 'DELETE',
                body: JSON.stringify({ productId })
            });

            const data = await response.json();
            
            if (data.success) {
                await this.loadCart();
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    async clearCart() {
        if (!confirm('Are you sure you want to clear your cart?')) return;

        try {
            const response = await authFetch('/cart/clear', {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                this.cart = [];
                this.updateCartDisplay();
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }

    proceedToCheckout() {
        const token = localStorage.getItem('token');
        if (token) {
            window.location.href = 'checkout.html';
        } else {
            // Redirect to login with return URL
            window.location.href = `login.html?redirect=checkout.html`;
        }
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Global function to add item to cart
async function addToCart(productId, quantity = 1) {
    try {
        const response = await authFetch('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json();
        
        if (data.success) {
            await cartManager.loadCart();
            alert('Item added to cart!');
        } else {
            alert('Error adding item to cart: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding item to cart');
    }
}