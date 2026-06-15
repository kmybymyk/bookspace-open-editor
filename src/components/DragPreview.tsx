type DragPreviewProps = {
  readonly subtitle: string;
  readonly title: string;
  readonly x: number;
  readonly y: number;
};

export function DragPreview({ subtitle, title, x, y }: DragPreviewProps) {
  return (
    <div className="drag-preview" style={{ left: x, top: y }}>
      <span className="drag-preview-title">{title}</span>
      <span className="drag-preview-subtitle">{subtitle}</span>
    </div>
  );
}
