// ─── Tables & QR ──────────────────────────────────────────────────────────────
// Add and edit tables, switch them off, preview and download each table's QR
// code, and regenerate a token (old printed cards stop working). The QR files
// are fetched with the staff token, so they're turned into object URLs here.
import { useCallback, useEffect, useState } from 'react';
import { Download, Printer, RefreshCw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import TextField from '../components/ui/TextField';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { fieldErrors } from '../api/public';
import { tablesApi } from '../api/staff';
import { useCafeConfig } from '../context/CafeConfigContext';

function useQrPreview(table) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!table) return undefined;
    let objectUrl = null;
    tablesApi.qr(table.id, 'png').then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => setUrl(null));
    return () => objectUrl && URL.revokeObjectURL(objectUrl);
  }, [table?.id, table?.qr_token]); // eslint-disable-line react-hooks/exhaustive-deps
  return url;
}

async function download(table, fmt) {
  const blob = await tablesApi.qr(table.id, fmt);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `table-${table.number}-qr.${fmt}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function AddTable({ onAdded, nextNumber }) {
  const [form, setForm] = useState({ number: '', label: '', seats: 4 });
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    try {
      await tablesApi.create({ ...form, number: Number(form.number || nextNumber), seats: Number(form.seats) });
      setForm({ number: '', label: '', seats: 4 });
      setErrors({});
      onAdded();
    } catch (err) {
      setErrors(fieldErrors(err));
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-lg bg-panel p-4">
      <TextField className="w-28" label="Number" type="number" min={1} placeholder={String(nextNumber)}
        value={form.number} error={errors.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
      <TextField className="min-w-[180px] flex-1" label="Label" help="Optional, e.g. Window nook" maxLength={50}
        value={form.label} error={errors.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      <TextField className="w-24" label="Seats" type="number" min={1} max={20}
        value={form.seats} error={errors.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
      <Button type="submit">Add table</Button>
      {errors._form && <p className="wb-field-error m-0 w-full">{errors._form}</p>}
    </form>
  );
}

export default function Tables() {
  const config = useCafeConfig();
  const [tables, setTables] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(
    () => tablesApi.list().then(setTables).catch((err) => setError(fieldErrors(err)._form)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);

  const selected = tables?.find((t) => t.id === selectedId) ?? tables?.[0] ?? null;
  const preview = useQrPreview(selected);

  const act = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(fieldErrors(err)._form ?? 'That didn’t work.');
    }
  };

  const regenerate = (t) => {
    if (window.confirm(`Make a new QR code for ${t.display_label}? The printed card on that table will stop working.`)) {
      act(() => tablesApi.regenerate(t.id));
    }
  };

  const remove = (t) => {
    if (window.confirm(`Delete ${t.display_label}? Past orders keep their table number.`)) {
      act(() => tablesApi.remove(t.id));
    }
  };

  const nextNumber = (tables ?? []).reduce((n, t) => Math.max(n, t.number), 0) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tables & QR"
        subtitle={`QR codes open ${config.public_base_url || 'the guest menu'}/t/…`}
        action={<Button variant="outline" to="/staff/tables/print"><Printer size={16} aria-hidden="true" /><span className="ml-2">Print table cards</span></Button>}
      />
      {error && <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">{error}</p>}

      <AddTable onAdded={load} nextNumber={nextNumber} />

      {tables === null ? (
        <p className="text-muted">Loading tables…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="m-0 list-none space-y-2 p-0">
            {tables.map((t) => (
              <li key={t.id} className={`flex flex-wrap items-center gap-3 rounded-md border bg-panel px-4 py-3 ${selected?.id === t.id ? 'border-olive-strong' : 'border-line'}`}>
                <button type="button" onClick={() => setSelectedId(t.id)} aria-pressed={selected?.id === t.id}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left">
                  <span className="block font-display text-lg font-extrabold text-charcoal">{t.display_label}</span>
                  <span className="text-sm text-muted">Table {t.number} · {t.seats} seats</span>
                </button>
                {!t.is_active && <Chip>Off</Chip>}
                <div className="w-36">
                  <ToggleSwitch label="Taking orders" checked={t.is_active}
                    onChange={(on) => act(() => tablesApi.update(t.id, { is_active: on }))} />
                </div>
                <Button size="sm" variant="outline" onClick={() => regenerate(t)}>
                  <RefreshCw size={14} aria-hidden="true" /><span className="ml-1.5">New QR</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(t)}>Delete</Button>
              </li>
            ))}
            {tables.length === 0 && <li className="text-muted">No tables yet. Add the first one above.</li>}
          </ul>

          {selected && (
            <aside className="h-fit space-y-3 rounded-lg bg-panel p-4 text-center" aria-label={`QR code for ${selected.display_label}`}>
              <h2 className="m-0 font-display text-xl font-extrabold text-olive-dark">{selected.display_label}</h2>
              <div className="mx-auto w-48 rounded-sm bg-[#ffffff] p-2">
                {preview ? <img src={preview} alt={`QR code for ${selected.display_label}`} className="block h-auto w-full" /> : <div className="aspect-square" />}
              </div>
              <div className="flex justify-center gap-2">
                <Button size="sm" onClick={() => act(() => download(selected, 'png'))}><Download size={14} aria-hidden="true" /><span className="ml-1.5">PNG</span></Button>
                <Button size="sm" variant="outline" onClick={() => act(() => download(selected, 'svg'))}><Download size={14} aria-hidden="true" /><span className="ml-1.5">SVG</span></Button>
              </div>
              <p className="m-0 break-all text-xs text-muted">/t/{selected.qr_token}</p>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
