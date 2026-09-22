import { useRef, useState } from "react";
import styles from "./Dropzone.module.css";
import { ACCEPTED_TYPES, MAX_FILE_BYTES } from "../lib/extractPalette";

type Props = {
  onFile: (file: File) => void;
  errorMessage?: string | null;
};

export default function Dropzone({ onFile, errorMessage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const hasError = Boolean(errorMessage);

  function validateAndSend(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES) {
      onFile(file); // let the parent decide how to surface the specific error
      return;
    }
    onFile(file);
  }

  return (
    <div
      className={`${styles.zone} ${hasError ? styles.error : ""} ${dragActive ? styles.active : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        validateAndSend(e.dataTransfer.files[0]);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => validateAndSend(e.target.files?.[0])}
      />
      <div className={styles.iconWell}>
        <img
          src={hasError ? "/assets/alert-circle.svg" : "/assets/upload-cloud.svg"}
          alt=""
          width={22}
          height={22}
        />
      </div>
      {hasError ? (
        <>
          <p className={styles.message}>{errorMessage}</p>
          <button
            type="button"
            className={styles.chooseButton}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            choose a different file
          </button>
        </>
      ) : (
        <>
          <p className={styles.title}>drag a photo here or click to browse</p>
          <p className={styles.subtitle}>jpg, png or webp, up to 10 mb</p>
        </>
      )}
    </div>
  );
}
