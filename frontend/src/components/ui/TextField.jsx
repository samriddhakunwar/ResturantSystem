// ─── Text Field & Checkbox ───────────────────────────────────────────────────
// Kit inputs (ui-kit/components/TextField.md). The label always sits above
// the input; placeholders only give an example. `error` adds `is-error`, a
// message with a warning icon linked by aria-describedby, and aria-invalid.
import { useId } from 'react';
import { TriangleAlert } from 'lucide-react';

function FieldError({ id, children }) {
  return (
    <p id={id} className="wb-field-error m-0">
      <TriangleAlert aria-hidden="true" size={16} strokeWidth={2.25} />
      {children}
    </p>
  );
}

export default function TextField({ label, help, error, multiline = false, id, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const Input = multiline ? 'textarea' : 'input';

  return (
    <div className={`wb-field ${error ? 'is-error' : ''} ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <Input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {error && <FieldError id={errorId}>{error}</FieldError>}
      {help && <p id={helpId} className="wb-field-help m-0">{help}</p>}
    </div>
  );
}

/** The café-rules checkbox: the rules text is the label, so tapping it ticks the box. */
export function Checkbox({ children, error, id, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={`wb-field ${error ? 'is-error' : ''} ${className}`}>
      <label htmlFor={inputId} className="wb-check !font-medium">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...rest}
        />
        <span>{children}</span>
      </label>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
