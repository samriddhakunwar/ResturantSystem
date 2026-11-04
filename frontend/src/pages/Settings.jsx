// ─── Settings Page ────────────────────────────────────────────────────────────
import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import PrinterManager from '../components/settings/PrinterManager';
import { usePOS } from '../context/PosContext';
import {
  Store, Printer, Users, FileText, Save, CheckCircle2,
} from 'lucide-react';

// ── Input field helper ──────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', suffix }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200
            rounded-xl outline-none focus:ring-2 focus:ring-olive-soft
            focus:border-olive-strong transition-all duration-200 text-gray-800
          "
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Settings section card ────────────────────────────────────────────────────
function SettingsCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="w-8 h-8 bg-olive-soft rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-olive-strong" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Settings() {
  const { settings, updateSettings } = usePOS();
  const [saved, setSaved] = useState(false);

  // Local form state mirrors context
  const [restaurant, setRestaurant] = useState({ ...settings.restaurant });
  const [printer, setPrinter] = useState({ ...settings.printer });
  const [counter, setCounter] = useState({ ...settings.counter });
  const [receipt, setReceipt] = useState({ ...settings.receipt });

  const handleSave = () => {
    updateSettings('restaurant', restaurant);
    updateSettings('printer', printer);
    updateSettings('counter', counter);
    updateSettings('receipt', receipt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your POS system preferences"
        action={
          <Button onClick={handleSave}>
            {saved ? <CheckCircle2 size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Restaurant Info */}
        <SettingsCard icon={Store} title="Restaurant Information">
          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Restaurant Name"
              value={restaurant.name}
              onChange={(v) => setRestaurant((s) => ({ ...s, name: v }))}
            />
            <Field
              label="Phone"
              value={restaurant.phone}
              onChange={(v) => setRestaurant((s) => ({ ...s, phone: v }))}
            />
            <Field
              label="Email"
              value={restaurant.email}
              type="email"
              onChange={(v) => setRestaurant((s) => ({ ...s, email: v }))}
            />
            <Field
              label="Address"
              value={restaurant.address}
              onChange={(v) => setRestaurant((s) => ({ ...s, address: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Tax Rate"
                value={restaurant.taxRate}
                type="number"
                suffix="%"
                onChange={(v) => setRestaurant((s) => ({ ...s, taxRate: Number(v) }))}
              />
              <Field
                label="Currency"
                value={restaurant.currency}
                onChange={(v) => setRestaurant((s) => ({ ...s, currency: v }))}
              />
            </div>
          </div>
        </SettingsCard>

        {/* 2. Printer & Kitchen */}
        <SettingsCard icon={Printer} title="Printer & Kitchen">
          <div className="space-y-1 divide-y divide-gray-100">
            <ToggleSwitch
              checked={printer.autoPrintKitchenTicket}
              onChange={(v) => setPrinter((s) => ({ ...s, autoPrintKitchenTicket: v }))}
              label="Auto Print Kitchen Ticket"
              description="Print a kitchen ticket when an order is placed"
            />
            <ToggleSwitch
              checked={printer.autoPrintReceipt}
              onChange={(v) => setPrinter((s) => ({ ...s, autoPrintReceipt: v }))}
              label="Auto Print Receipt"
              description="Automatically print receipt on payment"
            />
            <ToggleSwitch
              checked={printer.soundNotification}
              onChange={(v) => setPrinter((s) => ({ ...s, soundNotification: v }))}
              label="Sound Notification"
              description="Play a sound when a new order arrives"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field
              label="Printer Name"
              value={printer.printerName}
              onChange={(v) => setPrinter((s) => ({ ...s, printerName: v }))}
            />
            <Field
              label="Paper Size"
              value={printer.paperSize}
              onChange={(v) => setPrinter((s) => ({ ...s, paperSize: v }))}
            />
          </div>
        </SettingsCard>

        {/* 3. Counter Staff */}
        <SettingsCard icon={Users} title="Counter Staff">
          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Staff Name"
              value={counter.staffName}
              onChange={(v) => setCounter((s) => ({ ...s, staffName: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Shift</label>
                <select
                  value={counter.shift}
                  onChange={(e) => setCounter((s) => ({ ...s, shift: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-olive-soft focus:border-olive-strong transition-all text-gray-800"
                >
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Field
                label="Counter No."
                value={counter.counterNumber}
                type="number"
                onChange={(v) => setCounter((s) => ({ ...s, counterNumber: Number(v) }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Shift Start"
                value={counter.shiftStart}
                onChange={(v) => setCounter((s) => ({ ...s, shiftStart: v }))}
              />
              <Field
                label="Shift End"
                value={counter.shiftEnd}
                onChange={(v) => setCounter((s) => ({ ...s, shiftEnd: v }))}
              />
            </div>
          </div>
        </SettingsCard>

        {/* 4. Receipt Footer */}
        <SettingsCard icon={FileText} title="Receipt Footer">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Thank You Message</label>
              <textarea
                value={receipt.thankYouMessage}
                onChange={(e) => setReceipt((s) => ({ ...s, thankYouMessage: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-olive-soft focus:border-olive-strong transition-all resize-none text-gray-800"
              />
            </div>
            <Field
              label="Website"
              value={receipt.website}
              onChange={(v) => setReceipt((s) => ({ ...s, website: v }))}
            />
            <Field
              label="Footer Note"
              value={receipt.footerNote}
              onChange={(v) => setReceipt((s) => ({ ...s, footerNote: v }))}
            />
            <div className="space-y-1 divide-y divide-gray-100">
              <ToggleSwitch
                checked={receipt.showLogo}
                onChange={(v) => setReceipt((s) => ({ ...s, showLogo: v }))}
                label="Show Logo on Receipt"
              />
              <ToggleSwitch
                checked={receipt.showQrCode}
                onChange={(v) => setReceipt((s) => ({ ...s, showQrCode: v }))}
                label="Show QR Code"
                description="Show a QR code linking to the menu"
              />
            </div>
          </div>
        </SettingsCard>
      </div>

      {/* Backend-connected thermal printers */}
      <div className="mt-5">
        <PrinterManager />
      </div>

      {/* Bottom save bar */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          {saved ? <CheckCircle2 size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
          {saved ? 'All changes saved' : 'Save all settings'}
        </Button>
      </div>
    </div>
  );
}
