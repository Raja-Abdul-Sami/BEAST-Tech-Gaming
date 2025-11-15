class ProductsPage {
    constructor() {
        this.products = this.getDemoProducts();
        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.filters = {
            category: '',
            brand: '',
            price: '',
            sort: 'featured',
            search: ''
        };
        this.currentView = 'grid';
        
        // Show products immediately in constructor
        this.displayProducts();
        this.setupEventListeners();
        this.setupViewSwitching();
    }

    setupViewSwitching() {
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                viewBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Set current view
                this.currentView = e.target.dataset.view;
                // Re-display products with new view
                this.displayProducts();
            });
        });
    }

    displayProducts() {
        const grid = document.getElementById('productsGrid');
        const noResults = document.getElementById('noResults');
        const pagination = document.getElementById('pagination');
        const productsCount = document.getElementById('productsCount');

        if (this.filteredProducts.length === 0) {
            grid.style.display = 'none';
            noResults.style.display = 'block';
            pagination.style.display = 'none';
            productsCount.textContent = 'No products found';
            return;
        }

        noResults.style.display = 'none';
        grid.style.display = 'grid';
        pagination.style.display = 'flex';

        // Calculate pagination
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        // Set the correct view class
        grid.className = `products-grid view-${this.currentView}`;
        
        // Display products
        grid.innerHTML = pageProducts.map(product => this.createProductCard(product)).join('');

        // Update counts and pagination
        productsCount.textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, this.filteredProducts.length)} of ${this.filteredProducts.length} products`;
        this.updatePagination(totalPages);
    }

    createProductCard(product) {
        const isNew = this.isProductNew(product);
        const isTrending = this.isProductTrending(product);
        const stockStatus = this.getStockStatus(product.stock);

        // Use grid view by default
        return `
            <div class="product-card fade-in-up" data-product-id="${product._id}">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop'">
                    <div class="product-badges">
                        ${isNew ? '<span class="badge new">🆕 NEW</span>' : ''}
                        ${isTrending ? '<span class="badge trending">🔥 TRENDING</span>' : ''}
                        ${stockStatus.badge}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn quick-view" onclick="quickView('${product._id}')" title="Quick View">
                            👁️
                        </button>
                        <button class="action-btn wishlist" onclick="addToWishlist('${product._id}')" title="Add to Wishlist">
                            ❤️
                        </button>
                        <button class="action-btn compare" onclick="addToCompare('${product._id}')" title="Compare">
                            ⚖️
                        </button>
                    </div>
                </div>
                
                <div class="product-info">
                    <span class="product-category">${this.formatCategory(product.category)}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-brand">${product.brand.toUpperCase()}</span>
                    
                    <div class="product-specs">
                        ${this.getSpecsPreview(product)}
                    </div>
                    
                    <div class="product-price">$${product.price}</div>
                    
                    <div class="product-rating">
                        <div class="stars">★★★★★</div>
                        <span class="rating-count">(0)</span>
                    </div>
                </div>
                
                <div class="product-footer">
                    <button class="btn btn-primary btn-full" onclick="addToCart('${product._id}', 1)">
                        🛒 Add to Cart
                    </button>
                    <button class="btn btn-outline btn-full" onclick="window.location.href='product-detail.html?id=${product._id}'">
                        📖 Details
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('brandFilter').addEventListener('change', (e) => {
            this.filters.brand = e.target.value;
            this.applyFilters();
        });

        document.getElementById('priceFilter').addEventListener('change', (e) => {
            this.filters.price = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.applyFilters();
        });

        // Search
        document.getElementById('productSearch').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });

        // Quick search on enter
        document.getElementById('productSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        });
    }

    applyFilters() {
        let filtered = [...this.products];

        // Category filter
        if (this.filters.category) {
            filtered = filtered.filter(product => product.category === this.filters.category);
        }

        // Brand filter
        if (this.filters.brand) {
            filtered = filtered.filter(product => product.brand === this.filters.brand);
        }

        // Price filter
        if (this.filters.price) {
            const [min, max] = this.filters.price.split('-').map(Number);
            filtered = filtered.filter(product => {
                if (max === 9999) return product.price >= min;
                return product.price >= min && product.price <= max;
            });
        }

        // Search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        }

        // Sort products
        filtered = this.sortProducts(filtered, this.filters.sort);

        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.displayProducts();
        this.updateActiveFilters();
    }

    sortProducts(products, sortBy) {
        switch (sortBy) {
            case 'price_asc':
                return products.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return products.sort((a, b) => b.price - a.price);
            case 'name_asc':
                return products.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return products.sort((a, b) => b.name.localeCompare(a.name));
            case 'newest':
                return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            default:
                return products; // featured
        }
    }

    getDemoProducts() {
        return [
            {
                _id: 'cpu_amd_ryzen9',
                name: 'AMD Ryzen 9 7950X',
                category: 'cpu',
                brand: 'amd',
                price: 699,
                stock: 15,
                images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop'],
                specifications: {
                    cores: '16',
                    speed: '4.5GHz',
                    socket: 'AM5'
                },
                description: 'The ultimate processor for gaming and content creation.',
                createdAt: new Date().toISOString()
            },
            {
                _id: 'cpu_intel_i9',
                name: 'Intel Core i9-14900K',
                category: 'cpu',
                brand: 'intel',
                price: 589,
                stock: 8,
                images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop'],
                specifications: {
                    cores: '24',
                    speed: '3.2GHz',
                    socket: 'LGA1700'
                },
                description: '24 cores for extreme gaming performance.',
                createdAt: new Date().toISOString()
            },
            {
                _id: 'gpu_rtx4090',
                name: 'NVIDIA GeForce RTX 4090',
                category: 'gpu',
                brand: 'nvidia',
                price: 1599,
                stock: 3,
                images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop'],
                specifications: {
                    memory: '24',
                    interface: 'PCIe 4.0'
                },
                description: 'The ultimate gaming GPU with 24GB GDDR6X.',
                createdAt: new Date().toISOString()
            },
            {
                _id: 'gpu_rx7900',
                name: 'AMD Radeon RX 7900 XTX',
                category: 'gpu',
                brand: 'amd',
                price: 999,
                stock: 12,
                images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop'],
                specifications: {
                    memory: '24',
                    interface: 'PCIe 4.0'
                },
                description: 'High-performance gaming GPU.',
                createdAt: new Date().toISOString()
            },
            {
                _id: 'motherboard_x670',
                name: 'ASUS ROG Crosshair X670E',
                category: 'motherboard',
                brand: 'asus',
                price: 499,
                stock: 10,
                images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop'],
                specifications: {
                    socket: 'AM5',
                    memoryType: 'DDR5'
                },
                description: 'Premium motherboard for AMD Ryzen.',
                createdAt: new Date().toISOString()
            },
            {
                _id: 'ram_ddr5_32',
                name: 'Corsair Dominator Platinum RGB 32GB',
                category: 'ram',
                brand: 'corsair',
                price: 189,
                stock: 25,
                images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300&h=300&fit=crop'],
                specifications: {
                    capacity: '32GB',
                    speed: '6000MHz'
                },
                description: 'Premium DDR5 memory with RGB.',
                createdAt: new Date().toISOString()
            }
        ];
    }

    isProductNew(product) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(product.createdAt) > oneWeekAgo;
    }

    isProductTrending(product) {
        return Math.random() > 0.7;
    }

    getStockStatus(stock) {
        if (stock === 0) return { badge: '<span class="badge out-of-stock">❌ OUT OF STOCK</span>', status: 'out' };
        if (stock < 5) return { badge: '<span class="badge low-stock">🚨 LOW STOCK</span>', status: 'low' };
        if (stock < 15) return { badge: '<span class="badge warning">⚠️ LIMITED</span>', status: 'warning' };
        return { badge: '<span class="badge in-stock">✅ IN STOCK</span>', status: 'in' };
    }

    formatCategory(category) {
        const categories = {
            cpu: 'Processor',
            gpu: 'Graphics Card',
            motherboard: 'Motherboard',
            ram: 'Memory',
            storage: 'Storage',
            psu: 'Power Supply',
            case: 'Case',
            cooling: 'Cooling'
        };
        return categories[category] || category;
    }

    getSpecsPreview(product) {
        const specs = product.specifications || {};
        switch(product.category) {
            case 'cpu':
                return `${specs.cores || 'N/A'} Cores • ${specs.speed || 'N/A'} GHz`;
            case 'gpu':
                return `${specs.memory || 'N/A'} GB • ${specs.interface || 'N/A'}`;
            case 'ram':
                return `${specs.capacity || 'N/A'} • ${specs.speed || 'N/A'} MHz`;
            default:
                return product.description?.substring(0, 60) + '...' || 'High-performance component';
        }
    }

    updatePagination(totalPages) {
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        let html = '';
        
        // Previous button
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="productsPage.goToPage(${this.currentPage - 1})">‹ Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                html += `<span class="page-current">${i}</span>`;
            } else {
                html += `<button class="page-btn" onclick="productsPage.goToPage(${i})">${i}</button>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            html += `<button class="page-btn" onclick="productsPage.goToPage(${this.currentPage + 1})">Next ›</button>`;
        }

        pagination.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.displayProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateActiveFilters() {
        const activeFilters = document.getElementById('activeFilters');
        const active = [];

        if (this.filters.category) {
            active.push({
                type: 'category',
                value: this.filters.category,
                text: this.formatCategory(this.filters.category)
            });
        }

        if (this.filters.brand) {
            active.push({
                type: 'brand',
                value: this.filters.brand,
                text: this.filters.brand.toUpperCase()
            });
        }

        if (this.filters.search) {
            active.push({
                type: 'search',
                value: this.filters.search,
                text: `Search: "${this.filters.search}"`
            });
        }

        if (active.length === 0) {
            activeFilters.innerHTML = '';
            return;
        }

        activeFilters.innerHTML = `
            <strong>Active Filters:</strong>
            ${active.map(filter => `
                <span class="active-filter">
                    ${filter.text}
                    <button onclick="productsPage.removeFilter('${filter.type}')">×</button>
                </span>
            `).join('')}
            <button class="clear-all" onclick="productsPage.clearAllFilters()">Clear All</button>
        `;
    }

    removeFilter(type) {
        this.filters[type] = '';
        document.getElementById(`${type}Filter`).value = '';
        this.applyFilters();
    }

    clearAllFilters() {
        this.filters = {
            category: '',
            brand: '',
            price: '',
            sort: 'featured',
            search: ''
        };
        
        document.getElementById('categoryFilter').value = '';
        document.getElementById('brandFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('sortFilter').value = 'featured';
        document.getElementById('productSearch').value = '';
        
        this.applyFilters();
    }
}

// Global functions
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value;
    window.productsPage.filters.search = searchTerm;
    window.productsPage.applyFilters();
}

function clearFilters() {
    if (window.productsPage) {
        window.productsPage.clearAllFilters();
    }
}

function quickView(productId) {
    alert('Quick view: ' + productId);
}

function addToCart(productId, quantity = 1) {
    alert(`Added ${quantity} ${productId} to cart!`);
}

function addToWishlist(productId) {
    alert(`Added ${productId} to wishlist!`);
}

function addToCompare(productId) {
    alert(`Added ${productId} to compare!`);
}