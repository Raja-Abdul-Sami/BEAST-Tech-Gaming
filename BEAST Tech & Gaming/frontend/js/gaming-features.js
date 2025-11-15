// ===== REAL-TIME PERFORMANCE METRICS =====
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.setupLiveCounters();
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupTypewriterEffects();
    }

    setupLiveCounters() {
        // Animated number counters for stats
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const increment = target / 100;
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current).toLocaleString();
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            // Start when element is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }

    setupScrollAnimations() {
        // GSAP-like scroll animations
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transition = 'all 0.8s ease';
            if (el.classList.contains('fade-in-up')) {
                el.style.transform = 'translateY(50px)';
            } else if (el.classList.contains('fade-in-left')) {
                el.style.transform = 'translateX(-50px)';
            } else if (el.classList.contains('fade-in-right')) {
                el.style.transform = 'translateX(50px)';
            }
            observer.observe(el);
        });
    }

    setupParallaxEffects() {
        // Parallax scrolling for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupTypewriterEffects() {
        // Typewriter effect for hero text
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--neon-orange)';
            
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, 100);
                } else {
                    element.style.borderRight = 'none';
                }
            };
            
            // Start when in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        type();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(element);
        });
    }
}

// ===== REAL-TIME INVENTORY TRACKER =====
class InventoryTracker {
    constructor() {
        this.updateInventoryCounts();
        setInterval(() => this.updateInventoryCounts(), 30000); // Update every 30 seconds
    }

    async updateInventoryCounts() {
        try {
            const response = await fetch(`${API_BASE}/products/stock`);
            const data = await response.json();
            
            if (data.success) {
                this.updateStockBadges(data.products);
                this.updateLowStockWarnings();
            }
        } catch (error) {
            console.error('Error updating inventory:', error);
        }
    }

    updateStockBadges(products) {
        products.forEach(product => {
            const badges = document.querySelectorAll(`[data-product-id="${product._id}"] .stock-badge`);
            badges.forEach(badge => {
                if (product.stock < 5) {
                    badge.textContent = `🚨 Only ${product.stock} left!`;
                    badge.className = 'stock-badge low-stock';
                } else if (product.stock < 15) {
                    badge.textContent = `⚠️ Low Stock`;
                    badge.className = 'stock-badge warning';
                } else {
                    badge.textContent = `✅ In Stock`;
                    badge.className = 'stock-badge in-stock';
                }
            });
        });
    }

    updateLowStockWarnings() {
        // Add visual warnings to low stock items
        const lowStockItems = document.querySelectorAll('.low-stock');
        lowStockItems.forEach(item => {
            item.classList.add('pulse-glow');
        });
    }
}

// ===== INTERACTIVE COMPONENT COMPATIBILITY CHECKER =====
class AdvancedCompatibilityChecker {
    constructor() {
        this.compatibilityRules = {
            cpu: {
                amd: ['AM4', 'AM5'],
                intel: ['LGA1700', 'LGA1200']
            },
            ram: {
                ddr4: ['DDR4'],
                ddr5: ['DDR5']
            }
        };
    }

    checkAdvancedCompatibility(components) {
        const issues = [];
        const warnings = [];

        // CPU-Motherboard socket check
        if (components.cpu && components.motherboard) {
            const cpuBrand = components.cpu.brand.toLowerCase();
            const cpuSocket = components.cpu.specifications?.socket;
            const moboSocket = components.motherboard.specifications?.socket;
            
            if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
                issues.push({
                    type: 'error',
                    message: `❌ CPU-Motherboard Incompatible: ${cpuBrand.toUpperCase()} ${cpuSocket} CPU doesn't fit ${moboSocket} motherboard`,
                    components: ['cpu', 'motherboard']
                });
            }
        }

        // RAM-Motherboard compatibility
        if (components.ram && components.motherboard) {
            const ramType = components.ram.specifications?.type;
            const moboRamType = components.motherboard.specifications?.memoryType;
            
            if (ramType && moboRamType && ramType !== moboRamType) {
                issues.push({
                    type: 'error',
                    message: `❌ RAM Incompatible: ${ramType} RAM not supported by motherboard (requires ${moboRamType})`,
                    components: ['ram', 'motherboard']
                });
            }
        }

        // PSU Wattage check
        if (components.psu) {
            const totalPower = this.calculateTotalPower(components);
            const psuWattage = components.psu.specifications?.wattage || 0;
            
            if (psuWattage < totalPower) {
                issues.push({
                    type: 'error',
                    message: `❌ Insufficient Power: PSU (${psuWattage}W) too weak for estimated ${totalPower}W load`,
                    components: ['psu']
                });
            } else if (psuWattage < totalPower * 1.2) {
                warnings.push({
                    type: 'warning',
                    message: `⚠️ Close Power Limit: Consider a higher wattage PSU for better efficiency`,
                    components: ['psu']
                });
            }
        }

