import { useEffect, useRef } from "react";
import type { RoyalSignInPhase } from "@/hooks/use-royal-sign-in-animation";

type ParticleState = "float" | "converge" | "burst" | "rise" | "trail" | "absorb";

const COLORS = ["#C9933A", "#F5C842", "#FFD700"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function getLogoCenter() {
  const logo = document.querySelector(".royal-signin-logo");
  if (!logo) return { x: 56, y: 48 };
  const rect = logo.getBoundingClientRect();
  return { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 };
}

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
  trailDelay = 0;

  constructor(private w: number, private h: number) {
    this.reset(true);
  }

  setViewport(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  reset(initial: boolean) {
    this.x = rand(this.w * 0.38, this.w * 0.62);
    this.y = initial ? rand(this.h * 0.42, this.h * 0.72) : this.h * 0.58 + rand(-20, 20);
    this.baseX = this.x;
    this.vx = rand(-0.2, 0.2);
    this.vy = rand(-0.45, -0.2);
    this.radius = rand(1, 2.5);
    this.opacity = rand(0.25, 0.7);
    this.fadeDir = Math.random() < 0.5 ? -1 : 1;
    this.color = COLORS[(Math.random() * COLORS.length) | 0];
    this.phase = rand(0, Math.PI * 2);
    this.px = this.x;
    this.py = this.y;
    this.life = 0;
    this.trailDelay = rand(0, 40);
  }

  toBurst() {
    this.state = "burst";
    this.x = this.w / 2;
    this.y = this.h / 2;
    const a = rand(0, Math.PI * 2);
    const s = rand(2.5, 5.5);
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;
    this.opacity = rand(0.5, 0.85);
  }

  /** Courtyard reveal — sparks rise from the marble grounds in a slow spiral. */
  toRise() {
    this.state = "rise";
    this.x = rand(this.w * 0.15, this.w * 0.85);
    this.baseX = this.x;
    this.y = this.h + rand(0, this.h * 0.25);
    this.vy = rand(-4.5, -2.2);
    this.radius = rand(1, 2.8);
    this.opacity = rand(0.4, 0.9);
    this.phase = rand(0, Math.PI * 2);
    this.life = 0;
    this.px = this.x;
    this.py = this.y;
  }

  update() {
    this.px = this.x;
    this.py = this.y;
    this.life += 1;

    if (this.state === "float") {
      this.phase += 0.01;
      this.x = this.baseX + Math.sin(this.phase) * 6;
      this.y += this.vy * 0.7;
      this.opacity += this.fadeDir * 0.002;
      if (this.opacity < 0.2) { this.opacity = 0.2; this.fadeDir = 1; }
      if (this.opacity > 0.65) { this.opacity = 0.65; this.fadeDir = -1; }
      if (this.y < -10) this.reset(false);
    } else if (this.state === "converge") {
      const tx = this.w / 2;
      const ty = this.h / 2;
      this.x += (tx - this.x) * 0.09;
      this.y += (ty - this.y) * 0.09;
      this.opacity = Math.min(1, this.opacity + 0.018);
    } else if (this.state === "burst") {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 1.006;
      this.vy *= 1.006;
      this.opacity -= 0.02;
      if (this.opacity <= 0) this.opacity = 0;
    } else if (this.state === "rise") {
      this.y += this.vy;
      this.x = this.baseX + Math.sin(this.life * 0.045 + this.phase) * 36;
      this.opacity = Math.min(0.95, this.opacity + 0.01);
      if (this.y < -20) this.toRise();
    } else if (this.state === "trail") {
      if (this.trailDelay > 0) {
        this.trailDelay -= 1;
        return;
      }
      const { x: tx, y: ty } = getLogoCenter();
      this.x += (tx - this.x) * 0.1;
      this.y += (ty - this.y) * 0.1;
      this.x += Math.sin((this.life + this.phase * 8) * 0.12) * 2;
      this.opacity = Math.max(0, this.opacity - 0.006);
    } else if (this.state === "absorb") {
      const { x: tx, y: ty } = getLogoCenter();
      this.x += (tx - this.x) * 0.18;
      this.y += (ty - this.y) * 0.18;
      this.radius = Math.max(0.3, this.radius * 0.94);
      this.opacity = Math.max(0, this.opacity - 0.035);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.opacity <= 0.01) return;

    if (this.state === "trail" || this.state === "absorb") {
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = this.opacity * 0.45;
      ctx.lineWidth = this.radius;
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const PARTICLE_STATE_BY_PHASE: Partial<Record<RoyalSignInPhase, ParticleState>> = {
  seal: "float",
  activation: "float",
  ready: "float",
  dissolve: "converge",
  "doors-reveal": "converge",
  "doors-open": "burst",
  forward: "trail",
  courtyard: "rise",
  particles: "trail",
  logo: "absorb",
};

const VISIBLE_PHASES: RoyalSignInPhase[] = [
  "seal",
  "activation",
  "ready",
  "dissolve",
  "doors-reveal",
  "doors-open",
  "forward",
  "courtyard",
  "particles",
  "logo",
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
  const burstBoostedRef = useRef(false);

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

    const { w, h } = sizeRef.current;
    particlesRef.current = Array.from({ length: 96 }, () => new RoyalParticle(w, h));

    const loop = () => {
      const { w: vw, h: vh } = sizeRef.current;
      ctx.clearRect(0, 0, vw, vh);
      const activePhase = phaseRef.current;
      const targetState = PARTICLE_STATE_BY_PHASE[activePhase];

      if (targetState && VISIBLE_PHASES.includes(activePhase)) {
        if (activePhase === "doors-open" && !burstBoostedRef.current) {
          burstBoostedRef.current = true;
          for (let i = 0; i < 48; i++) {
            const p = new RoyalParticle(vw, vh);
            p.toBurst();
            particlesRef.current.push(p);
          }
        }

        let alive = 0;
        for (const p of particlesRef.current) {
          if (p.state !== targetState) {
            if (targetState === "burst") {
              p.toBurst();
            } else if (targetState === "rise") {
              p.toRise();
            } else {
              p.state = targetState;
            }
          }
          p.update();
          p.draw(ctx);
          if (p.opacity > 0.01) alive += 1;
        }

        // drop dead burst motes so they don't linger
        if (activePhase === "forward" || activePhase === "particles") {
          particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0.02 || p.state === "trail");
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

  const visible = VISIBLE_PHASES.includes(phase);

  return (
    <canvas
      ref={canvasRef}
      className="royal-signin-particle-canvas"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    />
  );
}
