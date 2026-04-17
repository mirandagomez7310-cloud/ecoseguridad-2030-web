"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion, useInView, useScroll, useTransform, AnimatePresence,
  useMotionValue, useSpring, useAnimation, animate
} from "framer-motion";
import {
  Recycle, Shield, Users, TrendingUp, Leaf, Zap, CheckCircle,
  ArrowRight, ChevronDown, Globe, Heart, Building2,
  FlaskConical, Rocket, BarChart3, Menu, X, Target, Magnet,
  Hand, Award, Layers, Clock, Star, ChevronRight, Download, FileText, BarChart2, BookOpen
} from "lucide-react";

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-family: 'Inter', system-ui, sans-serif; }
  body { background: #000; color: #fff; cursor: none; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #E85D04; border-radius: 2px; }

  /* Custom cursor */
  .cursor-dot {
    width: 8px; height: 8px;
    background: #E85D04;
    border-radius: 50%;
    position: fixed; top: 0; left: 0;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.2s, height 0.2s, background 0.2s;
    mix-blend-mode: difference;
  }
  .cursor-ring {
    width: 36px; height: 36px;
    border: 1.5px solid rgba(232,93,4,0.5);
    border-radius: 50%;
    position: fixed; top: 0; left: 0;
    pointer-events: none; z-index: 9998;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, border-color 0.3s;
  }
  body:hover .cursor-dot { }
  a:hover ~ .cursor-dot, button:hover ~ .cursor-dot { width: 16px; height: 16px; }

  /* Marquee */
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track { display: flex; animation: marquee 25s linear infinite; width: max-content; }
  .marquee-track:hover { animation-play-state: paused; }

  /* Float */
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  .floating { animation: float 4s ease-in-out infinite; }

  /* Pulse */
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.4); opacity: 0; }
  }

  /* Shimmer */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Glitch */
  @keyframes glitch1 {
    0%,100%{clip-path:inset(0 0 98% 0)} 20%{clip-path:inset(30% 0 50% 0)}
    40%{clip-path:inset(60% 0 20% 0)} 60%{clip-path:inset(80% 0 5% 0)}
    80%{clip-path:inset(10% 0 80% 0)}
  }
  @keyframes glitch2 {
    0%,100%{clip-path:inset(50% 0 40% 0)} 20%{clip-path:inset(10% 0 70% 0)}
    40%{clip-path:inset(80% 0 10% 0)} 60%{clip-path:inset(30% 0 50% 0)}
    80%{clip-path:inset(60% 0 20% 0)}
  }
  .glitch-wrap { position: relative; display: inline-block; }
  .glitch-wrap::before, .glitch-wrap::after {
    content: attr(data-text);
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    font-size: inherit; font-weight: inherit; color: inherit; letter-spacing: inherit;
  }
  .glitch-wrap::before {
    color: #E85D04; left: 2px;
    animation: glitch1 3.5s infinite linear;
    opacity: 0.7;
  }
  .glitch-wrap::after {
    color: #ff9500; left: -2px;
    animation: glitch2 3.5s infinite linear;
    opacity: 0.5;
  }

  /* Scan line */
  @keyframes scan { 0%{top:0} 100%{top:100%} }
  .scan-line {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #E85D04, transparent);
    animation: scan 3s linear infinite;
    pointer-events: none;
  }

  /* Card 3D tilt */
  .tilt-card { transform-style: preserve-3d; will-change: transform; }

  .spec-card {
    background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 16px;
    cursor: pointer; transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
    position: relative; overflow: hidden;
  }
  .spec-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, #E85D0408, transparent 50%);
    opacity: 0; transition: opacity 0.3s;
  }
  .spec-card:hover { border-color: #E85D04; background: #110700; }
  .spec-card:hover::before { opacity: 1; }

  .orange-btn {
    background: #E85D04; color: #fff; border: none;
    border-radius: 8px; font-weight: 700; font-size: 16px;
    cursor: none; transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
    letter-spacing: -0.01em; position: relative; overflow: hidden;
  }
  .orange-btn::after {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.15), transparent 60%);
    opacity: 0; transition: opacity 0.2s;
  }
  .orange-btn:hover::after { opacity: 1; }
  .orange-btn:hover { background: #ff6d14; transform: translateY(-3px); box-shadow: 0 16px 50px rgba(232,93,4,0.45); }
  .orange-btn:active { transform: translateY(0); }

  .ghost-btn {
    background: transparent; color: #fff; border: 1px solid #2a2a2a;
    border-radius: 8px; font-weight: 600; font-size: 15px; cursor: none;
    transition: all 0.25s ease; position: relative; overflow: hidden;
  }
  .ghost-btn::before {
    content: ''; position: absolute; inset: 0;
    background: #E85D04; transform: translateX(-101%);
    transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .ghost-btn:hover::before { transform: translateX(0); }
  .ghost-btn:hover { color: #fff; border-color: #E85D04; }
  .ghost-btn span { position: relative; z-index: 1; }

  .nav-link {
    color: #666; font-size: 14px; font-weight: 500; text-decoration: none;
    transition: color 0.2s; padding: 6px 12px; border-radius: 6px;
    cursor: none; position: relative;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: 2px; left: 12px; right: 12px;
    height: 1px; background: #E85D04; transform: scaleX(0);
    transition: transform 0.25s ease; transform-origin: left;
  }
  .nav-link:hover { color: #fff; }
  .nav-link:hover::after { transform: scaleX(1); }

  .review-card {
    background: #0a0a0a; border: 1px solid #141414; border-radius: 20px;
    padding: 32px; transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    position: relative; overflow: hidden; cursor: none;
  }
  .review-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, #E85D0406, transparent 60%);
    opacity: 0; transition: opacity 0.3s;
  }
  .review-card:hover { border-color: #E85D0455; transform: translateY(-6px) scale(1.01); box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(232,93,4,0.08); }
  .review-card:hover::before { opacity: 1; }

  .stat-item { border-right: 1px solid #111; }
  .stat-item:last-child { border-right: none; }

  .phase-tab {
    background: transparent; border: 1px solid #1d1d1d; border-radius: 10px;
    color: #555; cursor: none; transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
    font-weight: 600; font-size: 13px; padding: 10px 20px; position: relative; overflow: hidden;
  }
  .phase-tab::before {
    content: ''; position: absolute; inset: 0; background: #E85D04;
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .phase-tab.active::before, .phase-tab:hover::before { transform: scaleX(1); }
  .phase-tab.active, .phase-tab:hover { border-color: #E85D04; color: #fff; }
  .phase-tab span { position: relative; z-index: 1; }

  .hidden-mobile { display: flex; }
  .mobile-only { display: none; }
  @media (max-width: 768px) {
    .hidden-mobile { display: none !important; }
    .mobile-only { display: block !important; }
    body { cursor: auto; }
    .cursor-dot, .cursor-ring { display: none; }
  }

  /* Gradient shimmer text */
  .shimmer-text {
    background: linear-gradient(90deg, #fff 0%, #E85D04 30%, #ff9500 50%, #E85D04 70%, #fff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  /* Particle */
  @keyframes particle-float {
    0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.6; }
    100% { transform: translateY(-120vh) translateX(var(--tx)) rotate(720deg); opacity: 0; }
  }
  .particle {
    position: absolute; border-radius: 50%;
    background: #E85D04;
    animation: particle-float var(--dur) ease-in infinite;
    animation-delay: var(--delay);
  }
`;

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return [ref, inView] as const;
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 120, damping: 22 });
  const ringY = useSpring(dotY, { stiffness: 120, damping: 22 });
  const [clicked, setClicked] = useState(false);
  const [onLink, setOnLink] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { dotX.set(e.clientX); dotY.set(e.clientY); };
    const down = () => setClicked(true);
    const up = () => setClicked(false);
    const enter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setOnLink(t.tagName === 'A' || t.tagName === 'BUTTON' || t.closest('button') !== null || t.closest('a') !== null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('mouseover', enter);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mousedown', down); window.removeEventListener('mouseup', up); window.removeEventListener('mouseover', enter); };
  }, []);

  return (
    <>
      <motion.div className="cursor-dot" style={{ x: dotX, y: dotY, scale: clicked ? 0.5 : onLink ? 2 : 1, transition: 'scale 0.15s' }} />
      <motion.div className="cursor-ring" style={{ x: ringX, y: ringY, scale: clicked ? 1.5 : onLink ? 1.8 : 1, borderColor: onLink ? '#E85D04' : 'rgba(232,93,4,0.5)' }} />
    </>
  );
}

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #E85D04, #ff9500)',
        transformOrigin: '0%', scaleX, zIndex: 200
      }}
    />
  );
}

// ─── Particles ────────────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    dur: Math.random() * 12 + 8,
    delay: Math.random() * 8,
    tx: (Math.random() - 0.5) * 200,
    opacity: Math.random() * 0.4 + 0.1,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size, left: `${p.left}%`, bottom: 0,
          opacity: p.opacity,
          '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, '--tx': `${p.tx}px`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

// ─── Tilt Card ────────────────────────────────────────────────────────────────
function TiltCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 30 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(-y * 12);
    rotY.set(x * 12);
  };
  const handleMouseLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className}`}
      style={{ ...style, rotateX: sRotX, rotateY: sRotY, perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ z: 20 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 2, ease: [0.22, 1, 0.36, 1],
      onUpdate: v => setDisplay(Math.floor(v)),
    });
    return controls.stop;
  }, [inView, target]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ─── Word Reveal ──────────────────────────────────────────────────────────────
function WordReveal({ text, className = "", style = {} }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const words = text.split(' ');
  return (
    <div ref={ref} className={className} style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0.28em' }}>
      {words.map((w, i) => (
        <motion.span key={i} initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >{w}</motion.span>
      ))}
    </div>
  );
}

// ─── Magnetic Button ─────────────────────────────────────────────────────────
function MagneticBtn({ children, className = "", style = {}, type = "button", onClick }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15 });
  const sy = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button ref={ref} type={type} className={className} style={{ ...style, x: sx, y: sy }}
      onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={onClick}
    >{children}</motion.button>
  );
}

// ─── Product Image ────────────────────────────────────────────────────────────
function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img src={src} alt={alt} style={{
      width: "100%", height: "100%", objectFit: "contain", maxHeight: 380,
      filter: "drop-shadow(0 0 50px rgba(232,93,4,0.2))",
    }} />
  );
}

function KitPackVisual() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", height: "100%" }}>
      <div style={{ background: "#080808", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/baton.png" alt="Bastón" style={{ width: "100%", objectFit: "contain", filter: "drop-shadow(0 0 30px rgba(232,93,4,0.25))" }} />
      </div>
      <div style={{ background: "#080808", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/glove.png" alt="Guante" style={{ width: "100%", objectFit: "contain", filter: "drop-shadow(0 0 30px rgba(232,93,4,0.25))" }} />
      </div>
      <div style={{ gridColumn: "span 2", background: "#E85D0412", border: "1px solid #E85D0435", borderRadius: 16, padding: "16px 24px", textAlign: "center" }}>
        <span style={{ color: "#E85D04", fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}>Kit MagnetoRec · $300 MXN</span>
        <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>Bastón Detector de Riesgos + Guante Magnético de Recolección N52</div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [
    { label: "ODS 2030", href: "#ods" },
    { label: "Solución", href: "#solucion" },
    { label: "Plan", href: "#plan" },
    { label: "Finanzas", href: "#finanzas" },
    { label: "Modelo", href: "#modelo" },
  ];
  return (
    <>
      <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          borderBottom: scrolled ? "1px solid #1a1a1a" : "1px solid transparent",
          background: scrolled ? "rgba(0,0,0,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          transition: "all 0.4s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "none" }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ width: 32, height: 32, background: "#E85D04", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Recycle size={16} color="#fff" />
            </motion.div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.03em" }}>
              ECO<span style={{ color: "#E85D04" }}>SEGURIDAD</span>
            </span>
          </motion.div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden-mobile">
            {links.map((l, i) => (
              <motion.a key={l.label} href={l.href} className="nav-link"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i + 0.3 }}
              >{l.label}</motion.a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MagneticBtn className="orange-btn hidden-mobile" style={{ padding: "10px 22px", fontSize: 14 }}>
              Únete al Proyecto
            </MagneticBtn>
            <button onClick={() => setOpen(!open)} className="mobile-only" style={{ background: "none", border: "none", color: "#fff", cursor: "none", padding: 8 }}>
              <AnimatePresence mode="wait">
                <motion.div key={open ? "x" : "m"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {open ? <X size={22} /> : <Menu size={22} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 99, background: "#000", borderBottom: "1px solid #1a1a1a", overflow: "hidden" }}
          >
            {links.map((l, i) => (
              <motion.a key={l.label} href={l.href} onClick={() => setOpen(false)}
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
                style={{ display: "block", padding: "14px 24px", color: "#888", fontSize: 16, fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #111" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#E85D04")}
                onMouseLeave={e => (e.currentTarget.style.color = "#888")}
              >{l.label}</motion.a>
            ))}
            <div style={{ padding: "16px 24px 24px" }}>
              <MagneticBtn className="orange-btn" style={{ width: "100%", padding: "14px" }}>Únete al Proyecto</MagneticBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
      <Particles />

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.025, backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      {/* Orange glow — parallax */}
      <motion.div style={{ y, position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: "radial-gradient(circle, rgba(232,93,4,0.1) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <motion.div style={{ opacity, position: "relative", zIndex: 1, maxWidth: 900, width: "100%" }}>
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0d0d0d", border: "1px solid #1d1d1d", borderRadius: 999, padding: "6px 16px", marginBottom: 32, position: "relative", overflow: "hidden" }}
        >
          <div className="scan-line" />
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#E85D04", position: "relative" }}
          >
            <motion.div animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ position: "absolute", inset: -2, borderRadius: "50%", border: "1px solid #E85D04" }} />
          </motion.div>
          <span style={{ color: "#E85D04", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Agenda 2030 · ODS 8, 10, 12</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}
          style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 24 }}
        >
          <WordReveal text="El imán que" style={{ justifyContent: "center", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 900, letterSpacing: "-0.04em" }} />
          <div style={{ overflow: "hidden", marginTop: "0.05em" }}>
            <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "block", color: "#E85D04" }}
            >dignifica el trabajo.</motion.span>
          </div>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
          style={{ color: "#555", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 48px" }}
        >
          Un guante con imanes de neodimio integrados que atrae metales ferrosos automáticamente, y un bastón detector para materiales peligrosos. Tecnología real que protege y dignifica a los pepenadores de México.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 480, margin: "0 auto" }}
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <motion.input type="email" placeholder="Ingresa tu correo electrónico" value={email} onChange={e => setEmail(e.target.value)}
                  whileFocus={{ borderColor: "#E85D04", scale: 1.01 }}
                  style={{ width: "100%", padding: "16px 20px", borderRadius: 10, border: "1px solid #1a1a1a", background: "#080808", color: "#fff", fontSize: 15, outline: "none", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s" }}
                />
                <div style={{ display: "flex", gap: 10, width: "100%" }}>
                  <MagneticBtn type="submit" className="orange-btn" style={{ flex: 1, padding: "16px 24px" }} onClick={() => { if (email) setSubmitted(true); }}>
                    Únete al Proyecto
                  </MagneticBtn>
                  <button className="ghost-btn" style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                    <span>Ver demo</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 200 }}
                style={{ background: "#080808", border: "1px solid #E85D04", borderRadius: 16, padding: "28px 40px", textAlign: "center", width: "100%" }}
              >
                <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  <CheckCircle size={36} color="#E85D04" style={{ margin: "0 auto 12px" }} />
                </motion.div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>¡Estás dentro!</p>
                <p style={{ color: "#555", fontSize: 14, marginTop: 6 }}>Te notificaremos con las novedades del proyecto.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}
          style={{ display: "flex", justifyContent: "center", marginTop: 64, borderTop: "1px solid #111", paddingTop: 40 }}
        >
          {[
            { val: 2000000, suffix: "+", label: "Pepenadores en México" },
            { val: 300, prefix: "$", label: "MXN por kit" },
            { val: 3, suffix: "×", label: "Más velocidad de recolección" },
            { val: 2030, label: "Meta de impacto" },
          ].map((s, i) => (
            <motion.div key={i} className="stat-item" style={{ flex: 1, textAlign: "center", padding: "0 20px" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.1 }}
            >
              <div style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
                {i === 0 ? <AnimatedNumber target={2} suffix="M+" /> : i === 1 ? <AnimatedNumber target={300} prefix="$" /> : i === 2 ? <AnimatedNumber target={3} suffix="×" /> : "2030"}
              </div>
              <div style={{ color: "#444", fontSize: 12, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", color: "#222", cursor: "none" }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeSection() {
  const items = ["SEMARNAT", "CANACINTRA", "ONU · ODS", "IMPI 2025", "NOM-017", "ANSI A4", "Neodimio N52", "MagnetoRec", "Safety Pro MX", "TechField MX"];
  return (
    <div style={{ borderTop: "1px solid #0d0d0d", borderBottom: "1px solid #0d0d0d", padding: "18px 0", overflow: "hidden", background: "#030303" }}>
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 40, paddingRight: 60 }}>
            <span style={{ color: "#222", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{item}</span>
            <div style={{ width: 3, height: 3, background: "#E85D04", borderRadius: "50%", flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ODS ──────────────────────────────────────────────────────────────────────
function ODSSection() {
  const [ref, inView] = useReveal();
  const [active, setActive] = useState(0);
  const ods = [
    { num: "ODS 8", label: "Trabajo Decente y Crecimiento Económico", color: "#FF8C00", icon: Users, desc: "El Guante MagnetoRec reduce hasta 60% el esfuerzo físico en la recolección de metales: los pepenadores recogen más en menos tiempo, con menor fatiga y mayor ingreso por jornada.", items: ["Más kilogramos recolectados por hora", "Menos esfuerzo físico y lesiones de espalda", "Mayor ingreso económico por jornada"] },
    { num: "ODS 10", label: "Reducción de las Desigualdades", color: "#9B59B6", icon: TrendingUp, desc: "Un pepenador sin herramientas gana en promedio $120 MXN/día. Con el kit MagnetoRec puede recolectar hasta 3 veces más material, acercándose a un ingreso digno sin cambiar de actividad.", items: ["Acceso a herramienta de bajo costo ($300 MXN)", "Aumento de ingreso sin capacitación previa", "Distribuible en zonas sin acceso bancario"] },
    { num: "ODS 12", label: "Producción y Consumo Responsables", color: "#27AE60", icon: Recycle, desc: "Al recolectar más metal por jornada con el guante magnético, más material ferroso llega a plantas de reciclaje en lugar de vertederos. Cada kit activa directamente la economía circular.", items: ["Mayor recuperación de acero y hierro ferroso", "Menos metal en rellenos sanitarios", "Cadena de reciclaje más eficiente"] },
  ];
  const current = ods[active];
  return (
    <section id="ods" style={{ padding: "120px 24px" }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 80 }}>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ color: "#E85D04", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>AGENDA 2030</motion.p>
          <div style={{ overflow: "hidden" }}>
            <motion.h2 initial={{ y: "100%" }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >Tres ODS,<br />un mismo propósito.</motion.h2>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
              {ods.map((o, i) => (
                <button key={i} className={`phase-tab ${active === i ? "active" : ""}`} onClick={() => setActive(i)}>
                  <span>{o.num}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -15, filter: "blur(4px)" }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ width: 52, height: 52, borderRadius: 14, background: current.color + "20", border: `1px solid ${current.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <current.icon size={24} color={current.color} />
                  </motion.div>
                  <div>
                    <div style={{ color: current.color, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{current.num}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{current.label}</div>
                  </div>
                </div>
                <p style={{ color: "#555", lineHeight: 1.8, fontSize: 15, marginBottom: 32 }}>{current.desc}</p>
                <ul style={{ listStyle: "none" }}>
                  {current.items.map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #0d0d0d" }}
                    >
                      <motion.div whileHover={{ scale: 1.2 }} style={{ width: 20, height: 20, borderRadius: "50%", background: current.color + "18", border: `1px solid ${current.color}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CheckCircle size={11} color={current.color} />
                      </motion.div>
                      <span style={{ color: "#bbb", fontSize: 14, fontWeight: 500 }}>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {ods.map((o, i) => (
              <TiltCard key={i}>
                <motion.div onClick={() => setActive(i)} whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "22px 26px", borderRadius: 16, cursor: "none",
                    background: active === i ? "#0d0d0d" : "#060606",
                    border: active === i ? `1px solid ${o.color}40` : "1px solid #0d0d0d",
                    transition: "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
                    display: "flex", alignItems: "center", gap: 18, position: "relative", overflow: "hidden"
                  }}
                >
                  {active === i && (
                    <motion.div layoutId="ods-active-bg" style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${o.color}08, transparent)` }} />
                  )}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: o.color + "12", border: `1px solid ${o.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
                    <o.icon size={18} color={active === i ? o.color : "#444"} />
                  </div>
                  <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{ color: active === i ? o.color : "#2a2a2a", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>{o.num}</div>
                    <div style={{ color: active === i ? "#fff" : "#333", fontWeight: 700, fontSize: 14 }}>{o.label}</div>
                  </div>
                  <motion.div animate={{ x: active === i ? 0 : -4, opacity: active === i ? 1 : 0.3 }} style={{ position: "relative", zIndex: 1 }}>
                    <ChevronRight size={16} color={active === i ? o.color : "#222"} />
                  </motion.div>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){#ods>div>div:last-child{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

// ─── Solución ─────────────────────────────────────────────────────────────────
function SolucionSection() {
  const [ref, inView] = useReveal();
  const [active, setActive] = useState(0);
  const products = [
    { key: "baston", label: "Bastón Detector", icon: Zap, visual: <ProductImage src="/baton.png" alt="Bastón Detector de Riesgos" /> },
    { key: "guante", label: "Guante Magnético", icon: Hand, visual: <ProductImage src="/glove.png" alt="Guante MagnetoRec N52" /> },
    { key: "kit", label: "Kit MagnetoRec", icon: Layers, visual: <KitPackVisual /> },
  ];
  const specs = [
    [
      { title: "Detector de materiales peligrosos", desc: "Identifica residuos biológicos, químicos y radiactivos antes de tocarlos — el pepenador sabe qué es seguro recoger y qué debe evitar." },
      { title: "Imán de clasificación integrado", desc: "Punta magnética que separa metales ferrosos de no ferrosos sin contacto directo, acelerando la clasificación en campo." },
      { title: "Pantalla LCD con lectura en tiempo real", desc: "Muestra el tipo de material detectado y nivel de riesgo de forma inmediata, sin experiencia técnica previa." },
      { title: "Batería reemplazable AAA · 8–12h uso", desc: "Funciona con pilas AA comerciales; no requiere cargador especial ni infraestructura eléctrica." },
    ],
    [
      { title: "4 imanes de neodimio N52 integrados", desc: "Discos N52 cosidos en palma y 3 dedos. Atraen tapas, latas de acero, varillas y fragmentos ferrosos automáticamente al aproximarse." },
      { title: "Tejido HPPE anti-corte calibre 13", desc: "Hilo HPPE que protege contra cortes de bordes de lata, alambres oxidados y láminas durante la jornada completa." },
      { title: "Palma con nitrilo rugoso", desc: "Mejora el agarre sobre piezas resbaladizas, mojadas o con aceite, y protege contra abrasión en superficies rugosas." },
      { title: "Tallas S–XL · lavable a 40°C", desc: "Imanes removibles con velcro para lavar el guante a máquina y mantener higiene diaria." },
    ],
    [
      { title: "Kit MagnetoRec 2 en 1", desc: "Bastón Detector de Riesgos + Guante Magnético: cubren detección de peligros y recolección eficiente de metales en una solución." },
      { title: "Costo total: $300 MXN", desc: "El pepenador recupera la inversión en menos de 2 jornadas con el aumento en volumen de material recolectado." },
      { title: "Sin electricidad ni apps", desc: "El guante magnético no requiere batería ni smartphone. Funciona desde el primer uso en cualquier condición de campo." },
      { title: "Escalable a 2M+ trabajadores", desc: "Diseño simple y bajo costo permite distribución masiva: municipios, cooperativas y ONGs pueden adquirir lotes desde 35 kits." },
    ]
  ];
  return (
    <section id="solucion" style={{ background: "#030303", padding: "120px 24px" }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 70 }}>
          <p style={{ color: "#E85D04", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>KIT MAGNETOREC — El imán que trabaja por ti</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
            <div style={{ overflow: "hidden" }}>
              <motion.h2 initial={{ y: "100%" }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}
              >Los metales vienen<br />a tu mano.</motion.h2>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} style={{ display: "flex", gap: 8 }}>
              {products.map((p, i) => (
                <button key={i} className={`phase-tab ${active === i ? "active" : ""}`} onClick={() => setActive(i)}>
                  <span>{p.label}</span>
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <TiltCard style={{ background: "#080808", borderRadius: 24, border: "1px solid #111", padding: "40px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, position: "relative", overflow: "hidden" }}>
            <motion.div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(232,93,4,0.05), transparent 70%)" }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={active !== 2 ? "floating" : ""}
                style={{ width: "100%", maxWidth: active === 2 ? "100%" : 300, maxHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {products[active].visual}
              </motion.div>
            </AnimatePresence>
          </TiltCard>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <h3 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Specs reales.</h3>
            <p style={{ color: "#444", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>Todo lo que ves aquí existe, se puede comprar y funciona en condiciones reales de trabajo en campo, sin electricidad ni apps.</p>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {specs[active].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="spec-card" style={{ padding: "18px 22px" }}
                      whileHover={{ x: 4 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div>
                          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                          <div style={{ color: "#444", fontSize: 12, lineHeight: 1.6 }}>{s.desc}</div>
                        </div>
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          style={{ width: 6, height: 6, borderRadius: "50%", background: "#E85D04", flexShrink: 0, marginTop: 5 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){#solucion>div>div:last-child{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

// ─── Plan ─────────────────────────────────────────────────────────────────────
function PlanSection() {
  const [ref, inView] = useReveal();
  const [activePhase, setActivePhase] = useState(0);
  const phases = [
    { num: "01", phase: "Fase 1", title: "Investigación", period: "Ene – Jun 2025", color: "#9B59B6", items: ["Diagnóstico de campo con pepenadores", "Validación técnica del kit", "Alianzas institucionales (SEMARNAT, CANACINTRA)", "Registro de patente provisional"], status: "Completado" },
    { num: "02", phase: "Fase 2", title: "Pilotaje", period: "Jul 2025 – Mar 2026", color: "#E85D04", items: ["Distribución piloto a 500 trabajadores", "Capacitación y seguimiento en campo", "Medición de impacto y ajustes", "Lanzamiento campaña 'Apadrina un Recolector'"], status: "En curso" },
    { num: "03", phase: "Fase 3", title: "Escalabilidad", period: "2026 – 2030", color: "#27AE60", items: ["Meta: 10,000 kits distribuidos (2026)", "Expansión a 5 estados prioritarios", "Modelo de franquicia social", "Reporte de impacto ONU 2030"], status: "Planificado" },
  ];
  const p = phases[activePhase];
  return (
    <section id="plan" style={{ padding: "120px 24px" }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 80 }}>
          <p style={{ color: "#E85D04", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>HOJA DE RUTA</p>
          <div style={{ overflow: "hidden" }}>
            <motion.h2 initial={{ y: "100%" }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >Plan de Acción<br />2025–2030.</motion.h2>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 60 }}>
          {phases.map((ph, i) => (
            <TiltCard key={i}>
              <motion.button onClick={() => setActivePhase(i)} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: "100%", background: activePhase === i ? "#0d0d0d" : "#060606",
                  border: activePhase === i ? `1px solid ${ph.color}50` : "1px solid #0d0d0d",
                  borderRadius: 16, padding: "24px", cursor: "none", textAlign: "left",
                  transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)", position: "relative", overflow: "hidden"
                }}
              >
                {activePhase === i && (
                  <motion.div layoutId="phase-bg" style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${ph.color}08, transparent)` }} />
                )}
                <div style={{ color: activePhase === i ? ph.color : "#2a2a2a", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase", position: "relative", zIndex: 1 }}>{ph.phase}</div>
                <div style={{ color: activePhase === i ? "#fff" : "#333", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>{ph.title}</div>
                <div style={{ color: "#2a2a2a", fontSize: 12, marginTop: 6, position: "relative", zIndex: 1 }}>{ph.period}</div>
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, background: activePhase === i ? ph.color + "20" : "#0d0d0d", border: `1px solid ${activePhase === i ? ph.color + "40" : "#111"}`, borderRadius: 999, padding: "4px 10px", position: "relative", zIndex: 1 }}>
                  <motion.div animate={activePhase === i ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: activePhase === i ? ph.color : "#222" }} />
                  <span style={{ color: activePhase === i ? ph.color : "#222", fontSize: 11, fontWeight: 700 }}>{ph.status}</span>
                </div>
              </motion.button>
            </TiltCard>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activePhase}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: "#060606", border: `1px solid ${p.color}18`, borderRadius: 24, padding: "48px", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ width: 60, height: 60, borderRadius: 18, background: p.color + "18", border: `1px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: p.color, fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>{p.num}</span>
                  </motion.div>
                  <div>
                    <div style={{ color: p.color, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>{p.phase}</div>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 28, letterSpacing: "-0.02em" }}>{p.title}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={14} color="#333" />
                  <span style={{ color: "#444", fontSize: 14 }}>{p.period}</span>
                </div>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {p.items.map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                  >
                    <motion.div whileHover={{ scale: 1.2 }} style={{ width: 24, height: 24, borderRadius: "50%", background: p.color + "15", border: `1px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <CheckCircle size={12} color={p.color} />
                    </motion.div>
                    <span style={{ color: "#888", fontSize: 15, lineHeight: 1.5 }}>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <style>{`@media(max-width:768px){#plan .phase-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

// ─── Finanzas ─────────────────────────────────────────────────────────────────
function FinanzasSection() {
  const [ref, inView] = useReveal();
  const costos = [
    { item: "Guante HPPE calibre 13 c/nitrilo (par)", proveedor: "Safety Pro MX (compra en volumen)", precio: "$70" },
    { item: "4 imanes neodimio N52 D25mm (juego)", proveedor: "AliExpress / MagnetMX directo", precio: "$45" },
    { item: "Costura/integración imanes al guante", proveedor: "Taller local", precio: "$25" },
    { item: "Bastón detector básico portátil", proveedor: "TechField Mx / AliExpress", precio: "$35" },
    { item: "Empaque, instructivo y marca", proveedor: "PackMex", precio: "$15" },
    { item: "Control de calidad / pruebas", proveedor: "Interno", precio: "$5" },
  ];
  const inversion = [
    { concepto: "Producción inicial (35 kits MagnetoRec)", monto: "$6,825" },
    { concepto: "Diseño, branding e instructivos", monto: "$3,500" },
    { concepto: "Registro de marca IMPI", monto: "$3,200" },
    { concepto: "Taller de integración imanes (mano de obra)", monto: "$1,200" },
    { concepto: "Logística y distribución piloto", monto: "$2,000" },
    { concepto: "Fondo de contingencia (10%)", monto: "$3,275" },
  ];
  return (
    <section id="finanzas" style={{ background: "#030303", padding: "120px 24px" }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 80 }}>
          <p style={{ color: "#E85D04", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>ESTRUCTURA FINANCIERA</p>
          <div style={{ overflow: "hidden" }}>
            <motion.h2 initial={{ y: "100%" }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >Costos y<br />proyecciones.</motion.h2>
          </div>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <TiltCard>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: "#060606", border: "1px solid #0d0d0d", borderRadius: 20, overflow: "hidden", height: "100%" }}
            >
              <div style={{ padding: "26px 26px 0", borderBottom: "1px solid #0d0d0d" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20 }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Costo por Kit</div>
                    <div style={{ color: "#333", fontSize: 12 }}>Desglose de producción</div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} style={{ padding: "8px 16px", background: "#E85D0412", border: "1px solid #E85D0440", borderRadius: 8, color: "#E85D04", fontWeight: 800, fontSize: 18 }}>$300 MXN</motion.div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px", gap: 8, paddingBottom: 12 }}>
                  {["Componente", "Proveedor", "Precio"].map(h => (
                    <div key={h} style={{ color: "#222", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{h}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "0 26px" }}>
                {costos.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.07 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ background: "#0d0d0d", paddingLeft: 6 }}
                    style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px", gap: 8, padding: "14px 0", borderBottom: i < costos.length - 1 ? "1px solid #080808" : "none", transition: "all 0.2s", alignItems: "center" }}
                  >
                    <div style={{ color: "#bbb", fontSize: 13, fontWeight: 500 }}>{c.item}</div>
                    <div style={{ color: "#333", fontSize: 12 }}>{c.proveedor}</div>
                    <div style={{ color: "#E85D04", fontSize: 13, fontWeight: 700 }}>{c.precio}</div>
                  </motion.div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px", gap: 8, padding: "18px 0", borderTop: "1px solid #111", marginTop: 4 }}>
                  <div style={{ gridColumn: "span 2", color: "#fff", fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Kit MagnetoRec</div>
                  <div style={{ color: "#E85D04", fontWeight: 900, fontSize: 18 }}>$300</div>
                </div>
              </div>
            </motion.div>
          </TiltCard>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <TiltCard style={{ background: "#060606", border: "1px solid #0d0d0d", borderRadius: 20, padding: "26px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Inversión Inicial</div>
                  <div style={{ color: "#333", fontSize: 12 }}>Fase de lanzamiento</div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} style={{ padding: "8px 16px", background: "#9B59B612", border: "1px solid #9B59B640", borderRadius: 8, color: "#9B59B6", fontWeight: 800, fontSize: 17 }}>$40K MXN</motion.div>
              </div>
              {inversion.map((row, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 15 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.07 + 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ background: "#0d0d0d", paddingLeft: 8, paddingRight: 8, borderRadius: 8 }}
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < inversion.length - 1 ? "1px solid #080808" : "none", transition: "all 0.2s" }}
                >
                  <span style={{ color: "#555", fontSize: 13 }}>{row.concepto}</span>
                  <span style={{ color: "#bbb", fontSize: 13, fontWeight: 600 }}>{row.monto}</span>
                </motion.div>
              ))}
              <motion.div whileHover={{ scale: 1.01 }} style={{ display: "flex", justifyContent: "space-between", padding: "16px 18px", marginTop: 14, background: "#9B59B60e", border: "1px solid #9B59B620", borderRadius: 12 }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Inversión</span>
                <span style={{ color: "#9B59B6", fontWeight: 900, fontSize: 20 }}>$40,000</span>
              </motion.div>
            </TiltCard>

            <TiltCard style={{ background: "#E85D040e", border: "1px solid #E85D0428", borderRadius: 20, padding: "26px" }}>
              <div style={{ color: "#E85D04", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>Proyección de Impacto</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  { val: 35, label: "Kits piloto" },
                  { val: 500, label: "Piloto 2025" },
                  { val: 10000, label: "Meta 2026", suffix: "" },
                  { val: 5, label: "Estados" },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }} style={{ textAlign: "center" }}>
                    <div style={{ color: "#E85D04", fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>
                      <AnimatedNumber target={s.val} />
                    </div>
                    <div style={{ color: "#555", fontSize: 12, marginTop: 3 }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){#finanzas>div>div:last-child{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

// ─── Modelo ───────────────────────────────────────────────────────────────────
function ModeloSection() {
  const [ref, inView] = useReveal();
  const reviews = [
    { name: "Arq. Claudia M.", role: "Directora de RSE", text: "Un proyecto que realmente conecta el impacto social con la innovación. El guante magnético es simple, barato y transforma el trabajo de los pepenadores desde el primer día.", avatar: "CM" },
    { name: "Ing. Roberto L.", role: "Gerente de Sustentabilidad", text: "El concepto del imán neodimio N52 integrado al guante es brillante. No necesitas electricidad, no necesitas app — simplemente acercas la mano y el metal se pega.", avatar: "RL" },
    { name: "Dra. Sandra P.", role: "Investigadora UNAM", text: "Los imanes N52 tienen una fuerza de atracción real sobre metales ferrosos. Esta solución puede aumentar la productividad de recolectores informales en más de 40%.", avatar: "SP" },
  ];
  return (
    <section id="modelo" style={{ padding: "120px 24px" }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 80 }}>
          <p style={{ color: "#E85D04", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>MODELO DE NEGOCIO</p>
          <div style={{ overflow: "hidden" }}>
            <motion.h2 initial={{ y: "100%" }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >Sustentabilidad<br />financiera.</motion.h2>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 80 }}>
          {[
            { color: "#EC4899", icon: Heart, tag: "Modelo B2C", title: "Apadrina un Recolector", bg: "#EC489906", desc: "Desde $50 MXN/mes puedes financiar la protección de un trabajador real, con reporte mensual de impacto y certificado de responsabilidad social.", items: ["Plataforma digital segura", "Reporte mensual personalizado", "Certificado Eco-Responsable", "Deducible de impuestos (CFDI)"], itemIcon: Star },
            { color: "#3B82F6", icon: Building2, tag: "Alianzas B2B", title: "Partnerships Estratégicos", bg: "#3B82F606", desc: "Empresas del sector pueden patrocinar lotes de kits como parte de su estrategia de ESG y RSE, con beneficios fiscales y visibilidad de marca.", sub: "ESG y RSE", subColor: "#3B82F6", grid: [{ label: "Empresas Reciclaje", val: "Compra directa" }, { label: "Municipios", val: "Licitación pública" }, { label: "ONG Partners", val: "Co-distribución" }, { label: "Retail ESG", val: "Sponsorship" }] },
          ].map((card, ci) => (
            <TiltCard key={ci}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: ci * 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: "#060606", border: "1px solid #0d0d0d", borderRadius: 24, padding: "38px", height: "100%", position: "relative", overflow: "hidden" }}
              >
                <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, delay: ci }}
                  style={{ position: "absolute", top: 0, right: 0, width: 220, height: 220, background: `radial-gradient(circle, ${card.color}08, transparent 65%)` }} />
                <motion.div whileHover={{ scale: 1.08, rotate: 5 }} style={{ width: 52, height: 52, borderRadius: 14, background: card.color + "12", border: `1px solid ${card.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                  <card.icon size={24} color={card.color} />
                </motion.div>
                <div style={{ color: card.color, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{card.tag}</div>
                <h3 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 14 }}>{card.title}</h3>
                <p style={{ color: "#444", fontSize: 14, lineHeight: 1.7, marginBottom: 26 }}>{card.desc}</p>
                {card.items ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {card.items.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.07 + 0.3 }}
                        style={{ display: "flex", alignItems: "center", gap: 10 }}
                      >
                        <card.itemIcon size={11} color={card.color} />
                        <span style={{ color: "#666", fontSize: 13 }}>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {card.grid!.map((item, i) => (
                      <motion.div key={i} whileHover={{ borderColor: card.color, background: card.color + "08" }}
                        style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: 10, padding: "12px 14px", transition: "all 0.2s" }}
                      >
                        <div style={{ color: card.color, fontSize: 11, fontWeight: 700 }}>{item.label}</div>
                        <div style={{ color: "#333", fontSize: 11, marginTop: 2 }}>{item.val}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}
          style={{ color: "#E85D04", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 40, textAlign: "center" }}>TESTIMONIOS</motion.p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {reviews.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12 + 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="review-card"
            >
              <motion.div whileHover={{ scale: 1.1, borderColor: "#E85D04" }}
                style={{ width: 44, height: 44, borderRadius: "50%", background: "#111", border: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#E85D04", fontWeight: 800, fontSize: 13, transition: "border-color 0.2s" }}
              >{r.avatar}</motion.div>
              <p style={{ color: "#666", fontSize: 13, lineHeight: 1.75, textAlign: "center", marginBottom: 20 }}>"{r.text}"</p>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                <div style={{ color: "#333", fontSize: 11, marginTop: 3 }}>{r.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){#modelo>div>div{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CTASection() {
  const [ref, inView] = useReveal();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0.8, 1], [0.95, 1]);

  return (
    <motion.section style={{ position: "relative", padding: "160px 24px", overflow: "hidden", scale }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #000, #060200, #000)", zIndex: 0 }} />
      <motion.div animate={{ opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 4, repeat: Infinity }}
        style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle at 1px 1px, #E85D04 1px, transparent 0)", backgroundSize: "36px 36px", zIndex: 1 }} />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 6, repeat: Infinity }}
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 900, background: "radial-gradient(circle, rgba(232,93,4,0.08) 0%, transparent 60%)", zIndex: 1 }} />

      <div ref={ref} style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 12 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                <Target size={18} color="#E85D04" />
              </motion.div>
              <span style={{ color: "#E85D04", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Meta 2026</span>
            </div>
            <div style={{ fontSize: "clamp(64px, 12vw, 120px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", lineHeight: 1 }}>
              <AnimatedNumber target={10000} />
            </div>
            <div style={{ color: "#E85D04", fontSize: 20, fontWeight: 700, marginTop: 8 }}>trabajadores protegidos</div>
            <div style={{ maxWidth: 420, margin: "24px auto 0", background: "#111", borderRadius: 999, height: 4, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={inView ? { width: "12%" } : {}} transition={{ duration: 2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%", background: "linear-gradient(90deg, #E85D04, #ff9500)", borderRadius: 999 }} />
            </div>
            <div style={{ color: "#2a2a2a", fontSize: 12, marginTop: 8 }}>1,200 / 10,000 · 12% alcanzado</div>
          </div>

          <WordReveal text="Ve lo que viene después." style={{ justifyContent: "center", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }} />
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
            style={{ color: "#444", fontSize: 17, lineHeight: 1.6, marginBottom: 48 }}>
            Únete a la lista de espera para acceso anticipado y detalles exclusivos del lanzamiento.
          </motion.p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" exit={{ opacity: 0, y: -10 }} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "0 auto" }}>
                <motion.input type="email" placeholder="Ingresa tu correo electrónico" value={email} onChange={e => setEmail(e.target.value)}
                  whileFocus={{ borderColor: "#E85D04", scale: 1.01 }}
                  style={{ width: "100%", padding: "18px 20px", background: "#080808", border: "1px solid #1a1a1a", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", fontFamily: "Inter, sans-serif" }}
                />
                <MagneticBtn className="orange-btn" style={{ padding: "18px 32px", fontSize: 16 }} onClick={() => { if (email) setSubmitted(true); }}>
                  Únete a la Lista de Espera
                </MagneticBtn>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 200 }}
                style={{ background: "#080808", border: "1px solid #E85D04", borderRadius: 16, padding: "32px 40px" }}
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
                  <CheckCircle size={36} color="#E85D04" style={{ margin: "0 auto 12px" }} />
                </motion.div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>¡Estás dentro!</p>
                <p style={{ color: "#555", fontSize: 14, marginTop: 6 }}>Te contactaremos con las novedades del proyecto.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #0d0d0d", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <motion.div whileHover={{ scale: 1.04 }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "none" }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ width: 32, height: 32, background: "#E85D04", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Recycle size={16} color="#fff" />
          </motion.div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.03em" }}>
            ECO<span style={{ color: "#E85D04" }}>SEGURIDAD</span><span style={{ color: "#1a1a1a" }}>2030</span>
          </span>
        </motion.div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {["Política de Privacidad", "Contacto", "ODS 2030", "Apadrina"].map(l => (
            <motion.a key={l} href="#" whileHover={{ color: "#E85D04", y: -2 }}
              style={{ color: "#2a2a2a", fontSize: 12, textDecoration: "none", fontWeight: 500 }}
            >{l}</motion.a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1a1a1a", fontSize: 11 }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Leaf size={11} color="#E85D04" />
          </motion.div>
          <span>Agenda 2030 · ONU</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Download Section ──────────────────────────────────────────────────
function DownloadSection() {
  const [ref, inView] = useReveal();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { generateProjectPDF } = await import("../lib/generatePDF");
      await generateProjectPDF();
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      console.error("PDF error:", e);
    } finally {
      setLoading(false);
    }
  };

  const contents = [
    { icon: BookOpen, label: "Resumen Ejecutivo", desc: "Problema, solución e impacto" },
    { icon: Zap, label: "Specs técnicas completas", desc: "Guante HPPE + bastón detector" },
    { icon: BarChart2, label: "Gráficas financieras", desc: "Costos, proyección 2025–2030" },
    { icon: Target, label: "Alineación ODS", desc: "Métricas ODS 8, 10 y 12" },
    { icon: FileText, label: "Plan operativo", desc: "Hoja de ruta fase a fase" },
    { icon: Building2, label: "Modelo de negocio", desc: "Canales, precios y ROI" },
  ];

  return (
    <section id="descarga" style={{ background: "#030303", padding: "100px 24px", borderTop: "1px solid #0d0d0d" }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 60 }}>
          <p style={{ color: "#E85D04", fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>DOCUMENTACIÓN OFICIAL</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
            <div style={{ overflow: "hidden" }}>
              <motion.h2 initial={{ y: "100%" }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}
              >Descarga el dossier<br />completo del proyecto.</motion.h2>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
              style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "14px 22px", display: "flex", alignItems: "center", gap: 12 }}
            >
              <FileText size={20} color="#E85D04" />
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>EcoSeguridad2030_KitMagnetoRec_2025.pdf</div>
                <div style={{ color: "#444", fontSize: 11 }}>PDF · 8 páginas · Incluye gráficas y tablas</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40, alignItems: "start" }}>
          {/* Contents grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {contents.map((c, i) => (
              <TiltCard key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 3 }}
                  style={{ background: "#080808", border: "1px solid #111", borderRadius: 16, padding: "22px", display: "flex", gap: 16, alignItems: "flex-start", position: "relative", overflow: "hidden" }}
                >
                  <motion.div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #E85D0406 0%, transparent 60%)", opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.2 }} />
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{ width: 40, height: 40, borderRadius: 10, background: "#E85D0412", border: "1px solid #E85D0420", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  >
                    <c.icon size={18} color="#E85D04" />
                  </motion.div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{c.label}</div>
                    <div style={{ color: "#444", fontSize: 12 }}>{c.desc}</div>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>

          {/* Download card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <TiltCard style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 20, padding: "36px", position: "relative", overflow: "hidden" }}>
              <motion.div animate={{ opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 4, repeat: Infinity }}
                style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, #E85D04, transparent 70%)" }} />

              <motion.div whileHover={{ rotate: 10, scale: 1.1 }} style={{ width: 56, height: 56, background: "#E85D04", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                <FileText size={26} color="#fff" />
              </motion.div>

              <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>Dossier oficial<br />del proyecto</div>
              <div style={{ color: "#444", fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
                PDF completo con especificaciones técnicas, gráficas financieras, métricas ODS, plan operativo y modelo de negocio.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {["8 páginas de contenido", "Tablas financieras detalladas", "Gráficas de proyección 2030", "Datos reales verificables"].map((feat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.07 + 0.5 }}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CheckCircle size={12} color="#E85D04" />
                    <span style={{ color: "#666", fontSize: 12 }}>{feat}</span>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div key="done"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ background: "#27AE6018", border: "1px solid #27AE6040", borderRadius: 10, padding: "14px", textAlign: "center" }}
                  >
                    <CheckCircle size={20} color="#27AE60" style={{ margin: "0 auto 8px" }} />
                    <div style={{ color: "#27AE60", fontWeight: 700, fontSize: 13 }}>¡PDF descargado!</div>
                  </motion.div>
                ) : (
                  <MagneticBtn key="btn" className="orange-btn" style={{ width: "100%", padding: "16px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                    onClick={handleDownload}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 16, height: 16, border: "2px solid #fff3", borderTop: "2px solid #fff", borderRadius: "50%" }} />
                          Generando PDF...
                        </motion.div>
                      ) : (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Download size={16} />
                          Descargar PDF
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </MagneticBtn>
                )}
              </AnimatePresence>

              <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#2a2a2a", fontSize: 11 }}>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Download size={10} color="#333" />
                </motion.div>
                Gratuito · Sin registro · Se genera en tu navegador
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){#descarga>div>div{grid-template-columns:1fr!important;} #descarga>div>div:first-child{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}

export default function EcoSeguridad2030() {
  return (
    <div style={{ background: "#000", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>
      <style>{GLOBAL_CSS}</style>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <Hero />
      <MarqueeSection />
      <ODSSection />
      <SolucionSection />
      <PlanSection />
      <FinanzasSection />
      <ModeloSection />
      <CTASection />
      <DownloadSection />
      <Footer />
    </div>
  );
}
