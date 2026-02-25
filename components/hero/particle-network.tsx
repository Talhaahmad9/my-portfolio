"use client";

import { useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 55;
const CONNECTION_DISTANCE = 130;
const CURSOR_ATTRACT_DISTANCE = 160;
const CURSOR_ATTRACT_STRENGTH = 0.012;
const BASE_SPEED = 0.35;
const DOT_COLOR = "20, 33, 61";       // oxfordBlue  #14213d  (r,g,b)
const LINE_COLOR = "252, 163, 17";    // orangeWeb   #fca311  (r,g,b)

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Resize ──────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Init particles ───────────────────────────────────────────────────────
    const init = () => {
      particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * BASE_SPEED * 2,
        vy: (Math.random() - 0.5) * BASE_SPEED * 2,
        radius: Math.random() * 1.8 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      }));
    };
    init();

    // ── Draw ─────────────────────────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Update positions
      for (const p of pts) {
        // Cursor attraction
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_ATTRACT_DISTANCE && dist > 0) {
          const force = (1 - dist / CURSOR_ATTRACT_DISTANCE) * CURSOR_ATTRACT_STRENGTH;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > BASE_SPEED * 2.5) {
          p.vx = (p.vx / speed) * BASE_SPEED * 2.5;
          p.vy = (p.vy / speed) * BASE_SPEED * 2.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width)  { p.vx *= -1; p.x = Math.max(0, Math.min(canvas.width, p.x)); }
        if (p.y < 0 || p.y > canvas.height) { p.vy *= -1; p.y = Math.max(0, Math.min(canvas.height, p.y)); }
      }

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.35;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_COLOR}, ${p.opacity})`;
        ctx.fill();
      }

      rafId.current = requestAnimationFrame(draw);
    };

    // Pause when tab is hidden (saves CPU)
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId.current);
      } else {
        rafId.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    rafId.current = requestAnimationFrame(draw);

    // ── Mouse tracking ───────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ pointerEvents: "auto" }} // needed for mousemove but not clicks
    />
  );
}
