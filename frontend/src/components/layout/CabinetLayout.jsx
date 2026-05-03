import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, FolderOpen, Bell,
  User, Calculator, CalendarCheck, LogOut,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const NAV = [
  { to: '/cabinet',               label: 'Обзор',        icon: LayoutDashboard, end: true },
  { to: '/cabinet/applications',  label: 'Мои заявки',   icon: FileText },
  { to: '/cabinet/documents',     label: 'Документы',    icon: FolderOpen },
  { to: '/cabinet/notifications', label: 'Уведомления',  icon: Bell },
  { to: '/cabinet/calculators',   label: 'Калькуляторы', icon: Calculator },
  { to: '/cabinet/bookings',      label: 'Бронирования', icon: CalendarCheck },
  { to: '/cabinet/profile',       label: 'Профиль',      icon: User },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] } },
};

export default function CabinetLayout() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      {/* Below header: sidebar + content */}
      <div className="flex flex-1">

        {/* Desktop sidebar — sticky, full height minus header */}
        <aside className="w-56 flex-shrink-0 bg-surface border-r border-primary/8
          hidden md:flex flex-col sticky top-0 self-start"
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <div className="px-4 py-4 border-b border-primary/8">
            <p className="text-[10px] font-semibold text-primary/35 uppercase tracking-widest">
              Личный кабинет
            </p>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
                  ${isActive ? 'bg-accent text-white' : 'text-primary/60 hover:bg-bg hover:text-primary'}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 py-3 border-t border-primary/8 flex-shrink-0">
            <button onClick={() => navigate('/')}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm
                text-primary/40 hover:bg-bg hover:text-rose-400 transition-colors duration-150">
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </aside>

        {/* Main content with page transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 min-w-0 min-h-0 pb-16 md:pb-0"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      <Footer />

      {/* Mobile bottom nav — fixed over footer */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50
        bg-surface/95 backdrop-blur border-t border-primary/8
        flex items-center justify-around px-1 py-1">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[52px]
              transition-colors duration-150
              ${isActive ? 'text-accent' : 'text-primary/35 hover:text-primary'}`
            }
          >
            <Icon size={19} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}