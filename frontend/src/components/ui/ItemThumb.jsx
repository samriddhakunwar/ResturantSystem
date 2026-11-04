// ─── Item Thumbnail ───────────────────────────────────────────────────────────
// A menu item's photo, or its category doodle when there is none (or the
// photo fails to load). Square, radius-sm, on cream — like the kit's card image.
import { useState } from 'react';
import Doodle from '../decor/Doodle';
import { doodleFor } from '../../data/menuManagementData';

export default function ItemThumb({ item, className = 'h-11 w-11' }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-sm bg-cream ${className}`}>
      {item.image && !broken ? (
        <img src={item.image} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <Doodle name={doodleFor(item.category)} className="w-3/4" />
      )}
    </div>
  );
}
