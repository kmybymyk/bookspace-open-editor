# BookSpace Web Design System

## 1. Product Character

BookSpace Web is a focused EPUB editor for authors and small publishers. The interface should feel like a compact desktop editing tool: dark chrome, quiet controls, clear structure, and a bright manuscript page.

## 2. Color Tokens

- Canvas: `--ds-fill-neutral-canvas` `#0f1013`
- Panel: `--ds-fill-neutral-panel` `#1c1d22`
- Card: `--ds-fill-neutral-card` `#212329`
- Card alternate: `--ds-fill-neutral-card-alt` `#17181c`
- Control: `--ds-fill-neutral-control` `#252831`
- Control hover: `--ds-fill-neutral-control-hover` `#2d303a`
- Primary text: `--ds-text-neutral-primary` `#f5f6f8`
- Secondary text: `--ds-text-neutral-secondary` `#d4d8e2`
- Muted text: `--ds-text-neutral-muted` `#a7adbb`
- Subtle border: `--ds-border-neutral-subtle` `#343945`
- Default border: `--ds-border-neutral-default` `#424856`
- Accent: `--ds-color-teal-500` `#14b8a6`
- Accent strong: `--ds-color-teal-600` `#0f9488`

## 3. Typography

- App UI uses `--ds-font-family-sans`: Pretendard, Noto Sans KR, Inter, system sans-serif.
- Manuscript pages use serif fonts selected from the editor design panel.
- Compact UI labels stay between 10px and 15px.
- Structure row titles use 17px semibold weight.
- Mobile editor title scales down to 26px.

## 4. Spacing And Shape

- Base spacing follows 4px increments.
- App panels use 16px to 28px internal rhythm depending on density.
- Repeated row/card radius should stay at 8px or below unless matching an existing pane control.
- Icon buttons use fixed square hit areas so labels and rows do not shift.

## 5. Components

- Top bar: brand block, status region, language selector, import group, output group.
- Left structure pane: section headers, active row, child row, compact row action buttons, drag preview.
- Center editor: bright page card with dark app chrome and sticky formatting toolbar.
- Right inspector: tabbed panel with EPUB readiness, metadata, cover, design, and local versions.

## 6. Interaction

- Controls must expose semantic button or input roles and visible focus rings.
- File imports should be triggered from top-bar icon buttons and backed by hidden native file inputs.
- Destructive actions remain icon-only but require clear accessible labels and titles.
- Import/export status changes are announced through the top status region.

## 7. Responsive Rules

- Desktop keeps the three-pane editor.
- Tablet and mobile may stack panels, but controls must not overflow horizontally.
- The editor page remains readable before exposing secondary inspector details.
