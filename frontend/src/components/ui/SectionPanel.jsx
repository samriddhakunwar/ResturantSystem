// ─── Section Panel ────────────────────────────────────────────────────────────
// The kit's beige section card with a centred display title
// (ui-kit/components/SectionPanel.md). An optional cat silhouette perches on
// the panel's top edge — it sits outside the panel (which clips), at most one
// per screen.
import { useId } from 'react';
import CatSilhouette from '../decor/CatSilhouette';

export default function SectionPanel({
  title,
  cat,
  catClassName = 'right-[8%] h-[110px]',
  as: Tag = 'section',
  className = '',
  children,
  ...rest
}) {
  const titleId = useId();
  const panel = (
    <Tag
      className={`wb-panel ${className}`}
      aria-labelledby={title ? titleId : undefined}
      {...rest}
    >
      {title && <h2 id={titleId} className="wb-panel-title">{title}</h2>}
      {children}
    </Tag>
  );

  if (!cat) return panel;
  return (
    <div className="relative pt-14">
      <CatSilhouette
        pose={cat}
        className={`pointer-events-none absolute top-0 z-10 w-auto ${catClassName}`}
      />
      {panel}
    </div>
  );
}
