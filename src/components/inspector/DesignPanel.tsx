import { FONT_OPTIONS } from "../../domain/fonts";
import type { DesignSettings } from "../../domain/project";

type DesignPanelProps = {
  readonly design: DesignSettings;
  readonly onDesignChange: (design: DesignSettings) => void;
};

export function DesignPanel({ design, onDesignChange }: DesignPanelProps) {
  return (
    <section className="inspector-section">
      <h2>디자인</h2>
      <label>
        글꼴
        <select
          value={design.fontFamily}
          onChange={(event) => onDesignChange({ ...design, fontFamily: event.currentTarget.value })}
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        본문 크기
        <input
          max={24}
          min={14}
          type="range"
          value={design.fontSize}
          onChange={(event) => onDesignChange({ ...design, fontSize: Number(event.currentTarget.value) })}
        />
      </label>
      <label>
        줄간격
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
        페이지 톤
        <select
          value={design.pageTone}
          onChange={(event) => {
            const pageTone = event.currentTarget.value === "white" ? "white" : event.currentTarget.value === "warm" ? "warm" : "paper";
            onDesignChange({ ...design, pageTone });
          }}
        >
          <option value="paper">종이</option>
          <option value="white">흰색</option>
          <option value="warm">따뜻한 톤</option>
        </select>
      </label>
    </section>
  );
}
