// ─── Select ───────────────────────────────────────────────────────────────────
// A labelled native <select> styled like the kit's text fields.
//   options: { value: label }
import { useId } from 'react';

export default function Select({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div className="wb-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  );
}
