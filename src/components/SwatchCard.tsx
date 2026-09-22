import { useState } from "react";
import styles from "./SwatchCard.module.css";
import type { PaletteColor } from "../lib/extractPalette";

function readableTextColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}

export default function SwatchCard({ color }: { color: PaletteColor }) {
  const [copied, setCopied] = useState(false);
  const textColor = readableTextColor(color.hex);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — fail silently, button label won't confirm
    }
  }

  return (
    <div className={styles.swatch} style={{ background: color.hex, color: textColor }}>
      <div className={styles.meta}>
        <p className={styles.hex}>{color.hex}</p>
        <p className={styles.share}>{color.share}%</p>
      </div>
      <button type="button" className={styles.copy} onClick={handleCopy} style={{ color: textColor, borderColor: textColor }}>
        {copied ? "copied ✓" : "copy"}
      </button>
    </div>
  );
}