        // Case size compatibility
        if (components.case && components.motherboard) {
            const caseSize = components.case.specifications?.formFactor || [];
            const moboSize = components.motherboard.specifications?.formFactor;
            
            if (moboSize && !caseSize.includes(moboSize)) {
                issues.push({
                    type: 'error',
                    message: `❌ Case Too Small: ${moboSize} motherboard doesn't fit in selected case`,
                    components: ['case', 'motherboard']
                });
            }
        }

        return { issues, warnings };
    }

    calculateTotalPower(components) {
        let total = 0;
        Object.values(components).forEach(component => {
            if (component) {
                const power = component.specifications?.tdp || component.specifications?.wattage || 0;
                total += power;
            }
        });
        return Math.ceil(total * 1.3); // Add 30% headroom
    }

    generateCompatibilityReport(components) {
        const { issues, warnings } = this.checkAdvancedCompatibility(components);
        this.displayCompatibilityReport(issues, warnings);
        return { issues, warnings };
    }

    displayCompatibilityReport(issues, warnings) {
        const reportContainer = document.getElementById('compatibilityReport');
        if (!reportContainer) return;

        let html = '';

        if (issues.length === 0 && warnings.length === 0) {
            html = `<div class="compatibility-success">✅ All components are compatible!</div>`;
        } else {
            issues.forEach(issue => {
                html += `<div class="compatibility-error">${issue.message}</div>`;
            });
            warnings.forEach(warning => {
                html += `<div class="compatibility-warning">${warning.message}</div>`;
            });
        }

        // Add power estimate
        const totalPower = this.calculateTotalPower(components);
        html += `<div class="power-estimate">💡 Estimated System Power: ${totalPower}W</div>`;

        reportContainer.innerHTML = html;
    }
}

// ===== REAL-TIME PRICE TRACKER =====
class PriceTracker {
    constructor() {
        this.priceAlerts = new Set();
        this.init();
    }

    init() {
        this.loadPriceAlerts();
        this.setupPriceChangeListeners();
    }

    async checkForPriceChanges() {
        try {
            const response = await fetch(`${API_BASE}/products/price-changes`);
            const data = await response.json();
            
            if (data.success && data.changes.length > 0) {
                this.showPriceDropNotifications(data.changes);
            }
        } catch (error) {
            console.error('Error checking price changes:', error);
        }
    }

    showPriceDropNotifications(priceChanges) {
        priceChanges.forEach(change => {
            if (this.priceAlerts.has(change.productId)) {
                this.createPriceDropToast(change);
            }
        });
    }

    createPriceDropToast(change) {
        const toast = document.createElement('div');
        toast.className = 'price-drop-toast';
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-icon">💰</span>
                <strong>Price Drop!</strong>
            </div>
            <div class="toast-body">
                ${change.name} is now $${change.newPrice} (${change.discount}% off!)
            </div>
            <button class="toast-action" onclick="addToCart('${change.productId}')">
                Add to Cart
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    setupPriceAlert(productId, targetPrice) {
        this.priceAlerts.add(productId);
        localStorage.setItem('priceAlerts', JSON.stringify(Array.from(this.priceAlerts)));
    }

    loadPriceAlerts() {
        const saved = localStorage.getItem('priceAlerts');
        if (saved) {
            this.priceAlerts = new Set(JSON.parse(saved));
        }
    }
}

// ===== GAMING ACHIEVEMENT SYSTEM =====
class AchievementSystem {
    constructor() {
        this.achievements = new Map();
        this.unlocked = new Set();
        this.init();
    }

    init() {
        this.defineAchievements();
        this.loadUnlockedAchievements();
        this.setupAchievementListeners();
    }

    defineAchievements() {
        this.achievements.set('first_build', {
            title: 'First Build',
            description: 'Create your first PC build',
            icon: '🔧',
            points: 50
        });
        
        this.achievements.set('high_end_build', {
            title: 'Elite Builder',
            description: 'Create a build over $2000',
            icon: '💎',
            points: 100
        });
        
        this.achievements.set('compatible_master', {
            title: 'Compatibility Master',
            description: 'Create a fully compatible build',
            icon: '🎯',
            points: 75
        });
        
        this.achievements.set('frequent_builder', {
            title: 'PC Architect',
            description: 'Save 5 different builds',
            icon: '🏗️',
            points: 150
        });
    }

    unlockAchievement(achievementId) {
        if (this.unlocked.has(achievementId) || !this.achievements.has(achievementId)) return;
        
        const achievement = this.achievements.get(achievementId);
        this.unlocked.add(achievementId);
        this.saveUnlockedAchievements();
        this.showAchievementToast(achievement);
        
        // Update user profile
        this.updateUserAchievements(achievementId);
    }

