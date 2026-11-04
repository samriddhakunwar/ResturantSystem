// ─── Social Links ─────────────────────────────────────────────────────────────
// Facebook, Instagram and TikTok in one ink (ui-kit/components/SocialLinks.md),
// applied as a CSS mask so they take the token colour. `muted` = cream icons
// for the olive-dark footer. Networks without a URL are left out.
import { SOCIAL } from '../decor/assets';

const NETWORKS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
];

export default function SocialLinks({ links = {}, muted = false, className = '' }) {
  const shown = NETWORKS.filter((n) => links[n.key]);
  if (shown.length === 0) return null;
  return (
    <div className={`wb-social ${muted ? 'wb-social--muted' : ''} ${className}`}>
      {shown.map((n) => (
        <a key={n.key} href={links[n.key]} aria-label={n.label} target="_blank" rel="noreferrer">
          <i style={{ '--icon': `url("${SOCIAL[n.key]}")` }} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
