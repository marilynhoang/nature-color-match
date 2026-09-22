import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PaletteCard from "../components/PaletteCard";
import PaletteModal from "../components/PaletteModal";
import styles from "./Library.module.css";
import { usePaletteLibrary } from "../lib/library";
import { blobRadius } from "../lib/blobs";

export default function Library() {
  const { palettes, loading, remove, rename } = usePaletteLibrary();
  const [openId, setOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const openPalette = palettes?.find((p) => p.id === openId) ?? null;

  return (
    <div className={styles.page}>
      <Header />
      <h1 className={styles.title}>library</h1>

      {!loading && palettes && palettes.length === 0 && (
        <div className={styles.empty}>
          <div
            className={styles.emptyBlob}
            style={{ borderRadius: blobRadius("empty-state") }}
          />
          <p className={styles.emptyText}>curious to explore how nature plays around with color?</p>
          <button type="button" className={styles.emptyButton} onClick={() => navigate("/")}>
            extract your first palette
          </button>
        </div>
      )}

      {!loading && palettes && palettes.length > 0 && (
        <div className={styles.grid}>
          {palettes.map((palette) => (
            <PaletteCard key={palette.id} palette={palette} onOpen={() => setOpenId(palette.id)} />
          ))}
        </div>
      )}

      {openPalette && (
        <PaletteModal
          palette={openPalette}
          onClose={() => setOpenId(null)}
          onDelete={(id) => {
            remove(id);
            setOpenId(null);
          }}
          onRename={rename}
        />
      )}
    </div>
  );
}
