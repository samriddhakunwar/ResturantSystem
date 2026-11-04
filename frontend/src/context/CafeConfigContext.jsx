// ─── Café Config ──────────────────────────────────────────────────────────────
// Loads GET /api/v1/public/config/ once (name, tagline, hours, socials, Wi-Fi)
// and sets the document title. Falls back to the defaults below when the
// backend is unreachable, so the shell always has a name to show.
import { createContext, useContext, useEffect, useState } from 'react';
import { isApiConfigured } from '../api/client';
import { publicApi } from '../api/public';

const DEFAULT_CONFIG = {
  cafe_name: 'Whisker & Brew',
  tagline: 'Coffee, cake and cats who choose you.',
  wifi: '',
  opening_hours: [],
  social: { facebook: '', instagram: '', tiktok: '' },
  currency: 'NPR',
  public_base_url: '',
  max_qty_per_line: 20,
  booking: { slot_minutes: 60, max_guests_per_slot: 12 },
};

const CafeConfigContext = createContext(DEFAULT_CONFIG);

export function CafeConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (!isApiConfigured) return;
    publicApi
      .config()
      .then((c) => setConfig({ ...DEFAULT_CONFIG, ...c }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = config.cafe_name;
  }, [config.cafe_name]);

  return <CafeConfigContext.Provider value={config}>{children}</CafeConfigContext.Provider>;
}

export const useCafeConfig = () => useContext(CafeConfigContext);
