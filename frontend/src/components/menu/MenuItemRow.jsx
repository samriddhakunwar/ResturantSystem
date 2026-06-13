// ─── Menu Item Row ────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Edit3, Check, X } from 'lucide-react';
import { usePOS } from '../../context/PosContext';

export default function MenuItemRow({ item }) {
  const { updateMenuItemPrice, toggleMenuItemAvailability, deleteMenuItem, updateMenuItem } = usePOS();

  const [editingPrice, setEditingPrice] = useState(false);
  const [priceVal, setPriceVal]         = useState(String(item.price));
  const [editingName, setEditingName]   = useState(false);
  const [nameVal, setNameVal]           = useState(item.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
    <div
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150
        ${item.available
          ? 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-sm'
          : 'bg-gray-50/60 border-gray-100 opacity-70 hover:opacity-90'
        }
      `}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

      {/* Food image / emoji */}
      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="w-full h-full flex items-center justify-center text-2xl">${item.emoji}</span>`;
          }}
        />
      </div>

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
              className="flex-1 text-sm font-semibold text-gray-900 bg-orange-50 border border-orange-300 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 cursor-pointer group/name"
            onClick={() => setEditingName(true)}
            title="Click to edit name"
          >
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{item.name}</p>
            <Edit3 className="w-3 h-3 text-gray-300 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
          </div>
        )}
        <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
      </div>

      {/* Category badge */}
      <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500 shrink-0 whitespace-nowrap">
        {item.category}
      </span>

      {/* Price input */}
      <div className="shrink-0">
        {editingPrice ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">Rs</span>
            <input
              ref={priceRef}
              type="number"
              min="0"
              step="0.5"
              value={priceVal}
              onChange={(e) => setPriceVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') { setPriceVal(String(item.price)); setEditingPrice(false); } }}
              onBlur={commitPrice}
              className="w-20 text-sm font-bold text-center text-orange-600 bg-orange-50 border border-orange-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingPrice(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-orange-50 group/price transition-colors"
            title="Click to edit price"
          >
            <span className="text-sm font-bold text-orange-500">Rs {item.price}</span>
            <Edit3 className="w-3 h-3 text-gray-300 opacity-0 group-hover/price:opacity-100 transition-opacity" />
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
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1
          ${item.available ? 'bg-orange-500' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 rounded-full bg-white shadow-md
            transform transition-transform duration-200
            ${item.available ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>

      {/* Status label */}
      <span className={`hidden lg:block text-[10px] font-bold w-16 text-center shrink-0 ${item.available ? 'text-green-600' : 'text-gray-400'}`}>
        {item.available ? 'Active' : 'Inactive'}
      </span>

      {/* Delete button */}
      {confirmDelete ? (
        <div className="flex items-center gap-1 shrink-0 animate-[fadeIn_0.15s_ease]">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg hover:bg-red-600 transition-colors active:scale-95"
          >
            <Check size={11} /> Yes
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors active:scale-95"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150 active:scale-90 shrink-0 opacity-0 group-hover:opacity-100"
          title="Delete item"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
