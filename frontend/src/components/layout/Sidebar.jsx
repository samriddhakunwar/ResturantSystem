// ─── Sidebar Navigation ───────────────────────────────────────────────────────
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Receipt,
  UtensilsCrossed, Settings, X,
} from 'lucide-react';
import { usePOS } from '../../context/PosContext';

const navItems = [
  { to: '/staff',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/staff/new-order',    label: 'New Order',   icon: PlusCircle      },
  { to: '/staff/orders',    label: 'Orders',      icon: ClipboardList   },
  { to: '/staff/billing',    label: 'Billing',     icon: Receipt         },
  { to: '/staff/menu',    label: 'Menu',        icon: UtensilsCrossed },
  { to: '/staff/settings',    label: 'Settings',    icon: Settings        },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = usePOS();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64
          bg-white border-r border-gray-100 shadow-soft
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="font-display font-extrabold text-charcoal text-base leading-tight">Whisker &amp; Brew</p>
              <p className="text-xs text-muted font-medium">Staff</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/staff'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-olive-strong text-white shadow-sm'
                  : 'text-gray-600 hover:bg-olive-soft hover:text-olive-dark'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-olive-dark'}`} size={18} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
