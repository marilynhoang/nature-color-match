export type PaletteColor = {
  hex: string;
  share: number;
};

const SAMPLE_SIZE = 100;
const BUCKET_STEP = 24;

function toHex(n: number) {
  return n.toString(16).padStart(2, "0");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = url;
  });
}

/** Saturation, 0-1, from 0-255 RGB — used to bias pixel weight toward the
 * subject. A blurry background is usually the most desaturated part of a
 * nature photo; the creature/plant is usually the most vivid. */
function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
}

/**
 * Extracts the 3 most prominent colors from an image by downscaling it onto
 * a small canvas, bucketing pixels into coarse color groups, and ranking
 * those groups by weighted prominence. Runs entirely in the browser — the
 * image never leaves the device.
 *
 * Plain pixel-count ranking tends to hand the result to the background: a
 * large, blurry, desaturated backdrop usually covers more pixels than the
 * subject. Without true subject segmentation (no ML model running
 * client-side), two heuristics correct for that:
 *  - saturation weighting: vivid pixels count for more than muted ones, so
 *    a gray/brown blurred background is discounted relative to the more
 *    colorful subject.
 *  - center weighting: pixels near the frame's center count for more, since
 *    photographers usually center the subject and push background to the
 *    edges.
 * The reported hex for a color bucket still averages the *raw* pixel
 * values in it — only which buckets rank in the top 3, and their share %,
 * are affected by the weighting.
 */
export async function extractPalette(file: File): Promise<{
  colors: PaletteColor[];
  imageDataUrl: string;
}> {
  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  const scale = Math.min(SAMPLE_SIZE / img.width, SAMPLE_SIZE / img.height, 1);
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;

  const buckets = new Map<
    string,
    { r: number; g: number; b: number; count: number; weight: number }
  >();
  let totalCounted = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 200) continue;

    // Skip near-white / near-black extremes so backgrounds don't dominate.
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max > 250 && min > 240) continue;
    if (max < 12) continue;

    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist; // 0 (center) - 1 (corner)
    const centerWeight = 1 - 0.65 * Math.min(dist, 1);
    const saturationWeight = 0.15 + 0.85 * saturation(r, g, b);
    const weight = centerWeight * saturationWeight;

    const key = [
      Math.round(r / BUCKET_STEP),
      Math.round(g / BUCKET_STEP),
      Math.round(b / BUCKET_STEP),
    ].join(",");

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count += 1;
      bucket.weight += weight;
    } else {
      buckets.set(key, { r, g, b, count: 1, weight });
    }
    totalCounted += 1;
  }

  if (totalCounted === 0 || buckets.size === 0) {
    throw new Error("Couldn't find enough color in that image.");
  }

  const top = [...buckets.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  const topWeightTotal = top.reduce((sum, b) => sum + b.weight, 0);

  const colors: PaletteColor[] = top.map((b) => {
    const r = Math.round(b.r / b.count);
    const g = Math.round(b.g / b.count);
    const bl = Math.round(b.b / b.count);
    return {
      hex: `#${toHex(r)}${toHex(g)}${toHex(bl)}`.toUpperCase(),
      share: Math.round((b.weight / topWeightTotal) * 100),
    };
  });

  // Full-size preview image for display / storage.
  const previewCanvas = document.createElement("canvas");
  const previewScale = Math.min(900 / img.width, 900 / img.height, 1);
  previewCanvas.width = Math.round(img.width * previewScale);
  previewCanvas.height = Math.round(img.height * previewScale);
  const pctx = previewCanvas.getContext("2d");
  if (!pctx) throw new Error("Canvas is not supported in this browser.");
  pctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
  const imageDataUrl = previewCanvas.toDataURL("image/jpeg", 0.85);

  URL.revokeObjectURL(img.src);

  return { colors, imageDataUrl };
}

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
