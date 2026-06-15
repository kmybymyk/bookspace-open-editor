import type { BookMetadata } from "../../domain/project";
import type { AppCopy } from "../../i18n";

const IDENTIFIER_TYPES = ["uuid", "isbn", "issn", "asin", "doi"] as const;

type IdentifierType = NonNullable<BookMetadata["identifierType"]>;

type EpubMetadataPanelProps = {
  readonly copy: AppCopy["metadata"];
  readonly metadata: BookMetadata;
  readonly onMetadataChange: (metadata: BookMetadata) => void;
};

function isIdentifierType(value: string): value is IdentifierType {
  return IDENTIFIER_TYPES.some((identifierType) => identifierType === value);
}

export function EpubMetadataPanel({ copy, metadata, onMetadataChange }: EpubMetadataPanelProps) {
  return (
    <section className="inspector-section">
      <h2>{copy.sectionTitle}</h2>
      <label>
        {copy.title}
        <input
          value={metadata.title}
          placeholder={copy.titlePlaceholder}
          onChange={(event) => onMetadataChange({ ...metadata, title: event.currentTarget.value })}
        />
      </label>
      <label>
        {copy.subtitle}
        <input
          value={metadata.subtitle}
          placeholder={copy.subtitlePlaceholder}
          onChange={(event) => onMetadataChange({ ...metadata, subtitle: event.currentTarget.value })}
        />
      </label>
      <label>
        {copy.author}
        <input
          value={metadata.author}
          placeholder={copy.authorPlaceholder}
          onChange={(event) => onMetadataChange({ ...metadata, author: event.currentTarget.value })}
        />
      </label>
      <label>
        {copy.language}
        <select
          value={metadata.language}
          onChange={(event) => onMetadataChange({ ...metadata, language: event.currentTarget.value })}
        >
          <option value="ko">{copy.languageOptions.ko}</option>
          <option value="en">{copy.languageOptions.en}</option>
          <option value="ja">{copy.languageOptions.ja}</option>
          <option value="zh-Hans">{copy.languageOptions.zhHans}</option>
          <option value="zh-Hant">{copy.languageOptions.zhHant}</option>
        </select>
      </label>
      <label>
        {copy.publisher}
        <input
          value={metadata.publisher}
          placeholder={copy.publisherPlaceholder}
          onChange={(event) => onMetadataChange({ ...metadata, publisher: event.currentTarget.value })}
        />
      </label>
      <label>
        {copy.publishDate}
        <input
          type="date"
          value={metadata.publishDate ?? ""}
          onChange={(event) => onMetadataChange({ ...metadata, publishDate: event.currentTarget.value })}
        />
      </label>
      <label>
        {copy.identifier}
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
            placeholder={copy.identifierPlaceholder}
            onChange={(event) => onMetadataChange({ ...metadata, identifier: event.currentTarget.value })}
          />
        </span>
      </label>
      <label>
        {copy.description}
        <textarea
          rows={4}
          value={metadata.description}
          placeholder={copy.descriptionPlaceholder}
          onChange={(event) => onMetadataChange({ ...metadata, description: event.currentTarget.value })}
        />
      </label>
    </section>
  );
}
