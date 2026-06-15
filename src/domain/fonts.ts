export type FontOption = {
  readonly cssFamily: string;
  readonly epubFamily: string;
  readonly label: string;
  readonly value: string;
};

export const DEFAULT_FONT_OPTION: FontOption = {
  cssFamily: "'Iowan Old Style', 'Noto Serif KR', Georgia, serif",
  epubFamily: "serif",
  label: "시스템 명조",
  value: "system-serif",
};

export const FONT_OPTIONS: readonly FontOption[] = [
  DEFAULT_FONT_OPTION,
  {
    cssFamily: "Pretendard, Inter, system-ui, sans-serif",
    epubFamily: "sans-serif",
    label: "시스템 고딕",
    value: "system-sans",
  },
  {
    cssFamily: "'Gowun Batang', serif",
    epubFamily: "'Gowun Batang', serif",
    label: "고운바탕",
    value: "gowun-batang",
  },
  {
    cssFamily: "'Gowun Dodum', sans-serif",
    epubFamily: "'Gowun Dodum', sans-serif",
    label: "고운돋움",
    value: "gowun-dodum",
  },
];

export function fontOptionFor(value: string): FontOption {
  return FONT_OPTIONS.find((option) => option.value === value) ?? DEFAULT_FONT_OPTION;
}
