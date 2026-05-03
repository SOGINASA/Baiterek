import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES } from '../../constants/routes';

const NAV_LINKS = [
  { href: ROUTES.CATALOG,        label: 'Каталог услуг' },
  { href: ROUTES.KNOWLEDGE_BASE, label: 'База знаний' },
  { href: ROUTES.NEWS,           label: 'Новости' },
  { href: ROUTES.CORPORATE,      label: 'О холдинге' },
  { href: ROUTES.CONTACTS,       label: 'Контакты' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link
            to={ROUTES.CABINET}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-primary text-sm font-medium
              hover:bg-accent-light transition-colors duration-150"
          >
            Личный кабинет
          </Link>

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
              <Link
                to={ROUTES.CABINET}
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-4 py-3 rounded-xl bg-accent text-primary text-sm font-medium text-center transition-colors duration-150 hover:bg-accent-light"
              >
                Личный кабинет
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
