import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { SUBSIDIARIES } from '../../constants/categories';

const NAV_LINKS = [
  { href: ROUTES.CATALOG,        label: 'Каталог услуг' },
  { href: ROUTES.KNOWLEDGE_BASE, label: 'База знаний' },
  { href: ROUTES.NEWS,           label: 'Новости' },
  { href: ROUTES.CORPORATE,      label: 'О холдинге' },
  { href: ROUTES.CONTACTS,       label: 'Контакты' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">Б</span>
              </div>
              <span className="text-white font-semibold">Байтерек</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Национальный инновационный холдинг. Единый портал поддержки бизнеса Казахстана.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm hover:text-accent transition-colors duration-150">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subsidiaries */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Дочерние организации</h4>
            <ul className="space-y-2.5">
              {SUBSIDIARIES.map(s => (
                <li key={s.id}>
                  <Link to={`/subsidiary/${s.id}`} className="text-sm hover:text-accent transition-colors duration-150">{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2.5 text-sm">
              <li>📍 г. Астана, ул. Достык, 1</li>
              <li><a href="tel:+77172555000" className="hover:text-accent transition-colors duration-150">📞 +7 (7172) 55-50-00</a></li>
              <li><a href="mailto:info@baiterek.kz" className="hover:text-accent transition-colors duration-150">✉️ info@baiterek.kz</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/40">© 2025 АО «НИХ «Байтерек». Все права защищены.</p>
          <div className="flex gap-4 text-xs text-white/40">
            <a href="#" className="hover:text-white/60 transition-colors duration-150">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white/60 transition-colors duration-150">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
