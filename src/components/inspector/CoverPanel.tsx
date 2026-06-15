import { useRef, useState } from "react";
import type { BookMetadata } from "../../domain/project";
import type { AppCopy } from "../../i18n";

const MAX_COVER_IMAGE_BYTES = 2 * 1024 * 1024;
const SUPPORTED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type CoverPanelProps = {
  readonly copy: AppCopy["cover"];
  readonly metadata: BookMetadata;
  readonly onMetadataChange: (metadata: BookMetadata) => void;
};

export function CoverPanel({ copy, metadata, onMetadataChange }: CoverPanelProps) {
  const [coverError, setCoverError] = useState("");
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const readCoverFile = (file: File | null) => {
    if (file === null) return;
    if (!SUPPORTED_COVER_TYPES.some((type) => type === file.type)) {
      setCoverError(copy.invalidType);
      return;
    }
    if (file.size > MAX_COVER_IMAGE_BYTES) {
      setCoverError(copy.tooLarge);
      return;
    }
    setCoverError("");
    const reader = new FileReader();
    reader.onload = () => onMetadataChange({ ...metadata, coverImage: String(reader.result ?? "") });
    reader.readAsDataURL(file);
  };

  return (
    <section className="inspector-section">
      <h2>{copy.sectionTitle}</h2>
      <input
        ref={coverInputRef}
        className="hidden-input"
        accept="image/png,image/jpeg,image/webp"
        type="file"
        onChange={(event) => readCoverFile(event.currentTarget.files?.item(0) ?? null)}
      />
      {metadata.coverImage ? <img className="cover-preview" src={metadata.coverImage} alt={copy.alt} /> : <p className="empty-note">{copy.empty}</p>}
      {coverError ? <p className="field-error">{coverError}</p> : null}
      <button className="inspector-button" type="button" onClick={() => coverInputRef.current?.click()}>
        {metadata.coverImage ? copy.change : copy.add}
      </button>
    </section>
  );
}
