// ─── Button ───────────────────────────────────────────────────────────────────
// Kit pill button (ui-kit/components/Button.md).
//   variant: primary — the one action a screen is for (one per view)
//            light   — secondary action on a panel or over an image
//            outline — secondary action on the cream page
//   size:    md | sm (36px, dense staff screens)
//   block:   full width (mobile cart)
//   active:  the selected one → aria-pressed (or aria-current for links)
// Pass `to` for in-app navigation (renders a router <Link>) or `href` for <a>.
// Write labels in sentence case; CSS uppercases them.
import { Link } from 'react-router-dom';

export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  active,
  disabled = false,
  to,
  href,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'wb-btn',
    `wb-btn--${variant}`,
    size === 'sm' && 'wb-btn--sm',
    block && 'wb-btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to || href) {
    const linkProps = {
      className: `${cls}${disabled ? ' is-disabled' : ''}`,
      'aria-current': active ? 'page' : undefined,
      'aria-disabled': disabled || undefined,
      ...rest,
    };
    return to ? (
      <Link to={to} {...linkProps}>{children}</Link>
    ) : (
      <a href={href} {...linkProps}>{children}</a>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      aria-pressed={active === undefined ? undefined : active}
      {...rest}
    >
      {children}
    </button>
  );
}
