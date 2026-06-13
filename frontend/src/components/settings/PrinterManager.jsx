// ─── Printer Manager (backend-backed) ─────────────────────────────────────────
// Lists thermal printers from the Django backend and supports add / activate /
// test-print / delete. Only meaningful when the API is reachable.
import { useState } from 'react';
import { Printer, Plus, Trash2, Send, Wifi, Usb } from 'lucide-react';
import { usePOS } from '../../context/PosContext';

const ROLE_LABEL = { kitchen: 'Kitchen', billing: 'Billing', both: 'Kitchen & Billing' };

const EMPTY_FORM = {
  name: '',
  connection_type: 'lan',
  role: 'both',
  ip_address: '',
  port: 9100,
  usb_vendor_id: '',
  usb_product_id: '',
};

export default function PrinterManager() {
  const {
    apiOnline, printers,
    addPrinter, togglePrinterActive, removePrinter, testPrintPrinter,
  } = usePOS();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const handleAdd = async () => {
    setBusy(true);
    const payload =
      form.connection_type === 'lan'
        ? { name: form.name, connection_type: 'lan', role: form.role, ip_address: form.ip_address, port: Number(form.port) || 9100 }
        : { name: form.name, connection_type: 'usb', role: form.role, usb_vendor_id: form.usb_vendor_id, usb_product_id: form.usb_product_id };
    const res = await addPrinter(payload);
    setBusy(false);
    flash(res.ok, res.message);
    if (res.ok) { setForm(EMPTY_FORM); setShowForm(false); }
  };

  const handleTest = async (id) => {
    const res = await testPrintPrinter(id);
    flash(res.ok, res.message);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Printer className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Connected Printers</h3>
        </div>
        {apiOnline && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors active:scale-95"
          >
            <Plus size={14} /> {showForm ? 'Close' : 'Add Printer'}
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {!apiOnline && (
          <p className="text-sm text-gray-400">
            Connect the backend (set <code className="text-orange-500">VITE_API_URL</code>) to manage thermal printers.
          </p>
        )}

        {msg && (
          <div className={`mb-3 px-3 py-2 rounded-xl text-xs font-medium ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            🖨️ {msg.text}
          </div>
        )}

        {apiOnline && (
          <>
            {/* Add form */}
            {showForm && (
              <div className="mb-4 p-4 rounded-xl border border-orange-100 bg-orange-50/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Printer name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="sm:col-span-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                />
                <select
                  value={form.connection_type}
                  onChange={(e) => set('connection_type', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                >
                  <option value="lan">LAN (Network)</option>
                  <option value="usb">USB</option>
                </select>
                <select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                >
                  <option value="both">Kitchen & Billing</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="billing">Billing</option>
                </select>

                {form.connection_type === 'lan' ? (
                  <>
                    <input
                      placeholder="IP address (e.g. 192.168.1.50)"
                      value={form.ip_address}
                      onChange={(e) => set('ip_address', e.target.value)}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                    />
                    <input
                      placeholder="Port"
                      type="number"
                      value={form.port}
                      onChange={(e) => set('port', e.target.value)}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                    />
                  </>
                ) : (
                  <>
                    <input
                      placeholder="USB Vendor ID (e.g. 0x04b8)"
                      value={form.usb_vendor_id}
                      onChange={(e) => set('usb_vendor_id', e.target.value)}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                    />
                    <input
                      placeholder="USB Product ID (e.g. 0x0202)"
                      value={form.usb_product_id}
                      onChange={(e) => set('usb_product_id', e.target.value)}
                      className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-400"
                    />
                  </>
                )}

                <button
                  onClick={handleAdd}
                  disabled={busy || !form.name}
                  className="sm:col-span-2 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Saving…' : 'Save Printer'}
                </button>
              </div>
            )}

            {/* Printer list */}
            {printers.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No printers registered yet.</p>
            ) : (
              <div className="space-y-2">
                {printers.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      {p.connectionType === 'usb' ? <Usb size={15} /> : <Wifi size={15} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{ROLE_LABEL[p.role] ?? p.role}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleTest(p.id)}
                      title="Test print"
                      className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                    >
                      <Send size={14} />
                    </button>
                    <button
                      onClick={() => togglePrinterActive(p.id, !p.isActive)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                      {p.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => removePrinter(p.id)}
                      title="Delete printer"
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
