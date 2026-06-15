import type { BookMetadata } from "../../domain/project";

const IDENTIFIER_TYPES = ["uuid", "isbn", "issn", "asin", "doi"] as const;

type IdentifierType = NonNullable<BookMetadata["identifierType"]>;

type EpubMetadataPanelProps = {
  readonly metadata: BookMetadata;
  readonly onMetadataChange: (metadata: BookMetadata) => void;
};

function isIdentifierType(value: string): value is IdentifierType {
  return IDENTIFIER_TYPES.some((identifierType) => identifierType === value);
}

export function EpubMetadataPanel({ metadata, onMetadataChange }: EpubMetadataPanelProps) {
  return (
    <section className="inspector-section">
      <h2>책 정보</h2>
      <label>
        제목
        <input
          value={metadata.title}
          onChange={(event) => onMetadataChange({ ...metadata, title: event.currentTarget.value })}
        />
      </label>
      <label>
        부제
        <input
          value={metadata.subtitle}
          onChange={(event) => onMetadataChange({ ...metadata, subtitle: event.currentTarget.value })}
        />
      </label>
      <label>
        저자
        <input
          value={metadata.author}
          onChange={(event) => onMetadataChange({ ...metadata, author: event.currentTarget.value })}
        />
      </label>
      <label>
        언어
        <select
          value={metadata.language}
          onChange={(event) => onMetadataChange({ ...metadata, language: event.currentTarget.value })}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh-Hans">中文(简体)</option>
          <option value="zh-Hant">中文(繁體)</option>
        </select>
      </label>
      <label>
        출판사
        <input
          value={metadata.publisher}
          onChange={(event) => onMetadataChange({ ...metadata, publisher: event.currentTarget.value })}
        />
      </label>
      <label>
        발행일
        <input
          type="date"
          value={metadata.publishDate ?? ""}
          onChange={(event) => onMetadataChange({ ...metadata, publishDate: event.currentTarget.value })}
        />
      </label>
      <label>
        식별자
        <span className="inline-field-grid">
          <select
            value={metadata.identifierType ?? "uuid"}
            onChange={(event) => {
              const identifierType = event.currentTarget.value;
              if (isIdentifierType(identifierType)) {
                onMetadataChange({ ...metadata, identifierType });
              }
            }}
          >
            <option value="uuid">UUID</option>
            <option value="isbn">ISBN</option>
            <option value="issn">ISSN</option>
            <option value="asin">ASIN</option>
            <option value="doi">DOI</option>
          </select>
          <input
            value={metadata.identifier ?? ""}
            placeholder="없으면 내보낼 때 자동 생성"
            onChange={(event) => onMetadataChange({ ...metadata, identifier: event.currentTarget.value })}
          />
        </span>
      </label>
      <label>
        설명
        <textarea
          rows={4}
          value={metadata.description}
          onChange={(event) => onMetadataChange({ ...metadata, description: event.currentTarget.value })}
        />
      </label>
    </section>
  );
}
