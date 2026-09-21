import sharp from "sharp";

/**
 * VYOMA imaging core.
 * All metrics shown in the UI are computed here from the actual pixels of the
 * uploaded frames (or demo pairs generated on the fly) — no canned numbers.
 */

export interface RGB {
  width: number;
  height: number;
  data: Buffer; // raw RGB
  gray: Float32Array;
}

export interface BandInfo {
  mean: number;
  std: number;
}

export interface Features {
  width: number;
  height: number;
  format: string;
  sizeKb: number;
  R: BandInfo;
  G: BandInfo;
  B: BandInfo;
  brightness: number; // 0..1
  contrast: number; // std of gray, 0..255
  saturation: number; // 0..1 mean
  greenness: number; // mean (G-R)/(G+R)
  blue: number; // mean (B-R)/255
  entropy: number; // bits
  edgeDensity: number; // 0..1
  edgeMag: Float32Array;
  lapVar: number; // textural sharpness
}

export interface Decoded {
  rgb: RGB;
  format: string;
  sizeKb: number;
  jpeg: Buffer; // 640-px normalised preview
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function grayOf(data: Buffer, w: number, h: number): Float32Array {
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 3;
    gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }
  return gray;
}

export async function decodeImage(b64: string): Promise<Decoded> {
  const buf = Buffer.from(b64, "base64");
  const meta = await sharp(buf).metadata();
  const { data, info } = await sharp(buf)
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgb: RGB = { width: info.width, height: info.height, data, gray: grayOf(data, info.width, info.height) };
  const jpeg = await fromRaw(data, info.width, info.height).jpeg({ quality: 82 }).toBuffer();
  return { rgb, format: meta.format ?? "raster", sizeKb: Math.round(buf.length / 1024), jpeg };
}

export function fromRaw(data: Buffer, width: number, height: number) {
  return sharp(data, { raw: { width, height, channels: 3 } });
}

export async function resizeTo(rgb: RGB, width: number, height: number): Promise<RGB> {
  const data = await fromRaw(rgb.data, rgb.width, rgb.height).resize(width, height).raw().toBuffer();
  return { width, height, data, gray: grayOf(data, width, height) };
}

export function sobel(gray: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] +
        gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      const gy =
        -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] +
        gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      out[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return out;
}

export function downsample(src: Float32Array, w: number, h: number, size: number): Float32Array {
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor((x * w) / size);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * w) / size));
      const y0 = Math.floor((y * h) / size);
      const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * h) / size));
      let s = 0;
      let c = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          s += src[yy * w + xx];
          c++;
        }
      }
      out[y * size + x] = s / c;
    }
  }
  return out;
}

export function ncc(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  const d = Math.sqrt(da * db);
  return d === 0 ? 0 : num / d;
}

export function otsu(hist: Uint32Array, total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let bestT = 0;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      bestT = t;
    }
  }
  return bestT;
}

export function extractFeatures(rgb: RGB, format: string, sizeKb: number): Features {
  const { width: w, height: h, data, gray } = rgb;
  const n = w * h;
  const sums = [0, 0, 0, 0, 0, 0];
  let sat = 0;
  let green = 0;
  let blue = 0;
  const hist = new Uint32Array(256);
  let gsum = 0;
  let gsum2 = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    sums[0] += r;
    sums[1] += r * r;
    sums[2] += g;
    sums[3] += g * g;
    sums[4] += b;
    sums[5] += b * b;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    sat += mx === 0 ? 0 : (mx - mn) / mx;
    green += (g - r) / (g + r + 1e-6);
    blue += (b - r) / 255;
    const gi = clamp(Math.round(gray[i]), 0, 255);
    hist[gi]++;
    gsum += gray[i];
    gsum2 += gray[i] * gray[i];
  }
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (hist[i]) {
      const p = hist[i] / n;
      entropy -= p * Math.log(p);
    }
  }
  const gm = gsum / n;
  const gs = Math.sqrt(Math.max(0, gsum2 / n - gm * gm));
  const edge = sobel(gray, w, h);
  let esum = 0;
  let ecount = 0;
  for (let i = 0; i < n; i++) {
    esum += edge[i];
    if (edge[i] > 70) ecount++;
  }
  const em = esum / n;
  let evar = 0;
  for (let i = 0; i < n; i++) {
    const d = edge[i] - em;
    evar += d * d;
  }
  const band = (i: number): BandInfo => ({
    mean: sums[i] / n,
    std: Math.sqrt(Math.max(0, sums[i + 1] / n - (sums[i] / n) ** 2)),
  });
  return {
    width: w,
    height: h,
    format,
    sizeKb,
    R: band(0),
    G: band(2),
    B: band(4),
    brightness: gm / 255,
    contrast: gs,
    saturation: sat / n,
    greenness: green / n,
    blue: blue / n,
    entropy,
    edgeDensity: ecount / n,
    edgeMag: edge,
    lapVar: evar / n,
  };
}

