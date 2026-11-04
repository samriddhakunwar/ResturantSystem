// ─── Sidebar Navigation ───────────────────────────────────────────────────────
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, ChefHat, Receipt, UtensilsCrossed,
  Cat, CalendarDays, QrCode, BellRing, Wallet, Settings, X,
} from 'lucide-react';
import { usePOS } from '../../context/PosContext';
import { useStaff } from '../../context/StaffContext';
import CatSilhouette from '../decor/CatSilhouette';

const navItems = [
  { to: '/staff',                  label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/staff/new-order',        label: 'New Order (POS)',  icon: PlusCircle      },
  { to: '/staff/orders',           label: 'Orders',           icon: ClipboardList   },
  { to: '/staff/kitchen',          label: 'Kitchen',          icon: ChefHat         },
  { to: '/staff/billing',          label: 'Billing',          icon: Receipt         },
  { to: '/staff/menu',             label: 'Menu',             icon: UtensilsCrossed },
  { to: '/staff/cats',             label: 'Cats',             icon: Cat             },
  { to: '/staff/bookings',         label: 'Bookings',         icon: CalendarDays    },
  { to: '/staff/tables',           label: 'Tables & QR',      icon: QrCode          },
  { to: '/staff/service-requests', label: 'Service Requests', icon: BellRing, badge: true },
  { to: '/staff/expenses',         label: 'Expenses',         icon: Wallet          },
  { to: '/staff/settings',         label: 'Settings',         icon: Settings        },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = usePOS();
  const { openRequests } = useStaff();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(68,64,52,0.45)] z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64
          bg-panel border-r border-line
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-line">
          <div className="relative pt-7">
            <CatSilhouette pose="walking" className="absolute left-0 top-0 h-7 w-auto" />
            <div>
              <p className="font-display font-extrabold text-charcoal text-base leading-tight">Whisker &amp; Brew</p>
              <p className="text-xs text-muted font-medium">Staff</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            aria-label="Close menu"
            className="p-1.5 rounded-lg hover:bg-cream-pressed text-muted lg:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/staff'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-olive-strong text-cream shadow-sm'
                  : 'text-muted hover:bg-olive-soft hover:text-olive-dark'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-cream' : 'text-muted group-hover:text-olive-dark'}`} size={18} aria-hidden="true" />
                  {label}
                  {badge && openRequests.length > 0 && (
                    <span className="ml-auto rounded-full bg-ginger px-2 text-xs font-bold leading-5 text-charcoal">
                      {openRequests.length}
                      <span className="sr-only"> open</span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
