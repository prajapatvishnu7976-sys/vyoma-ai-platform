"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   Scramble-decode text — resolves left to right from glyph noise
   ───────────────────────────────────────────────────────────── */
export function Scramble({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  const [started, setStarted] = useState(false);
  const GLYPHS = "▓▒░<>/[]{}|=+*·01";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    let raf = 0;
    const total = 30;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      if (now < t0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      frame++;
      const prog = Math.min(1, frame / total);
      const resolved = Math.floor(prog * text.length);
      let s = text.slice(0, resolved);
      for (let i = resolved; i < text.length; i++) {
        s += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, text, delay]);

  return (
    <span ref={ref} className={className}>
      {out}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Scroll reveal wrapper
   ───────────────────────────────────────────────────────────── */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ ["--rv-delay" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Telemetry ticker
   ───────────────────────────────────────────────────────────── */
export function Ticker({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`overflow-hidden border-y border-line bg-panel/70 ${className}`}>
      <div className="ticker-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {items.map((it, i) => (
              <span key={i} className="flex items-center whitespace-nowrap px-5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-dim uppercase">
                <span className="mr-5 inline-block h-1 w-1 rounded-full bg-ion/70" />
                {it}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Section kicker
   ───────────────────────────────────────────────────────────── */
export function SectionTag({ no, label }: { no: string; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="font-mono text-[11px] tracking-[0.24em] text-ion">/{no}</span>
      <span className="h-px w-10 bg-line2" />
      <span className="font-mono text-[11px] tracking-[0.24em] text-dim uppercase">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Wordmark
   ───────────────────────────────────────────────────────────── */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-[0.3em] ${className}`}>
      VYOMA<span className="text-isro">.</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Nav
   ───────────────────────────────────────────────────────────── */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    ["Problem", "#problem"],
    ["System", "#system"],
    ["Capabilities", "#capabilities"],
    ["Architecture", "#architecture"],
    ["Benchmarks", "#benchmarks"],
    ["Impact", "#impact"],
  ];
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-void/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3.5 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-isro/50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-isro" />
          </span>
          <Wordmark className="text-[15px] text-ink group-hover:text-ion2 transition-colors" />
          <span className="hidden font-mono text-[9.5px] tracking-[0.2em] text-faint sm:block">RS-AGENT · SIH 26167</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ion2">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="hidden font-mono text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:text-ion2 sm:block"
          >
            Runs
          </Link>
          <Link
            href="/console"
            className="rounded-sm border border-ion/50 bg-ion/10 px-4 py-2 font-display text-[12px] font-semibold tracking-[0.18em] text-ion uppercase transition-all hover:bg-ion hover:text-void hover:shadow-[0_0_24px_rgba(67,217,255,0.35)]"
          >
            Console →
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   Footer
   ───────────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="relative border-t border-line bg-abyss">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark className="text-xl" />
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-dim">
              Ask the sky in your own words, get the answer that matters. An agentic, query-driven vision-language
              assistant for multimodal remote sensing — built as a working prototype for the Smart India Hackathon 2026.
            </p>
            <p className="mt-4 font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
              PS 26167 · SatQuery AI · ISRO, Department of Space · Theme: Space Technology
            </p>
          </div>
          <div>
            <div className="font-mono text-[10.5px] tracking-[0.22em] text-faint uppercase">Research lineage</div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-dim">
              <li><a className="transition-colors hover:text-ion2" href="https://arxiv.org/abs/2311.15826" target="_blank" rel="noreferrer">GeoChat — grounded RS VLM (CVPR 2024)</a></li>
              <li><a className="transition-colors hover:text-ion2" href="https://arxiv.org/abs/2007.04763" target="_blank" rel="noreferrer">RSVQA — Lobry et al., 2020</a></li>
              <li><a className="transition-colors hover:text-ion2" href="https://arxiv.org/abs/2104.04984" target="_blank" rel="noreferrer">CDVQA — change detection + VQA</a></li>
              <li><a className="transition-colors hover:text-ion2" href="https://arxiv.org/abs/2311.15826" target="_blank" rel="noreferrer">RS-LLaVA — LoRA-adapted LLaVA</a></li>
              <li>RS-Agent · GeoLLM-Squad · VRSBench</li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10.5px] tracking-[0.22em] text-faint uppercase">Prototype build</div>
            <ul className="mt-4 space-y-2.5 font-mono text-[12px] text-dim">
              <li>PyTorch · LoRA rs-v2.3</li>
              <li>LangChain-style tool registry</li>
              <li>Next.js · FastAPI-class API · PostgreSQL</li>
              <li>GDAL / Rasterio · OpenCV-grade kernels</li>
            </ul>
            <p className="mt-5 text-[12px] leading-relaxed text-faint">
              No cloud. One GPU. A lot of coffee. Every metric on this site is computed from the pixels you upload.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase sm:flex-row sm:items-center">
          <span>© 2026 Team VYOMA — Smart India Hackathon 2026</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint blink" />
            All systems nominal
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   Confidence gauge (SVG)
   ───────────────────────────────────────────────────────────── */
export function ConfGauge({ value, label }: { value: number; label: string }) {
  const angle = -90 + value * 180;
  const len = (value * 169.6).toFixed(1);
  return (
    <div className="flex flex-col items-center">
      <svg width="138" height="78" viewBox="0 0 138 78">
        <path d="M 15 72 A 54 54 0 0 1 123 72" fill="none" stroke="#1b2a44" strokeWidth="9" strokeLinecap="round" />
        <path d="M 15 72 A 54 54 0 0 1 123 72" fill="none" stroke="url(#vyoma-cg)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${len} 400`} />
        <defs>
          <linearGradient id="vyoma-cg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#56e2a5" />
            <stop offset="0.55" stopColor="#43d9ff" />
            <stop offset="1" stopColor="#ffb454" />
          </linearGradient>
        </defs>
        <g className="gauge-needle" style={{ transform: `rotate(${angle}deg)`, transformOrigin: "69px 72px" }}>
          <line x1="69" y1="72" x2="69" y2="27" stroke="#e9f0fb" strokeWidth="2.5" />
        </g>
        <circle cx="69" cy="72" r="4.5" fill="#e9f0fb" />
      </svg>
      <div className="-mt-6 font-mono text-[15px] text-ion2">{value.toFixed(2)}</div>
      <div className="mt-1 font-display text-[10px] tracking-[0.24em] text-dim uppercase">{label} confidence</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Badges
   ───────────────────────────────────────────────────────────── */
export function ConfigBadge({ config }: { config: string }) {
  const map: Record<string, string> = {
    single: "SINGLE FRAME",
    bitemporal: "BI-TEMPORAL · T1+T2",
    crossmodal: "OPTICAL + SAR",
  };
  const tone: Record<string, string> = {
    single: "border-ion/40 text-ion",
    bitemporal: "border-amber/50 text-amber",
    crossmodal: "border-mint/50 text-mint",
  };
  return (
    <span className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[9.5px] tracking-[0.16em] ${tone[config] ?? "border-line text-dim"}`}>
      {map[config] ?? config}
    </span>
  );
}

export function IntentBadge({ intent }: { intent: string }) {
  const map: Record<string, string> = {
    vqa: "VQA",
    caption: "CAPTION + GROUND",
    change: "CHANGE",
    fusion: "FUSION",
  };
  return (
    <span className="inline-block rounded-sm border border-line2 bg-raise/60 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.16em] text-ink">
      {map[intent] ?? intent.toUpperCase()}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Icons (hand-rolled, stroke style)
   ───────────────────────────────────────────────────────────── */
const ic = "none";
export function IconSat({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={ic} stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="9" y="9" width="6" height="6" transform="rotate(45 12 12)" />
      <path d="M5 5l4 4M19 19l-4-4M4 12h2M18 12h2M12 4v2M12 18v2" />
      <circle cx="19" cy="5" r="2.4" />
    </svg>
  );
}
export function IconLayers({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={ic} stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 17l9 5 9-5" opacity="0.5" />
    </svg>
  );
}
export function IconRadar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={ic} stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" opacity="0.55" />
      <path d="M12 12L18.5 5.8" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconTools({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={ic} stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <circle cx="7" cy="17" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M7 10v4M17 10v4M10 7h4M10 17h4" opacity="0.5" />
    </svg>
  );
}
export function IconShield({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={ic} stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}
export function IconArrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={ic} stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}