    showAchievementToast(achievement) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} XP</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Add animation class
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    setupAchievementListeners() {
        // Listen for build completion events
        document.addEventListener('buildCompleted', (event) => {
            const { totalPrice, isCompatible } = event.detail;
            
            this.unlockAchievement('first_build');
            
            if (totalPrice > 2000) {
                this.unlockAchievement('high_end_build');
            }
            
            if (isCompatible) {
                this.unlockAchievement('compatible_master');
            }
        });

        // Listen for build save events
        document.addEventListener('buildSaved', (event) => {
            const savedBuildsCount = event.detail.count;
            if (savedBuildsCount >= 5) {
                this.unlockAchievement('frequent_builder');
            }
        });
    }

    saveUnlockedAchievements() {
        localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(this.unlocked)));
    }

    loadUnlockedAchievements() {
        const saved = localStorage.getItem('unlockedAchievements');
        if (saved) {
            this.unlocked = new Set(JSON.parse(saved));
        }
    }

    async updateUserAchievements(achievementId) {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            await authFetch('/user/achievements', {
                method: 'POST',
                body: JSON.stringify({ achievementId })
            });
        } catch (error) {
            console.error('Error updating achievements:', error);
        }
    }
}

// ===== 3D PRODUCT VIEWER =====
class ProductViewer3D {
    constructor() {
        this.viewers = new Map();
        this.init();
    }

    init() {
        this.setupProductViewers();
    }

    setupProductViewers() {
        const viewerContainers = document.querySelectorAll('.product-viewer-3d');
        
        viewerContainers.forEach(container => {
            const productId = container.dataset.productId;
            this.createViewer(container, productId);
        });
    }

    createViewer(container, productId) {
        // Simple 3D rotation effect using CSS transforms
        let isDragging = false;
        let previousX = 0;
        let rotationY = 0;
        let rotationX = 0;

        const image = container.querySelector('.product-image-3d');
        
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousX = e.clientX;
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousX;
            rotationY += deltaX * 0.5;
            
            image.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
            previousX = e.clientX;
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        // Add touch support for mobile
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            previousX = e.touches[0].clientX;
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.touches[0].clientX - previousX;
            rotationY += deltaX * 0.5;
            
            image.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
            previousX = e.touches[0].clientX;
        });

        container.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
}

// ===== GAMING SOUND EFFECTS =====
class SoundEffects {
    constructor() {
        this.sounds = new Map();
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.init();
    }

    init() {
        this.loadSounds();
        this.createSoundToggle();
    }

    loadSounds() {
        // These would be actual audio files in production
        this.sounds.set('click', new Audio('/sounds/click.wav'));
        this.sounds.set('success', new Audio('/sounds/success.wav'));
        this.sounds.set('error', new Audio('/sounds/error.wav'));
        this.sounds.set('achievement', new Audio('/sounds/achievement.wav'));
        
        // Set volume
        this.sounds.forEach(sound => {
            sound.volume = 0.3;
        });
    }

    play(soundName) {
        if (!this.enabled || !this.sounds.has(soundName)) return;
        
        const sound = this.sounds.get(soundName);
        sound.currentTime = 0;
        sound.play().catch(() => {
            // Ignore errors (user might not have interacted yet)
        });
    }

    createSoundToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'sound-toggle';
        toggle.innerHTML = this.enabled ? '🔊' : '🔇';
        toggle.title = this.enabled ? 'Disable sound effects' : 'Enable sound effects';
        
        toggle.addEventListener('click', () => {
            this.enabled = !this.enabled;
            toggle.innerHTML = this.enabled ? '🔊' : '🔇';
            localStorage.setItem('soundEnabled', this.enabled);
            
            if (this.enabled) {
                this.play('click');
            }
        });
        
        // Add to page
        const header = document.querySelector('.nav-actions');
        if (header) {
            header.appendChild(toggle);
        }
    }
}

// ===== INITIALIZE ALL GAMING FEATURES =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all gaming features
    window.performanceMonitor = new PerformanceMonitor();
    window.inventoryTracker = new InventoryTracker();
    window.compatibilityChecker = new AdvancedCompatibilityChecker();
    window.priceTracker = new PriceTracker();
    window.achievementSystem = new AchievementSystem();
    window.productViewer3D = new ProductViewer3D();
    window.soundEffects = new SoundEffects();

    // Add gaming cursor effect
    addGamingCursorEffect();
});

// ===== GAMING CURSOR EFFECT =====
function addGamingCursorEffect() {
    const cursor = document.createElement('div');
    cursor.className = 'gaming-cursor';
    document.body.appendChild(cursor);

    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(follower);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 100);
    });

    // Change cursor on interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .product-card, .category-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = 'var(--neon-orange)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'var(--neon-blue)';
        });
    });
}