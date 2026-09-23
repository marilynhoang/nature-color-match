export type NameFit = {
  fontSize: number;
  cardWidth: number;
  wrap: boolean;
};

const FONT_FAMILY = "Pinyon Script";
const MIN_FONT_SIZE = 12;
/** How much wider than its base tier a card is allowed to grow to fit a
 * long name, before we give up and wrap to a second line instead. */
const MAX_EXTRA_WIDTH = 110;
const WIDTH_STEP = 8;
/** Roughly the card's horizontal padding + a small safety margin. */
const HORIZONTAL_PADDING = 44;

let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureCtx) {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  return measureCtx;
}

function textWidth(text: string, fontSize: number): number {
  const ctx = getMeasureCtx();
  if (!ctx) return text.length * fontSize * 0.5; // rough SSR/no-canvas fallback
  ctx.font = `${fontSize}px "${FONT_FAMILY}"`;
  return ctx.measureText(text).width;
}

/**
 * Decides how a (possibly long) species name should fit on a library card.
 * Tries, in order: shrinking the font down to MIN_FONT_SIZE, then widening
 * the card up to a capped amount, then — only as a last resort — allowing
 * the name to wrap onto a second line.
 */
export function fitCardName(name: string, baseFontSize: number, baseCardWidth: number): NameFit {
  if (!name) {
    return { fontSize: baseFontSize, cardWidth: baseCardWidth, wrap: false };
  }

  let fontSize = baseFontSize;
  let cardWidth = baseCardWidth;
  const available = () => cardWidth - HORIZONTAL_PADDING;

  while (textWidth(name, fontSize) > available() && fontSize > MIN_FONT_SIZE) {
    fontSize -= 1;
  }

  const maxCardWidth = baseCardWidth + MAX_EXTRA_WIDTH;
  while (textWidth(name, fontSize) > available() && cardWidth < maxCardWidth) {
    cardWidth = Math.min(maxCardWidth, cardWidth + WIDTH_STEP);
  }

  const wrap = textWidth(name, fontSize) > available();

  return { fontSize, cardWidth, wrap };
}
