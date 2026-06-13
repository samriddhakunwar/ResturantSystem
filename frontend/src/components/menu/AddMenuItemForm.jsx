// ─── Add Menu Item Form ───────────────────────────────────────────────────────
import { useState } from 'react';
import { Plus, ImagePlus, X, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import { MENU_CATEGORIES, CATEGORY_META } from '../../data/menuManagementData';

const EMOJI_MAP = {
  Pizza: '🍕', Sides: '🍟', Drinks: '🥤', Desserts: '🍫',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Pizza',
  image: '',
};

export default function AddMenuItemForm() {
  const { addMenuItem } = usePOS();
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
    if (!form.category)                e.category = 'Select a category';
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
      category: form.category,
      image: form.image.trim() || '',
      emoji: EMOJI_MAP[form.category] || '🍽️',
      available: true,
    });

    setForm(EMPTY_FORM);
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const meta = CATEGORY_META[form.category] || {};

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
          <Plus className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Add New Item</p>
          <p className="text-xs text-gray-400">Fill in details to add to menu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        {/* Item Name */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 block">
            Item Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Veggie Pizza"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={`w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl outline-none transition-all
              focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-400 placeholder:text-gray-400
              ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 block">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief description of the item…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none
              focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-400 placeholder:text-gray-400 transition-all"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 block">
            Price (Rs) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rs</span>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 text-sm font-semibold bg-gray-50 border rounded-xl outline-none transition-all
                focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-400 placeholder:text-gray-400
                ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
          </div>
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 block">
            Category <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MENU_CATEGORIES.map((cat) => {
              const m = CATEGORY_META[cat];
              const isActive = form.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 active:scale-95
                    ${isActive
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                    }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  {cat}
                </button>
              );
            })}
          </div>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>

        {/* Image URL */}
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 block">
            Image URL <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="https://…"
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none
                focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-400 placeholder:text-gray-400 transition-all"
            />
            {form.image && (
              <button
                type="button"
                onClick={() => set('image', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Image preview */}
          {form.image && (
            <div className="mt-2 h-24 rounded-xl overflow-hidden bg-gray-100">
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
          <div className={`rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${meta.border || 'border-gray-200'} ${meta.bg || 'bg-gray-50'}`}>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0">
              {form.image
                ? <img src={form.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML = `<span class='text-xl'>${EMOJI_MAP[form.category]}</span>`; }} />
                : <span className="text-xl">{EMOJI_MAP[form.category]}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{form.name}</p>
              <p className="text-xs text-gray-500 truncate">{form.description || 'No description'}</p>
            </div>
            {form.price && (
              <span className="text-sm font-black text-orange-500 shrink-0">Rs {form.price}</span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Submit */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-150 active:scale-[0.98] shadow-sm
            ${success
              ? 'bg-green-500 text-white shadow-green-200'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
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
            className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
          >
            Clear form
          </button>
        )}
      </form>
    </div>
  );
}
