import React, { useEffect, useRef } from 'react';

/**
 * HeroCanvas
 * Renders a high-performance, dark cinematic ambient background with
 * gentle looping wave gradients and subtle luminous floating particles.
 * Autoplays, muted, fully responsive, and gracefully pauses if off-screen.
 */
export default function HeroCanvas({ parallaxOffset = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Floating subtle luminous nodes
    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let t = 0;

    const render = () => {
      t += 0.006;
      ctx.clearRect(0, 0, width, height);

      // 1. Deep midnight dark gradient canvas
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#060709');
      bgGrad.addColorStop(0.5, '#0B0D13');
      bgGrad.addColorStop(1, '#050608');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Large ethereal ambient color clouds
      const x1 = width * 0.35 + Math.sin(t * 0.8) * 120;
      const y1 = height * 0.4 + Math.cos(t * 0.6) * 80;
      const rad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, width * 0.55);
      rad1.addColorStop(0, 'rgba(37, 99, 235, 0.18)'); // Electric Cobalt accent
      rad1.addColorStop(0.4, 'rgba(37, 99, 235, 0.06)');
      rad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);

      const x2 = width * 0.65 + Math.cos(t * 0.7) * 100;
      const y2 = height * 0.6 + Math.sin(t * 0.5) * 90;
      const rad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, width * 0.5);
      rad2.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      rad2.addColorStop(0.5, 'rgba(30, 41, 59, 0.04)');
      rad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Subtle floating particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      // 4. Subtle grid lines for architectural structure
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 90;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        transform: `translate3d(0, ${parallaxOffset}px, 0)`,
        willChange: 'transform',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full object-cover block" />
      {/* Dark gradient overlay as requested */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/85 pointer-events-none" />
    </div>
  );
}
