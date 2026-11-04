// ─── Menu Item Row ────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Edit3, Check, X, SlidersHorizontal } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import ItemThumb from '../ui/ItemThumb';
import Chip from '../ui/Chip';
import CafeDetailsFields from './CafeDetailsFields';
import { formatRs } from '../../lib/format';

export default function MenuItemRow({ item }) {
  const { updateMenuItemPrice, toggleMenuItemAvailability, deleteMenuItem, updateMenuItem } = usePOS();

  const [editingPrice, setEditingPrice] = useState(false);
  const [priceVal, setPriceVal]         = useState(String(item.price));
  const [editingName, setEditingName]   = useState(false);
  const [nameVal, setNameVal]           = useState(item.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const priceRef = useRef(null);
  const nameRef  = useRef(null);

  useEffect(() => { if (editingPrice) priceRef.current?.select(); }, [editingPrice]);
  useEffect(() => { if (editingName)  nameRef.current?.select();  }, [editingName]);

  const commitPrice = () => {
    const num = parseFloat(priceVal);
    if (!isNaN(num) && num >= 0) {
      updateMenuItemPrice(item.id, num);
      setPriceVal(String(num));
    } else {
      setPriceVal(String(item.price));
    }
    setEditingPrice(false);
  };

  const commitName = () => {
    const trimmed = nameVal.trim();
    if (trimmed) updateMenuItem(item.id, { name: trimmed });
    else setNameVal(item.name);
    setEditingName(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMenuItem(item.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <div>
    <div
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150
        ${item.available
          ? 'bg-panel border-line hover:border-olive-strong hover:shadow-sm'
          : 'bg-cream border-line opacity-70 hover:opacity-90'
        }
      `}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-line shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

      {/* Photo or category doodle */}
      <ItemThumb item={item} />

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        {editingName ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={nameRef}
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameVal(item.name); setEditingName(false); } }}
              onBlur={commitName}
              className="flex-1 text-sm font-semibold text-charcoal bg-olive-soft border border-olive rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-olive-soft"
            />
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 cursor-pointer group/name"
            onClick={() => setEditingName(true)}
            title="Click to edit name"
          >
            <p className="text-sm font-semibold text-charcoal truncate leading-tight">{item.name}</p>
            <Edit3 className="w-3 h-3 text-line opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
          </div>
        )}
        <p className="text-xs text-muted truncate mt-0.5">{item.description}</p>
        {(item.isFeatured || item.recommendedBy) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.isFeatured && <Chip tone="new">Featured</Chip>}
            {item.recommendedBy && <Chip tone="pick">{item.recommendedBy}&rsquo;s pick</Chip>}
          </div>
        )}
      </div>

      {/* Category badge */}
      <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-lg bg-cream-pressed text-muted shrink-0 whitespace-nowrap">
        {item.category}
      </span>

      {/* Price input */}
      <div className="shrink-0">
        {editingPrice ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted font-medium">Rs</span>
            <input
              ref={priceRef}
              type="number"
              min="0"
              step="0.5"
              value={priceVal}
              onChange={(e) => setPriceVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') { setPriceVal(String(item.price)); setEditingPrice(false); } }}
              onBlur={commitPrice}
              className="w-20 text-sm font-bold text-center text-olive-strong bg-olive-soft border border-olive rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-olive-soft"
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingPrice(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-olive-soft group/price transition-colors"
            title="Click to edit price"
          >
            <span className="text-sm font-bold text-olive-strong">{formatRs(item.price)}</span>
            <Edit3 className="w-3 h-3 text-line opacity-0 group-hover/price:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Availability toggle */}
      <button
        type="button"
        onClick={() => toggleMenuItemAvailability(item.id)}
        title={item.available ? 'Mark unavailable' : 'Mark available'}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full shrink-0
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-olive-soft focus:ring-offset-1
          ${item.available ? 'bg-olive-strong' : 'bg-line'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 rounded-full bg-panel shadow-md
            transform transition-transform duration-200
            ${item.available ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>

      {/* Status label */}
      <span className={`hidden lg:block text-[10px] font-bold w-16 text-center shrink-0 ${item.available ? 'text-olive-strong' : 'text-muted'}`}>
        {item.available ? 'Active' : 'Inactive'}
      </span>

      {/* Café details (dietary, featured, cat pick) */}
      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        aria-expanded={detailsOpen}
        aria-label={`Café details for ${item.name}`}
        className="p-2 rounded-xl text-muted hover:text-olive-dark hover:bg-olive-soft transition-colors shrink-0"
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
      </button>

      {/* Delete button */}
      {confirmDelete ? (
        <div className="flex items-center gap-1 shrink-0 animate-[fadeIn_0.15s_ease]">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1 bg-danger text-cream text-[11px] font-bold rounded-lg hover:bg-danger transition-colors active:scale-95"
          >
            <Check size={11} /> Yes
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="p-1 rounded-lg bg-cream-pressed hover:bg-line text-muted transition-colors active:scale-95"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl text-line hover:text-danger hover:bg-danger-soft transition-all duration-150 active:scale-90 shrink-0 opacity-0 group-hover:opacity-100"
          title="Delete item"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
    {detailsOpen && (
      <div className="mt-1 rounded-xl border border-line bg-cream px-4 py-3">
        <CafeDetailsFields value={item} onChange={(patch) => updateMenuItem(item.id, patch)} />
      </div>
    )}
    </div>
  );
}
