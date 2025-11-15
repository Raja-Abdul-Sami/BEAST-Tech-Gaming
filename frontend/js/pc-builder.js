class PCBuilder {
    constructor() {
        this.components = {
            cpu: null,
            motherboard: null,
            gpu: null,
            ram: null,
            storage: null,
            psu: null,
            case: null,
            cooling: null
        };
        this.currentCategory = 'cpu';
        this.products = {};
        
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.showCategory('cpu');
    }

    async loadProducts() {
        try {
            const response = await fetch(`${API_BASE}/products`);
            const data = await response.json();
            
            if (data.success) {
                this.products = data.products.reduce((acc, product) => {
                    if (!acc[product.category]) acc[product.category] = [];
                    acc[product.category].push(product);
                    return acc;
                }, {});
                this.renderComponents();
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    setupEventListeners() {
        // Category selection
        document.querySelectorAll('.category').forEach(cat => {
            cat.addEventListener('click', () => {
                document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
                cat.classList.add('active');
                this.showCategory(cat.dataset.category);
            });
        });

        // Save build button
        document.getElementById('saveBuildBtn').addEventListener('click', () => this.saveBuild());
        
        // Add to cart button
        document.getElementById('addToCartBtn').addEventListener('click', () => this.addBuildToCart());
    }

    showCategory(category) {
        this.currentCategory = category;
        this.renderComponents();
    }

    renderComponents() {
        const grid = document.getElementById('componentsGrid');
        const categoryProducts = this.products[this.currentCategory] || [];
        
        grid.innerHTML = categoryProducts.map(product => `
            <div class="component-card" data-id="${product._id}">
                <div class="component-image">
                    <img src="${product.images[0] || '../images/placeholder.jpg'}" alt="${product.name}">
                </div>
                <div class="component-info">
                    <h4>${product.name}</h4>
                    <p class="component-brand">${product.brand}</p>
                    <p class="component-specs">${this.getSpecsPreview(product)}</p>
                    <div class="component-price">$${product.price}</div>
                </div>
                <button class="btn btn-small" onclick="pcBuilder.selectComponent('${this.currentCategory}', '${product._id}')">
                    Select
                </button>
            </div>
        `).join('');
    }

    getSpecsPreview(product) {
        const specs = product.specifications || {};
        switch(product.category) {
            case 'cpu':
                return `${specs.cores || ''} Cores • ${specs.speed || ''} GHz`;
            case 'gpu':
                return `${specs.memory || ''} VRAM • ${specs.interface || ''}`;
            case 'ram':
                return `${specs.capacity || ''} • ${specs.speed || ''}`;
            default:
                return product.description?.substring(0, 50) + '...' || '';
        }
    }

    async selectComponent(category, productId) {
        const product = this.products[category]?.find(p => p._id === productId);
        if (!product) return;

        this.components[category] = product;
        this.updateBuildDisplay();
        this.checkCompatibility();
        this.updatePerformanceMetrics();
        this.updateActionButtons();
    }

    updateBuildDisplay() {
        Object.entries(this.components).forEach(([category, product]) => {
            const element = document.querySelector(`[data-component="${category}"]`);
            if (product) {
                element.classList.remove('empty');
                element.innerHTML = `
                    <div class="selected-component">
                        <img src="${product.images[0] || '../images/placeholder.jpg'}" alt="${product.name}">
                        <div class="component-details">
                            <strong>${product.name}</strong>
                            <span>$${product.price}</span>
                        </div>
                        <button class="remove-btn" onclick="pcBuilder.removeComponent('${category}')">×</button>
                    </div>
                `;
            } else {
                element.classList.add('empty');
                element.innerHTML = `<span>+ Select ${category.toUpperCase()}</span>`;
            }
        });

        this.updateTotalPrice();
    }

    removeComponent(category) {
        this.components[category] = null;
        this.updateBuildDisplay();
        this.checkCompatibility();
        this.updatePerformanceMetrics();
        this.updateActionButtons();
    }

    updateTotalPrice() {
        const subtotal = Object.values(this.components).reduce((total, product) => {
            return total + (product ? product.price : 0);
        }, 0);
        
        const assemblyFee = 99;
        const total = subtotal + assemblyFee;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
    }

    checkCompatibility() {
        const issues = [];
        const { cpu, motherboard, ram } = this.components;

        // CPU-Motherboard compatibility
        if (cpu && motherboard) {
            const cpuSocket = cpu.specifications?.socket;
            const moboSocket = motherboard.specifications?.socket;
            if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
                issues.push(`CPU socket (${cpuSocket}) doesn't match motherboard socket (${moboSocket})`);
            }
        }

        // RAM compatibility
        if (ram && motherboard) {
            const ramType = ram.specifications?.type;
            const moboRamType = motherboard.specifications?.memoryType;
            if (ramType && moboRamType && ramType !== moboRamType) {
                issues.push(`RAM type (${ramType}) not compatible with motherboard (${moboRamType})`);
            }
        }

        const compatibilityElement = document.getElementById('compatibilityCheck');
        if (issues.length > 0) {
            compatibilityElement.className = 'compatibility-error';
            compatibilityElement.innerHTML = `❌ ${issues[0]}`;
        } else if (Object.values(this.components).some(comp => comp !== null)) {
            compatibilityElement.className = 'compatibility-success';
            compatibilityElement.innerHTML = '✅ All components compatible';
        } else {
            compatibilityElement.className = 'compatibility-warning';
            compatibilityElement.innerHTML = '⚠️ Select components to check compatibility';
        }
    }

    updatePerformanceMetrics() {
        // Simplified performance estimation
        const scores = this.calculatePerformanceScores();
        
        document.getElementById('metric1080p').style.width = `${scores.fhd}%`;
        document.getElementById('metric1440p').style.width = `${scores.qhd}%`;
        document.getElementById('metric4k').style.width = `${scores.uhd}%`;
        document.getElementById('metricCreation').style.width = `${scores.creation}%`;
    }

    calculatePerformanceScores() {
        let cpuScore = this.components.cpu ? (this.components.cpu.price / 100) : 0;
        let gpuScore = this.components.gpu ? (this.components.gpu.price / 200) : 0;
        let ramScore = this.components.ram ? 20 : 0;

        return {
            fhd: Math.min(100, cpuScore * 0.4 + gpuScore * 0.5 + ramScore * 0.1),
            qhd: Math.min(100, cpuScore * 0.3 + gpuScore * 0.6 + ramScore * 0.1),
            uhd: Math.min(100, cpuScore * 0.2 + gpuScore * 0.7 + ramScore * 0.1),
            creation: Math.min(100, cpuScore * 0.6 + gpuScore * 0.3 + ramScore * 0.1)
        };
    }

    updateActionButtons() {
        const hasComponents = Object.values(this.components).some(comp => comp !== null);
        const isUserLoggedIn = localStorage.getItem('token');
        
        document.getElementById('saveBuildBtn').disabled = !hasComponents || !isUserLoggedIn;
        document.getElementById('addToCartBtn').disabled = !hasComponents;
    }

    async saveBuild() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to save your build');
            return;
        }

        try {
            const buildData = {
                name: `My BEAST Build - ${new Date().toLocaleDateString()}`,
                components: this.components,
                totalPrice: this.calculateTotal(),
                compatibility: this.checkCompatibility()
            };

            const response = await authFetch('/builds/save', {
                method: 'POST',
                body: JSON.stringify(buildData)
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Build saved successfully!');
            } else {
                alert('Error saving build: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving build:', error);
            alert('Error saving build');
        }
    }

    async addBuildToCart() {
        const components = Object.values(this.components).filter(comp => comp !== null);
        
        try {
            for (const component of components) {
                await this.addToCart(component._id, 1);
            }
            
            // Add assembly service
            await this.addToCart('assembly_service', 1);
            
            alert('All components added to cart!');
            window.location.href = 'cart.html';
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding components to cart');
        }
    }

    async addToCart(productId, quantity) {
        const response = await authFetch('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        return response.json();
    }

    calculateTotal() {
        return Object.values(this.components).reduce((total, product) => {
            return total + (product ? product.price : 0);
        }, 0) + 99; // Assembly fee
    }
}

// Initialize PC Builder
let pcBuilder;
function initializePCBuilder() {
    pcBuilder = new PCBuilder();
}