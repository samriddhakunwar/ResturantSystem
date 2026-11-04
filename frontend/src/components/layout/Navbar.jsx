// ─── Top Navbar ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import { useStaff } from '../../context/StaffContext';
import { isApiConfigured } from '../../api/client';

export default function Navbar() {
  const { toggleSidebar, online, loadError } = usePOS();
  const { user, logout } = useStaff();
  const [now, setNow] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const name = user?.first_name || user?.username;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile/tablet) */}
        <button
          onClick={toggleSidebar}
          className="rounded-sm p-2 text-muted transition-colors hover:bg-cream-pressed lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {!isApiConfigured && (
          <span className="rounded-full bg-ginger-soft px-3 py-1 text-xs font-bold text-ginger-ink">Demo data (no backend)</span>
        )}
        {isApiConfigured && loadError && !online && (
          <span role="alert" className="rounded-full bg-danger-soft px-3 py-1 text-xs font-bold text-danger">{loadError}</span>
        )}

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-bold leading-tight text-charcoal tabular-nums">{timeStr}</span>
            <span className="text-xs text-muted">{dateStr}</span>
          </div>
          {isApiConfigured && (
            <div className="flex items-center gap-3">
              {name && <span className="hidden text-sm font-semibold text-charcoal sm:block">{name}</span>}
              <button type="button" onClick={logout} className="wb-btn wb-btn--outline wb-btn--sm">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
