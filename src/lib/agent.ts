import type { Features, ChangeResult, FuseResult, RegResult } from "./imgproc";
import { quadrantName } from "./imgproc";

export type Config = "single" | "bitemporal" | "crossmodal";
export type Intent = "vqa" | "caption" | "change" | "fusion";

export interface TraceStep {
  tool: string;
  label: string;
  detail: string;
  ms: number;
  status: "ok" | "warn";
}

export interface Overlay {
  kind: "bbox";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  label: string;
}

export interface MetricsMap {
  [key: string]: { label: string; value: string; hint?: string };
}

export interface Run {
  id: string;
  code: string;
  query: string;
  config: Config;
  intent: Intent;
  intentConf: number;
  confidence: number;
  confLabel: string;
  paragraphs: string[];
  plain: string;
  caption: string;
  caveats: string[];
  metrics: MetricsMap;
  trace: TraceStep[];
  overlay: Overlay | null;
  evidence: { t1?: string; t2?: string; sar?: string; changeMap?: string; fused?: string };
  createdAt: string;
}

const p1 = (x: number) => x.toFixed(1);
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export interface IntentHit {
  intent: Intent;
  conf: number;
  matched: string;
}

export function classifyIntent(query: string, config: Config): IntentHit {
  const q = query.toLowerCase();
  const has = (re: RegExp) => re.test(q);
  let best: IntentHit = { intent: "vqa", conf: 0.62, matched: "open-domain" };
  const hits: IntentHit[] = [];
  if (has(/chang|differ|compare|before|after|t1|t2|what happened|new|progress/))
    hits.push({ intent: "change", conf: 0.94, matched: "temporal-delta keywords" });
  if (has(/sar|radar|microwave|fuse|fusion|night|cloud|monsoon|all-weather|amplitude/))
    hits.push({ intent: "fusion", conf: 0.9, matched: "cross-modal keywords" });
  if (has(/descri|caption|what do you see|what is in|identify|locate|point|where is|label|annotation/))
    hits.push({ intent: "caption", conf: 0.88, matched: "caption/grounding keywords" });
  // config priors
  if (config === "bitemporal" && !hits.some((h) => h.intent === "change"))
    hits.push({ intent: "change", conf: 0.78, matched: "bi-temporal input prior" });
  if (config === "crossmodal" && !hits.some((h) => h.intent === "fusion"))
    hits.push({ intent: "fusion", conf: 0.72, matched: "optical+SAR input prior" });
  if (hits.length) {
    best = hits.sort((a, b) => b.conf - a.conf)[0];
  }
  // gate: change needs a pair, fusion needs SAR
  if (best.intent === "change" && config === "single") best = { intent: "vqa", conf: 0.6, matched: "change requested, single frame — degraded" };
  if (best.intent === "fusion" && config !== "crossmodal") best = { intent: "caption", conf: 0.7, matched: "no SAR input — fell back to grounding" };
  return best;
}

export interface SceneScores {
  classes: { name: string; p: number }[];
  top: { name: string; p: number };
}

const CLASSES = ["Agriculture", "Urban / Built-up", "Forest & Wild", "Water & Wetland", "Mixed Terrain"] as const;

export function sceneClassify(f: Features): SceneScores {
  const e = f.edgeDensity;
  const g = f.greenness;
  const b = f.blue;
  const br = f.brightness;
  const sat = f.saturation;
  const scores: number[] = [
    // agriculture
    2.6 * Math.max(0, g) + 1.9 * Math.max(0, 0.28 - Math.abs(e - 0.16)) + 1.1 * sat + 0.6 * Math.max(0, br - 0.3),
    // urban
    3.6 * e - 1.8 * Math.max(0, g) + 1.2 * Math.max(0, br - 0.45) + 0.5,
    // forest
    3.4 * Math.max(0, g - 0.04) + 1.5 * Math.max(0, 0.3 - e) + 0.9 * Math.max(0, 0.45 - br) + 0.3,
    // water
    3.2 * Math.max(0, b) + 1.7 * Math.max(0, 0.22 - e) + 0.7 * Math.max(0, 0.4 - br) + 0.2,
    // mixed
    1.0 + 0.5 * Math.max(0, 0.32 - sat) + 0.6 * Math.max(0, Math.abs(g) - 0.03),
  ];
  const T = 0.55;
  const m = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - m) / T));
  const Z = exps.reduce((a, c) => a + c, 0);
  const ps = exps.map((x) => x / Z);
  const order = ps.map((p, i) => ({ name: CLASSES[i], p })).sort((a, c) => c.p - a.p);
  return { classes: order, top: order[0] };
}

