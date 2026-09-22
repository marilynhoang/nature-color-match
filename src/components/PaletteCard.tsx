import styles from "./PaletteCard.module.css";
import { blobRadius, cardRotation, cardSizeTier } from "../lib/blobs";
import { formatDate, type Palette } from "../lib/library";

const SIZE_PX: Record<"sm" | "md" | "lg", number> = {
  sm: 210,
  md: 240,
  lg: 280,
};

export default function PaletteCard({
  palette,
  onOpen,
}: {
  palette: Palette;
  onOpen: () => void;
}) {
  const rotation = cardRotation(palette.id);
  const size = SIZE_PX[cardSizeTier(palette.id)];
  const sorted = [...palette.colors].sort((a, b) => b.share - a.share);

  return (
    <button
      type="button"
      className={styles.card}
      style={{ width: size, transform: `rotate(${rotation}deg)` }}
      onClick={onOpen}
    >
      <div className={styles.stamp}>
        <div className={styles.stampBorder} />
        <img src={palette.imageDataUrl} alt="" className={styles.stampImage} />
      </div>

      <p className={styles.name}>{palette.name}</p>
      <p className={styles.meta}>
        no.{String(palette.catalogNo).padStart(2, "0")}
        <span className={styles.dot} />
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
