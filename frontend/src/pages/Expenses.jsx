// ─── Expenses ─────────────────────────────────────────────────────────────────
// Record what the café spends (ingredients, wages, rent…). The dashboard's
// expenses chart reads the same records.
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import TextField from '../components/ui/TextField';
import { isApiConfigured } from '../api/client';
import { fieldErrors } from '../api/public';
import { staffExpensesApi } from '../api/staff';
import { formatRs } from '../lib/format';

const CATEGORIES = { ingredients: 'Ingredients', labor: 'Labor', utilities: 'Utilities', rent: 'Rent', other: 'Other' };
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local
const BLANK = { expense_date: today(), category: 'ingredients', description: '', amount: '' };

export default function Expenses() {
  const [list, setList] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});

  const load = useCallback(
    () => staffExpensesApi.recent().then(setList).catch((err) => setErrors(fieldErrors(err))),
    [],
  );
  useEffect(() => {
    if (isApiConfigured) load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await staffExpensesApi.create({ ...form, amount: Number(form.amount) });
      setForm({ ...BLANK, expense_date: form.expense_date, category: form.category });
      setErrors({});
      load();
    } catch (err) {
      setErrors(fieldErrors(err));
    }
  };

  const remove = async (x) => {
    if (!window.confirm(`Delete "${x.description}" (${formatRs(x.amount)})?`)) return;
    await staffExpensesApi.remove(x.id).catch(() => {});
    load();
  };

  if (!isApiConfigured) {
    return (
      <div>
        <PageHeader title="Expenses" />
        <p className="text-muted">Expenses need the backend. Set VITE_API_URL and reload.</p>
      </div>
    );
  }

  const month = today().slice(0, 7);
  const monthTotal = (list ?? []).filter((x) => x.expense_date.startsWith(month)).reduce((n, x) => n + x.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" subtitle={`This month so far: ${formatRs(monthTotal)}`} />

      <form onSubmit={submit} className="grid gap-3 rounded-lg bg-panel p-4 sm:grid-cols-2 lg:grid-cols-[160px_180px_1fr_140px_auto] lg:items-end" noValidate>
        <TextField label="Date" type="date" value={form.expense_date} error={errors.expense_date}
          onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
        <Select label="Category" value={form.category} options={CATEGORIES} onChange={(v) => setForm({ ...form, category: v })} />
        <TextField label="What for" placeholder="Milk, 20 litres" value={form.description} error={errors.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <TextField label="Amount (Rs.)" type="number" min={0} step="0.01" value={form.amount} error={errors.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Button type="submit">Add</Button>
        {errors._form && <p className="wb-field-error m-0 sm:col-span-2 lg:col-span-5">{errors._form}</p>}
      </form>

      {list === null ? (
        <p className="text-muted">Loading expenses…</p>
      ) : list.length === 0 ? (
        <p className="text-muted">No expenses recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-panel">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">What for</th>
                <th className="px-4 py-3 text-right font-bold">Amount</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-4 py-2">{new Date(`${x.expense_date}T00:00`).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2">{x.category_display}</td>
                  <td className="px-4 py-2">{x.description}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatRs(x.amount)}</td>
                  <td className="px-4 py-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => remove(x)} aria-label={`Delete ${x.description}`}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
