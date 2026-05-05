"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<{ x: number; y: number; age: number }[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const glowPos = useRef({ x: -9999, y: -9999 });
  const rafId = useRef<number>(0);
  const lastPush = useRef<number>(0);
  const lastMoveAt = useRef<number>(0);
  const hasEntered = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      mouse.current = { x: e.clientX, y: e.clientY };
      hasEntered.current = true;
      lastMoveAt.current = now;
      if (now - lastPush.current > 12) {
        points.current.push({ x: glowPos.current.x, y: glowPos.current.y, age: 0 });
        lastPush.current = now;
        if (points.current.length > 120) points.current.shift();
      }
    };
    window.addEventListener("mousemove", onMove);

    const TRAIL_LIFETIME = 48;
    const IDLE_FADE_MS = 550;
    const FOLLOW_EASE = 0.09;

    const rgba = (r: number, g: number, b: number, a: number) =>
      `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (hasEntered.current) {
        glowPos.current.x += (mouse.current.x - glowPos.current.x) * FOLLOW_EASE;
        glowPos.current.y += (mouse.current.y - glowPos.current.y) * FOLLOW_EASE;
      }

      const mx = glowPos.current.x;
      const my = glowPos.current.y;
      const idleMs = performance.now() - lastMoveAt.current;
      const idleFade = hasEntered.current ? Math.max(0, 1 - idleMs / IDLE_FADE_MS) : 0;

      if (idleFade <= 0.01 && points.current.length > 0) {
        points.current = [];
      }

      // ── 1. Large ambient light pool — always centered on cursor ──────────
      // This is the "emitting light in all directions" part
      if (hasEntered.current && idleFade > 0) {
        // Outermost soft glow — huge radius, very faint
        const outerGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 500);
        outerGrad.addColorStop(0, rgba(252, 163, 17, 0.035 * idleFade));
        outerGrad.addColorStop(0.3, rgba(252, 163, 17, 0.017 * idleFade));
        outerGrad.addColorStop(0.7, rgba(252, 163, 17, 0.007 * idleFade));
        outerGrad.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, 500, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Mid glow — medium radius, moderate brightness
        const midGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 240);
        midGrad.addColorStop(0, rgba(252, 190, 60, 0.09 * idleFade));
        midGrad.addColorStop(0.4, rgba(252, 163, 17, 0.05 * idleFade));
        midGrad.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, 240, 0, Math.PI * 2);
        ctx.fillStyle = midGrad;
        ctx.fill();

        // Inner hot core
        const innerGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 72);
        innerGrad.addColorStop(0, rgba(255, 230, 140, 0.22 * idleFade));
        innerGrad.addColorStop(0.5, rgba(252, 163, 17, 0.1 * idleFade));
        innerGrad.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, 72, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();
      }

      // ── 2. Age + prune trail points ───────────────────────────────────────
      for (const p of points.current) p.age++;
      points.current = points.current.filter(p => p.age < TRAIL_LIFETIME);

      // ── 3. Draw trail as fat glowing blobs along the path ─────────────────
      if (points.current.length >= 2) {
        // Draw from oldest to newest so head renders on top
        for (let i = 0; i < points.current.length; i++) {
          const p = points.current[i];
          const t = i / (points.current.length - 1); // 0=tail, 1=head
          const lifeRatio = 1 - p.age / TRAIL_LIFETIME;
          const alpha = Math.pow(t, 0.75) * lifeRatio * idleFade;

          // Each trail point gets its own radial glow — this makes it "fat" and blobby
          const blobRadius = 16 + t * 56; // 16px at tail, 72px at head
          const blobGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, blobRadius);

          // Color: deeper orange at tail, bright yellow-white at head
          const r = 252;
          const g = Math.round(163 + t * 60); // 163→223 (more yellow toward head)
          const b = Math.round(17 + t * 100); // 17→117 (warmer at head)

          blobGrad.addColorStop(0, rgba(r, g, b, alpha * 0.32));
          blobGrad.addColorStop(0.5, rgba(r, g, b, alpha * 0.14));
          blobGrad.addColorStop(1,   "transparent");

          ctx.beginPath();
          ctx.arc(p.x, p.y, blobRadius, 0, Math.PI * 2);
          ctx.fillStyle = blobGrad;
          ctx.fill();
        }

      }

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,           // BEHIND all page content
        mixBlendMode: "screen", // additive blending — glows on dark, invisible on light
      }}
    />
  );
}
