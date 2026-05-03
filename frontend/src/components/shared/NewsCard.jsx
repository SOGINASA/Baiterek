import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import { formatDateShort } from '../../utils/formatters';
import { route, ROUTES } from '../../constants/routes';

const CATEGORY_LABELS = {
  press_release: 'Пресс-релиз',
  announcement:  'Анонс',
  event:         'Мероприятие',
};

const CATEGORY_COLORS = {
  press_release: 'default',
  announcement:  'accent',
  event:         'success',
};

export default function NewsCard({ article, featured = false, orientation = 'vertical' }) {
  const href = route(ROUTES.NEWS_ARTICLE, { slug: article.slug });

  if (featured) {
    return (
      <Link to={href} className="block group">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden bg-secondary"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={CATEGORY_COLORS[article.category] || 'default'}>
                {CATEGORY_LABELS[article.category] || article.category}
              </Badge>
              <span className="text-white/60 text-xs">{formatDateShort(article.publishedAt)}</span>
            </div>
            <h2 className="text-white font-bold text-xl md:text-2xl leading-snug line-clamp-3 group-hover:text-accent transition-colors duration-150">
              {article.title}
            </h2>
          </div>
        </motion.div>
      </Link>
    );
  }

  if (orientation === 'horizontal') {
    return (
      <Link to={href} className="block group">
        <div className="flex gap-4 p-3 rounded-xl hover:bg-primary/4 transition-colors duration-150">
          <div className="w-20 h-16 rounded-xl bg-secondary/20 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={CATEGORY_COLORS[article.category] || 'default'} size="sm">
                {CATEGORY_LABELS[article.category] || article.category}
              </Badge>
              <span className="text-primary/40 text-xs">{formatDateShort(article.publishedAt)}</span>
            </div>
            <p className="text-sm font-medium text-primary group-hover:text-secondary transition-colors duration-150 line-clamp-2">
              {article.title}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={href} className="block group">
      <motion.div
        whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface rounded-2xl border border-primary/8 overflow-hidden flex flex-col"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="h-44 bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
          <span className="text-4xl opacity-20">📰</span>
        </div>
        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={CATEGORY_COLORS[article.category] || 'default'}>
              {CATEGORY_LABELS[article.category] || article.category}
            </Badge>
            <span className="text-primary/40 text-xs">{formatDateShort(article.publishedAt)}</span>
            {article.readMinutes && (
              <span className="text-primary/40 text-xs ml-auto">{article.readMinutes} мин</span>
            )}
          </div>
          <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-3 group-hover:text-secondary transition-colors duration-150">
            {article.title}
          </h3>
          <p className="text-xs text-primary/55 line-clamp-2 flex-1">{article.excerpt}</p>
        </div>
      </motion.div>
    </Link>
  );
}
