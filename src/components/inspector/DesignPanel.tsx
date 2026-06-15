import { FONT_OPTIONS } from "../../domain/fonts";
import type { DesignSettings } from "../../domain/project";
import type { AppCopy } from "../../i18n";

type DesignPanelProps = {
  readonly copy: AppCopy["design"];
  readonly design: DesignSettings;
  readonly onDesignChange: (design: DesignSettings) => void;
};

export function DesignPanel({ copy, design, onDesignChange }: DesignPanelProps) {
  return (
    <section className="inspector-section">
      <h2>{copy.sectionTitle}</h2>
      <label>
        {copy.font}
        <select
          value={design.fontFamily}
          onChange={(event) => onDesignChange({ ...design, fontFamily: event.currentTarget.value })}
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {copy.fontLabels[option.value] ?? option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        {copy.bodySize}
        <input
          max={24}
          min={14}
          type="range"
          value={design.fontSize}
          onChange={(event) => onDesignChange({ ...design, fontSize: Number(event.currentTarget.value) })}
        />
      </label>
      <label>
        {copy.lineHeight}
        <input
          max={2.2}
          min={1.4}
          step={0.05}
          type="range"
          value={design.lineHeight}
          onChange={(event) => onDesignChange({ ...design, lineHeight: Number(event.currentTarget.value) })}
        />
      </label>
      <label>
        {copy.pageTone}
        <select
          value={design.pageTone}
          onChange={(event) => {
            const pageTone = event.currentTarget.value === "white" ? "white" : event.currentTarget.value === "warm" ? "warm" : "paper";
            onDesignChange({ ...design, pageTone });
          }}
        >
          <option value="paper">{copy.pageTones.paper}</option>
          <option value="white">{copy.pageTones.white}</option>
          <option value="warm">{copy.pageTones.warm}</option>
        </select>
      </label>
    </section>
  );
}
