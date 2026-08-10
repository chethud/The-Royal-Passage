/**
 * Vertical CircularGallery (React Bits / ogl), adapted for Mysore Trail:
 * - Scrolls vertically in a circular bend
 * - Driven by `activeIndex` from itinerary scroll (page wheel is not captured)
 */
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";
import { useEffect, useRef } from "react";
import "./CircularGallery.css";

export type CircularGalleryItem = {
  image: string;
  text: string;
};

type CircularGalleryProps = {
  items?: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  /** Sync gallery to this index (itinerary active stop). */
  activeIndex?: number;
  /** Fired when the user lands on a photo (drag / snap). */
  onIndexChange?: (index: number) => void;
};

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

type ScrollState = { ease: number; current: number; target: number; last: number };

class Media {
  extra = 0;
  geometry: Plane;
  gl: OGLRenderingContext;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  bend: number;
  borderRadius: number;
  program!: Program;
  plane!: Mesh;
  scale = 1;
  padding = 1.2;
  height = 1;
  heightTotal = 1;
  y = 0;
  speed = 0;
  isBefore = false;
  isAfter = false;

  constructor(opts: {
    geometry: Plane;
    gl: OGLRenderingContext;
    image: string;
    index: number;
    length: number;
    renderer: Renderer;
    scene: Transform;
    screen: { width: number; height: number };
    viewport: { width: number; height: number };
    bend: number;
    borderRadius: number;
  }) {
    this.geometry = opts.geometry;
    this.gl = opts.gl;
    this.image = opts.image;
    this.index = opts.index;
    this.length = opts.length;
    this.renderer = opts.renderer;
    this.scene = opts.scene;
    this.screen = opts.screen;
    this.viewport = opts.viewport;
    this.bend = opts.bend;
    this.borderRadius = opts.borderRadius;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.02 + uSpeed * 0.08);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  /** Vertical scroll: move along Y, bend along X. */
  update(scroll: ScrollState, direction: "up" | "down") {
    // polarity -1 → higher indices sit below; advancing lifts them into center
    this.plane.position.y = this.y - scroll.current - this.extra;

    const y = this.plane.position.y;
    const H = this.viewport.height / 2;

    if (this.bend === 0) {
      this.plane.position.x = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveY = Math.min(Math.abs(y), H);
      const arc = R - Math.sqrt(Math.max(R * R - effectiveY * effectiveY, 0));
      if (this.bend > 0) {
        this.plane.position.x = -arc;
        this.plane.rotation.z = Math.sign(y) * Math.asin(Math.min(effectiveY / R, 1));
      } else {
        this.plane.position.x = arc;
        this.plane.rotation.z = -Math.sign(y) * Math.asin(Math.min(effectiveY / R, 1));
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.y / 2;
    const viewportOffset = this.viewport.height / 2;
    this.isBefore = this.plane.position.y + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.y - planeOffset > viewportOffset;
    if (direction === "down" && this.isBefore) {
      this.extra -= this.heightTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "up" && this.isAfter) {
      this.extra += this.heightTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({
    screen,
    viewport,
  }: {
    screen?: { width: number; height: number };
    viewport?: { width: number; height: number };
  } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;

    this.scale = this.screen.height / 1500;
    // Extra-wide landscape photo
    this.plane.scale.y = (this.viewport.height * (1000 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (2100 * this.scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = Math.max(this.plane.scale.y * 0.65, 2.6);
    this.height = this.plane.scale.y + this.padding;
    this.heightTotal = this.height * this.length;
    // Text reads top → bottom; photos stack the opposite way (next below)
    this.y = -this.height * this.index;
  }
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: ScrollState;
  /** Match text fade (~0.85s) so photo and copy move together */
  animDurationMs = 850;
  animFrom = 0;
  animTo = 0;
  animStart = 0;
  animating = false;
  renderer!: Renderer;
  gl!: OGLRenderingContext;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: CircularGalleryItem[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf = 0;
  isDown = false;
  start = 0;
  scrollPosition = 0;
  itemCount = 0;
  lastEmittedIndex = -1;
  onIndexChange?: (index: number) => void;
  suppressEmit = false;

  boundOnResize!: () => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 2.5,
      borderRadius = 0.05,
      scrollSpeed = 2,
      scrollEase = 0.06,
      onIndexChange,
    }: {
      items?: CircularGalleryItem[];
      bend?: number;
      borderRadius?: number;
      scrollSpeed?: number;
      scrollEase?: number;
      onIndexChange?: (index: number) => void;
    } = {},
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onIndexChange = onIndexChange;
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 40;
    this.camera.position.z = 15.5;
  }

  createScene() {
    this.scene = new Transform();
    this.scene.position.y = 0;
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 40,
      widthSegments: 40,
    });
  }

  createMedias(
    items: CircularGalleryItem[] | undefined,
    bend: number,
    borderRadius: number,
  ) {
    const galleryItems =
      items && items.length
        ? items
        : [{ image: "https://picsum.photos/seed/1/800/1000", text: "Place" }];
    // Single set — syncs cleanly with itinerary indices (no infinite duplicate)
    this.mediasImages = galleryItems;
    this.itemCount = galleryItems.length;
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        bend,
        borderRadius,
      });
    });
  }

