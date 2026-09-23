/**
 * Free, unpaid species/subject identification: runs a small pretrained
 * image-classification model (MobileNet, via TensorFlow.js) entirely in
 * the browser. No API key, no server, no per-request cost — the tradeoff
 * is accuracy: MobileNet is trained on ImageNet's general-purpose 1000
 * categories, not a specialized plant/animal identifier, so it does best
 * on common, recognizable subjects and can be vague or wrong on close-up
 * or unusual nature photos. We only accept confident predictions and fall
 * back to no name (rather than a shaky guess) otherwise.
 *
 * The model (~10-16 MB) is loaded lazily via dynamic import, only once a
 * photo actually needs identifying, and cached by the browser after the
 * first download.
 */

const CONFIDENCE_THRESHOLD = 0.15;

let modelPromise: Promise<import("@tensorflow-models/mobilenet").MobileNet> | null = null;

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const [tf, mobilenet] = await Promise.all([
        import("@tensorflow/tfjs"),
        import("@tensorflow-models/mobilenet"),
      ]);
      await tf.ready();
      return mobilenet.load({ version: 2, alpha: 1.0 });
    })();
  }
  return modelPromise;
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image for identification."));
    img.src = dataUrl;
  });
}

/** MobileNet's ImageNet labels look like "daisy" or "sea anemone, anemone,
 * anthozoan" — take the first term and present it in title case. */
function cleanLabel(raw: string): string {
  const first = raw.split(",")[0]?.trim() ?? "";
  return first.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function identifySpeciesFromImage(imageDataUrl: string): Promise<string> {
  try {
    const [model, img] = await Promise.all([getModel(), loadImageElement(imageDataUrl)]);
    const predictions = await model.classify(img, 1);
    const top = predictions[0];
    if (!top || top.probability < CONFIDENCE_THRESHOLD) return "";
    return cleanLabel(top.className);
  } catch {
    return "";
  }
}
