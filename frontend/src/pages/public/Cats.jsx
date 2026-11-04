// ─── Meet Our Cats ────────────────────────────────────────────────────────────
// /cats — every cat living at the café (adopted cats are hidden by the API).
// 1 / 2 / 3 columns at 360 / 600 / 900px, filter to cats looking for a home.
import { useEffect, useState } from 'react';
import CatCard from '../../components/ui/CatCard';
import { ChipToggle } from '../../components/ui/Chip';
import { CAT_POSES } from '../../components/decor/CatSilhouette';
import { publicApi } from '../../api/public';
import GuestMessage from './GuestMessage';

export default function Cats() {
  const [cats, setCats] = useState(null);
  const [error, setError] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    publicApi.cats().then(setCats).catch(() => setError(true));
  }, []);

  if (error) return <GuestMessage title="The cats are hiding right now">Please try again in a moment.</GuestMessage>;
  if (!cats) return <GuestMessage title="Rounding up the cats…" pose="grooming" />;

  const shown = availableOnly ? cats.filter((c) => c.adoption_status === 'available') : cats;

  return (
    <div className="mx-auto max-w-[960px] px-4 pb-6 pt-2">
      <h1 className="m-0 font-display text-[32px] font-extrabold leading-10 text-charcoal">Meet our cats</h1>
      <p className="m-0 mt-1 text-muted">All of our cats are rescues. Some of them are looking for a forever home.</p>
      <div className="mt-4">
        <ChipToggle pressed={availableOnly} onChange={setAvailableOnly}>Available for adoption</ChipToggle>
      </div>

      {shown.length === 0 ? (
        <GuestMessage title="No one is looking for a home today" pose="lying" />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
          {shown.map((cat, i) => (
            <CatCard key={cat.slug} cat={cat} pose={CAT_POSES[i % CAT_POSES.length]} />
          ))}
        </div>
      )}
    </div>
  );
}
