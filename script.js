/**
 * TTG - 高级简约 / 浮夸动画系统
 */

(function() {
    'use strict';

    // ========================================
    // 工具函数
    // ========================================
    const lerp = (start, end, factor) => start + (end - start) * factor;
    const throttle = (fn, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // ========================================
    // 噪点背景
    // ========================================
    class GrainEffect {
        constructor() {
            this.canvas = document.getElementById('grain');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.animate();

            window.addEventListener('resize', throttle(() => this.resize(), 200));
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        animate() {
            const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const value = Math.random() * 255;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
                data[i + 3] = 255;
            }

            this.ctx.putImageData(imageData, 0, 0);
            requestAnimationFrame(() => this.animate());
        }
    }

    // ========================================
    // 自定义光标
    // ========================================
    class CustomCursor {
        constructor() {
            this.cursor = document.querySelector('.custom-cursor');
            this.ring = document.querySelector('.cursor-ring');
            this.dot = document.querySelector('.cursor-dot');

            if (!this.cursor || window.matchMedia('(pointer: coarse)').matches) {
                if (this.cursor) this.cursor.style.display = 'none';
                document.body.style.cursor = 'auto';
                return;
            }

            this.mouse = { x: 0, y: 0 };
            this.ringPos = { x: 0, y: 0 };
            this.isActive = true;

            this.init();
        }

        init() {
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            // 悬停效果
            const interactiveElements = document.querySelectorAll('a, button, .preview-card');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
            });

            this.animate();
        }

        animate() {
            if (!this.isActive) return;

            // 圆环平滑跟随
            this.ringPos.x = lerp(this.ringPos.x, this.mouse.x, 0.15);
            this.ringPos.y = lerp(this.ringPos.y, this.mouse.y, 0.15);

            this.ring.style.left = this.ringPos.x + 'px';
            this.ring.style.top = this.ringPos.y + 'px';

            // 圆点直接跟随
            this.dot.style.left = this.mouse.x + 'px';
            this.dot.style.top = this.mouse.y + 'px';

            requestAnimationFrame(() => this.animate());
        }
    }

    // ========================================
    // 磁吸链接效果
    // ========================================
    class MagneticLinks {
        constructor() {
            this.links = document.querySelectorAll('[data-magnetic]');
            this.init();
        }

        init() {
            this.links.forEach(link => {
                link.addEventListener('mousemove', (e) => this.handleMove(e, link));
                link.addEventListener('mouseleave', () => this.handleLeave(link));

                // 鼠标位置光效
                link.addEventListener('mousemove', throttle((e) => {
                    const rect = link.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    link.style.setProperty('--mouse-x', x + '%');
                    link.style.setProperty('--mouse-y', y + '%');
                }, 50));
            });
        }

        handleMove(e, element) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * 0.2;
            const deltaY = (e.clientY - centerY) * 0.2;

            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }

        handleLeave(element) {
            element.style.transform = 'translate(0, 0)';
        }
    }

    // ========================================
    // 字符动画
    // ========================================
    class CharacterAnimation {
        constructor() {
            this.chars = document.querySelectorAll('.char');
            this.init();
        }

        init() {
            this.chars.forEach((char, index) => {
                // 随机微动
                setInterval(() => {
                    if (Math.random() > 0.95) {
                        char.style.transform = `translateY(${Math.random() * 4 - 2}px)`;
                        setTimeout(() => {
                            char.style.transform = '';
                        }, 200);
                    }
                }, 3000 + index * 500);
            });
        }
    }

    // ========================================
    // 预览卡片交互
    // ========================================
    class PreviewCards {
        constructor() {
            this.cards = document.querySelectorAll('.preview-card');
            this.init();
        }

        init() {
            this.cards.forEach(card => {
                card.addEventListener('click', () => {
                    const type = card.dataset.preview;
                    if (type === 'chat') {
                        window.location.href = 'chat.html';
                    } else if (type === 'about') {
                        window.location.href = 'about.html';
                    }
                });
            });
        }
    }

    // ========================================
    // 视差效果
    // ========================================
    class ParallaxEffect {
        constructor() {
            this.glow = document.querySelector('.ambient-glow');
            if (!this.glow) return;

            this.init();
        }

        init() {
            document.addEventListener('mousemove', throttle((e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 50;
                const y = (e.clientY / window.innerHeight - 0.5) * 50;

                this.glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
            }, 50));
        }
    }

    // ========================================
    // 初始化
    // ========================================
    function init() {
        new GrainEffect();
        new CustomCursor();
        new MagneticLinks();
        new CharacterAnimation();
        new PreviewCards();
        new ParallaxEffect();

        console.log('TTG - Advanced Minimal Animation System Loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