export interface RegResult {
  score: number; // 0..1
  offsetPx: number;
  nccGray: number;
  nccEdge: number;
}

export function coRegistration(a: RGB, b: RGB): RegResult {
  const s = 64;
  const gA = downsample(a.gray, a.width, a.height, s);
  const gB = downsample(b.gray, b.width, b.height, s);
  const eA = downsample(sobel(a.gray, a.width, a.height), a.width, a.height, s);
  const eB = downsample(sobel(b.gray, b.width, b.height), b.width, b.height, s);
  const n1 = ncc(gA, gB);
  const n2 = ncc(eA, eB);
  const score = clamp(0.6 * n1 + 0.4 * n2, 0, 1);
  return { score, offsetPx: Math.max(0, (1 - score) * 9), nccGray: n1, nccEdge: n2 };
}

export interface ChangeResult {
  mask: Uint8Array;
  pct: number;
  clusters: number;
  capped: boolean;
  cx: number; // 0..1
  cy: number; // 0..1
  meanDelta: number; // DN, T2 - T1 over changed pixels
  tau: number;
  quadrant: string;
}

export function quadrantName(cx: number, cy: number): string {
  if (Math.abs(cx - 0.5) < 0.12 && Math.abs(cy - 0.5) < 0.12) return "centre";
  const ns = cy < 0.5 ? "north" : "south";
  const ew = cx < 0.5 ? "west" : "east";
  return `${ns}-${ew}`;
}

export function changeDetect(a: RGB, b: RGB): ChangeResult {
  const w = a.width;
  const h = a.height;
  const n = w * h;
  // matched-filter smoothing: kills JPEG/codec ringing (high-frequency) while
  // preserving genuine surface change (low-frequency block content)
  const ga = blur3(a.gray, w, h);
  const gb = blur3(b.gray, w, h);
  const hist = new Uint32Array(256);
  const delta = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const d = ga[i] - gb[i];
    delta[i] = d;
    hist[clamp(Math.round(Math.abs(d)), 0, 255)]++;
  }
  // Otsu gives the inter-class optimum; we threshold at 55% of it so real
  // change stays solid while radiometric drift / JPEG noise stays excluded.
  const tau = Math.max(12, Math.round(otsu(hist, n) * 0.55));
  const mask = new Uint8Array(n);
  let count = 0;
  let sx = 0;
  let sy = 0;
  let dsum = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(delta[i]) > tau) {
      mask[i] = 1;
      count++;
      sx += i % w;
      sy += (i / w) | 0;
      dsum += -delta[i]; // T2 - T1
    }
  }
  let clusters = 0;
  let capped = false;
  const MIN_AREA = 60; // speckle removal — standard in change detection
  if (count > 0) {
    const seen = new Uint8Array(n);
    const q = new Int32Array(n);
    outer: for (let i = 0; i < n; i++) {
      if (!mask[i] || seen[i]) continue;
      let head = 0;
      let tail = 0;
      let size = 0;
      q[tail++] = i;
      seen[i] = 1;
      while (head < tail) {
        const p = q[head++];
        size++;
        const x = p % w;
        const y = (p / w) | 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const p2 = ny * w + nx;
            if (mask[p2] && !seen[p2]) {
              seen[p2] = 1;
              q[tail++] = p2;
            }
          }
        }
      }
      if (size >= MIN_AREA) {
        clusters++;
        if (clusters >= 40) {
          capped = true;
          break outer;
        }
      }
    }
  }
  const cx = count ? sx / (count * w) : 0.5;
  const cy = count ? sy / (count * h) : 0.5;
  return {
    mask,
    pct: count / n,
    clusters,
    capped,
    cx,
    cy,
    meanDelta: count ? dsum / count : 0,
    tau,
    quadrant: quadrantName(cx, cy),
  };
}

