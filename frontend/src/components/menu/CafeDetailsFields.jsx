// ─── Café details for a menu item ─────────────────────────────────────────────
// Dietary tags, "featured" and which cat recommends it. Controlled:
//   value: { dietaryTags, isFeatured, recommendedById }, onChange(patch)
import { useEffect, useState } from 'react';
import { ChipToggle } from '../ui/Chip';
import Select from '../ui/Select';
import ToggleSwitch from '../ui/ToggleSwitch';
import { isApiConfigured } from '../../api/client';
import { catsApi } from '../../api/staff';
import { DIETARY, DIETARY_KEYS } from '../../lib/dietary';

let catsPromise = null; // one fetch per page load, shared by every row
function useCatOptions() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    if (!isApiConfigured) return;
    catsPromise ??= catsApi.list().catch(() => []);
    catsPromise.then(setCats);
  }, []);
  return cats;
}

export default function CafeDetailsFields({ value, onChange }) {
  const cats = useCatOptions();
  const tags = value.dietaryTags ?? [];
  const toggle = (key, on) => onChange({ dietaryTags: on ? [...tags, key] : tags.filter((t) => t !== key) });

  return (
    <div className="space-y-3">
      <div>
        <p className="m-0 mb-2 text-sm font-bold text-charcoal">Dietary</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary tags">
          {DIETARY_KEYS.map((key) => (
            <ChipToggle key={key} pressed={tags.includes(key)} onChange={(on) => toggle(key, on)}>
              {DIETARY[key].label}
            </ChipToggle>
          ))}
        </div>
      </div>
      <ToggleSwitch label="Featured" description="Highlighted on the guest menu"
        checked={Boolean(value.isFeatured)} onChange={(on) => onChange({ isFeatured: on })} />
      {cats.length > 0 && (
        <Select
          label="Recommended by"
          value={value.recommendedById ?? ''}
          options={{ '': 'No cat', ...Object.fromEntries(cats.map((c) => [c.id, c.name])) }}
          onChange={(v) => onChange({
            recommendedById: v ? Number(v) : null,
            recommendedBy: cats.find((c) => String(c.id) === v)?.name ?? null,
          })}
        />
      )}
    </div>
  );
}
