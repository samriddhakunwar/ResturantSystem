// ─── Staff Context ────────────────────────────────────────────────────────────
// Who is signed in, plus the open service-request count for the sidebar
// badge. <RequireStaff> guards the /staff routes: no token → /staff/login.
// Offline (mock) mode has no backend to sign in to, so it lets everyone in.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isApiConfigured, staffToken } from '../api/client';
import { authApi, serviceApi } from '../api/staff';
import usePolling from '../lib/usePolling';

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
  const [user, setUser] = useState(null);
  const [openRequests, setOpenRequests] = useState([]);

  useEffect(() => {
    if (isApiConfigured && staffToken.get()) authApi.me().then(setUser).catch(() => {});
  }, []);

  const refreshRequests = useCallback(
    () => serviceApi.open().then(setOpenRequests).catch(() => {}),
    [],
  );
  usePolling(refreshRequests, 15000, isApiConfigured);

  const logout = async () => {
    await authApi.logout();
    window.location.assign('/staff/login');
  };

  return (
    <StaffContext.Provider value={{ user, logout, openRequests, refreshRequests }}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaff = () => useContext(StaffContext);

export function RequireStaff({ children }) {
  const { pathname } = useLocation();
  if (isApiConfigured && !staffToken.get()) {
    return <Navigate to={`/staff/login?next=${encodeURIComponent(pathname)}`} replace />;
  }
  return children;
}