  /** Snap gallery so `index` is centered (driven by itinerary scroll). */
  scrollToIndex(index: number, silent = true) {
    if (!this.medias[0] || this.itemCount <= 0) return;
    const i = ((index % this.itemCount) + this.itemCount) % this.itemCount;
    const step = this.medias[0].height;
    const next = -i * step;
    this.lastEmittedIndex = i;
    this.suppressEmit = silent;

    if (Math.abs(next - this.scroll.target) < 0.0001) {
      this.scroll.target = next;
      return;
    }

    this.animFrom = this.scroll.current;
    this.animTo = next;
    this.scroll.target = next;
    this.animStart = performance.now();
    this.animating = true;
  }

  emitIndex(i: number) {
    if (this.suppressEmit) {
      this.suppressEmit = false;
      return;
    }
    if (i === this.lastEmittedIndex) return;
    this.lastEmittedIndex = i;
    this.onIndexChange?.(i);
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.suppressEmit = false;
    this.scrollPosition = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientY : e.clientY;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const distance = (this.start - y) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scrollPosition - distance;
  }

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }

  onCheck() {
    if (!this.medias[0]) return;
    const step = this.medias[0].height;
    if (step <= 0) return;
    const itemIndex = Math.round(this.scroll.target / -step);
    const i = Math.max(0, Math.min(this.itemCount - 1, itemIndex));
    this.scrollToIndex(i, false);
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    this.medias.forEach((media) =>
      media.onResize({ screen: this.screen, viewport: this.viewport }),
    );
    // Keep the same stop centered after layout changes
    if (this.medias[0] && this.itemCount > 0) {
      const step = this.medias[0].height;
      if (step > 0) {
        const i = Math.round(Math.abs(this.scroll.target) / step);
        const clamped = Math.max(0, Math.min(this.itemCount - 1, i));
        const next = -clamped * step;
        this.scroll.target = next;
        this.scroll.current = next;
        this.animating = false;
      }
    }
  }

  update() {
    if (this.animating) {
      const t = Math.min(1, (performance.now() - this.animStart) / this.animDurationMs);
      // Smoothstep — same ease feel as CSS ease
      const eased = t * t * (3 - 2 * t);
      this.scroll.current = this.animFrom + (this.animTo - this.animFrom) * eased;
      if (t >= 1) {
        this.scroll.current = this.animTo;
        this.animating = false;
      }
    } else {
      this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    }

    const direction = this.scroll.current > this.scroll.last ? "down" : "up";
    this.medias.forEach((media) => media.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    window.addEventListener("resize", this.boundOnResize);
    // No drag/wheel on the gallery — itinerary text scroll drives activeIndex only
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);
    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.gl.canvas as HTMLCanvasElement);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 2.5,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.06,
  activeIndex = 0,
  onIndexChange,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const onIndexChangeRef = useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(containerRef.current, {
      items,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase,
      onIndexChange: (index) => onIndexChangeRef.current?.(index),
    });
    appRef.current = app;
    app.scrollToIndex(activeIndex, true);
    return () => {
      app.destroy();
      appRef.current = null;
    };
    // Recreate when item set / look changes — index sync is separate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  useEffect(() => {
    appRef.current?.scrollToIndex(activeIndex, true);
  }, [activeIndex]);

  // Re-snap after layout settles so photo matches the active stop height
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      appRef.current?.scrollToIndex(activeIndex, true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeIndex, items]);

  return (
    <div
      className="circular-gallery"
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular destination gallery"
    />
  );
}
