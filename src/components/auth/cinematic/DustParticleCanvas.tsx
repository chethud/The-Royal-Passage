import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  phase: number;
};

function createMotes(count: number, width: number, height: number): Mote[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.6 + Math.random() * 2.2,
    opacity: 0.08 + Math.random() * 0.35,
    driftX: (Math.random() - 0.5) * 0.25,
    driftY: -0.08 - Math.random() * 0.22,
    phase: Math.random() * Math.PI * 2,
  }));
}

export function DustParticleCanvas({ dimmed = false }: { dimmed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motesRef.current.length === 0) {
        motesRef.current = createMotes(Math.min(48, Math.floor((width * height) / 18000)), width, height);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const intensity = dimmed ? 0.45 : 1;
      for (const mote of motesRef.current) {
        mote.x += mote.driftX * (0.6 + dt * 18);
        mote.y += mote.driftY * (0.6 + dt * 18);
        mote.phase += dt * 0.7;
        if (mote.y < -8) mote.y = height + 8;
        if (mote.x < -8) mote.x = width + 8;
        if (mote.x > width + 8) mote.x = -8;

        const flicker = 0.55 + Math.sin(mote.phase) * 0.45;
        const alpha = mote.opacity * flicker * intensity;
        const gradient = ctx.createRadialGradient(mote.x, mote.y, 0, mote.x, mote.y, mote.size * 3);
        gradient.addColorStop(0, `rgba(255, 217, 128, ${alpha})`);
        gradient.addColorStop(0.45, `rgba(212, 175, 55, ${alpha * 0.55})`);
        gradient.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [dimmed]);

  return (
    <canvas
      ref={canvasRef}
      className="royal-signin-particle-canvas"
      aria-hidden
    />
  );
}
