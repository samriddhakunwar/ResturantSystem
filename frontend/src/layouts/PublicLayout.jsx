// ─── Public Layout ────────────────────────────────────────────────────────────
// Guest pages (no login): cream ground, a faint paw trail in one corner, the
// café name in the display face and a slim olive-dark footer with the muted
// social links. Designed at 360px first. `bare` drops the header for pages
// that set their own (the QR menu says "Table 4 · Whisker & Brew").
import { Link, Outlet } from 'react-router-dom';
import PawTrail from '../components/decor/PawTrail';
import SocialLinks from '../components/ui/SocialLinks';
import { useCafeConfig } from '../context/CafeConfigContext';

export default function PublicLayout({ bare = false }) {
  const config = useCafeConfig();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-cream text-charcoal">
      <PawTrail className="absolute -right-6 top-2 w-28" />

      {!bare && (
        <header className="relative mx-auto flex w-full max-w-[960px] items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="whitespace-nowrap font-display text-xl font-extrabold text-charcoal no-underline min-[480px]:text-2xl">
            {config.cafe_name}
          </Link>
          <nav aria-label="Main" className="flex gap-4 whitespace-nowrap text-sm font-bold">
            <Link to="/cats" className="text-olive-strong">Our cats</Link>
            <Link to="/book" className="text-olive-strong">Book a visit</Link>
          </nav>
        </header>
      )}

      <main className="relative flex-1">
        <Outlet />
      </main>

      <footer className="mt-12 bg-olive-dark text-cream">
        <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="m-0 text-sm font-semibold">
            {config.cafe_name}
            {config.opening_hours[0] && <span className="font-medium"> · {config.opening_hours.join(' · ')}</span>}
          </p>
          <SocialLinks links={config.social} muted />
        </div>
      </footer>
    </div>
  );
}
