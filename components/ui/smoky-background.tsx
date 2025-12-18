'use client';

import React, { useEffect, useRef } from 'react';

export const SmokyBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = 50;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            life: number;
            maxLife: number;
            alpha: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 200 + 100;
                this.life = 0;
                this.maxLife = Math.random() * 200 + 100;
                this.alpha = 0;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life++;

                if (this.life < 50) {
                    this.alpha += 0.005;
                } else if (this.life > this.maxLife - 50) {
                    this.alpha -= 0.005;
                }

                if (this.life >= this.maxLife || this.alpha <= 0) {
                    this.reset();
                }

                if (this.x < -this.size) this.x = canvas!.width + this.size;
                if (this.x > canvas!.width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = canvas!.height + this.size;
                if (this.y > canvas!.height + this.size) this.y = -this.size;
            }

            reset() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.life = 0;
                this.alpha = 0;
            }

            draw() {
                ctx!.save();
                ctx!.globalAlpha = this.alpha * 0.15; // Low opacity for subtle smoke
                ctx!.fillStyle = '#a8b2d1'; // Bluish-gray smoke color
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fill();
                ctx!.restore();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none bg-background" />;
};
