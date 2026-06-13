// ─── App Routes ───────────────────────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import NewOrder from '../pages/NewOrder';
import Orders from '../pages/Orders';
import Billing from '../pages/Billing';
import Menu from '../pages/Menu';
import Kitchen from '../pages/Kitchen';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';


export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index           element={<Dashboard />}  />
        <Route path="new-order" element={<NewOrder />}   />
        <Route path="orders"    element={<Orders />}     />
        <Route path="billing"   element={<Billing />}    />
        <Route path="menu"      element={<Menu />}       />
        <Route path="kitchen"   element={<Kitchen />}    />
        <Route path="settings"  element={<Settings />}   />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
