// ─── Top Navbar ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import SearchBar from '../ui/SearchBar';

export default function Navbar() {
  const { toggleSidebar } = usePOS();
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState('');
  console.log("small changes");
  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile/tablet) */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <SearchBar
          placeholder="Search orders, customers…"
          value={search}
          onChange={setSearch}
          className="flex-1 max-w-sm"
        />

        <div className="flex items-center gap-2 ml-auto">
          {/* Time & Date */}
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-bold text-gray-800 leading-tight">{timeStr}</span>
            <span className="text-xs text-gray-400">{dateStr}</span>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>

          {/* Admin avatar */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
              A
            </div>
            <span className="hidden sm:block text-sm font-semibold text-gray-800">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
