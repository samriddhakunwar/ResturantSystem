// ─── Cat Card ─────────────────────────────────────────────────────────────────
// One resident cat on "Meet our cats" (ui-kit/components/CatCard.md): 4:3
// photo (or a silhouette placeholder), status badge, name, "2 yrs · girl ·
// tabby", up to three personality chips and the "In the room today" line.
// The whole card links to the cat's page.
import { Link } from 'react-router-dom';
import Chip from './Chip';
import CatSilhouette from '../decor/CatSilhouette';
import { catAge } from '../../lib/format';

const STATUS_BADGE = {
  available: { label: 'Looking for a home', tone: 'new' },
  resident: { label: 'Resident', tone: 'neutral' },
  reserved: { label: 'Reserved', tone: 'neutral' },
  adopted: { label: 'Adopted', tone: 'neutral' },
};

export function catMeta(cat) {
  return [catAge(cat.age_years, cat.age_months), cat.sex, cat.breed_or_look]
    .filter(Boolean)
    .join(' · ');
}

export default function CatCard({ cat, to, pose = 'sitting', className = '' }) {
  const badge = STATUS_BADGE[cat.adoption_status] ?? STATUS_BADGE.resident;
  return (
    <Link to={to ?? `/cats/${cat.slug}`} className={`wb-cat no-underline ${className}`}>
      <div className="wb-cat-photo">
        {cat.photo ? (
          <img className="photo" src={cat.photo} alt={cat.photo_alt || ''} loading="lazy" />
        ) : (
          <CatSilhouette pose={pose} />
        )}
        <Chip tone={badge.tone}>{badge.label}</Chip>
      </div>
      <div className="wb-cat-body">
        <h3 className="wb-cat-name">{cat.name}</h3>
        <p className="wb-cat-meta">{catMeta(cat)}</p>
        {cat.personality_tags?.length > 0 && (
          <div className="wb-cat-tags">
            {cat.personality_tags.slice(0, 3).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        )}
        {cat.is_present_today && <p className="wb-here m-0 mt-3">In the room today</p>}
      </div>
    </Link>
  );
}
