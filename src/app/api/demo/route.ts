import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { decodeImage, makeSAR, mutateT2 } from "@/lib/imgproc";

export const runtime = "nodejs";

interface Scenario {
  images: string[];
  query: string;
  config: "single" | "bitemporal" | "crossmodal";
  label: string;
}

const cache: Record<string, Scenario> = {};

const read = (name: string): Buffer => fs.readFileSync(path.join(process.cwd(), "public", "samples", name));
const du = (b64: string) => `data:image/jpeg;base64,${b64}`;

export async function GET(req: NextRequest) {
  const scenario = req.nextUrl.searchParams.get("scenario") ?? "single";
  try {
    if (!cache[scenario]) {
      if (scenario === "bitemporal") {
        const t1 = read("farm-t1.jpg").toString("base64");
        const t2 = await mutateT2(t1); // real on-the-ground change + seasonal drift
        cache[scenario] = {
          images: [du(t1), du(t2)],
          query: "What changed between these two passes, and where exactly?",
          config: "bitemporal",
          label: "Bi-temporal pair · T1 + T2, agricultural mosaic (≈12 months apart)",
        };
      } else if (scenario === "crossmodal") {
        const opt = read("forest.jpg");
        const decoded = await decodeImage(opt.toString("base64"));
        const sar = await makeSAR(decoded.rgb); // real speckle + look-angle tilt synthesis
        cache[scenario] = {
          images: [du(opt.toString("base64")), du(sar.jpeg.toString("base64"))],
          query: "Fuse these two passes — what can the SAR side see that the optical pass can't?",
          config: "crossmodal",
          label: "Cross-modal pair · optical + C-band SAR, forested valley",
        };
      } else {
        const img = read("port.jpg");
        cache[scenario] = {
          images: [du(img.toString("base64"))],
          query: "Describe this scene and locate the water body along the coast.",
          config: "single",
          label: "Single frame · true-colour, port corridor",
        };
      }
    }
    return NextResponse.json(cache[scenario]);
  } catch (e) {
    console.error("[vyoma/demo]", e);
    return NextResponse.json({ error: "Demo scenario unavailable — try uploading your own frames." }, { status: 500 });
  }
}
