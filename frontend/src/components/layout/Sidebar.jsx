// ─── Sidebar Navigation ───────────────────────────────────────────────────────
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Receipt,
  UtensilsCrossed, Settings, X,
} from 'lucide-react';
import { usePOS } from '../../context/PosContext';

const navItems = [
  { to: '/',              label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/new-order',     label: 'New Order',   icon: PlusCircle      },
  { to: '/orders',        label: 'Orders',      icon: ClipboardList   },
  { to: '/billing',       label: 'Billing',     icon: Receipt         },
  { to: '/menu',          label: 'Menu',        icon: UtensilsCrossed },
  { to: '/settings',      label: 'Settings',    icon: Settings        },
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
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg shadow-sm">
              🍕
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Wow Pizza Hub</p>
              <p className="text-xs text-gray-400 font-medium">POS System</p>
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
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} size={18} />
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
