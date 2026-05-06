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
  const activeTouchPointerId = useRef<number | null>(null);
  const isCoarsePointer = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coarsePointerQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    isCoarsePointer.current = coarsePointerQuery.matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const updatePointerMode = (event: MediaQueryListEvent) => {
      isCoarsePointer.current = event.matches;
    };
    coarsePointerQuery.addEventListener("change", updatePointerMode);

    const pushPoint = (now: number) => {
      const pushInterval = isCoarsePointer.current ? 20 : 12;
      const maxPoints = isCoarsePointer.current ? 72 : 120;
      if (now - lastPush.current <= pushInterval) return;

      points.current.push({ x: glowPos.current.x, y: glowPos.current.y, age: 0 });
      lastPush.current = now;
      if (points.current.length > maxPoints) points.current.shift();
    };

    const updatePosition = (clientX: number, clientY: number, now: number) => {
      mouse.current = { x: clientX, y: clientY };
      hasEntered.current = true;
      lastMoveAt.current = now;
      pushPoint(now);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      activeTouchPointerId.current = e.pointerId;
      mouse.current = { x: e.clientX, y: e.clientY };
      glowPos.current = { x: e.clientX, y: e.clientY };
      hasEntered.current = true;

      const now = performance.now();
      lastMoveAt.current = now;
      points.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      lastPush.current = now;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        if (activeTouchPointerId.current !== e.pointerId) return;
        updatePosition(e.clientX, e.clientY, performance.now());
        return;
      }

      updatePosition(e.clientX, e.clientY, performance.now());
    };

    const clearTouchPointer = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if (activeTouchPointerId.current !== e.pointerId) return;
      activeTouchPointerId.current = null;
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", clearTouchPointer, { passive: true });
    window.addEventListener("pointercancel", clearTouchPointer, { passive: true });

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
      const isMobileMode = isCoarsePointer.current;
      const trailLifetime = isMobileMode ? 36 : 48;
      const outerRadius = isMobileMode ? 320 : 500;
      const midRadius = isMobileMode ? 180 : 240;
      const innerRadius = isMobileMode ? 54 : 72;

      if (idleFade <= 0.01 && points.current.length > 0) {
        points.current = [];
      }

      // ── 1. Large ambient light pool — always centered on cursor ──────────
      // This is the "emitting light in all directions" part
      if (hasEntered.current && idleFade > 0) {
        // Outermost soft glow — huge radius, very faint
        const outerGrad = ctx.createRadialGradient(mx, my, 0, mx, my, outerRadius);
        outerGrad.addColorStop(0, rgba(252, 163, 17, 0.035 * idleFade));
        outerGrad.addColorStop(0.3, rgba(252, 163, 17, 0.017 * idleFade));
        outerGrad.addColorStop(0.7, rgba(252, 163, 17, 0.007 * idleFade));
        outerGrad.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, outerRadius, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Mid glow — medium radius, moderate brightness
        const midGrad = ctx.createRadialGradient(mx, my, 0, mx, my, midRadius);
        midGrad.addColorStop(0, rgba(252, 190, 60, 0.09 * idleFade));
        midGrad.addColorStop(0.4, rgba(252, 163, 17, 0.05 * idleFade));
        midGrad.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, midRadius, 0, Math.PI * 2);
        ctx.fillStyle = midGrad;
        ctx.fill();

        // Inner hot core
        const innerGrad = ctx.createRadialGradient(mx, my, 0, mx, my, innerRadius);
        innerGrad.addColorStop(0, rgba(255, 230, 140, 0.22 * idleFade));
        innerGrad.addColorStop(0.5, rgba(252, 163, 17, 0.1 * idleFade));
        innerGrad.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(mx, my, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();
      }

      // ── 2. Age + prune trail points ───────────────────────────────────────
      for (const p of points.current) p.age++;
      points.current = points.current.filter((p) => p.age < trailLifetime);

      // ── 3. Draw trail as fat glowing blobs along the path ─────────────────
      if (points.current.length >= 2) {
        // Draw from oldest to newest so head renders on top
        for (let i = 0; i < points.current.length; i++) {
          const p = points.current[i];
          const t = i / (points.current.length - 1); // 0=tail, 1=head
          const lifeRatio = 1 - p.age / trailLifetime;
          const alpha = Math.pow(t, 0.75) * lifeRatio * idleFade;

          // Each trail point gets its own radial glow — this makes it "fat" and blobby
          const blobRadius = isMobileMode ? 12 + t * 40 : 16 + t * 56;
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

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId.current);
        return;
      }

      rafId.current = requestAnimationFrame(draw);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    rafId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId.current);
      coarsePointerQuery.removeEventListener("change", updatePointerMode);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", clearTouchPointer);
      window.removeEventListener("pointercancel", clearTouchPointer);
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
