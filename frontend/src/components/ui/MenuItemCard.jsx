// ─── Menu Item Card ───────────────────────────────────────────────────────────
// One dish on the QR menu (ui-kit/components/MenuItemCard.md): image (or a
// doodle placeholder), name, one-line description, dietary chips, an optional
// cat pick, price and an add button. Sold-out items stay visible with the
// "Napping · sold out" label.
import Chip from './Chip';
import Doodle from '../decor/Doodle';
import { DIETARY } from '../../lib/dietary';
import { formatRs } from '../../lib/format';

export default function MenuItemCard({
  name,
  description,
  price,
  image,
  placeholder = 'steaming-cup',
  dietaryTags = [],
  pickedBy,
  extraChips = null,
  soldOut = false,
  onAdd,
  className = '',
}) {
  return (
    <article className={`wb-item ${soldOut ? 'is-soldout' : ''} ${className}`}>
      <div className="wb-item-img">
        {image ? (
          <img src={image} alt="" className="!h-full !w-full object-cover" loading="lazy" />
        ) : (
          <Doodle name={placeholder} />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="wb-item-name">{name}</h3>
        {description && <p className="wb-item-desc">{description}</p>}
        {(dietaryTags.length > 0 || pickedBy || extraChips) && (
          <div className="wb-item-tags">
            {dietaryTags.map((tag) =>
              DIETARY[tag] ? (
                <Chip key={tag} tone={DIETARY[tag].tone}>{DIETARY[tag].label}</Chip>
              ) : null,
            )}
            {pickedBy && <Chip tone="pick">{pickedBy}&rsquo;s pick</Chip>}
            {extraChips}
          </div>
        )}
        <div className="wb-item-foot">
          <span className="wb-price">{formatRs(price)}</span>
          {soldOut ? (
            <span className="wb-soldout">Napping · sold out</span>
          ) : onAdd && (
            <button
              type="button"
              className="wb-btn wb-btn--primary wb-add"
              aria-label={`Add ${name}`}
              onClick={onAdd}
            >
              +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
