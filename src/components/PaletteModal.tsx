import { useMemo, useState } from "react";
import styles from "./PaletteModal.module.css";
import { blobRadius } from "../lib/blobs";
import type { Palette } from "../lib/library";
import { IconArrowBack, IconArrowForward, IconCheck, IconCopy, IconX } from "./icons";

type Props = {
  palette: Palette;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
};

function buildGradientDataUrl(hexes: string[]): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    hexes.forEach((hex, i) => gradient.addColorStop(i / (hexes.length - 1 || 1), hex));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);
    resolve(canvas.toDataURL("image/png"));
  });
}

export default function PaletteModal({ palette, onClose, onDelete, onRename }: Props) {
  const [view, setView] = useState<"photo" | "gradient">("photo");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(palette.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const hexes = palette.colors.map((c) => c.hex);
  const gradientCss = useMemo(
    () => `linear-gradient(155deg, ${hexes.join(", ")})`,
    [hexes]
  );

  async function copyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1200);
    } catch {
      // ignore — clipboard permission denied
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(hexes.join(", "));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      // ignore
    }
  }

  async function downloadGradient() {
    const dataUrl = await buildGradientDataUrl(hexes);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${palette.name.toLowerCase().replace(/\s+/g, "-")}-gradient.png`;
    a.click();
  }

  function commitRename() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== palette.name) onRename(palette.id, trimmed);
    setEditingName(false);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <IconX size={18} />
        </button>

        <div className={styles.tile}>
          {view === "photo" ? (
            <img src={palette.imageDataUrl} alt="" className={styles.tileImage} />
          ) : (
            <div className={styles.tileGradient} style={{ background: gradientCss }} />
          )}
        </div>

        <div className={styles.details}>
          {editingName ? (
            <input
              className={styles.nameInput}
              value={nameDraft}
              autoFocus
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setNameDraft(palette.name);
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <button type="button" className={styles.name} onClick={() => setEditingName(true)}>
              {palette.name}
            </button>
          )}

          <button
            type="button"
            className={styles.toggleLink}
            onClick={() => setView((v) => (v === "photo" ? "gradient" : "photo"))}
          >
            {view === "photo" ? <IconArrowForward /> : <IconArrowBack />}
            {view === "photo" ? "see it as a gradient" : "back to photo"}
          </button>

          <div className={styles.hexList}>
            {palette.colors.map((color, i) => (
              <div key={color.hex + i} className={styles.hexRow}>
                <span
                  className={styles.hexBlob}
                  style={{ background: color.hex, borderRadius: blobRadius(palette.id + i) }}
                />
                <span className={styles.hexCode}>{color.hex}</span>
                <button type="button" className={styles.hexCopy} onClick={() => copyHex(color.hex)}>
                  {copiedHex === color.hex ? <IconCheck /> : <IconCopy />}
                </button>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={copyAll}>
              {copiedAll ? "copied ✓" : "copy all"}
            </button>
            {view === "photo" ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setView("gradient")}
              >
                make a gradient
              </button>
            ) : (
              <button type="button" className={styles.primaryButton} onClick={downloadGradient}>
                download png
              </button>
            )}
          </div>

          {confirmingDelete ? (
            <button
              type="button"
              className={styles.deleteConfirm}
              onClick={() => onDelete(palette.id)}
            >
              confirm delete?
            </button>
          ) : (
            <button type="button" className={styles.deleteLink} onClick={() => setConfirmingDelete(true)}>
              delete this palette
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
