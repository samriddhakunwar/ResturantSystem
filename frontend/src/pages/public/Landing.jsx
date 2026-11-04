// ─── Landing ──────────────────────────────────────────────────────────────────
// / — hero panel with the walking cat, the two calls to action, a peek at the
// cats and the opening hours. Paw peeks are allowed here (PawPeek.md).
import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import CatCard from '../../components/ui/CatCard';
import SectionPanel from '../../components/ui/SectionPanel';
import PawPeek from '../../components/ui/PawPeek';
import { CAT_POSES } from '../../components/decor/CatSilhouette';
import { publicApi } from '../../api/public';
import { useCafeConfig } from '../../context/CafeConfigContext';

export default function Landing() {
  const config = useCafeConfig();
  const [cats, setCats] = useState([]);

  useEffect(() => {
    publicApi.cats().then(setCats).catch(() => setCats([]));
  }, []);

  // Cats in the room first, then everyone else.
  const preview = [...cats].sort((a, b) => b.is_present_today - a.is_present_today).slice(0, 3);

  return (
    <div className="relative mx-auto max-w-[960px] space-y-10 overflow-x-clip px-4 pb-6 pt-2">
      <PawPeek color="ginger" top={300} />

      <SectionPanel cat="walking-charcoal" catClassName="right-[10%] h-[96px]" as="div" className="!py-10 text-center">
        <h1 className="m-0 font-display text-[36px] font-extrabold leading-[44px] text-charcoal">{config.cafe_name}</h1>
        {config.tagline && <p className="wb-script m-0 mt-2">{config.tagline}</p>}
        <div className="mx-auto mt-6 flex max-w-[320px] flex-col gap-3">
          <Button to="/book">Book a visit</Button>
          <Button variant="outline" to="/menu">See the menu</Button>
        </div>
      </SectionPanel>

      {preview.length > 0 && (
        <section aria-labelledby="cats-title" className="relative">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="cats-title" className="m-0 font-display text-2xl font-extrabold text-olive-dark">Meet the cats</h2>
            <Button size="sm" variant="outline" to="/cats">All cats</Button>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
            {preview.map((cat, i) => (
              <CatCard key={cat.slug} cat={cat} pose={CAT_POSES[i % CAT_POSES.length]} />
            ))}
          </div>
        </section>
      )}

      {config.opening_hours.length > 0 && (
        <section aria-labelledby="hours-title" className="relative">
          <PawPeek color="calico" top={0} />
          <h2 id="hours-title" className="m-0 mb-3 font-display text-2xl font-extrabold text-olive-dark">Opening hours</h2>
          <ul className="m-0 list-none space-y-1 p-0">
            {config.opening_hours.map((h) => <li key={h}>{h}</li>)}
          </ul>
          {config.wifi && <p className="m-0 mt-3 text-sm text-muted">Wi-Fi: {config.wifi}</p>}
        </section>
      )}
    </div>
  );
}
