class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.getElementById('particles');
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
            
            // Set styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}vw`;
            particle.style.top = `${posY}vh`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            // Random color from neon palette
            const colors = ['#00f3ff', '#b967ff', '#ff2a6d', '#00ff9d', '#ff6b35'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = color;
            particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    animate() {
        // Particles are animated via CSS
    }
}

// Initialize particle system when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});