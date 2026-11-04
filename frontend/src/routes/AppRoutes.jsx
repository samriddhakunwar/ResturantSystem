// ─── App Routes ───────────────────────────────────────────────────────────────
// Guest pages (no login) live at the root under PublicLayout; the staff
// dashboard lives under /staff with the POS state scoped to it.
import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { PosProvider } from '../context/PosContext';
import { RequireStaff, StaffProvider } from '../context/StaffContext';
import MainLayout from '../layouts/MainLayout';
import PublicLayout from '../layouts/PublicLayout';
import Dashboard from '../pages/Dashboard';
import NewOrder from '../pages/NewOrder';
import Orders from '../pages/Orders';
import Billing from '../pages/Billing';
import Menu from '../pages/Menu';
import Kitchen from '../pages/Kitchen';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import StaffLogin from '../pages/StaffLogin';
import Tables from '../pages/Tables';
import TablePrint from '../pages/TablePrint';
import CatsAdmin from '../pages/CatsAdmin';
import Bookings from '../pages/Bookings';
import ServiceRequests from '../pages/ServiceRequests';
import Expenses from '../pages/Expenses';
import Landing from '../pages/public/Landing';
import QrMenu from '../pages/public/QrMenu';
import OrderTracker from '../pages/public/OrderTracker';
import Cats from '../pages/public/Cats';
import CatDetail from '../pages/public/CatDetail';
import Book from '../pages/public/Book';

// Dev-only component gallery; the import is dropped from production builds.
const Styleguide = import.meta.env.DEV ? lazy(() => import('../pages/Styleguide')) : null;

/** Everything under /staff needs a token; POS state lives only here. */
function StaffShell() {
  return (
    <RequireStaff>
      <StaffProvider>
        <PosProvider>
          <Outlet />
        </PosProvider>
      </StaffProvider>
    </RequireStaff>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index              element={<Landing />}   />
        <Route path="menu"        element={<QrMenu />}    />
        <Route path="cats"        element={<Cats />}      />
        <Route path="cats/:slug"  element={<CatDetail />} />
        <Route path="book"        element={<Book />}      />
      </Route>
      <Route path="t/:token" element={<PublicLayout bare />}>
        <Route index                  element={<QrMenu />}       />
        <Route path="order/:publicId" element={<OrderTracker />} />
      </Route>

      <Route path="staff/login" element={<StaffLogin />} />
      <Route path="staff" element={<StaffShell />}>
        <Route element={<MainLayout />}>
          <Route index                   element={<Dashboard />}       />
          <Route path="new-order"        element={<NewOrder />}        />
          <Route path="orders"           element={<Orders />}          />
          <Route path="kitchen"          element={<Kitchen />}         />
          <Route path="billing"          element={<Billing />}         />
          <Route path="menu"             element={<Menu />}            />
          <Route path="cats"             element={<CatsAdmin />}       />
          <Route path="bookings"         element={<Bookings />}        />
          <Route path="tables"           element={<Tables />}          />
          <Route path="service-requests" element={<ServiceRequests />} />
          <Route path="expenses"         element={<Expenses />}        />
          <Route path="settings"         element={<Settings />}        />
        </Route>
        <Route path="tables/print" element={<TablePrint />} />
      </Route>
      {Styleguide && (
        <Route path="styleguide" element={<Suspense fallback={null}><Styleguide /></Suspense>} />
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
