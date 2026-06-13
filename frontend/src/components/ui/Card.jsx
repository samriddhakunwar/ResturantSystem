// ─── Card Component ───────────────────────────────────────────────────────────
export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100 p-5
        ${hover ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
