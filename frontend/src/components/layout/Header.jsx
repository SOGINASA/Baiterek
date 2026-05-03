import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LogOut } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';
import { useNotificationsStore } from '../../store/notificationsStore';

const NAV_LINKS = [
  { href: ROUTES.CATALOG,        label: 'Каталог услуг' },
  { href: ROUTES.KNOWLEDGE_BASE, label: 'База знаний' },
  { href: ROUTES.NEWS,           label: 'Новости' },
  { href: ROUTES.CORPORATE,      label: 'О холдинге' },
  { href: ROUTES.CONTACTS,       label: 'Контакты' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuth, user, logout, initializeAuth } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationsStore();
  const navigate = useNavigate();

  useEffect(() => { initializeAuth(); }, [initializeAuth]);
  useEffect(() => { if (isAuth) fetchUnreadCount(); }, [isAuth, fetchUnreadCount]);

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-primary font-bold text-sm">Б</span>
          </div>
          <span className="text-white font-semibold text-base leading-tight hidden sm:block">
            Байтерек
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'text-accent bg-white/8' : 'text-white/75 hover:text-white hover:bg-white/8'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuth ? (
            <>
              {/* Notification bell */}
              <Link
                to={ROUTES.CABINET + '/notifications'}
                className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/8 transition-colors duration-150 hidden md:flex"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
                )}
              </Link>

              {/* User avatar */}
              <Link
                to={ROUTES.CABINET}
                className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15
                  text-white text-sm font-medium transition-colors duration-150"
              >
                <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {initials}
                </span>
                <span className="hidden lg:block max-w-[120px] truncate">
                  {user?.full_name ?? user?.email ?? 'Кабинет'}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 rounded-lg text-white/50 hover:text-red-300 hover:bg-white/8 transition-colors duration-150"
                title="Выйти"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-primary text-sm font-medium
                hover:bg-accent-light transition-colors duration-150"
            >
              Войти
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150"
            aria-label="Меню"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {menuOpen
                ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                : <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="md:hidden overflow-hidden bg-primary border-t border-white/10"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                      isActive ? 'text-accent bg-white/8' : 'text-white/75 hover:text-white hover:bg-white/8'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuth ? (
                <>
                  <Link
                    to={ROUTES.CABINET}
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-medium text-center transition-colors duration-150 hover:bg-white/15 flex items-center justify-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-primary text-[10px] font-bold">
                      {initials}
                    </span>
                    Личный кабинет
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-400 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-1 px-4 py-3 rounded-xl text-red-300/80 hover:text-red-300 hover:bg-white/5 text-sm font-medium text-center transition-colors duration-150"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 px-4 py-3 rounded-xl bg-accent text-primary text-sm font-medium text-center transition-colors duration-150 hover:bg-accent-light"
                >
                  Войти
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
