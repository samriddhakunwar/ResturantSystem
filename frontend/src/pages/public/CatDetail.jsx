// ─── Cat Detail ───────────────────────────────────────────────────────────────
// /cats/:slug — one cat's story, and for cats looking for a home, the
// "Ask about adopting {name}" form (creates an AdoptionEnquiry).
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import SectionPanel from '../../components/ui/SectionPanel';
import TextField from '../../components/ui/TextField';
import CatSilhouette from '../../components/decor/CatSilhouette';
import { catMeta } from '../../components/ui/CatCard';
import { ApiError } from '../../api/client';
import { fieldErrors, publicApi } from '../../api/public';
import GuestMessage from './GuestMessage';

const EMPTY = { name: '', phone: '', email: '', message: '' };

function AdoptForm({ cat }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrors({});
    try {
      await publicApi.enquire(cat.slug, form);
      setSent(true);
    } catch (err) {
      setErrors(fieldErrors(err));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <p role="status" className="m-0 text-left font-semibold text-olive-strong">
        Thank you. We&rsquo;ll be in touch about {cat.name} soon.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left" noValidate>
      <TextField label="Your name" autoComplete="name" required maxLength={100} {...field('name')} />
      <TextField label="Phone" type="tel" autoComplete="tel" required maxLength={20} {...field('phone')} />
      <TextField label="Email" type="email" autoComplete="email" help="Optional" {...field('email')} />
      <TextField
        label={`Why would ${cat.name} love your home?`}
        multiline
        maxLength={1000}
        {...field('message')}
      />
      <div aria-live="assertive">{errors._form && <p className="wb-field-error m-0">{errors._form}</p>}</div>
      <Button type="submit" block disabled={sending}>{sending ? 'Sending…' : `Ask about adopting ${cat.name}`}</Button>
    </form>
  );
}

export default function CatDetail() {
  const { slug } = useParams();
  const [cat, setCat] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    publicApi
      .cat(slug)
      .then((c) => {
        setCat(c);
        setState('ready');
      })
      .catch((err) => setState(err instanceof ApiError && err.status === 404 ? 'missing' : 'error'));
  }, [slug]);

  if (state === 'loading') return <GuestMessage title="Finding them…" pose="grooming" />;
  if (state !== 'ready') {
    return (
      <GuestMessage title={state === 'missing' ? "We couldn't find that cat" : 'The cats are hiding right now'}
        action={<Button variant="outline" to="/cats">Meet our cats</Button>}
      />
    );
  }

  const facts = [
    ['Favourite toy', cat.favourite_toy],
    ['Likes', cat.likes],
    ['Dislikes', cat.dislikes],
  ].filter(([, v]) => v);
  const canAdopt = ['available', 'reserved'].includes(cat.adoption_status);

  return (
    <div className="mx-auto max-w-[720px] space-y-6 px-4 pb-6 pt-2">
      <div className="overflow-hidden rounded-lg bg-panel" style={{ aspectRatio: '4 / 3' }}>
        {cat.photo ? (
          <img src={cat.photo} alt={cat.photo_alt || cat.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CatSilhouette pose="sitting" className="h-3/5 w-auto" />
          </div>
        )}
      </div>

      <div>
        <h1 className="m-0 font-display text-[32px] font-extrabold leading-10 text-charcoal">{cat.name}</h1>
        <p className="m-0 mt-1 text-muted">{catMeta(cat)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {cat.adoption_status === 'available' && <Chip tone="new">Looking for a home</Chip>}
          {cat.adoption_status === 'reserved' && <Chip>Reserved</Chip>}
          {cat.personality_tags.map((t) => <Chip key={t}>{t}</Chip>)}
        </div>
        {cat.is_present_today && <p className="wb-here m-0 mt-3">In the room today</p>}
      </div>

      {cat.bio && <p className="m-0 whitespace-pre-line leading-7">{cat.bio}</p>}

      {facts.length > 0 && (
        <dl className="m-0 grid gap-3 min-[600px]:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-md bg-panel px-4 py-3">
              <dt className="text-sm font-bold text-olive-dark">{k}</dt>
              <dd className="m-0 mt-1">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {canAdopt && (
        <SectionPanel title={`Ask about adopting ${cat.name}`}>
          {cat.adoption_status === 'reserved' && (
            <p className="m-0 mb-4 text-left text-sm text-muted">
              {cat.name} is reserved, but plans change. Leave your details and we&rsquo;ll let you know.
            </p>
          )}
          <AdoptForm cat={cat} />
        </SectionPanel>
      )}

      <Button variant="outline" to="/cats">All our cats</Button>
    </div>
  );
}
