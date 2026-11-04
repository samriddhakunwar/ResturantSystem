// ─── Cats (staff) ─────────────────────────────────────────────────────────────
// Who's in the room today, each cat's profile (with photo upload) and the
// adoption enquiries inbox.
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Select from '../components/ui/Select';
import TextField from '../components/ui/TextField';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import CatSilhouette from '../components/decor/CatSilhouette';
import { catMeta } from '../components/ui/CatCard';
import { fieldErrors } from '../api/public';
import { catsApi } from '../api/staff';

const BLANK = {
  name: '', photo_alt: '', age_years: 0, age_months: 0, sex: 'girl', breed_or_look: '',
  personality_tags: [], favourite_toy: '', likes: '', dislikes: '', bio: '',
  adoption_status: 'resident', is_present_today: true, display_order: 0,
};
const STATUS = { resident: 'Resident', available: 'Looking for a home', reserved: 'Reserved', adopted: 'Adopted' };
const ENQUIRY = { new: 'New', contacted: 'Contacted', closed: 'Closed' };
const TEXT_FIELDS = ['name', 'photo_alt', 'breed_or_look', 'favourite_toy', 'likes', 'dislikes', 'bio'];

function CatForm({ cat, onSaved, onCancel }) {
  const [form, setForm] = useState({ ...BLANK, ...cat, tags: (cat?.personality_tags ?? []).join(', ') });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, form[k]])),
      age_years: Number(form.age_years),
      age_months: Number(form.age_months),
      sex: form.sex,
      adoption_status: form.adoption_status,
      is_present_today: form.is_present_today,
      display_order: Number(form.display_order),
      personality_tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    let payload = data;
    if (photo) {
      // Multipart: JSON fields become strings, the list goes as JSON text.
      payload = new FormData();
      Object.entries(data).forEach(([k, v]) => payload.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v)));
      payload.append('photo', photo);
    }
    try {
      await catsApi.save(cat?.id ?? null, payload);
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg bg-panel p-5" noValidate>
      <h2 className="m-0 font-display text-xl font-extrabold text-olive-dark">{cat?.id ? `Edit ${cat.name}` : 'Add a cat'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" required value={form.name} error={errors.name} onChange={set('name')} />
        <TextField label="Breed or look" placeholder="Ginger tabby" value={form.breed_or_look} error={errors.breed_or_look} onChange={set('breed_or_look')} />
        <TextField label="Age (years)" type="number" min={0} value={form.age_years} error={errors.age_years} onChange={set('age_years')} />
        <TextField label="Age (months)" type="number" min={0} max={11} value={form.age_months} error={errors.age_months} onChange={set('age_months')} />
        <Select label="Sex" value={form.sex} onChange={(v) => setForm({ ...form, sex: v })} options={{ girl: 'Girl', boy: 'Boy' }} />
        <Select label="Adoption status" value={form.adoption_status} onChange={(v) => setForm({ ...form, adoption_status: v })} options={STATUS} />
        <TextField label="Personality" help="Up to three, separated by commas" value={form.tags}
          error={errors.personality_tags} onChange={set('tags')} />
        <TextField label="Favourite toy" value={form.favourite_toy} error={errors.favourite_toy} onChange={set('favourite_toy')} />
        <TextField label="Likes" value={form.likes} error={errors.likes} onChange={set('likes')} />
        <TextField label="Dislikes" value={form.dislikes} error={errors.dislikes} onChange={set('dislikes')} />
        <TextField label="Photo" type="file" accept="image/*" error={errors.photo}
          help={cat?.photo ? 'Leave empty to keep the current photo' : undefined}
          onChange={(e) => setPhoto(e.target.files[0] ?? null)} />
        <TextField label="Photo description" help="For screen readers, e.g. Ginger cat asleep in a basket"
          value={form.photo_alt} error={errors.photo_alt} onChange={set('photo_alt')} />
        <TextField label="Display order" type="number" help="Lower shows first" value={form.display_order} onChange={set('display_order')} />
      </div>
      <TextField label="Bio" multiline maxLength={1000} value={form.bio} error={errors.bio} onChange={set('bio')} />
      <ToggleSwitch label="In the room today" checked={form.is_present_today}
        onChange={(on) => setForm({ ...form, is_present_today: on })} />
      {errors._form && <p className="wb-field-error m-0">{errors._form}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function CatsAdmin() {
  const [cats, setCats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [editing, setEditing] = useState(null); // null | {} (new) | cat
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([catsApi.list(), catsApi.enquiries()]);
      setCats(c);
      setEnquiries(e);
    } catch (err) {
      setError(fieldErrors(err)._form);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn) => {
    try {
      await fn();
      await load();
    } catch (err) {
      setError(fieldErrors(err)._form ?? 'That didn’t work.');
    }
  };

  const openEnquiries = enquiries.filter((e) => e.status !== 'closed');

  return (
    <div className="space-y-6">
      <PageHeader title="Cats" subtitle="Who's in today, their profiles and adoption enquiries."
        action={!editing && <Button onClick={() => setEditing({})}>Add a cat</Button>} />
      {error && <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">{error}</p>}

      {editing && (
        <CatForm cat={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}

      {cats === null ? (
        <p className="text-muted">Loading cats…</p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
          {cats.map((cat) => (
            <li key={cat.id} className="flex gap-3 rounded-md border border-line bg-panel p-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-cream">
                {cat.photo ? <img src={cat.photo} alt="" className="h-full w-full object-cover" />
                  : <CatSilhouette pose="sitting" className="mx-auto h-full w-auto p-2" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 font-display text-lg font-extrabold">{cat.name}</p>
                <p className="m-0 truncate text-xs text-muted">{catMeta(cat)}</p>
                <div className="mt-1"><Chip tone={cat.adoption_status === 'available' ? 'new' : 'neutral'}>{STATUS[cat.adoption_status]}</Chip></div>
                <ToggleSwitch label="In the room today" checked={cat.is_present_today}
                  onChange={(on) => act(() => catsApi.save(cat.id, { is_present_today: on }))} />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(cat)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => window.confirm(`Remove ${cat.name}? Tip: set them to Adopted instead to keep their history.`) && act(() => catsApi.remove(cat.id))}>
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="enquiries-title" className="space-y-3">
        <h2 id="enquiries-title" className="m-0 font-display text-2xl font-extrabold text-olive-dark">
          Adoption enquiries {openEnquiries.length > 0 && <span className="text-base text-muted">({openEnquiries.length} open)</span>}
        </h2>
        {enquiries.length === 0 && <p className="m-0 text-muted">No enquiries yet.</p>}
        <ul className="m-0 list-none space-y-2 p-0">
          {enquiries.map((q) => (
            <li key={q.id} className={`rounded-md border border-line p-4 ${q.status === 'closed' ? 'bg-cream text-muted' : 'bg-panel'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="m-0 font-bold">{q.name} about {q.cat_name}</p>
                  <p className="m-0 text-sm">
                    <a href={`tel:${q.phone}`}>{q.phone}</a>
                    {q.email && <> · <a href={`mailto:${q.email}`}>{q.email}</a></>}
                    {' · '}{new Date(q.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="w-44">
                  <Select label="Status" value={q.status} options={ENQUIRY}
                    onChange={(v) => act(() => catsApi.setEnquiry(q.id, v))} />
                </div>
              </div>
              {q.message && <p className="m-0 mt-2 whitespace-pre-line text-sm">{q.message}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