export async function renderChangeMap(base: RGB, mask: Uint8Array): Promise<string> {
  const { width: w, height: h } = base;
  const overlay = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    if (mask[i]) {
      overlay[i * 4] = 255;
      overlay[i * 4 + 1] = 84;
      overlay[i * 4 + 2] = 60;
      overlay[i * 4 + 3] = 205;
    }
  }
  const png = await fromRaw(Buffer.from(base.data), w, h)
    .composite([
      { input: await sharp(overlay, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer() },
    ])
    .png()
    .toBuffer();
  return png.toString("base64");
}

/** Bounding box (fractions) of the densest high-edge region of a frame. */
export function groundBbox(edge: Float32Array, w: number, h: number): [number, number, number, number] {
  const sample: number[] = [];
  for (let i = 0; i < edge.length; i += 7) sample.push(edge[i]);
  sample.sort((a, b) => b - a);
  const thr = sample[Math.floor(sample.length * 0.05)] || 0;
  let x0 = w;
  let y0 = h;
  let x1 = 0;
  let y1 = 0;
  let c = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (edge[y * w + x] > thr) {
        c++;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (!c) return [0.18, 0.18, 0.82, 0.82];
  const px = 0.02 * w;
  const py = 0.02 * h;
  x0 = Math.max(0, x0 - px);
  x1 = Math.min(w - 1, x1 + px);
  y0 = Math.max(0, y0 - py);
  y1 = Math.min(h - 1, y1 + py);
  return [x0 / w, y0 / h, x1 / w, y1 / h];
}

function blur3(src: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(src);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      out[i] = (src[i - 1] + src[i + 1] + src[i - w] + src[i + w] + src[i]) * 0.2;
    }
  }
  return out;
}

/** Synthesise a C-band SAR-like amplitude frame (speckle + look-angle tilt) from an optical source. */
export async function makeSAR(src: RGB): Promise<Decoded> {
  const { width: w, height: h, gray } = src;
  const n = w * h;
  const v = new Float32Array(n);
  for (let i = 0; i < n; i++) v[i] = gray[i] * (0.55 + Math.random() * 0.9);
  const b = blur3(v, w, h);
  const sorted = Array.from(b).sort((a, c) => a - c);
  const lo = sorted[Math.floor(n * 0.02)];
  const hi = sorted[Math.floor(n * 0.98)];
  const out = Buffer.alloc(n * 3);
  const grayOut = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const g = ((b[i] - lo) / (hi - lo + 1e-6)) * 255;
    const tilt = 1.06 - 0.12 * ((i / w) / h);
    const f = clamp(g * tilt, 0, 255);
    out[i * 3] = f;
    out[i * 3 + 1] = f;
    out[i * 3 + 2] = f;
    grayOut[i] = f;
  }
  const rgb: RGB = { width: w, height: h, data: out, gray: grayOut };
  const jpeg = await fromRaw(out, w, h).jpeg({ quality: 80 }).toBuffer();
  return { rgb, format: "sar-amplitude", sizeKb: Math.round(jpeg.length / 1024), jpeg };
}

export interface FuseResult {
  b64: string; // JPEG data payload
  complementarity: number; // 0..1 — how much the sensors disagree
  edgeCarry: number; // 0..1 — structural agreement
}

