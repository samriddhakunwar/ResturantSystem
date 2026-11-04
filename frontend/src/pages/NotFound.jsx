// ─── 404 Not Found Page ───────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import CatSilhouette from '../components/decor/CatSilhouette';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <CatSilhouette pose="crouching" className="mb-4 h-24 w-auto" />
      <h1 className="text-4xl font-bold text-charcoal mb-2">404</h1>
      <p className="text-xl font-semibold text-muted mb-1">Page not found</p>
      <p className="text-muted text-sm mb-8">
        This page wandered off. Cats do that.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-olive-strong hover:bg-olive-dark text-cream font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
      >
        <Home className="w-4 h-4" />
        Back home
      </Link>
    </div>
  );
}
