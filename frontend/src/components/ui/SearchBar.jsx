// ─── Search Bar ───────────────────────────────────────────────────────────────
import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = 'Search…', value, onChange, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200
          rounded-xl outline-none focus:ring-2 focus:ring-orange-400/50
          focus:border-orange-400 transition-all duration-200
          placeholder:text-gray-400
        "
      />
    </div>
  );
}