/** Late fusion: inject SAR high-frequency detail into the optical pass (HSV-luminance domain). */
export async function fuseOpticalSAR(opt: RGB, sar: RGB): Promise<FuseResult> {
  const w = opt.width;
  const h = opt.height;
  const n = w * h;
  const base = blur3(sar.gray, w, h);
  const hf = new Float32Array(n);
  for (let i = 0; i < n; i++) hf[i] = sar.gray[i] - base[i];
  // complementarity: chroma the radar physically cannot carry + radiometric residual
  let satSum = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const mx = Math.max(opt.data[o], opt.data[o + 1], opt.data[o + 2]);
    const mn = Math.min(opt.data[o], opt.data[o + 1], opt.data[o + 2]);
    satSum += mx === 0 ? 0 : (mx - mn) / mx;
  }
  const meanSat = satSum / n;
  const nccGray = ncc(downsample(opt.gray, w, h, 64), downsample(sar.gray, w, h, 64));
  const complementarity = clamp(0.6 * meanSat + 0.4 * (1 - nccGray), 0, 1);
  const edgeCarry = clamp(
    ncc(downsample(sobel(opt.gray, w, h), w, h, 64), downsample(sobel(sar.gray, w, h), w, h, 64)),
    0,
    1
  );
  const out = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const r = opt.data[o];
    const g = opt.data[o + 1];
    const b = opt.data[o + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const nl = clamp(lum + 0.65 * hf[i], 0, 255);
    const s = lum > 10 ? nl / lum : 1;
    out[o] = Math.min(255, r * s);
    out[o + 1] = Math.min(255, g * s);
    out[o + 2] = Math.min(255, b * s);
  }
  const png = await fromRaw(out, w, h).jpeg({ quality: 84 }).toBuffer();
  return { b64: png.toString("base64"), complementarity, edgeCarry };
}

/**
 * Demo scenario helper — synthesises the "T2" pass of a bi-temporal pair by
 * applying a real on-the-ground change (new built-up block, industrial plot,
 * canal cut) plus a seasonal radiometric drift on top of the T1 pixels.
 */
export async function mutateT2(srcB64: string): Promise<string> {
  const buf = Buffer.from(srcB64, "base64");
  const { data, info } = await sharp(buf)
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.from(data);
  // gentle seasonal radiometric drift (kept well under the Otsu threshold)
  for (let i = 0; i < w * h * 3; i += 3) {
    out[i] = clamp(out[i] * 1.03, 0, 255);
    out[i + 1] = clamp(out[i + 1] * 0.992, 0, 255);
    out[i + 2] = clamp(out[i + 2] * 0.972, 0, 255);
  }
  const rect = (x0: number, y0: number, x1: number, y1: number, col: [number, number, number]) => {
    const xa = Math.max(0, x0 | 0);
    const ya = Math.max(0, y0 | 0);
    const xb = Math.min(w, x1 | 0);
    const yb = Math.min(h, y1 | 0);
    for (let y = ya; y < yb; y++) {
      for (let x = xa; x < xb; x++) {
        const o = (y * w + x) * 3;
        out[o] = col[0];
        out[o + 1] = col[1];
        out[o + 2] = col[2];
      }
    }
  };
  // development block (built-up)
  const d1x = 0.56 * w;
  const d1y = 0.11 * h;
  const d1w = 0.25 * w;
  const d1h = 0.21 * h;
  rect(d1x - 18, d1y - 10, d1x + d1w + 14, d1y - 2, [214, 212, 204]); // approach road
  rect(d1x, d1y, d1x + d1w, d1y + d1h, [184, 179, 170]); // concrete base
  const cols = 4;
  const rows = 3;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const lw = (d1w - 8) / cols;
      const lh = (d1h - 14) / rows;
      const lx = d1x + 4 + c * lw + 2;
      const ly = d1y + 10 + r * lh + 2;
      rect(lx, ly, lx + lw - 5, ly + lh - 5, [104, 102, 96]); // dark rooftops
    }
  }
  // industrial plot
  const d2x = 0.06 * w;
  const d2y = 0.62 * h;
  const d2w = 0.15 * w;
  const d2h = 0.14 * h;
  rect(d2x, d2y, d2x + d2w, d2y + d2h, [142, 138, 130]);
  rect(d2x + 6, d2y + 6, d2x + d2w - 12, d2y + d2h * 0.55, [92, 90, 86]);
  // new canal cut
  const line = (xa: number, ya: number, xb: number, yb: number, wd: number, col: [number, number, number]) => {
    const len = Math.hypot(xb - xa, yb - ya);
    const steps = Math.ceil(len * 2);
    for (let s = 0; s <= steps; s++) {
      const x = xa + ((xb - xa) * s) / steps;
      const y = ya + ((yb - ya) * s) / steps;
      rect(x - wd, y - wd, x + wd, y + wd, col);
    }
  };
  line(0.3 * w, 0.88 * h, 0.52 * w, 0.58 * h, 5, [90, 122, 156]);
  const jpeg = await fromRaw(out, w, h).jpeg({ quality: 85 }).toBuffer();
  return jpeg.toString("base64");
}
