// Modal Logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('chat-modal');
    if (event.target === modal) {
        closeModal('chat-modal');
    }
}

// 3D Tilt Effect for Cards
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        
        // Shine effect
        const shine = card.querySelector('.card-shine');
        if (shine) {
            // Move shine based on mouse position
             // Simplified shine for now, CSS animation handles the sweep on hover
             // but we can add dynamic light
        }
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// Canvas Background Animation
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let width, height;
let particles = [];
let particleCount = 80;
let connectionDistance = 150;
let mouseDistance = 200;
let connectionDistance2 = connectionDistance * connectionDistance;
let mouseDistance2 = mouseDistance * mouseDistance;

let mouse = { x: null, y: null };
let animationFrameId = null;
let running = false;
let lastFrameTime = 0;
const frameIntervalMs = 1000 / 30;
const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowEndDevice = typeof navigator !== 'undefined' && 'deviceMemory' in navigator && navigator.deviceMemory && navigator.deviceMemory <= 4;

if (ctx) {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAnimation();
        } else if (!prefersReducedMotion) {
            startAnimation();
        }
    });
}

function updatePerformanceProfile() {
    if (width < 600) {
        particleCount = 50;
        connectionDistance = 120;
        mouseDistance = 160;
    } else if (width < 1100) {
        particleCount = 65;
        connectionDistance = 140;
        mouseDistance = 180;
    } else {
        particleCount = 80;
        connectionDistance = 150;
        mouseDistance = 200;
    }

    if (lowEndDevice) {
        particleCount = Math.max(35, Math.round(particleCount * 0.7));
        connectionDistance = Math.round(connectionDistance * 0.9);
        mouseDistance = Math.round(mouseDistance * 0.9);
    }

    connectionDistance2 = connectionDistance * connectionDistance;
    mouseDistance2 = mouseDistance * mouseDistance;
}

function resizeCanvas() {
    if (!ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    updatePerformanceProfile();
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 3 + 1;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`; // White particles
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction (Repulsion)
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist2 = dx * dx + dy * dy;
            
            if (dist2 > 0 && dist2 < mouseDistance2) {
                const distance = Math.sqrt(dist2);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouseDistance - distance) / mouseDistance;
                const directionX = forceDirectionX * force * 2;
                const directionY = forceDirectionY * force * 2;
                
                this.vx -= directionX; // Repulsion
                this.vy -= directionY;
            }
        }
        
        // Friction
        this.vx *= 0.95;
        this.vy *= 0.95;
        
        // Minimum speed check
        if (Math.abs(this.vx) < 0.2) this.vx = (Math.random() - 0.5) * 0.8;
        if (Math.abs(this.vy) < 0.2) this.vy = (Math.random() - 0.5) * 0.8;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    if (!running) return;
    animationFrameId = requestAnimationFrame(animate);
    const now = performance.now();
    if (now - lastFrameTime < frameIntervalMs) return;
    lastFrameTime = now;

    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist2 = dx * dx + dy * dy;
            
            if (dist2 < connectionDistance2) {
                let distance = Math.sqrt(dist2);
                ctx.beginPath();
                let opacity = 1 - (distance / connectionDistance);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function startAnimation() {
    if (!ctx || running) return;
    running = true;
    lastFrameTime = 0;
    animationFrameId = requestAnimationFrame(animate);
}

function stopAnimation() {
    running = false;
    if (animationFrameId != null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

if (ctx) {
    resizeCanvas();
    if (prefersReducedMotion) {
        canvas.style.display = 'none';
    } else {
        startAnimation();
    }
}
