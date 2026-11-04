// ─── Table Card Print Sheet ───────────────────────────────────────────────────
// /staff/tables/print — every active table's TableTent, A6-sized, four to an
// A4 page. Opens outside the staff layout so only the cards print.
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import TableTent from '../components/ui/TableTent';
import { tablesApi } from '../api/staff';
import { useCafeConfig } from '../context/CafeConfigContext';

const PRINT_CSS = `
@page { size: A4; margin: 0; }
.tent-sheet { display: grid; grid-template-columns: repeat(2, 105mm); grid-auto-rows: 148.5mm; width: 210mm; margin: 0 auto; }
.tent-cell { display: flex; align-items: center; justify-content: center; outline: 1px dashed var(--line); }
@media print {
  body { background: #fff; }
  .tent-sheet { margin: 0; }
  .tent-cell { outline: none; break-inside: avoid; }
  .tent-cell:nth-child(4n) { break-after: page; }
  .no-print { display: none !important; }
}
`;

export default function TablePrint() {
  const config = useCafeConfig();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    tablesApi
      .list()
      .then((tables) =>
        Promise.all(
          tables
            .filter((t) => t.is_active)
            .map(async (t) => ({ table: t, svg: await (await tablesApi.qr(t.id, 'svg')).text() })),
        ),
      )
      .then(setCards)
      .catch(() => setError('Could not load the QR codes.'));
  }, []);

  return (
    <div className="min-h-screen bg-cream py-6 text-charcoal">
      <style>{PRINT_CSS}</style>
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <div>
          <h1 className="m-0 font-display text-[28px] font-extrabold">Table cards</h1>
          <p className="m-0 text-sm text-muted">A6 cards, four per A4 sheet. Cut along the dashed lines.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" to="/staff/tables">Back</Button>
          <Button onClick={() => window.print()} disabled={!cards?.length}>Print</Button>
        </div>
      </div>
      {error && <p className="no-print text-center text-danger">{error}</p>}
      {cards === null && !error && <p className="no-print text-center text-muted">Making the QR codes…</p>}
      {cards?.length === 0 && <p className="no-print text-center text-muted">No active tables to print.</p>}
      {cards?.length > 0 && (
        <div className="tent-sheet">
          {cards.map(({ table, svg }) => (
            <div key={table.id} className="tent-cell">
              <TableTent cafeName={config.cafe_name} tableLabel={table.display_label} wifi={config.wifi} qrSvg={svg} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
