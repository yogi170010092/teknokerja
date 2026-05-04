import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

const CursorParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkShouldEnable = () => {
      if (typeof window === "undefined") return false;
      if (window.innerWidth < 1024) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      const memory = (navigator as any).deviceMemory;
      if (memory && memory < 4) return false;
      const cores = navigator.hardwareConcurrency;
      if (cores && cores < 4) return false;
      return true;
    };

    setIsEnabled(checkShouldEnable());
    const handleResize = () => setIsEnabled(checkShouldEnable());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createParticle = (x: number, y: number): Particle => ({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      life: 0,
      maxLife: 50 + Math.random() * 40,
      size: 1.5 + Math.random() * 2.5,
      // Lavender hues: 250-280
      hue: 250 + Math.random() * 30,
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        mouseRef.current = { x, y };
        if (particlesRef.current.length < 100) {
          const count = 2 + Math.floor(Math.random() * 2);
          for (let i = 0; i < count; i++) {
            particlesRef.current.push(createParticle(x, y));
          }
        }
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        const lifeRatio = 1 - p.life / p.maxLife;
        if (lifeRatio > 0) {
          const alpha = lifeRatio * 0.35;
          // Draw soft glow
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * lifeRatio * 3);
          gradient.addColorStop(0, `hsla(${p.hue}, 70%, 75%, ${alpha})`);
          gradient.addColorStop(0.5, `hsla(${p.hue}, 60%, 80%, ${alpha * 0.4})`);
          gradient.addColorStop(1, `hsla(${p.hue}, 50%, 85%, 0)`);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * lifeRatio * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 82%, ${alpha * 1.2})`;
          ctx.fill();
        }
        return p.life < p.maxLife;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto z-0"
      style={{ mixBlendMode: "screen", opacity: 0.9 }}
      aria-hidden="true"
    />
  );
};

export default CursorParticles;
