import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Dropzone from "../components/Dropzone";
import SwatchCard from "../components/SwatchCard";
import styles from "./Extractor.module.css";
import { ACCEPTED_TYPES, MAX_FILE_BYTES, extractPalette } from "../lib/extractPalette";
import type { PaletteColor } from "../lib/extractPalette";
import { usePaletteLibrary } from "../lib/library";
import { identifySpeciesFromImage } from "../lib/identifySpecies";

type Status = "empty" | "loading" | "result" | "error";

const FILE_ERROR = "That file type isn't supported. Please upload a JPG, PNG or WEBP under 10 MB.";

export default function Extractor() {
  const [status, setStatus] = useState<Status>("empty");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [colors, setColors] = useState<PaletteColor[]>([]);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { add, rename } = usePaletteLibrary();

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES) {
        setErrorMessage(FILE_ERROR);
        setStatus("error");
        return;
      }

      setStatus("loading");
      try {
        const result = await extractPalette(file);
        setColors(result.colors);
        setImageDataUrl(result.imageDataUrl);
        setStatus("result");
        const palette = await add({ colors: result.colors, imageDataUrl: result.imageDataUrl });

        // Identify the species in the background — don't make the user
        // wait on it. Silently updates the saved palette's name once (or
        // if) it resolves.
        identifySpeciesFromImage(result.imageDataUrl).then((name) => {
          if (name) rename(palette.id, name);
        });
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : FILE_ERROR);
        setStatus("error");
      }
    },
    [add, rename]
  );

  function reset() {
    setStatus("empty");
    setErrorMessage(null);
    setColors([]);
    setImageDataUrl(null);
  }

  if (status === "result" && imageDataUrl) {
    return (
      <div className={styles.resultPage}>
        <Header />
        <div className={styles.resultContent}>
          <div className={styles.imageWrap}>
            <img src={imageDataUrl} alt="Uploaded nature photo" className={styles.image} />
          </div>
          <div className={styles.swatchRow}>
            {colors.map((color) => (
              <SwatchCard key={color.hex} color={color} />
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton} onClick={() => navigate("/library")}>
              visit library
            </button>
            <button type="button" className={styles.secondaryButton} onClick={reset}>
              try another image
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header light />
      <div className={styles.lightSweep} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>if nature says it works, it works</h1>
          <p className={styles.subhead}>don't believe me? find out for yourself.</p>
          <p className={styles.subhead}>
            upload a photo from nature and extract its three most prominent colors.
          </p>
        </div>
        {status === "loading" ? (
          <div className={styles.loading}>
            <p>reading the colors…</p>
          </div>
        ) : (
          <Dropzone onFile={handleFile} errorMessage={status === "error" ? errorMessage : null} />
        )}
      </div>
    </div>
  );
}
