import { useMemo } from "react";
import styles from "./PaletteCard.module.css";
import { blobRadius, cardRotation, cardSizeTier } from "../lib/blobs";
import { fitCardName } from "../lib/textFit";
import { formatDate, type Palette } from "../lib/library";

const SIZE_PX: Record<"sm" | "md" | "lg", number> = {
  sm: 210,
  md: 240,
  lg: 280,
};

const BASE_FONT_SIZE: Record<"sm" | "md" | "lg", number> = {
  sm: 24,
  md: 28,
  lg: 32,
};

export default function PaletteCard({
  palette,
  onOpen,
}: {
  palette: Palette;
  onOpen: () => void;
}) {
  const rotation = cardRotation(palette.id);
  const tier = cardSizeTier(palette.id);
  const baseWidth = SIZE_PX[tier];
  const baseFontSize = BASE_FONT_SIZE[tier];
  const sorted = [...palette.colors].sort((a, b) => b.share - a.share);

  const nameFit = useMemo(
    () => fitCardName(palette.name, baseFontSize, baseWidth),
    [palette.name, baseFontSize, baseWidth]
  );

  return (
    <button
      type="button"
      className={styles.card}
      style={{ width: nameFit.cardWidth, transform: `rotate(${rotation}deg)` }}
      onClick={onOpen}
    >
      <div className={styles.stamp}>
        <div className={styles.stampBorder} />
        <img src={palette.imageDataUrl} alt="" className={styles.stampImage} />
      </div>

      {palette.name ? (
        <p
          className={`${styles.name} ${nameFit.wrap ? styles.nameWrap : ""}`}
          style={{ fontSize: nameFit.fontSize }}
        >
          {palette.name}
        </p>
      ) : (
        <p className={`${styles.name} ${styles.namePending}`} style={{ fontSize: baseFontSize }}>
          untitled
        </p>
      )}
      <p className={styles.meta}>
        {palette.catalogNo != null && (
          <>
            no.{String(palette.catalogNo).padStart(2, "0")}
            <span className={styles.dot} />
          </>
        )}
        {formatDate(palette.createdAt)}
      </p>

      <div className={styles.blobs}>
        {sorted.map((color, i) => {
          const blobSize = 22 + color.share * 0.5;
          return (
            <div
              key={color.hex + i}
              className={styles.blob}
              style={{
                width: blobSize,
                height: blobSize,
                background: color.hex,
                borderRadius: blobRadius(palette.id + i),
              }}
            />
          );
        })}
      </div>
    </button>
  );
}
