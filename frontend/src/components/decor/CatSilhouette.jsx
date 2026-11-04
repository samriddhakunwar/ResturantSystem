// ─── Cat Silhouette ───────────────────────────────────────────────────────────
// One of the kit's nine original cats. Decorative by default (alt="").
// Poses: walking, walking-charcoal, sitting, stretching, pouncing, lying,
// grooming, tail-up, crouching. Use at most one large cat per screen.
import { CATS } from './assets';

export const CAT_POSES = [
  'walking', 'walking-charcoal', 'sitting', 'stretching', 'pouncing',
  'lying', 'grooming', 'tail-up', 'crouching',
];

export default function CatSilhouette({ pose = 'sitting', alt = '', className = '', ...rest }) {
  return <img src={CATS[`cat-${pose}`]} alt={alt} className={className} draggable="false" {...rest} />;
}
