// ─── Service Requests ─────────────────────────────────────────────────────────
// "Call staff", "Request bill" and "Water please" from the guests' phones,
// oldest first. The list (and the sidebar badge) refresh every 15s.
import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import CatSilhouette from '../components/decor/CatSilhouette';
import { fieldErrors } from '../api/public';
import { serviceApi } from '../api/staff';
import { useStaff } from '../context/StaffContext';

const minutesAgo = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));

export default function ServiceRequests() {
  const { openRequests, refreshRequests } = useStaff();
  const [error, setError] = useState('');
  const list = [...openRequests].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const resolve = async (id) => {
    try {
      await serviceApi.resolve(id);
      await refreshRequests();
    } catch (err) {
      setError(fieldErrors(err)._form ?? 'That didn’t work.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Service Requests" subtitle="Guests asking for help from their table." />
      {error && <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">{error}</p>}
      {list.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <CatSilhouette pose="lying" className="mx-auto mb-3 h-14 w-auto" />
          <p className="m-0 font-semibold">All quiet. Nobody needs anything right now.</p>
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-line bg-panel p-4">
              <div>
                <p className="m-0 font-display text-xl font-extrabold text-charcoal">{r.table_label}</p>
                <p className="m-0 font-bold text-olive-strong">{r.type_display}</p>
                <p className={`m-0 text-xs ${minutesAgo(r.created_at) >= 5 ? 'font-bold text-danger' : 'text-muted'}`}>
                  {minutesAgo(r.created_at)} min ago
                </p>
              </div>
              <Button size="sm" onClick={() => resolve(r.id)}>Done</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
