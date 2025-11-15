let currentProduct = null;

async function loadProductDetails(productId) {
    try {
        showProductLoading(true);
        
        // Use demo data for now
        const demoProducts = getDemoProducts();
        const product = demoProducts.find(p => p._id === productId);
        
        if (product) {
            currentProduct = product;
            displayProductDetails(product);
            loadRelatedProducts(product);
            updateRecentlyViewed(productId);
        } else {
            showProductError('Product not found');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showProductError('Failed to load product details');
    } finally {
        showProductLoading(false);
    }
}

function getDemoProducts() {
    return [
        {
            _id: 'cpu_amd_ryzen9',
            name: 'AMD Ryzen 9 7950X',
            category: 'cpu',
            brand: 'amd',
            price: 699,
            stock: 15,
            images: [
                'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop',
                'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=600&fit=crop'
            ],
            specifications: {
                'Cores': '16',
                'Threads': '32',
                'Base Clock': '4.5 GHz',
                'Max Boost Clock': '5.7 GHz',
                'Socket': 'AM5',
                'TDP': '170W',
                'Lithography': '5nm'
            },
            description: 'The AMD Ryzen 9 7950X is the ultimate processor for gaming and content creation. With 16 cores and 32 threads, it delivers exceptional performance for the most demanding workloads. Featuring the new Zen 4 architecture and built on 5nm process technology, this processor offers groundbreaking efficiency and speed.',
            compatibility: ['AM5 Motherboards', 'DDR5 Memory', 'PCIe 5.0'],
            createdAt: new Date().toISOString(),
            reviews: [
                {
                    user: 'GamerPro123',
                    rating: 5,
                    title: 'Absolute Beast!',
                    comment: 'This CPU destroys everything I throw at it. Gaming performance is incredible!',
                    date: '2024-01-15'
                },
                {
                    user: 'ContentCreator',
                    rating: 4,
                    title: 'Great for streaming',
                    comment: 'Handles gaming and streaming simultaneously without any issues.',
                    date: '2024-01-10'
                }
            ]
        },
        {
            _id: 'gpu_rtx4090',
            name: 'NVIDIA GeForce RTX 4090',
            category: 'gpu',
            brand: 'nvidia',
            price: 1599,
            stock: 3,
            images: [
                'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=600&fit=crop',
                'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&h=600&fit=crop'
            ],
            specifications: {
                'GPU': 'Ada Lovelace',
                'CUDA Cores': '16384',
                'Memory': '24 GB GDDR6X',
                'Memory Speed': '21 Gbps',
                'Interface': 'PCIe 4.0',
                'Power Connectors': '1x 16-pin',
                'Recommended PSU': '850W'
            },
            description: 'The NVIDIA GeForce RTX 4090 is the ultimate GPU for gamers and creators. Powered by the NVIDIA Ada Lovelace architecture, it delivers quantum leaps in performance and AI-powered graphics. Experience ultra-performance gaming, detailed virtual worlds, unprecedented productivity, and new ways to create.',
            compatibility: ['PCIe 4.0', '850W+ PSU', 'Large Case Required'],
            createdAt: new Date().toISOString(),
            reviews: [
                {
                    user: '4KGamer',
                    rating: 5,
                    title: 'Unreal Performance',
                    comment: '4K gaming at max settings with ray tracing is finally smooth!',
                    date: '2024-01-12'
                }
            ]
        }
        // Add more demo products as needed...
    ];
}

function displayProductDetails(product) {
    // Update breadcrumb
    document.getElementById('categoryBreadcrumb').textContent = formatCategory(product.category);
    document.getElementById('productBreadcrumb').textContent = product.name;
    
    // Update main product info
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productCategory').textContent = product.category.toUpperCase();
    document.getElementById('productPrice').textContent = `$${product.price}`;
    
    // Update stock badge
    const stockBadge = document.getElementById('stockBadge');
    if (product.stock < 5) {
        stockBadge.textContent = '🚨 LOW STOCK';
        stockBadge.className = 'stock-badge low-stock';
    } else if (product.stock < 15) {
        stockBadge.textContent = '⚠️ LIMITED STOCK';
        stockBadge.className = 'stock-badge warning';
    } else {
        stockBadge.textContent = '✅ IN STOCK';
        stockBadge.className = 'stock-badge in-stock';
    }
    
    // Update images
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
    
    // Update thumbnails
    const thumbnails = document.getElementById('imageThumbnails');
    thumbnails.innerHTML = product.images.map((img, index) => `
        <img src="${img}" alt="${product.name}" 
             onclick="changeMainImage('${img}')"
             class="thumbnail ${index === 0 ? 'active' : ''}">
    `).join('');
    
    // Update specifications
    displaySpecifications(product.specifications);
    
    // Update description
    document.getElementById('descriptionContent').innerHTML = `
        <p>${product.description}</p>
        <div class="description-features">
            <h4>Key Features:</h4>
            <ul>
                <li>High-performance gaming ready</li>
                <li>Premium build quality</li>
                <li>Advanced cooling technology</li>
                <li>RGB lighting support</li>
                <li>Easy installation</li>
            </ul>
        </div>
    `;
    
    // Update reviews
    displayReviews(product.reviews || []);
    
    // Update compatibility
    displayCompatibility(product.compatibility || []);
}

function displaySpecifications(specs) {
    const specsGrid = document.getElementById('specsGrid');
    specsGrid.innerHTML = Object.entries(specs).map(([key, value]) => `
        <div class="spec-item">
            <span class="spec-label">${key}</span>
            <span class="spec-value">${value}</span>
        </div>
    `).join('');
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    const averageRating = document.getElementById('averageRating');
    const totalReviews = document.getElementById('totalReviews');
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        `;
        averageRating.textContent = '0.0';
        totalReviews.textContent = '0 reviews';
        return;
    }
    
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    averageRating.textContent = average.toFixed(1);
    totalReviews.textContent = `${reviews.length} review${reviews.length > 1 ? 's' : ''}`;
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer">${review.user}</div>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <div class="review-date">${review.date}</div>
            </div>
            <div class="review-title">${review.title}</div>
            <div class="review-comment">${review.comment}</div>
        </div>
    `).join('');
}

