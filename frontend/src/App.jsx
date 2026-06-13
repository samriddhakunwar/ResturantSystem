// ─── App Entry Point ──────────────────────────────────────────────────────────
import { BrowserRouter } from 'react-router-dom';
import { PosProvider } from './context/PosContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <PosProvider>
        <AppRoutes />
      </PosProvider>
    </BrowserRouter>
  );
}