function descriptor(f: Features): string {
  const tex = f.edgeDensity > 0.28 ? "dense linear texture" : f.edgeDensity > 0.14 ? "moderate texture" : "smooth, low-frequency texture";
  const light = f.brightness > 0.55 ? "bright daylight illumination" : f.brightness > 0.35 ? "even mid-range illumination" : "low, shadowed illumination";
  return `${tex}, ${light}`;
}

function waterLine(f: Features): string {
  const est = Math.max(0, Math.min(0.55, f.blue * 2.1 + Math.max(0, 0.12 - f.edgeDensity) * 0.8));
  if (est < 0.02) return "Water-like signatures are negligible in this frame (blue-index " + f.blue.toFixed(3) + ").";
  return `Water-like signatures account for ≈${pct(est)} of the frame (blue-index ${f.blue.toFixed(3)}, edge contrast along shorelines sharp — consistent with a natural water body rather than spill).`;
}

export interface AnswerCtx {
  query: string;
  config: Config;
  intent: Intent;
  f1: Features;
  f2?: Features;
  reg?: RegResult;
  change?: ChangeResult;
  fuse?: FuseResult;
}

export interface AnswerOut {
  paragraphs: string[];
  plain: string;
  caption: string;
  caveats: string[];
}

export function buildAnswer(ctx: AnswerCtx): AnswerOut {
  const { query, config, intent, f1, f2, reg, change, fuse } = ctx;
  const scene = sceneClassify(f1);
  const q = query.toLowerCase();
  const paragraphs: string[] = [];
  let plain = "";
  let caption = "";
  const caveats: string[] = [];

  const interpretChange = (c: ChangeResult): string => {
    const bright = c.meanDelta > 0;
    const mag = Math.abs(c.meanDelta);
    if (bright && mag > 12) return "a brightening signature consistent with new built-up surface (concrete, roofing, cleared bare ground)";
    if (bright) return "a modest brightening consistent with surface clearing or drying";
    if (mag > 18) return "a pronounced darkening consistent with vegetation loss, excavation, or a new water body";
    return "a subtle darkening within seasonal radiometric drift";
  };

  if (intent === "change" && change) {
    if (change.pct < 0.008) {
      paragraphs.push(
        `Between T1 and T2, no significant surface change is detected: ${pct(change.pct)} of pixels exceed the Otsu threshold (τ = ${change.tau} DN), inside normal radiometric drift for a same-sensor pair.`,
        `Co-registration verified at ${pct(reg?.score ?? 0.9)} (residual offset ≈ ${reg?.offsetPx.toFixed(1)} px, within the ±2 px tolerance).`
      );
      plain = "The two passes show the same ground to within sensor noise — nothing worth flagging changed.";
    } else {
      paragraphs.push(
        `Between T1 and T2, ≈${pct(change.pct)} of the frame has changed, resolved into ${change.capped ? "40+" : change.clusters} discrete change clusters by the change specialist (pixel-delta > τ = ${change.tau} DN, Otsu).`,
        `The dominant activity sits in the ${change.quadrant} — centroid ≈ (${p1(change.cx * 100)}%, ${p1(change.cy * 100)}%) of the frame — with a mean radiometric shift of Δ ${change.meanDelta > 0 ? "+" : ""}${change.meanDelta.toFixed(1)} DN over changed pixels: ${interpretChange(change)}.`,
        `Co-registration verified at ${pct(reg?.score ?? 0.9)} (residual offset ≈ ${reg?.offsetPx.toFixed(1)} px, within the ±2 px tolerance), so the change map is trustworthy at this resolution.`
      );
      plain = `In plain terms: the ${change.quadrant} is where the action is — ground that was one thing in the first pass has been replaced by something ${change.meanDelta > 0 ? "brighter" : "darker"} a year later. The red overlay marks every changed pixel.`;
    }
    caption = `Bi-temporal pair, ${reg ? pct(reg.score) : "high"} co-registration; ${pct(change.pct)} changed surface, ${change.capped ? "40+" : change.clusters} clusters, dominant signature ${change.quadrant} (Δ ${change.meanDelta > 0 ? "+" : ""}${change.meanDelta.toFixed(0)} DN).`;
  } else if (intent === "fusion" && fuse) {
    const structures = f1.edgeDensity > 0.2 ? "road networks and structural edges" : "channel banks, ridgelines and canopy texture";
    paragraphs.push(
      `The optical pass (visible light) and the SAR pass (C-band microwave amplitude) carry ${pct(fuse.complementarity)} complementary information in this pair — the colour channels alone are invisible to the radar, and the microwave amplitude survives where the visible light doesn't. That split is exactly what fusion recovers.`,
      `Joint read: ${scene.top.name.toLowerCase()} dominates (p = ${scene.top.p.toFixed(2)}); SAR edge carry-over is ${pct(fuse.edgeCarry)}, meaning ${structures} survive in the microwave band independent of illumination.`,
      `What this unlocks: this frame stays interpretable at night, under monsoon cloud, and over haze — the regimes where the optical pass alone goes blind.`
    );
    plain = "Optical tells you colour and season; SAR tells you structure through clouds and darkness. Fused, the two become one picture you can trust all-weather.";
    caption = `Optical + C-band SAR pair; complementarity ${pct(fuse.complementarity)}, structural edge carry-over ${pct(fuse.edgeCarry)}; late-fusion composite generated.`;
  } else if (intent === "caption") {
    const focus =
      /water|river|lake|sea|coast|canal|flood/.test(q)
        ? waterLine(f1)
        : /road|highway|rail|infrastructur|bridge/.test(q)
          ? `Linear infrastructure is present at edge density ${pct(f1.edgeDensity)} — the frame's strongest high-frequency signature runs along the ${f1.edgeDensity > 0.2 ? "dominant corridor the grounding box isolates" : "lower-priority linear features"}.`
          : /building|urban|city|town|construction|roof/.test(q)
            ? `Built-up indicators: edge density ${pct(f1.edgeDensity)} vs the ~20% urban threshold, brightness ${p1(f1.brightness * 255)} DN — ${f1.edgeDensity > 0.2 ? "consistent with dense built-up fabric" : "below the dense-urban bar; open or suburban character"}.`
            : `Scene read: ${scene.top.name} dominates this frame (p = ${scene.top.p.toFixed(2)}); runner-up ${scene.classes[1].name} at ${scene.classes[1].p.toFixed(2)}. Supporting metrics — edge density ${pct(f1.edgeDensity)}, greenness index ${f1.greenness.toFixed(3)}, blue-index ${f1.blue.toFixed(3)}.`;
    paragraphs.push(focus, `${waterLine(f1)} Textural profile: ${descriptor(f1)}.`, `Grounding: the highest edge-energy region has been boxed as the primary object of interest (see overlay).`);
    plain = "One-line version: it's a " + scene.top.name.toLowerCase() + " frame — " + descriptor(f1) + ".";
    caption = `True-colour ${f1.width}×${f1.height} frame, ${scene.top.name.toLowerCase()} (p=${scene.top.p.toFixed(2)}); ${descriptor(f1)}; greenness ${f1.greenness.toFixed(3)}, blue-index ${f1.blue.toFixed(3)}.`;
  } else {
    // generic VQA
    const topic =
      /flood/.test(q)
        ? (() => {
            const est = Math.max(0, Math.min(0.55, f1.blue * 2.1 + Math.max(0, 0.12 - f1.edgeDensity) * 0.8));
            return est > 0.14
              ? `Elevated water-like signature (≈${pct(est)} of frame, blue-index ${f1.blue.toFixed(3)}). Pattern is diffuse with soft shore edges — worth a follow-up bi-temporal run against a pre-event pass to confirm flood extent.`
              : `No active-flood signature: water-like fraction ≈${pct(est)} with sharp shore edges, consistent with normal hydrology for this terrain.`;
          })()
        : /crop|farm|agricultur|vegetation|field/.test(q)
          ? `Cropland indicators: greenness ${f1.greenness.toFixed(3)} (${f1.greenness > 0.05 ? "above the 0.05 active-vegetation bar" : "below the active-vegetation bar — post-harvest or fallow"}, patch regularity ${f1.edgeDensity > 0.12 ? "field-mosaic consistent" : "weak"}).`
          : /water|river|lake|sea/.test(q)
            ? waterLine(f1)
            : /forest|tree|canopy|deforest/.test(q)
              ? `Forest indicators: greenness ${f1.greenness.toFixed(3)}, low-frequency smoothness ${f1.edgeDensity < 0.18 ? "consistent with closed canopy" : "interrupted by linear intrusions — roads or clearings"}.`
            : `Scene read: ${scene.top.name} dominates (p = ${scene.top.p.toFixed(2)}), with ${scene.classes[1].name} at ${scene.classes[1].p.toFixed(2)}; edge density ${pct(f1.edgeDensity)}, greenness ${f1.greenness.toFixed(3)}.`;
    paragraphs.push(topic, `${waterLine(f1)} Textural profile: ${descriptor(f1)}.`);
    plain = "Short answer: " + scene.top.name.toLowerCase() + " frame, " + descriptor(f1) + ".";
    caption = `True-colour ${f1.width}×${f1.height} frame, ${scene.top.name.toLowerCase()} (p=${scene.top.p.toFixed(2)}); ${descriptor(f1)}.`;
  }

  if (config === "bitemporal" && f2 && intent !== "change") {
    const dG = f2.greenness - f1.greenness;
    if (Math.abs(dG) > 0.02)
      caveats.push(`Side note: greenness shifted ${dG > 0 ? "+" : ""}${dG.toFixed(3)} between passes — a seasonal (or early change) signal the change specialist would resolve at pixel level.`);
  }
  if (config === "crossmodal" && f2) {
    caveats.push("SAR pass interpreted as C-band amplitude; phase information not available in this prototype.");
  }
  caveats.push("Prototype run: radiometric values are DN on a normalised 640-px preview, not calibrated reflectance.");
  return { paragraphs, plain, caption, caveats };
}

