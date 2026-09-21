import type { QueryRow } from "@/db/schema";
import type { Run, Config, Intent } from "./agent";

export function rowToRun(r: QueryRow): Run {
  return {
    id: r.id,
    code: r.code,
    query: r.queryText,
    config: r.config as Config,
    intent: r.intent as Intent,
    intentConf: 0.9,
    confidence: r.confidence,
    confLabel: r.confLabel,
    paragraphs: JSON.parse(r.answer),
    plain: r.plain,
    caption: r.caption,
    caveats: r.caveats,
    metrics: r.metrics,
    trace: r.trace,
    overlay: r.overlay,
    evidence: r.evidence,
    createdAt: r.createdAt.toISOString(),
  };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function reportHtml(run: Run): string {
  const metricRows = Object.values(run.metrics)
    .map((m) => `<tr><td>${esc(m.label)}</td><td class="v">${esc(m.value)}</td><td class="h">${esc(m.hint ?? "")}</td></tr>`)
    .join("");
  const traceRows = run.trace
    .map(
      (t) =>
        `<tr><td class="mono">${esc(t.tool)}</td><td>${esc(t.label)}</td><td class="d">${esc(t.detail)}</td><td class="v">${t.ms} ms</td><td>${t.status === "warn" ? "⚠ warn" : "✓ ok"}</td></tr>`
    )
    .join("");
  const ev = run.evidence;
  const imgs: { label: string; src?: string }[] = [
    { label: run.config === "crossmodal" ? "Optical pass" : run.config === "bitemporal" ? "Pass T1" : "Input frame", src: ev.t1 },
    { label: run.config === "crossmodal" ? "SAR pass (C-band)" : run.config === "bitemporal" ? "Pass T2" : "", src: ev.t2 },
    { label: "Change map (T1 + Δ overlay)", src: ev.changeMap },
    { label: "Fused composite (optical ⊕ SAR)", src: ev.fused },
  ].filter((i) => i.src && i.label);
  const imgHtml = imgs
    .map(
      (i) =>
        `<figure><img src="${i.src}" alt="${esc(i.label)}" /><figcaption>${esc(i.label)}</figcaption></figure>`
    )
    .join("");
  const date = new Date(run.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  return `<!doctype html>
<html><head><meta charset="utf-8" />
<title>VYOMA Analysis Report · ${esc(run.code)}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#101828;background:#fff;margin:0;padding:40px 48px;max-width:960px}
  .kicker{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.18em;color:#057a9e;text-transform:uppercase}
  h1{font-size:26px;margin:6px 0 2px;letter-spacing:-.01em}
  .sub{color:#667085;font-size:13px;margin:0 0 24px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#344054;border-bottom:1px solid #e4e7ec;padding-bottom:6px;margin:28px 0 12px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .cell{border:1px solid #e4e7ec;border-radius:8px;padding:10px 12px}
  .cell .l{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#98a2b3}
  .cell .v{font-size:17px;font-weight:650;margin-top:2px}
  .cell .h{font-size:11px;color:#98a2b3;margin-top:2px}
  .q{background:#f2f6fa;border-left:3px solid #057a9e;padding:12px 16px;font-size:15px;border-radius:0 8px 8px 0}
  p{font-size:14px;line-height:1.65;margin:8px 0}
  .plain{background:#f0fdf6;border-left:3px solid #12b76a;padding:12px 16px;font-size:14px;border-radius:0 8px 8px 0}
  table{width:100%;border-collapse:collapse;font-size:12.5px}
  th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#98a2b3;padding:6px 8px;border-bottom:1px solid #e4e7ec}
  td{padding:7px 8px;border-bottom:1px solid #f2f4f7;vertical-align:top}
  td.v{font-weight:650;white-space:nowrap}
  td.d{color:#475467}
  td.mono, .mono{font-family:ui-monospace,monospace}
  .imgs{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
  figure{margin:0}
  img{width:100%;border-radius:8px;border:1px solid #e4e7ec;display:block}
  figcaption{font-size:11px;color:#667085;margin-top:6px;font-family:ui-monospace,monospace}
  .caveat{font-size:12px;color:#b54708;background:#fffaeb;border:1px solid #fedf89;border-radius:8px;padding:10px 14px;margin:8px 0}
  .foot{margin-top:36px;padding-top:14px;border-top:1px solid #e4e7ec;font-size:11px;color:#98a2b3;display:flex;justify-content:space-between}
  @media print{body{padding:20px}}
</style></head><body>
  <div class="kicker">VYOMA · Agentic Vision-Language Assistant · Smart India Hackathon 2026</div>
  <h1>Analysis Report — ${esc(run.code)}</h1>
  <p class="sub">Generated ${date} IST · ISRO PS 26167 (SatQuery AI) prototype · all values computed from the uploaded pixels at run time</p>

  <h2>Query</h2>
  <div class="q">“${esc(run.query)}”</div>

  <h2>Run summary</h2>
  <div class="grid">
    <div class="cell"><div class="l">Intent</div><div class="v">${esc(run.intent)}</div><div class="h">routed by task classifier</div></div>
    <div class="cell"><div class="l">Input config</div><div class="v">${esc(run.config)}</div><div class="h">${run.config === "single" ? "single frame" : run.config === "bitemporal" ? "T1 + T2 pair" : "optical + SAR pair"}</div></div>
    <div class="cell"><div class="l">Confidence</div><div class="v">${run.confidence.toFixed(2)} · ${esc(run.confLabel)}</div><div class="h">confidence &amp; evidence scorer</div></div>
    <div class="cell"><div class="l">Tools executed</div><div class="v">${run.trace.length}</div><div class="h">auditable trace sealed</div></div>
  </div>

  <h2>Answer (evidence-backed)</h2>
  ${run.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
  ${run.plain ? `<div class="plain"><strong>In plain terms:</strong> ${esc(run.plain)}</div>` : ""}
  <p style="font-size:13px;color:#475467"><strong>Auto-caption:</strong> ${esc(run.caption)}</p>

  <h2>Computed metrics</h2>
  <table><thead><tr><th>Metric</th><th>Value</th><th>Method / note</th></tr></thead><tbody>${metricRows}</tbody></table>

  <h2>Visual evidence</h2>
  ${imgHtml ? `<div class="imgs">${imgHtml}</div>` : "<p>No composite evidence for this run.</p>"}

  <h2>Execution trace (auditable)</h2>
  <table><thead><tr><th>Tool</th><th>Component</th><th>Detail</th><th>Time</th><th>Status</th></tr></thead><tbody>${traceRows}</tbody></table>

  <h2>Caveats</h2>
  ${run.caveats.map((c) => `<div class="caveat">${esc(c)}</div>`).join("")}

  <div class="foot"><span>VYOMA · Team Smart India Hackathon 2026 · PS 26167 (SatQuery AI) · ISRO, Department of Space</span><span>${esc(run.code)}</span></div>
</body></html>`;
}
