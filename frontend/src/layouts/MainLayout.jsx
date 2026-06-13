// ─── Main Layout ──────────────────────────────────────────────────────────────
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

export default function MainLayout() {
  const { pathname } = useLocation();
  const isFullBleed = pathname === '/new-order'; // POS page gets no padding

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className={`flex-1 overflow-hidden ${isFullBleed ? '' : 'overflow-y-auto p-4 sm:p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
