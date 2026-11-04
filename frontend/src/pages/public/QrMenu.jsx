// ─── QR Menu ──────────────────────────────────────────────────────────────────
// /t/:token — the menu a guest opens by scanning their table's QR code.
// /menu    — the same menu, browse only (no table, no cart).
// Layout per the kit: table header → CatAvatarStrip → sticky CategoryTabs →
// MenuItemCards → CartBar pinned to the bottom.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import CartBar from '../../components/ui/CartBar';
import CatAvatarStrip from '../../components/ui/CatAvatarStrip';
import CategoryTabs from '../../components/ui/CategoryTabs';
import Chip, { ChipToggle } from '../../components/ui/Chip';
import MenuItemCard from '../../components/ui/MenuItemCard';
import TextField from '../../components/ui/TextField';
import { ApiError, isApiConfigured } from '../../api/client';
import { fieldErrors, publicApi } from '../../api/public';
import { useCafeConfig } from '../../context/CafeConfigContext';
import { DIETARY_FILTERS } from '../../lib/dietary';
import GuestMessage from './GuestMessage';
import CartSheet from './CartSheet';
import { readTableOrders, rememberTableOrder, useTableCart } from './tableStorage';

const DOODLES = ['steaming-cup', 'leaf', 'sparkle', 'fish-bone', 'dot', 'toy-mouse'];
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function QrMenu() {
  const { token } = useParams();
  const navigate = useNavigate();
  const config = useCafeConfig();
  const [status, setStatus] = useState(isApiConfigured ? 'loading' : 'offline');
  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cats, setCats] = useState([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [notice, setNotice] = useState('');
  const { cart, add, setQty, setNote, setNotes, prune, clear } = useTableCart(token);
  const scrollLock = useRef(0);

  // ── Load table, menu and the cats in the room ───────────────────────────────
  useEffect(() => {
    if (!isApiConfigured) return;
    let cancelled = false;
    Promise.all([
      token ? publicApi.table(token) : Promise.resolve(null),
      publicApi.menu(),
      publicApi.cats('?present=1').catch(() => []),
    ])
      .then(([t, m, c]) => {
        if (cancelled) return;
        setTable(t);
        setMenu(m);
        setCats(c);
        setActiveCat(m[0]?.id ?? null);
        setStatus('ready');
      })
      .catch((err) => {
        if (!cancelled) setStatus(err instanceof ApiError && err.status === 404 ? 'snoozing' : 'offline');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const itemsById = useMemo(
    () => Object.fromEntries(menu.flatMap((c) => c.items.map((i) => [i.id, { ...i, category: c.name }]))),
    [menu],
  );

  // Items that sold out (or vanished) since they went into the cart.
  useEffect(() => {
    if (status !== 'ready' || !token) return;
    const gone = prune((id) => itemsById[id]?.is_available);
    if (gone.length) setNotice('Something in your cart just sold out, so we took it out.');
    // Run once per menu load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, itemsById]);

  // ── Search and dietary filters ──────────────────────────────────────────────
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tests = DIETARY_FILTERS.filter((f) => filters.includes(f.key)).map((f) => f.test);
    return menu
      .map((c, i) => ({
        ...c,
        doodle: DOODLES[i % DOODLES.length],
        items: c.items.filter(
          (item) =>
            (!q || `${item.name} ${item.description}`.toLowerCase().includes(q)) &&
            tests.every((t) => t(item.dietary_tags)),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [menu, query, filters]);

  // ── Highlight the tab of the section in view ────────────────────────────────
  const sectionKey = sections.map((s) => s.id).join(',');
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < scrollLock.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveCat(Number(visible[0].target.dataset.cat));
      },
      { rootMargin: '-72px 0px -60% 0px' },
    );
    document.querySelectorAll('[data-cat]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [status, sectionKey]);

  const jumpTo = useCallback((id) => {
    setActiveCat(id);
    scrollLock.current = Date.now() + 800; // don't let the observer fight the scroll
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }, []);

  // ── Send to kitchen ─────────────────────────────────────────────────────────
  const sendOrder = async () => {
    setSending(true);
    setSendError('');
    try {
      const order = await publicApi.placeOrder(token, {
        items: cart.lines
          .filter((l) => itemsById[l.id])
          .map((l) => ({ menu_item: l.id, quantity: l.qty, notes: l.note.trim() })),
        notes: cart.notes.trim(),
      });
      rememberTableOrder(token, order);
      clear();
      setSheetOpen(false);
      navigate(`/t/${token}/order/${order.public_id}`);
    } catch (err) {
      const errs = fieldErrors(err);
      setSendError(errs._form || errs.items || Object.values(errs)[0]);
    } finally {
      setSending(false);
    }
  };

  // ── States ──────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return <GuestMessage title="Warming up the menu…" pose="grooming" />;
  }
  if (status === 'snoozing') {
    return (
      <GuestMessage title="This table's QR is snoozing — please ask our staff">
        <p className="m-0">The code may be old or the table is closed right now.</p>
      </GuestMessage>
    );
  }
  if (status === 'offline') {
    return (
      <GuestMessage title="We can't reach the café system" pose="lying">
        <p className="m-0">Please ask our staff to take your order.</p>
      </GuestMessage>
    );
  }

  const count = cart.lines.reduce((n, l) => n + (itemsById[l.id] ? l.qty : 0), 0);
  const total = cart.lines.reduce((sum, l) => sum + (itemsById[l.id]?.price ?? 0) * l.qty, 0);
  const pastOrders = token ? readTableOrders(token) : [];

  return (
    <div className="mx-auto max-w-[480px] pb-28">
      <header className="px-4 pb-2 pt-5">
        <h1 className="m-0 font-display text-[28px] font-extrabold leading-8 text-charcoal">
          {table ? `${table.label} · ${config.cafe_name}` : config.cafe_name}
        </h1>
        <p className="m-0 mt-1 text-sm text-muted">
          {table ? 'Order here and we’ll bring it to your table.' : 'Scan the QR code on your table to order.'}
        </p>
        {pastOrders.length > 0 && (
          <Button size="sm" variant="outline" className="mt-3" to={`/t/${token}/order/${pastOrders[0].publicId}`}>
            Track order #{pastOrders[0].code}
          </Button>
        )}
      </header>

      <div className="py-3">
        <CatAvatarStrip cats={cats} />
      </div>

      <div className="space-y-3 px-4 pb-1">
        <div className="relative">
          <TextField
            label="Search the menu"
            type="search"
            placeholder="Chiya, waffles, momo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="[&_input]:pl-11"
          />
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute bottom-3.5 left-4 text-olive-strong" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary filters">
          {DIETARY_FILTERS.map((f) => (
            <ChipToggle
              key={f.key}
              pressed={filters.includes(f.key)}
              onChange={(on) => setFilters((s) => (on ? [...s, f.key] : s.filter((k) => k !== f.key)))}
            >
              {f.label}
            </ChipToggle>
          ))}
        </div>
      </div>

      {notice && (
        <p role="status" className="mx-4 mt-3 rounded-sm bg-ginger-soft px-3 py-2 text-sm font-semibold text-ginger-ink">
          {notice}
        </p>
      )}

      {sections.length > 0 ? (
        <>
          <CategoryTabs categories={sections} activeId={activeCat} onSelect={jumpTo} />
          {sections.map((section) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              data-cat={section.id}
              aria-labelledby={`heading-${section.id}`}
              className="scroll-mt-16 px-4 pt-4"
            >
              <h2 id={`heading-${section.id}`} className="m-0 mb-3 font-display text-2xl font-extrabold text-olive">
                {section.name}
              </h2>
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    image={item.image}
                    placeholder={section.doodle}
                    dietaryTags={item.dietary_tags}
                    pickedBy={item.recommended_by?.name}
                    extraChips={item.is_featured ? <Chip tone="new">Featured</Chip> : null}
                    soldOut={!item.is_available}
                    onAdd={token ? () => add(item.id, config.max_qty_per_line) : undefined}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <GuestMessage title="Nothing matches those filters" pose="stretching"
          action={<Button variant="outline" onClick={() => { setQuery(''); setFilters([]); }}>Clear filters</Button>}
        />
      )}

      {token && (
        <>
          <CartBar count={count} total={total} onOpen={() => setSheetOpen(true)} />
          <CartSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            tableLabel={table?.label}
            cart={cart}
            itemsById={itemsById}
            onQty={setQty}
            onNote={setNote}
            onNotes={setNotes}
            onSend={sendOrder}
            sending={sending}
            error={sendError}
          />
        </>
      )}
    </div>
  );
}