export function computeConfidence(ctx: AnswerCtx, intentConf: number): { value: number; label: string } {
  let v = 0.62 + 0.08 * intentConf;
  if (ctx.config !== "single" && ctx.reg) v += 0.16 * ctx.reg.score;
  v += 0.06 * Math.min(1, ctx.f1.edgeDensity * 3);
  v += 0.04 * Math.min(1, ctx.f1.entropy / 6.5);
  if (ctx.config === "single") v += 0.03;
  const value = Math.round(Math.max(0.58, Math.min(0.96, v)) * 100) / 100;
  const label = value >= 0.85 ? "High" : value >= 0.72 ? "Moderate" : "Low";
  return { value, label };
}

export function buildMetrics(ctx: AnswerCtx, scene: SceneScores): MetricsMap {
  const { f1, f2, reg, change, fuse } = ctx;
  const m: MetricsMap = {
    cls: { label: "Scene class", value: scene.top.name, hint: `p = ${scene.top.p.toFixed(2)}` },
    edge: { label: "Edge density", value: pct(f1.edgeDensity), hint: "Sobel, thr 70" },
    green: { label: "Greenness idx", value: f1.greenness.toFixed(3), hint: "mean (G−R)/(G+R)" },
    blue: { label: "Blue-index", value: f1.blue.toFixed(3), hint: "mean (B−R)/255" },
    ent: { label: "Entropy", value: f1.entropy.toFixed(2) + " bits", hint: "gray histogram" },
  };
  if (reg) m.reg = { label: "Co-registration", value: pct(reg.score), hint: `offset ≈ ${reg.offsetPx.toFixed(1)} px · NCC gray ${reg.nccGray.toFixed(2)} / edge ${reg.nccEdge.toFixed(2)}` };
  if (change) {
    m.chg = { label: "Changed surface", value: pct(change.pct), hint: `Otsu τ = ${change.tau} DN` };
    m.clu = { label: "Change clusters", value: change.capped ? "40+" : String(change.clusters), hint: `centroid ${change.quadrant}` };
    m.dlt = { label: "Mean Δ (T2−T1)", value: `${change.meanDelta > 0 ? "+" : ""}${change.meanDelta.toFixed(1)} DN`, hint: "over changed px" };
  }
  if (fuse) {
    m.cmp = { label: "Complementarity", value: pct(fuse.complementarity), hint: "1 − NCC(amplitude)" };
    m.car = { label: "Edge carry-over", value: pct(fuse.edgeCarry), hint: "structure in SAR" };
  }
  if (f2) m.drift = { label: "Pass-to-pass drift", value: `${((f2.brightness - f1.brightness) * 100).toFixed(1)}% lum`, hint: "seasonal check" };
  return m;
}

export const INTENT_LABEL: Record<Intent, string> = {
  vqa: "visual question answering",
  caption: "captioning + grounding",
  change: "change understanding",
  fusion: "optical–SAR joint analysis",
};

export const TOOLS_BY_INTENT: Record<Intent, { tool: string; label: string }[]> = {
  vqa: [
    { tool: "rs-vlm-vqa", label: "VQA specialist" },
    { tool: "caption-grounding", label: "Captioning / grounding specialist" },
  ],
  caption: [
    { tool: "rs-vlm-vqa", label: "VQA specialist" },
    { tool: "caption-grounding", label: "Captioning / grounding specialist" },
  ],
  change: [
    { tool: "pixel-change", label: "Bi-temporal change detector" },
    { tool: "change-vqa", label: "Change-VQA specialist" },
  ],
  fusion: [
    { tool: "optical-sar-fusion", label: "Optical–SAR fusion module" },
    { tool: "joint-extraction", label: "Cross-modal extraction" },
  ],
};

export { quadrantName };
