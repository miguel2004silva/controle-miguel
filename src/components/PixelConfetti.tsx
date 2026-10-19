import React, { useEffect, useRef } from 'react';

interface PixelConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

const PIXEL_COLORS = [
  '#f1c40f', // Gold
  '#e67e22', // Orange
  '#2ecc71', // Green
  '#e74c3c', // Red
  '#8cc152', // Light green
  '#ffd13b', // Bright yellow
  '#fff4d6', // Cream
];

export const PixelConfetti: React.FC<PixelConfettiProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Disable smoothing for sharp pixel art
    ctx.imageSmoothingEnabled = false;

    const particles: Particle[] = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 80,
        y: height * 0.45 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 6,
        size: Math.floor(Math.random() * 4 + 4) * 2, // 8, 10, 12, 14px blocks (even pixels)
        color: PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: Math.floor(Math.random() * 60 + 80),
      });
    }

    let animationFrameId: number;
    const gravity = 0.38;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (const p of particles) {
        p.life++;
        if (p.life >= p.maxLife) continue;

        aliveCount++;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(Math.round(p.x), Math.round(p.y));
        ctx.rotate((p.rotation * Math.PI) / 180);

        ctx.fillStyle = p.color;
        // Draw hard crisp pixel square
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

        // Add 1px dark bottom-right shadow border for authentic retro look
        ctx.fillStyle = '#3b2412';
        ctx.fillRect(-p.size / 2 + p.size - 2, -p.size / 2, 2, p.size);
        ctx.fillRect(-p.size / 2, -p.size / 2 + p.size - 2, p.size, 2);

        ctx.restore();
      }

      if (aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
