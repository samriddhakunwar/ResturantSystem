// ─── Style Guide (dev only) ───────────────────────────────────────────────────
// Every kit component in every state, laid out like ui-kit/preview-1/2/3.png.
// Mounted at /styleguide only when import.meta.env.DEV is true.
import { useState } from 'react';
import Button from '../components/ui/Button';
import SectionPanel from '../components/ui/SectionPanel';
import Chip, { ChipToggle } from '../components/ui/Chip';
import CategoryTabs from '../components/ui/CategoryTabs';
import MenuItemCard from '../components/ui/MenuItemCard';
import QuantityStepper from '../components/ui/QuantityStepper';
import CartBar from '../components/ui/CartBar';
import OrderStatus, { ORDER_STEPS } from '../components/ui/OrderStatus';
import CatCard from '../components/ui/CatCard';
import CatAvatarStrip from '../components/ui/CatAvatarStrip';
import SlotPicker from '../components/ui/SlotPicker';
import TextField, { Checkbox } from '../components/ui/TextField';
import TableTent from '../components/ui/TableTent';
import SocialLinks from '../components/ui/SocialLinks';
import PawPeek from '../components/ui/PawPeek';
import Doodle from '../components/decor/Doodle';
import PawTrail from '../components/decor/PawTrail';
import CatSilhouette, { CAT_POSES } from '../components/decor/CatSilhouette';
import { PAWS } from '../components/decor/assets';
import sampleQr from './styleguide-sample-qr.svg?raw';

const SWATCHES = [
  ['cream', 'bg-cream'], ['panel', 'bg-panel'], ['olive', 'bg-olive'], ['olive-strong', 'bg-olive-strong'],
  ['olive-dark', 'bg-olive-dark'], ['charcoal', 'bg-charcoal'], ['ink-muted', 'bg-muted'], ['line', 'bg-line'],
  ['olive-soft', 'bg-olive-soft'], ['ginger', 'bg-ginger'], ['ginger-ink', 'bg-ginger-ink'], ['ginger-soft', 'bg-ginger-soft'],
  ['danger', 'bg-danger'], ['danger-soft', 'bg-danger-soft'],
];

const CATS = [
  { name: 'Momo', slug: 'momo', age_years: 2, sex: 'girl', breed_or_look: 'tabby', personality_tags: ['Sleepy', 'Lap cat'], adoption_status: 'resident', is_present_today: true },
  { name: 'Chiya', slug: 'chiya', age_months: 8, sex: 'boy', breed_or_look: 'ginger', personality_tags: ['Playful', 'Yarn hunter'], adoption_status: 'available', is_present_today: true },
  { name: 'Mishri', slug: 'mishri', age_years: 5, sex: 'girl', breed_or_look: 'calico', personality_tags: ['Shy', 'Treat-motivated'], adoption_status: 'available', is_present_today: false },
  { name: 'Biscuit', slug: 'biscuit', is_present_today: true },
  { name: 'Bhoto', slug: 'bhoto', is_present_today: true },
  { name: 'Pepper', slug: 'pepper', is_present_today: true },
];

const SLOTS = [
  { start: '10:00', remaining: 8 }, { start: '11:00', remaining: 3 }, { start: '12:00', remaining: 0 },
  { start: '13:00', remaining: 12 }, { start: '14:00', remaining: 6 }, { start: '15:00', remaining: 0 },
];

const TABS = ['Purr-over Coffee', 'Tea & Mew-lk', 'Pawstries', 'Meals Fur-real', 'Cool Cat Drinks', 'Kitten Treats']
  .map((name, id) => ({ id, name }));

const STATES = [
  ['Default', ''], ['Hover', 'is-hover'], ['Active', 'is-active'], ['Pressed', 'is-pressed'], ['Disabled', 'is-disabled'],
];

