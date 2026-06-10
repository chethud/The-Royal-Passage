import { useEffect, useRef } from "react";
import type { RoyalSignInPhase } from "@/hooks/use-royal-sign-in-animation";

type ParticleState = "float" | "converge" | "burst" | "trail";

const COLORS = ["#C9933A", "#F5C842", "#FFD700"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

class RoyalParticle {
  x = 0;
  y = 0;
  px = 0;
  py = 0;
  baseX = 0;
  vx = 0;
  vy = 0;
  radius = 1;
  opacity = 0.5;
  fadeDir = 1;
  color = COLORS[0];
  state: ParticleState = "float";
  phase = 0;
  life = 0;

  constructor(private w: number, private h: number) {
    this.reset(true);
  }

  setViewport(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  reset(initial: boolean) {
    this.x = rand(this.w * 0.3, this.w * 0.7);
    this.y = initial ? rand(this.h * 0.35, this.h * 0.78) : this.h * 0.62 + rand(-30, 30);
    this.baseX = this.x;
    this.vx = rand(-0.3, 0.3);
    this.vy = rand(-0.7, -0.25);
    this.radius = rand(1, 3);
    this.opacity = rand(0.3, 0.9);
    this.fadeDir = Math.random() < 0.5 ? -1 : 1;
    this.color = COLORS[(Math.random() * COLORS.length) | 0];
    this.phase = rand(0, Math.PI * 2);
    this.px = this.x;
    this.py = this.y;
    this.life = 0;
  }

  toBurst() {
    this.state = "burst";
    this.x = this.w / 2;
    this.y = this.h / 2;
    const a = rand(0, Math.PI * 2);
    const s = rand(2, 7);
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;
    this.opacity = rand(0.4, 0.9);
  }

  update() {
    this.px = this.x;
    this.py = this.y;
    this.life += 1;

    if (this.state === "float") {
      this.phase += 0.012;
      this.x = this.baseX + Math.sin(this.phase) * 10;
      this.y += this.vy * 0.85;
      this.opacity += this.fadeDir * 0.003;
      if (this.opacity < 0.3) { this.opacity = 0.3; this.fadeDir = 1; }
      if (this.opacity > 0.9) { this.opacity = 0.9; this.fadeDir = -1; }
      if (this.y < -10) this.reset(false);
    } else if (this.state === "converge") {
      const tx = this.w / 2;
      const ty = this.h / 2;
      this.x += (tx - this.x) * 0.055;
      this.y += (ty - this.y) * 0.055;
      this.opacity = Math.min(1, this.opacity + 0.012);
    } else if (this.state === "burst") {
      this.x += this.vx * 0.92;
      this.y += this.vy * 0.92;
      this.vx *= 1.008;
      this.vy *= 1.008;
      this.opacity -= 0.008;
      if (this.opacity <= 0) this.toBurst();
    } else if (this.state === "trail") {
      const tx = 46;
      const ty = 40;
      const cx = this.x + (tx - this.x) * 0.045;
      const cy = this.y + (ty - this.y) * 0.045;
      this.x = cx + Math.sin((this.life + this.phase * 10) * 0.1) * 4;
      this.y = cy;
      this.opacity = Math.max(0, this.opacity - 0.0025);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.state === "trail") {
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = this.opacity * 0.5;
      ctx.lineWidth = this.radius;
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const PARTICLE_STATE_BY_PHASE: Partial<Record<RoyalSignInPhase, ParticleState>> = {
  idle: "float",
  seal: "float",
  activation: "float",
  ready: "float",
  dissolve: "converge",
  "doors-reveal": "burst",
  "doors-open": "burst",
  forward: "burst",
  courtyard: "burst",
  particles: "trail",
};

const ACTIVE_PHASES: RoyalSignInPhase[] = [
  "idle",
  "seal",
  "activation",
  "ready",
  "dissolve",
  "doors-reveal",
  "doors-open",
  "forward",
  "courtyard",
  "particles",
];

type Props = {
  phase: RoyalSignInPhase;
  reducedMotion: boolean;
};

export function RoyalParticleCanvas({ phase, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<RoyalParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const doubledRef = useRef(false);

  // keep latest phase available to the animation loop without restarting it
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current.forEach((p) => p.setViewport(w, h));
    };
    resize();
    window.addEventListener("resize", resize);

    // spawn 80 particles
    const { w, h } = sizeRef.current;
    particlesRef.current = Array.from({ length: 80 }, () => new RoyalParticle(w, h));

    const loop = () => {
      const { w: vw, h: vh } = sizeRef.current;
      ctx.clearRect(0, 0, vw, vh);
      const activePhase = phaseRef.current;
      const targetState = PARTICLE_STATE_BY_PHASE[activePhase];

      if (targetState) {
        for (const p of particlesRef.current) {
          // burst particles keep their own velocity; only (re)assign state on change
          if (p.state !== targetState) {
            if (targetState === "burst") {
              p.toBurst();
            } else {
              p.state = targetState;
            }
          }
        }
        // double density once when doors first open
        if ((activePhase === "doors-open" || activePhase === "doors-reveal") && !doubledRef.current) {
          doubledRef.current = true;
          const extra = particlesRef.current.length;
          for (let i = 0; i < extra; i++) {
            const p = new RoyalParticle(vw, vh);
            p.toBurst();
            particlesRef.current.push(p);
          }
        }
        for (const p of particlesRef.current) {
          p.update();
          p.draw(ctx);
        }
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  const visible = ACTIVE_PHASES.includes(phase);

  return (
    <canvas
      ref={canvasRef}
      className="royal-signin-particle-canvas"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    />
  );
}
