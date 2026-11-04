// ─── Add Menu Item Form ───────────────────────────────────────────────────────
import { useState } from 'react';
import { Plus, ImagePlus, X, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import { MENU_CATEGORIES, doodleFor } from '../../data/menuManagementData';
import Doodle from '../decor/Doodle';
import ItemThumb from '../ui/ItemThumb';
import CafeDetailsFields from './CafeDetailsFields';
import { formatRs } from '../../lib/format';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  dietaryTags: [],
  isFeatured: false,
  recommendedById: null,
};

export default function AddMenuItemForm() {
  const { addMenuItem, categories, online } = usePOS();
  // Live categories when the backend is up, the demo list otherwise.
  const categoryNames = online && categories.length ? categories.map((c) => c.name) : MENU_CATEGORIES;
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())             e.name = 'Item name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
                                       e.price = 'Enter a valid price';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    addMenuItem({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category || categoryNames[0],
      image: form.image.trim() || '',
      available: true,
      dietaryTags: form.dietaryTags,
      isFeatured: form.isFeatured,
      recommendedById: form.recommendedById,
    });

    setForm(EMPTY_FORM);
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };


  return (
    <div className="bg-panel rounded-2xl border border-line shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line flex items-center gap-3">
        <div className="w-9 h-9 bg-olive-soft rounded-xl flex items-center justify-center">
          <Plus className="w-5 h-5 text-olive-strong" />
        </div>
        <div>
          <p className="text-sm font-bold text-charcoal">Add New Item</p>
          <p className="text-xs text-muted">Fill in details to add to menu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        {/* Item Name */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
            Item Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Catpuccino"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={`w-full px-3.5 py-2.5 text-sm bg-cream border rounded-xl outline-none transition-all
              focus:bg-panel focus:ring-2 focus:ring-olive-soft focus:border-olive-strong placeholder:text-muted
              ${errors.name ? 'border-danger bg-danger-soft' : 'border-line'}`}
          />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief description of the item…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-cream border border-line rounded-xl outline-none resize-none
              focus:bg-panel focus:ring-2 focus:ring-olive-soft focus:border-olive-strong placeholder:text-muted transition-all"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
            Price (Rs) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">Rs</span>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 text-sm font-semibold bg-cream border rounded-xl outline-none transition-all
                focus:bg-panel focus:ring-2 focus:ring-olive-soft focus:border-olive-strong placeholder:text-muted
                ${errors.price ? 'border-danger bg-danger-soft' : 'border-line'}`}
            />
          </div>
          {errors.price && <p className="text-xs text-danger mt-1">{errors.price}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
            Category <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categoryNames.map((cat) => {
              const isActive = (form.category || categoryNames[0]) === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 active:scale-95
                    ${isActive
                      ? 'border-olive-strong bg-olive-soft text-olive-strong'
                      : 'border-line bg-cream text-muted hover:border-olive-strong hover:bg-olive-soft'
                    }`}
                >
                  <Doodle name={doodleFor(cat)} className="h-4 w-4" />
                  {cat}
                </button>
              );
            })}
          </div>
          {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
        </div>

        {/* Café details */}
        <CafeDetailsFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />

        {/* Image URL */}
        <div>
          <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
            Image URL <span className="text-muted font-normal">(optional)</span>
          </label>
          <div className="relative">
            <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="https://…"
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-cream border border-line rounded-xl outline-none
                focus:bg-panel focus:ring-2 focus:ring-olive-soft focus:border-olive-strong placeholder:text-muted transition-all"
            />
            {form.image && (
              <button
                type="button"
                onClick={() => set('image', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-muted"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Image preview */}
          {form.image && (
            <div className="mt-2 h-24 rounded-xl overflow-hidden bg-cream-pressed">
              <img
                src={form.image}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Preview card */}
        {form.name && (
          <div className="rounded-xl border-2 p-3 flex items-center gap-3 transition-all border-olive bg-olive-soft">
            <ItemThumb item={{ image: form.image, category: form.category }} className="w-10 h-10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-charcoal truncate">{form.name}</p>
              <p className="text-xs text-muted truncate">{form.description || 'No description'}</p>
            </div>
            {form.price && (
              <span className="text-sm font-black text-olive-strong shrink-0">{formatRs(form.price)}</span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-line" />

        {/* Submit */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-150 active:scale-[0.98] shadow-sm
            ${success
              ? 'bg-olive-strong text-cream shadow-green-200'
              : 'bg-olive-strong hover:bg-olive-dark text-cream'
            }`}
        >
          {success ? (
            <><CheckCircle2 size={16} /> Added to Menu!</>
          ) : (
            <><Plus size={16} /> Add to Menu</>
          )}
        </button>

        {/* Clear form */}
        {(form.name || form.price || form.description) && (
          <button
            type="button"
            onClick={() => { setForm(EMPTY_FORM); setErrors({}); }}
            className="w-full text-xs text-muted hover:text-muted transition-colors text-center"
          >
            Clear form
          </button>
        )}
      </form>
    </div>
  );
}
