// ─── 404 Not Found Page ───────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-7xl mb-4">🍕</span>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-xl font-semibold text-gray-600 mb-1">Page not found</p>
      <p className="text-gray-400 text-sm mb-8">
        Oops! Looks like this page got lost in the oven.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
