// ─── Guest Message ────────────────────────────────────────────────────────────
// A friendly full-page message with one cat: the snoozing QR code, empty
// states and "we can't reach the café system".
import CatSilhouette from '../../components/decor/CatSilhouette';

export default function GuestMessage({ title, children, pose = 'lying', action }) {
  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center px-4 py-16 text-center">
      <CatSilhouette pose={pose} className="mb-6 h-24 w-auto" />
      <h1 className="m-0 font-display text-2xl font-extrabold text-olive-dark">{title}</h1>
      {children && <div className="mt-2 text-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
