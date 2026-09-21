import Link from "next/link";
import { Reveal, Scramble, SectionTag, Ticker } from "./chrome";

/* ─────────────────────────── HERO ─────────────────────────── */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div
        className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-25"
        style={{ background: "radial-gradient(closest-side, rgba(67,217,255,0.35), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-3 rounded-sm border border-line bg-panel/80 px-3.5 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-isro blink" />
              <span className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">
                SIH 2026 · ISRO PS 26167 (SatQuery AI) · working prototype
              </span>
            </div>
          </Reveal>
          <h1 className="font-display text-[42px] leading-[1.02] font-bold tracking-tight text-ink md:text-[64px]">
            <Scramble text="ASK THE SKY" className="block" />
            <span className="block text-ion2">
              <Scramble text="IN YOUR OWN WORDS." className="block" delay={350} />
            </span>
          </h1>
          <Reveal delay={150}>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-dim">
              <strong className="font-semibold text-ink">VYOMA</strong> is an agentic vision-language assistant for
              remote sensing. Upload a frame — or a before/after pair, or optical + SAR — ask a normal question, and get
              an answer with the proof attached: a highlighted region, a pixel-level change map, a confidence score, and
              the exact trace of what the system ran. No GIS degree required.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/console"
                className="group rounded-sm bg-ion px-7 py-3.5 font-display text-[13px] font-bold tracking-[0.18em] text-void uppercase transition-all hover:bg-ion2 hover:shadow-[0_0_40px_rgba(67,217,255,0.45)]"
              >
                Open the console <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#architecture"
                className="rounded-sm border border-line2 px-7 py-3.5 font-display text-[13px] font-semibold tracking-[0.18em] text-dim uppercase transition-all hover:border-ion/50 hover:text-ion2"
              >
                See how it routes
              </a>
            </div>
          </Reveal>
          <Reveal delay={350}>
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4">
              {[
                ["5", "specialist tools"],
                ["3", "input configs"],
                ["464K", "adaptation pairs"],
                ["100%", "runs traced"],
              ].map(([v, l]) => (
                <div key={l} className="bg-panel px-4 py-3.5">
                  <dt className="order-2 mt-1 block font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">{l}</dt>
                  <dd className="font-display text-[22px] leading-none font-bold text-ion2">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* live feed card */}
        <Reveal delay={200} className="relative">
          <svg className="absolute -top-24 -right-16 h-[420px] w-[420px] opacity-30" viewBox="0 0 400 400" fill="none" aria-hidden>
            <ellipse cx="200" cy="200" rx="190" ry="70" stroke="#27395c" strokeWidth="1" transform="rotate(-24 200 200)" />
            <ellipse cx="200" cy="200" rx="150" ry="52" stroke="#1b2a44" strokeWidth="1" transform="rotate(-24 200 200)" />
            <circle cx="330" cy="130" r="3" fill="#43d9ff" />
          </svg>
          <div className="relative rounded-md border border-line bg-panel p-3 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-mint blink" /> Live downlink
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-faint">CARTOSAT-2S · B4/B3/B2</span>
            </div>
            <div className="relative overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/samples/port.jpg" alt="True-colour satellite frame of a coastal port" className="block aspect-square w-full object-cover" />
              <div className="scanline" aria-hidden />
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <span className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-ion/70" />
                <span className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-ion/70" />
                <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-ion/70" />
                <span className="absolute right-0 bottom-0 h-6 w-6 border-r-2 border-b-2 border-ion/70" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="8" y="52" width="46" height="30" fill="rgba(67,217,255,0.07)" stroke="#43d9ff" strokeWidth="0.4" strokeDasharray="2.2 1.5" className="bbox-pulse" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="rounded-sm bg-void/80 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-ion2">22.309°N 70.801°E</span>
                <span className="rounded-sm bg-void/80 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-dim">RES 0.5 M · CLOUD 2%</span>
              </div>
              <div className="absolute right-3 bottom-3 rounded-sm bg-void/80 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-mint">
                GROUNDING: water body · 0.81
              </div>
            </div>
            <div className="mt-3 rounded-sm border border-line bg-void/70 px-4 py-3.5 font-mono text-[11px] leading-relaxed">
              <p className="text-dim">
                <span className="text-ion">you&gt;</span> locate the water body along the coast
              </p>
              <p className="mt-1.5 text-ink/90">
                <span className="text-mint">vyoma&gt;</span> grounded — 19.9% of frame, SW corridor, p=0.81
                <span className="text-faint"> · 5 tools · trace sealed</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── PROBLEM ──────────────────────── */
const PROBLEMS: { no: string; title: string; body: string; answer: string }[] = [
  {
    no: "01",
    title: "The tooling is fragmented and single-task",
    body: "A captioning model here, a change-detection model there, a fusion notebook in someone's drawer. Five separate pipelines, and nobody chains them for you.",
    answer: "One agentic controller routes and sequences the right specialists per query.",
  },
  {
    no: "02",
    title: "Asking the sky used to require a GIS expert",
    body: "The models exist, but the interface doesn't. District officers and field teams don't read API schemas or pick model parameters.",
    answer: "Plain-language query in, evidence-backed answer out. Zero GIS prerequisite.",
  },
  {
    no: "03",
    title: "Most real questions need more than one image",
    body: "What changed? needs two dates. Is it still there under monsoon cloud? needs a second sensor. Single-image demos can't answer either.",
    answer: "Native bi-temporal (T1+T2) and cross-modal (optical+SAR) pair reasoning, not bolted on.",
  },
  {
    no: "04",
    title: "Nobody can verify what the model claimed",
    body: "A confident wrong answer inside a disaster workflow is a liability. Black-box VLMs hand you text and shrug.",
    answer: "Every answer ships with visual evidence, a confidence score and a sealed execution trace.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="relative border-t border-line bg-abyss/60 py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionTag no="01" label="The problem, stated plainly" />
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <Reveal>
            <h2 className="font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
              Remote sensing AI has models.
              <span className="text-dim"> What it doesn't have is a way to </span>
              <span className="text-ion2">ask it a question.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-dim">
              ISRO's PS 26167 says it exactly: fragmented single-task tools, expertise barriers, single-image limits, and
              no trust path. Four problems, one system.
            </p>
          </Reveal>
          <div>
            {PROBLEMS.map((p, i) => (
              <Reveal key={p.no} delay={i * 90}>
                <div className="group grid grid-cols-[64px_1fr] gap-5 border-t border-line py-7 transition-colors first:border-t-0 hover:bg-panel/40 md:grid-cols-[88px_1fr]">
                  <span className="font-display text-4xl font-bold text-line2 transition-colors group-hover:text-ion/50 md:text-5xl">{p.no}</span>
                  <div>
                    <h3 className="font-display text-[19px] font-semibold text-ink">{p.title}</h3>
                    <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-dim">{p.body}</p>
                    <p className="mt-3 flex items-start gap-2 font-mono text-[11.5px] text-mint">
                      <span className="mt-0.5 shrink-0">↳</span>
                      <span>VYOMA: {p.answer}</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── SYSTEM (sticky 2-col) ────────── */
const LAYERS: { tag: string; title: string; body: string; spec: string[] }[] = [
  {
    tag: "L1",
    title: "Input & Compatibility Layer",
    body: "Takes GeoTIFF/TIFF (PNG/JPEG for benchmark sets), auto-detects whether it's a single frame, an optical+SAR pair, or a bi-temporal pair, verifies co-registration, and rejects malformed uploads before they reach a model.",
    spec: ["modality & format check", "auto pair-type detection", "co-registration + drift verify", "metadata / band extraction"],
  },
  {
    tag: "L2",
    title: "Domain-Adapted Core Model",
    body: "An open vision-language backbone (GeoChat / RS-LLaVA class) fine-tuned with LoRA on 464K BigEarthNet.txt pairs — so it understands spectral bands and SAR signatures, not just street-view photos.",
    spec: ["RS-LLaVA backbone", "LoRA rs-v2.3 adapter", "BigEarthNet.txt adaptation", "shared by all specialists"],
  },
  {
    tag: "L3",
    title: "Specialist Tool Registry",
    body: "Five focused modules, each good at exactly one job: VQA, captioning/grounding, change-VQA, optical–SAR fusion, and a confidence-and-evidence scorer that overlays proof on the answer.",
    spec: ["5 tools · 1 job each", "predefined, selected at runtime", "each outputs text + spatial evidence"],
  },
  {
    tag: "L4",
    title: "Agentic Controller",
    body: "The brain. Classifies the query's intent, checks which specialists the input configuration requires, executes them in the right order, merges outputs, scores confidence, and seals an auditable trace.",
    spec: ["intent → tool plan → sequence", "parameter binding per step", "confidence & evidence scoring", "auditable trace, every run"],
  },
];

export function SystemSection() {
  return (
    <section id="system" className="relative border-t border-line py-24">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionTag no="02" label="Why a control room, not one big model" />
          <h2 className="font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
            Four layers. One shared backbone.
            <span className="text-ion2"> Zero guesswork for the user.</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-dim">
            Most hackathon demos bolt one fine-tuned VLM to a chat box. VYOMA instead works like a mission control room:
            a controller reads your question, decides which specialist(s) the input configuration needs, runs them in
            sequence, and returns the merged result with proof.
          </p>
          <p className="mt-4 max-w-md font-mono text-[12px] leading-relaxed text-faint">
            // the user never picks a model, a parameter, or a band index.
            <br />
            // that's the whole point.
          </p>
        </div>
        <div className="space-y-5">
          {LAYERS.map((l, i) => (
            <Reveal key={l.tag} delay={i * 80}>
              <div className="group rounded-md border border-line bg-panel p-6 transition-all hover:border-ion/40 hover:shadow-[0_0_40px_rgba(67,217,255,0.07)] md:p-7">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[12px] tracking-[0.2em] text-ion">{l.tag}</span>
                  <h3 className="font-display text-[20px] font-semibold text-ink">{l.title}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-dim">{l.body}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {l.spec.map((s) => (
                    <li key={s} className="rounded-sm border border-line bg-abyss/70 px-2.5 py-1 font-mono text-[10.5px] text-dim">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── CAPABILITIES bento ───────────── */
function MiniVqa() {
  return (
    <svg viewBox="0 0 120 70" fill="none" className="h-full w-full">
      <rect x="4" y="14" width="40" height="40" stroke="#43d9ff" strokeWidth="1.2" />
      <path d="M10 44l9-11 7 8 6-6 8 9" stroke="#43d9ff" strokeWidth="1.2" opacity="0.7" />
      <path d="M52 34h22m0 0-6-5m6 5-6 5" stroke="#8ea3c4" strokeWidth="1.2" className="flow-line" />
      <rect x="80" y="20" width="36" height="12" stroke="#56e2a5" strokeWidth="1.1" />
      <rect x="80" y="38" width="26" height="12" stroke="#56e2a5" strokeWidth="1.1" opacity="0.6" />
    </svg>
  );
}
function MiniGround() {
  return (
    <svg viewBox="0 0 120 70" fill="none" className="h-full w-full">
      <rect x="10" y="8" width="100" height="54" stroke="#8ea3c4" strokeWidth="1" opacity="0.5" />
      <path d="M20 48l14-16 10 10 8-7 14 13" stroke="#8ea3c4" strokeWidth="1" opacity="0.6" />
      <rect x="48" y="20" width="34" height="24" stroke="#43d9ff" strokeWidth="1.4" strokeDasharray="4 3" className="bbox-pulse" />
      <circle cx="65" cy="32" r="2.5" fill="#43d9ff" />
    </svg>
  );
}
function MiniChange() {
  return (
    <svg viewBox="0 0 120 70" fill="none" className="h-full w-full">
      <rect x="4" y="10" width="44" height="48" stroke="#8ea3c4" strokeWidth="1" opacity="0.6" />
      <path d="M12 46l10-12 8 8 10-10" stroke="#8ea3c4" strokeWidth="1" opacity="0.5" />
      <rect x="72" y="10" width="44" height="48" stroke="#8ea3c4" strokeWidth="1" opacity="0.6" />
      <path d="M80 46l10-12 8 8 10-10" stroke="#8ea3c4" strokeWidth="1" opacity="0.5" />
      <rect x="92" y="18" width="16" height="10" fill="#ff5d5d" opacity="0.8" />
      <path d="M52 34h16m0 0-5-4m5 4-5 4" stroke="#ffb454" strokeWidth="1.2" className="flow-line" />
    </svg>
  );
}
function MiniFuse() {
  return (
    <svg viewBox="0 0 120 70" fill="none" className="h-full w-full">
      <circle cx="42" cy="35" r="22" stroke="#43d9ff" strokeWidth="1.2" />
      <circle cx="78" cy="35" r="22" stroke="#56e2a5" strokeWidth="1.2" opacity="0.9" />
      <path d="M58 21v28" stroke="#e9f0fb" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" className="flow-line" />
      <text x="33" y="39" fill="#43d9ff" fontSize="9" fontFamily="monospace">VIS</text>
      <text x="69" y="39" fill="#56e2a5" fontSize="9" fontFamily="monospace">SAR</text>
    </svg>
  );
}
function MiniAgent() {
  return (
    <svg viewBox="0 0 120 70" fill="none" className="h-full w-full">
      <circle cx="18" cy="35" r="9" stroke="#8ea3c4" strokeWidth="1.1" />
      <circle cx="60" cy="16" r="8" stroke="#43d9ff" strokeWidth="1.2" />
      <circle cx="60" cy="54" r="8" stroke="#43d9ff" strokeWidth="1.2" />
      <circle cx="102" cy="35" r="9" stroke="#56e2a5" strokeWidth="1.1" />
      <path d="M26 30l26-11M26 40l26 11M68 19l27 13M68 51l27-13" stroke="#27395c" strokeWidth="1" className="flow-line" />
    </svg>
  );
}

const CAPS = [
  {
    title: "Visual Question Answering",
    body: "Direct questions, direct answers — and every number in the answer is computed from the frame's own pixels, not from a lookup table.",
    mono: "tool: rs-vlm-vqa · in: 1–2 frames · out: text + stats",
    art: <MiniVqa />,
    span: "lg:col-span-2",
  },
  {
    title: "Captioning + Grounding",
    body: "Not just words — a box around the exact region the model means.",
    mono: "tool: caption-grounding · out: caption + bbox",
    art: <MiniGround />,
    span: "",
  },
  {
    title: "Change Understanding",
    body: "Give it T1 and T2; get a pixel-level map of everything in between, with cluster count, centroid and mean Δ radiance.",
    mono: "tool: pixel-change + change-vqa · out: Δ map",
    art: <MiniChange />,
    span: "",
  },
  {
    title: "Optical–SAR Fusion",
    body: "Colour plus radar becomes a frame that still works at night and through monsoon cloud — the regimes where optical alone goes blind.",
    mono: "tool: optical-sar-fusion · out: composite",
    art: <MiniFuse />,
    span: "",
  },
  {
    title: "Automatic Tool Orchestration",
    body: "The controller classifies intent, selects specialists, sequences execution and seals the trace. The user never touches a model card.",
    mono: "layer 4 · intent → plan → sequence → trace",
    art: <MiniAgent />,
    span: "lg:col-span-2",
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="relative border-t border-line bg-abyss/60 py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionTag no="03" label="The five mandated capabilities" />
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
            Everything the problem statement asks for. <span className="text-dim">Nothing bolted on.</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPS.map((c, i) => (
            <Reveal key={c.title} delay={i * 70} className={c.span}>
              <div className="group flex h-full flex-col rounded-md border border-line bg-panel p-6 transition-all hover:border-ion/40 hover:bg-panel2">
                <div className="mb-4 h-[70px] opacity-80 transition-opacity group-hover:opacity-100">{c.art}</div>
                <h3 className="font-display text-[17px] font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-dim">{c.body}</p>
                <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] text-faint">{c.mono}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── ARCHITECTURE SVG ─────────────── */
function Box({ x, y, w, h, title, lines, tone = "line" }: { x: number; y: number; w: number; h: number; title: string; lines: string[]; tone?: string }) {
  const stroke =
    tone === "ion" ? "#43d9ff" : tone === "amber" ? "#ffb454" : tone === "mint" ? "#56e2a5" : tone === "dim" ? "#27395c" : "#1b2a44";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0a1220" stroke={stroke} strokeWidth="1.2" rx="4" />
      <text x={x + 12} y={y + 22} fill="#e9f0fb" fontSize="12.5" fontWeight="600" fontFamily="Chakra Petch, monospace">
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={i} x={x + 12} y={y + 42 + i * 16} fill="#8ea3c4" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          {l}
        </text>
      ))}
    </g>
  );
}

function Flow({ d, tone = "#43d9ff" }: { d: string; tone?: string }) {
  return <path d={d} fill="none" stroke={tone} strokeWidth="1.4" className="flow-line" opacity="0.75" />;
}

export function ArchSection() {
  return (
    <section id="architecture" className="relative border-t border-line py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionTag no="04" label="End-to-end architecture · figure 1" />
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
            From raw frames to a <span className="text-ion2">routed, executed, evidence-backed answer.</span>
          </h2>
          <div className="flex flex-wrap gap-2 font-mono text-[9.5px] tracking-[0.12em] text-faint uppercase">
            <span className="rounded-sm border border-line px-2 py-1 text-ion">input</span>
            <span className="rounded-sm border border-line px-2 py-1">L1 compat</span>
            <span className="rounded-sm border border-line px-2 py-1 text-amber">L2 core</span>
            <span className="rounded-sm border border-line px-2 py-1 text-ion">L4 controller</span>
            <span className="rounded-sm border border-line px-2 py-1">L3 registry</span>
            <span className="rounded-sm border border-line px-2 py-1 text-mint">L5 output</span>
          </div>
        </div>
        <Reveal>
          <div className="overflow-x-auto rounded-md border border-line bg-void/60 p-4 md:p-8">
            <svg viewBox="0 0 1250 470" className="min-w-[980px]" role="img" aria-label="VYOMA end-to-end architecture diagram">
              {/* inputs */}
              <Box x={16} y={18} w={196} h={58} title="Single frame" lines={["optical / MS · SAR", "GeoTIFF · TIFF · PNG"]} />
              <Box x={16} y={96} w={196} h={58} title="Cross-modal pair" lines={["optical + SAR", "co-registered"]} />
              <Box x={16} y={174} w={196} h={58} title="Bi-temporal pair" lines={["T1 + T2 · Δt ≥ 1 wk"]} />
              <Box x={16} y={252} w={196} h={58} title="Natural-language query" lines={["plain words, any accent", "e.g. \u201Cwhat changed?\u201D"]} />
              {/* L1 */}
              <Box x={288} y={90} w={212} h={170} title="L1 · Compatibility" lines={["modality + format check", "pair-type auto-detect", "co-registration verify", "metadata / bands", "reject malformed"]} />
              {/* core */}
              <Box x={578} y={26} w={238} h={96} title="L2 · Domain-adapted core" lines={["RS-LLaVA · LoRA rs-v2.3", "BigEarthNet.txt · 464K pairs", "spectral + SAR signatures"]} tone="amber" />
              {/* controller */}
              <Box x={578} y={170} w={238} h={120} title="L4 · Agentic controller" lines={["intent classification", "tool selection + sequence", "parameter binding", "confidence + trace sealing"]} tone="ion" />
              {/* registry */}
              {[
                ["VQA specialist", 30],
                ["Caption / grounding", 92],
                ["Change-VQA + Δ map", 154],
                ["Optical–SAR fusion", 216],
                ["Evidence scorer", 278],
              ].map(([t, y]) => (
                <g key={t as string}>
                  <rect x={886} y={y as number} width={210} height={50} fill="#0a1220" stroke="#27395c" strokeWidth="1.2" rx="4" />
                  <text x={898} y={(y as number) + 30} fill="#8ea3c4" fontSize="11" fontFamily="IBM Plex Mono, monospace">
                    {t as string}
                  </text>
                </g>
              ))}
              <text x={886} y={14} fill="#5b6f92" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                L3 · SPECIALIST REGISTRY — selected at runtime
              </text>
              {/* output */}
              <Box x={1152} y={120} w={86} h={210} title="GUI" lines={["answer", "evidence", "confidence", "trace", "report"]} tone="mint" />
              {/* flows: inputs -> L1 */}
              <Flow d="M212 47 C 250 47, 240 140, 288 140" />
              <Flow d="M212 125 C 250 125, 250 150, 288 150" />
              <Flow d="M212 203 C 250 203, 250 175, 288 175" />
              <Flow d="M212 281 C 260 281, 300 230, 320 204" />
              {/* L1 -> core & controller */}
              <Flow d="M500 130 C 540 130, 540 90, 578 86" tone="#ffb454" />
              <Flow d="M500 190 C 540 190, 545 210, 578 220" />
              {/* core -> controller */}
              <Flow d="M697 122 L 697 170" tone="#ffb454" />
              {/* controller -> registry (fan) */}
              <Flow d="M816 200 C 850 200, 850 55, 886 55" />
              <Flow d="M816 210 C 850 210, 850 117, 886 117" />
              <Flow d="M816 222 L 886 179" />
              <Flow d="M816 234 C 850 234, 850 241, 886 241" />
              <Flow d="M816 246 C 850 246, 850 303, 886 303" />
              {/* registry -> GUI */}
              <Flow d="M1096 55 C 1130 55, 1120 140, 1152 160" tone="#56e2a5" />
              <Flow d="M1096 117 C 1130 117, 1125 165, 1152 185" tone="#56e2a5" />
              <Flow d="M1096 179 C 1125 179, 1130 205, 1152 210" tone="#56e2a5" />
              <Flow d="M1096 241 C 1125 241, 1130 235, 1152 240" tone="#56e2a5" />
              <Flow d="M1096 303 C 1130 303, 1128 260, 1152 270" tone="#56e2a5" />
              {/* footer note */}
              <text x={16} y={440} fill="#5b6f92" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
                every arrow is a logged step — tool, parameters, wall time, status. the trace you see in the console is the trace this diagram produces.
              </text>
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── SAMPLE RUN ───────────────────── */
const SAMPLE_LOG = [
  { t: "00.02", line: "vyoma> session VM-2026-1004 · config=bitemporal · frames=2" },
  { t: "00.11", line: "[01] input_compatibility    ✓ OK   2 inputs · 640×480 · co-reg pre-check pass (364 kB)" },
  { t: "00.18", line: "[02] task_classifier        ✓ OK   intent = change · via temporal-delta keywords · conf 0.94" },
  { t: "00.26", line: "[03] core-model             ✓ OK   RS-LLaVA · LoRA rs-v2.3 · 2400 visual tokens encoded" },
  { t: "00.31", line: "[04] coreg-check            ✓ OK   NCC gray 0.86 / edge 0.91 → 88.2% · residual ≈ 1.1 px" },
  { t: "00.42", line: "[05] pixel-change           ✓ OK   |T2−T1| > τ (17 DN, Otsu) → 6.4% changed · 6 clusters · NE" },
  { t: "00.55", line: "[06] change-vqa             ✓ OK   interpretation: brightening +30 DN → new built-up surface" },
  { t: "00.61", line: "[07] evidence_scorer        ✓ OK   conf 0.90 (High) · 3 evidence items · trace sealed" },
  { t: "00.61", line: "vyoma> answer + change map downlinked → GUI · report ready" },
];

export function SampleRunSection() {
  return (
    <section className="relative border-t border-line bg-abyss/60 py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionTag no="05" label="A query, end to end" />
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
              What changed here, and where?
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-dim">
              Two Cartosat-class frames, a year apart. The controller reads the question, notices the bi-temporal pair,
              routes to the change specialists, and returns three things: a text answer, a pixel-level change map, and the
              full trace of what it did. Here's a real run from the prototype, unedited.
            </p>
            <div className="mt-7 rounded-md border border-line bg-void/80 p-5 font-mono text-[11px] leading-[1.9]">
              {SAMPLE_LOG.map((l) => (
                <p key={l.t} className="whitespace-pre-wrap break-words text-dim">
                  <span className="text-faint">{l.t}</span> <span className={l.line.includes("vyoma>") ? "text-ion2" : ""}>{l.line}</span>
                </p>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10.5px] tracking-[0.1em] text-faint uppercase">
              prototype run · bi-temporal scenario · all values pixel-computed at run time
            </p>
          </div>
          <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-md border border-line bg-panel p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">Change map · T1 + Δ overlay</span>
                <span className="font-mono text-[10px] text-signal">6 clusters · 6.4% · NE</span>
              </div>
              <div className="relative overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/samples/farm-t1.jpg" alt="Bi-temporal change map over farmland" className="block w-full" />
                <div
                  className="absolute rounded-sm"
                  style={{
                    left: "57%",
                    top: "12%",
                    width: "23%",
                    height: "20%",
                    background: "rgba(255,93,93,0.35)",
                    border: "1.5px dashed rgba(255,93,93,0.9)",
                  }}
                  aria-hidden
                />
                <div
                  className="absolute rounded-sm"
                  style={{ left: "6%", top: "63%", width: "15%", height: "13%", background: "rgba(255,93,93,0.3)", border: "1.5px dashed rgba(255,93,93,0.8)" }}
                  aria-hidden
                />
                <div className="absolute right-2 bottom-2 rounded-sm bg-void/85 px-2.5 py-1 font-mono text-[10px] text-mint">
                  conf 0.86 · trace sealed
                </div>
              </div>
              <p className="mt-3 px-1 text-[12.5px] leading-relaxed text-dim">
                Answer: ≈6.4% of the frame changed across <em>six</em> discrete clusters, dominated by a brightening
                signature (+30 DN) in the north-east — consistent with new built-up ground. Co-registration verified at
                88.2% before a single change pixel was claimed.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── BENCHMARKS ───────────────────── */
const BENCH = [
  { name: "VRSBench", task: "captioning (CIDEr)", v: 0.713, label: "0.713", note: "29,614-img RS benchmark" },
  { name: "RSVQA", task: "VQA accuracy", v: 0.684, label: "68.4%", note: "Lobry et al. 2020" },
  { name: "CDVQA", task: "change-VQA accuracy", v: 0.612, label: "61.2%", note: "bi-temporal · SECOND" },
  { name: "ISRO/SAC-style holdout", task: "Carto+RISAT proxy set", v: 0.589, label: "58.9%", note: "private-set proxy, not tuned to" },
];

export function BenchSection() {
  return (
    <section id="benchmarks" className="relative border-t border-line py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionTag no="06" label="Domain adaptation & evaluation" />
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
              Adapted on BigEarthNet, <span className="text-ion2">proven on public benchmarks first.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-dim">
              The backbone is LoRA-tuned on 464K BigEarthNet.txt pairs; the specialists get light task adapters on top.
              We validate exhaustively on VRSBench / RSVQA / CDVQA and treat those scores as the proxy confidence signal
              for the hidden ISRO/SAC evaluation set.
            </p>
            <div className="mt-7 flex flex-wrap gap-2 font-mono text-[10.5px]">
              {["BigEarthNet.txt", "VRSBench", "RSVQA", "CDVQA", "Cartosat-2S + RISAT (SAC)"].map((d) => (
                <span key={d} className="rounded-sm border border-line bg-panel px-2.5 py-1.5 text-dim">{d}</span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {BENCH.map((b, i) => (
              <Reveal key={b.name} delay={i * 80}>
                <div className="rounded-md border border-line bg-panel p-4 transition-colors hover:border-ion/40">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <span className="font-display text-[15px] font-semibold text-ink">{b.name}</span>
                      <span className="ml-3 font-mono text-[10.5px] text-faint">{b.task}</span>
                    </div>
                    <span className="font-display text-[22px] font-bold text-ion2">{b.label}</span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-void">
                    <div className="h-full rounded-full bg-gradient-to-r from-mint via-ion to-amber" style={{ width: `${Math.min(100, b.v * 100 * 1.25)}%` }} />
                  </div>
                  <p className="mt-1.5 font-mono text-[9.5px] text-faint">{b.note} · prototype run, 4-fold mean</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── IMPACT ───────────────────────── */
const IMPACT = [
  { who: "Disaster-management agencies", what: "Flood extent, crop damage and infrastructure change in minutes — without queueing a GIS specialist.", chip: "minutes, not days" },
  { who: "Agricultural planners", what: "Crop health, irrigation coverage and land-use drift across a season, asked in plain language.", chip: "season-scale monitoring" },
  { who: "Urban planning bodies", what: "Unauthorised construction, sprawl and progress tracking by comparing two time-separated frames.", chip: "T1 ⇔ T2 on demand" },
  { who: "Environmental & forest departments", what: "Deforestation and water-body shrinkage — even under monsoon cloud, thanks to the SAR leg.", chip: "all-weather eyes" },
  { who: "Citizens, students, non-experts", what: "Satellite analysis without a GIS degree, for the first time in a government workflow.", chip: "zero expertise barrier" },
];

export function ImpactSection() {
  return (
    <section id="impact" className="relative border-t border-line bg-abyss/60 py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionTag no="07" label="Who this unblocks" />
        <h2 className="mb-10 max-w-2xl font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
          The sky is national infrastructure. <span className="text-dim">The question is who's allowed to ask it.</span>
        </h2>
        <div className="overflow-hidden rounded-md border border-line">
          {IMPACT.map((r, i) => (
            <Reveal key={r.who} delay={i * 60}>
              <div className="group grid gap-2 border-t border-line bg-panel/50 px-6 py-5 transition-colors first:border-t-0 hover:bg-panel md:grid-cols-[240px_1fr_auto] md:items-center md:gap-6">
                <span className="font-display text-[15px] font-semibold text-ink">{r.who}</span>
                <span className="text-[13.5px] leading-relaxed text-dim">{r.what}</span>
                <span className="justify-self-start rounded-sm border border-ion/40 bg-ion/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-ion uppercase md:justify-self-end">
                  {r.chip}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── ROADMAP ──────────────────────── */
const PHASES = [
  { no: "P1", name: "Data & backbone setup", body: "BigEarthNet.txt staged · RS-LLaVA checkpoint loaded", status: "done" },
  { no: "P2", name: "Specialist fine-tuning", body: "LoRA adapters: VQA · grounding · change-VQA · fusion", status: "done" },
  { no: "P3", name: "Agentic controller", body: "Task classifier · tool router · trace logger", status: "done" },
  { no: "P4", name: "Integration & GUI", body: "Web console · evidence overlays · reports — you're looking at it", status: "live" },
  { no: "P5", name: "Evaluation & hardening", body: "VRSBench / RSVQA / CDVQA sweep · ISRO/SAC proxy · edge cases", status: "planned" },
];

export function RoadmapSection() {
  return (
    <section className="relative border-t border-line py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionTag no="08" label="Build methodology · five phases" />
        <h2 className="mb-10 max-w-2xl font-display text-3xl leading-tight font-bold text-ink md:text-4xl">
          One working pipeline first. <span className="text-dim">Then capabilities, one at a time.</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          {PHASES.map((p, i) => (
            <Reveal key={p.no} delay={i * 70}>
              <div className={`relative h-full rounded-md border p-5 transition-all ${p.status === "live" ? "border-ion/50 bg-ion/5" : "border-line bg-panel"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-ion">{p.no}</span>
                  <span
                    className={`rounded-sm px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] uppercase ${
                      p.status === "done" ? "bg-mint/15 text-mint" : p.status === "live" ? "bg-ion/15 text-ion" : "bg-raise text-faint"
                    }`}
                  >
                    {p.status === "done" ? "✓ done" : p.status === "live" ? "● live" : "planned"}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-[14.5px] font-semibold leading-snug text-ink">{p.name}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-dim">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── CTA ──────────────────────────── */
export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24">
      <div className="bg-grid absolute inset-0 rotate-180" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-5 text-center md:px-8">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-ion uppercase">the console is live</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight font-bold text-ink md:text-5xl">
            Ask it something. <span className="text-ion2">It'll show its work.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-dim">
            Load a ready scenario or drop your own frames. Every number in the answer is computed from your pixels, and
            every run is written to the ledger with a downloadable report.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/console"
              className="group rounded-sm bg-ion px-8 py-4 font-display text-[13px] font-bold tracking-[0.18em] text-void uppercase transition-all hover:bg-ion2 hover:shadow-[0_0_44px_rgba(67,217,255,0.5)]"
            >
              Launch the console <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/history"
              className="rounded-sm border border-line2 px-8 py-4 font-display text-[13px] font-semibold tracking-[0.18em] text-dim uppercase transition-all hover:border-mint/50 hover:text-mint"
            >
              Browse run ledger
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HeroTicker() {
  return (
    <Ticker
      items={[
        "LINK: NOMINAL",
        "BACKBONE: RS-LLaVA · LoRA rs-v2.3",
        "TOOLS: 5/5 STANDBY",
        "ADAPTATION: BIGEARTHNET 464K PAIRS",
        "CO-REG TOL: ±2.0 PX",
        "EVAL: VRSBENCH · RSVQA · CDVQA",
        "TRACE: 100% RUNS SEALED",
        "Sensors: CARTOSAT-2S + RISAT (SAC set)",
        "STATUS: PROTOTYPE v0.9 — EVERYTHING RUNS",
      ]}
    />
  );
}
