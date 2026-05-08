import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';
import { CATEGORIES, SUBSIDIARIES } from '../../constants/categories';
import { formatAmount } from '../../utils/formatters';
import { route, ROUTES } from '../../constants/routes';

export default function ServiceCard({ service, compact = false }) {
  const category    = CATEGORIES.find(c => c.id === service.category_id);
  const subsidiary  = SUBSIDIARIES.find(s => s.id === service.subsidiary_id);
  const href        = route(ROUTES.SERVICE, { slug: service.slug });
  
  // Parse JSON fields if they're strings
  const tags = typeof service.tags === 'string' ? JSON.parse(service.tags || '[]') : service.tags || [];
  // Normalize rate/term: API returns strings, mock data uses {label} objects
  const rateStr = service.rate && typeof service.rate === 'object' ? service.rate.label : service.rate;
  const termStr = service.term && typeof service.term === 'object' ? service.term.label : service.term;

  if (compact) {
    return (
      <Link to={href} className="block group">
        <div className="flex gap-3 p-3 rounded-xl hover:bg-primary/4 transition-colors duration-150">
          <Icon name={category?.icon} size={20} className="flex-shrink-0 mt-0.5 text-primary/60" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary group-hover:text-secondary transition-colors duration-150 line-clamp-2">{service.title}</p>
            <p className="text-xs text-primary/50 mt-0.5">{subsidiary?.name}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="bg-surface rounded-2xl border border-primary/8 p-5 flex flex-col gap-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category?.color ?? '#0068B4'}18` }}>
          <Icon name={category?.icon} size={20} className="text-primary/70" />
        </div>
        {subsidiary && (
          <Badge variant="default" className="flex-shrink-0">{subsidiary.name}</Badge>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2">{service.title}</h3>
        <p className="text-xs text-primary/55 line-clamp-2">{service.subtitle}</p>
      </div>

      {/* Metrics */}
      {(rateStr || termStr || service.amount_max) && (
        <div className="flex gap-4 pt-1 border-t border-primary/8">
          {rateStr && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-primary/45 uppercase tracking-wide">Ставка</span>
              <span className="text-xs font-semibold text-secondary">{rateStr}</span>
            </div>
          )}
          {termStr && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-primary/45 uppercase tracking-wide">Срок</span>
              <span className="text-xs font-semibold text-secondary">{termStr}</span>
            </div>
          )}
          {service.amount_max > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-primary/45 uppercase tracking-wide">Сумма</span>
              <span className="text-xs font-semibold text-secondary">до {formatAmount(service.amount_max)}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="muted">{tag}</Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="muted">+{tags.length - 2}</Badge>
          )}
        </div>
        <Link
          to={href}
          className="text-xs font-medium text-accent hover:text-accent-light transition-colors duration-150 flex-shrink-0"
        >
          Подробнее →
        </Link>
      </div>
    </motion.div>
  );
}
