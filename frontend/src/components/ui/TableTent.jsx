// ─── Table Tent ───────────────────────────────────────────────────────────────
// The printed QR card for a table (ui-kit/components/TableTent.md): café name,
// QR code on a pure white square, "Scan for the menu, meow!", table number
// and a Wi-Fi line. One faint paw trail and one small cat, clear of the QR.
// `qrSvg` is SVG markup from GET /api/v1/tables/{id}/qr.svg (our own server);
// `qrSrc` is an image URL alternative.
import CatSilhouette from '../decor/CatSilhouette';
import PawTrail from '../decor/PawTrail';

export default function TableTent({ cafeName, tableLabel, wifi, qrSvg, qrSrc, className = '' }) {
  return (
    <article className={`wb-tent ${className}`}>
      <PawTrail className="absolute left-2 top-2 w-10" />
      <div className="flex items-end gap-2">
        <h2 className="wb-tent-cafe">{cafeName}</h2>
        <CatSilhouette pose="sitting" className="h-9 w-auto" />
      </div>
      <div className="wb-tent-qr">
        {qrSvg ? (
          <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        ) : qrSrc ? (
          <img src={qrSrc} alt={`QR code for ${tableLabel}`} className="h-full w-full" />
        ) : null}
      </div>
      <p className="wb-tent-cta">
        Scan for the menu, <span className="wb-script">meow!</span>
      </p>
      <p className="wb-tent-table">{tableLabel}</p>
      {wifi && <p className="wb-tent-wifi">Wi-Fi: {wifi}</p>}
    </article>
  );
}