function displayCompatibility(compatibility) {
    const compatibilityInfo = document.getElementById('compatibilityInfo');
    compatibilityInfo.innerHTML = `
        <div class="compatibility-list">
            <h4>Compatible With:</h4>
            <ul>
                ${compatibility.map(item => `<li>✅ ${item}</li>`).join('')}
            </ul>
        </div>
        <div class="compatibility-note">
            <p><strong>Note:</strong> Always verify compatibility with your specific system configuration.</p>
        </div>
    `;
}

function loadRelatedProducts(product) {
    const relatedProducts = document.getElementById('relatedProducts');
    const demoProducts = getDemoProducts();
    
    // Get products from same category (excluding current product)
    const related = demoProducts
        .filter(p => p.category === product.category && p._id !== product._id)
        .slice(0, 4);
    
    if (related.length === 0) {
        relatedProducts.innerHTML = '<p>No related products found.</p>';
        return;
    }
    
    relatedProducts.innerHTML = related.map(p => `
        <div class="product-card">
            <div class="product-image">
                <img src="${p.images[0]}" alt="${p.name}">
            </div>
            <div class="product-info">
                <h4>${p.name}</h4>
                <div class="product-price">$${p.price}</div>
            </div>
            <div class="product-footer">
                <button class="btn btn-primary" onclick="window.location.href='product-detail.html?id=${p._id}'">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function updateRecentlyViewed(productId) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    
    // Add to beginning
    recentlyViewed.unshift(productId);
    
    // Keep only last 4 products
    recentlyViewed = recentlyViewed.slice(0, 4);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    displayRecentlyViewed();
}

function displayRecentlyViewed() {
    const recentlyViewedContainer = document.getElementById('recentlyViewed');
    const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const demoProducts = getDemoProducts();
    
    const products = recentlyViewedIds
        .map(id => demoProducts.find(p => p._id === id))
        .filter(p => p);
    
    if (products.length === 0) {
        recentlyViewedContainer.innerHTML = '<p>No recently viewed products.</p>';
        return;
    }
    
    recentlyViewedContainer.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-image">
                <img src="${p.images[0]}" alt="${p.name}">
            </div>
            <div class="product-info">
                <h4>${p.name}</h4>
                <div class="product-price">$${p.price}</div>
            </div>
            <div class="product-footer">
                <button class="btn btn-primary" onclick="window.location.href='product-detail.html?id=${p._id}'">
                    View Again
                </button>
            </div>
        </div>
    `).join('');
}

// Helper functions
function formatCategory(category) {
    const categories = {
        cpu: 'Processors',
        gpu: 'Graphics Cards',
        motherboard: 'Motherboards',
        ram: 'Memory',
        storage: 'Storage',
        psu: 'Power Supply',
        case: 'Cases',
        cooling: 'Cooling'
    };
    return categories[category] || category;
}

function changeMainImage(src) {
    document.getElementById('mainProductImage').src = src;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    event.target.classList.add('active');
}

function getQuantity() {
    return parseInt(document.getElementById('productQuantity').value) || 1;
}

function updateQuantity(change) {
    const input = document.getElementById('productQuantity');
    let value = parseInt(input.value) || 1;
    value = Math.max(1, value + change);
    input.value = value;
}

function showProductLoading(show) {
    // Simple loading state - you can enhance this
    if (show) {
        document.querySelector('.product-detail-container').style.opacity = '0.5';
    } else {
        document.querySelector('.product-detail-container').style.opacity = '1';
    }
}

function showProductError(message) {
    document.querySelector('.product-detail-container').innerHTML = `
        <div class="error-message">
            <div class="error-icon">⚠️</div>
            <h3>${message}</h3>
            <button class="btn btn-primary" onclick="window.location.href='products.html'">
                Back to Products
            </button>
        </div>
    `;
}

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabHeaders = document.querySelectorAll('.tab-header');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const tabId = header.dataset.tab;
            
            // Update active tab header
            tabHeaders.forEach(h => h.classList.remove('active'));
            header.classList.add('active');
            
            // Update active tab pane
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
});