function Group({ title, children }) {
  return (
    <section className="border-t-8 border-[#9b9b9b] py-6">
      <h2 className="wb-state px-4 !text-base">{title}</h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({ veg: true });
  const [qty, setQty] = useState(2);
  const [slot, setSlot] = useState('11:00');
  const [step, setStep] = useState(2);
  const [rules, setRules] = useState(true);

  return (
    <main className="mx-auto max-w-[960px] bg-cream pb-24">
      {/* ── preview-1: cover ─────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-8 px-8 py-10">
        <div className="flex-1">
          <h1 className="m-0 font-display text-[88px] font-extrabold leading-[0.9] text-charcoal">Whisker &amp;<br />Brew</h1>
          <p className="m-0 mt-4 text-muted">Cosy cat café, olive and cream, paws on every page.</p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="text-center">
              <div className={`h-12 w-12 rounded-md border border-line ${cls}`} />
              <p className="m-0 mt-1 w-12 break-words text-[10px] leading-3 text-muted">{name}</p>
            </div>
          ))}
        </div>
      </header>

      <Group title="Button — light, primary and outline, in the kit's five states">
        <div className="px-4">
          <div className="wb-panel">
            <h2 className="wb-panel-title">Buttons</h2>
            <div className="grid grid-cols-5 gap-3">
              {STATES.map(([label]) => <p key={label} className="wb-state">{label}</p>)}
              {['light', 'primary'].map((variant) =>
                STATES.map(([label, cls]) => (
                  <Button key={variant + label} variant={variant} className={cls} disabled={cls === 'is-disabled'}>
                    Book a visit
                  </Button>
                )),
              )}
            </div>
          </div>
          <div className="wb-row !px-0">
            <Button variant="outline">See the menu</Button>
            <Button variant="outline" active>Active outline</Button>
            <Button size="sm">Small</Button>
            <Button size="sm" variant="outline">Small outline</Button>
            <Button to="/styleguide" variant="outline" active>Link (aria-current)</Button>
          </div>
          <Button block>Send to kitchen (block)</Button>
        </div>
      </Group>

      <Group title="SectionPanel — charcoal hero cat perched on the edge, one doodle row, one script word">
        <div className="px-4">
          <SectionPanel title="Purr-over Coffee" cat="walking-charcoal" catClassName="right-[6%] h-[110px]">
            <p className="m-0 text-center text-muted">Single-origin beans, roasted in Kathmandu, served slow.</p>
            <div className="mt-3 flex items-center justify-center gap-8">
              <Doodle name="steaming-cup" className="h-10" />
              <span className="wb-script">meow</span>
              <Doodle name="leaf" className="h-9" />
              <Doodle name="sparkle" className="h-8" />
            </div>
          </SectionPanel>
        </div>
      </Group>

      <Group title="CategoryTabs">
        <CategoryTabs categories={TABS} activeId={tab} onSelect={setTab} className="!static" />
      </Group>

      <Group title="Chip — veg, vegan, neutral, allergen, new, pick; ChipToggle filters">
        <div className="wb-row">
          <Chip tone="veg">Veg</Chip>
          <Chip tone="veg">Vegan</Chip>
          <Chip>Gluten-free</Chip>
          <Chip tone="allergen">Contains nuts</Chip>
          <Chip tone="new">New</Chip>
          <Chip tone="pick">Momo&rsquo;s pick</Chip>
        </div>
        <div className="wb-row">
          {['Veg', 'Vegan', 'Gluten-free', 'No nuts'].map((f) => (
            <ChipToggle key={f} pressed={!!filters[f.toLowerCase()]} onChange={(on) => setFilters((s) => ({ ...s, [f.toLowerCase()]: on }))}>
              {f}
            </ChipToggle>
          ))}
        </div>
      </Group>

      {/* ── preview-2 ────────────────────────────────────────────────── */}
      <Group title="MenuItemCard — available, new, sold out (Napping · sold out)">
        <div className="wb-stack max-w-[452px]">
          <MenuItemCard name="Catpuccino" description="Double shot, velvety foam and a cocoa paw on top." price={280} dietaryTags={['veg']} pickedBy="Momo" onAdd={() => {}} />
          <MenuItemCard name="Purrfect Masala Chiya" description="Milky black tea with ginger, cardamom and clove." price={120} placeholder="leaf" dietaryTags={['vegan']} extraChips={<Chip tone="new">New</Chip>} onAdd={() => {}} />
          <MenuItemCard name="Tuna Melt Paws" description="Toasted sourdough, tuna, cheddar and pickled onion." price={450} placeholder="fish-bone" dietaryTags={['contains_dairy']} soldOut />
        </div>
      </Group>

      <Group title="QuantityStepper — cart line (minus removes at 1) and party size (min 1)">
        <div className="wb-row">
          <QuantityStepper value={qty} onChange={setQty} label="Quantity of Catpuccino" removable />
          <QuantityStepper value={1} onChange={() => {}} label="Quantity of Babycino" removable />
          <QuantityStepper value={1} onChange={() => {}} label="Party size" />
          <QuantityStepper value={20} onChange={() => {}} label="At the cap" removable />
        </div>
      </Group>

      <Group title="CartBar">
        <div className="max-w-[452px] px-4">
          <CartBar count={3} total={850} floating={false} onOpen={() => {}} />
        </div>
      </Group>

      <Group title="OrderStatus — walking cat over the current step (tap to step through)">
        <div className="max-w-[452px] px-4">
          <OrderStatus step={ORDER_STEPS[step].key} subtitle="Order #A7F2 · Table 4" />
          <div className="wb-row !px-0">
            <Button size="sm" variant="outline" onClick={() => setStep((s) => (s + 1) % 5)}>Next step</Button>
          </div>
          <OrderStatus step="cancelled" subtitle="Order #B19C · Table 2" className="mt-4" />
        </div>
      </Group>

      {/* ── preview-3 ────────────────────────────────────────────────── */}
      <Group title="CatCard — resident, looking for a home; silhouettes until photos exist">
        <div className="grid grid-cols-1 gap-4 px-4 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
          {CATS.slice(0, 3).map((cat, i) => (
            <CatCard key={cat.slug} cat={cat} to="/styleguide" pose={['sitting', 'pouncing', 'lying'][i]} />
          ))}
        </div>
      </Group>

      <Group title="CatAvatarStrip">
        <CatAvatarStrip cats={CATS} />
      </Group>

      <Group title="SlotPicker — selected, full (disabled, struck through)">
        <div className="px-4">
          <p className="m-0 mb-2 font-bold">Pick a time · Sat 14 Nov</p>
          <SlotPicker slots={SLOTS} value={slot} onChange={setSlot} />
          <div className="mt-4"><Button>Book a visit</Button></div>
        </div>
      </Group>

      <Group title="TextField & Checkbox — help text, is-error, textarea">
        <div className="grid gap-4 px-4 min-[600px]:grid-cols-2">
          <TextField label="Your name" defaultValue="Asha Gurung" help="So we can greet you at the door." />
          <TextField label="Phone" defaultValue="98412" inputMode="tel" error="Enter a 10-digit mobile number." />
          <TextField className="min-[600px]:col-span-2" label="Note for the kitchen" placeholder="Less sugar, please" multiline />
          <Checkbox className="min-[600px]:col-span-2" checked={rules} onChange={(e) => setRules(e.target.checked)}>
            I&rsquo;ll wash my hands, won&rsquo;t wake sleeping cats, and children under 12 stay with an adult.
          </Checkbox>
          <Checkbox className="min-[600px]:col-span-2" checked={false} onChange={() => {}} error="Please accept the café rules to book.">
            I accept the café rules.
          </Checkbox>
        </div>
      </Group>

      <Group title="TableTent — real QR from the API in the app; a sample code here">
        <div className="flex justify-center px-4">
          <TableTent cafeName="Whisker & Brew" tableLabel="Table 4" wifi="WhiskerGuest" qrSvg={sampleQr} />
        </div>
      </Group>

      <Group title="SocialLinks — on cream, and muted on the olive-dark footer">
        <div className="wb-row">
          <SocialLinks links={{ facebook: '#', instagram: '#', tiktok: '#' }} />
        </div>
        <div className="mx-4 rounded-lg bg-olive-dark p-4">
          <SocialLinks muted links={{ facebook: '#', instagram: '#', tiktok: '#' }} />
        </div>
      </Group>

      <Group title="Decorative elements — paw trail, doodles, script word, paw reach, paw peeks">
        <div className="relative min-h-[260px] pr-[130px]">
          <div className="mx-4 wb-panel">
            <h2 className="wb-panel-title">Decorative elements</h2>
            <div className="flex flex-wrap items-end justify-around gap-4">
              <PawTrail className="h-16" />
              <Doodle name="steaming-cup" className="h-12" />
              <Doodle name="yarn-ball" className="h-12" />
              <Doodle name="toy-mouse" className="h-10" />
              <span className="wb-script">yawn</span>
              <Doodle name="hearts" className="h-10" />
              <img src={PAWS['paw-reach']} alt="" className="h-16" />
            </div>
          </div>
          <PawPeek color="calico" top={0} />
          <PawPeek color="ginger" top={90} />
          <PawPeek color="black" top={180} />
        </div>
      </Group>

      <Group title="Cats — all nine poses">
        <div className="wb-row items-end">
          {CAT_POSES.map((pose) => (
            <figure key={pose} className="m-0 text-center">
              <CatSilhouette pose={pose} className="h-16 w-auto" />
              <figcaption className="wb-state mt-1">{pose}</figcaption>
            </figure>
          ))}
        </div>
      </Group>
    </main>
  );
}
