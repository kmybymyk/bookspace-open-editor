import { useRef, useState } from "react";
import type { BookMetadata } from "../../domain/project";

const MAX_COVER_IMAGE_BYTES = 2 * 1024 * 1024;
const SUPPORTED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type CoverPanelProps = {
  readonly metadata: BookMetadata;
  readonly onMetadataChange: (metadata: BookMetadata) => void;
};

export function CoverPanel({ metadata, onMetadataChange }: CoverPanelProps) {
  const [coverError, setCoverError] = useState("");
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const readCoverFile = (file: File | null) => {
    if (file === null) return;
    if (!SUPPORTED_COVER_TYPES.some((type) => type === file.type)) {
      setCoverError("PNG, JPG, WebP 표지만 사용할 수 있습니다.");
      return;
    }
    if (file.size > MAX_COVER_IMAGE_BYTES) {
      setCoverError("표지는 2MB 이하 이미지만 사용할 수 있습니다.");
      return;
    }
    setCoverError("");
    const reader = new FileReader();
    reader.onload = () => onMetadataChange({ ...metadata, coverImage: String(reader.result ?? "") });
    reader.readAsDataURL(file);
  };

  return (
    <section className="inspector-section">
      <h2>표지</h2>
      <input
        ref={coverInputRef}
        className="hidden-input"
        accept="image/png,image/jpeg,image/webp"
        type="file"
        onChange={(event) => readCoverFile(event.currentTarget.files?.item(0) ?? null)}
      />
      {metadata.coverImage ? <img className="cover-preview" src={metadata.coverImage} alt="EPUB 표지 미리보기" /> : <p className="empty-note">EPUB 표지가 아직 없습니다.</p>}
      {coverError ? <p className="field-error">{coverError}</p> : null}
      <button className="inspector-button" type="button" onClick={() => coverInputRef.current?.click()}>
        {metadata.coverImage ? "표지 변경" : "표지 추가"}
      </button>
    </section>
  );
}
