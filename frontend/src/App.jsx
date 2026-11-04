// ─── App Entry Point ──────────────────────────────────────────────────────────
import { BrowserRouter } from 'react-router-dom';
import { CafeConfigProvider } from './context/CafeConfigContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <CafeConfigProvider>
        <AppRoutes />
      </CafeConfigProvider>
    </BrowserRouter>
  );
}
