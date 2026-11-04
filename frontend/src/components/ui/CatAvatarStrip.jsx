// ─── Cat Avatar Strip ─────────────────────────────────────────────────────────
// "Meet the cats here today" under the QR menu header
// (ui-kit/components/CatAvatarStrip.md). Only cats in the room; hidden when
// none are in.
import { Link } from 'react-router-dom';
import CatSilhouette from '../decor/CatSilhouette';

const POSES = ['sitting', 'pouncing', 'grooming', 'lying', 'tail-up', 'stretching'];

export default function CatAvatarStrip({ cats, title = 'Meet the cats here today', script = 'purr' }) {
  const present = cats.filter((c) => c.is_present_today);
  if (present.length === 0) return null;

  return (
    <section aria-label={title}>
      <div className="flex items-baseline gap-3 px-4">
        <h2 className="m-0 font-display text-xl font-extrabold text-olive-dark">{title}</h2>
        {script && <span className="wb-script" aria-hidden="true">{script}</span>}
      </div>
      <div className="wb-avatars scrollbar-hide">
        {present.map((cat, i) => (
          <Link key={cat.slug} to={`/cats/${cat.slug}`} className="wb-avatar">
            <span className="overflow-hidden">
              {cat.photo ? (
                <img src={cat.photo} alt="" className="!h-full !w-full object-cover" />
              ) : (
                <CatSilhouette pose={POSES[i % POSES.length]} />
              )}
            </span>
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
